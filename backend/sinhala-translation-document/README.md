# 🚀 Student Attendance Management System — Backend API Guide

> **Day 2 of designHer 2.0 Bootcamp**
> අද අපි Node.js, Express, සහ Prisma පාවිච්චි කරලා backend REST API එකක් හදන්නයි යන්නේ!

---

## 📖 Table of Contents

1. [අද අපි හදන්නේ මොකක්ද? (What We Are Building Today)](#1--what-we-are-building-today)
2. [Step 1 — Project Setup](#2--step-1--project-setup)
3. [Step 2 — The Secrets Disaster & Environment Variables](#3--step-2--the-secrets-disaster--environment-variables)
4. [Step 3 — Connecting to the Database with Prisma](#4--step-3--connecting-to-the-database-with-prisma)
5. [Step 4 — Auth Repository & Async/Await](#5--step-4--auth-repository--asyncawait)
6. [Step 5 — Auth Service: Passwords & JWT](#6--step-5--auth-service-passwords--jwt)
7. [Step 6 — Auth Controller: HTTP & Error Handling](#7--step-6--auth-controller-http--error-handling)
8. [Step 7 — Auth Middleware: Protecting Routes](#8--step-7--auth-middleware-protecting-routes)
9. [Step 8 — Auth Routes & REST API Design](#9--step-8--auth-routes--rest-api-design)
10. [Step 9 — Building the Classroom System](#10--step-9--building-the-classroom-system)
11. [Step 10 — Building the Student System](#11--step-10--building-the-student-system)
12. [Step 11 — Building the Attendance System](#12--step-11--building-the-attendance-system)
13. [Step 12 — The Main Server File & CORS](#13--step-12--the-main-server-file--cors)
14. [Step 13 — Running the Server](#14--step-13--running-the-server)
15. [Step 14 — Testing with Postman](#15--step-14--testing-with-postman)

---

## 1. 🎯 What We Are Building Today

ඊයේ (Day 1) අපි හැදුවෙ **database** එක — ඒ කියන්නේ අපේ data store කරන box එක.

අද (Day 2) අපි හදන්නේ **backend API** එක — ඒ කියන්නේ අපේ data read කරන, write කරන, සහ protect කරන මොළය (brain).

හෙට (Day 3) අපි හදන්නේ **frontend** එක — ඒ කියන්නේ users ලට පේන මුහුණත (face).

```mermaid
flowchart LR
    A["👩‍💻 React Frontend\n(Day 3)"] -->|"HTTP Requests"| B["⚙️ Express Backend\n(Day 2 — අද කරන්නේ මේකයි!)"]
    B -->|"Prisma Queries"| C["🗄️ MySQL Database\n(Day 1)"]
```

### The Architecture — Layered Design

අපේ backend එක **layers** විදිහට තමයි වෙන් කරලා තියෙන්නේ. හැම layer එකකටම තියෙන්නේ එකම එක job එකයි. මේක හරියට restaurant එකක් වගේ:

```mermaid
flowchart TD
    A["🌐 Client\n(Postman / React App)"] -->|"HTTP Request"| B
    B["🛣️ Route Layer\n(The front desk — ඔයාව යොමු කරන තැන)\nauthRoutes.js"] -->|"Calls"| C
    C["🛡️ Middleware\n(The security guard — ඔයාගේ ID එක චෙක් කරනවා)\nauthMiddleware.js"] -->|"Approved"| D
    D["🎮 Controller Layer\n(The waiter — ඔයාගේ order එක ගන්නවා)\nauthController.js"] -->|"Calls"| E
    E["🧠 Service Layer\n(The chef — කෑම එක හදනවා)\nauthService.js"] -->|"Calls"| F
    F["📦 Repository Layer\n(The fridge — අමුද්‍රව්‍ය ගබඩා කරලා තියෙනවා)\nauthRepository.js"] -->|"SQL Query"| G
    G["🗄️ Database\n(MySQL)"]
```

| Layer | Restaurant Analogy | Job |
|-------|-------------------|-----|
| **Route** | Front desk | Request එක හරි තැනට යොමු කරනවා |
| **Middleware** | Security guard | ඔයාට ඇතුළට යන්න අවසර තියෙනවද කියලා බලනවා |
| **Controller** | Waiter | Order එක අරගෙන, response එක දෙනවා |
| **Service** | Chef | ඇත්තම වැඩේ කරනවා (logic, rules) |
| **Repository** | Fridge | Storage (database) එකෙන් data ගන්නවා |

> 💡 **Why layers?** ඔයා හැමදේම එකම file එකක ලිව්වොත්, ඒක "spaghetti code" එකක් වගේ අවුල් ජාලයක් වෙනවා. Layers නිසා හැමදේම clean එකට තියෙනවා. ඔයාට passwords වැඩ කරන විදිහ වෙනස් කරන්න ඕනේ නම්, ඔයා වෙනස් කරන්නේ Service එක විතරයි. Controller එකයි Repository එකයි වෙනස් වෙන්නේ නෑ.

### Our Complete API — What We Will Build

| # | Method | URL | Who Can Use | What It Does |
|---|--------|-----|-------------|-------------|
| 1 | POST | `/api/auth/register` | Anyone | අලුත් account එකක් හදනවා |
| 2 | POST | `/api/auth/login` | Anyone | Login වෙලා token එකක් ගන්නවා |
| 3 | GET | `/api/auth/me` | Logged-in users | ඔයාගේ විස්තර ගන්නවා |
| 4 | GET | `/api/auth/users` | Admin only | ඔක්කොම users ලව ගන්නවා |
| 5 | POST | `/api/classrooms` | Admin only | Classroom එකක් හදනවා |
| 6 | GET | `/api/classrooms` | Logged-in users | ඔක්කොම classrooms ගන්නවා |
| 7 | GET | `/api/classrooms/:id` | Logged-in users | එක classroom එකක් ගන්නවා |
| 8 | GET | `/api/classrooms/teacher/:teacherId` | Logged-in users | Teacher ගේ classrooms ටික ගන්නවා |
| 9 | POST | `/api/students` | Admin, Teacher | Student කෙනෙක්ව ඇතුලත් කරනවා |
| 10 | GET | `/api/students` | Logged-in users | ඔක්කොම students ලව ගන්නවා |
| 11 | GET | `/api/students/:id` | Logged-in users | එක student කෙනෙක්ව ගන්නවා |
| 12 | GET | `/api/students/classroom/:classroomId` | Logged-in users | පන්තියක ඉන්න students ලව ගන්නවා |
| 13 | POST | `/api/attendance` | Admin, Teacher | එක්කෙනෙක්ගේ attendance mark කරනවා |
| 14 | POST | `/api/attendance/bulk` | Admin, Teacher | ගොඩ දෙනෙක්ගේ attendance එකපාර mark කරනවා |
| 15 | GET | `/api/attendance/classroom/:id?date=...` | Logged-in users | දවසට අදාලව පන්තියේ attendance ගන්නවා |
| 16 | GET | `/api/attendance/student/:id` | Logged-in users | Student කෙනෙක්ගේ attendance history එක ගන්නවා |

දැන් අපි build කරන්න පටන් ගමු! 🚀

---

## 2. 🛠️ Step 1 — Project Setup

### Create the project folder

```bash
mkdir backend
cd backend
```

### Initialize the project

```bash
npm init -y
```

මේකෙන් `package.json` file එකක් හැදෙනවා — මේක තමයි අපේ project එකේ ID card එක.

### Install the packages we need

```bash
npm install express cors dotenv bcrypt jsonwebtoken @prisma/client
npm install --save-dev prisma nodemon
```

**What is each package?**

| Package | What It Does |
|---------|-------------|
| `express` | Web server එක හදලා routes ටික handle කරනවා |
| `cors` | React frontend එකට අපේ backend එකත් එක්ක කතා කරන්න ඉඩ දෙනවා |
| `dotenv` | `.env` file එකෙන් secret passwords ටික load කරනවා |
| `bcrypt` | Passwords ටික secure විදිහට hash කරනවා |
| `jsonwebtoken` | Login tokens (JWT) හදනවා |
| `@prisma/client` | අපේ MySQL database එකත් එක්ක කතා කරනවා |
| `prisma` | Database models set up කරන්න පාවිච්චි කරන tool එක |
| `nodemon` | ඔයා file එකක් save කරද්දි server එක automatically restart කරනවා |

### Update package.json

`package.json` එක open කරලා `"type": "module"` එක add කරන්න, ඊටපස්සේ scripts ටික update කරන්න:

```json
  "main": "src/server.js",
  "type": "module",
  "scripts": {
    "dev": "nodemon src/server.js",
    "start": "node src/server.js"
  }
```

- `"type": "module"` — මේකෙන් අපිට පරණ `require()` වෙනුවට modern `import`/`export` syntax එක පාවිච්චි කරන්න පුළුවන් වෙනවා.
- `npm run dev` — Auto-restart එක්ක server එක run කරනවා (development වලට)
- `npm start` — සාමාන්‍ය විදිහට server එක run කරනවා (production වලට)

### Create the folder structure

```bash
mkdir src
mkdir src/config
mkdir src/repositories
mkdir src/services
mkdir src/controllers
mkdir src/middlewares
mkdir src/routes
```

```
backend/
├── prisma/
│   └── schema.prisma
├── src/
│   ├── config/
│   │   └── db.js
│   ├── repositories/
│   │   ├── authRepository.js
│   │   ├── classroomRepository.js
│   │   ├── studentRepository.js
│   │   └── attendanceRepository.js
│   ├── services/
│   │   ├── authService.js
│   │   ├── classroomService.js
│   │   ├── studentService.js
│   │   └── attendanceService.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── classroomController.js
│   │   ├── studentController.js
│   │   └── attendanceController.js
│   ├── middlewares/
│   │   └── authMiddleware.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── classroomRoutes.js
│   │   ├── studentRoutes.js
│   │   └── attendanceRoutes.js
│   └── server.js
├── .env
├── .env.example
├── .gitignore
└── package.json
```

---

## 3. 💥 Step 2 — The Secrets Disaster & Environment Variables

### ❌ The Problem — Hardcoded Secrets

ඔයා මෙහෙම code එකක් ලිව්වා කියලා හිතන්න:

```javascript
// ❌ DANGER! ඔයාගේ ඇත්ත MySQL password එක code එක ඇතුලේ තියෙනවා!
const database = connectToMySQL("root", "MySecretPassword123");
const jwtSecret = "super-secret-key-12345";
```

දැන් ඔයා මේක GitHub එකට push කරනවා. **මොකද වෙන්නේ?**

```mermaid
flowchart TD
    A["😊 ඔයා code එක\nGitHub එකට push කරනවා"] --> B["🌍 Code එක internet එකේ\nPUBLIC වෙනවා"]
    B --> C["😈 Hacker කෙනෙක්\nඔයාගේ password එක හොයාගන්නවා"]
    C --> D["💀 DISASTER!"]
    D --> E["Hacker ඔයාගේ\ndatabase එක delete කරනවා"]
    D --> F["Hacker ඔක්කොම\nuser data හොරකම් කරනවා"]
    D --> G["Hacker ඔයාගේ server එක\ncrypto mining වලට පාවිච්චි කරනවා"]
```

> ⚠️ **මේක හැමදාම වෙන දෙයක්.** Developers ලා අත්වැරදීමකින් passwords GitHub එකට push කරපු නිසා ලොකු companies වලට මිලියන ගණන් ඩොලර් පාඩු වෙලා තියෙනවා. GitHub එකේ bots ඉන්නවා ඔයා push කරලා තත්පර ගානක් ඇතුලත passwords හොයාගන්න.

### ✅ The Solution — Environment Variables (.env)

Code එක ඇතුලේ passwords ලියනවා වෙනුවට, අපි ඒවා කවදාවත් GitHub එකට push වෙන්නේ නැති `.env` කියලා **secret file** එකක දානවා.

```mermaid
flowchart LR
    A[".env file\n(SECRET — ඔයාගේ laptop එකේ විතරයි තියෙන්නේ)"] -->|"dotenv ඒක load කරනවා"| B["process.env\n(ඔයාගේ code එකට ගන්න පුළුවන්)"]
    C[".env.example\n(TEMPLATE — GitHub එකට push කරනවා)"] -->|"Format එක පෙන්නනවා"| D["අනිත් developers ලා\nදන්නවා මොනවද fill කරන්න ඕනේ කියලා"]
```

### Create the `.env` file

`backend/` folder එක ඇතුලේ `.env` කියලා file එකක් හදන්න:

```env
# Database Connection
DATABASE_URL="mysql://root:YOUR_MYSQL_PASSWORD@localhost:3306/attendance_system_db"

# JWT Secret Key (ඕනෑම random string එකක් — දිග එකක් දාන්න!)
JWT_SECRET="designher-bootcamp-2026-super-secret-key"

# Server Port
PORT=5000
```

> ⚠️ `YOUR_MYSQL_PASSWORD` කියන තැනට ඔයාගේ ඇත්ත MySQL password එක දාන්න.

### Create the `.env.example` file

මේ file එක **template** එකක්, මේක තමයි ඔයා GitHub එකට push කරන්නේ. මේකෙන් අනිත් developers ලට පෙන්නනවා මොන variables ද ඕනේ කියලා, හැබැයි ඇත්ත values නැතුව:

```env
# Database Connection
DATABASE_URL="mysql://root:YOUR_PASSWORD@localhost:3306/attendance_system_db"

# JWT Secret Key
JWT_SECRET="your-secret-key-here"

# Server Port
PORT=5000
```

### Create the `.gitignore` file

මේකෙන් Git එකට කියනවා මේ files කවදාවත් push කරන්න එපා කියලා:

```
node_modules/
.env
```

### How to use environment variables in code

```javascript
// ✅ SAFE! ඇත්ත password එක තියෙන්නේ .env එකේ මිසක් code එකේ නෙවෙයි
import "dotenv/config"; // .env file එක load කරනවා

const secret = process.env.JWT_SECRET;   // .env එකෙන් කියවලා ගන්නවා
const dbUrl = process.env.DATABASE_URL;  // .env එකෙන් කියවලා ගන්නවා
```

```mermaid
flowchart LR
    A["Your Code\n(GitHub එකේ තියෙනවා)"] -->|"process.env.JWT_SECRET"| B["Reads from .env\n(GitHub එකේ නෑ)"]
    B --> C["ඇත්ත value එක ගන්නවා\ndesignher-bootcamp-2026-..."]
```

> 💡 **Rule:** කවදාවත් passwords, API keys, නැත්නම් secret tokens කෙලින්ම ඔයාගේ code එකේ ලියන්න එපා. හැමතිස්සෙම `.env` පාවිච්චි කරන්න.

---

## 4. 🗄️ Step 3 — Connecting to the Database with Prisma

### ❌ The Problem — Writing Raw SQL is Painful

Day 1 වලදි ඔයා මෙන්න මේ වගේ SQL queries ලිව්වා:

```sql
SELECT s.name, s.registration_number, a.status
FROM students s
INNER JOIN attendance a ON s.id = a.student_id
WHERE a.classroom_id = 1 AND a.date = '2026-04-28';
```

දැන් හිතන්න මේ SQL strings JavaScript ඇතුලේ ලියන්න වුණොත්:

```javascript
// ❌ මේක කැතයි, කියවන්න අමාරුයි, වරදින්න තියෙන ඉඩකඩ වැඩියි!
const result = await connection.query(
  "SELECT s.name, s.registration_number, a.status FROM students s INNER JOIN attendance a ON s.id = a.student_id WHERE a.classroom_id = " + classroomId + " AND a.date = '" + date + "'"
);
// ඒ වගේම: SQL injection attacks වලින් ඔයාගේ database එක hack කරන්න පුළුවන්! 😱
```

**JavaScript ඇතුලේ raw SQL ලියන එකේ තියෙන ප්‍රශ්න:**
1. ලියන්නයි කියවන්නයි අමාරුයි
2. Typos වෙන්න ලේසියි (autocomplete නෑනේ)
3. SQL injection attacks වලට අහු වෙන්න පුළුවන්
4. ඔයා ඒක run කරනකම් error එකක් තියෙනවද කියලා හොයාගන්න බෑ

### ✅ The Solution — Prisma ORM

**Prisma** කියන්නේ ORM (Object-Relational Mapper) එකක්. මේකෙන් ඔයාට SQL වෙනුවට JavaScript පාවිච්චි කරලා database එකත් එක්ක කතා කරන්න පුළුවන්.

```javascript
// ✅ Clean, safe, ඒ වගේම කියවන්න ලේසියි!
const records = await prisma.attendance.findMany({
  where: {
    classroomId: classroomId,
    date: new Date(date),
  },
  include: {
    student: { select: { name: true, registrationNumber: true } },
  },
});
```

```mermaid
flowchart LR
    A["Your JavaScript Code"] -->|"prisma.user.findMany()"| B["Prisma ORM\n(ඔයා වෙනුවට translate කරනවා)"]
    B -->|"SELECT * FROM users"| C["MySQL Database"]
```

### Set up Prisma

```bash
npx prisma init
```

මේකෙන් `prisma/` කියලා folder එකක් හැදෙනවා, ඒක ඇතුලේ `schema.prisma` කියලා file එකක් තියෙනවා.

### Create the Prisma schema

`prisma/schema.prisma` එක open කරලා මේකෙන් replace කරන්න:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

// User model — මේක "users" table එකට map වෙනවා
model User {
  id        Int      @id @default(autoincrement())
  name      String
  email     String   @unique
  password  String
  role      String   @default("teacher")
  createdAt DateTime @default(now()) @map("created_at")

  classrooms  Classroom[]
  attendances Attendance[] @relation("MarkedByUser")

  @@map("users")
}

// Classroom model — මේක "classrooms" table එකට map වෙනවා
model Classroom {
  id        Int      @id @default(autoincrement())
  name      String
  section   String?
  teacherId Int      @map("teacher_id")
  createdAt DateTime @default(now()) @map("created_at")

  teacher     User         @relation(fields: [teacherId], references: [id])
  students    Student[]
  attendances Attendance[]

  @@map("classrooms")
}

// Student model — මේක "students" table එකට map වෙනවා
model Student {
  id                 Int      @id @default(autoincrement())
  name               String
  email              String   @unique
  registrationNumber String   @unique @map("registration_number")
  classroomId        Int      @map("classroom_id")
  createdAt          DateTime @default(now()) @map("created_at")

  classroom   Classroom    @relation(fields: [classroomId], references: [id])
  attendances Attendance[]

  @@map("students")
}

// Attendance model — මේක "attendance" table එකට map වෙනවා
model Attendance {
  id          Int      @id @default(autoincrement())
  studentId   Int      @map("student_id")
  classroomId Int      @map("classroom_id")
  date        DateTime
  status      String   @default("present")
  markedBy    Int      @map("marked_by")
  createdAt   DateTime @default(now()) @map("created_at")

  student   Student   @relation(fields: [studentId], references: [id])
  classroom Classroom @relation(fields: [classroomId], references: [id])
  marker    User      @relation("MarkedByUser", fields: [markedBy], references: [id])

  @@unique([studentId, date])
  @@map("attendance")
}
```

**මේ හැම කෑල්ලකින්ම කියන්නේ මොකක්ද?**

| Prisma Code | What It Does |
|-------------|-------------|
| `@id` | මේ field එක තමයි primary key එක |
| `@default(autoincrement())` | 1, 2, 3... විදිහට auto-generate වෙනවා |
| `@unique` | Records දෙකකට එකම value එක තියෙන්න බෑ |
| `@map("teacher_id")` | JavaScript වල `teacherId` පාවිච්චි කලත් database column එක `teacher_id` |
| `@@map("users")` | JavaScript වල `User` පාවිච්චි කලත් database table එක `users` |
| `@relation` | Tables අතර සම්බන්ධයක් හදනවා (FOREIGN KEY වගේ) |
| `@@unique([studentId, date])` | එක student කෙනෙක්ට දවසකට තියෙන්න පුළුවන් එක attendance record එකයි |

### Generate the Prisma Client

```bash
npx prisma generate
```

මේකෙන් තමයි අපි JavaScript files ඇතුලේ පාවිච්චි කරන Prisma client code එක හැදෙන්නේ.

### Create the database connection file

`src/config/db.js` file එක හදන්න:

```javascript
// Prisma package එකෙන් PrismaClient එක import කරගන්නවා
import { PrismaClient } from "@prisma/client";

// අලුත් Prisma client instance එකක් හදනවා
const prisma = new PrismaClient();

// අනිත් files වලට පාවිච්චි කරන්න පුළුවන් වෙන්න export කරනවා
export default prisma;
```

> 💡 **`export default`** — Modern JavaScript (ESM) වල files අතරේ code share කරන්නේ මෙහෙමයි. අපි Prisma client එක මෙතන එකපාරක් හදලා, database එකත් එක්ක කතා කරන්න ඕනේ හැම file එකකදිම මේක `import` කරගන්නවා.

**Let's break down every line:**

| Line | What It Does | Why We Need It |
|------|-------------|----------------|
| `import { PrismaClient } from "@prisma/client"` | අපි install කරපු package එකෙන් Prisma tool එක ගන්නවා | මේක හරියට toolbox එකකින් අපිට ඕනේ tool එකක් ගන්නවා වගේ වැඩක්. `{ }` curly braces වලින් කියන්නේ "මට මේ package එකෙන් මේ එක දේ විතරක් ඕනේ" කියන එක. |
| `const prisma = new PrismaClient()` | අපේ database එකට අලුත් connection එකක් හදනවා | `new` එකෙන් අලුත් instance එකක් හදනවා. මේක හරියට database එකට call කරන්න phone number එක ගහනවා වගේ. මුළු app එකටම මේක කරන්නේ එකපාරයි. |
| `export default prisma` | මේ connection එක අනිත් ඔක්කොම files එක්ක share කරනවා | `export default` කියන්නේ "මේ file එකෙන් දෙන ප්‍රධානම දේ මේකයි" කියන එක. අනිත් files වලට පුළුවන් `import prisma from "./config/db.js"` කියලා මේක පාවිච්චි කරන්න. |

> ⚠️ **Why only ONE Prisma client?** හැම `new PrismaClient()` එකකින්ම database එකට අලුත් connection pool එකක් open වෙනවා. හැම file එකකින්ම අලුතෙන් එකක් හැදුවොත්, ඉක්මනටම connections ඉවරවෙලා ඔයාගේ database එක crash වෙනවා. මේක එක පාරක් හදලා share කරන නිසා, අපි පාවිච්චි කරන්නේ කාර්යක්ෂම එක connection pool එකක් විතරයි.

```mermaid
flowchart TD
    A["db.js\n(එක Prisma client එකක් හදනවා)"] --> B["authRepository.js\nimport prisma from db.js"]
    A --> C["classroomRepository.js\nimport prisma from db.js"]
    A --> D["studentRepository.js\nimport prisma from db.js"]
    A --> E["attendanceRepository.js\nimport prisma from db.js"]
```

---

## 5. 🔐 Step 4 — Auth Repository & Async/Await

දැන් අපි build කරන්න පටන් ගමු! අපි මුලින්ම පටන් ගන්නේ **Auth system** එකෙන් — ඒ කියන්නේ login, register, සහ security.

අපි මේක layer by layer build කරනවා: Repository → Service → Controller → Middleware → Routes.

### ❌ The Problem — JavaScript Does NOT Wait!

අපි අපේ පලවෙනි database query එක ලියන්න කලින්, JavaScript ගැන ගොඩක් වැදගත් දෙයක් ඔයා තේරුම් ගන්න ඕනේ.

JavaScript **ඉවසීමක් නෑ (impatient)**. ඔයා එයාට මොකක් හරි හෙමින් වෙන දෙයක් (database එකක් එක්ක කතා කරනවා වගේ) කරන්න කිව්වොත්, එයා ඒක ඉවරවෙනකම් බලන් ඉන්නේ නෑ. එයා කෙලින්ම ඊලඟ line එකට යනවා.

```javascript
// ❌ මේක වැඩ කරන්නේ නෑ! JavaScript ට ඉවසීමක් නෑ!
function getUser() {
  const user = database.findUser("nimal@school.com"); // 100ms යනවා...
  console.log(user); // වහාම run වෙනවා — බලන් ඉන්නේ නෑ!
  // Result: undefined 😱
}
```

```mermaid
flowchart LR
    A["Line 1:\nDatabase එකෙන් අහනවා"] --> B["Line 2:\nconsole.log(user)"]
    B --> C["Result: undefined!\nDatabase එක තාම උත්තර දීලා නෑ"]
    A -.->|"100ms ගියාට පස්සේ..."| D["Database එකේ උත්තරේ එනවා\nහැබැයි දැන් පරක්කු වැඩියි!"]
```

### ✅ The Solution — async/await

`async/await` වලින් JavaScript එකට කියනවා: **"මේක ඉවර වෙනකම් මෙතන WAIT කරන්න."**

```javascript
// ✅ මේක වැඩ! JavaScript database එක වෙනුවෙන් WAIT කරනවා!
async function getUser() {
  const user = await database.findUser("nimal@school.com"); // මෙතන WAIT කරනවා!
  console.log(user); // Database එකෙන් උත්තරේ ආවට පස්සේ run වෙනවා!
  // Result: { name: "Nimal", email: "nimal@school.com" } ✅
}
```

```mermaid
flowchart LR
    A["Line 1:\nawait database query"] -->|"100ms බලන් ඉන්නවා..."| B["Database එක උත්තර දෙනවා!"]
    B --> C["Line 2:\nconsole.log(user)\nදැන් ඇත්ත data එක තියෙනවා ✅"]
```

**සමස්ත නීති තුනක්:**
1. Function name එකට කලින් `async` දාන්න
2. හෙමින් වෙන ඕනෑම වැඩකට කලින් (database queries, API calls) `await` දාන්න
3. `await` පාවිච්චි කරන්න පුළුවන් `async` function එකක් ඇතුලේ විතරයි

### Now let's write the Auth Repository

මේ file එක කතා කරන්නේ database එකත් එක්ක විතරයි. මේක HTTP, passwords, නැත්නම් tokens ගැන මුකුත් දන්නේ නෑ.
`src/repositories/authRepository.js` හදන්න:

```javascript
import prisma from "../config/db.js";
```

**⏸️ Wait — `../config/db.js` කියන්නේ මොකක්ද?**

ඔයා file එකක් import කරද්දි, ඔයා පාවිච්චි කරන්නේ **relative path** එකක් — ඒ කියන්නේ දැනට ඉන්න file එකේ ඉඳන් අනිත් file එකට යන පාර. මේක ගොඩක් අයට පැටලෙනවා, ඒ නිසා අපි මේක තේරුම් ගමු:

| Symbol | Meaning | Analogy |
|--------|---------|---------|
| `./` | Current folder | "මම දැන් ඉන්න කාමරේම බලන්න" |
| `../` | Go up one folder (parent) | "දොරෙන් එළියට ගිහින් බලන්න" |
| `../../` | Go up two folders | "දොරවල් දෙකකින් එළියට යන්න" |

**Example:** අපි දැන් ඉන්නේ `src/repositories/authRepository.js` වල. අපිට import කරන්න ඕනේ `src/config/db.js`:

```
src/
├── config/
│   └── db.js            ← අපිට යන්න ඕනේ මෙතනටයි
├── repositories/
│   └── authRepository.js  ← අපි ඉන්නේ මෙතන
```

```
Step 1: ../ → repositories/ එකෙන් එළියට ඇවිත් src/ එකට යනවා
Step 2: config/ → config folder එකට යනවා
Step 3: db.js → File එක හොයාගන්නවා

Result: "../config/db.js"
```

```mermaid
flowchart LR
    A["authRepository.js\n(repositories/ වල ඉන්නේ)"] -->|"../ = src/ එකට යනවා"| B["src/"]
    B -->|"config/ = folder එකට යනවා"| C["config/"]
    C -->|"db.js = file එක"| D["db.js ✅"]
```

> ⚠️ **ESM Rule:** Modern JavaScript (ESM) වලදි, ඔයා අනිවාර්යයෙන්ම `.js` file extension එක imports වලට දාන්න ඕනේ. `"../config/db"` වැඩ කරන්නේ නෑ — ඒක අනිවාර්යයෙන්ම `"../config/db.js"` වෙන්න ඕනේ. මේක CommonJS `require()` වලට වඩා වෙනස් (ඒකෙදි extensions නොදා ඉන්න පුළුවන්).

දැන් ආපහු code එකට යමු! මේ තියෙන්නේ සම්පූර්ණ `authRepository.js` එක:

```javascript
import prisma from "../config/db.js";

// Email එකෙන් user කෙනෙක්ව හොයනවා
async function findUserByEmail(email) {
  const user = await prisma.user.findUnique({
    where: {
      email: email,
    },
  });
  return user;
}

// ID එකෙන් user කෙනෙක්ව හොයනවා
async function findUserById(id) {
  const user = await prisma.user.findUnique({
    where: {
      id: id,
    },
  });
  return user;
}

// Database එකේ අලුත් user කෙනෙක්ව හදනවා
async function createUser(name, email, hashedPassword, role) {
  const newUser = await prisma.user.create({
    data: {
      name: name,
      email: email,
      password: hashedPassword,
      role: role,
    },
  });
  return newUser;
}

// ඔක්කොම users ලව ගන්නවා (passwords නැතුව!)
async function findAllUsers() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      // අපි password එක select කරන්නේ නෑ — කවදාවත් passwords යවන්න එපා!
    },
  });
  return users;
}

export {
  findUserByEmail,
  findUserById,
  createUser,
  findAllUsers,
};
```

**Prisma methods පැහැදිලි කිරීම:**

| Prisma Method | What It Does | SQL Equivalent |
|---------------|-------------|----------------|
| `prisma.user.findUnique()` | Unique field එකකින් එක record එකක් හොයනවා | `SELECT * FROM users WHERE email = ?` |
| `prisma.user.findMany()` | ගැළපෙන ඔක්කොම records හොයනවා | `SELECT * FROM users` |
| `prisma.user.create()` | අලුත් record එකක් ඇතුලත් කරනවා | `INSERT INTO users VALUES (...)` |

**Deep dive — හැම function එකකින්ම කරන්නේ මොකක්ද සහ ඒ ඇයි කියලා බලමු:**

**`findUserByEmail`** — අපි `findMany` වෙනුවට `findUnique` පාවිච්චි කරන්නේ අපේ Prisma schema එකේ email එක `@unique` field එකක් නිසයි. ඒ කියන්නේ මේ email එක තියෙන්න පුළුවන් එක user කෙනෙක්ට විතරයි. `findUnique` එක ගොඩක් වේගවත්, මොකද එක match එකක් හම්බවුණු ගමන් එයා හොයන එක නවත්තනවා. මේක හරියට phone number එකක් හොයනවා වගේ — හැම කෙනෙක්ටම තියෙන්නේ එකයි, ඒ නිසා හම්බවුණු ගමන් හොයන එක නවත්තන්න පුළුවන්.

**`findUserById`** — මේකත් ඒ වගේමයි. `id` එක කියන්නේ primary key (`@id`) එකක්, ඒකත් හැමතිස්සෙම unique. පස්සේ අපිට JWT token එකකින් `userId` එක හම්බවුණාම, ඒ user ගේ සම්පූර්ණ විස්තර ගන්න අපි මේක පාවිච්චි කරනවා.

**`createUser`** — `data: { ... }` object එකෙන් Prisma එකට හරියටම කියනවා මොන column එකට මොන value එකද දාන්න ඕනේ කියලා. මතක තියාගන්න අපි මෙතනට දෙන්නේ `hashedPassword` එක, සාමාන්‍ය password එක නෙවෙයි. Password එක hash කරේ කොහොමද කියලා Repository එක දන්නේ නෑ — ඒක Service layer එකේ රස්සාව. Repository එක කරන්නේ එයාට හම්බවෙන දේ save කරන එක විතරයි.

**`findAllUsers`** — මෙතන `select` option එක ගොඩක් වැදගත්. `select` නැතුව Prisma එකෙන් password hash එකත් එක්කම ඔක්කොම fields දෙනවා. `id: true, name: true, email: true, role: true, createdAt: true` කියලා විතරක් දෙන එකෙන් අපි Prisma ට පැහැදිලිවම කියනවා: "මට මේ fields ටික විතරක් දෙන්න, වෙන මුකුත් එපා" කියලා. මේක security best practice එකක් — කවදාවත් ඕනෙවට වඩා data යවන්න එපා.

**`export { }` block එක** — `export default` (මේකෙන් export කරන්නේ ප්‍රධාන එක දෙයයි) වගේ නෙවෙයි, `export { }` වලින් අපිට නම් කරපු දේවල් ගොඩක් export කරන්න පුළුවන්. අනිත් files මේවා import කරගන්නේ මෙහෙමයි: `import { findUserByEmail, createUser } from "../repositories/authRepository.js"`. මේ නම් හරියටම සමාන වෙන්න ඕනේ.

> ⚠️ **Security:** `findAllUsers` වලදි, අපි return කරන්න ඕනේ fields මොනවද කියලා තෝරන්න `select` පාවිච්චි කරනවා. අපි කවදාවත් `password` field එක return කරන්නේ නෑ! එහෙම කලොත්, මේ API එක call කරන ඕනෑම කෙනෙක්ට හැමෝගෙම passwords බලාගන්න පුළුවන් වෙනවා.

---

## 6. 🔑 Step 5 — Auth Service: Passwords & JWT

Service layer එකෙන් තමයි **business logic** එක (rules සහ තීරණ) handle කරන්නේ. Passwords වල security එක සහ login tokens ගැන අපි වැඩ කරන්නේ මෙතනදි.

### ❌ The Problem — Saving Passwords as Plain Text

ඔයා register function එකක් හදලා password එක කෙලින්ම save කරනවා කියලා හිතමු:

```javascript
// ❌ කවදාවත් මේක කරන්න එපා! Password එක plain text විදිහට save කරන එක!
async function registerUser(name, email, password) {
  const user = await createUser(name, email, password, "teacher");
  // Database එකේ දැන් මෙහෙම save වෙලා තියෙනවා: password = "teacher123"
  // Database එක බලන්න පුළුවන් ඕනෑම කෙනෙක්ට මේක කියවන්න පුළුවන්!
}
```

**මෙතන තියෙන භයානකකම මොකක්ද?**

```mermaid
flowchart TD
    A["😊 User register වෙනවා\npassword: teacher123 එක්ක"] --> B["📦 Database එක save කරනවා:\npassword = teacher123"]
    B --> C["😈 Hacker කෙනෙක්\nඔයාගේ database එක කඩනවා"]
    C --> D["💀 Hacker ට ඔක්කොම passwords\nපැහැදිලිව පේනවා!"]
    D --> E["🔓 Hacker ඕනෑම user කෙනෙක්\nවිදිහට login වෙනවා"]
    D --> F["🌐 Hacker මේ password එකම\nGmail, Facebook, Bank වලටත් try කරනවා..."]
    D --> G["📰 Data breach එකක් නිසා\nඔයාගේ app එක ප්‍රවෘත්ති වලට යනවා"]
```

> ⚠️ **Real example:** 2012 දි LinkedIn හැක් වුණා. මිලියන 6.5 ක passwords හොරකම් කළා. ගොඩක් ඒවා දුර්වල hashes විදිහට තමයි save කරලා තිබ්බේ. එකම password එක පාවිච්චි කරපු අයට එයාලගේ අනිත් accounts ත් නැති වුණා.

### ✅ The Solution — Hashing with bcrypt

**Hashing** කියන්නේ one-way transformation එකක්. ඔයාට password එකක් hash එකක් කරන්න පුළුවන්, හැබැයි ඔයාට **කවදාවත් hash එකක් ආපහු password එකක් කරන්න බෑ**. මේක හරියට මස් අඹරන මැෂින් එකක් වගේ — ඔයාට මස් වලින් බර්ගර් එකක් හදන්න පුළුවන්, හැබැයි බර්ගර් එකකින් ආපහු මස් කෑල්ලක් හදන්න බෑ.

```mermaid
flowchart LR
    A["teacher123\n(plain text)"] -->|"bcrypt.hash()"| B["$2b$10$VxB/Z1jc...\n(hashed — ආපහු හරවන්න බෑ!)"]
    B -.->|"❌ හරවන එක\nIMPOSSIBLE"| A
```

```
Plain Password:  teacher123
Hashed Password: $2b$10$VxB/Z1jcdUDt2rNG7V6bWenRA0afyXCPPxyMwRJ6RxX7gKWQzkl4e
```

**What is salting?** "Salt" එකක් කියන්නේ hash කරන්න කලින් password එකට එකතු කරන random text එකක්. Users ලා දෙන්නෙක්ට එකම password එක තිබ්බත්, එයාලගේ hashes දෙක වෙනස් වෙන්නේ මේ නිසයි!

```
User 1: "teacher123" + random_salt_abc → $2b$10$Abc...
User 2: "teacher123" + random_salt_xyz → $2b$10$Xyz...  (වෙනස්!)
```

**Hash එක ආපහු හරවන්න බැරිනම් කොහොමද login වෙන්නේ?**

අපි `bcrypt.compare()` පාවිච්චි කරනවා. එයා type කරපු password එක මුලින් පාවිච්චි කරපු salt එකත් එක්කම hash කරලා බලනවා ප්‍රතිඵලය සමානද කියලා:

```mermaid
flowchart TD
    A["User types: teacher123"] --> B["bcrypt ඒක save කරලා තියෙන\nsalt එකත් එක්ක hash කරනවා"]
    B --> C{"අලුත් hash එකයි save කරලා තියෙන\nhash එකයි සමානද?"}
    C -->|"ඔව් ✅"| D["Password එක හරි!\nLogin successful"]
    C -->|"නෑ ❌"| E["Password එක වැරදියි!\nLogin denied"]
```

### ❌ The Next Problem — HTTP is Stateless

හරි, user login වුණා. හැබැයි HTTP වල ප්‍රශ්නයක් තියෙනවා: **එයාට ඔයාව ඒ වෙලාවෙම අමතක වෙනවා**.

```mermaid
sequenceDiagram
    participant U as User
    participant S as Server

    U->>S: POST /login (email + password)
    S->>U: ✅ Login successful!

    U->>S: GET /students
    S->>U: ❌ ඔයා කවුද?? මම ඔයාව දන්නේ නෑ!
    Note right of S: හැම request එකකටම පස්සේ<br/>HTTP ට ඔයාව අමතක වෙනවා!
```

HTTP හරියට රන් මාළුවෙක් (goldfish) වගේ — එයාට මතකයක් නෑ. හැම request එකක්ම අලුත්. තත්පර 2කට කලින් ඔයා login වුණා කියලා server එක දන්නේ නෑ.

### ✅ The Solution — JWT Tokens (Digital ID Cards)

**JWT** (JSON Web Token) කියන්නේ ඩිජිටල් ID card එකක් වගේ. Login වුණාට පස්සේ, server එක token එකක් හදලා ඔයාට දෙනවා. ඊටපස්සේ කරන හැම request එකකදිම ඔයා මේ token එක පෙන්නන්න ඕනේ.

```mermaid
sequenceDiagram
    participant U as User
    participant S as Server

    U->>S: POST /login (email + password)
    S->>S: Check password ✅
    S->>S: Create JWT token
    S->>U: මෙන්න ඔයාගේ token එක: eyJhbG...

    U->>S: GET /students (+ header එකේ token එක)
    S->>S: Verify token ✅ — ආහ්, ඔයා User 1 (Admin) නේද!
    S->>U: මෙන්න student list එක!
```

**JWT token එකක් පේන්නේ කොහොමද?**

```
eyJhbGciOiJIUzI1NiIs.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiJ9.abc123signature

මේකේ තිත් වලින් වෙන් කරපු කොටස් 3ක් තියෙනවා:
Part 1: Header    → algorithm ගැන විස්තර
Part 2: Payload   → ඔයාගේ data: { userId: 1, role: "admin" }
Part 3: Signature → මේ token එක හැදුවේ අපේ server එකෙන් කියලා ඔප්පු කරන එක
```

> 💡 **Analogy:** JWT කියන්නේ concert එකකට දෙන wristband (අත්බඳනය) එකක් වගේ. ඔයා ඇතුලට යද්දි (login වෙද්දි), ආරක්ෂකයා ටිකට් එක බලලා ඔයාට wristband එකක් දෙනවා. ඊටපස්සේ ඔයාට තියෙන්නේ ඕනෑම තැනකට යන්න ඒ wristband එක පෙන්නන එක විතරයි. ආපහු ටිකට් එක පෙන්නන්න ඕනේ නෑ.

> 🛠️ **Debugging Tool — jwt.io:** JWT token එකක් ඇතුලේ මොනවද තියෙන්නේ කියලා බලන්න ඕනෙද? [https://jwt.io](https://jwt.io) එකට යන්න. "Encoded" කියන box එකට ඔයාගේ token එක paste කරන්න, එතකොට ඒකෙන් ක්ෂණිකවම decode කරපු Header එකයි Payload එකයි පෙන්නනවා! Login ප්‍රශ්න විසඳද්දි (debugging) මේක ගොඩක් ප්‍රයෝජනවත්. උදාහරණයක් විදිහට, ඔයාට පුළුවන් මේවා check කරන්න: `userId` එක හරිද? `role` එක හරිද? Token එක expire වෙලාද? මේ website එක bookmark කරගන්න — ඔයාට මේක ගොඩක් පාවිච්චි වෙයි!

```mermaid
flowchart LR
    A["ඔයාගේ token එක copy කරගන්න\neyJhbGciOiJ..."] -->|"jwt.io එකේ paste කරන්න"| B["Decode වුණු data බලන්න:\nuserId: 1\nrole: admin\nexp: 1714358400"]
    B --> C["ඔයාගේ ප්‍රශ්න විසඳගන්න!\nuserId එක වැරදිද? Role එක වැරදිද?\nToken එක expire වෙලාද?"]
```

### Now Let's Write the Auth Service

`src/services/authService.js` හදන්න:

```javascript
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { findUserByEmail, createUser, findAllUsers } from "../repositories/authRepository.js";

// අලුත් user කෙනෙක්ව register කරනවා
async function registerUser(name, email, password, role) {
  // Step 1: Email එක දැනටමත් තියෙනවද කියලා බලනවා
  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    return {
      success: false,
      message: "මේ email එකෙන් දැනටමත් user කෙනෙක් ඉන්නවා.",
      data: null,
    };
  }

  // Step 2: Password එක hash කරනවා (කවදාවත් plain text save කරන්න එපා!)
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  // Step 3: Database එකට save කරනවා (HASHED password එකත් එක්ක)
  const newUser = await createUser(name, email, hashedPassword, role);

  // Step 4: Success කියලා return කරනවා (password එක නැතුව!)
  return {
    success: true,
    message: "User ව සාර්ථකව register කළා.",
    data: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
    },
  };
}

// User කෙනෙක්ව login කරනවා
async function loginUser(email, password) {
  // Step 1: Email එකෙන් user ව හොයනවා
  const user = await findUserByEmail(email);
  if (!user) {
    return {
      success: false,
      message: "Invalid email or password.",
      data: null,
    };
  }

  // Step 2: Save කරලා තියෙන hash එකත් එක්ක password එක compare කරනවා
  const isPasswordCorrect = await bcrypt.compare(password, user.password);
  if (!isPasswordCorrect) {
    return {
      success: false,
      message: "Invalid email or password.",
      data: null,
    };
  }

  // Step 3: JWT token එක හදනවා
  const tokenPayload = {
    userId: user.id,
    role: user.role,
  };
  const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
    expiresIn: "24h",
  });

  // Step 4: Token එකයි user info එකයි return කරනවා
  return {
    success: true,
    message: "Login successful.",
    data: {
      token: token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    },
  };
}

// ඔක්කොම users ලව ගන්නවා (admin ට)
async function getAllUsers() {
  const users = await findAllUsers();
  return {
    success: true,
    message: "Users ලව සාර්ථකව ගත්තා.",
    data: users,
  };
}

export {
  registerUser,
  loginUser,
  getAllUsers,
};
```

**Register flow:**

```mermaid
flowchart TD
    A["User name එක, email එක, password එක යවනවා"] --> B{"Email එක\nදැනටමත් තියෙනවද?"}
    B -->|"ඔව්"| C["Error එකක් return කරනවා:\nEmail එක දැනටමත් තියෙනවා"]
    B -->|"නෑ"| D["bcrypt වලින් password එක\nhash කරනවා"]
    D --> E["User ව database එකට\nsave කරනවා"]
    E --> F["Success කියලා return කරනවා\n(password එක නැතුව!)"]
```

**Login flow:**

```mermaid
flowchart TD
    A["User email එකයි, password එකයි යවනවා"] --> B{"User\nඉන්නවද?"}
    B -->|"නෑ"| C["Error එකක් return කරනවා:\nInvalid credentials"]
    B -->|"ඔව්"| D{"Hash එකයි password එකයි\nසමානද?"}
    D -->|"නෑ"| C
    D -->|"ඔව්"| E["JWT token එක හදනවා"]
    E --> F["Token එකයි user info එකයි return කරනවා"]
```

**Deep dive — Auth Service එක පේළියෙන් පේළියට තේරුම් ගනිමු:**

**Imports ගැන:**
- `import bcrypt from "bcrypt"` — මේකෙන් අපිට password hashing tool එක හම්බවෙනවා. අපි `bcrypt` පාවිච්චි කරන්නේ ඒක විශේෂයෙන්ම passwords වලටම හදපු එකක් නිසයි. ඒක හිතාමතාම පරක්කු වෙන විදිහට (slow) තමයි හදලා තියෙන්නේ — ඒකෙන් හැකර්ස්ලට ඉක්මනට passwords මිලියන ගණන් try කරලා බලන එක ගොඩක් අමාරු කරනවා.
- `import jwt from "jsonwebtoken"` — මේකෙන් අපිට JWT token tool එක හම්බවෙනවා. Login tokens හදන්නයි, verify කරන්නයි අපි මේක පාවිච්චි කරනවා.
- `import { findUserByEmail, createUser, findAllUsers } from "..."` — අපි Repository එකෙන් නිශ්චිත functions විතරක් `{ }` පාවිච්චි කරලා import කරගන්නවා. මේකට කියන්නේ "named import" කියලා. අපිට ඕනේ දේ විතරයි අපි ගන්නේ, හරියට රාක්කෙකින් අපිට ඕනේ බඩු විතරක් තෝරලා ගන්නවා වගේ.

**`registerUser` function එක — වැදගත් පේළි පැහැදිලි කිරීම:**

| Line | What It Does | Why This Way |
|------|-------------|-------------|
| `await findUserByEmail(email)` | මේ email එකෙන් දැනටමත් කවුරුහරි register වෙලාද කියලා බලනවා | අපි මේක create කරන්න කලින් බලනවා. අපි මේක නොබලා duplicate එකක් හදන්න ගියොත්, database එකෙන් කැත error එකක් දෙනවා. කලින්ම check කරලා ලස්සන message එකක් දෙන එක හොඳයි. |
| `const saltRounds = 10` | Hashing වල ප්‍රබලත්වය (strength) තීරණය කරනවා | ලොකු අංකයක් = ගොඩක් secure හැබැයි slow. 10 තමයි සම්මතය. 12 ට වඩා ගියොත් users ලට register වෙන්න යන වෙලාව ගොඩක් වැඩි වෙනවා. |
| `await bcrypt.hash(password, saltRounds)` | Plain text password එක hash එකක් බවට පත් කරනවා | `await` එක අනිවාර්යයෙන්ම ඕනේ මොකද hashing කියන්නේ CPU එකට බර වැඩක්. `10` rounds කියන්නේ bcrypt එක password එක 2^10 = 1024 වතාවක් process කරනවා. මේකට ~100ms වගේ යන්නේ — ඒක user කෙනෙක්ට වේගවත් වුණාට, passwords මිලියන ගණන් try කරන hacker කෙනෙක්ට ගොඩක් slow. |
| `return { success: true, data: { id, name, email, role } }` | Password එක නැතුව user info එක return කරනවා | අපි return කරන්න ඕනේ fields මොනවද කියලා තෝරලා දෙනවා. අපි කවදාවත් password hash එක response එකක යවන්නේ නෑ, ඒක hash කරලා තිබ්බත්. |

**`loginUser` function එක — වැදගත් පේළි පැහැදිලි කිරීම:**

| Line | What It Does | Why This Way |
|------|-------------|-------------|
| `await bcrypt.compare(password, user.password)` | Type කරපු password එක save කරලා තියෙන hash එකත් එක්ක compare කරනවා | `bcrypt.compare` එකේ තමයි මැජික් එක තියෙන්නේ — එයා plain text password එක අරගෙන මුලින්ම පාවිච්චි කරපු salt එකත් එක්කම hash කරලා, ඒ ප්‍රතිඵලය සමානද කියලා බලනවා. එයා `true` හෝ `false` return කරනවා. ඔයා කවදාවත් `password === user.password` විදිහට passwords compare කරන්නේ නෑ — එහෙම කරොත් plain text එකක් hash එකක් එක්ක compare වෙලා හැමතිස්සෙම fail වෙනවා! |
| `const tokenPayload = { userId, role }` | Token එක ඇතුලේ අපිට තියාගන්න ඕනේ data | අපි මෙතනට දාන්නේ අත්‍යවශ්‍යම දේවල් ටික විතරයි. Passwords හරි email වගේ සංවේදී දේවල් (sensitive data) මෙතන දාන්න එපා — ඕනෑම කෙනෙක්ට JWT එකක් decode කරලා payload එක කියවන්න පුළුවන් (ඒක encode කරලා විතරයි තියෙන්නේ, encrypt කරලා නෑ). |
| `jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: "24h" })` | JWT token එක හදනවා | Arguments 3ක් තියෙනවා: (1) save කරන්න ඕනේ data, (2) ඒක sign කරන්න ඕනේ secret key එක (`.env` එකෙන්), (3) expire වෙන වෙලාව වගේ options. Secret key එක හරියට ඉටි මුද්‍රාවක් (wax seal) වගේ — මේ මුද්‍රාවෙන් tokens හදන්න පුළුවන් අපේ server එකට විතරයි. කවුරුහරි token එකේ data වෙනස් කරොත්, මුද්‍රාව කැඩිලා `jwt.verify()` එකෙන් ඒක reject කරනවා. |

**The consistent response format:**

හැම function එකක්ම එකම හැඩයකින් (shape) තමයි return වෙන්නේ: `{ success, message, data }`. මේකෙන් frontend developer ගේ වැඩේ ගොඩක් ලේසි වෙනවා. එයාලා හැමතිස්සෙම දන්නවා මොනවද බලාපොරොත්තු වෙන්න ඕනේ කියලා:

```
success = true  → ඔක්කොම හරි. ප්‍රතිඵලය බලන්න "data" එක check කරන්න.
success = false → මොකක් හරි වැරදිලා. මොකද වුණේ කියලා බලන්න "message" එක check කරන්න.
data = null     → Return කරන්න data නෑ (error වෙලාවට පාවිච්චි කරනවා).
```

> 💡 **Security tip:** අපි email එක වැරදි වුණත්, password එක වැරදි වුණත් දෙකටම දෙන්නේ "Invalid email or password" කියලයි. මේකෙන් හැකර් කෙනෙක්ට හොයාගන්න බෑ මේ email එක අපේ system එකේ තියෙනවද නැද්ද කියලා. අපි "Email not found" කියලා දුන්නොත්, හැකර් කෙනෙක්ට පුළුවන් මොන emails ද register වෙලා තියෙන්නේ කියලා හොයාගන්න.

---

## 7. 📡 Step 6 — Auth Controller: HTTP & Error Handling

Controller layer එකෙන් තමයි **HTTP** handle කරන්නේ — එයා request එක කියවලා response එක යවනවා. අපි ඒක ලියන්න කලින්, බලමු HTTP කියන්නේ ඇත්තටම මොකක්ද කියලා.

### What is HTTP?

HTTP කියන්නේ browsers සහ servers කතා කරන භාෂාව. ඔයා website එකකට යන හැම වෙලාවකම, ඔයාගේ browser එක HTTP **request** එකක් යවනවා, ඊටපස්සේ server එක HTTP **response** එකක් එවනවා.

```mermaid
flowchart LR
    A["👩‍💻 Client\n(Browser / Postman)"] -->|"HTTP Request\nGET /api/students"| B["⚙️ Server\n(අපේ Express API එක)"]
    B -->|"HTTP Response\n200 OK + JSON data"| A
```

**Request එකක මේ කොටස් තියෙනවා:**

| Part | Example | Purpose |
|------|---------|---------|
| **Method** | GET, POST, PUT, DELETE | මොන action එකද කරන්නේ |
| **URL** | `/api/students/5` | මොන resource එකටද යන්නේ |
| **Headers** | `Authorization: Bearer token...` | වැඩිපුර විස්තර (ඔයාගේ ID card එක වගේ) |
| **Body** | `{ "name": "Nimal", "email": "..." }` | ඔයා යවන data |

**Response එකක මේ කොටස් තියෙනවා:**

| Part | Example | Purpose |
|------|---------|---------|
| **Status Code** | 200, 201, 400, 401, 404, 500 | ඒක සාර්ථක වුණාද නැද්ද? |
| **Body** | `{ "success": true, "data": [...] }` | ආපහු එවන data |

**Common status codes:**

| Code | Meaning | When to Use |
|------|---------|------------|
| `200` | OK | Request එක සාර්ථකයි |
| `201` | Created | අලුත් record එකක් හැදුවා |
| `400` | Bad Request | Client යවපු data වැරදියි |
| `401` | Unauthorized | Login වෙලා නෑ (token එක නෑ) |
| `403` | Forbidden | Login වෙලා ඉන්නවා හැබැයි අවසර නෑ |
| `404` | Not Found | Resource එක හොයාගන්න නෑ |
| `500` | Server Error | අපේ පැත්තේ මොකක් හරි කැඩිලා |

**Express වලදි අපි requests වලින් data කියවන්නේ කොහොමද:**

| Source | How to Read | Example |
|--------|------------|---------|
| Request body (JSON) | `req.body.email` | POST requests වල යවන data |
| URL parameter | `req.params.id` | `/api/students/5` → `req.params.id = "5"` |
| Query string | `req.query.date` | `/api/attendance?date=2026-04-28` → `req.query.date` |
| Headers | `req.headers.authorization` | JWT token එක |

### ❌ The Problem — No Error Handling = Server Crash

Database එක වැඩ කරන්නේ නැත්නම් මොකද වෙන්නේ? User කෙනෙක් වැරදි data යැව්වොත් මොකද වෙන්නේ? Error handling නැත්නම්, ඔයාගේ server එක **crash** වෙනවා:

```javascript
// ❌ DANGEROUS! Database එක වැඩ නැත්නම්, මේකෙන් මුළු server එකම CRASH වෙනවා!
async function getUsers(req, res) {
  const users = await getAllUsers();  // 💥 Database error!
  return res.status(200).json(users); // මේ පේළිය කවදාවත් run වෙන්නේ නෑ
  // Server එක crash වෙනවා. ඔක්කොම users ලට access නැතිවෙනවා. 😱
}
```

```mermaid
flowchart TD
    A["Request එකක් එනවා"] --> B["Database එකට call කරනවා"]
    B --> C["💥 Database එක වැඩ නෑ!"]
    C --> D["❌ Unhandled Error එකක්"]
    D --> E["🔥 මුළු SERVER එකම CRASH වෙනවා"]
    E --> F["කවුරුහරි server එක restart කරනකම්\nඔක්කොම users ලට errors එනවා"]
```

### ✅ The Solution — try/catch

`try/catch` කියන්නේ safety net (ආරක්ෂක දැලක්) වගේ. `try` එක ඇතුලේ මොනවා හරි වැරදුණොත්, code එක crash වෙන්නේ නැතුව කෙලින්ම `catch` එකට පනිනවා:

```javascript
// ✅ SAFE! මොනවා හරි වැරදුණොත්, අපි ඒක අල්ලගෙන ලස්සන error එකක් යවනවා
async function getUsers(req, res) {
  try {
    const users = await getAllUsers();
    return res.status(200).json(users);
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      success: false,
      message: "මොකක් හරි වැරදුණා. කරුණාකර නැවත උත්සාහ කරන්න.",
      data: null,
    });
  }
}
```

```mermaid
flowchart TD
    A["Request එකක් එනවා"] --> B["TRY: Database එකට call කරනවා"]
    B --> C{"ඒක වැඩ කලාද?"}
    C -->|"ඔව් ✅"| D["Data එක්ක 200 OK\nඑකක් යවනවා"]
    C -->|"නෑ ❌"| E["CATCH: Friendly message එකක් එක්ක\n500 Error එකක් යවනවා"]
    E --> F["Server එක දිගටම වැඩ කරනවා!\nඅනිත් users ලට කිසි ප්‍රශ්නයක් නෑ ✅"]
```

> 💡 **Rule:** හැම controller function එකකම අනිවාර්යයෙන්ම `try/catch` තියෙන්න ඕනේ. මේකෙන් මොකක් හරි වැරදුණාම server එක crash වෙන එක වළක්වනවා.

### Now Let's Write the Auth Controller

`src/controllers/authController.js` හදන්න:

```javascript
import { registerUser, loginUser, getAllUsers } from "../services/authService.js";

// POST /api/auth/register
async function register(req, res) {
  try {
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    const role = req.body.role;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, සහ password එක අනිවාර්යයි.",
        data: null,
      });
    }

    const result = await registerUser(name, email, password, role);

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(201).json(result);
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({
      success: false,
      message: "මොකක් හරි වැරදුණා. කරුණාකර නැවත උත්සාහ කරන්න.",
      data: null,
    });
  }
}

