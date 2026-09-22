export const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dsxpwfujb/image/upload";
export const CLOUDINARY_UPLOAD_PRESET = "ml_default"; 

// Memory cache for fetched images as base64/blob DataURLs to speed up loading and guarantee html2canvas captures
const dataUrlCache = new Map<string, string>();
const pendingFetches = new Map<string, Promise<string>>();

export const getCachedDataUrl = (url: string | null | undefined): string | null => {
  if (!url) return null;
  return dataUrlCache.get(url) || null;
};

export const preloadImageDataUrl = async (url: string | null | undefined): Promise<string> => {
  if (!url) return '';
  if (url.startsWith('data:')) return url;
  if (dataUrlCache.has(url)) return dataUrlCache.get(url)!;
  if (pendingFetches.has(url)) return pendingFetches.get(url)!;

  const fetchPromise = (async () => {
    try {
      const response = await fetch(url, { credentials: 'omit', mode: 'cors' });
      const blob = await response.blob();
      return await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          dataUrlCache.set(url, result);
          resolve(result);
        };
        reader.onerror = () => resolve(url);
        reader.readAsDataURL(blob);
      });
    } catch (err) {
      // If CORS or network fails, fallback to original URL
      return url;
    } finally {
      pendingFetches.delete(url);
    }
  })();

  pendingFetches.set(url, fetchPromise);
  return fetchPromise;
};

export const optImg = (url: string | null | undefined, width?: number, forcePng?: boolean): string => {
  if (!url || typeof url !== 'string') return '';
  if (url.startsWith('data:')) return url;
  if (!url.includes('cloudinary.com/')) return url;
  
  // Clean up any existing auto-transformations to ensure we apply the correct format (png vs jpg)
  let cleanUrl = url;
  if (url.includes('/upload/')) {
    const parts = url.split('/upload/');
    const rightPart = parts[1];
    if (rightPart && !rightPart.startsWith('v') && rightPart.includes('/')) {
      const subParts = rightPart.split('/');
      subParts.shift(); // remove transformation part
      cleanUrl = `${parts[0]}/upload/${subParts.join('/')}`;
    }
  }

  // Use f_png for transparent masks/icons, f_auto for optimal speed & size on sample images
  const format = forcePng ? 'f_png' : 'f_auto';
  // Use responsive quality q_auto:good to boost load speed dramatically
  return cleanUrl.replace('/upload/', `/upload/${format},q_auto${width ? `,w_${width}` : ''}/`);
};

export const removeWhiteBackground = (dataUrl: string): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let w = img.width, h = img.height;
      if (h > 300) { w = Math.round(w * (300 / h)); h = 300; }
      canvas.width = w; canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, w, h);
        const imgData = ctx.getImageData(0, 0, w, h);
        const data = imgData.data;
        for (let i = 0; i < data.length; i += 4) {
          if (data[i] > 190 && data[i+1] > 190 && data[i+2] > 190) data[i+3] = 0;
        }
        ctx.putImageData(imgData, 0, 0);
      }
      resolve(canvas.toDataURL('image/png'));
    };
    img.src = dataUrl;
  });
};

export const loadHeic2Any = async (): Promise<any> => {
  if ((window as any).heic2any) return (window as any).heic2any;
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = "https://cdn.jsdelivr.net/npm/heic2any@0.0.4/dist/heic2any.min.js";
    script.onload = () => resolve((window as any).heic2any);
    script.onerror = reject;
    document.head.appendChild(script);
  });
};

export const processImageFile = async (
  file: File, 
  maxWidth = 1024, 
  quality = 0.7, 
  setDialog?: (dialog: any) => void
): Promise<string | null> => {
  let processFile = file;
  if (file.name.toLowerCase().match(/\.(heic|heif)$/i)) {
    try {
      const heic2any = await loadHeic2Any();
      const convertedBlob = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.8 });
      const blobArray = Array.isArray(convertedBlob) ? convertedBlob : [convertedBlob];
      processFile = new File(blobArray, file.name.replace(/\.(heic|heif)$/i, '.jpg'), { type: "image/jpeg" });
    } catch (err) {
      if (setDialog) setDialog({ type: 'alert', message: "ไม่สามารถแปลงไฟล์ HEIC ได้" });
      return null;
    }
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width, height = img.height;
        if (width > maxWidth) { height *= maxWidth / width; width = maxWidth; }
        canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
        }
        resolve(canvas.toDataURL('image/webp', quality)); 
      };
      img.onerror = () => { resolve(null); };
      img.src = e.target?.result as string;
    };
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(processFile);
  });
};

export const uploadImageToCloudinary = async (base64Str: string): Promise<string | null> => {
  try {
    const formData = new FormData();
    formData.append("file", base64Str);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
    const res = await fetch(CLOUDINARY_URL, { method: "POST", body: formData });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return (await res.json()).secure_url; 
  } catch (e) { return null; }
};
