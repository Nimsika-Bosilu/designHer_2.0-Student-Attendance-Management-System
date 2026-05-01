# 🚀 Day 2 — Building the Backend REST API (Build-Test-Repeat Master Guide)

> **Day 2 of designHer 2.0 Bootcamp**
> Today we build the backend REST API using Node.js, Express, and Prisma!
> We will build this app **phase by phase**, testing each phase before moving on.

> 💡 **How to use this guide:** Every file has a `🚀 FULL CODE (READY TO COPY)` block. Copy it, paste it into the correct file, and save. Then **test** before moving to the next phase. There are ZERO placeholders here.

---

## 🗺️ The Big Picture — Where Are We?

Yesterday (Day 1), we built the **database** — the storage box for our data.
Today (Day 2), we build the **backend API** — the brain that reads, writes, and protects our data.
Tomorrow (Day 3), we build the **frontend** — the face that users see.

```mermaid
flowchart LR
    A["👩‍💻 React Frontend\n(Day 3)"] -->|"HTTP Requests"| B["⚙️ Express Backend\n(Day 2 — TODAY!)"]
    B -->|"Prisma Queries"| C["🗄️ MySQL Database\n(Day 1)"]
```

### The Architecture — The Restaurant Analogy

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

## 🏗️ Phase 1: Foundation (Setup & Server)

> **Goal:** Get a running Express server that responds "API is running!" when you visit it.

```mermaid
flowchart LR
    A["👩‍💻 You\n(Browser)"] -->|"GET http://localhost:5000/"| B["⚙️ Express Server"]
    B -->|"200 OK\n'API is running!'"| A
```

### Step 1: Create the Project

```bash
mkdir backend
cd backend
```

### Step 2: Initialize the Project

```bash
npm init -y
```

This creates a `package.json` file — the ID card of our project.

### Step 3: Install the Packages We Need

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

| Line | Why did we write this? |
|------|------------------------|
| `npm init -y` | Creates `package.json`. The `-y` flag says "yes to all default questions." |
| `npm install express cors ...` | Downloads these packages into `node_modules/` and adds them to `package.json`. |
| `npm install --save-dev prisma nodemon` | `--save-dev` means "I only need these during development, not in production." |

### Step 4: Update package.json

Open `package.json` and add `"type": "module"` and update the scripts:

```json
  "main": "src/server.js",
  "type": "module",
  "scripts": {
    "dev": "nodemon src/server.js",
    "start": "node src/server.js"
  }
```

| Line | Why did we write this? |
|------|------------------------|
| `"type": "module"` | Lets us use modern `import`/`export` syntax instead of the older `require()`. |
| `"dev": "nodemon src/server.js"` | `npm run dev` runs the server with auto-restart (for development). |
| `"start": "node src/server.js"` | `npm start` runs the server normally (for production). |

### Step 5: Create the Folder Structure

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

### Step 6: Write the Minimal Server

> 💡 We write a **minimal** server.js first — just enough to test that Express works. We will expand it later after building all the route files.

#### ❌ The Problem — Browser Blocks Your Frontend!

You build your React app on `http://localhost:5173`. Your API runs on `http://localhost:5000`. You try to call the API from React. But the browser **blocks** the request!

```mermaid
flowchart LR
    A["React App\nlocalhost:5173"] -->|"Request"| B["Browser\n(Security Check)"]
    B -->|"❌ BLOCKED!\nDifferent port = different origin"| C["Express API\nlocalhost:5000"]
```

**Why?** Browsers have a security rule called **CORS** (Cross-Origin Resource Sharing): a website can only talk to the SAME server it came from. Different port = different origin = blocked.

#### ✅ The Solution — cors() middleware

The `cors` package tells the browser: "It is OK, allow requests from other origins."

```mermaid
flowchart LR
    A["React App\nlocalhost:5173"] -->|"Request"| B["Browser\n(Security Check)"]
    B -->|"✅ ALLOWED!\ncors() says it's OK"| C["Express API\nlocalhost:5000"]
```

#### 📁 File: `src/server.js` (Minimal Version)

#### 🚀 FULL CODE (READY TO COPY)

```javascript
// Step 1: Load environment variables (MUST be first!)
import "dotenv/config";

// Step 2: Import packages
import express from "express";
import cors from "cors";

// Step 3: Create the Express app
const app = express();

// Step 4: Add middleware
app.use(cors());          // Allow React frontend to connect
app.use(express.json());  // Parse JSON request bodies

// Step 5: Test route
app.get("/", function (req, res) {
  res.json({
    success: true,
    message: "designHer 2.0 Attendance API is running!",
    data: null,
  });
});

// Step 6: Start the server
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

| Line | Why did we write this? |
|------|------------------------|
| `import "dotenv/config"` | Loads `.env` file into `process.env`. MUST be first! |
| `import express from "express"` | Gets the Express framework. |
| `const app = express()` | Creates a new Express application. |
| `app.use(cors())` | Allows cross-origin requests (fixes CORS errors from React). |
| `app.use(express.json())` | Makes Express understand JSON bodies (`req.body`). Without this, `req.body` is always `undefined`! |
| `app.get("/", ...)` | When someone visits `http://localhost:5000/`, send back a JSON message. |
| `app.listen(PORT, ...)` | Starts the server on port 5000 and prints a message to the console. |

**Deep dive — The magical `app.use()`:**

In Express, `app.use()` is how you add things to the global middleware pipeline. Every single request that hits your server goes through this pipeline from top to bottom.

**`app.use(cors())`** — Think of CORS like a bouncer at a club who hates people from other neighborhoods. If the React frontend (living at `localhost:5173`) tries to talk to the Express backend (`localhost:5000`), the browser blocks it because they are from different "neighborhoods" (ports). `cors()` tells the browser: "It is fine, let everyone in."

**`app.use(express.json())`** — By default, Express is dumb. If a frontend sends `{ "name": "Nimal" }` in a POST request, Express just sees a confusing stream of raw text bytes. `express.json()` intercepts the request, reads the raw text, converts it into a neat JavaScript object, and attaches it to `req.body`. Without this line, `req.body` will always be `undefined`, and your app will break!

> ⚠️ **What could go wrong?**
> If you forget `app.use(express.json())`, every `req.body` will be `undefined`. Your register and login will silently fail because `req.body.email` returns `undefined`.