// POST /api/auth/login
async function login(req, res) {
  try {
    const email = req.body.email;
    const password = req.body.password;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email එකයි password එකයි අනිවාර්යයි.",
        data: null,
      });
    }

    const result = await loginUser(email, password);

    if (!result.success) {
      return res.status(401).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      message: "මොකක් හරි වැරදුණා. කරුණාකර නැවත උත්සාහ කරන්න.",
      data: null,
    });
  }
}

// GET /api/auth/users (admin ට විතරයි)
async function getUsers(req, res) {
  try {
    const result = await getAllUsers();
    return res.status(200).json(result);
  } catch (error) {
    console.error("Get users error:", error);
    return res.status(500).json({
      success: false,
      message: "මොකක් හරි වැරදුණා. කරුණාකර නැවත උත්සාහ කරන්න.",
      data: null,
    });
  }
}

// GET /api/auth/me (login වෙලා ඉන්න ඕනෑම user කෙනෙක්ට)
async function getMe(req, res) {
  try {
    return res.status(200).json({
      success: true,
      message: "User විස්තර සාර්ථකව ගත්තා.",
      data: {
        id: req.user.userId,
        role: req.user.role,
      },
    });
  } catch (error) {
    console.error("Get me error:", error);
    return res.status(500).json({
      success: false,
      message: "මොකක් හරි වැරදුණා. කරුණාකර නැවත උත්සාහ කරන්න.",
      data: null,
    });
  }
}

