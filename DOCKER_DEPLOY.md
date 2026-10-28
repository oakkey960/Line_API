# Deploy Line API บนเซิร์ฟเวอร์

ชุดนี้ใช้ docker compose v2 และ Linux containers เชื่อม MySQL ที่มีอยู่แล้ว
ไม่สร้างหรือลบฐานข้อมูล และไม่ใช่ Compose ทั้งระบบที่อยู่ระดับโฟลเดอร์ LineBot
ใช้ docker-compose.yml ใน repo นี้สำหรับ deploy Backend แยก

## 1. เตรียมไฟล์และ environment

เข้า /home/API/Line_API แล้วตรวจ git status ก่อน git pull origin main
หากมีไฟล์ Dockerfile/docker-compose.yml ที่แก้บน server ให้สำรองการแก้ไขก่อน
อย่าใช้ git reset --hard หรือเขียนทับ .env เดิม

หากยังไม่มี .env ให้คัดลอก .env.production.example เป็น .env และกรอกค่าจริง
หากมี .env อยู่แล้ว ให้เทียบและเพิ่มค่าที่ขาด

- DB_HOST: IP ฐานข้อมูล หรือ host.docker.internal ถ้า MySQL อยู่บน Docker host
- DB_NAME, DB_USER, DB_PASS: ฐานที่มีอยู่แล้วและบัญชีที่รัน migrations ได้
- MySQL ต้องอนุญาตการเชื่อมต่อจากเครือข่าย Docker ตามการตั้งค่าจริง
- API_BIND_IP: IP ภายในเครื่อง server หากต้องให้ frontend ใน LAN เรียก API
  ค่าเริ่มต้น 127.0.0.1 ให้เรียกผ่าน reverse proxy บน host เท่านั้น
- API_HOST_PORT: พอร์ตที่ publish บน server เช่น 3002
- CLIENT_WEB_URL/CORS_ORIGINS: URL frontend ที่ผู้ใช้เปิดจริง
- JWT_SECRET: ค่าสุ่มยาวเฉพาะระบบ
- LINE_CHANNEL_SECRET/LINE_CHANNEL_ACCESS_TOKEN: ค่าจาก LINE Developers
- PUBLIC_BASE_URL: HTTPS ภายนอก ไม่ใส่ /api ต่อท้าย เว้นว่างได้ถ้ายังไม่ส่งรูป

ตัวอย่าง server ภายใน:

```env
API_BIND_IP=10.10.200.103
API_HOST_PORT=3002
CLIENT_WEB_URL=http://10.10.200.103:3577
CORS_ORIGINS=http://10.10.200.103:3577
```

Frontend ที่รันตรงสามารถตั้ง NEXT_PUBLIC_API_URL=http://10.10.200.103:3002/api
ถ้าใช้ Frontend Docker ของเรา API จะเป็น /api ต้องมี reverse proxy หน้าเว็บส่ง /api
มาที่ Backend นี้ (Docker network คนละ compose ต้องเชื่อมกันหรือเรียกผ่าน host)

## 2. ตรวจและเริ่มทำงาน

```sh
docker compose version
docker compose config --quiet
docker compose up -d --build
docker compose ps -a
docker compose logs --tail=100 migrate line_back
```

Compose จะรัน migrations ให้สำเร็จก่อนเริ่ม line_back
ถ้า migration ล้มเหลว ให้แก้ database connection/schema ก่อน ไม่ต้อง Drop ฐาน
ไม่มี version: ใน Compose และ Dockerfile ใช้ # สำหรับ comment เท่านั้น
ถ้าเครื่องมือ deploy กำหนดชื่อ service ให้เลือก line_back
container ใช้ชื่อที่ Compose สร้าง ไม่ต้องลบ container ชื่อเดิมทุกครั้ง
ใช้ docker compose v2 หลีกเลี่ยง fallback ไป docker-compose v1

ทดสอบจากเครือข่ายภายใน:

```sh
curl http://10.10.200.103:3002/health
curl http://10.10.200.103:3002/ready
```

/health ตรวจ process; /ready ตรวจฐานข้อมูลด้วย

## 3. สร้างบัญชีผู้ดูแลครั้งแรก

ตั้ง INITIAL_ADMIN_USERNAME และ INITIAL_ADMIN_PASSWORD ใน .env
รหัสผ่านต้องอย่างน้อย 12 ตัวอักษร จากนั้น:

```sh
docker compose run --rm seed-admin
```

คำสั่งนี้รีเซ็ตรหัสผ่านและเปิดใช้งานบัญชีชื่อเดิมด้วย จึงรันเฉพาะเมื่อต้องการ
ไม่รันอัตโนมัติเมื่อ restart ระบบ และไม่จำเป็นต้องสร้าง admin ใหม่ถ้าย้ายฐานเดิมมาครบ

## 4. อัปเดต

สำรองฐานข้อมูลด้วยเครื่องมือขององค์กรก่อน โดยเฉพาะเมื่อมี migration ใหม่
ตรวจ local changes แล้วดึงโค้ด:

```sh
git pull origin main
docker compose build
docker compose stop line_back
docker compose run --rm migrate
```

ตรวจว่าคำสั่ง migrate สำเร็จแล้วจึงรัน:

```sh
docker compose up -d --force-recreate line_back
```

ห้ามทำขั้นตอนเปิด API ต่อหาก migration ล้มเหลว
เปลี่ยน .env แล้วใช้ docker compose up -d --force-recreate line_back เพื่อโหลดค่าใหม่
restart อย่างเดียวไม่โหลด environment ของ Compose ใหม่

## 5. HTTPS ภายนอก

ให้ทีมเครือข่าย reverse proxy เฉพาะ:
- POST /api/line/webhook
- GET /api/public/media/ตัวเลข

ใช้ HTTPS certificate ที่ LINE เข้าถึงได้ ไม่มีหน้า SSO ขวาง
เส้นทาง Login/Admin/ส่งประกาศ ให้ใช้ภายในองค์กร
API image นี้ไม่ได้จัดการ TLS เอง ต้องมี reverse proxy ของทีมเครือข่าย
ตั้ง Webhook URL=https://ชื่อโดเมน/api/line/webhook
ตั้ง PUBLIC_BASE_URL=https://ชื่อโดเมน แล้ว recreate API

URL รูปปัจจุบันใช้ ID ที่คาดเดาได้ เหมาะกับรูปประกาศที่อนุญาตให้เผยแพร่
ยังไม่มี signed URL จึงต้องเพิ่มก่อนใช้กับภาพที่จำกัดการเข้าถึง
ทดสอบ Verify Webhook, เหตุการณ์จากกลุ่ม และส่งรูปจริงหลังเปิด HTTPS

## ขอบเขตการตรวจ

เครื่องพัฒนายังไม่มี Docker จึงตรวจ TypeScript build และโครงสร้าง YAML ได้เท่านั้น
ต้องทดสอบ docker compose config, build, migration และ healthcheck บนเครื่อง server จริง
ไม่มีการคัดลอก .env เข้า image และไม่มีการแก้ข้อมูลฐานเดิมจากขั้นตอนเตรียมไฟล์
