# 🚀 Student Attendance Management System — Backend API Guide

> **Day 2 of designHer 2.0 Bootcamp**
> Today we build the backend REST API using Node.js, Express, and Prisma!

---

## 📖 Table of Contents

1. [What We Are Building Today](#1--what-we-are-building-today)
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

Yesterday (Day 1), we built the **database** — the storage box for our data.

Today (Day 2), we build the **backend API** — the brain that reads, writes, and protects our data.

Tomorrow (Day 3), we build the **frontend** — the face that users see.

```mermaid
flowchart LR
    A["👩‍💻 React Frontend\n(Day 3)"] -->|"HTTP Requests"| B["⚙️ Express Backend\n(Day 2 — TODAY!)"]
    B -->|"Prisma Queries"| C["🗄️ MySQL Database\n(Day 1)"]
```

### The Architecture — Layered Design

Our backend is organized into **layers**. Each layer has ONE job. Think of it like a restaurant:

```mermaid
flowchart TD
    A["🌐 Client\n(Postman / React App)"] -->|"HTTP Request"| B
    B["🛣️ Route Layer\n(The front desk — directs you)\nauthRoutes.js"] -->|"Calls"| C
    C["🛡️ Middleware\n(The security guard — checks your ID)\nauthMiddleware.js"] -->|"Approved"| D
    D["🎮 Controller Layer\n(The waiter — takes your order)\nauthController.js"] -->|"Calls"| E
    E["🧠 Service Layer\n(The chef — cooks the food)\nauthService.js"] -->|"Calls"| F
    F["📦 Repository Layer\n(The fridge — stores ingredients)\nauthRepository.js"] -->|"SQL Query"| G
    G["🗄️ Database\n(MySQL)"]
```

| Layer | Restaurant Analogy | Job |
|-------|-------------------|-----|
| **Route** | Front desk | Directs the request to the right place |
| **Middleware** | Security guard | Checks if you are allowed in |
| **Controller** | Waiter | Takes the order, gives the response |
| **Service** | Chef | Does the real work (logic, rules) |
| **Repository** | Fridge | Gets data from storage (database) |

> 💡 **Why layers?** If you put everything in one file, it becomes messy "spaghetti code." Layers keep things clean. If you want to change how passwords work, you ONLY edit the Service. The Controller and Repository stay the same.

### Our Complete API — What We Will Build

| # | Method | URL | Who Can Use | What It Does |
|---|--------|-----|-------------|-------------|
| 1 | POST | `/api/auth/register` | Anyone | Create a new account |
| 2 | POST | `/api/auth/login` | Anyone | Login and get a token |
| 3 | GET | `/api/auth/me` | Logged-in users | Get your own info |
| 4 | GET | `/api/auth/users` | Admin only | Get all users |
| 5 | POST | `/api/classrooms` | Admin only | Create a classroom |
| 6 | GET | `/api/classrooms` | Logged-in users | Get all classrooms |
| 7 | GET | `/api/classrooms/:id` | Logged-in users | Get one classroom |
| 8 | GET | `/api/classrooms/teacher/:teacherId` | Logged-in users | Get teacher's classrooms |
| 9 | POST | `/api/students` | Admin, Teacher | Add a student |
| 10 | GET | `/api/students` | Logged-in users | Get all students |
| 11 | GET | `/api/students/:id` | Logged-in users | Get one student |
| 12 | GET | `/api/students/classroom/:classroomId` | Logged-in users | Get students in a class |
| 13 | POST | `/api/attendance` | Admin, Teacher | Mark one student's attendance |
| 14 | POST | `/api/attendance/bulk` | Admin, Teacher | Mark many students at once |
| 15 | GET | `/api/attendance/classroom/:id?date=...` | Logged-in users | Get class attendance for a date |
| 16 | GET | `/api/attendance/student/:id` | Logged-in users | Get student's attendance history |

Now let's start building! 🚀

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

This creates a `package.json` file — the ID card of our project.

### Install the packages we need

```bash
npm install express cors dotenv bcrypt jsonwebtoken @prisma/client
npm install --save-dev prisma nodemon
```

**What is each package?**

| Package | What It Does |
|---------|-------------|
| `express` | Creates the web server and handles routes |
| `cors` | Allows the React frontend to talk to our backend |
| `dotenv` | Loads secret passwords from a `.env` file |
| `bcrypt` | Hashes passwords so they are safe |
| `jsonwebtoken` | Creates login tokens (JWT) |
| `@prisma/client` | Talks to our MySQL database |
| `prisma` | Tool to set up database models |
| `nodemon` | Restarts the server automatically when you save a file |

### Update package.json

Open `package.json` and add `"type": "module"` and update the scripts:

```json
  "main": "src/server.js",
  "type": "module",
  "scripts": {
    "dev": "nodemon src/server.js",
    "start": "node src/server.js"
  }
```

- `"type": "module"` — Lets us use modern `import`/`export` syntax instead of the older `require()`.
- `npm run dev` — Runs the server with auto-restart (for development)
- `npm start` — Runs the server normally (for production)

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

Imagine you write this in your code:

```javascript
// ❌ DANGER! Your real MySQL password is in the code!
const database = connectToMySQL("root", "MySecretPassword123");
const jwtSecret = "super-secret-key-12345";
```

Now you push this to GitHub. **What happens?**

```mermaid
flowchart TD
    A["😊 You push code\nto GitHub"] --> B["🌍 Code is PUBLIC\non the internet"]
    B --> C["😈 Hacker finds\nyour password"]
    C --> D["💀 DISASTER!"]
    D --> E["Hacker deletes\nyour database"]
    D --> F["Hacker steals\nall user data"]
    D --> G["Hacker uses your\nserver for crypto mining"]
```

> ⚠️ **This happens every single day.** Real companies have lost millions of dollars because developers accidentally pushed passwords to GitHub. GitHub has bots that scan for exposed passwords within seconds of a push.

### ✅ The Solution — Environment Variables (.env)

Instead of writing passwords in the code, we put them in a **secret file** called `.env` that NEVER gets pushed to GitHub.

```mermaid
flowchart LR
    A[".env file\n(SECRET — stays on your laptop)"] -->|"dotenv loads it"| B["process.env\n(available in your code)"]
    C[".env.example\n(TEMPLATE — pushed to GitHub)"] -->|"Shows the format"| D["Other developers\nknow what to fill in"]
```

### Create the `.env` file

Create a file called `.env` in the `backend/` folder:

```env
# Database Connection
DATABASE_URL="mysql://root:YOUR_MYSQL_PASSWORD@localhost:3306/attendance_system_db"

# JWT Secret Key (any random string — make it long!)
JWT_SECRET="designher-bootcamp-2026-super-secret-key"

# Server Port
PORT=5000
```

> ⚠️ Replace `YOUR_MYSQL_PASSWORD` with your actual MySQL password.

### Create the `.env.example` file

This file is a **template** that you push to GitHub. It shows other developers what variables they need, but without the real values:

```env
# Database Connection
DATABASE_URL="mysql://root:YOUR_PASSWORD@localhost:3306/attendance_system_db"

# JWT Secret Key
JWT_SECRET="your-secret-key-here"

# Server Port
PORT=5000
```

### Create the `.gitignore` file

This tells Git to NEVER push certain files:

```
node_modules/
.env
```

### How to use environment variables in code

```javascript
// ✅ SAFE! The real password is in .env, not in the code
import "dotenv/config"; // Load .env file

const secret = process.env.JWT_SECRET;   // Reads from .env
const dbUrl = process.env.DATABASE_URL;  // Reads from .env
```

```mermaid
flowchart LR
    A["Your Code\n(on GitHub)"] -->|"process.env.JWT_SECRET"| B["Reads from .env\n(NOT on GitHub)"]
    B --> C["Gets the real value\ndesignher-bootcamp-2026-..."]
```

> 💡 **Rule:** NEVER write passwords, API keys, or secret tokens directly in your code. Always use `.env`.

---

## 4. 🗄️ Step 3 — Connecting to the Database with Prisma

### ❌ The Problem — Writing Raw SQL is Painful

On Day 1, you wrote SQL queries like this:

```sql
SELECT s.name, s.registration_number, a.status
FROM students s
INNER JOIN attendance a ON s.id = a.student_id
WHERE a.classroom_id = 1 AND a.date = '2026-04-28';
```

Now imagine writing these SQL strings inside JavaScript:

```javascript
// ❌ This is ugly, hard to read, and easy to make mistakes!
const result = await connection.query(
  "SELECT s.name, s.registration_number, a.status FROM students s INNER JOIN attendance a ON s.id = a.student_id WHERE a.classroom_id = " + classroomId + " AND a.date = '" + date + "'"
);
// Plus: SQL injection attacks can hack your database! 😱
```

**Problems with raw SQL in JavaScript:**
1. Hard to read and write
2. Easy to make typos (no autocomplete)
3. Vulnerable to SQL injection attacks
4. No error checking until you run it

### ✅ The Solution — Prisma ORM

**Prisma** is an ORM (Object-Relational Mapper). It lets you talk to the database using JavaScript instead of SQL.

```javascript
// ✅ Clean, safe, and easy to read!
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
    A["Your JavaScript Code"] -->|"prisma.user.findMany()"| B["Prisma ORM\n(translates for you)"]
    B -->|"SELECT * FROM users"| C["MySQL Database"]
```

### Set up Prisma

```bash
npx prisma init
```

This creates a `prisma/` folder with a `schema.prisma` file.

### Create the Prisma schema

Open `prisma/schema.prisma` and replace with:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

// User model — maps to the "users" table
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

// Classroom model — maps to the "classrooms" table
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

// Student model — maps to the "students" table
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

// Attendance model — maps to the "attendance" table
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

**What does each part mean?**

| Prisma Code | What It Does |
|-------------|-------------|
| `@id` | This field is the primary key |
| `@default(autoincrement())` | Auto-generates 1, 2, 3... |
| `@unique` | No two records can have the same value |
| `@map("teacher_id")` | JavaScript uses `teacherId` but the database column is `teacher_id` |
| `@@map("users")` | JavaScript uses `User` but the database table is `users` |
| `@relation` | Defines a relationship between tables (like FOREIGN KEY) |
| `@@unique([studentId, date])` | A student can only have ONE attendance record per day |

### Generate the Prisma Client

```bash
npx prisma generate
```

This creates the Prisma client code that we can use in our JavaScript files.

### Create the database connection file

Create `src/config/db.js`:

```javascript
// Import PrismaClient from the Prisma package
import { PrismaClient } from "@prisma/client";

// Create a new Prisma client instance
const prisma = new PrismaClient();

// Export it so other files can use it
export default prisma;
```

> 💡 **`export default`** — This is how we share code between files in modern JavaScript (ESM). We create the Prisma client ONCE here, and `import` it in every file that needs to talk to the database.

```mermaid
flowchart TD
    A["db.js\n(Creates ONE Prisma client)"] --> B["authRepository.js\nimport prisma from db.js"]
    A --> C["classroomRepository.js\nimport prisma from db.js"]
    A --> D["studentRepository.js\nimport prisma from db.js"]
    A --> E["attendanceRepository.js\nimport prisma from db.js"]
```

---

## 5. 🔐 Step 4 — Auth Repository & Async/Await

Now we start building! We begin with the **Auth system** — login, register, and security.

We will build it layer by layer: Repository → Service → Controller → Middleware → Routes.

### ❌ The Problem — JavaScript Does NOT Wait!

Before we write our first database query, you need to understand something very important about JavaScript.

JavaScript is **impatient**. When you ask it to do something slow (like talking to a database), it does NOT wait. It moves to the next line immediately.

```javascript
// ❌ This does NOT work! JavaScript is impatient!
function getUser() {
  const user = database.findUser("nimal@school.com"); // Takes 100ms...
  console.log(user); // Runs IMMEDIATELY — doesn't wait!
  // Result: undefined 😱
}
```

```mermaid
flowchart LR
    A["Line 1:\nAsk database"] --> B["Line 2:\nconsole.log(user)"]
    B --> C["Result: undefined!\nDatabase hasn't replied yet"]
    A -.->|"100ms later..."| D["Database reply arrives\nBut it's too late!"]
```

### ✅ The Solution — async/await

`async/await` tells JavaScript: **"WAIT here until this finishes."**

```javascript
// ✅ This works! JavaScript WAITS for the database!
async function getUser() {
  const user = await database.findUser("nimal@school.com"); // WAIT here!
  console.log(user); // Runs AFTER the database responds!
  // Result: { name: "Nimal", email: "nimal@school.com" } ✅
}
```

```mermaid
flowchart LR
    A["Line 1:\nawait database query"] -->|"Waits 100ms..."| B["Database replies!"]
    B --> C["Line 2:\nconsole.log(user)\nNow has the real data ✅"]
```

**Three simple rules:**
1. Add `async` before the function name
2. Add `await` before any slow operation (database queries, API calls)
3. `await` can ONLY be used inside an `async` function

### Now let's write the Auth Repository

This file ONLY talks to the database. It does NOT know about HTTP, passwords, or tokens.

Create `src/repositories/authRepository.js`:

```javascript
import prisma from "../config/db.js";
```

**⏸️ Wait — what does `"../config/db.js"` mean?**

When you import a file, you use a **relative path** — directions from the current file to the target file. This confuses many beginners, so let's break it down:

| Symbol | Meaning | Analogy |
|--------|---------|---------|
| `./` | Current folder | "Look in the room I am in right now" |
| `../` | Go up one folder (parent) | "Go out the door, then look" |
| `../../` | Go up two folders | "Go out two doors" |

**Example:** We are in `src/repositories/authRepository.js` and want to import `src/config/db.js`:

```
src/
├── config/
│   └── db.js            ← We want to reach HERE
├── repositories/
│   └── authRepository.js  ← We are HERE
```

```
Step 1: ../ → Go up from repositories/ to src/
Step 2: config/ → Go into the config folder
Step 3: db.js → Find the file

Result: "../config/db.js"
```

```mermaid
flowchart LR
    A["authRepository.js\nin repositories/"] -->|"../ = go up to src/"| B["src/"]
    B -->|"config/ = enter folder"| C["config/"]
    C -->|"db.js = the file"| D["db.js ✅"]
```

> ⚠️ **ESM Rule:** In modern JavaScript (ESM), you MUST include the `.js` file extension in your imports. `"../config/db"` will NOT work — it must be `"../config/db.js"`. This is different from CommonJS `require()` which allows omitting extensions.

Now back to the code! Here is the full `authRepository.js`:

```javascript
import prisma from "../config/db.js";

// Find a user by their email address
async function findUserByEmail(email) {
  const user = await prisma.user.findUnique({
    where: {
      email: email,
    },
  });
  return user;
}

// Find a user by their ID
async function findUserById(id) {
  const user = await prisma.user.findUnique({
    where: {
      id: id,
    },
  });
  return user;
}

// Create a new user in the database
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

// Get all users (without passwords!)
async function findAllUsers() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      // We do NOT select password — never send passwords!
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

**Prisma methods explained:**

| Prisma Method | What It Does | SQL Equivalent |
|---------------|-------------|----------------|
| `prisma.user.findUnique()` | Find ONE record by a unique field | `SELECT * FROM users WHERE email = ?` |
| `prisma.user.findMany()` | Find ALL matching records | `SELECT * FROM users` |
| `prisma.user.create()` | Insert a new record | `INSERT INTO users VALUES (...)` |

> ⚠️ **Security:** In `findAllUsers`, we use `select` to choose which fields to return. We NEVER return the `password` field! If we did, anyone calling this API could see everyone's passwords.

---

## 6. 🔑 Step 5 — Auth Service: Passwords & JWT

The Service layer handles the **business logic** — the rules and decisions. This is where we deal with password security and login tokens.

### ❌ The Problem — Saving Passwords as Plain Text

Let's say you build a register function and save the password directly:

```javascript
// ❌ NEVER DO THIS! Saving password as plain text!
async function registerUser(name, email, password) {
  const user = await createUser(name, email, password, "teacher");
  // Database now stores: password = "teacher123"
  // Anyone who sees the database can read it!
}
```

**What is the disaster?**

```mermaid
flowchart TD
    A["😊 User registers with\npassword: teacher123"] --> B["📦 Database stores:\npassword = teacher123"]
    B --> C["😈 Hacker breaks into\nyour database"]
    C --> D["💀 Hacker sees ALL passwords\nin plain text!"]
    D --> E["🔓 Hacker logs in\nas any user"]
    D --> F["🌐 Hacker tries same password\non Gmail, Facebook, Bank..."]
    D --> G["📰 Your app is in\nthe news for a data breach"]
```

> ⚠️ **Real example:** In 2012, LinkedIn was hacked. 6.5 million passwords were stolen. Many were stored as weak hashes. Users who reused passwords had their other accounts compromised too.

### ✅ The Solution — Hashing with bcrypt

**Hashing** is a one-way transformation. You can turn a password into a hash, but you can **NEVER turn a hash back into a password**. It is like a meat grinder — you can turn meat into a burger, but you cannot turn a burger back into meat.

```mermaid
flowchart LR
    A["teacher123\n(plain text)"] -->|"bcrypt.hash()"| B["$2b$10$VxB/Z1jc...\n(hashed — cannot reverse!)"]
    B -.->|"❌ IMPOSSIBLE\nto reverse"| A
```

```
Plain Password:  teacher123
Hashed Password: $2b$10$VxB/Z1jcdUDt2rNG7V6bWenRA0afyXCPPxyMwRJ6RxX7gKWQzkl4e
```

**What is salting?** A "salt" is random text added to the password before hashing. Even if two users have the same password, their hashes will be different!

```
User 1: "teacher123" + random_salt_abc → $2b$10$Abc...
User 2: "teacher123" + random_salt_xyz → $2b$10$Xyz...  (Different!)
```

**How does login work if we can't reverse the hash?**

We use `bcrypt.compare()`. It hashes the typed password with the same salt and checks if the result matches:

```mermaid
flowchart TD
    A["User types: teacher123"] --> B["bcrypt hashes it\nwith stored salt"]
    B --> C{"Does new hash\nmatch stored hash?"}
    C -->|"Yes ✅"| D["Password correct!\nLogin successful"]
    C -->|"No ❌"| E["Wrong password!\nLogin denied"]
```

### ❌ The Next Problem — HTTP is Stateless

OK, the user logged in. But HTTP has a problem: **it forgets you immediately**.

```mermaid
sequenceDiagram
    participant U as User
    participant S as Server

    U->>S: POST /login (email + password)
    S->>U: ✅ Login successful!

    U->>S: GET /students
    S->>U: ❌ Who are you?? I don't know you!
    Note right of S: HTTP forgets you after<br/>every request!
```

HTTP is like a goldfish — it has no memory. Every request is brand new. The server has no idea that you just logged in 2 seconds ago.

### ✅ The Solution — JWT Tokens (Digital ID Cards)

**JWT** (JSON Web Token) is like a digital ID card. After login, the server creates a token and gives it to you. You show this token with every future request.

```mermaid
sequenceDiagram
    participant U as User
    participant S as Server

    U->>S: POST /login (email + password)
    S->>S: Check password ✅
    S->>S: Create JWT token
    S->>U: Here's your token: eyJhbG...

    U->>S: GET /students (+ token in header)
    S->>S: Verify token ✅ — Ah, you're User 1, Admin!
    S->>U: Here's the student list!
```

**What does a JWT token look like?**

```
eyJhbGciOiJIUzI1NiIs.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiJ9.abc123signature

It has 3 parts separated by dots:
Part 1: Header    → algorithm info
Part 2: Payload   → your data: { userId: 1, role: "admin" }
Part 3: Signature → proof that the token was created by OUR server
```

> 💡 **Analogy:** JWT is like a concert wristband. When you enter (login), the bouncer checks your ticket and gives you a wristband. After that, you just show your wristband to get into any area. You don't need to show your ticket again.

> 🛠️ **Debugging Tool — jwt.io:** Want to see what is INSIDE a JWT token? Go to [https://jwt.io](https://jwt.io). Paste your token into the "Encoded" box, and it will instantly show you the decoded Header and Payload! This is extremely useful when debugging login problems. For example, you can check: Is the `userId` correct? Is the `role` right? Has the token expired? Bookmark this website — you will use it a lot!

```mermaid
flowchart LR
    A["Copy your token\neyJhbGciOiJ..."] -->|"Paste at jwt.io"| B["See decoded data:\nuserId: 1\nrole: admin\nexp: 1714358400"]
    B --> C["Debug your problems!\nWrong userId? Wrong role?\nToken expired?"]
```

### Now Let's Write the Auth Service

Create `src/services/authService.js`:

```javascript
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { findUserByEmail, createUser, findAllUsers } from "../repositories/authRepository.js";

// Register a new user
async function registerUser(name, email, password, role) {
  // Step 1: Check if email already exists
  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    return {
      success: false,
      message: "A user with this email already exists.",
      data: null,
    };
  }

  // Step 2: Hash the password (NEVER save plain text!)
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  // Step 3: Save to database (with HASHED password)
  const newUser = await createUser(name, email, hashedPassword, role);

  // Step 4: Return success (without password!)
  return {
    success: true,
    message: "User registered successfully.",
    data: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
    },
  };
}