export {
  register,
  login,
  getUsers,
  getMe,
};
```

> 💡 **Notice the pattern:** හැම controller function එකක්ම කරන්නේ වැඩ 3යි: (1) `req` එකෙන් data කියවනවා, (2) Service එකට කතා කරනවා, (3) හරියන status code එකත් එක්ක `res` එක යවනවා. හැමවෙලේම මේවා `try/catch` ඇතුලේ තමයි තියෙන්නේ.

**Deep dive — Auth Controller එක පේළියෙන් පේළියට තේරුම් ගනිමු:**

**`req.body` — පාරිභෝගිකයාගෙන් (customer) එන order slip එක:**

Frontend එකෙන් JSON data එක්ක POST request එකක් යවද්දි, Express එකෙන් ඒ data ටික `req.body` එකට දානවා. මේක හරියට පාරිභෝගිකයෙක් ලියපු order එකක් waiter ට දෙනවා වගේ වැඩක්:

```
Customer ලියනවා: { "name": "Nimal", "email": "nimal@school.com", "password": "teacher123" }
Customer ඒක waiter ට (Express එකට) දෙනවා
Waiter ඒක order slip එකෙන් කියවනවා: req.body.name → "Nimal"
```

අපි `const { name } = req.body` විදිහට destructure කරනවා වෙනුවට `const name = req.body.name` පාවිච්චි කරන්නේ, beginners ලට මේක පැහැදිලිව තේරුම්ගන්න ලේසි නිසයි.

**The validation check `if (!name || !email || !password)`:**

`!` සලකුණෙන් කියන්නේ "NOT (නැත)" කියන එකයි. JavaScript වල හිස් strings, `null`, සහ `undefined` ඔක්කොම "falsy" වෙනවා — ඒ කියන්නේ check කරද්දි ඒවා `false` බවට පත්වෙනවා. ඒ නිසා name එක නැත්නම් හරි හිස්නම් හරි `!name` කියන එක `true` වෙනවා. අපි Service එකට call කරන්න කලින් මේක check කරනවා මොකද:
1. ඒක ගොඩක් වේගවත් — වැරදි data වලට database එකට කතා කරලා බලන්න ඕනේ නෑ.
2. ඒකෙන් හොඳ error message එකක් දෙන්න පුළුවන් — Database එකෙන් එන අවුල්සහගත error එකකට වඩා "Name එක අනිවාර්යයි" කියන එක ගොඩක් පැහැදිලියි.

**වෙනස් ප්‍රතිඵල වලට වෙනස් status codes පාවිච්චි කරන්නේ ඇයි?**

| Situation | Status Code | Reason |
|-----------|------------|--------|
| Registration successful | `201 Created` | අපි අලුත් resource එකක් (user කෙනෙක්ව) හැදුවා. `201` කියන්නේ විශේෂයෙන්ම "අලුතෙන් මොකක්හරි හැදුවා" කියන එකයි. |
| Login successful | `200 OK` | අපි අලුතෙන් මොකුත් හදන්නේ නෑ, data return කරන එක විතරයි කරන්නේ. |
| Missing fields | `400 Bad Request` | CLIENT අතින් වැරැද්දක් වුණා (අඩුපාඩු තියෙන data එව්වා). 4xx codes වලින් හැමතිස්සෙම කියන්නේ "client අතින් වැරැද්දක් වුණා" කියන එකයි. |
| Wrong password | `401 Unauthorized` | CLIENT ට එයා කවුද කියලා ඔප්පු කරන්න බැරි වුණා. |
| Server crash | `500 Internal Server Error` | SERVER එකේ ප්‍රශ්නයක් වුණා. 5xx codes වලින් හැමතිස්සෙම කියන්නේ "server එක අතින් වැරැද්දක් වුණා" කියන එකයි. |

**The `try/catch` wrapper:**

හැම controller function එකක්ම `try { ... } catch (error) { ... }` වලින් ආවරණය (wrap) කරලයි තියෙන්නේ. සාමාන්‍ය code එක run වෙන්නේ `try` block එක ඇතුලේ. ඒ `try` එක ඇතුලේ මොනම පේළියක හරි error එකක් ආවොත් (database එක වැඩ නැත්නම්, වැරදි query එකක් තිබ්බොත් වගේ), JavaScript ක්ෂණිකවම `catch` block එකට පනිනවා. මේක නැති වුණොත්, handle නොකරපු error එකක් නිසා මුළු Node.js process එකම crash වෙලා, හැම user කෙනෙක්ටම server එක වැඩ කරන්නේ නැතුව යනවා.

---

## 8. 🛡️ Step 7 — Auth Middleware: Protecting Routes

### ❌ The Problem — Anyone Can Access Everything!

දැනට තියෙන විදිහට, කවුරුහරි `GET /api/students` කියලා යැව්වොත්, එයාට data ටික හම්බවෙනවා — login වෙලා හිටියේ නැතත්. ඒ වගේම teacher කෙනෙක්ට පුළුවන් admins ලට විතරක් අයිති classrooms delete කරන්න. කිසිම ආරක්ෂාවක් (protection) නෑ.

```mermaid
flowchart LR
    A["😈 Hacker\n(login වෙලා නෑ)"] -->|"GET /api/students"| B["Server"]
    B -->|"මෙන්න ඔක්කොම data ටික!"| A
