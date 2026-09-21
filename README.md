# Curtain Order & Installation App (ระบบจัดทำใบงานและมาร์กตำแหน่งผ้าม่าน)

เว็บแอปพลิเคชันสำหรับจัดทำใบเสนอราคา ใบสั่งงานผ้าม่าน พร้อมระบบวาดมาร์กตำแหน่งหน้างานบนภาพถ่ายจริง เชื่อมต่อฐานข้อมูล Firebase Firestore และ Cloudinary

---

## วิธีนำโปรเจกต์ขึ้น GitHub และ Deploy บน Vercel

### วิธีที่ 1: นำขึ้น GitHub

#### แบบ A: ใช้เมนู Export ของ Google AI Studio (วิธีที่ง่ายที่สุด)
1. ไปที่เมนูการตั้งค่า (Settings / 3 จุด) ด้านบนขวาของ Google AI Studio
2. เลือก **"Export to GitHub"** หรือ **"Download ZIP"**
3. หากเลือก Export to GitHub ระบบจะสร้าง Repository ใน GitHub ให้อัตโนมัติ

#### แบบ B: ใช้คำสั่ง Git ผ่าน Terminal/Command Prompt
```bash
# 1. แตกไฟล์ ZIP ที่ดาวน์โหลดมา แล้วเปิด Terminal ในโฟลเดอร์โปรเจกต์
cd curtain-app

# 2. เริ่มต้น git และบันทึกไฟล์ทั้งหมด
git init
git add .
git commit -m "Initial commit of Curtain App"

# 3. สร้าง Repository เปล่าใน GitHub (https://github.com/new) แล้วเชื่อมต่อ
git branch -M main
git remote add origin https://github.com/<YOUR_USERNAME>/<YOUR_REPOSITORY_NAME>.git
git push -u origin main
```

---

### วิธีที่ 2: Deploy บน Vercel

1. เข้าสู่ระบบที่ [Vercel](https://vercel.com/)
2. คลิกปุ่ม **"Add New..."** -> **"Project"**
3. เลือก Repository ที่คุณเพิ่ง Push ขึ้น GitHub
4. ตั้งค่าโปรเจกต์:
   - **Framework Preset**: เลือก `Vite`
   - **Root Directory**: `./` (ไม่ต้องเปลี่ยน)
   - **Build Command**: `npm run build` (หรือปล่อยเป็นค่า Default จาก vercel.json)
   - **Output Directory**: `dist`
5. คลิกปุ่ม **"Deploy"**
6. รอ Vercel Build ประมาณ 1-2 นาที คุณจะได้ URL สำหรับใช้งานจริงทันที (เช่น `https://curtain-app.vercel.app`)

---

### ⚠️ สำคัญมาก: เพิ่ม Domain บน Firebase Console

เพื่อให้ระบบ Login และฐานข้อมูลทำงานได้บน Domain ของ Vercel:
1. เข้าไปที่ [Firebase Console](https://console.firebase.google.com/)
2. เลือกโปรเจกต์ `curtain-app-3d38a`
3. ไปที่เมนู **Build** -> **Authentication** -> แท็บ **Settings**
4. เลื่อนลงมาที่หัวข้อ **Authorized domains (โดเมนที่ได้รับอนุญาต)**
5. คลิก **"Add domain"** แล้วใส่โดเมนของ Vercel ของคุณ (เช่น `your-app-name.vercel.app`)
6. คลิก **Save**

---

## การพัฒนาในเครื่อง (Local Development)

```bash
# ติดตั้ง dependencies
npm install

# รันในโหมด Development
npm run dev

# ทดสอบ Build
npm run build
```