// Login a user
async function loginUser(email, password) {
  // Step 1: Find user by email
  const user = await findUserByEmail(email);
  if (!user) {
    return {
      success: false,
      message: "Invalid email or password.",
      data: null,
    };
  }

  // Step 2: Compare password with stored hash
  const isPasswordCorrect = await bcrypt.compare(password, user.password);
  if (!isPasswordCorrect) {
    return {
      success: false,
      message: "Invalid email or password.",
      data: null,
    };
  }

  // Step 3: Create JWT token
  const tokenPayload = {
    userId: user.id,
    role: user.role,
  };
  const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
    expiresIn: "24h",
  });

  // Step 4: Return token and user info
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

// Get all users (for admin)
async function getAllUsers() {
  const users = await findAllUsers();
  return {
    success: true,
    message: "Users retrieved successfully.",
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
    A["User sends name, email, password"] --> B{"Does email\nalready exist?"}
    B -->|"Yes"| C["Return error:\nEmail already exists"]
    B -->|"No"| D["Hash password\nwith bcrypt"]
    D --> E["Save user\nto database"]
    E --> F["Return success\n(without password!)"]
```

**Login flow:**

```mermaid
flowchart TD
    A["User sends email, password"] --> B{"Does user\nexist?"}
    B -->|"No"| C["Return error:\nInvalid credentials"]
    B -->|"Yes"| D{"Does password\nmatch hash?"}
    D -->|"No"| C
    D -->|"Yes"| E["Create JWT token"]
    E --> F["Return token + user info"]
```

> 💡 **Security tip:** We say "Invalid email or password" for BOTH wrong email and wrong password. This way, a hacker cannot tell if an email exists in our system. If we said "Email not found," the hacker would know which emails are registered.

---

## 7. 📡 Step 6 — Auth Controller: HTTP & Error Handling

The Controller layer handles **HTTP** — it reads the request and sends the response. Before we write it, let's learn what HTTP actually is.

### What is HTTP?

HTTP is the language that browsers and servers speak. Every time you visit a website, your browser sends an HTTP **request**, and the server sends back an HTTP **response**.

```mermaid
flowchart LR
    A["👩‍💻 Client\n(Browser / Postman)"] -->|"HTTP Request\nGET /api/students"| B["⚙️ Server\n(Our Express API)"]
    B -->|"HTTP Response\n200 OK + JSON data"| A
```

**A request has these parts:**

| Part | Example | Purpose |
|------|---------|---------|
| **Method** | GET, POST, PUT, DELETE | What action to perform |
| **URL** | `/api/students/5` | Which resource to access |
| **Headers** | `Authorization: Bearer token...` | Extra info (like your ID card) |
| **Body** | `{ "name": "Nimal", "email": "..." }` | Data you are sending |

**A response has these parts:**

| Part | Example | Purpose |
|------|---------|---------|
| **Status Code** | 200, 201, 400, 401, 404, 500 | Was it successful or not? |
| **Body** | `{ "success": true, "data": [...] }` | The data being sent back |

**Common status codes:**

| Code | Meaning | When to Use |
|------|---------|------------|
| `200` | OK | Request was successful |
| `201` | Created | A new record was created |
| `400` | Bad Request | Client sent wrong data |
| `401` | Unauthorized | Not logged in (no token) |
| `403` | Forbidden | Logged in but not allowed |
| `404` | Not Found | Resource does not exist |
| `500` | Server Error | Something broke on our side |

**How we read data from requests in Express:**

| Source | How to Read | Example |
|--------|------------|---------|
| Request body (JSON) | `req.body.email` | Data sent in POST requests |
| URL parameter | `req.params.id` | `/api/students/5` → `req.params.id = "5"` |
| Query string | `req.query.date` | `/api/attendance?date=2026-04-28` → `req.query.date` |
| Headers | `req.headers.authorization` | The JWT token |

### ❌ The Problem — No Error Handling = Server Crash

What if the database is down? What if the user sends bad data? Without error handling, your server **crashes**:

```javascript
// ❌ DANGEROUS! If the database is down, this CRASHES the entire server!
async function getUsers(req, res) {
  const users = await getAllUsers();  // 💥 Database error!
  return res.status(200).json(users); // This line never runs
  // Server crashes. ALL users lose access. 😱
}
```

```mermaid
flowchart TD
    A["Request comes in"] --> B["Call database"]
    B --> C["💥 Database is down!"]
    C --> D["❌ Unhandled Error"]
    D --> E["🔥 ENTIRE SERVER CRASHES"]
    E --> F["ALL users get errors\nUntil someone restarts the server"]
```

### ✅ The Solution — try/catch

`try/catch` is like a safety net. If anything goes wrong inside `try`, the code jumps to `catch` instead of crashing:

```javascript
// ✅ SAFE! If anything goes wrong, we catch it and send a nice error
async function getUsers(req, res) {
  try {
    const users = await getAllUsers();
    return res.status(200).json(users);
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again.",
      data: null,
    });
  }
}
```

```mermaid
flowchart TD
    A["Request comes in"] --> B["TRY: Call database"]
    B --> C{"Did it work?"}
    C -->|"Yes ✅"| D["Send 200 OK\nwith data"]
    C -->|"No ❌"| E["CATCH: Send 500 Error\nwith friendly message"]
    E --> F["Server keeps running!\nOther users are not affected ✅"]