```

අපිට හැම request එකකටම ප්‍රශ්න දෙකකට උත්තර හොයන්න වෙනවා:

| Question | Name | Example |
|----------|------|---------|
| ඔයා කවුද? | **Authentication** | JWT token එක check කරන එක |
| ඔයාට මොනවද කරන්න පුළුවන්? | **Authorization** | Admin ට classrooms හදන්න පුළුවන්. Teacher ට බෑ. |

### ✅ The Solution — Middleware (Security Guards)

**Middleware** කියන්නේ controller එකට කලින් run වෙන function එකකට. මේක හරියට දොර ගාව ඉන්න security guard කෙනෙක් වගේ:

```mermaid
flowchart LR
    A["Request එකක් එනවා"] --> B["🛡️ Middleware\n(Security Guard)"]
    B -->|"හරි token එකක් තියෙනවද? ✅"| C["🎮 Controller\n(ඇතුළට යන්න දෙනවා)"]
    B -->|"Token එකක් නෑ හරි වැරදියි හරි ❌"| D["REJECTED\n401 Unauthorized"]
```

**401 සහ 403 අතර වෙනස:**

| Code | Meaning | Analogy |
|------|---------|---------|
| `401 Unauthorized` | ඔයා login වෙලා නෑ | ඔයාට මුකුත්ම wristband එකක් නෑ |
| `403 Forbidden` | ඔයා login වෙලා ඉන්නේ හැබැයි ඔයාට අවසර නෑ | ඔයාට wristband එකක් තියෙනවා හැබැයි ඒක සාමාන්‍ය එකක්, VIP එකක් නෙවෙයි |

### Now Let's Write the Auth Middleware

`src/middlewares/authMiddleware.js` හදන්න:

```javascript
import jwt from "jsonwebtoken";

// User ට හරි JWT token එකක් තියෙනවද කියලා බලනවා
function verifyToken(req, res, next) {
  // Step 1: Authorization header එක ගන්නවා
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: "Access denied. Token එකක් දීලා නෑ.",
      data: null,
    });
  }

  // Step 2: Token එක ගන්නවා ("Bearer " කෑල්ල අයින් කරලා)
  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Access denied. Token format එක වැරදියි.",
      data: null,
    });
  }

  // Step 3: Token එක verify කරනවා
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // User ගේ විස්තර ටික request එකට attach කරනවා
    next(); // Controller එකට යන්න දෙනවා
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Access denied. Token එක වැරදියි නැත්නම් expire වෙලා.",
      data: null,
    });
  }
}

// User ට හරි role එක තියෙනවද කියලා බලනවා
function authorizeRoles(...allowedRoles) {
  return function (req, res, next) {
    const userRole = req.user.role;

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: "Access denied. ඔයාට මේක කරන්න අවසර නෑ.",
        data: null,
      });
    }

    next();
  };
}

