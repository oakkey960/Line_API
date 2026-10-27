# API testing guide

Base URL: `http://localhost:3002`

Start the API with `npm run dev`. Examples below use PowerShell. Never paste the JWT or LINE credentials into source files.

## 1. Health

```powershell
Invoke-RestMethod http://localhost:3002/health
```

Expected: `{ "status": "ok" }`.

## 2. Login

The initial username and password are stored locally as `INITIAL_ADMIN_USERNAME` and `INITIAL_ADMIN_PASSWORD` in `.env`.

```powershell
$body = @{ username = "admin"; password = "YOUR_PASSWORD" } | ConvertTo-Json
$login = Invoke-RestMethod -Method Post -Uri http://localhost:3002/api/login -ContentType "application/json" -Body $body
$token = $login.token
$headers = @{ Authorization = "Bearer $token" }
```

Expected: a JWT token and user profile. Wrong credentials return `401`.

## 3. Current user

```powershell
Invoke-RestMethod -Uri http://localhost:3002/api/me -Headers $headers
```

Expected: the authenticated user without a password hash.

## 4. LINE groups

List groups:

```powershell
Invoke-RestMethod -Uri http://localhost:3002/api/line/groups -Headers $headers
```

Update an internal name/category (Admin only):

```powershell
$body = @{ internalName = "กลุ่มทดสอบ"; category = "ทดสอบ"; enabled = $true } | ConvertTo-Json
Invoke-RestMethod -Method Patch -Uri http://localhost:3002/api/line/groups/1 -Headers $headers -ContentType "application/json" -Body $body
```

Send a connection test (Admin only; sends a real LINE message):

```powershell
Invoke-RestMethod -Method Post -Uri http://localhost:3002/api/line/groups/1/test -Headers $headers
```

## 5. Create and send a broadcast

Preview is performed in the frontend; this endpoint sends immediately.

```powershell
$body = @{
  message = "ประกาศทดสอบจากระบบ"
  groupIds = @(1)
} | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri http://localhost:3002/api/broadcasts -Headers $headers -ContentType "application/json" -Body $body
```

Example request:

```json
{
  "message": "ขอเชิญหัวหน้าหน่วยงานเข้าร่วมประชุม เวลา 13:30 น.",
  "groupIds": [1, 2, 3]
}
```

Expected: `201`, broadcast status, and one recipient result per group.

## 6. Broadcast history and details

```powershell
Invoke-RestMethod -Uri "http://localhost:3002/api/broadcasts?page=1&limit=20" -Headers $headers
Invoke-RestMethod -Uri http://localhost:3002/api/broadcasts/1 -Headers $headers
```

Expected: paginated history and detailed per-group results.

## 7. Retry failed groups

```powershell
Invoke-RestMethod -Method Post -Uri http://localhost:3002/api/broadcasts/1/retry -Headers $headers
```

Only recipients with status `failed` are attempted again. Successful recipients aren't resent.

## 8. Message templates

Create:

```powershell
$body = @{ name = "แจ้งประชุม"; content = "ขอเชิญเข้าร่วมประชุม เวลา 13:30 น." } | ConvertTo-Json
$template = Invoke-RestMethod -Method Post -Uri http://localhost:3002/api/templates -Headers $headers -ContentType "application/json" -Body $body
```

List and update:

```powershell
Invoke-RestMethod -Uri http://localhost:3002/api/templates -Headers $headers
$body = @{ content = "ข้อความฉบับแก้ไข" } | ConvertTo-Json
Invoke-RestMethod -Method Patch -Uri "http://localhost:3002/api/templates/$($template.data.id)" -Headers $headers -ContentType "application/json" -Body $body
```

Disable:

```powershell
Invoke-RestMethod -Method Delete -Uri "http://localhost:3002/api/templates/$($template.data.id)" -Headers $headers
```

## 9. Users (Admin only)

Create a sender:

```powershell
$body = @{
  username = "sender01"
  password = "CHANGE_TO_A_STRONG_PASSWORD"
  displayName = "เจ้าหน้าที่ประชาสัมพันธ์"
  department = "ประชาสัมพันธ์"
  role = "sender"
} | ConvertTo-Json
$user = Invoke-RestMethod -Method Post -Uri http://localhost:3002/api/admin/users -Headers $headers -ContentType "application/json" -Body $body
```

List and update:

```powershell
Invoke-RestMethod -Uri http://localhost:3002/api/admin/users -Headers $headers
$body = @{ displayName = "ชื่อใหม่"; status = "active" } | ConvertTo-Json
Invoke-RestMethod -Method Patch -Uri "http://localhost:3002/api/admin/users/$($user.data.id)" -Headers $headers -ContentType "application/json" -Body $body
```

## 10. Automated integration test

```powershell
npm run test:api
```

The test creates temporary users/templates, checks authentication and protected routes, then removes its test records. It intentionally doesn't send LINE messages. Real LINE delivery is tested separately through the group-test or broadcast endpoint.