```

> 💡 **Rule:** Every controller function MUST have `try/catch`. This prevents the server from crashing when something goes wrong.

### Now Let's Write the Auth Controller

Create `src/controllers/authController.js`:

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
        message: "Name, email, and password are required.",
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
      message: "Something went wrong. Please try again.",
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
        message: "Email and password are required.",
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
      message: "Something went wrong. Please try again.",
      data: null,
    });
  }
}

// GET /api/auth/users (admin only)
async function getUsers(req, res) {
  try {
    const result = await getAllUsers();
    return res.status(200).json(result);
  } catch (error) {
    console.error("Get users error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again.",
      data: null,
    });
  }
}

// GET /api/auth/me (any logged-in user)
async function getMe(req, res) {
  try {
    return res.status(200).json({
      success: true,
      message: "User info retrieved successfully.",
      data: {
        id: req.user.userId,
        role: req.user.role,
      },
    });
  } catch (error) {
    console.error("Get me error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again.",
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

> 💡 **Notice the pattern:** Every controller function does the same 3 things: (1) Read data from `req`, (2) Call the service, (3) Send `res` with the right status code. Always wrapped in `try/catch`.

---

## 8. 🛡️ Step 7 — Auth Middleware: Protecting Routes

### ❌ The Problem — Anyone Can Access Everything!

Right now, if someone sends `GET /api/students`, they get the data — even without logging in. And a teacher could delete classrooms meant for admins only. There is NO protection.

```mermaid
flowchart LR
    A["😈 Hacker\n(no login)"] -->|"GET /api/students"| B["Server"]
    B -->|"Here's all the data!"| A
