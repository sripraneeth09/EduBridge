# EduBridge Portal — Backend API Documentation

Base URL: `/api`

## Authentication
- POST `/auth/register` — body: `{ name, email, password, role }` — registers user, returns token
- POST `/auth/login` — body: `{ email, password }` — returns token
- GET `/auth/me` — headers: `Authorization: Bearer <token>` — get current user

## School Information
- GET `/school/notices` — list public notices
- GET `/school/notices/:id` — get a notice
- POST `/school/notices` — (admin|teacher) create notice
- PUT `/school/notices/:id` — (admin|teacher) update
- DELETE `/school/notices/:id` — (admin) delete

## Attendance
- POST `/attendance/mark` — (teacher|admin) body `{ studentId, date, status }`
- GET `/attendance/student/:studentId` — (teacher|admin|parent|student)
- GET `/attendance/report/monthly?month=6&year=2026` — (teacher|admin)

## Mid-Day Meal
- POST `/meal/menu` — (admin|teacher) create menu
- POST `/meal/count` — (admin|teacher) increment served count `{ date, numberServed }`
- GET `/meal` — list meals
- POST `/meal/stock` — (admin) add stock item
- PUT `/meal/stock/:id` — (admin) update stock

## Complaints & Suggestions
- POST `/complaints` — (auth) create complaint `{ title, category, description, anonymous }`
- GET `/complaints` — (admin|teacher) list
- PUT `/complaints/:id/status` — (admin) update status

## Infrastructure Reporting
- POST `/infrastructure` — report issue `{ title, description, location, priority, image }`
- GET `/infrastructure` — (admin|teacher|maintenance)
- PUT `/infrastructure/:id` — (admin|maintenance) update

## Lost & Found
- POST `/lostfound/lost` — report lost item
- POST `/lostfound/found` — report found item
- GET `/lostfound/found/search?q=bag` — search found items
- POST `/lostfound/found/:id/claim` — claim item


Notes:
- All protected endpoints require `Authorization` header.
- File/image uploads are not implemented in this scaffold — use `multer` for multipart handling.
- Extend models with fields like `class`, `section`, `roles` mapping as needed.