export {
  verifyToken,
  authorizeRoles,
};
```

**Deep dive — Auth Middleware එක පේළියෙන් පේළියට තේරුම් ගනිමු:**

**`req.headers.authorization`** — HTTP headers කියන්නේ හරියට ලියුමක කවරය (envelope) වගේ. ලියුමේ ඇතුලේ තියෙන දේවල් `req.body` එකේ තිබ්බට, කවරය උඩ වෙනම විස්තර ලියලා තියෙනවා. Client එයාගේ JWT token එක දාන්නේ `Authorization` header එකේ. මේකේ format එක වෙන්නේ `Bearer <token>` (Bearer එකයි token එකයි මැද space එකක් තියෙනවා).

**`authHeader.split(" ")[1]`** — මේකෙන් space එක තියෙන තැනින් වචන දෙකකට කඩනවා. උදාහරණයකට: `"Bearer eyJhbG..."` කියන එක `["Bearer", "eyJhbG..."]` විදිහට array එකක් වෙනවා. අපි `[1]` වෙනි index එක අරගෙන token එක විතරක් වෙන් කරගන්නවා. මේක හරියට "Hello World" කියන එක ["Hello", "World"] කියලා කඩලා දෙවෙනි වචනේ ගන්නවා වගේ වැඩක්.

**`jwt.verify(token, process.env.JWT_SECRET)`** — මේකෙන් එකපාරම දේවල් 3ක් check කරනවා:
1. Token එකේ format එක හරිද? (Corrupt වෙලා නැද්ද)
2. මේක sign කරලා තියෙන්නේ අපේ secret key එකෙන්ද? (වෙන කවුරුහරි හදපු එකක් නෙවෙයිද)
3. මේක expire වෙලාද? (පැය 24කට වඩා පරණද)

මේකෙන් මොකක් හරි එකක් හරි fail වුණොත්, ඒකෙන් error එකක් එනවා. අපේ `catch` block එක ඒ error එක අල්ලගෙන 401 return කරනවා.

**`req.user = decoded`** — මේක තමයි ගොඩක්ම වැදගත් පේළිය. Token එක verify කරාට පස්සේ, අපිට decode වුණු payload එක හම්බවෙනවා: `{ userId: 1, role: "admin" }`. ඊළඟට එන function එකට (ඒ කියන්නේ controller එකට) මේක කියවන්න පුළුවන් වෙන්න අපි ඒක `req` object එකට attach කරනවා. Controller එක ආපහු password අහන්නේ නැතුව request එක එවන්නේ කවුද කියලා දැනගන්නේ මෙහෙමයි.

**`authorizeRoles(...allowedRoles)`** — මේ `...` එකට කියන්නේ "rest operator" කියලා. මේකෙන් ඔක්කොම arguments ටික array එකකට එකතු කරනවා. ඒ නිසා `authorizeRoles("admin", "teacher")` කියලා දුන්නාම `allowedRoles = ["admin", "teacher"]` වෙනවා. මේ function එකෙන් තව function එකක් RETURN කරනවා (මේ විදිහට ලියන එකට කියන්නේ "closure" කියලා). මේ ඇතුලේ තියෙන function එකෙන් `.includes()` පාවිච්චි කරලා `req.user.role` එක allowed list එකේ තියෙනවද කියලා බලනවා. නැත්නම්, 403 Forbidden return කරනවා.

**`verifyToken` වැඩ කරන විදිහ පියවරෙන් පියවර:**

```
1. Client යවනවා:  Authorization: Bearer eyJhbGciOiJIUzI1NiIs...

2. අපි space එකෙන් කඩනවා: ["Bearer", "eyJhbGciOiJIUzI1NiIs..."]

3. අපි [1] index එක ගන්නවා:  "eyJhbGciOiJIUzI1NiIs..."

4. jwt.verify() එකෙන් token එක ඇත්තද සහ expire වෙලා නැද්ද කියලා බලනවා

5. Valid නම්: decoded = { userId: 1, role: "admin" }
   අපි මේක req.user එකට දානවා controllers වලට පාවිච්චි කරන්න පුළුවන් වෙන්න

6. next() → Controller එකට යන්න දෙනවා
```

> 💡 **What is `next()`?** Express වලදී, middleware functions වලට arguments 3ක් හම්බවෙනවා: `req`, `res`, සහ `next`. `next()` එක call කරාම Express ට කියනවා: "මගේ වැඩේ ඉවරයි. Chain එකේ ඊළඟ function එකට යන්න" කියලා. ඔයා `next()` එක call කරේ නැත්නම්, request එක එතනම හිරවෙනවා — controller එක කවදාවත් run වෙන්නේ නෑ.

> ⚠️ **What could go wrong? — Token Expiry**
>
> මතකද අපි token එක හදද්දි `expiresIn: "24h"` කියලා දුන්නා? පැය 24කට පස්සේ, token එක **expire (කල් ඉකුත්)** වෙනවා. මෙන්න මේකයි වෙන්නේ:
>
> 1. User ඊයේ login වෙලා token එකක් ගත්තා.
> 2. අද, එයා ඒ පරණ token එකත් එක්කම request එකක් යවනවා.
> 3. `jwt.verify()` එකට තේරෙනවා token එක expire වෙලා කියලා, ඉතින් එයා **error එකක් දෙනවා**.
> 4. `catch` block එක run වෙනවා → `401: Token is invalid or expired` කියලා යවනවා.
> 5. අලුත් token එකක් ගන්න user ආපහු login වෙන්නම ඕනේ.
>
> මේක ගොඩක් හොඳ දෙයක් — කවුරුහරි token එකක් හොරකම් කරොත් වෙන හානිය මේකෙන් අවම කරනවා. හැකර් කෙනෙක්ට ඒ token එක පාවිච්චි කරන්න පුළුවන් ඒක expire වෙනකම් විතරයි.
>
> ```mermaid
> flowchart TD
>     A["User expire වුණු token එක යවනවා"] --> B["jwt.verify() run වෙනවා"]
>     B --> C["💥 TokenExpiredError එනවා!"]
>     C --> D["catch block එක run වෙනවා"]
>     D --> E["401: Token is invalid or expired"]
>     E --> F["අලුත් token එකක් ගන්න\nUser ආපහු login වෙන්න ඕනේ"]
> ```

> 🛠️ **Debugging Tips — ඔයාට නිතර එන Errors:**
>
> **Prisma Errors:**
>
> | Error | What It Means | How to Fix |
> |-------|--------------|------------|
> | `Unique constraint failed on the fields: (email)` | ඔයා දැනටමත් තියෙන email එකකින් user/student කෙනෙක් හදන්න හැදුවා | වෙන email එකක් පාවිච්චි කරන්න, නැත්නම් duplicate එකක් තියෙනවද කියලා කලින් check කරන්න |
> | `Foreign key constraint failed` | ඔයා දීපු `teacherId` එක හරි `classroomId` එක හරි database එකේ නෑ | ඔයා දෙන record එක ඇත්තටම database එකේ තියෙනවද කියලා බලන්න |
> | `Invalid prisma.user.findUnique() invocation` | ඔයා Prisma method එකට වැරදි arguments දුන්නා | ඔයාගේ `schema.prisma` එකේ තියෙන field names වලට සමානද කියලා බලන්න |
> | `P1001: Can't reach database server` | MySQL වැඩ කරන්නේ නෑ | XAMPP එකේ හරි ඔයාගේ database tool එකේ හරි MySQL start කරන්න |
>
> **JWT Errors:**
>
> | Error | What It Means | How to Fix |
> |-------|--------------|------------|
> | `jwt malformed` | Token string එක corrupt වෙලා හරි බාගෙට තියෙන්නේ | Login response එකෙන් FULL token එකම copy කරගත්තද කියලා බලන්න |
> | `invalid signature` | වෙනස් secret එකකින් token එක හදලා තියෙන්නේ | `.env` එකේ තියෙන `JWT_SECRET` එක sign කරපු එකට සමානද කියලා බලන්න |
> | `jwt expired` | Token එකට පැය 24කට වඩා වයසයි | අලුත් token එකක් ගන්න ආපහු login වෙන්න |
> | `secretOrPrivateKey must have a value` | `.env` එකේ `JWT_SECRET` එක නෑ | ඔයාගේ `.env` file එකට `JWT_SECRET` එක දාන්න |

---

## 9. 🛣️ Step 8 — Auth Routes & REST API Design

### What is REST?

REST කියන්නේ **Representational State Transfer** කියන එකයි. ඒක APIs design කරන්න පාවිච්චි කරන නීති මාලාවක්. මේකේ අදහස ගොඩක් සරලයි: URLs වලින් නියෝජනය වෙන්න ඕනේ **දේවල් (resources)**, සහ HTTP methods වලින් නියෝජනය වෙන්න ඕනේ **ක්‍රියාවන් (actions)**.

| HTTP Method | Action | Example |
|-------------|--------|---------|
| **GET** | Data කියවනවා | ඔක්කොම students ලව ගන්නවා |
| **POST** | අලුත් data හදනවා | අලුත් student කෙනෙක්ව හදනවා |
| **PUT** | තියෙන data update කරනවා | Student ගේ නම වෙනස් කරනවා |
| **DELETE** | Data මකලා දානවා | Student කෙනෙක්ව අයින් කරනවා |

**Good REST URLs vs Bad URLs:**

| ❌ Bad URL | ✅ Good REST URL | Why |
|-----------|-----------------|-----|
| `/getStudents` | `GET /api/students` | Method එකෙන් (GET) දැනටමත් "get" (ගන්න) කියලා කියනවා |
| `/createStudent` | `POST /api/students` | Method එකෙන් (POST) දැනටමත් "create" (හදන්න) කියලා කියනවා |
| `/deleteStudent?id=5` | `DELETE /api/students/5` | ID එක යන්න ඕනේ URL path එකටයි |

### How Express Router Works

Express Router එකෙන් එකිනෙකට සම්බන්ධ routes එක ගොඩකට දානවා (group කරනවා):

```mermaid
flowchart TD
    A["app.use('/api/auth', authRoutes)"] --> B["POST /api/auth/register → register()"]
    A --> C["POST /api/auth/login → login()"]
    A --> D["GET /api/auth/me → verifyToken → getMe()"]
    A --> E["GET /api/auth/users → verifyToken → authorizeRoles('admin') → getUsers()"]
```

### Now Let's Write the Auth Routes

`src/routes/authRoutes.js` හදන්න:

```javascript
import express from "express";
const router = express.Router();

import { register, login, getUsers, getMe } from "../controllers/authController.js";
import { verifyToken, authorizeRoles } from "../middlewares/authMiddleware.js";

// Public routes (login වෙන්න ඕනේ නෑ)
router.post("/register", register);
router.post("/login", login);

// Protected routes (login වෙන්න අනිවාර්යයි)
router.get("/me", verifyToken, getMe);

// Admin ට විතරක් යන route එක
router.get("/users", verifyToken, authorizeRoles("admin"), getUsers);

export default router;
```

**Route protection වැඩ කරන විදිහ:**

```
// Public — ඕනෑම කෙනෙක්ට යන්න පුළුවන්:
router.post("/login", login);

// Protected — අනිවාර්යයෙන්ම login වෙලා ඉන්න ඕනේ:
router.get("/me", verifyToken, getMe);
//                 ↑ මුලින්ම middleware එක run වෙනවා

// Admin only — login වෙලත් ඉන්න ඕනේ, Admin කෙනෙක් වෙන්නත් ඕනේ:
router.get("/users", verifyToken, authorizeRoles("admin"), getUsers);
//                   ↑ token එක බලනවා ↑ role එක බලනවා      ↑ ඊටපස්සේ function එක run වෙනවා
```

### Request Lifecycle — Full Picture

`GET /api/auth/users` (admin කෙනෙක් ඔක්කොම users ලව ගන්න) request එකට මොකද වෙන්නේ කියලා බලමු:

```mermaid
sequenceDiagram
    participant C as Client
    participant R as Router
    participant M as Middleware
    participant CT as Controller
    participant S as Service
    participant RP as Repository
    participant DB as Database

    C->>R: GET /api/auth/users (token එකත් එක්ක)
    R->>M: verifyToken()
    M->>M: JWT token එක check කරනවා ✅
    M->>M: authorizeRoles("admin") ✅
    M->>CT: getUsers(req, res)
    CT->>S: getAllUsers()
    S->>RP: findAllUsers()
    RP->>DB: SELECT id, name, email, role FROM users
    DB->>RP: [user1, user2, user3]
    RP->>S: [user1, user2, user3]
    S->>CT: { success: true, data: [...] }
    CT->>C: 200 OK + JSON response
```

---

## 10. 🏫 Step 9 — Building the Classroom System

දැන් අපි හරියටම කලින් pattern එකම follow කරනවා: Repository → Service → Controller → Routes. මෙතැන් ඉඳන් ඉස්සරහට, ඔයා දැනටමත් තියරි ටික දන්නවා. අපි code කරමු!

**📂 මේ step එකේදි අපි හදන files:**

```
src/
├── repositories/classroomRepository.js   (Layer 1 — Database)
├── services/classroomService.js           (Layer 2 — Logic)
├── controllers/classroomController.js     (Layer 3 — HTTP)
└── routes/classroomRoutes.js              (Layer 4 — URLs)
```

### Classroom Repository (`src/repositories/classroomRepository.js`)

```javascript
import prisma from "../config/db.js";

async function createClassroom(name, section, teacherId) {
  const classroom = await prisma.classroom.create({
    data: { name: name, section: section, teacherId: teacherId },
  });
  return classroom;
}

async function findAllClassrooms() {
  const classrooms = await prisma.classroom.findMany({
    include: {
      teacher: { select: { id: true, name: true, email: true } },
    },
  });
  return classrooms;
}

async function findClassroomById(id) {
  const classroom = await prisma.classroom.findUnique({
    where: { id: id },
    include: {
      teacher: { select: { id: true, name: true, email: true } },
      students: true,
    },
  });
  return classroom;
}

async function findClassroomsByTeacherId(teacherId) {
  const classrooms = await prisma.classroom.findMany({
    where: { teacherId: teacherId },
    include: { students: true },
  });
  return classrooms;
}

export { createClassroom, findAllClassrooms, findClassroomById, findClassroomsByTeacherId };
```

> 💡 **New Prisma concept: `include`** — මේක හරියට SQL වල JOIN එකක් වගේ. `include: { teacher: true }` කියන්නේ "මේ classroom එකට අදාල teacher වත් අරන් එන්න" කියන එකයි. Prisma එකෙන් JOIN එක automatically කරලා දෙනවා!

**Deep dive — `include` එකයි `select` එකයි එකට වැඩ කරන විදිහ තේරුම් ගනිමු:**

**`include: { teacher: { select: { id: true, name: true, email: true } } }`** — මේකෙන් Prisma ට කියනවා: "ඔයා classroom එකක් ගද්දි, `users` table එකට ගිහින් ඒකේ teacher ගේ විස්තරත් ගන්න. හැබැයි මට ඕනේ teacher ගේ id එකයි, name එකයි, email එකයි විතරයි — එයාගේ password එකවත් role එකවත් එපා." `include` නැත්නම්, ඔයාට හම්බවෙන්නේ `teacherId: 3` කියලා විතරයි (නිකම්ම අංකයක්). `include` එක්ක, ඔයාට සම්පූර්ණ teacher object එකම classroom එක ඇතුලෙම (nested විදිහට) හම්බවෙනවා.

**ඇයි අපි `findClassroomById` එකේ `include: { students: true }` පාවිච්චි කරන්නේ?** මොකද ඔයා නිශ්චිතව එක classroom එකක් විතරක් බලද්දි, ඒකේ ඉන්න ඔක්කොම students ලව ඔයාට බලන්න ඕනේ. හැබැයි ඔක්කොම classrooms වල list එකක් ගද්දි, ඔයාට හැම student කෙනෙක්වම ඕනේ නෑ — එහෙම වුණොත් ඒකෙන් ලොකු data ගොඩක් එනවා. මේක performance (කාර්යක්ෂමතාව) ගැන ගන්න තීරණයක්: ඔයාට ඕනේ දේ විතරක් ගන්න.

### Classroom Service (`src/services/classroomService.js`)

```javascript
import * as classroomRepository from "../repositories/classroomRepository.js";

async function createClassroom(name, section, teacherId) {
  if (!name || !teacherId) {
    return { success: false, message: "Classroom name එකයි teacher ID එකයි අනිවාර්යයි.", data: null };
  }
  const classroom = await classroomRepository.createClassroom(name, section, teacherId);
  return { success: true, message: "Classroom එක සාර්ථකව හැදුවා.", data: classroom };
}

async function getAllClassrooms() {
  const classrooms = await classroomRepository.findAllClassrooms();
  return { success: true, message: "Classrooms සාර්ථකව ගත්තා.", data: classrooms };
}

async function getClassroomById(id) {
  const classroom = await classroomRepository.findClassroomById(id);
  if (!classroom) {
    return { success: false, message: "Classroom එක හොයාගන්න නෑ.", data: null };
  }
  return { success: true, message: "Classroom එක සාර්ථකව ගත්තා.", data: classroom };
}

async function getClassroomsByTeacherId(teacherId) {
  const classrooms = await classroomRepository.findClassroomsByTeacherId(teacherId);
  return { success: true, message: "Teacher ගේ classrooms සාර්ථකව ගත්තා.", data: classrooms };
}
export { createClassroom, getAllClassrooms, getClassroomById, getClassroomsByTeacherId };
```

### Classroom Controller (`src/controllers/classroomController.js`)