```

We need to answer TWO questions for every request:

| Question | Name | Example |
|----------|------|---------|
| WHO are you? | **Authentication** | Checking the JWT token |
| WHAT can you do? | **Authorization** | Admin can create classrooms. Teacher cannot. |

### ✅ The Solution — Middleware (Security Guards)

A **middleware** is a function that runs BEFORE the controller. Think of it as a security guard at a door:

```mermaid
flowchart LR
    A["Request arrives"] --> B["🛡️ Middleware\n(Security Guard)"]
    B -->|"Has valid token? ✅"| C["🎮 Controller\n(Let them in)"]
    B -->|"No token or bad token ❌"| D["REJECTED\n401 Unauthorized"]
```

**The difference between 401 and 403:**

| Code | Meaning | Analogy |
|------|---------|---------|
| `401 Unauthorized` | You are NOT logged in | You don't have a wristband at all |
| `403 Forbidden` | You ARE logged in but NOT allowed | You have a wristband but it's a General ticket, not VIP |

### Now Let's Write the Auth Middleware

Create `src/middlewares/authMiddleware.js`:

```javascript
import jwt from "jsonwebtoken";

// Checks if the user has a valid JWT token
function verifyToken(req, res, next) {
  // Step 1: Get the Authorization header
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: "Access denied. No token provided.",
      data: null,
    });
  }

  // Step 2: Extract the token (remove "Bearer " prefix)
  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Access denied. Invalid token format.",
      data: null,
    });
  }

  // Step 3: Verify the token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach user info to the request
    next(); // Continue to the controller
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Access denied. Token is invalid or expired.",
      data: null,
    });
  }
}