### 🧪 Phase 1 Test: Is the Server Alive?

```bash
npm run dev
```

You should see:
```
==============================================
  designHer 2.0 Attendance API
  Server is running on http://localhost:5000
==============================================
```

**Test in Postman:**
```
Method: GET
URL:    http://localhost:5000/
```

**What to look for:**
```json
{ "success": true, "message": "designHer 2.0 Attendance API is running!", "data": null }
```

✅ If you see this, Phase 1 is complete! Your server is alive.

| Common Error | Cause | Fix |
|-------------|-------|-----|
| `Cannot find module 'express'` | Packages not installed | Run `npm install` |
| `Port 5000 is already in use` | Another server is running | Change PORT in `.env` to 5001, or close the other server |

---

## 🔐 Phase 2: Database & Security (The Fridge & The Safe)

> **Goal:** Connect to our Day 1 MySQL database using Prisma and learn how to keep secrets safe.

```mermaid
flowchart TD
    A["Phase 2 Goal"] --> B["1. Keep secrets safe\n(.env file)"]
    A --> C["2. Connect to MySQL\n(Prisma ORM)"]
    A --> D["3. Share code between files\n(import/export)"]
```

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

#### 🎬 Scenario: Amara's Mistake

Amara (our admin) is excited after Day 1. She hardcodes her MySQL password `MySecretPassword123` into `server.js` and pushes it to GitHub. Within 30 seconds, a bot finds the password. Next morning, her entire `attendance_system_db` database is gone. All student records — deleted. She has to rebuild everything from scratch. This is preventable.

### ✅ The Solution — Environment Variables (.env)

Instead of writing passwords in the code, we put them in a **secret file** called `.env` that NEVER gets pushed to GitHub.

```mermaid
flowchart LR
    A[".env file\n(SECRET — stays on your laptop)"] -->|"dotenv loads it"| B["process.env\n(available in your code)"]
    C[".env.example\n(TEMPLATE — pushed to GitHub)"] -->|"Shows the format"| D["Other developers\nknow what to fill in"]
```

#### 📁 File: `.env`

Create a file called `.env` in the `backend/` folder:

#### 🚀 FULL CODE (READY TO COPY)

```env
# Database Connection
DATABASE_URL="mysql://root:YOUR_MYSQL_PASSWORD@localhost:3306/attendance_system_db"

# JWT Secret Key (any random string — make it long!)
JWT_SECRET="designher-bootcamp-2026-super-secret-key"

# Server Port
PORT=5000
```

> ⚠️ Replace `YOUR_MYSQL_PASSWORD` with your actual MySQL password.

| Line | Why did we write this? |
|------|------------------------|
| `DATABASE_URL` | The full connection string for Prisma to reach our MySQL database. |
| `JWT_SECRET` | A secret key used to sign JWT tokens. Anyone who knows this can create fake tokens! |
| `PORT` | Which port our server listens on. |

#### 📁 File: `.env.example`

This file is a **template** that you push to GitHub. It shows other developers what variables they need, but without the real values:

#### 🚀 FULL CODE (READY TO COPY)

```env
# Database Connection
DATABASE_URL="mysql://root:YOUR_PASSWORD@localhost:3306/attendance_system_db"

# JWT Secret Key
JWT_SECRET="your-secret-key-here"

# Server Port
PORT=5000
```

#### 📁 File: `.gitignore`

This tells Git to NEVER push certain files:

#### 🚀 FULL CODE (READY TO COPY)

```
node_modules/
.env
```

#### How to Use Environment Variables in Code

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

### Connecting to the Database with Prisma

#### ❌ The Problem — Writing Raw SQL is Painful

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

#### ✅ The Solution — Prisma ORM

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

#### Set Up Prisma

```bash
npx prisma init
```

This creates a `prisma/` folder with a `schema.prisma` file.

#### 📁 File: `prisma/schema.prisma`

#### 🚀 FULL CODE (READY TO COPY)

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

| Prisma Code | What It Does |
|-------------|-------------|
| `@id` | This field is the primary key |
| `@default(autoincrement())` | Auto-generates 1, 2, 3... |
| `@unique` | No two records can have the same value |
| `@map("teacher_id")` | JavaScript uses `teacherId` but the database column is `teacher_id` |
| `@@map("users")` | JavaScript uses `User` but the database table is `users` |
| `@relation` | Defines a relationship between tables (like FOREIGN KEY) |
| `@@unique([studentId, date])` | A student can only have ONE attendance record per day |

#### Generate the Prisma Client

```bash
npx prisma generate
```

This creates the Prisma client code that we can use in our JavaScript files.

---

### The "Locked Room" — How Import/Export Works

#### ❌ The Problem — The 5000-Line Nightmare

Imagine if we didn't have `import` and `export`. We would have to write the ENTIRE backend — database logic, user auth, students, teachers, routes — inside a single `server.js` file. It would be 5000 lines long! Finding a bug would be a nightmare. We need a way to split our code into smaller, organized files.

#### ✅ The Solution — Modules (The "Locked Room" Analogy)

In Node.js, every `.js` file is like a **"Locked Room"**.

If you create a function or a variable inside `db.js`, the rest of your app cannot see it or use it. It is locked inside that room.

- **`export`** is like opening a small window in the door and handing the function outside. "Here, anyone can use this."
- **`import`** is another file standing at the window to receive it. "I need that function!"

**The Two Types of Exports:**

1. **Default Export (`export default`)**
   Use this when a file has **ONE main boss** to share.
   *Example:* `db.js` only exports the `prisma` client.
   *How to import:* You can name it whatever you want: `import myDatabase from "./db.js"`.

2. **Named Export (`export { ... }`)**
   Use this when a file shares **multiple tools**.
   *Example:* `authRepository.js` exports `findUser`, `createUser`, and `deleteUser`.
   *How to import:* You MUST use the exact names in curly braces: `import { createUser } from "./authRepository.js"`.

```mermaid
flowchart LR
    A["📦 db.js\n(The Locked Room)"] -->|"export default prisma\n(Hands it out the window)"| B["import prisma...\n(Receives it)"]
    C["authRepository.js\n(Another Room)"] -->|"import prisma"| A
```