```javascript
import * as classroomService from "../services/classroomService.js";

async function createClassroom(req, res) {
  try {
    const name = req.body.name;
    const section = req.body.section;
    const teacherId = req.body.teacherId;
    const result = await classroomService.createClassroom(name, section, teacherId);
    if (!result.success) { return res.status(400).json(result); }
    return res.status(201).json(result);
  } catch (error) {
    console.error("Create classroom error:", error);
    return res.status(500).json({ success: false, message: "මොකක් හරි වැරදුණා. කරුණාකර නැවත උත්සාහ කරන්න.", data: null });
  }
}

async function getAllClassrooms(req, res) {
  try {
    const result = await classroomService.getAllClassrooms();
    return res.status(200).json(result);
  } catch (error) {
    console.error("Get classrooms error:", error);
    return res.status(500).json({ success: false, message: "මොකක් හරි වැරදුණා. කරුණාකර නැවත උත්සාහ කරන්න.", data: null });
  }
}

async function getClassroomById(req, res) {
  try {
    const id = parseInt(req.params.id);
    const result = await classroomService.getClassroomById(id);
    if (!result.success) { return res.status(404).json(result); }
    return res.status(200).json(result);
  } catch (error) {
    console.error("Get classroom error:", error);
    return res.status(500).json({ success: false, message: "මොකක් හරි වැරදුණා. කරුණාකර නැවත උත්සාහ කරන්න.", data: null });
  }
}

async function getClassroomsByTeacher(req, res) {
  try {
    const teacherId = parseInt(req.params.teacherId);
    const result = await classroomService.getClassroomsByTeacherId(teacherId);
    return res.status(200).json(result);
  } catch (error) {
    console.error("Get teacher classrooms error:", error);
    return res.status(500).json({ success: false, message: "මොකක් හරි වැරදුණා. කරුණාකර නැවත උත්සාහ කරන්න.", data: null });
  }
}

export { createClassroom, getAllClassrooms, getClassroomById, getClassroomsByTeacher };
```

> 💡 **`parseInt(req.params.id)`** — URL parameters හැමතිස්සෙම එන්නේ strings විදිහට. `"/5"` කියන්නේ `"5"` කියන string එකක්. අපි `parseInt()` පාවිච්චි කරන්නේ මේක `5` කියන අංකය (number) බවට පත් කරන්නයි, මොකද අපේ database එක IDs විදිහට බලාපොරොත්තු වෙන්නේ numbers.

**Deep dive — `req.params` (URL Variables):**

URL එක දිහා බලන්න: `/api/classrooms/5`. අපි කොහොමද ඔය `5` ගන්නේ? 
Express වලදි, අපි route එක define කරන්නේ colon එකකින් (`:`): `/:id`. Express එකෙන් කරන්නේ අන්න ඒ තැන තියෙන ඕනෑම දෙයක් අරන් ඒක `req.params.id` කියන එකට දාන එකයි. ඒක හරියට URL එකේ තියෙන variable එකක් වගේ. URL එක `/api/classrooms/apple` වුණොත්, `req.params.id` එක `"apple"` වෙනවා. ඒ නිසයි `parseInt()` ගොඩක් වැදගත් වෙන්නේ — එයා `"5"` කියන string එක ඇත්ත අංකයක් (5) කරනවා, එතකොට Prisma ට පුළුවන් ඒක database එකෙන් හොයාගන්න.


### Classroom Routes (`src/routes/classroomRoutes.js`)

```javascript
import express from "express";
const router = express.Router();
import { createClassroom, getAllClassrooms, getClassroomById, getClassroomsByTeacher } from "../controllers/classroomController.js";
import { verifyToken, authorizeRoles } from "../middlewares/authMiddleware.js";

router.post("/", verifyToken, authorizeRoles("admin"), createClassroom);
router.get("/", verifyToken, getAllClassrooms);
router.get("/:id", verifyToken, getClassroomById);
router.get("/teacher/:teacherId", verifyToken, getClassroomsByTeacher);

export default router;
```

**Deep dive — Express Routes තේරුම් ගනිමු:**

**`express.Router()`** — මේක හරියට "mini-app" එකක් වගේ කියලා හිතන්න. අපි ළඟ තියෙන routes 100 ම අපේ ප්‍රධාන `server.js` file එකට දානවා වෙනුවට (එහෙම කරොත් ඒක ලොකු අවුල් ජාලයක් වෙනවා), අපි ඒවා කාණ්ඩ (categories) විදිහට වෙන් කරනවා. `classroomRoutes.js` file එකෙන් කරන්නේ classroom වලට අදාල URLs විතරක් handle කරන එකයි. පස්සේ අපි මේ mini-app එක අපේ ප්‍රධාන server එකට plug කරනවා.

**`router.get("/:id", ...)`** — මෙතන තියෙන colon එක (`:`) නිසා මේක dynamic URL parameter එකක් වෙනවා. ඒකෙන් කියන්නේ "මෙතනට එන ඕනම දෙයක් match කරගන්න" කියන එකයි.
- `/api/classrooms/1` → Matches! `req.params.id` එක 1 යි
- `/api/classrooms/99` → Matches! `req.params.id` එක 99 යි
- `/api/classrooms/new` → Matches! (Routes දෙන පිළිවෙල වැදගත් වෙන්නේ මේකයි — dynamic routes වලට කලින් නිශ්චිත routes දෙන්න ඕනේ)

**The middleware chain (Middleware දාමය):**
මේ දිහා බලන්න: `router.post("/", verifyToken, authorizeRoles("admin"), createClassroom);`. Express මේවා run කරන්නේ වමේ ඉඳන් දකුණටයි:
1. මුලින්ම, `verifyToken` එකෙන් wristband එක (JWT එක) check කරනවා. ඒක වැරදිනම්, එතනින්ම නවතිනවා.
2. ඊළඟට, `authorizeRoles` එකෙන් බලනවා මෙයා admin කෙනෙක්ද කියලා. එයා teacher කෙනෙක් නම්, එතනින් නවතිනවා.
3. අන්තිමට, `createClassroom` එකෙන් ඇත්තම database වැඩේ කරනවා.

---

## 11. 👩‍🎓 Step 10 — Building the Student System

**📂 මේ step එකේදි අපි හදන files:**

```
src/
├── repositories/studentRepository.js     (Layer 1 — Database)
├── services/studentService.js             (Layer 2 — Logic)
├── controllers/studentController.js       (Layer 3 — HTTP)
└── routes/studentRoutes.js                (Layer 4 — URLs)
```

### Student Repository (`src/repositories/studentRepository.js`)

```javascript
import prisma from "../config/db.js";

async function createStudent(name, email, registrationNumber, classroomId) {
  const student = await prisma.student.create({
    data: { name, email, registrationNumber, classroomId },
  });
  return student;
}

async function findAllStudents() {
  const students = await prisma.student.findMany({
    include: { classroom: { select: { id: true, name: true, section: true } } },
  });
  return students;
}

async function findStudentById(id) {
  const student = await prisma.student.findUnique({
    where: { id: id },
    include: { classroom: true },
  });
  return student;
}

async function findStudentsByClassroomId(classroomId) {
  const students = await prisma.student.findMany({ where: { classroomId: classroomId } });
  return students;
}

export { createStudent, findAllStudents, findStudentById, findStudentsByClassroomId };
```

### Student Service (`src/services/studentService.js`)

```javascript
import * as studentRepository from "../repositories/studentRepository.js";

async function createStudent(name, email, registrationNumber, classroomId) {
  if (!name || !email || !registrationNumber || !classroomId) {
    return { success: false, message: "ඔක්කොම fields අනිවාර්යයි: name, email, registrationNumber, classroomId.", data: null };
  }
  const student = await studentRepository.createStudent(name, email, registrationNumber, classroomId);
  return { success: true, message: "Student කෙනෙක් සාර්ථකව හැදුවා.", data: student };
}

async function getAllStudents() {
  const students = await studentRepository.findAllStudents();
  return { success: true, message: "Students ලව සාර්ථකව ගත්තා.", data: students };
}

async function getStudentById(id) {
  const student = await studentRepository.findStudentById(id);
  if (!student) { return { success: false, message: "Student ව හොයාගන්න නෑ.", data: null }; }
  return { success: true, message: "Student විස්තර සාර්ථකව ගත්තා.", data: student };
}

async function getStudentsByClassroomId(classroomId) {
  const students = await studentRepository.findStudentsByClassroomId(classroomId);
  return { success: true, message: "Students ලව සාර්ථකව ගත්තා.", data: students };
}

export { createStudent, getAllStudents, getStudentById, getStudentsByClassroomId };
```

**Deep dive — the "Early Return" pattern:**

`getStudentById` දිහා බලන්න:
```javascript
if (!student) { return { success: false, ... }; }
return { success: true, ... };
```
අපි මෙතන `else` එකක් පාවිච්චි කරන්නේ නෑ! ඒ ඇයි? මොකද `return` කලාම ඒ function එක එතනින්ම නවතිනවා. Student ව හොයාගන්න බැරිවුණොත්, ඒකෙන් error එක return කරලා එතනින්ම STOPS වෙනවා. ඒක නැවතුනේ නැත්නම්, ඊළඟට තියෙන success පේළියට දිගටම යනවා.

මේකට කියන්නේ **"Early Return"** එහෙමත් නැත්නම් "Bouncer" pattern එක කියලයි. ඔයාගේ සම්පූර්ණ function එක ලොකු `if / else` blocks ඇතුලේ දානවට වඩා මේක ගොඩක් ලස්සනයි (clean). මේක හරියට club එකක දොර ගාව ඉන්න bouncer කෙනෙක් වගේ කියලා හිතන්න: ඔයාට ID එකක් නැත්නම්, එයා ඔයාව එතනින්ම එළියට දානවා (`return`). ඔයාට ID එකක් තියෙනවා නම්, එයා "නැත්නම් ඔයාට ඇතුළට යන්න පුළුවන් (else you can go in)" කියලා කියන්න ඕනේ නෑ — ඔයා නිකම්ම එයා පහුකරගෙන යනවා!

### Student Controller (`src/controllers/studentController.js`)

```javascript
import * as studentService from "../services/studentService.js";

async function createStudent(req, res) {
  try {
    const { name, email, registrationNumber, classroomId } = req.body;
    const result = await studentService.createStudent(name, email, registrationNumber, classroomId);
    if (!result.success) { return res.status(400).json(result); }
    return res.status(201).json(result);
  } catch (error) {
    console.error("Create student error:", error);
    return res.status(500).json({ success: false, message: "මොකක් හරි වැරදුණා.", data: null });
  }
}

async function getAllStudents(req, res) {
  try {
    const result = await studentService.getAllStudents();
    return res.status(200).json(result);
  } catch (error) {
    console.error("Get students error:", error);
    return res.status(500).json({ success: false, message: "මොකක් හරි වැරදුණා.", data: null });
  }
}

async function getStudentById(req, res) {
  try {
    const id = parseInt(req.params.id);
    const result = await studentService.getStudentById(id);
    if (!result.success) { return res.status(404).json(result); }
    return res.status(200).json(result);
  } catch (error) {
    console.error("Get student error:", error);
    return res.status(500).json({ success: false, message: "මොකක් හරි වැරදුණා.", data: null });
  }
}

async function getStudentsByClassroom(req, res) {
  try {
    const classroomId = parseInt(req.params.classroomId);
    const result = await studentService.getStudentsByClassroomId(classroomId);
    return res.status(200).json(result);
  } catch (error) {
    console.error("Get classroom students error:", error);
    return res.status(500).json({ success: false, message: "මොකක් හරි වැරදුණා.", data: null });
  }
}

export { createStudent, getAllStudents, getStudentById, getStudentsByClassroom };
```

**Deep dive — `import * as` syntax:**

Controller එකේ උඩින්ම අපි මෙහෙම ලිව්වා: `import * as studentService from "../services/studentService.js";`

කලින් Auth වලදි අපි පාවිච්චි කලේ: `import { loginUser, registerUser } from ...`

මේ දෙකේ වෙනස මොකක්ද?
- `{ loginUser }` කියන්නේ "ඒ file එක ඇතුලට ගිහින්, මේ නිශ්චිත function එක විතරක් අරන් මෙතනට ගේන්න" කියන එකයි.
- `* as studentService` කියන්නේ "ඒ file එකෙන් export කරලා තියෙන ඔක්කොම ටික අරන්, ඒ ඔක්කොම `studentService` කියන ලොකු පෙට්ටියකට දාන්න" කියන එකයි.

අපිට function එකක් පාවිච්චි කරන්න ඕනේ වුණාම, අපි ඒ පෙට්ටිය අරිනවා: `studentService.createStudent(...)`. File එකකින් දේවල් ගොඩක් export කරද්දි සහ අපිට ඒවා පැහැදිලි එක නමක් යටතේ පිළිවෙලකට තියාගන්න ඕනේ වුණාම අපි මේක පාවිච්චි කරනවා. මේකෙන් `createStudent` කියන එක එන්නේ service layer එකෙන් මිසක් මේක ඇතුලේ තියෙන සාමාන්‍ය function එකක් නෙවෙයි කියලා පැහැදිලිව පේනවා.

### Student Routes (`src/routes/studentRoutes.js`)

```javascript
import express from "express";
const router = express.Router();
import { createStudent, getAllStudents, getStudentById, getStudentsByClassroom } from "../controllers/studentController.js";
import { verifyToken, authorizeRoles } from "../middlewares/authMiddleware.js";

router.post("/", verifyToken, authorizeRoles("admin", "teacher"), createStudent);
router.get("/", verifyToken, getAllStudents);
router.get("/:id", verifyToken, getStudentById);
router.get("/classroom/:classroomId", verifyToken, getStudentsByClassroom);

export default router;
```

---

## 12. 📝 Step 11 — Building the Attendance System

මේක තමයි ගොඩක්ම වැදගත් system එක. Teachers ලා හැමදාම attendance mark කරන්න පාවිච්චි කරන්නේ මේකයි.

**📂 මේ step එකේදි අපි හදන files:**

```
src/
├── repositories/attendanceRepository.js   (Layer 1 — Database)
├── services/attendanceService.js           (Layer 2 — Logic)
├── controllers/attendanceController.js     (Layer 3 — HTTP)
└── routes/attendanceRoutes.js              (Layer 4 — URLs)
```

### Attendance Repository (`src/repositories/attendanceRepository.js`)

```javascript
import prisma from "../config/db.js";

async function createAttendance(studentId, classroomId, date, status, markedBy) {
  const record = await prisma.attendance.create({
    data: { studentId, classroomId, date: new Date(date), status, markedBy },
  });
  return record;
}

async function findAttendanceByClassroomAndDate(classroomId, date) {
  const records = await prisma.attendance.findMany({
    where: { classroomId, date: new Date(date) },
    include: { student: { select: { id: true, name: true, registrationNumber: true } } },
  });
  return records;
}

async function findAttendanceByStudentId(studentId) {
  const records = await prisma.attendance.findMany({
    where: { studentId },
    include: { classroom: { select: { id: true, name: true } } },
    orderBy: { date: "desc" },
  });
  return records;
}

async function findExistingAttendance(studentId, date) {
  const existing = await prisma.attendance.findFirst({
    where: { studentId, date: new Date(date) },
  });
  return existing;
}

export { createAttendance, findAttendanceByClassroomAndDate, findAttendanceByStudentId, findExistingAttendance };
```

> 💡 **`new Date(date)`** — Date එක එන්නේ `"2026-04-28"` වගේ string එකක් විදිහටයි. අපි ඒක Prisma වලට දෙන්න JavaScript `Date` object එකක් බවට පත් කරනවා.

> 💡 **`orderBy: { date: "desc" }`** — අලුත්ම ඒවා මුලින්ම පෙන්නන්න order කරනවා. `"desc"` = descending (අවරෝහණ), `"asc"` = ascending (ආරෝහණ).

### Attendance Service (`src/services/attendanceService.js`)

```javascript
import * as attendanceRepository from "../repositories/attendanceRepository.js";

async function markAttendance(studentId, classroomId, date, status, markedBy) {
  if (!studentId || !classroomId || !date || !status || !markedBy) {
    return { success: false, message: "ඔක්කොම fields අනිවාර්යයි: studentId, classroomId, date, status.", data: null };
  }

  const allowedStatuses = ["present", "absent", "late"];
  if (!allowedStatuses.includes(status)) {
    return { success: false, message: "Status එක 'present', 'absent', හෝ 'late' වෙන්න ඕනේ.", data: null };
  }

  // Duplicates තියෙනවද බලනවා — student කෙනෙක්ට දවසකට තියෙන්න පුළුවන් එක record එකයි
  const existing = await attendanceRepository.findExistingAttendance(studentId, date);
  if (existing) {
    return { success: false, message: "මේ දවසට අදාලව මේ student ට දැනටමත් attendance mark කරලා තියෙන්නේ.", data: null };
  }

  const record = await attendanceRepository.createAttendance(studentId, classroomId, date, status, markedBy);
  return { success: true, message: "Attendance සාර්ථකව mark කළා.", data: record };
}

async function markBulkAttendance(attendanceList, markedBy) {
  if (!attendanceList || attendanceList.length === 0) {
    return { success: false, message: "Attendance list එක හිස් වෙන්න බෑ.", data: null };
  }

  const results = [];
  const errors = [];

  for (let i = 0; i < attendanceList.length; i++) {
    const item = attendanceList[i];
    const result = await markAttendance(item.studentId, item.classroomId, item.date, item.status, markedBy);
    if (result.success) {
      results.push(result.data);
    } else {
      errors.push({ studentId: item.studentId, error: result.message });
    }
  }

  return { success: true, message: results.length + " saved, " + errors.length + " errors.", data: { saved: results, errors: errors } };
}

async function getAttendanceByClassroomAndDate(classroomId, date) {
  if (!classroomId || !date) {
    return { success: false, message: "Classroom ID එකයි date එකයි අනිවාර්යයි.", data: null };
  }
  const records = await attendanceRepository.findAttendanceByClassroomAndDate(classroomId, date);
  return { success: true, message: "Attendance records සාර්ථකව ගත්තා.", data: records };
}

async function getAttendanceByStudentId(studentId) {
  const records = await attendanceRepository.findAttendanceByStudentId(studentId);
  return { success: true, message: "Student ගේ attendance history එක සාර්ථකව ගත්තා.", data: records };
}

export { markAttendance, markBulkAttendance, getAttendanceByClassroomAndDate, getAttendanceByStudentId };
```