// Checks if the user has the right role
function authorizeRoles(...allowedRoles) {
  return function (req, res, next) {
    const userRole = req.user.role;

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You do not have permission.",
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

**How `verifyToken` works step by step:**

```
1. Client sends:  Authorization: Bearer eyJhbGciOiJIUzI1NiIs...

2. We split by space: ["Bearer", "eyJhbGciOiJIUzI1NiIs..."]

3. We take index [1]:  "eyJhbGciOiJIUzI1NiIs..."

4. jwt.verify() checks if the token is real and not expired

5. If valid: decoded = { userId: 1, role: "admin" }
   We put this in req.user so controllers can use it

6. next() → Continue to the controller
```

> 💡 **What is `next()`?** In Express, middleware functions receive three arguments: `req`, `res`, and `next`. Calling `next()` tells Express: "I am done. Continue to the next function in the chain." If you don't call `next()`, the request is stuck — the controller never runs.

> ⚠️ **What could go wrong? — Token Expiry**
>
> Remember we set `expiresIn: "24h"` when creating the token? After 24 hours, the token **expires**. Here is what happens:
>
> 1. The user logged in yesterday and got a token.
> 2. Today, they send a request with the same token.
> 3. `jwt.verify()` sees the token is expired and **throws an error**.
> 4. The `catch` block runs → sends `401: Token is invalid or expired`.
> 5. The user must log in again to get a fresh token.
>
> This is a GOOD thing — it limits the damage if a token is stolen. A hacker who steals a token can only use it until it expires.
>
> ```mermaid
> flowchart TD
>     A["User sends expired token"] --> B["jwt.verify() runs"]
>     B --> C["💥 TokenExpiredError thrown!"]
>     C --> D["catch block runs"]
>     D --> E["401: Token is invalid or expired"]
>     E --> F["User must login again\nto get a new token"]
> ```

> 🛠️ **Debugging Tips — Common Errors You Will See:**
>
> **Prisma Errors:**
>
> | Error | What It Means | How to Fix |
> |-------|--------------|------------|
> | `Unique constraint failed on the fields: (email)` | You tried to create a user/student with an email that already exists | Use a different email, or check for duplicates first |
> | `Foreign key constraint failed` | The `teacherId` or `classroomId` you provided does not exist in the database | Make sure the referenced record exists first |
> | `Invalid prisma.user.findUnique() invocation` | You passed wrong arguments to a Prisma method | Check the field names match your `schema.prisma` |
> | `P1001: Can't reach database server` | MySQL is not running | Start MySQL in XAMPP / your database tool |
>
> **JWT Errors:**
>
> | Error | What It Means | How to Fix |
> |-------|--------------|------------|
> | `jwt malformed` | The token string is corrupted or incomplete | Make sure you copy the FULL token from the login response |
> | `invalid signature` | Token was created with a different secret | Check `JWT_SECRET` in `.env` matches what was used to sign |
> | `jwt expired` | Token is older than 24 hours | Login again to get a fresh token |
> | `secretOrPrivateKey must have a value` | `JWT_SECRET` is missing from `.env` | Add `JWT_SECRET` to your `.env` file |

---

## 9. 🛣️ Step 8 — Auth Routes & REST API Design

### What is REST?

REST stands for **Representational State Transfer**. It is a set of rules for designing APIs. The idea is simple: URLs should represent **things** (resources), and HTTP methods should represent **actions**.

| HTTP Method | Action | Example |
|-------------|--------|---------|
| **GET** | Read data | Get all students |
| **POST** | Create new data | Create a new student |
| **PUT** | Update existing data | Update a student's name |
| **DELETE** | Delete data | Delete a student |

**Good REST URLs vs Bad URLs:**

| ❌ Bad URL | ✅ Good REST URL | Why |
|-----------|-----------------|-----|
| `/getStudents` | `GET /api/students` | The method (GET) already says "get" |
| `/createStudent` | `POST /api/students` | The method (POST) already says "create" |
| `/deleteStudent?id=5` | `DELETE /api/students/5` | The ID goes in the URL path |

### How Express Router Works

Express Router groups related routes together:

```mermaid
flowchart TD
    A["app.use('/api/auth', authRoutes)"] --> B["POST /api/auth/register → register()"]
    A --> C["POST /api/auth/login → login()"]
    A --> D["GET /api/auth/me → verifyToken → getMe()"]
    A --> E["GET /api/auth/users → verifyToken → authorizeRoles('admin') → getUsers()"]
```

### Now Let's Write the Auth Routes

Create `src/routes/authRoutes.js`:

```javascript
import express from "express";
const router = express.Router();

import { register, login, getUsers, getMe } from "../controllers/authController.js";
import { verifyToken, authorizeRoles } from "../middlewares/authMiddleware.js";

// Public routes (no login needed)
router.post("/register", register);
router.post("/login", login);

// Protected routes (login needed)
router.get("/me", verifyToken, getMe);

// Admin only route
router.get("/users", verifyToken, authorizeRoles("admin"), getUsers);

export default router;
```

**How route protection works:**

```
// Public — anyone can access:
router.post("/login", login);

// Protected — must be logged in:
router.get("/me", verifyToken, getMe);
//                 ↑ middleware runs first

// Admin only — must be logged in AND be admin:
router.get("/users", verifyToken, authorizeRoles("admin"), getUsers);
//                   ↑ check token   ↑ check role          ↑ then run function
```

### Request Lifecycle — Full Picture

Here is what happens for `GET /api/auth/users` (admin getting all users):

```mermaid
sequenceDiagram
    participant C as Client
    participant R as Router
    participant M as Middleware
    participant CT as Controller
    participant S as Service
    participant RP as Repository
    participant DB as Database

    C->>R: GET /api/auth/users (with token)
    R->>M: verifyToken()
    M->>M: Check JWT token ✅
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

Now we follow the exact same pattern: Repository → Service → Controller → Routes. From here on, you already know the theory. Let's code!

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

> 💡 **New Prisma concept: `include`** — This is like a JOIN in SQL. `include: { teacher: true }` means "also fetch the teacher for this classroom." Prisma handles the JOIN automatically!

### Classroom Service (`src/services/classroomService.js`)

```javascript
import * as classroomRepository from "../repositories/classroomRepository.js";

async function createClassroom(name, section, teacherId) {
  if (!name || !teacherId) {
    return { success: false, message: "Classroom name and teacher ID are required.", data: null };
  }
  const classroom = await classroomRepository.createClassroom(name, section, teacherId);
  return { success: true, message: "Classroom created successfully.", data: classroom };
}

async function getAllClassrooms() {
  const classrooms = await classroomRepository.findAllClassrooms();
  return { success: true, message: "Classrooms retrieved successfully.", data: classrooms };
}

async function getClassroomById(id) {
  const classroom = await classroomRepository.findClassroomById(id);
  if (!classroom) {
    return { success: false, message: "Classroom not found.", data: null };
  }
  return { success: true, message: "Classroom retrieved successfully.", data: classroom };
}

async function getClassroomsByTeacherId(teacherId) {
  const classrooms = await classroomRepository.findClassroomsByTeacherId(teacherId);
  return { success: true, message: "Teacher's classrooms retrieved successfully.", data: classrooms };
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
    return res.status(500).json({ success: false, message: "Something went wrong. Please try again.", data: null });
  }
}

async function getAllClassrooms(req, res) {
  try {
    const result = await classroomService.getAllClassrooms();
    return res.status(200).json(result);
  } catch (error) {
    console.error("Get classrooms error:", error);
    return res.status(500).json({ success: false, message: "Something went wrong. Please try again.", data: null });
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
    return res.status(500).json({ success: false, message: "Something went wrong. Please try again.", data: null });
  }
}

async function getClassroomsByTeacher(req, res) {
  try {
    const teacherId = parseInt(req.params.teacherId);
    const result = await classroomService.getClassroomsByTeacherId(teacherId);
    return res.status(200).json(result);
  } catch (error) {
    console.error("Get teacher classrooms error:", error);
    return res.status(500).json({ success: false, message: "Something went wrong. Please try again.", data: null });
  }
}

export { createClassroom, getAllClassrooms, getClassroomById, getClassroomsByTeacher };
```

> 💡 **`parseInt(req.params.id)`** — URL parameters are always strings. `"/5"` is a string `"5"`. We use `parseInt()` to convert it to a number `5`, because our database expects numbers for IDs.

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

---

## 11. 👩‍🎓 Step 10 — Building the Student System

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
    return { success: false, message: "All fields are required: name, email, registrationNumber, classroomId.", data: null };
  }
  const student = await studentRepository.createStudent(name, email, registrationNumber, classroomId);
  return { success: true, message: "Student created successfully.", data: student };
}

async function getAllStudents() {
  const students = await studentRepository.findAllStudents();
  return { success: true, message: "Students retrieved successfully.", data: students };
}

async function getStudentById(id) {
  const student = await studentRepository.findStudentById(id);
  if (!student) { return { success: false, message: "Student not found.", data: null }; }
  return { success: true, message: "Student retrieved successfully.", data: student };
}

async function getStudentsByClassroomId(classroomId) {
  const students = await studentRepository.findStudentsByClassroomId(classroomId);
  return { success: true, message: "Students retrieved successfully.", data: students };
}

export { createStudent, getAllStudents, getStudentById, getStudentsByClassroomId };
```

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
    return res.status(500).json({ success: false, message: "Something went wrong.", data: null });
  }
}

