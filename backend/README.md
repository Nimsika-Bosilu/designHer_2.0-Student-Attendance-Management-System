# 🚀 Student Attendance Management System — Backend API Guide

> **Day 2 of designHer 2.0 Bootcamp**
> Today we build the backend REST API using Node.js, Express, and Prisma!

---

## 📖 Table of Contents

1. [What We Are Building Today](#1--what-we-are-building-today)
2. [Understanding Layered Architecture](#2--understanding-layered-architecture)
3. [Folder Structure](#3--folder-structure)
4. [HTTP Fundamentals](#4--http-fundamentals)
5. [REST API Design](#5--rest-api-design)
6. [The Big Picture — Our API Endpoints](#6--the-big-picture--our-api-endpoints)
7. [Step 1 — Project Setup](#7--step-1--project-setup)
8. [Step 2 — Environment Variables](#8--step-2--environment-variables)
9. [Step 3 — Database Connection with Prisma](#9--step-3--database-connection-with-prisma)
10. [Step 4 — Building the Auth System](#10--step-4--building-the-auth-system)
11. [Step 5 — Building the Classroom System](#11--step-5--building-the-classroom-system)
12. [Step 6 — Building the Student System](#12--step-6--building-the-student-system)
13. [Step 7 — Building the Attendance System](#13--step-7--building-the-attendance-system)
14. [Step 8 — The Main Server File](#14--step-8--the-main-server-file)
15. [Step 9 — Running the Server](#15--step-9--running-the-server)
16. [Step 10 — Testing with Postman](#16--step-10--testing-with-postman)

---

## 1. 🎯 What We Are Building Today

Yesterday (Day 1), we created the MySQL database with 4 tables: `users`, `classrooms`, `students`, and `attendance`.

Today, we will build a **REST API**. This is a backend server that:
- Receives requests from the React frontend
- Processes the data (checks passwords, validates input)
- Talks to the MySQL database
- Sends back JSON responses

> 🎯 **Analogy:** Think of a restaurant. The **React frontend** is the menu card. The **backend API** is the waiter. The **database** is the kitchen. The customer (user) looks at the menu, tells the waiter what they want, and the waiter gets it from the kitchen.

```mermaid
flowchart LR
    A["🖥️ React Frontend"] -->|"HTTP Request"| B["⚙️ Express Backend"]
    B -->|"Prisma Query"| C["🐬 MySQL Database"]
    C -->|"Data"| B
    B -->|"JSON Response"| A
```

---

## 2. 🏗️ Understanding Layered Architecture

### What is Layered Architecture?

Imagine a big company. The **receptionist** does not do the accounting. The **accountant** does not clean the office. Each person has ONE job. This is layered architecture. Each **layer** has ONE responsibility.

### The Layers in Our System

```mermaid
flowchart TD
    A["🌐 Client / Frontend\n(React App or Postman)"] -->|"HTTP Request"| B
    B["🛣️ Route Layer\n(authRoutes.js, classroomRoutes.js)\nDecides WHICH controller to call"] -->|"Calls"| C
    C["🛡️ Middleware Layer\n(authMiddleware.js)\nChecks: Is the user logged in?\nChecks: Does the user have permission?"] -->|"If allowed"| D
    D["🎮 Controller Layer\n(authController.js)\nReads the request\nSends the response"] -->|"Calls"| E
    E["⚙️ Service Layer\n(authService.js)\nBusiness logic\nPassword hashing, token creation"] -->|"Calls"| F
    F["🗄️ Repository Layer\n(authRepository.js)\nDatabase queries using Prisma"] -->|"SQL Query"| G
    G["🐬 MySQL Database"]
```

### Real Example: Teacher Logs In

Let's follow what happens when a teacher clicks "Login" on the React app:

| Step | Layer | What Happens |
|------|-------|-------------|
| 1 | **Client** | Teacher types email and password, clicks Login |
| 2 | **Route** | Express sees `POST /api/auth/login` and calls the auth controller |
| 3 | **Controller** | Reads the email and password from the request body |
| 4 | **Service** | Finds the user by email, compares the password hash |
| 5 | **Repository** | Runs `SELECT * FROM users WHERE email = ?` using Prisma |
| 6 | **Service** | Password matches! Creates a JWT token |
| 7 | **Controller** | Sends the token back as a JSON response |
| 8 | **Client** | React saves the token and goes to the dashboard |

### Why Do We Use Layers?

| Benefit | Explanation |
|---------|------------|
| **Easy to find code** | Need to fix a database query? Go to the repository. Need to fix login logic? Go to the service. |
| **Easy to test** | You can test each layer alone. |
| **Easy to change** | Want to switch from MySQL to PostgreSQL? Only change the repository layer. |
| **Team work** | One person can work on controllers while another works on services. |

---

## 3. 📁 Folder Structure

Here is the folder structure we will create:

```
backend/
├── prisma/
│   └── schema.prisma        # Database models (tells Prisma about our tables)
├── src/
│   ├── config/
│   │   └── db.js             # Prisma client connection
│   ├── repositories/         # Layer 1: Database queries
│   │   ├── authRepository.js
│   │   ├── classroomRepository.js
│   │   ├── studentRepository.js
│   │   └── attendanceRepository.js
│   ├── services/             # Layer 2: Business logic
│   │   ├── authService.js
│   │   ├── classroomService.js
│   │   ├── studentService.js
│   │   └── attendanceService.js
│   ├── controllers/          # Layer 3: HTTP handling
│   │   ├── authController.js
│   │   ├── classroomController.js
│   │   ├── studentController.js
│   │   └── attendanceController.js
│   ├── middlewares/          # Guards and checks
│   │   └── authMiddleware.js
│   ├── routes/               # URL definitions
│   │   ├── authRoutes.js
│   │   ├── classroomRoutes.js
│   │   ├── studentRoutes.js
│   │   └── attendanceRoutes.js
│   └── server.js             # Main entry point
├── .env                      # Secret config (NEVER push to GitHub!)
├── .env.example              # Example config (safe to push)
├── .gitignore                # Files Git should ignore
└── package.json              # Project info and dependencies
```

> 💡 **Tip:** Each feature (auth, classroom, student, attendance) has its own file in every layer. This keeps the code organized and easy to find.

---

## 4. 📡 HTTP Fundamentals

Before we write code, we need to understand how the internet works.

### What is HTTP?

HTTP stands for **HyperText Transfer Protocol**. It is the language that browsers and servers use to talk to each other.

Every HTTP conversation has two parts:

```mermaid
sequenceDiagram
    participant C as 🖥️ Client (Browser/Postman)
    participant S as ⚙️ Server (Our Express App)
    C->>S: HTTP Request (I want something)
    S->>C: HTTP Response (Here is your answer)
```

### HTTP Request — What the client sends

A request has 4 parts:

| Part | Example | Purpose |
|------|---------|---------|
| **Method** | `POST` | What action to do |
| **URL** | `/api/auth/login` | Where to go |
| **Headers** | `Authorization: Bearer abc123` | Extra info (like a login token) |
| **Body** | `{ "email": "nimal@school.com" }` | The data to send |

### HTTP Methods — The 4 Main Actions

| Method | Purpose | Real Example |
|--------|---------|-------------|
| `GET` | **Read** data | Get all students |
| `POST` | **Create** new data | Register a new user |
| `PUT` | **Update** existing data | Edit a student's name |
| `DELETE` | **Remove** data | Delete a classroom |

> 🎯 **Analogy:** Think of a library. `GET` = borrow a book. `POST` = donate a new book. `PUT` = replace a damaged book. `DELETE` = remove a book.

### HTTP Response — What the server sends back

A response has 2 main parts:

| Part | Example | Purpose |
|------|---------|---------|
| **Status Code** | `200` | Was it successful? |
| **Body** | `{ "success": true, "data": {...} }` | The actual data |

### HTTP Status Codes — The Server's Answer

| Code | Meaning | When We Use It |
|------|---------|---------------|
| `200` | ✅ OK | Request was successful |
| `201` | ✅ Created | New data was created successfully |
| `400` | ❌ Bad Request | Client sent wrong or missing data |
| `401` | 🔒 Unauthorized | User is not logged in |
| `403` | 🚫 Forbidden | User is logged in but not allowed |
| `404` | ❓ Not Found | The thing you asked for does not exist |
| `500` | 💥 Server Error | Something broke on the server |

---

## 5. 🎨 REST API Design

### What is a REST API?

REST stands for **Representational State Transfer**. It is a set of rules for designing APIs.

The main rule is: **URLs should be about THINGS (nouns), not ACTIONS (verbs).**

| ❌ Bad URL | ✅ Good URL | Why? |
|-----------|------------|------|
| `/getAllStudents` | `GET /api/students` | The HTTP method (`GET`) already says "get". The URL just names the thing. |
| `/createStudent` | `POST /api/students` | `POST` means "create". The URL is the same! |
| `/deleteStudent/5` | `DELETE /api/students/5` | `DELETE` means "remove". `/5` is the student ID. |

### Our URL Pattern

All our URLs start with `/api/` followed by the resource name:

```
/api/auth          → Authentication (login, register)
/api/classrooms    → Classroom operations
/api/students      → Student operations
/api/attendance    → Attendance operations
```

---

## 6. 📋 The Big Picture — Our API Endpoints

Here are ALL the API endpoints we will build:

### 🔐 Auth Endpoints

| Method | URL | Purpose | Who Can Use? |
|--------|-----|---------|-------------|
| `POST` | `/api/auth/register` | Create a new user account | Public |
| `POST` | `/api/auth/login` | Login and get a token | Public |
| `GET` | `/api/auth/me` | Get my own info | Any logged-in user |
| `GET` | `/api/auth/users` | Get all users | Admin only |

### 🏫 Classroom Endpoints

| Method | URL | Purpose | Who Can Use? |
|--------|-----|---------|-------------|
| `POST` | `/api/classrooms` | Create a new classroom | Admin only |
| `GET` | `/api/classrooms` | Get all classrooms | Any logged-in user |
| `GET` | `/api/classrooms/:id` | Get one classroom | Any logged-in user |
| `GET` | `/api/classrooms/teacher/:teacherId` | Get a teacher's classrooms | Any logged-in user |

### 👩‍🎓 Student Endpoints

| Method | URL | Purpose | Who Can Use? |
|--------|-----|---------|-------------|
| `POST` | `/api/students` | Add a new student | Admin or Teacher |
| `GET` | `/api/students` | Get all students | Any logged-in user |
| `GET` | `/api/students/:id` | Get one student | Any logged-in user |
| `GET` | `/api/students/classroom/:classroomId` | Get students in a class | Any logged-in user |

### 📝 Attendance Endpoints

| Method | URL | Purpose | Who Can Use? |
|--------|-----|---------|-------------|
| `POST` | `/api/attendance` | Mark one student's attendance | Admin or Teacher |
| `POST` | `/api/attendance/bulk` | Mark many students at once | Admin or Teacher |
| `GET` | `/api/attendance/classroom/:classroomId?date=YYYY-MM-DD` | Get class attendance for a day | Any logged-in user |
| `GET` | `/api/attendance/student/:studentId` | Get a student's history | Any logged-in user |

### Frontend-Friendly JSON Format

> ⚠️ **Very Important!** Every response from our API will follow this format:

```json
{
  "success": true,
  "message": "What happened (human readable)",
  "data": { }
}
```

**Why this format?**

| Field | Purpose |
|-------|---------|
| `success` | `true` or `false`. The React app checks this first. If `false`, it shows an error message. |
| `message` | A text message. Can be shown to the user in an alert or toast. |
| `data` | The actual data (user info, list of students, etc). `null` if there is no data. |

```
// ✅ React frontend can easily handle this:
const response = await fetch("/api/students");
const result = await response.json();

if (result.success) {
  setStudents(result.data);  // Use the data
} else {
  alert(result.message);     // Show error
}
```

---

## 7. 🛠️ Step 1 — Project Setup

### Create the project folder

Open your terminal. Navigate to your project folder.

```bash
mkdir backend
cd backend
```

### Initialize the project

```bash
npm init -y
```

> 💡 **What is `npm init -y`?** `npm` is the Node Package Manager. `init` creates a new project. `-y` means "yes to all default options". This creates a `package.json` file.

> 💡 **What is `package.json`?** It is the ID card of your project. It stores the project name, version, and all the packages (libraries) your project uses.

### Install Express

```bash
npm install express
```

> 💡 **What is Express?** Express is a framework for Node.js. It makes it very easy to create a web server. Without Express, we would need to write hundreds of lines of code just to handle HTTP requests. With Express, we do it in a few lines.

### Install nodemon (dev tool)

```bash
npm install --save-dev nodemon
```

> 💡 **What is nodemon?** Normally, when you change your code, you have to stop the server and start it again. Nodemon watches your files and **restarts the server automatically** when you save a file. We install it as a "dev dependency" because we only need it during development.

### Update package.json scripts

Open `package.json` and change the `"scripts"` section to include `"type": "module"` and the dev/start scripts:

```json
  "main": "src/server.js",
  "type": "module",
  "scripts": {
    "dev": "nodemon src/server.js",
    "start": "node src/server.js"
  }
```

- `"type": "module"` — Allows us to use modern `import`/`export` syntax instead of the older `require()`.
- `npm run dev` — Runs the server with nodemon (auto-restart)
- `npm start` — Runs the server normally (for production)

---

## 8. 🔒 Step 2 — Environment Variables

### The Problem: Hardcoded Secrets ❌

Imagine you write this in your code:

```javascript
// ❌ DANGEROUS! Never do this!
const password = "mysql_root_password_123";
const secret = "my-jwt-secret-key";
```

If you push this to GitHub, **everyone in the world** can see your passwords! Hackers can steal your database. This is a real problem that happens to companies.

### The Solution: Environment Variables ✅

We save secrets in a special file called `.env`. This file **never** goes to GitHub.

### Install dotenv

```bash
npm install dotenv
```

> 💡 **What is dotenv?** It is a package that reads the `.env` file and puts the values into `process.env`. Think of `process.env` as a secret drawer that only your server can open.

### Create the `.env` file

Create a file named `.env` in the `backend/` folder:

```env
DATABASE_URL="mysql://root:YOUR_PASSWORD@localhost:3306/attendance_system_db"
JWT_SECRET="your-super-secret-key-change-this-to-something-random"
PORT=5000
```

> ⚠️ Replace `YOUR_PASSWORD` with your actual MySQL root password!

### Create `.env.example`

Create a file named `.env.example`:

```env
DATABASE_URL="mysql://root:YOUR_PASSWORD_HERE@localhost:3306/attendance_system_db"
JWT_SECRET="your-super-secret-key-change-this-to-something-random"
PORT=5000
```

> 💡 This file shows other developers what variables are needed, without showing the real values. This file IS safe to push to GitHub.

### Create `.gitignore`

Create a file named `.gitignore`:

```
node_modules/
.env
```

> 💡 **What is `.gitignore`?** It tells Git: "Do NOT track these files." The `node_modules` folder is very large (hundreds of MB). The `.env` file has secrets. Both should never go to GitHub.

### How Environment Variables Work

```mermaid
flowchart LR
    A[".env file\n(SECRET)"] -->|"dotenv reads"| B["process.env\n(In memory)"]
    B -->|"Your code uses"| C["process.env.JWT_SECRET\nprocess.env.DATABASE_URL"]
```

```javascript
// In your code, use it like this:
import "dotenv/config"; // Load .env file

const secret = process.env.JWT_SECRET;   // Reads from .env
const dbUrl = process.env.DATABASE_URL;  // Reads from .env
```

---

## 9. 🔷 Step 3 — Database Connection with Prisma

### What is an ORM?

Yesterday, we wrote SQL queries like `SELECT * FROM students`. An ORM lets us write JavaScript instead of SQL.

| Without ORM (raw SQL) | With ORM (Prisma) |
|----------------------|-------------------|
| `SELECT * FROM students WHERE id = 1;` | `prisma.student.findUnique({ where: { id: 1 } })` |
| `INSERT INTO students (name) VALUES ('Nimal');` | `prisma.student.create({ data: { name: "Nimal" } })` |

> 💡 **ORM** stands for Object-Relational Mapping. It maps database tables to JavaScript objects.

### Database Basics Recap

```mermaid
erDiagram
    users ||--o{ classrooms : "teaches"
    classrooms ||--o{ students : "has"
    students ||--o{ attendance : "has"
    classrooms ||--o{ attendance : "records"
    users ||--o{ attendance : "marks"
```

Remember from Day 1:
- **Table** = like an Excel sheet (e.g., `users`)
- **Row** = one record (e.g., one teacher)
- **Column** = one piece of info (e.g., `name`, `email`)
- **Primary Key** = unique ID for each row
- **Foreign Key** = a column that points to another table's primary key
- **Relationship** = how tables are connected (e.g., one teacher has many classrooms)

### Install Prisma

```bash
npm install prisma --save-dev
npm install @prisma/client
```

> 💡 `prisma` is the development tool (we use it to generate code). `@prisma/client` is the library we use in our code to talk to the database.

### Initialize Prisma

```bash
npx prisma init
```

This creates a `prisma/` folder with a `schema.prisma` file.

### Write the Prisma Schema

Open `prisma/schema.prisma` and replace everything with:

```prisma
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id        Int      @id @default(autoincrement())
  name      String   @db.VarChar(100)
  email     String   @unique @db.VarChar(150)
  password  String   @db.VarChar(255)
  role      String   @default("teacher") @db.VarChar(20)
  createdAt DateTime @default(now()) @map("created_at")

  classrooms  Classroom[]
  attendances Attendance[]

  @@map("users")
}

model Classroom {
  id        Int      @id @default(autoincrement())
  name      String   @db.VarChar(100)
  section   String?  @db.VarChar(50)
  teacherId Int      @map("teacher_id")
  createdAt DateTime @default(now()) @map("created_at")

  teacher     User         @relation(fields: [teacherId], references: [id], onDelete: Cascade)
  students    Student[]
  attendances Attendance[]

  @@map("classrooms")
}

model Student {
  id                 Int      @id @default(autoincrement())
  name               String   @db.VarChar(100)
  email              String   @unique @db.VarChar(150)
  registrationNumber String   @unique @map("registration_number") @db.VarChar(50)
  classroomId        Int      @map("classroom_id")
  createdAt          DateTime @default(now()) @map("created_at")

  classroom   Classroom    @relation(fields: [classroomId], references: [id], onDelete: Cascade)
  attendances Attendance[]

  @@map("students")
}

model Attendance {
  id          Int      @id @default(autoincrement())
  studentId   Int      @map("student_id")
  classroomId Int      @map("classroom_id")
  date        DateTime @db.Date
  status      String   @db.VarChar(20)
  markedBy    Int      @map("marked_by")
  createdAt   DateTime @default(now()) @map("created_at")

  student   Student   @relation(fields: [studentId], references: [id], onDelete: Cascade)
  classroom Classroom @relation(fields: [classroomId], references: [id], onDelete: Cascade)
  marker    User      @relation(fields: [markedBy], references: [id], onDelete: Cascade)

  @@unique([studentId, date], name: "unique_attendance")
  @@map("attendance")
}
```

**Key things in the schema:**

| Syntax | Meaning |
|--------|---------|
| `@id` | This is the primary key |
| `@default(autoincrement())` | Auto-generate IDs (1, 2, 3...) |
| `@unique` | No duplicate values allowed |
| `@map("column_name")` | Map to the actual column name in MySQL |
| `@@map("table_name")` | Map to the actual table name in MySQL |
| `String?` | The `?` means this field is optional (can be null) |
| `Classroom[]` | One user can have many classrooms (array = many) |
| `@relation(...)` | Defines the foreign key connection |

### Pull the existing database

Since we already created the database in Day 1, we tell Prisma to read it:

```bash
npx prisma db pull
```

### Generate the Prisma Client

```bash
npx prisma generate
```

> 💡 This creates the JavaScript code that lets us use `prisma.user.findMany()`, `prisma.student.create()`, etc.

### Create the Database Connection File

Create `src/config/db.js`:

```javascript
// Import PrismaClient from the Prisma package
import { PrismaClient } from "@prisma/client";

// Create a new Prisma client instance
const prisma = new PrismaClient();

// Export it so other files can use it
export default prisma;
```

> 💡 We create the Prisma client in ONE file and import it everywhere. This way, we have only ONE connection to the database.

---

## 10. 🔐 Step 4 — Building the Auth System

This is the biggest step. We will build login, registration, password security, and JWT tokens.

### Async/Await Basics

Before we write the code, let's understand `async/await`. It is how JavaScript waits for slow operations (like database queries).

**The Problem:** Talking to a database takes time. JavaScript does NOT wait by default. It moves to the next line immediately.

```javascript
// ❌ Problem: This does NOT wait for the database!
function getUser() {
  const user = database.findUser("nimal@school.com"); // This takes time!
  console.log(user); // This runs BEFORE the database responds!
  // Result: undefined 😱
}
```

**The Solution:** Use `async/await` to tell JavaScript: "WAIT here until this is done."

```javascript
// ✅ Solution: async/await makes JavaScript WAIT
async function getUser() {
  const user = await database.findUser("nimal@school.com"); // WAIT here!
  console.log(user); // This runs AFTER the database responds!
  // Result: { name: "Nimal", email: "nimal@school.com" } ✅
}
```

**Simple Rules:**
1. Add `async` before the function name
2. Add `await` before any operation that takes time (database, API calls, file reading)
3. `await` can ONLY be used inside an `async` function

```mermaid
flowchart LR
    A["Your Code"] -->|"await"| B["Database Query\n(takes 100ms)"]
    B -->|"Result comes back"| C["Code continues\nwith the result"]
```

### Error Handling Strategy — try/catch

What if the database is down? What if the user sends bad data? We use `try/catch` to handle errors.

```javascript
// ✅ Always wrap database calls in try/catch
async function getUser(req, res) {
  try {
    // TRY to do this...
    const user = await database.findUser(req.body.email);
    return res.status(200).json({
      success: true,
      message: "User found.",
      data: user,
    });
  } catch (error) {
    // If ANYTHING goes wrong, CATCH the error
    console.error("Error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again.",
      data: null,
    });
  }
}
```

> 💡 **Rule:** Every controller function MUST have `try/catch`. This prevents the server from crashing.

### Password Security — The #1 Security Rule

#### The Problem: Plain Text Passwords ❌

```javascript
// ❌ NEVER DO THIS! Saving password as plain text!
const user = {
  email: "nimal@school.com",
  password: "teacher123"  // Anyone who sees the database can read this!
};
```

If a hacker breaks into your database, they can see every password. They can log in as any user. They can try these passwords on other websites too (people reuse passwords).

#### The Solution: Hashing with bcrypt ✅

**Hashing** is like putting the password through a meat grinder. You can turn meat into a burger, but you **cannot turn a burger back into meat**. That is one-way.

```mermaid
flowchart LR
    A["teacher123\n(plain text)"] -->|"bcrypt.hash()"| B["$2b$10$VxB/Z1jc...\n(hashed - cannot reverse!)"]
```

```
Plain Password:  teacher123
Hashed Password: $2b$10$VxB/Z1jcdUDt2rNG7V6bWenRA0afyXCPPxyMwRJ6RxX7gKWQzkl4e
```

**What is salting?** A "salt" is random text added to the password before hashing. This means even if two users have the same password, their hashes will be different!

```
User 1: "teacher123" + salt_abc → hash_111
User 2: "teacher123" + salt_xyz → hash_222   (Different hash!)
```

#### Install bcrypt

```bash
npm install bcrypt
```

> 💡 **What is bcrypt?** It is a library that hashes passwords securely. It adds a random salt automatically. It is the industry standard for password hashing.

### JWT Tokens — How Login Works

#### Authentication vs Authorization

These two words sound similar but mean very different things:

| Concept | Question | Example |
|---------|----------|---------|
| **Authentication** | WHO are you? | Logging in with email and password |
| **Authorization** | WHAT can you do? | An admin can create classrooms. A teacher cannot. |

```mermaid
flowchart LR
    A["User types\nemail + password"] -->|"Authentication\n(Who are you?)"| B["Server checks\npassword hash"]
    B -->|"Correct!"| C["Server creates\nJWT token"]
    C -->|"Token sent to user"| D["User sends token\nwith every request"]
    D -->|"Authorization\n(What can you do?)"| E["Server checks\nrole in token"]
```

#### What is JWT?

JWT stands for **JSON Web Token**. It is like a digital ID card.

When you login, the server creates a token. This token contains your user ID and role. You send this token with every request so the server knows who you are.

```
A JWT token looks like this:
eyJhbGciOiJIUzI1NiIs.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiJ9.abc123signature

It has 3 parts separated by dots:
Part 1: Header    (algorithm info)
Part 2: Payload   (your data: userId, role)
Part 3: Signature (proof that the token is real)
```

#### Install jsonwebtoken

```bash
npm install jsonwebtoken
```

> 💡 **What is jsonwebtoken?** It is a library to create and verify JWT tokens.

### Now Let's Build the Auth Code!

We will build 4 files for the auth system, one for each layer.

---

### Layer 1: Auth Repository (`src/repositories/authRepository.js`)

This file ONLY talks to the database. It does not know about HTTP or passwords.

Create the file `src/repositories/authRepository.js`:

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

**What each function does:**

| Function | Purpose | Prisma Method |
|----------|---------|--------------|
| `findUserByEmail` | Find one user by email (for login) | `findUnique` |
| `findUserById` | Find one user by ID | `findUnique` |
| `createUser` | Save a new user (for register) | `create` |
| `findAllUsers` | Get all users (for admin dashboard) | `findMany` |

> ⚠️ **Security:** In `findAllUsers`, we use `select` to choose which fields to return. We NEVER return the `password` field!

---

### Layer 2: Auth Service (`src/services/authService.js`)

This file handles the **business logic**: hashing passwords, comparing passwords, creating JWT tokens.

Create the file `src/services/authService.js`:

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

  // Step 2: Hash the password
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  // Step 3: Save to database
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

  // Step 2: Compare password with hash
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

**Register flow explained:**

```mermaid
flowchart TD
    A["User sends name, email, password"] --> B{"Does email\nalready exist?"}
    B -->|"Yes"| C["Return error:\nEmail already exists"]
    B -->|"No"| D["Hash password\nwith bcrypt"]
    D --> E["Save user\nto database"]
    E --> F["Return success\n(without password!)"]
```

**Login flow explained:**

```mermaid
flowchart TD
    A["User sends email, password"] --> B{"Does user\nexist?"}
    B -->|"No"| C["Return error:\nInvalid credentials"]
    B -->|"Yes"| D{"Does password\nmatch hash?"}
    D -->|"No"| C
    D -->|"Yes"| E["Create JWT token"]
    E --> F["Return token + user info"]
```

> 💡 **Security tip:** We say "Invalid email or password" for BOTH wrong email and wrong password. This way, a hacker cannot tell if an email exists in our system.

---

### Layer 3: Auth Controller (`src/controllers/authController.js`)

This file handles HTTP: reads the request, calls the service, sends the response.

Create the file `src/controllers/authController.js`:

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

**What is `req` and `res`?**

| Object | Full Name | Purpose |
|--------|-----------|---------|
| `req` | Request | Contains all the data the client sent (body, headers, URL params) |
| `res` | Response | We use this to send data back to the client |

**How we read data from the request:**

| Source | How to Read | Example |
|--------|------------|---------|
| Request body (JSON) | `req.body.email` | Data sent in POST requests |
| URL parameter | `req.params.id` | `/api/students/5` → `req.params.id = "5"` |
| Query string | `req.query.date` | `/api/attendance?date=2026-04-28` → `req.query.date = "2026-04-28"` |
| Headers | `req.headers.authorization` | The JWT token |

---

### The Auth Middleware (`src/middlewares/authMiddleware.js`)

A **middleware** is a function that runs BEFORE the controller. Think of it as a security guard at a door.

```mermaid
flowchart LR
    A["Request arrives"] --> B["Middleware\n(Security Guard)"]
    B -->|"Has valid token?"| C["Controller\n(Let them in)"]
    B -->|"No token or bad token"| D["REJECTED\n401 Unauthorized"]
```

Create the file `src/middlewares/authMiddleware.js`:

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

**The difference between 401 and 403:**

| Code | Meaning | Example |
|------|---------|---------|
| `401 Unauthorized` | You are NOT logged in | No token or expired token |
| `403 Forbidden` | You ARE logged in but NOT allowed | A teacher trying to create a classroom (admin-only) |

> 💡 **What is `next()`?** In Express, middleware functions receive three arguments: `req`, `res`, and `next`. Calling `next()` tells Express: "I am done. Continue to the next function in the chain."

---

### Auth Routes (`src/routes/authRoutes.js`)

This file defines the URLs for auth and connects them to the controller.

Create the file `src/routes/authRoutes.js`:

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
    M->>M: Check JWT token
    M->>M: authorizeRoles("admin")
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

## 11. 🏫 Step 5 — Building the Classroom System

Now we follow the same pattern: Repository → Service → Controller → Routes.

### Classroom Repository (`src/repositories/classroomRepository.js`)

```javascript
import prisma from "../config/db.js";

// Create a new classroom
async function createClassroom(name, section, teacherId) {
  const classroom = await prisma.classroom.create({
    data: {
      name: name,
      section: section,
      teacherId: teacherId,
    },
  });
  return classroom;
}

// Get all classrooms (with teacher name)
async function findAllClassrooms() {
  const classrooms = await prisma.classroom.findMany({
    include: {
      teacher: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
  return classrooms;
}

// Get one classroom by its ID
async function findClassroomById(id) {
  const classroom = await prisma.classroom.findUnique({
    where: {
      id: id,
    },
    include: {
      teacher: {
        select: { id: true, name: true, email: true },
      },
      students: true,
    },
  });
  return classroom;
}

// Get classrooms assigned to a specific teacher
async function findClassroomsByTeacherId(teacherId) {
  const classrooms = await prisma.classroom.findMany({
    where: {
      teacherId: teacherId,
    },
    include: {
      students: true,
    },
  });
  return classrooms;
}

export {
  createClassroom,
  findAllClassrooms,
  findClassroomById,
  findClassroomsByTeacherId,
};
```

**New Prisma concept: `include`**

| Prisma Feature | What It Does | SQL Equivalent |
|---------------|-------------|----------------|
| `include: { teacher: true }` | Also fetch the related teacher data | `INNER JOIN users ON ...` |
| `select: { name: true }` | Only fetch specific fields | `SELECT name FROM ...` |

> 💡 `include` is like the JOIN queries we wrote on Day 1! Prisma makes it much easier.

### Classroom Service (`src/services/classroomService.js`)

```javascript
import * as classroomRepository from "../repositories/classroomRepository.js";

async function createClassroom(name, section, teacherId) {
  if (!name || !teacherId) {
    return {
      success: false,
      message: "Classroom name and teacher ID are required.",
      data: null,
    };
  }

  const classroom = await classroomRepository.createClassroom(name, section, teacherId);

  return {
    success: true,
    message: "Classroom created successfully.",
    data: classroom,
  };
}

async function getAllClassrooms() {
  const classrooms = await classroomRepository.findAllClassrooms();
  return {
    success: true,
    message: "Classrooms retrieved successfully.",
    data: classrooms,
  };
}

async function getClassroomById(id) {
  const classroom = await classroomRepository.findClassroomById(id);

  if (!classroom) {
    return {
      success: false,
      message: "Classroom not found.",
      data: null,
    };
  }

  return {
    success: true,
    message: "Classroom retrieved successfully.",
    data: classroom,
  };
}

async function getClassroomsByTeacherId(teacherId) {
  const classrooms = await classroomRepository.findClassroomsByTeacherId(teacherId);
  return {
    success: true,
    message: "Teacher's classrooms retrieved successfully.",
    data: classrooms,
  };
}

export {
  createClassroom,
  getAllClassrooms,
  getClassroomById,
  getClassroomsByTeacherId,
};
```

### Classroom Controller (`src/controllers/classroomController.js`)

```javascript
import * as classroomService from "../services/classroomService.js";

// POST /api/classrooms
async function createClassroom(req, res) {
  try {
    const name = req.body.name;
    const section = req.body.section;
    const teacherId = req.body.teacherId;

    const result = await classroomService.createClassroom(name, section, teacherId);

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(201).json(result);
  } catch (error) {
    console.error("Create classroom error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again.",
      data: null,
    });
  }
}

// GET /api/classrooms
async function getAllClassrooms(req, res) {
  try {
    const result = await classroomService.getAllClassrooms();
    return res.status(200).json(result);
  } catch (error) {
    console.error("Get classrooms error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again.",
      data: null,
    });
  }
}

// GET /api/classrooms/:id
async function getClassroomById(req, res) {
  try {
    const id = parseInt(req.params.id);
    const result = await classroomService.getClassroomById(id);

    if (!result.success) {
      return res.status(404).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("Get classroom error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again.",
      data: null,
    });
  }
}

// GET /api/classrooms/teacher/:teacherId
async function getClassroomsByTeacher(req, res) {
  try {
    const teacherId = parseInt(req.params.teacherId);
    const result = await classroomService.getClassroomsByTeacherId(teacherId);
    return res.status(200).json(result);
  } catch (error) {
    console.error("Get teacher classrooms error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again.",
      data: null,
    });
  }
}

export {
  createClassroom,
  getAllClassrooms,
  getClassroomById,
  getClassroomsByTeacher,
};
```

> 💡 **Notice `parseInt(req.params.id)`** — URL parameters are always strings. `"/5"` is a string `"5"`. We use `parseInt()` to convert it to a number `5`, because our database expects numbers for IDs.

### Classroom Routes (`src/routes/classroomRoutes.js`)

```javascript
import express from "express";
const router = express.Router();

import { createClassroom, getAllClassrooms, getClassroomById, getClassroomsByTeacher } from "../controllers/classroomController.js";
import { verifyToken, authorizeRoles } from "../middlewares/authMiddleware.js";

// Admin only: create a new classroom
router.post("/", verifyToken, authorizeRoles("admin"), createClassroom);

// Any logged-in user: get all classrooms
router.get("/", verifyToken, getAllClassrooms);

// Any logged-in user: get one classroom
router.get("/:id", verifyToken, getClassroomById);

// Any logged-in user: get a teacher's classrooms
router.get("/teacher/:teacherId", verifyToken, getClassroomsByTeacher);

export default router;
```

---

## 12. 👩‍🎓 Step 6 — Building the Student System

### Student Repository (`src/repositories/studentRepository.js`)

```javascript
import prisma from "../config/db.js";

async function createStudent(name, email, registrationNumber, classroomId) {
  const student = await prisma.student.create({
    data: {
      name: name,
      email: email,
      registrationNumber: registrationNumber,
      classroomId: classroomId,
    },
  });
  return student;
}

async function findAllStudents() {
  const students = await prisma.student.findMany({
    include: {
      classroom: {
        select: { id: true, name: true, section: true },
      },
    },
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
  const students = await prisma.student.findMany({
    where: { classroomId: classroomId },
  });
  return students;
}

export {
  createStudent,
  findAllStudents,
  findStudentById,
  findStudentsByClassroomId,
};
```

### Student Service (`src/services/studentService.js`)

```javascript
import * as studentRepository from "../repositories/studentRepository.js";

async function createStudent(name, email, registrationNumber, classroomId) {
  if (!name || !email || !registrationNumber || !classroomId) {
    return {
      success: false,
      message: "All fields are required: name, email, registrationNumber, classroomId.",
      data: null,
    };
  }

  const student = await studentRepository.createStudent(
    name, email, registrationNumber, classroomId
  );

  return {
    success: true,
    message: "Student created successfully.",
    data: student,
  };
}

async function getAllStudents() {
  const students = await studentRepository.findAllStudents();
  return {
    success: true,
    message: "Students retrieved successfully.",
    data: students,
  };
}

async function getStudentById(id) {
  const student = await studentRepository.findStudentById(id);
  if (!student) {
    return {
      success: false,
      message: "Student not found.",
      data: null,
    };
  }
  return {
    success: true,
    message: "Student retrieved successfully.",
    data: student,
  };
}

async function getStudentsByClassroomId(classroomId) {
  const students = await studentRepository.findStudentsByClassroomId(classroomId);
  return {
    success: true,
    message: "Students retrieved successfully.",
    data: students,
  };
}

export {
  createStudent,
  getAllStudents,
  getStudentById,
  getStudentsByClassroomId,
};
```

### Student Controller (`src/controllers/studentController.js`)

```javascript
import * as studentService from "../services/studentService.js";

// POST /api/students
async function createStudent(req, res) {
  try {
    const name = req.body.name;
    const email = req.body.email;
    const registrationNumber = req.body.registrationNumber;
    const classroomId = req.body.classroomId;

    const result = await studentService.createStudent(
      name, email, registrationNumber, classroomId
    );

    if (!result.success) {
      return res.status(400).json(result);
    }
    return res.status(201).json(result);
  } catch (error) {
    console.error("Create student error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again.",
      data: null,
    });
  }
}

// GET /api/students
async function getAllStudents(req, res) {
  try {
    const result = await studentService.getAllStudents();
    return res.status(200).json(result);
  } catch (error) {
    console.error("Get students error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again.",
      data: null,
    });
  }
}

// GET /api/students/:id
async function getStudentById(req, res) {
  try {
    const id = parseInt(req.params.id);
    const result = await studentService.getStudentById(id);
    if (!result.success) {
      return res.status(404).json(result);
    }
    return res.status(200).json(result);
  } catch (error) {
    console.error("Get student error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again.",
      data: null,
    });
  }
}

// GET /api/students/classroom/:classroomId
async function getStudentsByClassroom(req, res) {
  try {
    const classroomId = parseInt(req.params.classroomId);
    const result = await studentService.getStudentsByClassroomId(classroomId);
    return res.status(200).json(result);
  } catch (error) {
    console.error("Get classroom students error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again.",
      data: null,
    });
  }
}

export {
  createStudent,
  getAllStudents,
  getStudentById,
  getStudentsByClassroom,
};
```

### Student Routes (`src/routes/studentRoutes.js`)

```javascript
import express from "express";
const router = express.Router();

import { createStudent, getAllStudents, getStudentById, getStudentsByClassroom } from "../controllers/studentController.js";
import { verifyToken, authorizeRoles } from "../middlewares/authMiddleware.js";

// Admin or Teacher: create a new student
router.post("/", verifyToken, authorizeRoles("admin", "teacher"), createStudent);

// Any logged-in user: get all students
router.get("/", verifyToken, getAllStudents);

// Any logged-in user: get one student
router.get("/:id", verifyToken, getStudentById);

// Any logged-in user: get students in a classroom
router.get("/classroom/:classroomId", verifyToken, getStudentsByClassroom);

export default router;
```

---

## 13. 📝 Step 7 — Building the Attendance System

This is the most important system. Teachers use it every day to mark attendance.

### Attendance Repository (`src/repositories/attendanceRepository.js`)

```javascript
import prisma from "../config/db.js";

// Mark attendance for ONE student
async function createAttendance(studentId, classroomId, date, status, markedBy) {
  const record = await prisma.attendance.create({
    data: {
      studentId: studentId,
      classroomId: classroomId,
      date: new Date(date),
      status: status,
      markedBy: markedBy,
    },
  });
  return record;
}

// Get attendance for a classroom on a date
async function findAttendanceByClassroomAndDate(classroomId, date) {
  const records = await prisma.attendance.findMany({
    where: {
      classroomId: classroomId,
      date: new Date(date),
    },
    include: {
      student: {
        select: { id: true, name: true, registrationNumber: true },
      },
    },
  });
  return records;
}

// Get attendance history for a student
async function findAttendanceByStudentId(studentId) {
  const records = await prisma.attendance.findMany({
    where: { studentId: studentId },
    include: {
      classroom: {
        select: { id: true, name: true },
      },
    },
    orderBy: { date: "desc" },
  });
  return records;
}

// Check if attendance already exists for a student on a date
async function findExistingAttendance(studentId, date) {
  const existing = await prisma.attendance.findFirst({
    where: {
      studentId: studentId,
      date: new Date(date),
    },
  });
  return existing;
}

export {
  createAttendance,
  findAttendanceByClassroomAndDate,
  findAttendanceByStudentId,
  findExistingAttendance,
};
```

> 💡 **`new Date(date)`** — The `date` comes from the client as a string like `"2026-04-28"`. We need to convert it to a JavaScript `Date` object for Prisma to understand it.

> 💡 **`orderBy: { date: "desc" }`** — This sorts results from newest to oldest. `"desc"` = descending. `"asc"` = ascending.

### Attendance Service (`src/services/attendanceService.js`)

```javascript
import * as attendanceRepository from "../repositories/attendanceRepository.js";

// Mark attendance for one student
async function markAttendance(studentId, classroomId, date, status, markedBy) {
  if (!studentId || !classroomId || !date || !status || !markedBy) {
    return {
      success: false,
      message: "All fields are required: studentId, classroomId, date, status.",
      data: null,
    };
  }

  // Validate status
  const allowedStatuses = ["present", "absent", "late"];
  if (!allowedStatuses.includes(status)) {
    return {
      success: false,
      message: "Status must be 'present', 'absent', or 'late'.",
      data: null,
    };
  }

  // Check for duplicates
  const existing = await attendanceRepository.findExistingAttendance(studentId, date);
  if (existing) {
    return {
      success: false,
      message: "Attendance already marked for this student on this date.",
      data: null,
    };
  }

  const record = await attendanceRepository.createAttendance(
    studentId, classroomId, date, status, markedBy
  );

  return {
    success: true,
    message: "Attendance marked successfully.",
    data: record,
  };
}

// Mark attendance for multiple students at once
async function markBulkAttendance(attendanceList, markedBy) {
  if (!attendanceList || attendanceList.length === 0) {
    return {
      success: false,
      message: "Attendance list cannot be empty.",
      data: null,
    };
  }

  const results = [];
  const errors = [];

  for (let i = 0; i < attendanceList.length; i++) {
    const item = attendanceList[i];
    const result = await markAttendance(
      item.studentId, item.classroomId, item.date, item.status, markedBy
    );

    if (result.success) {
      results.push(result.data);
    } else {
      errors.push({ studentId: item.studentId, error: result.message });
    }
  }

  return {
    success: true,
    message: results.length + " saved, " + errors.length + " errors.",
    data: { saved: results, errors: errors },
  };
}

// Get attendance for a classroom on a date
async function getAttendanceByClassroomAndDate(classroomId, date) {
  if (!classroomId || !date) {
    return {
      success: false,
      message: "Classroom ID and date are required.",
      data: null,
    };
  }

  const records = await attendanceRepository.findAttendanceByClassroomAndDate(
    classroomId, date
  );

  return {
    success: true,
    message: "Attendance records retrieved successfully.",
    data: records,
  };
}

// Get attendance history for a student
async function getAttendanceByStudentId(studentId) {
  const records = await attendanceRepository.findAttendanceByStudentId(studentId);
  return {
    success: true,
    message: "Student attendance history retrieved successfully.",
    data: records,
  };
}

export {
  markAttendance,
  markBulkAttendance,
  getAttendanceByClassroomAndDate,
  getAttendanceByStudentId,
};
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

// POST /api/attendance
async function markAttendance(req, res) {
  try {
    const studentId = req.body.studentId;
    const classroomId = req.body.classroomId;
    const date = req.body.date;
    const status = req.body.status;
    const markedBy = req.user.userId; // From auth middleware

    const result = await attendanceService.markAttendance(
      studentId, classroomId, date, status, markedBy
    );

    if (!result.success) {
      return res.status(400).json(result);
    }
    return res.status(201).json(result);
  } catch (error) {
    console.error("Mark attendance error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again.",
      data: null,
    });
  }
}

// POST /api/attendance/bulk
async function markBulkAttendance(req, res) {
  try {
    const attendanceList = req.body.attendanceList;
    const markedBy = req.user.userId;

    const result = await attendanceService.markBulkAttendance(attendanceList, markedBy);

    if (!result.success) {
      return res.status(400).json(result);
    }
    return res.status(201).json(result);
  } catch (error) {
    console.error("Bulk attendance error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again.",
      data: null,
    });
  }
}

// GET /api/attendance/classroom/:classroomId?date=2026-04-28
async function getAttendanceByClassroom(req, res) {
  try {
    const classroomId = parseInt(req.params.classroomId);
    const date = req.query.date; // From the URL query string

    const result = await attendanceService.getAttendanceByClassroomAndDate(
      classroomId, date
    );

    if (!result.success) {
      return res.status(400).json(result);
    }
    return res.status(200).json(result);
  } catch (error) {
    console.error("Get classroom attendance error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again.",
      data: null,
    });
  }
}

// GET /api/attendance/student/:studentId
async function getAttendanceByStudent(req, res) {
  try {
    const studentId = parseInt(req.params.studentId);
    const result = await attendanceService.getAttendanceByStudentId(studentId);
    return res.status(200).json(result);
  } catch (error) {
    console.error("Get student attendance error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again.",
      data: null,
    });
  }
}

export {
  markAttendance,
  markBulkAttendance,
  getAttendanceByClassroom,
  getAttendanceByStudent,
};
```

> 💡 **`req.user.userId`** — Remember, the `verifyToken` middleware puts the decoded JWT data into `req.user`. So `req.user.userId` is the ID of the currently logged-in teacher. We use this for the `markedBy` field.

> 💡 **`req.query.date`** — For the URL `/api/attendance/classroom/1?date=2026-04-28`, `req.query.date` equals `"2026-04-28"`. The `?` in a URL starts the "query string".

### Attendance Routes (`src/routes/attendanceRoutes.js`)

```javascript
import express from "express";
const router = express.Router();

import { markAttendance, markBulkAttendance, getAttendanceByClassroom, getAttendanceByStudent } from "../controllers/attendanceController.js";
import { verifyToken, authorizeRoles } from "../middlewares/authMiddleware.js";

// Teacher or Admin: mark attendance for one student
router.post("/", verifyToken, authorizeRoles("admin", "teacher"), markAttendance);

// Teacher or Admin: mark attendance for many students at once
router.post("/bulk", verifyToken, authorizeRoles("admin", "teacher"), markBulkAttendance);

// Any logged-in user: get attendance for a classroom on a date
router.get("/classroom/:classroomId", verifyToken, getAttendanceByClassroom);

// Any logged-in user: get attendance history for a student
router.get("/student/:studentId", verifyToken, getAttendanceByStudent);

export default router;
```

---

## 14. 🌐 Step 8 — The Main Server File

### CORS — Why Your Frontend Gets Blocked

When your React app (running on `http://localhost:3000`) tries to talk to your backend (running on `http://localhost:5000`), the browser **blocks** the request. This is called **CORS** (Cross-Origin Resource Sharing).

```mermaid
flowchart LR
    A["React App\nlocalhost:3000"] -->|"Request"| B["Browser\n(Security Check)"]
    B -->|"❌ BLOCKED!\nDifferent port = different origin"| C["Express API\nlocalhost:5000"]
```

**Why?** Browsers have a security rule: a website can only talk to the SAME server it came from. Different port = different origin = blocked.

**Solution:** Install the `cors` package. It tells the browser: "It is OK, allow requests from other origins."

```bash
npm install cors
```

```mermaid
flowchart LR
    A["React App\nlocalhost:3000"] -->|"Request"| B["Browser\n(Security Check)"]
    B -->|"✅ ALLOWED!\ncors() says it's OK"| C["Express API\nlocalhost:5000"]
```

### Create the Server File (`src/server.js`)

This is the main file. It brings everything together.

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
  console.log("  Server is running on http://localhost:" + PORT);
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

### API Testing Mindset — How Frontend Talks to Backend

Before we test with Postman, understand how the React frontend will communicate with our API:

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

> 💡 **Postman replaces React** during testing. Instead of clicking buttons in a React app, we manually send HTTP requests using Postman to make sure our API works correctly before building the frontend.

---

## 15. 🚀 Step 9 — Running the Server

### Quick Checklist Before Running

Make sure you have:
- [x] MySQL running with the `attendance_system_db` database (from Day 1)
- [x] The seed data inserted (from Day 1)
- [x] A `.env` file with your real MySQL password
- [x] All the source code files created

### Install All Dependencies

If you haven't installed all packages yet, run this one command:

```bash
npm install express cors dotenv bcrypt jsonwebtoken @prisma/client
npm install --save-dev prisma nodemon
```

### Generate Prisma Client

```bash
npx prisma generate
```

### Start the Server

```bash
npm run dev
```

You should see this in your terminal:

```
==============================================
  designHer 2.0 Attendance API
  Server is running on http://localhost:5000
==============================================
```

### Quick Test

Open your browser and go to: `http://localhost:5000/`

You should see:

```json
{
  "success": true,
  "message": "designHer 2.0 Attendance API is running!",
  "data": null
}
```

If you see this, your server is working! 🎉

### Common Errors and Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| `Cannot find module 'express'` | Packages not installed | Run `npm install` |
| `P1001: Can't reach database server` | MySQL is not running | Start MySQL in XAMPP or MySQL Workbench |
| `Invalid `prisma.user.findUnique()` invocation` | Prisma client not generated | Run `npx prisma generate` |
| `Error: secretOrPrivateKey must have a value` | JWT_SECRET not set in `.env` | Check your `.env` file |
| `Port 5000 is already in use` | Another server is running | Change PORT in `.env` to 5001 |

---

## 16. 🧪 Step 10 — Testing with Postman

### What is Postman?

Postman is a free tool to test APIs. Instead of building the React frontend first, we use Postman to send requests and check if our API works correctly.

> 🎯 **Analogy:** Postman is like a phone you use to call the restaurant (our API) and place orders, without going there in person.

### Install Postman

1. Go to [https://www.postman.com/downloads/](https://www.postman.com/downloads/)
2. Download and install the free version
3. Open Postman

### How to Use Postman — The Basics

```
+----------------------------------------------------------+
|  Postman                                                  |
+----------------------------------------------------------+
|                                                           |
|  [GET ▼]  [ http://localhost:5000/api/students  ] [Send]  |
|                                                           |
|  Headers | Body | Params                                  |
|  +------------------------------------------------------+ |
|  | Key              | Value                              | |
|  | Authorization    | Bearer eyJhbGciOiJ...              | |
|  +------------------------------------------------------+ |
|                                                           |
|  Response:                                                |
|  +------------------------------------------------------+ |
|  | {                                                     | |
|  |   "success": true,                                   | |
|  |   "message": "Students retrieved successfully.",      | |
|  |   "data": [...]                                      | |
|  | }                                                     | |
|  +------------------------------------------------------+ |
+----------------------------------------------------------+
```

**Key areas in Postman:**

| Area | Purpose |
|------|---------|
| **Method dropdown** | Choose GET, POST, PUT, DELETE |
| **URL bar** | Type the API URL |
| **Send button** | Send the request |
| **Headers tab** | Add headers (like the JWT token) |
| **Body tab** | Add JSON data (for POST requests) |
| **Response area** | See what the server sent back |

---

### Test 1: Check if Server is Running

```
Method: GET
URL:    http://localhost:5000/
Body:   (none)
```

**Expected response (Status: 200):**

```json
{
  "success": true,
  "message": "designHer 2.0 Attendance API is running!",
  "data": null
}
```

---

### Test 2: Login as Admin

We will login with the admin account from our seed data.

```
Method: POST
URL:    http://localhost:5000/api/auth/login
```

**How to add the Body:**
1. Click the **Body** tab
2. Select **raw**
3. Change the dropdown from "Text" to **JSON**
4. Type this:

```json
{
  "email": "amara@school.com",
  "password": "admin123"
}
```

5. Click **Send**

**Expected response (Status: 200):**

```json
{
  "success": true,
  "message": "Login successful.",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
    "user": {
      "id": 1,
      "name": "Amara Silva",
      "email": "amara@school.com",
      "role": "admin"
    }
  }
}
```

> ⭐ **IMPORTANT:** Copy the `token` value! You will need it for all the next tests. This token proves you are logged in.

---

### Test 3: Login as Teacher

```
Method: POST
URL:    http://localhost:5000/api/auth/login
Body (JSON):
```

```json
{
  "email": "nimal@school.com",
  "password": "teacher123"
}
```

> 💡 Save this token too! You can test with both admin and teacher tokens to see the difference in permissions.

---

### Test 4: Register a New User

```
Method: POST
URL:    http://localhost:5000/api/auth/register
Body (JSON):
```

```json
{
  "name": "Kavitha Perera",
  "email": "kavitha@school.com",
  "password": "mypassword123",
  "role": "teacher"
}
```

**Expected response (Status: 201):**

```json
{
  "success": true,
  "message": "User registered successfully.",
  "data": {
    "id": 4,
    "name": "Kavitha Perera",
    "email": "kavitha@school.com",
    "role": "teacher"
  }
}
```

---

### How to Add the JWT Token (For Protected Routes)

All the next tests need the JWT token. Here is how to add it:

```
+----------------------------------------------------------+
|  Headers tab:                                             |
|  +------------------------------------------------------+ |
|  | Key              | Value                              | |
|  | Authorization    | Bearer eyJhbGciOiJIUzI1NiIs...    | |
|  +------------------------------------------------------+ |
+----------------------------------------------------------+
```

1. Click the **Headers** tab
2. In the **Key** column, type: `Authorization`
3. In the **Value** column, type: `Bearer ` followed by your token
4. Make sure there is a **space** between `Bearer` and the token!

```
✅ Correct: Bearer eyJhbGciOiJIUzI1NiIs...
❌ Wrong:   BearereyJhbGciOiJIUzI1NiIs...    (no space!)
❌ Wrong:   eyJhbGciOiJIUzI1NiIs...          (missing "Bearer")
```

> 💡 **Tip in Postman:** You can also click the **Authorization** tab, choose **Bearer Token** from the dropdown, and paste just the token. Postman will add "Bearer " for you automatically.

---

### Test 5: Get My Info (Protected Route)

```
Method:  GET
URL:     http://localhost:5000/api/auth/me
Headers: Authorization: Bearer <your-token>
```

**Expected response (Status: 200):**

```json
{
  "success": true,
  "message": "User info retrieved successfully.",
  "data": {
    "id": 1,
    "role": "admin"
  }
}
```

---

### Test 6: Get All Users (Admin Only)

```
Method:  GET
URL:     http://localhost:5000/api/auth/users
Headers: Authorization: Bearer <admin-token>
```

> ⚠️ Try this with a **teacher token** — you will get a 403 Forbidden error! This proves our authorization is working.

---

### Test 7: Get All Classrooms

```
Method:  GET
URL:     http://localhost:5000/api/classrooms
Headers: Authorization: Bearer <your-token>
```

**Expected response:** List of classrooms with teacher info included.

---

### Test 8: Get One Classroom by ID

```
Method:  GET
URL:     http://localhost:5000/api/classrooms/1
Headers: Authorization: Bearer <your-token>
```

**Expected response:** Classroom 1 details with teacher and students.

---

### Test 9: Create a New Classroom (Admin Only)

```
Method:  POST
URL:     http://localhost:5000/api/classrooms
Headers: Authorization: Bearer <admin-token>
Body (JSON):
```

```json
{
  "name": "Batch 2026 - Data Science",
  "section": "Afternoon",
  "teacherId": 2
}
```

> ⚠️ Try this with a **teacher token** — you will get 403 Forbidden!

---

### Test 10: Get All Students

```
Method:  GET
URL:     http://localhost:5000/api/students
Headers: Authorization: Bearer <your-token>
```

---

### Test 11: Create a New Student

```
Method:  POST
URL:     http://localhost:5000/api/students
Headers: Authorization: Bearer <your-token>
Body (JSON):
```

```json
{
  "name": "Dilshan Wickramasinghe",
  "email": "dilshan@student.com",
  "registrationNumber": "STU-2026-005",
  "classroomId": 1
}
```

---

### Test 12: Get Students in a Classroom

```
Method:  GET
URL:     http://localhost:5000/api/students/classroom/1
Headers: Authorization: Bearer <your-token>
```

---

### Test 13: Mark Attendance for One Student

```
Method:  POST
URL:     http://localhost:5000/api/attendance
Headers: Authorization: Bearer <teacher-or-admin-token>
Body (JSON):
```

```json
{
  "studentId": 1,
  "classroomId": 1,
  "date": "2026-05-01",
  "status": "present"
}
```

> 💡 The `markedBy` field is filled automatically from the JWT token. You do not need to send it!

> ⚠️ Try sending the same request again — you will get an error: "Attendance already marked for this student on this date." This is the duplicate check working!

---

### Test 14: Mark Bulk Attendance

```
Method:  POST
URL:     http://localhost:5000/api/attendance/bulk
Headers: Authorization: Bearer <teacher-or-admin-token>
Body (JSON):
```

```json
{
  "attendanceList": [
    {
      "studentId": 1,
      "classroomId": 1,
      "date": "2026-05-02",
      "status": "present"
    },
    {
      "studentId": 2,
      "classroomId": 1,
      "date": "2026-05-02",
      "status": "late"
    }
  ]
}
```

---

### Test 15: Get Attendance for a Classroom on a Date

```
Method:  GET
URL:     http://localhost:5000/api/attendance/classroom/1?date=2026-04-28
Headers: Authorization: Bearer <your-token>
```

> 💡 Notice the `?date=2026-04-28` in the URL. This is a **query parameter**. Our controller reads it with `req.query.date`.

---

### Test 16: Get Attendance History for a Student

```
Method:  GET
URL:     http://localhost:5000/api/attendance/student/1
Headers: Authorization: Bearer <your-token>
```

**Expected response:** All attendance records for student 1 (Tharindu), sorted newest first.

---

### Test 17: Test Error Cases

Try these to make sure error handling works:

**1. Login with wrong password:**

```
POST /api/auth/login
Body: { "email": "amara@school.com", "password": "wrongpassword" }
Expected: 401 — "Invalid email or password."
```

**2. Access protected route without token:**

```
GET /api/students
Headers: (no Authorization header)
Expected: 401 — "Access denied. No token provided."
```

**3. Teacher tries admin-only route:**

```
POST /api/classrooms (with teacher token)
Expected: 403 — "Access denied. You do not have permission."
```

**4. Register with existing email:**

```
POST /api/auth/register
Body: { "name": "Test", "email": "amara@school.com", "password": "test123" }
Expected: 400 — "A user with this email already exists."
```

**5. Mark attendance with invalid status:**

```
POST /api/attendance
Body: { "studentId": 1, "classroomId": 1, "date": "2026-05-03", "status": "sick" }
Expected: 400 — "Status must be 'present', 'absent', or 'late'."
```

---

### Postman Testing Summary

```mermaid
flowchart TD
    A["1. Start server\nnpm run dev"] --> B["2. Test server\nGET /"]
    B --> C["3. Login\nPOST /api/auth/login"]
    C --> D["4. Copy the TOKEN"]
    D --> E["5. Add token to\nHeaders as Bearer Token"]
    E --> F["6. Test all\nGET endpoints"]
    F --> G["7. Test all\nPOST endpoints"]
    G --> H["8. Test error cases\n(wrong password, no token, etc.)"]
```

---

## 🎉 Congratulations! You Did It!

You just built a complete REST API from scratch! Here is what you learned:

| Topic | What You Learned |
|-------|-----------------|
| **HTTP** | Requests, Responses, Methods (GET, POST), Status Codes |
| **REST API** | Resource-based URLs, JSON responses |
| **Layered Architecture** | Route → Middleware → Controller → Service → Repository |
| **Express.js** | Creating a server, routes, middleware, `req` and `res` |
| **Prisma ORM** | Schema, models, queries (findMany, create, findUnique) |
| **Password Security** | Plain text danger, bcrypt hashing, salting |
| **JWT Authentication** | Login tokens, verifying tokens, protecting routes |
| **Authorization** | Role-based access (admin vs teacher) |
| **CORS** | Why browsers block requests and how to fix it |
| **Environment Variables** | Keeping secrets safe with `.env` |
| **Error Handling** | try/catch, consistent JSON error responses |
| **Async/Await** | How JavaScript waits for database operations |

> **Next up (Day 3):** We will build the React frontend that connects to this API! We will use `fetch()` to call these endpoints, save the JWT token in localStorage, and build the attendance dashboard.

---

## 📦 Final package.json

For reference, here is the complete `package.json` with all dependencies:

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
  "keywords": [],
  "author": "designHer Bootcamp 2026",
  "license": "ISC",
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

> Made with ❤️ for **designHer 2.0 Bootcamp 2026**