> ⚠️ **ESM Rule:** In modern JavaScript (ESM), you MUST include the `.js` file extension in your imports. `"../config/db"` will NOT work — it must be `"../config/db.js"`. This is different from CommonJS `require()` which allows omitting extensions.

---

### Create the Database Connection File

#### 📁 File: `src/config/db.js`

#### 🚀 FULL CODE (READY TO COPY)

```javascript
// Import PrismaClient from the Prisma package
import { PrismaClient } from "@prisma/client";

// Create a new Prisma client instance
const prisma = new PrismaClient();

// Export it so other files can use it
export default prisma;
```

| Line | Why did we write this? |
|------|------------------------|
| `import { PrismaClient } from "@prisma/client"` | Gets the Prisma tool from the package we installed. The `{ }` curly braces mean "I only want this ONE thing from the package." |
| `const prisma = new PrismaClient()` | Creates a new connection to our database. `new` creates a fresh instance. This is like dialing the phone number to the database. We only want to do this ONCE for the whole app. |
| `export default prisma` | Shares this connection with all other files. `export default` means "this is the MAIN thing this file provides." Other files can `import prisma from "./config/db.js"` to use it. |

> ⚠️ **Why only ONE Prisma client?** Every `new PrismaClient()` opens a connection pool to the database. If every file created its own, you would quickly run out of connections and your database would crash. By creating it once and sharing it, we use just one efficient connection pool.

```mermaid
flowchart TD
    A["db.js\n(Creates ONE Prisma client)"] --> B["authRepository.js\nimport prisma from db.js"]
    A --> C["classroomRepository.js\nimport prisma from db.js"]
    A --> D["studentRepository.js\nimport prisma from db.js"]
    A --> E["attendanceRepository.js\nimport prisma from db.js"]
```

### 🧪 Phase 2 Test: Can Prisma Talk to Your Database?

```bash
npx prisma generate
```

**What to look for:**
```
✔ Generated Prisma Client (vX.X.X) to ./node_modules/@prisma/client
```

✅ If you see this, Phase 2 is complete! Prisma can talk to your database.

| Common Error | Cause | Fix |
|-------------|-------|-----|
| `P1001: Can't reach database server` | MySQL is not running | Start MySQL in XAMPP |
| `Error: schema.prisma not found` | You didn't run `npx prisma init` | Run it from the `backend/` folder |
| `Error loading .env file` | `.env` file is missing or in wrong location | Make sure `.env` is in `backend/`, not `backend/src/` |

---

## 🔑 Phase 3: The Register Slice (Repository → Service → Controller → Route)

> **Goal:** Build the complete Register feature — from database to URL — and test it in Postman.

We build this slice through ALL the layers so you can see how they connect:

```mermaid
sequenceDiagram
    participant P as Postman
    participant R as authRoutes
    participant C as authController
    participant S as authService
    participant RP as authRepository
    participant DB as Database

    P->>R: POST /api/auth/register { name, email, password }
    R->>C: register(req, res)
    C->>S: registerUser(name, email, password, role)
    S->>RP: findUserByEmail(email)
    RP->>DB: SELECT * FROM users WHERE email = ?
    DB->>RP: null (not found)
    S->>S: Hash password with bcrypt
    S->>RP: createUser(name, email, hashedPassword, role)
    RP->>DB: INSERT INTO users ...
    DB->>RP: newUser
    RP->>S: newUser
    S->>C: { success: true, data: { id, name, email, role } }
    C->>P: 201 Created + JSON
```

### Understanding async/await — JavaScript is Impatient!

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

#### 🎬 Scenario: Nimal's Debugging Nightmare

Nimal writes `const user = prisma.user.findUnique(...)` but forgets `await`. The code runs, `user` is `undefined`, and the next line crashes with `Cannot read properties of undefined`. He spends 30 minutes checking his Prisma query, when the real problem is just one missing word: `await`.

#### ✅ The Solution — async/await

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

---

### Layer 1: Auth Repository (The Fridge)

This file ONLY talks to the database. It does NOT know about HTTP, passwords, or tokens.

**Understanding relative paths:** We are in `src/repositories/authRepository.js` and want to import `src/config/db.js`:

```
src/
├── config/
│   └── db.js            ← We want to reach HERE
├── repositories/
│   └── authRepository.js  ← We are HERE
```

| Symbol | Meaning | Analogy |
|--------|---------|---------|
| `./` | Current folder | "Look in the room I am in right now" |
| `../` | Go up one folder (parent) | "Go out the door, then look" |
| `../../` | Go up two folders | "Go out two doors" |

```mermaid
flowchart LR
    A["authRepository.js\nin repositories/"] -->|"../ = go up to src/"| B["src/"]
    B -->|"config/ = enter folder"| C["config/"]
    C -->|"db.js = the file"| D["db.js ✅"]
```

#### 📁 File: `src/repositories/authRepository.js`

#### 🚀 FULL CODE (READY TO COPY)

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

| Line | Why did we write this? |
|------|------------------------|
| `import prisma from "../config/db.js"` | Gets the shared Prisma client from `db.js`. |
| `prisma.user.findUnique({ where: { email } })` | Finds ONE user by their unique email. Stops searching after finding one. |
| `prisma.user.create({ data: { ... } })` | Inserts a new row into the `users` table. |
| `prisma.user.findMany({ select: { ... } })` | Gets ALL users, but only returns the fields we choose. |
| `export { findUserByEmail, ... }` | Named exports — shares multiple functions. Other files use `import { createUser } from ...`. |

| Prisma Method | What It Does | SQL Equivalent |
|---------------|-------------|----------------|
| `prisma.user.findUnique()` | Find ONE record by a unique field | `SELECT * FROM users WHERE email = ?` |
| `prisma.user.findMany()` | Find ALL matching records | `SELECT * FROM users` |
| `prisma.user.create()` | Insert a new record | `INSERT INTO users VALUES (...)` |

> ⚠️ **Security:** In `findAllUsers`, we use `select` to choose which fields to return. We NEVER return the `password` field! If we did, anyone calling this API could see everyone's password hashes.

---

### Layer 2: Auth Service — Passwords & Hashing (The Chef)

The Service layer handles the **business logic** — the rules and decisions.

#### ❌ The Problem — Saving Passwords as Plain Text