async function getAllStudents(req, res) {
  try {
    const result = await studentService.getAllStudents();
    return res.status(200).json(result);
  } catch (error) {
    console.error("Get students error:", error);
    return res.status(500).json({ success: false, message: "Something went wrong.", data: null });
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
    return res.status(500).json({ success: false, message: "Something went wrong.", data: null });
  }
}

async function getStudentsByClassroom(req, res) {
  try {
    const classroomId = parseInt(req.params.classroomId);
    const result = await studentService.getStudentsByClassroomId(classroomId);
    return res.status(200).json(result);
  } catch (error) {
    console.error("Get classroom students error:", error);
    return res.status(500).json({ success: false, message: "Something went wrong.", data: null });
  }
}

export { createStudent, getAllStudents, getStudentById, getStudentsByClassroom };
```

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

This is the most important system. Teachers use it every day to mark attendance.

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

> 💡 **`new Date(date)`** — The date comes as a string like `"2026-04-28"`. We convert it to a JavaScript `Date` object for Prisma.

> 💡 **`orderBy: { date: "desc" }`** — Sorts newest first. `"desc"` = descending, `"asc"` = ascending.

### Attendance Service (`src/services/attendanceService.js`)

```javascript
import * as attendanceRepository from "../repositories/attendanceRepository.js";

async function markAttendance(studentId, classroomId, date, status, markedBy) {
  if (!studentId || !classroomId || !date || !status || !markedBy) {
    return { success: false, message: "All fields are required: studentId, classroomId, date, status.", data: null };
  }

  const allowedStatuses = ["present", "absent", "late"];
  if (!allowedStatuses.includes(status)) {
    return { success: false, message: "Status must be 'present', 'absent', or 'late'.", data: null };
  }

  // Check for duplicates — a student can only have ONE record per day
  const existing = await attendanceRepository.findExistingAttendance(studentId, date);
  if (existing) {
    return { success: false, message: "Attendance already marked for this student on this date.", data: null };
  }

  const record = await attendanceRepository.createAttendance(studentId, classroomId, date, status, markedBy);
  return { success: true, message: "Attendance marked successfully.", data: record };
}

async function markBulkAttendance(attendanceList, markedBy) {
  if (!attendanceList || attendanceList.length === 0) {
    return { success: false, message: "Attendance list cannot be empty.", data: null };
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
    return { success: false, message: "Classroom ID and date are required.", data: null };
  }
  const records = await attendanceRepository.findAttendanceByClassroomAndDate(classroomId, date);
  return { success: true, message: "Attendance records retrieved successfully.", data: records };
}

async function getAttendanceByStudentId(studentId) {
  const records = await attendanceRepository.findAttendanceByStudentId(studentId);
  return { success: true, message: "Student attendance history retrieved successfully.", data: records };
}