**Deep dive — Bulk Attendance logic එක තේරුම් ගනිමු:**

**Bulk attendance එකක් ඕනේ ඇයි?** Teacher කෙනෙක් attendance mark කරද්දි වෙන වෙනම බට්න් 30ක් ඔබන්නේ නෑ. එයාලා grid එකක මුළු පන්තියෙම attendance එකපාර mark කරලා "Save" ඔබනවා. එතකොට frontend එකෙන් records තියෙන array එකක් (list එකක්) යවනවා.

**`for` loop එක:**
```javascript
for (let i = 0; i < attendanceList.length; i++) {
  const item = attendanceList[i];
  const result = await markAttendance(...);
}
```
මේක සාමාන්‍ය loop එකක්, හැබැයි මේක ඇතුලේ තියෙන `await` එක ගැන බලන්න. මේකෙන් වෙන්නේ හැම student කෙනෙක් ගාවදිම loop එක PAUSES (නවතින්න) වෙනවා, database එක ඒ student ව save කරලා ඉවරවෙනකම් බලන් ඉඳලා, ඊටපස්සේ තමයි ඊළඟ එක්කෙනාට යන්නේ.

**Arrays දෙකක් තියෙන්නේ ඇයි (`results` සහ `errors`):**
5 වෙනි student ට attendance mark කරද්දි fail වුණොත් (සමහරවිට අද දවසට කලින් mark කරලා ඇති), අපි මුළු loop එකම crash කරලා ඉතුරු 6 ඉඳන් 30 වෙනකම් ඉන්න students ලව අතහරින්න ඕනේ නෑ! ඒ වෙනුවට, අපි ඒ fail වුණු student ව `errors` array එකට දාලා, දිගටම ඉස්සරහට යනවා. අන්තිමේදී, අපි මේ lists දෙකම return කරනවා, එතකොට frontend එකට පුළුවන් teacher ට මෙහෙම පෙන්නන්න: "29ක් සාර්ථකව save කළා, හැබැයි නිමල් ගේ එක fail වුණා."

**Bulk attendance flow:**

```mermaid
flowchart TD
    A["Teacher student attendance\nrecords ටිකක් යවනවා"] --> B["හැම student කෙනෙක්ම හරහා\nloop වෙනවා"]
    B --> C{"දැනටමත් අද දවසට\nmark කරලාද?"}
    C -->|"ඔව්"| D["Errors list එකට දානවා"]
    C -->|"නෑ"| E["Database එකට save කරනවා"]
    E --> F["Results list එකට දානවා"]
    D --> G{"තව students ලා ඉන්නවද?"}
    F --> G
    G -->|"ඔව්"| B
    G -->|"නෑ"| H["Results return කරනවා:\nSave වුණු ගාණ සහ Errors ගාණ"]
```

### Attendance Controller (`src/controllers/attendanceController.js`)

```javascript
import * as attendanceService from "../services/attendanceService.js";

async function markAttendance(req, res) {
  try {
    const { studentId, classroomId, date, status } = req.body;
    const markedBy = req.user.userId; // Auth middleware එකෙන්!
    const result = await attendanceService.markAttendance(studentId, classroomId, date, status, markedBy);
    if (!result.success) { return res.status(400).json(result); }
    return res.status(201).json(result);
  } catch (error) {
    console.error("Mark attendance error:", error);
    return res.status(500).json({ success: false, message: "මොකක් හරි වැරදුණා.", data: null });
  }
}

async function markBulkAttendance(req, res) {
  try {
    const attendanceList = req.body.attendanceList;
    const markedBy = req.user.userId;
    const result = await attendanceService.markBulkAttendance(attendanceList, markedBy);
    if (!result.success) { return res.status(400).json(result); }
    return res.status(201).json(result);
  } catch (error) {
    console.error("Bulk attendance error:", error);
    return res.status(500).json({ success: false, message: "මොකක් හරි වැරදුණා.", data: null });
  }
}

async function getAttendanceByClassroom(req, res) {
  try {
    const classroomId = parseInt(req.params.classroomId);
    const date = req.query.date;
    const result = await attendanceService.getAttendanceByClassroomAndDate(classroomId, date);
    if (!result.success) { return res.status(400).json(result); }
    return res.status(200).json(result);
  } catch (error) {
    console.error("Get classroom attendance error:", error);
    return res.status(500).json({ success: false, message: "මොකක් හරි වැරදුණා.", data: null });
  }
}

async function getAttendanceByStudent(req, res) {
  try {
    const studentId = parseInt(req.params.studentId);
    const result = await attendanceService.getAttendanceByStudentId(studentId);
    return res.status(200).json(result);
  } catch (error) {
    console.error("Get student attendance error:", error);
    return res.status(500).json({ success: false, message: "මොකක් හරි වැරදුණා.", data: null });
  }
}

export { markAttendance, markBulkAttendance, getAttendanceByClassroom, getAttendanceByStudent };
```

> 💡 **`req.user.userId`** — `verifyToken` middleware එකෙන් decode කරපු JWT data ටික `req.user` එකට දානවා. ඉතින් `req.user.userId` කියන්නේ login වෙලා ඉන්න teacher ගේ ID එකයි. අපි මේක `markedBy` field එකට ඉබේම (automatically) පාවිච්චි කරනවා — එතකොට teacher ට ඒක වෙනම එවන්න ඕනේ නෑ!

> 💡 **`req.query.date`** — `/api/attendance/classroom/1?date=2026-04-28` කියන URL එකේදි, `req.query.date` එක `"2026-04-28"` ට සමාන වෙනවා. URL එකක තියෙන `?` සලකුණෙන් තමයි "query string" එකක් පටන් ගන්නේ.

**Deep dive — `req.params` vs `req.query` vs `req.body`:**

මේක තමයි beginners ලට පැටලෙන ප්‍රධානම තැන! ඔයා කොයි වෙලාවටද මොකක් පාවිච්චි කරන්නේ?

| Express code | Data තියෙන්නේ කොහෙද? | Analogy | පාවිච්චි කරන්නේ කොයි වෙලාවටද |
|--------------|-------------------|---------|----------------|
| `req.body` | POST request එකේ හැංගිලා තියෙන data ඇතුලේ | ලියුම් කවරයේ ඇතුලේ තියෙන දේවල් | ලොකු data යවද්දි (user කෙනෙක් හදන්න, passwords, bulk arrays) |
| `req.params` | URL path එකේම කොටසක් විදිහට (`/users/5`) | දොරක ගහලා තියෙන කාමර අංකය | නිශ්චිතම resource එකක් අඳුරගන්න (5 වෙනි user ව ගන්න, 10 වෙනි post එක මකන්න) |
| `req.query` | URL එකේ `?` එකට පස්සේ (`?date=today`) | Shopping site එකක තියෙන filter options වගේ | දේවල් ගොඩකින් (LIST එකකින්) search කරන්න, filter කරන්න, හරි sort කරන්න (මේ දවසට විතරක් attendance පෙන්නන්න) |

`getAttendanceByClassroom(req, res)` එක ඇතුලේ:
- අපිට දැනගන්න ඕනේ මොන (WHICH) classroom එක ගැනද කියලා. ඒක නිශ්චිත resource එකක්. ඒ නිසා අපි `req.params.classroomId` පාවිච්චි කරනවා (`/classroom/1` කියන URL එකෙන් එන).
- අපිට date එකෙන් FILTER කරන්න ඕනේ. ඒ නිසා අපි `req.query.date` පාවිච්චි කරනවා (`?date=2026-04-28` කියන එකෙන් එන).

### Attendance Routes (`src/routes/attendanceRoutes.js`)
```javascript
import express from "express";
const router = express.Router();
import { markAttendance, markBulkAttendance, getAttendanceByClassroom, getAttendanceByStudent } from "../controllers/attendanceController.js";
import { verifyToken, authorizeRoles } from "../middlewares/authMiddleware.js";

router.post("/", verifyToken, authorizeRoles("admin", "teacher"), markAttendance);
router.post("/bulk", verifyToken, authorizeRoles("admin", "teacher"), markBulkAttendance);
router.get("/classroom/:classroomId", verifyToken, getAttendanceByClassroom);
router.get("/student/:studentId", verifyToken, getAttendanceByStudent);

export default router;
```

---

## 13. 🌐 Step 12 — The Main Server File & CORS

### ❌ The Problem — Browser Blocks Your Frontend!

ඔයාගේ React app එක `http://localhost:3000` වල තියෙනවා කියලා හිතන්න. ඔයාගේ API එක run වෙන්නේ `http://localhost:5000` වල. ඔයා React එකෙන් API එකට කතා කරන්න හැදුවොත්, browser එක ඒ request එක **block** කරනවා (නවත්තනවා)!

```mermaid
flowchart LR
    A["React App\nlocalhost:3000"] -->|"Request"| B["Browser\n(Security Check)"]
    B -->|"❌ BLOCKED!\nවෙනස් port එකක් = වෙනස් origin එකක්"| C["Express API\nlocalhost:5000"]
```

**ඇයි එහෙම වෙන්නේ?** Browsers වල **CORS** (Cross-Origin Resource Sharing) කියලා ආරක්ෂක නීතියක් තියෙනවා: website එකකට කතා කරන්න පුළුවන් එයා ආපු server එකත් එක්ක විතරයි. වෙනස් port එකක් කියන්නේ වෙනස් origin එකක් = ඒ නිසා block වෙනවා.

### ✅ The Solution — cors() middleware

`cors` package එකෙන් browser එකට කියනවා: "මේක අවුලක් නෑ, වෙන origins වලින් එන requests වලට ඉඩ දෙන්න."

```mermaid
flowchart LR
    A["React App\nlocalhost:3000"] -->|"Request"| B["Browser\n(Security Check)"]
    B -->|"✅ ALLOWED!\ncors() එකෙන් ඉඩදෙනවා"| C["Express API\nlocalhost:5000"]
```

### Now Let's Create the Server File

හැබැයි ඊට කලින්, විසඳගන්න තව එක ප්‍රශ්නයක් තියෙනවා...

### ❌ The Problem — Silent Failures from Missing .env Variables

හිතන්න student කෙනෙක්ට එයාගේ `.env` file එකට `JWT_SECRET` එක දාන්න අමතක වෙනවා කියලා. මොකද වෙන්නේ?

```mermaid
flowchart TD
    A["Student run කරනවා: npm run dev"] --> B["Server එක සාර්ථකව start වෙනවා! ✅"]
    B --> C["Student හිතනවා ඔක්කොම හරි කියලා 😊"]
    C --> D["Student login වෙන්න හදනවා..."]
    D --> E["💥 CRASH: secretOrPrivateKey\nmust have a value"]
    E --> F["😱 වැරදි file එකක් දිහා බලන්\nStudent විනාඩි 30ක් රස්තියාදු වෙනවා"]
```

Server එක start වෙද්දි `JWT_SECRET` එක ඕනේ නැති නිසා ඒක කිසි අවුලක් නැතුව start වෙනවා — ඒක ඕනේ වෙන්නේ කවුරුහරි ඇත්තටම login වෙන්න හැදුවොත් විතරයි. ඒ කියන්නේ මේ error එක එන්නේ **ගොඩක් පස්සේ**, code එකේ සම්පූර්ණයෙන්ම වෙනස් තැනකදි. මේක beginners ලට ගොඩක් ව්‍යාකූලයි!

### ✅ The Solution — Fail-Fast Validation

**Fail-Fast** කියන්නේ: "මොකක් හරි වැරැද්දක් තියෙනවා නම්, පැහැදිලි error message එකක් එක්ක වහාම (IMMEDIATELY) fail වෙන්න." පස්සේ ප්‍රශ්නයක් වෙනකම් බලන් ඉන්න එපා.

අපි `server.js` එකේ උඩින්ම check එකක් දානවා. අනිවාර්ය environment variables අඩුනම්, server එක start වෙන එක ප්‍රතික්ෂේප කරලා හරියටම මොකක්ද වැරැද්ද කියලා ඔයාට කියනවා:

```mermaid
flowchart TD
    A["Server එක start වෙනවා"] --> B{"ඔක්කොම .env variables\nතියෙනවද?"}
    B -->|"ඔව් ✅"| C["දිගටම start වෙනවා...\nServer එක සාමාන්‍ය විදිහට වැඩ"]
    B -->|"නෑ ❌"| D["console.error: Missing variables!"]
    D --> E["process.exit(1)\nServer එක වහාම නවතිනවා"]
    E --> F["Student ට එතනම error එක පේනවා\nඑතකොට හරියටම හදන්න ඕනේ මොකක්ද කියලා දන්නවා ✅"]
```

`src/server.js` හදන්න:

```javascript
// Step 1: Environment variables load කරනවා (මේක අනිවාර්යයෙන්ම මුලින්ම තියෙන්න ඕනේ!)
import "dotenv/config";

// Step 2: අනිවාර්ය environment variables ටික තියෙනවද බලනවා (Fail-Fast!)
const requiredEnvVars = ["DATABASE_URL", "JWT_SECRET"];
const missingVars = requiredEnvVars.filter(function (varName) {
  return !process.env[varName];
});

if (missingVars.length > 0) {
  console.error("❌ අනිවාර්ය environment variables අඩුයි:");
  console.error("   " + missingVars.join(", "));
  console.error("");
  console.error("   කරුණාකර ඔයාගේ .env file එක check කරන්න!");
  process.exit(1); // Server එක වහාම නවත්තනවා
}

// Step 3: Packages import කරනවා
import express from "express";
import cors from "cors";

// Step 4: අපේ route files import කරනවා
import authRoutes from "./routes/authRoutes.js";
import classroomRoutes from "./routes/classroomRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";

// Step 5: Express app එක හදනවා
const app = express();

// Step 6: Middleware දානවා
app.use(cors());          // React frontend එකට කතා කරන්න ඉඩ දෙනවා
app.use(express.json());  // JSON request bodies කියවන්න පුළුවන් කරනවා

// Step 7: Routes ටික connect කරනවා
app.use("/api/auth", authRoutes);
app.use("/api/classrooms", classroomRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/attendance", attendanceRoutes);

// Step 8: Test route එක
app.get("/", function (req, res) {
  res.json({
    success: true,
    message: "designHer 2.0 Attendance API එක වැඩ කරනවා!",
    data: null,
  });
});

// Step 9: Server එක start කරනවා
const PORT = process.env.PORT || 5000;
app.listen(PORT, function () {
  console.log("");
  console.log("==============================================");
  console.log("  designHer 2.0 Attendance API");
  console.log(`  Server is running on http://localhost:${PORT}`);
  console.log("==============================================");
  console.log("");
});
```

**පේළියෙන් පේළියට පැහැදිලි කිරීම:**

| Line | What It Does |
|------|-------------|
| `import "dotenv/config"` | `.env` file එක `process.env` එකට load කරනවා. අනිවාර්යයෙන්ම පළවෙනියට තියෙන්න ඕනේ! |
| `const app = express()` | අලුත් Express application එකක් හදනවා |
| `app.use(cors())` | Cross-origin requests වලට ඉඩ දෙනවා (CORS errors හදනවා) |
| `app.use(express.json())` | Express වලට JSON bodies (`req.body`) තේරුම් ගන්න පුළුවන් කරනවා |
| `app.use("/api/auth", authRoutes)` | `authRoutes` වල තියෙන හැම route එකක්ම පටන් ගන්නේ `/api/auth` වලින් |
| `app.listen(PORT, ...)` | Port 5000 න් server එක start කරනවා |

**Deep dive — මැජික් එකක් වගේ `app.use()`:**

Express වලදි, `app.use()` කියන්නේ ඔයා global middleware pipeline එකට දේවල් දාන විදිහයි. ඔයාගේ server එකට එන හැම request එකක්ම මේ pipeline එකේ උඩ ඉඳන් පල්ලෙහාට යනවා.

**`app.use(cors())`**
CORS කියන්නේ හරියට වෙන ගම්වලින් එන අයට අකමැති club එකක bouncer කෙනෙක් වගේ කියලා හිතන්න. React frontend එක (`localhost:3000` වල තියෙන) Express backend එකට (`localhost:5000` වල තියෙන) කතා කරන්න හැදුවොත්, browser එක ඒක block කරන්නේ ඒගොල්ලෝ වෙනස් "ගම්" දෙකක (ports වල) ඉන්න නිසයි. `cors()` වලින් browser එකට කියනවා: "කමක් නෑ, ඕනෑම කෙනෙක්ට ඇතුළට එන්න දෙන්න."

**`app.use(express.json())`**
සාමාන්‍යයෙන්, Express එකට මුකුත් තේරෙන්නේ නෑ. Frontend එකෙන් POST request එකක `{ "name": "Nimal" }` කියලා එව්වොත්, Express එක දකින්නේ නිකම්ම අවුල්සහගත අකුරු ගොඩක් (raw text bytes) විතරයි. `express.json()` එකෙන් request එක මැදින් පැනලා, ඒ අකුරු ටික කියවලා, ඒක ලස්සන JavaScript object එකක් කරලා `req.body` එකට attach කරනවා. මේ පේළිය නැත්නම්, `req.body` එක හැමතිස්සෙම `undefined` වෙනවා, එතකොට ඔයාගේ app එක වැඩ කරන්නේ නෑ!

**`app.use("/api/auth", authRoutes)`**
මේකෙන් කරන්නේ අපේ "mini-apps" (routers) ටික සවි කරන එකයි. මේකෙන් Express එකට කියනවා: "URL එක `/api/auth` වලින් පටන් ගන්නවා නම්, මෙතනින් හොයන එක නවත්තලා ඉතුරු ටික කරගන්න `authRoutes` file එකට දෙන්න." මේක නිසා අපේ app එක කොච්චර ලොකු වුණත් `server.js` එක හැමතිස්සෙම clean එකට තියෙනවා!

### How Frontend Will Talk to This Backend

```mermaid
sequenceDiagram
    participant U as User
    participant R as React App
    participant A as Our API
    participant D as Database

    U->>R: "Login" button එක ඔබනවා
    R->>A: POST /api/auth/login { email, password }
    A->>D: Email එකෙන් user ව හොයනවා
    D->>A: User ව හම්බවුණා
    A->>R: { success: true, data: { token: "..." } }
    R->>R: Token එක localStorage එකේ save කරගන්නවා

    U->>R: "Students" page එකට යනවා
    R->>A: GET /api/students (header එකේ token එකත් එක්ක)
    A->>A: Token එක verify කරනවා ✅
    A->>D: SELECT * FROM students
    D->>A: [student1, student2, ...]
    A->>R: { success: true, data: [...] }
    R->>U: Screen එකේ student list එක පෙන්නනවා