```javascript
// ❌ NEVER DO THIS! Saving password as plain text!
async function registerUser(name, email, password) {
  const user = await createUser(name, email, password, "teacher");
  // Database now stores: password = "teacher123"
  // Anyone who sees the database can read it!
}
```

```mermaid
flowchart TD
    A["😊 Nimal registers with\npassword: teacher123"] --> B["📦 Database stores:\npassword = teacher123"]
    B --> C["😈 Hacker breaks into\nyour database"]
    C --> D["💀 Hacker sees ALL passwords\nin plain text!"]
    D --> E["🔓 Hacker logs in\nas Nimal"]
    D --> F["🌐 Hacker tries same password\non Gmail, Facebook, Bank..."]
```

> ⚠️ **Real example:** In 2012, LinkedIn was hacked. 6.5 million passwords were stolen. Many were stored as weak hashes. Users who reused passwords had their other accounts compromised too.

#### ✅ The Solution — Hashing with bcrypt

**Hashing** is a one-way transformation. You can turn a password into a hash, but you can **NEVER turn a hash back into a password**. It is like a meat grinder — you can turn meat into a burger, but you cannot turn a burger back into meat.

```mermaid
flowchart LR
    A["teacher123\n(plain text)"] -->|"bcrypt.hash()"| B["$2b$10$VxB/Z1jc...\n(hashed — cannot reverse!)"]
    B -.->|"❌ IMPOSSIBLE\nto reverse"| A
```

**What is salting?** A "salt" is random text added to the password before hashing. Even if two users have the same password, their hashes will be different!

```
User 1: "teacher123" + random_salt_abc → $2b$10$Abc...
User 2: "teacher123" + random_salt_xyz → $2b$10$Xyz...  (Different!)
```

#### 📁 File: `src/services/authService.js`

For now, we write ONLY the `registerUser` function. We will add `loginUser` in Phase 4.

#### 🚀 FULL CODE (READY TO COPY)

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

| Line | Why did we write this? |
|------|------------------------|
| `import bcrypt from "bcrypt"` | Gets the password hashing tool. bcrypt is slow ON PURPOSE — makes brute-force attacks hard. |
| `import jwt from "jsonwebtoken"` | Gets the JWT token tool (used in login, Phase 4). |
| `import { findUserByEmail, createUser, ... }` | Named imports — grab specific functions from the repository. |
| `await findUserByEmail(email)` | Check if someone already registered with this email. |
| `const saltRounds = 10` | Sets hashing strength. 10 means bcrypt processes the password 2^10 = 1024 times (~100ms). |
| `await bcrypt.hash(password, saltRounds)` | Converts plain text into a hash. `await` needed because hashing is CPU-heavy. |
| `return { success, message, data }` | Consistent response format. Frontend always knows what to expect. |

**Register flow:**

```mermaid
flowchart TD
    A["User sends name, email, password"] --> B{"Does email\nalready exist?"}
    B -->|"Yes"| C["Return error:\nEmail already exists"]
    B -->|"No"| D["Hash password\nwith bcrypt"]
    D --> E["Save user\nto database"]
    E --> F["Return success\n(without password!)"]
```

> 💡 **Security tip:** We say "Invalid email or password" for BOTH wrong email and wrong password. This way, a hacker cannot tell if an email exists in our system.

---

### Layer 3: Auth Controller (The Waiter)

The Controller reads the HTTP request and sends the HTTP response.

#### What is HTTP?

HTTP is the language that browsers and servers speak.

| Part | Example | Purpose |
|------|---------|---------|
| **Method** | GET, POST, PUT, DELETE | What action to perform |
| **URL** | `/api/students/5` | Which resource to access |
| **Headers** | `Authorization: Bearer token...` | Extra info (like your ID card) |
| **Body** | `{ "name": "Nimal", "email": "..." }` | Data you are sending |

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

#### ❌ The Problem — No Error Handling = Server Crash

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

#### ✅ The Solution — try/catch

`try/catch` is like a safety net:

```mermaid
flowchart TD
    A["Request comes in"] --> B["TRY: Call database"]
    B --> C{"Did it work?"}
    C -->|"Yes ✅"| D["Send 200 OK\nwith data"]
    C -->|"No ❌"| E["CATCH: Send 500 Error\nwith friendly message"]
    E --> F["Server keeps running!\nOther users are not affected ✅"]
```

#### 📁 File: `src/controllers/authController.js`

#### 🚀 FULL CODE (READY TO COPY)

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

| Line | Why did we write this? |
|------|------------------------|
| `req.body.name` | Reads the `name` field from the JSON the client sent. |
| `if (!name \|\| !email \|\| !password)` | Validates that required fields are present. `!` means "NOT" — empty strings and `undefined` are falsy. |
| `res.status(201).json(result)` | Sends HTTP 201 (Created) with the result as JSON. |
| `res.status(400).json(result)` | Sends HTTP 400 (Bad Request) — client sent bad data. |
| `catch (error)` | If ANYTHING crashes inside `try`, this runs instead — server stays alive. |

> 💡 **Pattern:** Every controller function does 3 things: (1) Read data from `req`, (2) Call the service, (3) Send `res` with the right status code. Always wrapped in `try/catch`.

---

### Layer 4: Auth Routes (The Front Desk)

#### What is REST?

REST is a set of rules for designing APIs. URLs represent **things** (resources), HTTP methods represent **actions**.

| HTTP Method | Action | Example |
|-------------|--------|---------|
| **GET** | Read data | Get all students |
| **POST** | Create new data | Create a new student |
| **PUT** | Update existing data | Update a student's name |
| **DELETE** | Delete data | Delete a student |

#### 📁 File: `src/routes/authRoutes.js`

#### 🚀 FULL CODE (READY TO COPY)

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

| Line | Why did we write this? |
|------|------------------------|
| `express.Router()` | Creates a "mini-app" that groups related routes together. |
| `router.post("/register", register)` | When someone sends POST to `/register`, run the `register` controller function. |
| `router.get("/me", verifyToken, getMe)` | First run `verifyToken` middleware, THEN run `getMe`. |
| `export default router` | Shares this router so `server.js` can plug it in. |

> ⚠️ **Note:** The `verifyToken` and `authorizeRoles` imports will show errors because we haven't created the middleware file yet. That's OK — we build it in Phase 5! For now, the Register route works without middleware.

### Wire Up the Register Route in server.js