export { markAttendance, markBulkAttendance, getAttendanceByClassroomAndDate, getAttendanceByStudentId };
```

**Bulk attendance flow:**

```mermaid
flowchart TD
    A["Teacher sends list of\nstudent attendance records"] --> B["Loop through each student"]
    B --> C{"Already marked\nfor this date?"}
    C -->|"Yes"| D["Add to errors list"]
    C -->|"No"| E["Save to database"]
    E --> F["Add to results list"]
    D --> G{"More students?"}
    F --> G
    G -->|"Yes"| B
    G -->|"No"| H["Return results:\nX saved, Y errors"]
```

### Attendance Controller (`src/controllers/attendanceController.js`)

```javascript
import * as attendanceService from "../services/attendanceService.js";

async function markAttendance(req, res) {
  try {
    const { studentId, classroomId, date, status } = req.body;
    const markedBy = req.user.userId; // From auth middleware!
    const result = await attendanceService.markAttendance(studentId, classroomId, date, status, markedBy);
    if (!result.success) { return res.status(400).json(result); }
    return res.status(201).json(result);
  } catch (error) {
    console.error("Mark attendance error:", error);
    return res.status(500).json({ success: false, message: "Something went wrong.", data: null });
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
    return res.status(500).json({ success: false, message: "Something went wrong.", data: null });
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
    return res.status(500).json({ success: false, message: "Something went wrong.", data: null });
  }
}

async function getAttendanceByStudent(req, res) {
  try {
    const studentId = parseInt(req.params.studentId);
    const result = await attendanceService.getAttendanceByStudentId(studentId);
    return res.status(200).json(result);
  } catch (error) {
    console.error("Get student attendance error:", error);
    return res.status(500).json({ success: false, message: "Something went wrong.", data: null });
  }
}

export { markAttendance, markBulkAttendance, getAttendanceByClassroom, getAttendanceByStudent };
```

> 💡 **`req.user.userId`** — The `verifyToken` middleware puts the decoded JWT data into `req.user`. So `req.user.userId` is the ID of the logged-in teacher. We use this for the `markedBy` field automatically — the teacher doesn't need to send it!

> 💡 **`req.query.date`** — For the URL `/api/attendance/classroom/1?date=2026-04-28`, `req.query.date` equals `"2026-04-28"`. The `?` in a URL starts the "query string."

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

You build your React app on `http://localhost:3000`. Your API runs on `http://localhost:5000`. You try to call the API from React. But the browser **blocks** the request!

```mermaid
flowchart LR
    A["React App\nlocalhost:3000"] -->|"Request"| B["Browser\n(Security Check)"]
    B -->|"❌ BLOCKED!\nDifferent port = different origin"| C["Express API\nlocalhost:5000"]
```

**Why?** Browsers have a security rule called **CORS** (Cross-Origin Resource Sharing): a website can only talk to the SAME server it came from. Different port = different origin = blocked.

### ✅ The Solution — cors() middleware

The `cors` package tells the browser: "It is OK, allow requests from other origins."

```mermaid
flowchart LR
    A["React App\nlocalhost:3000"] -->|"Request"| B["Browser\n(Security Check)"]
    B -->|"✅ ALLOWED!\ncors() says it's OK"| C["Express API\nlocalhost:5000"]
```

### Now Let's Create the Server File

Create `src/server.js`:

```javascript
// Step 1: Load environment variables (MUST be first!)
import "dotenv/config";

// Step 2: Import packages
import express from "express";
import cors from "cors";

// Step 3: Import our route files
import authRoutes from "./routes/authRoutes.js";
import classroomRoutes from "./routes/classroomRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";

// Step 4: Create the Express app
const app = express();

// Step 5: Add middleware
app.use(cors());          // Allow React frontend to connect
app.use(express.json());  // Parse JSON request bodies

// Step 6: Connect routes
app.use("/api/auth", authRoutes);
app.use("/api/classrooms", classroomRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/attendance", attendanceRoutes);

// Step 7: Test route
app.get("/", function (req, res) {
  res.json({
    success: true,
    message: "designHer 2.0 Attendance API is running!",
    data: null,
  });
});

// Step 8: Start the server
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

**Line-by-line explanation:**

| Line | What It Does |
|------|-------------|
| `import "dotenv/config"` | Loads `.env` file into `process.env`. MUST be first! |
| `const app = express()` | Creates a new Express application |
| `app.use(cors())` | Allows cross-origin requests (fixes CORS errors) |
| `app.use(express.json())` | Makes Express understand JSON bodies (`req.body`) |
| `app.use("/api/auth", authRoutes)` | All routes in `authRoutes` start with `/api/auth` |
| `app.listen(PORT, ...)` | Starts the server on port 5000 |

### How Frontend Will Talk to This Backend

```mermaid
sequenceDiagram
    participant U as User
    participant R as React App
    participant A as Our API
    participant D as Database

    U->>R: Clicks "Login" button
    R->>A: POST /api/auth/login { email, password }
    A->>D: Find user by email
    D->>A: User found
    A->>R: { success: true, data: { token: "..." } }
    R->>R: Save token in localStorage

    U->>R: Opens "Students" page
    R->>A: GET /api/students (with token in header)
    A->>A: Verify token ✅
    A->>D: SELECT * FROM students
    D->>A: [student1, student2, ...]
    A->>R: { success: true, data: [...] }
    R->>U: Shows student list on screen
```

---

## 14. 🚀 Step 13 — Running the Server

### Quick Checklist

- [x] MySQL running with the `attendance_system_db` database (from Day 1)
- [x] Seed data inserted (from Day 1)
- [x] `.env` file with your real MySQL password
- [x] All source code files created

### Install, Generate, and Run

```bash
npm install
npx prisma generate
npm run dev
```

You should see:

```
==============================================
  designHer 2.0 Attendance API
  Server is running on http://localhost:5000
==============================================
```

Open `http://localhost:5000/` in your browser. You should see:

```json
{ "success": true, "message": "designHer 2.0 Attendance API is running!", "data": null }
```

### Common Errors and Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| `Cannot find module 'express'` | Packages not installed | Run `npm install` |
| `P1001: Can't reach database server` | MySQL is not running | Start MySQL in XAMPP |
| `Invalid prisma.user.findUnique() invocation` | Prisma client not generated | Run `npx prisma generate` |
| `Error: secretOrPrivateKey must have a value` | JWT_SECRET not in `.env` | Check your `.env` file |
| `Port 5000 is already in use` | Another server running | Change PORT in `.env` to 5001 |

---

## 15. 🧪 Step 14 — Testing with Postman

### What is Postman?

Postman is a free tool to test APIs. Instead of building the React frontend first, we use Postman to send HTTP requests and verify our API works.

> 🎯 **Analogy:** Postman is like a phone you use to call the restaurant (our API) and place orders, without going there in person.