```

---

## 14. 🚀 Step 13 — Running the Server

### Quick Checklist

- [x] MySQL `attendance_system_db` database එකත් එක්ක run වෙනවා (Day 1 වලින්)
- [x] Seed data ඇතුලත් කරලා තියෙනවා (Day 1 වලින්)
- [x] ඔයාගේ ඇත්ත MySQL password එක එක්ක `.env` file එක තියෙනවා
- [x] ඔක්කොම source code files හදලා තියෙනවා

### Install, Generate, and Run

```bash
npm install
npx prisma generate
npm run dev
```

ඔයාට මේක පේන්න ඕනේ:

```
==============================================
  designHer 2.0 Attendance API
  Server is running on http://localhost:5000
==============================================
```

Browser එකේ `http://localhost:5000/` යන්න. ඔයාට මේක පේන්න ඕනේ:

```json
{ "success": true, "message": "designHer 2.0 Attendance API එක වැඩ කරනවා!", "data": null }
```

### Common Errors and Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| `Cannot find module 'express'` | Packages install වෙලා නෑ | `npm install` run කරන්න |
| `P1001: Can't reach database server` | MySQL run වෙන්නේ නෑ | XAMPP එකේ MySQL start කරන්න |
| `Invalid prisma.user.findUnique() invocation` | Prisma client generate වෙලා නෑ | `npx prisma generate` run කරන්න |
| `Error: secretOrPrivateKey must have a value` | `JWT_SECRET` එක `.env` එකේ නෑ | ඔයාගේ `.env` file එක check කරන්න |
| `Port 5000 is already in use` | වෙන server එකක් run වෙනවා | `.env` එකේ PORT එක 5001 කරන්න |

---

## 15. 🧪 Step 14 — Testing with Postman

### What is Postman?

Postman කියන්නේ APIs test කරන්න පාවිච්චි කරන free tool එකක්. අපි මුලින්ම React frontend එක හදනවා වෙනුවට, අපේ API එක වැඩද කියලා බලන්න HTTP requests යවන්න අපි Postman පාවිච්චි කරනවා.

> 🎯 **Analogy:** Postman කියන්නේ හරියට restaurant එකට (අපේ API එකට) ගිහින්ම order කරනවා වෙනුවට කෝල් කරලා order කරන්න පාවිච්චි කරන ෆෝන් එකක් වගේ.

**Download:** [https://www.postman.com/downloads/](https://www.postman.com/downloads/)

### Test 1: Server Health Check

```
Method: GET
URL:    http://localhost:5000/
```

Expected: `200 OK` — `{ "success": true, "message": "designHer 2.0 Attendance API එක වැඩ කරනවා!" }`

### Test 2: Login as Admin

```
Method: POST
URL:    http://localhost:5000/api/auth/login
Body → raw → JSON:
```
```json
{ "email": "amara@school.com", "password": "admin123" }
```

Expected: `200 OK` එක්ක `token` එකක්. **⭐ මේ TOKEN එක COPY කරගන්න! ඉස්සරහට තියෙන හැම test එකකටම මේක ඕනේ.**

### Test 3: Login as Teacher

```
Method: POST
URL:    http://localhost:5000/api/auth/login
Body:
```
```json
{ "email": "nimal@school.com", "password": "teacher123" }
```

### Test 4: Register a New User

```
Method: POST
URL:    http://localhost:5000/api/auth/register
Body:
```
```json
{ "name": "Kavitha Perera", "email": "kavitha@school.com", "password": "mypassword123", "role": "teacher" }
```

Expected: `201 Created`

### Protected Routes වලට JWT Token එක Add කරන්නේ කොහොමද

1. **Headers** tab එක click කරන්න
2. Key: `Authorization`
3. Value: `Bearer <ඔයාගේ-token-එක-මෙතන-paste-කරන්න>`

```
✅ Correct: Bearer eyJhbGciOiJIUzI1NiIs...
❌ Wrong:   BearereyJhbGciOiJIUzI1NiIs...    (space එකක් නෑ!)
❌ Wrong:   eyJhbGciOiJIUzI1NiIs...          ("Bearer" කෑල්ල නෑ)
```

> 💡 **Tip:** Postman වල, **Authorization** tab එක click කරන්න → **Bearer Token** තෝරන්න → token එක විතරක් paste කරන්න. Postman එකෙන් automatically "Bearer " කෑල්ල එකතු කරනවා.

### Test 5: Get My Info

```
GET http://localhost:5000/api/auth/me  +  Authorization header එක
```

### Test 6: Get All Users (Admin Only)

```
GET http://localhost:5000/api/auth/users  +  Admin token එක
```
> ⚠️ Teacher token එකක් එක්ක try කරලා බලන්න — ඔයාට `403 Forbidden` එනවා!

### Test 7: Get All Classrooms

```
GET http://localhost:5000/api/classrooms  +  Token එක
```

### Test 8: Create a Classroom (Admin Only)

```
POST http://localhost:5000/api/classrooms  +  Admin token එක
Body:
```
```json
{ "name": "Batch 2026 - Data Science", "section": "Afternoon", "teacherId": 2 }
```

### Test 9: Get All Students

```
GET http://localhost:5000/api/students  +  Token එක
```

### Test 10: Create a Student

```
POST http://localhost:5000/api/students  +  Token එක
Body:
```
```json
{ "name": "Dilshan Wickramasinghe", "email": "dilshan@student.com", "registrationNumber": "STU-2026-005", "classroomId": 1 }
```

### Test 11: Mark Attendance

```
POST http://localhost:5000/api/attendance  +  Token එක
Body:
```
```json
{ "studentId": 1, "classroomId": 1, "date": "2026-05-01", "status": "present" }
```
> ⚠️ මේ request එකම ආපහු යවලා බලන්න — ඔයාට එනවා: "මේ දවසට අදාලව මේ student ට දැනටමත් attendance mark කරලා තියෙන්නේ."

### Test 12: Bulk Attendance

```
POST http://localhost:5000/api/attendance/bulk  +  Token එක
Body:
```
```json
{
  "attendanceList": [
    { "studentId": 1, "classroomId": 1, "date": "2026-05-02", "status": "present" },
    { "studentId": 2, "classroomId": 1, "date": "2026-05-02", "status": "late" }
  ]
}
```

### Test 13: Get Classroom Attendance by Date

```
GET http://localhost:5000/api/attendance/classroom/1?date=2026-04-28  +  Token එක
```

### Test 14: Get Student Attendance History

```
GET http://localhost:5000/api/attendance/student/1  +  Token එක
```

### Test 15: Error Cases

| Test | Expected |
|------|----------|
| `POST /api/auth/login` වැරදි password එකක් එක්ක | `401` — "Invalid email or password." |
| `GET /api/students` token එකක් නැතුව | `401` — "Access denied. Token එකක් දීලා නෑ." |
| `POST /api/classrooms` teacher token එකක් එක්ක | `403` — "Access denied. ඔයාට මේක කරන්න අවසර නෑ." |
| `POST /api/auth/register` දැනටමත් තියෙන email එකක් එක්ක | `400` — "මේ email එකෙන් දැනටමත් user කෙනෙක් ඉන්නවා." |
| `POST /api/attendance` `"status": "sick"` එක්ක | `400` — "Status එක 'present', 'absent', හෝ 'late' වෙන්න ඕනේ." |

### Testing Flow Summary

```mermaid
flowchart TD
    A["1. Server එක start කරන්න\nnpm run dev"] --> B["2. Health එක බලන්න\nGET /"]
    B --> C["3. Login වෙන්න\nPOST /api/auth/login"]
    C --> D["4. TOKEN එක copy කරන්න"]
    D --> E["5. Headers වලට token එක දාන්න"]
    E --> F["6. GET endpoints test කරන්න"]
    F --> G["7. POST endpoints test කරන්න"]
    G --> H["8. Error cases test කරන්න"]
```

---

## 🎉 Congratulations! You Did It!

ඔයා මුල ඉඳන්ම සම්පූර්ණ REST API එකක් හැදුවා! මේ තියෙන්නේ ඔයා අද ඉගෙනගත්ත දේවල්:

| Topic | What You Learned |
|-------|-----------------|
| **Environment Variables** | `.env` පාවිච්චි කරලා secrets ආරක්ෂා කරගන්න විදිහ (ප්‍රශ්නය: hardcoded passwords) |
| **Prisma ORM** | JavaScript පාවිච්චි කරලා database එකත් එක්ක කතා කරන විදිහ (ප්‍රශ්නය: raw SQL ලියන එක අමාරුයි) |
| **Async/Await** | Slow වෙන දේවල් වලට JavaScript ට ඉවසන් ඉන්න කියන විදිහ (ප්‍රශ්නය: JS ට ඉවසීමක් නෑ) |
| **Password Security** | bcrypt වලින් hashing කරන විදිහ (ප්‍රශ්නය: plain text passwords = ලොකු විනාශයක්) |
| **JWT Tokens** | දිගටම login වෙලා ඉන්න විදිහ (ප්‍රශ්නය: හැම request එකකදිම HTTP ට ඔයාව අමතක වෙනවා) |
| **HTTP Fundamentals** | Requests, Responses, Methods, Status Codes ගැන |
| **Error Handling** | try/catch වලින් server එක crash වෙන එක නතර කරන විදිහ (ප්‍රශ්නය: අල්ලගන්නේ නැති errors = crash වෙනවා) |
| **Authentication** | ඔයා කවුද කියලා තහවුරු කරන විදිහ (ප්‍රශ්නය: ඕනම කෙනෙක්ට ඕනම දේකට යන්න පුළුවන්) |
| **Authorization** | ඔයාට කරන්න පුළුවන් මොනවද කියලා තහවුරු කරන විදිහ (ප්‍රශ්නය: teachers ලා admin වැඩ කරනවා) |
| **REST API Design** | HTTP methods එක්ක resources පාදක කරගත්ත URLs හදන විදිහ |
| **CORS** | Frontend එකට backend එකත් එක්ක කතා කරන්න ඉඩ දෙන විදිහ (ප්‍රශ්නය: browser එකෙන් requests block කරනවා) |
| **Layered Architecture** | Route → Middleware → Controller → Service → Repository |

> **Next up (Day 3):** අපි මේ API එකට connect වෙන React frontend එක හදන්නයි යන්නේ! අපි මේ endpoints වලට කතා කරන්න `fetch()` පාවිච්චි කරනවා, JWT token එක localStorage එකේ save කරනවා, ඊටපස්සේ attendance dashboard එක හදනවා.

---

## 📦 Final package.json

```json
{
  "name": "designher-attendance-api",
  "version": "1.0.0",
  "description": "REST API for designHer 2.0 Student Attendance Management System",
  "main": "src/server.js",
  "type": "module",
  "scripts": {
    "dev": "nodemon src/server.js",
    "start": "node src/server.js"
  },
  "dependencies": {
    "@prisma/client": "^6.6.0",
    "bcrypt": "^5.1.1",
    "cors": "^2.8.5",
    "dotenv": "^16.4.7",
    "express": "^4.21.2",
    "jsonwebtoken": "^9.0.2"
  },
  "devDependencies": {
    "nodemon": "^3.1.9",
    "prisma": "^6.6.0"
  }
}
```

---

## 📋 Quick Prisma Cheat Sheet

මෙතන තියෙන්නේ නිතරම පාවිච්චි වෙන Prisma methods ටික. ඔයාට database query එකක් ලියන්න ඕනේ වුණාම මේක බලන්න පුළුවන්!

| Prisma Method | What It Does | Example |
|---------------|-------------|--------|
| `findUnique()` | Unique field එකකින් (id, email) එක record එකක් හොයනවා | `prisma.user.findUnique({ where: { id: 1 } })` |
| `findFirst()` | Condition එකට ගැළපෙන පළවෙනි record එක හොයනවා | `prisma.attendance.findFirst({ where: { studentId: 1, date: new Date("2026-05-01") } })` |
| `findMany()` | ගැළපෙන ඔක්කොම records හොයනවා (`where` නැත්නම් ඔක්කොම) | `prisma.student.findMany({ where: { classroomId: 1 } })` |
| `create()` | අලුත් record එකක් ඇතුලත් කරනවා | `prisma.user.create({ data: { name: "Nimal", email: "nimal@school.com", password: "hashed...", role: "teacher" } })` |
| `update()` | තියෙන record එකක් වෙනස් කරනවා | `prisma.user.update({ where: { id: 1 }, data: { name: "New Name" } })` |
| `delete()` | Record එකක් DELETE කරනවා | `prisma.student.delete({ where: { id: 5 } })` |

### Common Prisma Options

| Option | What It Does | Example |
|--------|-------------|--------|
| `where` | Filter — මොන records ද හොයන්නේ | `where: { email: "nimal@school.com" }` |
| `select` | Return කරන්න ඕනේ fields මොනවද තෝරනවා | `select: { id: true, name: true, email: true }` |
| `include` | සම්බන්ධ වෙන records ත් ගේනවා (SQL JOIN වගේ) | `include: { classroom: true }` |
| `orderBy` | Results ටික පිළිවෙලකට හදනවා (sort) | `orderBy: { date: "desc" }` |
| `data` | Save කරන්න ඕනේ values (create/update වලට) | `data: { name: "Nimal", email: "n@s.com" }` |

### select vs include — කොයි වෙලාවටද මොකක්ද පාවිච්චි කරන්නේ?

```javascript
// SELECT: "මට මේ table එකෙන් සමහර fields විතරයි ඕනේ"
const users = await prisma.user.findMany({
  select: {
    id: true,
    name: true,
    email: true,
    // password එක select කරලා නෑ — ඒක හැංගිලාම තියෙනවා!
  },
});

// INCLUDE: "මට මේකේ ඔක්කොම fields + වෙන table එකකින් සම්බන්ධ records ඕනේ"
const classroom = await prisma.classroom.findUnique({
  where: { id: 1 },
  include: {
    teacher: true,   // Teacher වත් ගන්න (users table එකෙන්)
    students: true,  // මේ පන්තියේ ඉන්න ඔක්කොම students ලවත් ගන්න
  },
});

// COMBINE: "මට සම්බන්ධ records ඕනේ, හැබැයි ඒකෙන් සමහර fields විතරයි"
const students = await prisma.student.findMany({
  include: {
    classroom: {
      select: { id: true, name: true },  // Classroom id එකයි name එකයි විතරක් ගන්න
    },
  },
});
```

> 💡 **Tip:** ඔයාට ප්‍රධාන මට්ටමේදී (top level) එකවර `select` සහ `include` දෙකම පාවිච්චි කරන්න බෑ. මොකක් හරි එකක් තෝරගන්න. හැබැයි උඩ පෙන්නුවා වගේ `include` එකක් ඇතුලේ `select` එකක් දාන්න පුළුවන්!

---

> Made with ❤️ for **designHer 2.0 Bootcamp 2026**
