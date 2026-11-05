# 🚗 Garage Stock Manager
## ระบบจัดการอะไหล่และ Stock สำหรับการซ่อมรถ

Desktop Application สำหรับจัดการอะไหล่และบันทึกประวัติการซ่อมรถ พัฒนาด้วย Electron + React + SQLite

---

## ✨ ฟีเจอร์หลัก

### 📋 ประวัติการซ่อม/เบิกอะไหล่
- ✅ บันทึกข้อมูลการซ่อม: หน่วยงาน, ยี่ห้อรถ, ทะเบียนรถ, วันที่เข้าซ่อม
- ✅ บันทึกอะไหล่ที่ใช้พร้อมราคาทุนและราคาขาย
- ✅ แสดงกำไรในแต่ละรายการ
- ✅ สรุปภาพรวม: จำนวนรายการ, รายได้รวม, ต้นทุนรวม, กำไรรวม
- ✅ ค้นหาข้อมูลได้หลายเกณฑ์

### 📦 Stock อะไหล่
- ✅ จัดการรายการอะไหล่: เพิ่ม, แก้ไข, ลบ
- ✅ บันทึกจำนวน, ราคาทุน, ราคาขาย
- ✅ แสดงกำไรต่อชิ้นและมูลค่ารวม
- ✅ สรุปภาพรวม: จำนวนรายการ, จำนวนชิ้นทั้งหมด, มูลค่า Stock
- ✅ ค้นหาอะไหล่

---

## 🚀 วิธีติดตั้งและใช้งาน

### ติดตั้ง Dependencies
```bash
npm install
```

### รันโหมด Development
```bash
npm run dev
```

### Build เป็น Application
```bash
# สำหรับ Windows
npm run build:win

# สำหรับ macOS
npm run build:mac

# สำหรับ Linux
npm run build:linux
```

---

## 📁 โครงสร้างโปรเจกต์

```
garage-stock-manager/
├── electron/              # Electron Main Process
│   ├── main.js           # Main process + SQLite database
│   └── preload.js        # IPC Bridge
├── src/                  # React Frontend
│   ├── components/
│   │   ├── PartsStock.jsx       # หน้าจัดการ Stock
│   │   └── RepairHistory.jsx    # หน้าประวัติการซ่อม
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── vite.config.js
└── package.json
```

---

## 🗄️ Database Schema

### ตาราง `parts` (Stock อะไหล่)
| คอลัมน์ | ประเภท | คำอธิบาย |
|---------|--------|----------|
| `id` | INTEGER | รหัสอะไหล่ (Primary Key) |
| `part_name` | TEXT | ชื่ออะไหล่ |
| `quantity` | INTEGER | จำนวน |
| `cost_price` | REAL | ราคาทุน |
| `sell_price` | REAL | ราคาขาย |
| `created_at` | TEXT | วันที่สร้าง |
| `updated_at` | TEXT | วันที่อัพเดท |

### ตาราง `repairs` (ประวัติการซ่อม)
| คอลัมน์ | ประเภท | คำอธิบาย |
|---------|--------|----------|
| `id` | INTEGER | รหัสรายการ (Primary Key) |
| `organization` | TEXT | หน่วยงาน |
| `car_brand` | TEXT | ยี่ห้อรถ |
| `license_plate` | TEXT | ทะเบียนรถ |
| `repair_date` | TEXT | วันที่เข้าซ่อม |
| `part_name` | TEXT | ชื่ออะไหล่ |
| `cost_price` | REAL | ราคาทุน |
| `sell_price` | REAL | ราคาขาย |
| `created_at` | TEXT | วันที่บันทึก |

---

## 💾 ที่เก็บข้อมูล

ไฟล์ฐานข้อมูล SQLite (`garage.db`) จะถูกเก็บไว้ที่:

- **Windows**: `C:\Users\[Username]\AppData\Roaming\garage-stock-manager\`
- **macOS**: `~/Library/Application Support/garage-stock-manager/`
- **Linux**: `~/.config/garage-stock-manager/`

ข้อมูลทั้งหมดถูกเก็บในไฟล์เดียว สามารถ backup ได้ง่ายโดยคัดลอกไฟล์นี้

---

## 🛠️ เทคโนโลยีที่ใช้

| เทคโนโลยี | เวอร์ชัน | การใช้งาน |
|-----------|---------|-----------|
| **React** | 18.x | Frontend UI Framework |
| **Electron** | Latest | Desktop Application Framework |
| **SQLite** | (better-sqlite3) | Local Database |
| **Vite** | Latest | Build Tool & Dev Server |
| **Electron Builder** | Latest | Application Packager |

---

## 📝 การใช้งาน

1. **เพิ่มอะไหล่ใน Stock**: 
   - ไปที่แท็บ "Stock อะไหล่" 
   - กดปุ่ม "+ เพิ่มอะไหล่"
   - กรอกข้อมูล: ชื่อ, จำนวน, ราคาทุน, ราคาขาย

2. **บันทึกการซ่อม**: 
   - ไปที่แท็บ "ประวัติการซ่อม/เบิกอะไหล่" 
   - กดปุ่ม "+ เพิ่มรายการ"
   - กรอกข้อมูล: หน่วยงาน, ยี่ห้อรถ, ทะเบียน, วันที่, อะไหล่, ราคา

3. **เลือกอะไหล่จาก Stock**: 
   - เมื่อบันทึกการซ่อม พิมพ์ชื่ออะไหล่
   - ระบบจะแสดงรายการจาก Stock
   - เลือกแล้วราคาจะถูกกรอกอัตโนมัติ

4. **ค้นหา**: 
   - ใช้ช่องค้นหาเพื่อกรองข้อมูล
   - รองรับการค้นหาหลายเกณฑ์

5. **แก้ไข/ลบ**: 
   - กดปุ่ม "แก้ไข" หรือ "ลบ" ในแต่ละรายการ

---

## 🔒 ความปลอดภัย

- ✅ ข้อมูลเก็บแบบ local บนเครื่องคอมพิวเตอร์
- ✅ ไม่มีการส่งข้อมูลออกภายนอก
- ✅ ใช้ Context Isolation ใน Electron เพื่อความปลอดภัย
- ✅ Preload Script เป็น Bridge ระหว่าง Main และ Renderer Process

---

## 🎨 UI/UX Features

- ✨ Modern & Clean Design
- 🎯 Responsive Layout
- 🌈 Gradient Headers
- 📊 Statistical Dashboard
- 🔍 Real-time Search
- ⚡ Fast & Smooth Animations
- 💾 Auto-save

---

## 📄 License

ISC License - ใช้งานได้อย่างอิสระ

---

## 👨‍💻 การพัฒนา

สร้างด้วย ❤️ โดยใช้:
- Modern JavaScript (ES6+)
- React Hooks
- CSS3 Animations
- Better-sqlite3 for Database
- Electron IPC Communication

---

**พร้อมใช้งานแล้ว! รันด้วยคำสั่ง `npm run dev`** 🚀