**Download:** [https://www.postman.com/downloads/](https://www.postman.com/downloads/)

### Test 1: Server Health Check

```
Method: GET
URL:    http://localhost:5000/
```

Expected: `200 OK` — `{ "success": true, "message": "designHer 2.0 Attendance API is running!" }`

### Test 2: Login as Admin

```
Method: POST
URL:    http://localhost:5000/api/auth/login
Body → raw → JSON:
```
```json
{ "email": "amara@school.com", "password": "admin123" }
```

Expected: `200 OK` with a `token`. **⭐ COPY THIS TOKEN! You need it for all next tests.**

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

### How to Add the JWT Token for Protected Routes

1. Click the **Headers** tab
2. Key: `Authorization`
3. Value: `Bearer <paste-your-token-here>`

```
✅ Correct: Bearer eyJhbGciOiJIUzI1NiIs...
❌ Wrong:   BearereyJhbGciOiJIUzI1NiIs...    (no space!)
❌ Wrong:   eyJhbGciOiJIUzI1NiIs...          (missing "Bearer")
```

> 💡 **Tip:** In Postman, click **Authorization** tab → choose **Bearer Token** → paste just the token. Postman adds "Bearer " automatically.

### Test 5: Get My Info

```
GET http://localhost:5000/api/auth/me  +  Authorization header
```

### Test 6: Get All Users (Admin Only)

```
GET http://localhost:5000/api/auth/users  +  Admin token
```
> ⚠️ Try with a teacher token — you get `403 Forbidden`!

### Test 7: Get All Classrooms

```
GET http://localhost:5000/api/classrooms  +  Token
```

### Test 8: Create a Classroom (Admin Only)

```
POST http://localhost:5000/api/classrooms  +  Admin token
Body:
```
```json
{ "name": "Batch 2026 - Data Science", "section": "Afternoon", "teacherId": 2 }
```

### Test 9: Get All Students

```
GET http://localhost:5000/api/students  +  Token
```

### Test 10: Create a Student

```
POST http://localhost:5000/api/students  +  Token
Body:
```
```json
{ "name": "Dilshan Wickramasinghe", "email": "dilshan@student.com", "registrationNumber": "STU-2026-005", "classroomId": 1 }
```

### Test 11: Mark Attendance

```
POST http://localhost:5000/api/attendance  +  Token
Body:
```
```json
{ "studentId": 1, "classroomId": 1, "date": "2026-05-01", "status": "present" }
```
> ⚠️ Send the same request again — you get: "Attendance already marked for this student on this date."

### Test 12: Bulk Attendance

```
POST http://localhost:5000/api/attendance/bulk  +  Token
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
GET http://localhost:5000/api/attendance/classroom/1?date=2026-04-28  +  Token
```

### Test 14: Get Student Attendance History

```
GET http://localhost:5000/api/attendance/student/1  +  Token
```

### Test 15: Error Cases

| Test | Expected |
|------|----------|
| `POST /api/auth/login` with wrong password | `401` — "Invalid email or password." |
| `GET /api/students` without token | `401` — "Access denied. No token provided." |
| `POST /api/classrooms` with teacher token | `403` — "Access denied. You do not have permission." |
| `POST /api/auth/register` with existing email | `400` — "A user with this email already exists." |
| `POST /api/attendance` with `"status": "sick"` | `400` — "Status must be 'present', 'absent', or 'late'." |

### Testing Flow Summary

```mermaid
flowchart TD
    A["1. Start server\nnpm run dev"] --> B["2. Test health\nGET /"]
    B --> C["3. Login\nPOST /api/auth/login"]
    C --> D["4. Copy the TOKEN"]
    D --> E["5. Add token to Headers"]
    E --> F["6. Test GET endpoints"]
    F --> G["7. Test POST endpoints"]
    G --> H["8. Test error cases"]
```

---

## 🎉 Congratulations! You Did It!

You just built a complete REST API from scratch! Here is what you learned today:

| Topic | What You Learned |
|-------|-----------------|
| **Environment Variables** | Keeping secrets safe with `.env` (Problem: hardcoded passwords) |
| **Prisma ORM** | Talking to the database with JavaScript (Problem: raw SQL is painful) |
| **Async/Await** | Making JavaScript wait for slow operations (Problem: JS is impatient) |
| **Password Security** | Hashing with bcrypt (Problem: plain text passwords = disaster) |
| **JWT Tokens** | Staying logged in (Problem: HTTP forgets you every request) |
| **HTTP Fundamentals** | Requests, Responses, Methods, Status Codes |
| **Error Handling** | try/catch prevents server crashes (Problem: unhandled errors = crash) |
| **Authentication** | Verifying WHO you are (Problem: anyone can access everything) |
| **Authorization** | Verifying WHAT you can do (Problem: teachers doing admin actions) |
| **REST API Design** | Resource-based URLs with HTTP methods |
| **CORS** | Allowing frontend to talk to backend (Problem: browser blocks requests) |
| **Layered Architecture** | Route → Middleware → Controller → Service → Repository |

> **Next up (Day 3):** We will build the React frontend that connects to this API! We will use `fetch()` to call these endpoints, save the JWT token in localStorage, and build the attendance dashboard.

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

Here is a handy reference for the most common Prisma methods. You can come back to this whenever you need to write a database query!

| Prisma Method | What It Does | Example |
|---------------|-------------|--------|
| `findUnique()` | Find ONE record by a unique field (id, email) | `prisma.user.findUnique({ where: { id: 1 } })` |
| `findFirst()` | Find the FIRST record that matches a condition | `prisma.attendance.findFirst({ where: { studentId: 1, date: new Date("2026-05-01") } })` |
| `findMany()` | Find ALL records that match (or all if no `where`) | `prisma.student.findMany({ where: { classroomId: 1 } })` |
| `create()` | Insert a NEW record | `prisma.user.create({ data: { name: "Nimal", email: "nimal@school.com", password: "hashed...", role: "teacher" } })` |
| `update()` | Change an EXISTING record | `prisma.user.update({ where: { id: 1 }, data: { name: "New Name" } })` |
| `delete()` | DELETE a record | `prisma.student.delete({ where: { id: 5 } })` |

### Common Prisma Options

| Option | What It Does | Example |
|--------|-------------|--------|
| `where` | Filter — which records to find | `where: { email: "nimal@school.com" }` |
| `select` | Choose which fields to return | `select: { id: true, name: true, email: true }` |
| `include` | Also fetch related records (like SQL JOIN) | `include: { classroom: true }` |
| `orderBy` | Sort the results | `orderBy: { date: "desc" }` |
| `data` | The values to save (for create/update) | `data: { name: "Nimal", email: "n@s.com" }` |

### select vs include — When to Use Which?

```javascript
// SELECT: "I only want SOME fields from THIS table"
const users = await prisma.user.findMany({
  select: {
    id: true,
    name: true,
    email: true,
    // password is NOT selected — it stays hidden!
  },
});

// INCLUDE: "I want ALL fields + RELATED records from another table"
const classroom = await prisma.classroom.findUnique({
  where: { id: 1 },
  include: {
    teacher: true,   // Also get the teacher (from users table)
    students: true,  // Also get all students in this class
  },
});

// COMBINE: "I want related records, but only SOME fields"
const students = await prisma.student.findMany({
  include: {
    classroom: {
      select: { id: true, name: true },  // Only get classroom id and name
    },
  },
});
```

> 💡 **Tip:** You CANNOT use `select` and `include` at the same top level. Choose one. But you CAN nest `select` inside `include` as shown above!

---

> Made with ❤️ for **designHer 2.0 Bootcamp 2026**