Update `src/server.js` — add the auth routes import:

Add these lines to your existing `server.js`:

```javascript
// Add AFTER the existing middleware lines:
import authRoutes from "./routes/authRoutes.js";

// Add BEFORE the test route:
app.use("/api/auth", authRoutes);
```

> ⚠️ **Important:** Since `authRoutes.js` imports from `authMiddleware.js` (which doesn't exist yet), the server will crash if you try to start it now. Create Phase 5's middleware file first (even an empty placeholder), OR temporarily comment out the `verifyToken` imports in `authRoutes.js`. We'll fix this properly in Phase 5.

### 🧪 Phase 3 Test: Register a User!

> ⚠️ Since our routes import middleware that doesn't exist yet, we'll do a combined test after Phase 5. But the **code logic** for Register is complete and correct. If you want to test now, temporarily remove the `verifyToken` and `authorizeRoles` imports and protected routes from `authRoutes.js`, keeping only the public routes.

**Test in Postman (after Phase 5):**
```
Method: POST
URL:    http://localhost:5000/api/auth/register
Body → raw → JSON:
```
```json
{ "name": "Kavitha Perera", "email": "kavitha@school.com", "password": "mypassword123", "role": "teacher" }
```

**What to look for:** `201 Created` with `{ "success": true, ... }`

**Try it again with the same email:**
Expected: `400 Bad Request` — `"A user with this email already exists."`

---

## 🐟 Phase 4: The Login Slice (JWT & Statelessness)

> **Goal:** Understand why HTTP forgets you, build the Login feature, and test it by decoding a token at jwt.io.

### ❌ The Problem — HTTP is Stateless (The Goldfish Memory)

OK, the user logged in. But HTTP has a problem: **it forgets you immediately**.

```mermaid
sequenceDiagram
    participant U as Nimal
    participant S as Server

    U->>S: POST /login (email + password)
    S->>U: ✅ Login successful!

    U->>S: GET /students
    S->>U: ❌ Who are you?? I don't know you!
    Note right of S: HTTP forgets you after<br/>every request!
```

#### 🎬 Scenario: Nimal's Frustration

Nimal logs in successfully. The server says "Welcome, Nimal!" He clicks "View Students" one second later. The server says "Who are you?" Nimal is confused — he JUST logged in! But HTTP is like a goldfish — it has no memory. Every request is brand new.

### ✅ The Solution — JWT Tokens (Digital ID Cards / Wristbands)

**JWT** (JSON Web Token) is like a concert wristband. After login, the server creates a token and gives it to you. You show this token with every future request.

```mermaid
sequenceDiagram
    participant U as Nimal
    participant S as Server

    U->>S: POST /login (email + password)
    S->>S: Check password ✅
    S->>S: Create JWT token
    S->>U: Here's your token: eyJhbG...

    U->>S: GET /students (+ token in header)
    S->>S: Verify token ✅ — Ah, you're Nimal, Teacher!
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

**How does login verification work if we can't reverse the hash?**

We use `bcrypt.compare()`:

```mermaid
flowchart TD
    A["Nimal types: teacher123"] --> B["bcrypt hashes it\nwith stored salt"]
    B --> C{"Does new hash\nmatch stored hash?"}
    C -->|"Yes ✅"| D["Password correct!\nLogin successful"]
    C -->|"No ❌"| E["Wrong password!\nLogin denied"]
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

> 🛠️ **Debugging Tool — jwt.io:** Want to see what is INSIDE a JWT token? Go to [https://jwt.io](https://jwt.io). Paste your token into the "Encoded" box, and it will instantly show you the decoded Header and Payload! This is extremely useful when debugging login problems.

```mermaid
flowchart LR
    A["Copy your token\neyJhbGciOiJ..."] -->|"Paste at jwt.io"| B["See decoded data:\nuserId: 1\nrole: admin\nexp: 1714358400"]
    B --> C["Debug your problems!\nWrong userId? Wrong role?\nToken expired?"]
```

The `loginUser` function was already written in `authService.js` in Phase 3. The key lines:

| Line | Why did we write this? |
|------|------------------------|
| `await bcrypt.compare(password, user.password)` | Hashes the typed password with the same salt and checks if it matches. Returns `true` or `false`. |
| `const tokenPayload = { userId, role }` | Data stored INSIDE the token. Only put minimum info — anyone can decode a JWT! |
| `jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: "24h" })` | Creates the token. Three args: (1) data, (2) secret key from `.env`, (3) expiry. |

### 🧪 Phase 4 Test: Login and Decode the Token!

**Test in Postman (after Phase 5 when server runs):**
```
Method: POST
URL:    http://localhost:5000/api/auth/login
Body → raw → JSON:
```
```json
{ "email": "amara@school.com", "password": "admin123" }
```

**What to look for:**
- `200 OK` with a `token` field in the response
- **⭐ COPY THIS TOKEN! You need it for all next tests.**
- Go to [https://jwt.io](https://jwt.io), paste the token, and see `userId: 1, role: "admin"` in the payload

**Also test with wrong password:**
```json
{ "email": "amara@school.com", "password": "wrongpassword" }
```
Expected: `401 Unauthorized` — "Invalid email or password."

---

## 🛡️ Phase 5: The Bouncer (Middleware)

> **Goal:** Build `verifyToken` and `authorizeRoles` middleware so we can protect routes. After this phase, the server can finally run!

### ❌ The Problem — Anyone Can Access Everything!

Right now, if someone sends `GET /api/students`, they get the data — even without logging in.

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

A **middleware** is a function that runs BEFORE the controller:

```mermaid
sequenceDiagram
    participant R as Request
    participant VT as verifyToken
    participant AR as authorizeRoles
    participant C as Controller

    R->>VT: Has Authorization header?
    VT->>VT: Extract token from "Bearer eyJ..."
    VT->>VT: jwt.verify() — valid? not expired?
    VT->>VT: Attach decoded { userId, role } to req.user
    VT->>AR: next() ✅
    AR->>AR: Is req.user.role in allowedRoles?
    AR->>C: next() ✅
    C->>C: Run the actual logic
```

#### 🎬 Scenario: Sanduni Tries to Create a Classroom

Sanduni (a teacher) sends `POST /api/classrooms` with her JWT token. The `verifyToken` middleware checks her token — it's valid ✅. But then `authorizeRoles("admin")` checks her role — she's a "teacher", not an "admin" ❌. She gets `403 Forbidden`. Only Amara (admin) can create classrooms.

**The difference between 401 and 403:**

| Code | Meaning | Analogy |
|------|---------|---------|
| `401 Unauthorized` | You are NOT logged in | You don't have a wristband at all |
| `403 Forbidden` | You ARE logged in but NOT allowed | You have a wristband but it's General, not VIP |

#### 📁 File: `src/middlewares/authMiddleware.js`

#### 🚀 FULL CODE (READY TO COPY)

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

| Line | Why did we write this? |
|------|------------------------|
| `req.headers.authorization` | Reads the `Authorization` header where the client puts their JWT token. Format: `Bearer <token>`. |
| `authHeader.split(" ")[1]` | Splits `"Bearer eyJhbG..."` by space into `["Bearer", "eyJhbG..."]`. Takes index `[1]` (the token). |
| `jwt.verify(token, process.env.JWT_SECRET)` | Checks: (1) Is the token valid? (2) Was it signed with OUR secret? (3) Has it expired? |
| `req.user = decoded` | Attaches `{ userId: 1, role: "admin" }` to the request so controllers can read it. |
| `next()` | Tells Express: "I'm done. Continue to the next function in the chain." |
| `authorizeRoles(...allowedRoles)` | The `...` collects all arguments into an array. `authorizeRoles("admin", "teacher")` → `["admin", "teacher"]`. |
| `allowedRoles.includes(userRole)` | Checks if the user's role is in the allowed list. |

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
> Remember we set `expiresIn: "24h"` when creating the token? After 24 hours, the token **expires**:
>
> 1. The user logged in yesterday and got a token.
> 2. Today, they send a request with the same token.
> 3. `jwt.verify()` sees the token is expired and **throws an error**.
> 4. The `catch` block runs → sends `401: Token is invalid or expired`.
> 5. The user must log in again to get a fresh token.

> 🛠️ **Debugging Tips — Common Errors:**
>
> **JWT Errors:**
>
> | Error | What It Means | How to Fix |
> |-------|--------------|------------|
> | `jwt malformed` | The token string is corrupted or incomplete | Copy the FULL token from the login response |
> | `invalid signature` | Token was created with a different secret | Check `JWT_SECRET` in `.env` |
> | `jwt expired` | Token is older than 24 hours | Login again to get a fresh token |
> | `secretOrPrivateKey must have a value` | `JWT_SECRET` is missing from `.env` | Add `JWT_SECRET` to your `.env` file |
>
> **Prisma Errors:**
>
> | Error | What It Means | How to Fix |
> |-------|--------------|------------|
> | `Unique constraint failed on the fields: (email)` | Duplicate email | Use a different email |
> | `Foreign key constraint failed` | The referenced ID doesn't exist | Create the referenced record first |
> | `P1001: Can't reach database server` | MySQL is not running | Start MySQL in XAMPP |

### Now Wire Up Everything in server.js

Update `src/server.js` to import auth routes. Since we now have the middleware file, the imports will work:

Add this line after `import cors from "cors";`:
```javascript
import authRoutes from "./routes/authRoutes.js";
```

Add this line before the test route:
```javascript
app.use("/api/auth", authRoutes);
```

### 🧪 Phase 5 Test: The Bouncer in Action!

Start the server:
```bash
npm run dev
```

**Test 1: Register a user**
```
Method: POST
URL:    http://localhost:5000/api/auth/register
Body:   { "name": "Kavitha Perera", "email": "kavitha@school.com", "password": "mypassword123", "role": "teacher" }
```
Expected: `201 Created` ✅

**Test 2: Login as Admin**
```
Method: POST
URL:    http://localhost:5000/api/auth/login
Body:   { "email": "amara@school.com", "password": "admin123" }
```
Expected: `200 OK` with a `token`. **⭐ COPY THIS TOKEN!**

**Test 3: Access /me WITHOUT a token**
```
Method: GET
URL:    http://localhost:5000/api/auth/me
Headers: (none)
```
Expected: `401` — "Access denied. No token provided." ✅ The Bouncer blocked you!

**Test 4: Access /me WITH a token**
```
Method: GET
URL:    http://localhost:5000/api/auth/me
Headers: Authorization: Bearer <paste-your-token-here>
```
Expected: `200 OK` with `{ userId: 1, role: "admin" }` ✅

**Test 5: Access /users as a Teacher**
Login as `nimal@school.com` / `teacher123`, copy the token, then:
```
Method: GET
URL:    http://localhost:5000/api/auth/users
Headers: Authorization: Bearer <nimal-token>
```
Expected: `403 Forbidden` — "Access denied. You do not have permission." ✅

> 💡 **Tip:** In Postman, click **Authorization** tab → choose **Bearer Token** → paste just the token. Postman adds "Bearer " automatically.

**How to add the token in Postman:**
```
✅ Correct: Bearer eyJhbGciOiJIUzI1NiIs...
❌ Wrong:   BearereyJhbGciOiJIUzI1NiIs...    (no space!)
❌ Wrong:   eyJhbGciOiJIUzI1NiIs...          (missing "Bearer")
```

---

## 🏫 Phase 6: Classroom & Student Slices

> **Goal:** Build the Classroom and Student systems. Same 4-layer pattern: Repository → Service → Controller → Routes. Then test Admin vs Teacher permissions.

```mermaid
flowchart TD
    A["Phase 6"] --> B["Classroom System\n4 endpoints"]
    A --> C["Student System\n4 endpoints"]
    B --> D["POST /classrooms (Admin only)"]
    B --> E["GET /classrooms"]
    B --> F["GET /classrooms/:id"]
    B --> G["GET /classrooms/teacher/:teacherId"]
    C --> H["POST /students (Admin+Teacher)"]
    C --> I["GET /students"]
    C --> J["GET /students/:id"]
    C --> K["GET /students/classroom/:classroomId"]
```

### Classroom System

#### 📁 File: `src/repositories/classroomRepository.js`

#### 🚀 FULL CODE (READY TO COPY)

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

| Line | Why did we write this? |
|------|------------------------|
| `include: { teacher: { select: { ... } } }` | Like a SQL JOIN — also fetch the teacher's info, but only id, name, email (not password!). |
| `include: { students: true }` | In `findClassroomById`, also fetch all students in that classroom. |
| `findClassroomsByTeacherId` | Filter classrooms by a specific teacher. |

> 💡 **`include` = SQL JOIN.** Without it, you get `teacherId: 3` (just a number). With it, you get the full teacher object nested inside.

---

#### 📁 File: `src/services/classroomService.js`

#### 🚀 FULL CODE (READY TO COPY)

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

| Line | Why did we write this? |
|------|------------------------|
| `import * as classroomRepository` | Imports ALL exports as one object. Use it like `classroomRepository.createClassroom(...)`. |
| `if (!classroom)` | The "Early Return" pattern — if not found, return error immediately and stop. |

> 💡 **`import * as` vs `import { }`:** `import * as classroomRepository` grabs EVERYTHING and puts it in a box. It makes it obvious where functions come from: `classroomRepository.createClassroom(...)`.

---

#### 📁 File: `src/controllers/classroomController.js`

#### 🚀 FULL CODE (READY TO COPY)

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

| Line | Why did we write this? |
|------|------------------------|
| `parseInt(req.params.id)` | URL params are strings. `/5` → `"5"`. `parseInt` converts to number `5` for Prisma. |
| `res.status(404).json(result)` | 404 = Not Found. The classroom ID doesn't exist. |

> 💡 **`req.params`** — In `/api/classrooms/5`, Express puts `5` into `req.params.id`. The route is defined as `/:id` — the colon creates a dynamic variable.

---

#### 📁 File: `src/routes/classroomRoutes.js`

#### 🚀 FULL CODE (READY TO COPY)

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

| Line | Why did we write this? |
|------|------------------------|
| `router.post("/", verifyToken, authorizeRoles("admin"), createClassroom)` | Chain: check token → check admin role → create. Teachers can't create classrooms. |
| `router.get("/", verifyToken, getAllClassrooms)` | Any logged-in user can view classrooms. |
| `router.get("/:id", ...)` | The `:id` is a dynamic URL parameter. |

---

### Student System

#### 📁 File: `src/repositories/studentRepository.js`

#### 🚀 FULL CODE (READY TO COPY)

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

---

#### 📁 File: `src/services/studentService.js`

#### 🚀 FULL CODE (READY TO COPY)

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

---

#### 📁 File: `src/controllers/studentController.js`

#### 🚀 FULL CODE (READY TO COPY)

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

| Line | Why did we write this? |
|------|------------------------|
| `const { name, email, registrationNumber, classroomId } = req.body` | Destructuring — a shortcut to extract multiple fields at once. Same as writing 4 separate `const x = req.body.x` lines. |

---

#### 📁 File: `src/routes/studentRoutes.js`

#### 🚀 FULL CODE (READY TO COPY)

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

| Line | Why did we write this? |
|------|------------------------|
| `authorizeRoles("admin", "teacher")` | Both admins AND teachers can add students. |

### Wire Up in server.js

Add these imports and routes to `src/server.js`:

```javascript
import classroomRoutes from "./routes/classroomRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";

app.use("/api/classrooms", classroomRoutes);
app.use("/api/students", studentRoutes);
```

### 🧪 Phase 6 Test: Admin vs Teacher Permissions!

**Test 1: Get All Classrooms**
```
GET http://localhost:5000/api/classrooms  +  Any token
```
Expected: `200 OK` with a list of classrooms ✅

**Test 2: Create a Classroom as Admin**
```
POST http://localhost:5000/api/classrooms  +  Admin token
Body: { "name": "Batch 2026 - Data Science", "section": "Afternoon", "teacherId": 2 }
```
Expected: `201 Created` ✅

**Test 3: Create a Classroom as Teacher**
```
POST http://localhost:5000/api/classrooms  +  Teacher token (Nimal)
Body: { "name": "Test Class", "section": "Test", "teacherId": 2 }
```
Expected: `403 Forbidden` ❌ — Teachers cannot create classrooms!

**Test 4: Get All Students**
```
GET http://localhost:5000/api/students  +  Any token
```
Expected: `200 OK` ✅

**Test 5: Create a Student**
```
POST http://localhost:5000/api/students  +  Token (admin or teacher)
Body: { "name": "Dilshan Wickramasinghe", "email": "dilshan@student.com", "registrationNumber": "STU-2026-005", "classroomId": 1 }
```
Expected: `201 Created` ✅

**Test 6: Get Students by Classroom**
```
GET http://localhost:5000/api/students/classroom/1  +  Token
```
Expected: `200 OK` with students from Classroom 1 ✅

---

## 📝 Phase 7: The Attendance Slice (The Final Logic)

> **Goal:** Build the most important feature — marking attendance for a whole classroom at once. Then finalize `server.js` with all routes.

```mermaid
flowchart TD
    A["Phase 7"] --> B["Single Attendance\nPOST /attendance"]
    A --> C["Bulk Attendance\nPOST /attendance/bulk"]
    A --> D["View by Classroom\nGET /attendance/classroom/:id?date="]
    A --> E["View by Student\nGET /attendance/student/:id"]
    A --> F["Final server.js\n(all routes wired up)"]
```

### Understanding `req.params` vs `req.query` vs `req.body`

This is the #1 confusion for beginners! When do you use which?

| Express code | Where is the data? | Analogy | When to use it |
|--------------|-------------------|---------|----------------|
| `req.body` | In the hidden POST request data | The envelope contents | Sending large data (creating a user, passwords, bulk arrays) |
| `req.params` | Part of the URL path itself (`/users/5`) | The room number on a door | Identifying a SPECIFIC resource (Get user #5) |
| `req.query` | After the `?` in the URL (`?date=today`) | The filter options on a shopping site | Searching, filtering, or sorting |

#### 🎬 Scenario: Nimal Marks Attendance

Nimal (teacher) wants to view attendance for his "Web Development" class (ID 1) on April 28. The URL is:
`GET /api/attendance/classroom/1?date=2026-04-28`
- `req.params.classroomId` = `1` (WHICH classroom)
- `req.query.date` = `"2026-04-28"` (WHICH date to filter by)

---

#### 📁 File: `src/repositories/attendanceRepository.js`

#### 🚀 FULL CODE (READY TO COPY)

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

| Line | Why did we write this? |
|------|------------------------|
| `new Date(date)` | Converts string `"2026-04-28"` to a JavaScript Date object for Prisma. |
| `orderBy: { date: "desc" }` | Sorts newest first. `"desc"` = descending, `"asc"` = ascending. |
| `findExistingAttendance` | Checks if a student already has a record for that day (prevents duplicates). |

---

#### 📁 File: `src/services/attendanceService.js`

#### 🚀 FULL CODE (READY TO COPY)

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

| Line | Why did we write this? |
|------|------------------------|
| `allowedStatuses.includes(status)` | Only accept "present", "absent", or "late". Reject "sick", "holiday", etc. |
| `findExistingAttendance` | Prevents marking the same student twice on the same day. |
| `for` loop with `await` | Processes each student one by one, waiting for each to save. |
| `results` and `errors` arrays | If student #5 fails, we don't crash — we keep going for students 6-30. |

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

---

#### 📁 File: `src/controllers/attendanceController.js`

#### 🚀 FULL CODE (READY TO COPY)

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

| Line | Why did we write this? |
|------|------------------------|
| `req.user.userId` | The `verifyToken` middleware puts decoded JWT data into `req.user`. This is the logged-in teacher's ID — we use it for `markedBy` automatically. |
| `req.query.date` | For `/api/attendance/classroom/1?date=2026-04-28`, `req.query.date` equals `"2026-04-28"`. |
| `req.body.attendanceList` | The bulk endpoint expects `{ "attendanceList": [ ... ] }` in the body. |

---

#### 📁 File: `src/routes/attendanceRoutes.js`

#### 🚀 FULL CODE (READY TO COPY)

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

### 🚀 Final server.js — The Complete Version

Now that ALL route files exist, update `src/server.js` to its final form:

#### 📁 File: `src/server.js` (Final Version)

#### 🚀 FULL CODE (READY TO COPY)

```javascript
// Step 1: Load environment variables (MUST be first!)
import "dotenv/config";

// Step 2: Validate required environment variables (Fail-Fast!)
const requiredEnvVars = ["DATABASE_URL", "JWT_SECRET"];
const missingVars = requiredEnvVars.filter(function (varName) {
  return !process.env[varName];
});

if (missingVars.length > 0) {
  console.error("❌ Missing required environment variables:");
  console.error("   " + missingVars.join(", "));
  console.error("");
  console.error("   Please check your .env file!");
  process.exit(1); // Stop the server immediately
}

// Step 3: Import packages
import express from "express";
import cors from "cors";

// Step 4: Import our route files
import authRoutes from "./routes/authRoutes.js";
import classroomRoutes from "./routes/classroomRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";

// Step 5: Create the Express app
const app = express();

// Step 6: Add middleware
app.use(cors());          // Allow React frontend to connect
app.use(express.json());  // Parse JSON request bodies

// Step 7: Connect routes
app.use("/api/auth", authRoutes);
app.use("/api/classrooms", classroomRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/attendance", attendanceRoutes);

// Step 8: Test route
app.get("/", function (req, res) {
  res.json({
    success: true,
    message: "designHer 2.0 Attendance API is running!",
    data: null,
  });
});

// Step 9: Start the server
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

| Line | Why did we write this? |
|------|------------------------|
| `import "dotenv/config"` | Loads `.env` file into `process.env`. MUST be first! |
| Fail-Fast validation | If `JWT_SECRET` or `DATABASE_URL` is missing, the server stops immediately with a clear error instead of crashing later. |
| `app.use("/api/auth", authRoutes)` | All routes in `authRoutes` start with `/api/auth`. |
| `app.use("/api/attendance", attendanceRoutes)` | All attendance routes start with `/api/attendance`. |

**How Frontend Will Talk to This Backend:**

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

### 🧪 Phase 7 Test: The Full Attendance System!

**Test 1: Mark Single Attendance**
```
POST http://localhost:5000/api/attendance  +  Token
Body: { "studentId": 1, "classroomId": 1, "date": "2026-05-01", "status": "present" }
```
Expected: `201 Created` ✅

**Test 2: Try Marking Same Student Again**
```
POST http://localhost:5000/api/attendance  +  Token
Body: { "studentId": 1, "classroomId": 1, "date": "2026-05-01", "status": "absent" }
```
Expected: `400` — "Attendance already marked for this student on this date." ✅

**Test 3: Bulk Attendance**
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
Expected: `201 Created` with `"2 saved, 0 errors"` ✅

**Test 4: Get Classroom Attendance by Date**
```
GET http://localhost:5000/api/attendance/classroom/1?date=2026-04-28  +  Token
```
Expected: `200 OK` with attendance records for that day ✅

**Test 5: Get Student Attendance History**
```
GET http://localhost:5000/api/attendance/student/1  +  Token
```
Expected: `200 OK` with all of Tharindu's attendance records ✅

**Test 6: Invalid Status**
```
POST http://localhost:5000/api/attendance  +  Token
Body: { "studentId": 3, "classroomId": 2, "date": "2026-05-01", "status": "sick" }
```
Expected: `400` — "Status must be 'present', 'absent', or 'late'." ✅

### Error Cases Summary

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

### 🧪 Test Credentials (from Day 1 Seed Data)

| Email | Password | Role |
|-------|----------|------|
| amara@school.com | admin123 | Admin |
| nimal@school.com | teacher123 | Teacher |
| sanduni@school.com | teacher123 | Teacher |

---

## 🎉 Congratulations! You Did It!

You just built a complete REST API from scratch! Here is what you learned today:

| Topic | What You Learned |
|-------|--------------------|
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

> **Next up (Day 3):** We will build the React frontend that connects to this API! We will use Axios to call these endpoints, save the JWT token in localStorage, and build the attendance dashboard.

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

### Common Errors and Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| `Cannot find module 'express'` | Packages not installed | Run `npm install` |
| `P1001: Can't reach database server` | MySQL is not running | Start MySQL in XAMPP |
| `Invalid prisma.user.findUnique() invocation` | Prisma client not generated | Run `npx prisma generate` |
| `Error: secretOrPrivateKey must have a value` | JWT_SECRET not in `.env` | Check your `.env` file |
| `Port 5000 is already in use` | Another server running | Change PORT in `.env` to 5001 |

---

> Made with ❤️ for **designHer 2.0 Bootcamp 2026**
