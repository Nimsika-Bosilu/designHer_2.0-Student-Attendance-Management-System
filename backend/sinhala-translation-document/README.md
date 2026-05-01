# 🚀 Day 2 — Building the Backend REST API (Build-Test-Repeat Master Guide)

> **Day 2 of designHer 2.0 Bootcamp**
> අද අපි Node.js, Express, සහ Prisma පාවිච්චි කරලා backend REST API එක හදමු!
> අපි මේ app එක හදන්නේ **phase by phase** (පියවරෙන් පියවර), ඊළඟ phase එකට යන්න කලින් හැම එකක්ම test කරමිනුයි.

> 💡 **මේ guide එක පාවිච්චි කරන්නේ කොහොමද:** හැම file එකකම `🚀 FULL CODE (READY TO COPY)` කියලා block එකක් තියෙනවා. ඒක copy කරලා, හරි file එකට paste කරලා save කරන්න. ඊළඟ phase එකට යන්න කලින් අනිවාර්යයෙන්ම **test** කරන්න. මෙතන placeholders (හිස් තැන්) මුකුත් නෑ, ඔක්කොම සම්පූර්ණ කෝඩ්.

---

## 🗺️ The Big Picture — Where Are We? (අපි ඉන්නේ කොතනද?)

ඊයේ (Day 1) අපි හැදුවා **database** එක — ඒ කියන්නේ අපේ data store කරන පෙට්ටිය.
අද (Day 2) අපි හදන්නේ **backend API** එක — ඒ කියන්නේ අපේ data read කරන, write කරන, සහ protect කරන මොළය.
හෙට (Day 3) අපි හදන්නේ **frontend** එක — ඒ කියන්නේ users ලට පේන මුහුණුවර.

```mermaid
flowchart LR
    A["👩‍💻 React Frontend\n(Day 3)"] -->|"HTTP Requests"| B["⚙️ Express Backend\n(Day 2 — අද!)"]
    B -->|"Prisma Queries"| C["🗄️ MySQL Database\n(Day 1)"]
```

### The Architecture — Restaurant Analogy එකක්

අපේ backend එක **layers** (ස්තර) විදිහටයි හැදිලා තියෙන්නේ. හැම layer එකකටම තියෙන්නේ එකම එක රස්සාවයි. මේක හරියට restaurant එකක් වගේ කියලා හිතන්න:

```mermaid
flowchart TD
    A["🌐 Client\n(Postman / React App)"] -->|"HTTP Request"| B
    B["🛣️ Route Layer\n(Front desk එක — ඔයාව යොමු කරනවා)\nauthRoutes.js"] -->|"Calls"| C
    C["🛡️ Middleware\n(Security guard — ඔයාගේ ID එක check කරනවා)\nauthMiddleware.js"] -->|"Approved"| D
    D["🎮 Controller Layer\n(Waiter — ඔයාගේ order එක ගන්නවා)\nauthController.js"] -->|"Calls"| E
    E["🧠 Service Layer\n(Chef — කෑම එක හදනවා)\nauthService.js"] -->|"Calls"| F
    F["📦 Repository Layer\n(Fridge එක — බඩු ගබඩා කරලා තියෙනවා)\nauthRepository.js"] -->|"SQL Query"| G
    G["🗄️ Database\n(MySQL)"]
```

| Layer | Restaurant Analogy | Job එක |
|-------|-------------------|-----|
| **Route** | Front desk | Request එක හරි තැනට යොමු කරනවා |
| **Middleware** | Security guard | ඔයාට ඇතුළට යන්න අවසර තියෙනවද බලනවා |
| **Controller** | Waiter | Order එක අරගෙන, response එක දෙනවා |
| **Service** | Chef | ඇත්තම වැඩේ කරන්නේ මෙයා (logic, rules) |
| **Repository** | Fridge | Storage (database) එකෙන් data ගන්නවා |

> 💡 **ඇයි layers?** ඔක්කොම එකම file එකක ලිව්වොත්, ඒක අවුල් වෙලා "spaghetti code" එකක් වෙනවා. Layers වලින් දේවල් පිරිසිදුව තියාගන්නවා. ඔයාට passwords වැඩ කරන විදිහ වෙනස් කරන්න ඕනේ නම්, ඔයා වෙනස් කරන්නේ Service එක විතරයි. Controller සහ Repository කලින් වගේමයි.

### අපේ සම්පූර්ණ API එක — අපි මොනවද හදන්නේ

| # | Method | URL | කාටද පාවිච්චි කරන්න පුළුවන් | මොකක්ද කරන්නේ |
|---|--------|-----|-------------|-------------|
| 1 | POST | `/api/auth/register` | ඕනෑම කෙනෙක් | අලුත් account එකක් හදනවා |
| 2 | POST | `/api/auth/login` | ඕනෑම කෙනෙක් | Login වෙලා token එකක් ගන්නවා |
| 3 | GET | `/api/auth/me` | Login වෙච්ච users | තමන්ගේම විස්තර ගන්නවා |
| 4 | GET | `/api/auth/users` | Admin විතරයි | ඔක්කොම users ලව ගන්නවා |
| 5 | POST | `/api/classrooms` | Admin විතරයි | Classroom එකක් හදනවා |
| 6 | GET | `/api/classrooms` | Login වෙච්ච users | ඔක්කොම classrooms ගන්නවා |
| 7 | GET | `/api/classrooms/:id` | Login වෙච්ච users | එක classroom එකක් ගන්නවා |
| 8 | GET | `/api/classrooms/teacher/:teacherId` | Login වෙච්ච users | Teacher ගේ classrooms ගන්නවා |
| 9 | PUT | `/api/classrooms/:id` | Admin විතරයි | Classroom එකක් update/reassign කරනවා |
| 10 | POST | `/api/students` | Admin, Teacher | Student කෙනෙක්ව add කරනවා |
| 11 | GET | `/api/students` | Login වෙච්ච users | ඔක්කොම students ලව ගන්නවා |
| 12 | GET | `/api/students/:id` | Login වෙච්ච users | එක student කෙනෙක්ව ගන්නවා |
| 13 | GET | `/api/students/classroom/:classroomId` | Login වෙච්ච users | Class එකක ඉන්න students ලව ගන්නවා |
| 14 | POST | `/api/attendance` | Admin, Teacher | එක student කෙනෙකුගේ attendance mark කරනවා |
| 15 | POST | `/api/attendance/bulk` | Admin, Teacher | ගොඩක් students ලගේ එකපාර mark කරනවා |
| 16 | GET | `/api/attendance/classroom/:id?date=...` | Login වෙච්ච users | දවසකට අදාළ class attendance එක ගන්නවා |
| 17 | GET | `/api/attendance/student/:id` | Login වෙච්ච users | Student කෙනෙකුගේ attendance history එක ගන්නවා |

දැන් අපි හදන්න පටන් ගමු! 🚀

---

## 🏗️ Phase 1: Foundation (Setup & Server)

> **Goal:** Express server එක run කරලා, ඒකට ගියාම "API is running!" කියලා response එකක් ගන්න එක.

```mermaid
flowchart LR
    A["👩‍💻 You\n(Browser)"] -->|"GET http://localhost:5000/"| B["⚙️ Express Server"]
    B -->|"200 OK\n'API is running!'"| A
```

### Step 1: Project එක හදන්න

```bash
mkdir backend
cd backend
```

### Step 2: Project එක Initialize කරන්න

```bash
npm init -y
```

මේකෙන් `package.json` file එකක් හැදෙනවා — ඒක තමයි අපේ project එකේ ID card එක.

### Step 3: ඕනෙ කරන Packages Install කරන්න

```bash
npm install express cors dotenv bcrypt jsonwebtoken @prisma/client
npm install --save-dev prisma nodemon
```

**මේ හැම package එකක්ම කරන්නේ මොකක්ද?**

| Package | කරන්නේ මොකක්ද? |
|---------|-------------|
| `express` | Web server එක හදලා routes handle කරනවා |
| `cors` | React frontend එකට අපේ backend එකත් එක්ක කතා කරන්න ඉඩ දෙනවා |
| `dotenv` | `.env` file එකෙන් secret passwords ලෝඩ් කරනවා |
| `bcrypt` | Passwords ආරක්ෂිත වෙන්න hash කරනවා |
| `jsonwebtoken` | Login tokens (JWT) හදනවා |
| `@prisma/client` | අපේ MySQL database එකත් එක්ක කතා කරනවා |
| `prisma` | Database models setup කරන්න පාවිච්චි කරන tool එක |
| `nodemon` | ඔයා file එකක් save කරපු ගමන් server එක ඉබේම restart කරනවා |

| Line | ඇයි අපි මේක ලිව්වේ? |
|------|------------------------|
| `npm init -y` | `package.json` එක හදනවා. `-y` එකෙන් අහන ප්‍රශ්න ඔක්කොටම "yes" කියනවා. |
| `npm install express cors ...` | මේ packages `node_modules/` එකට download කරලා `package.json` එකට add කරනවා. |
| `npm install --save-dev prisma nodemon` | `--save-dev` කියන්නේ "මේවා ඕනේ development කාලේදී විතරයි, production එකට නෙවෙයි" කියන එකයි. |

### Step 4: package.json Update කිරීම

`package.json` එක open කරලා `"type": "module"` එකතු කරලා scripts ටික update කරන්න:

```json
  "main": "src/server.js",
  "type": "module",
  "scripts": {
    "dev": "nodemon src/server.js",
    "start": "node src/server.js"
  }
```

| Line | ඇයි අපි මේක ලිව්වේ? |
|------|------------------------|
| `"type": "module"` | පරණ `require()` වෙනුවට අලුත් `import`/`export` syntax එක පාවිච්චි කරන්න ඉඩ දෙනවා. |
| `"dev": "nodemon src/server.js"` | `npm run dev` ගැහුවම server එක auto-restart වෙන්න පටන් ගන්නවා (development වලට). |
| `"start": "node src/server.js"` | `npm start` ගැහුවම server එක සාමාන්‍ය විදිහට run වෙනවා (production වලට). |

### Step 5: Folder Structure එක හැදීම

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

### Step 6: Minimal Server එක ලියන්න

> 💡 අපි ඉස්සෙල්ලාම ලියන්නේ **minimal** (ගොඩක් සරල) `server.js` එකක් — Express වැඩද කියලා test කරන්න විතරයි. පස්සේ routes ඔක්කොම හැදුවම අපි මේක සම්පූර්ණ කරනවා.

#### ❌ The Problem — Browser එක ඔයාගේ Frontend එක Block කරනවා!

ඔයාගේ React app එක දුවන්නේ `http://localhost:5173` වල. API එක දුවන්නේ `http://localhost:5000` වල. ඔයා React වලින් API එක call කරන්න හැදුවොත් browser එක ඒ request එක **block** කරනවා!

```mermaid
flowchart LR
    A["React App\nlocalhost:5173"] -->|"Request"| B["Browser\n(Security Check)"]
    B -->|"❌ BLOCKED!\nDifferent port = different origin"| C["Express API\nlocalhost:5000"]
```

**ඇයි ඒ?** Browsers වල තියෙනවා **CORS** (Cross-Origin Resource Sharing) කියලා security නීතියක්: website එකකට කතා කරන්න පුළුවන් ඒක ආපු server එකට විතරයි. වෙනස් port එකක් = වෙනස් origin එකක් = blocked.

#### ✅ The Solution — cors() middleware

`cors` package එකෙන් browser එකට කියනවා: "කමක් නෑ, වෙන origins වලින් එන requests වලට ඉඩ දෙන්න."

```mermaid
flowchart LR
    A["React App\nlocalhost:5173"] -->|"Request"| B["Browser\n(Security Check)"]
    B -->|"✅ ALLOWED!\ncors() says it's OK"| C["Express API\nlocalhost:5000"]
```

#### 📁 File: `src/server.js` (Minimal Version)

#### 🚀 FULL CODE (READY TO COPY)

```javascript
// Step 1: Load environment variables (මේක අනිවාර්යයෙන්ම මුලින්ම තියෙන්න ඕනේ!)
import "dotenv/config";

// Step 2: Import packages
import express from "express";
import cors from "cors";

// Step 3: Create the Express app
const app = express();

// Step 4: Add middleware
app.use(cors());          // React frontend එකට connect වෙන්න දෙනවා
app.use(express.json());  // JSON request bodies තේරුම් ගන්නවා

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

| Line | ඇයි අපි මේක ලිව්වේ? |
|------|------------------------|
| `import "dotenv/config"` | `.env` file එක `process.env` එකට ලෝඩ් කරනවා. මේක මුලින්ම තියෙන්න ඕනේ! |
| `import express from "express"` | Express framework එක ගන්නවා. |
| `const app = express()` | අලුත් Express application එකක් හදනවා. |
| `app.use(cors())` | Cross-origin requests වලට ඉඩ දෙනවා (React වලින් එන CORS errors හදනවා). |
| `app.use(express.json())` | Express එකට JSON bodies (`req.body`) තේරුම් ගන්න පුළුවන් කරනවා. මේක නැත්නම් `req.body` එක හැමවෙලේම `undefined` වෙනවා! |
| `app.get("/", ...)` | කවුරුහරි `http://localhost:5000/` වලට ආවම, JSON message එකක් යවනවා. |
| `app.listen(PORT, ...)` | Port 5000 වලින් server එක start කරලා console එකේ message එකක් print කරනවා. |

**Deep dive — මැජික් වගේ `app.use()`:**

Express වල, `app.use()` කියන්නේ ඔයාගේ global middleware pipeline එකට දේවල් add කරන විදිහයි. ඔයාගේ server එකට එන හැම request එකක්ම මේ pipeline එක හරහා උඩ ඉඳන් පල්ලෙහාට යනවා.

**`app.use(cors())`** — CORS ගැන හිතන්න හරියට වෙන ගම්වලින් එන අයට අකමැති club එකක ඉන්න bouncer කෙනෙක් වගේ. React frontend එක (`localhost:5173`) Express backend එකට (`localhost:5000`) කතා කරන්න හැදුවොත්, browser එක ඒක block කරන්නේ ඒගොල්ලෝ වෙනස් "ගම්වලින්" (ports වලින්) එන නිසයි. `cors()` එකෙන් browser එකට කියනවා: "කමක් නෑ, හැමෝටම ඇතුළට එන්න දෙන්න."

**`app.use(express.json())`** — Default විදිහට, Express ට මුකුත් තේරෙන්නේ නෑ. Frontend එකෙන් POST request එකක `{ "name": "Nimal" }` කියලා එව්වොත්, Express දකින්නේ තේරුමක් නැති raw text bytes ගොඩක් විතරයි. `express.json()` එකෙන් ඒ request එක මැදින් පැනලා, ඒ raw text එක කියවලා, ලස්සන JavaScript object එකක් කරලා ඒක `req.body` එකට අමුණනවා. මේ line එක නැත්නම් `req.body` එක හැමවෙලේම `undefined` වෙනවා, එතකොට ඔයාගේ app එක වැඩ කරන්නේ නෑ!

> ⚠️ **මොනවද වැරදෙන්න පුළුවන්?**
> ඔයාට `app.use(express.json())` අමතක වුණොත්, හැම `req.body` එකක්ම `undefined` වෙනවා. එතකොට ඔයාගේ register සහ login routes සද්ද නැතුවම fail වෙනවා මොකද `req.body.email` එක `undefined` නිසයි.

### 🧪 Phase 1 Test: Server එක වැඩද?

```bash
npm run dev
```

ඔයාට මේ විදිහට පේන්න ඕනේ:
```
==============================================
  designHer 2.0 Attendance API
  Server is running on http://localhost:5000
==============================================
```

**Postman එකෙන් Test කිරීම:**
```
Method: GET
URL:    http://localhost:5000/
```

**මොනවද බලන්න ඕනේ:**
```json
{ "success": true, "message": "designHer 2.0 Attendance API is running!", "data": null }
```

✅ ඔයාට මේක පේනවා නම්, Phase 1 සම්පූර්ණයි! ඔයාගේ server එක වැඩ.

| Common Error | Cause (හේතුව) | Fix (විසඳුම) |
|-------------|-------|-----|
| `Cannot find module 'express'` | Packages install කරලා නෑ | `npm install` run කරන්න |
| `Port 5000 is already in use` | වෙන server එකක් run වෙනවා | `.env` එකේ PORT එක 5001 කරන්න, නැත්නම් අනිත් server එක close කරන්න |

---

## 🔐 Phase 2: Database & Security (Fridge එක සහ Safe එක)

> **Goal:** අපේ Day 1 MySQL database එකට Prisma පාවිච්චි කරලා connect වෙන එක සහ රහස් ආරක්‍ෂිතව තියාගන්න විදිහ ඉගෙන ගන්න එක.

```mermaid
flowchart TD
    A["Phase 2 Goal"] --> B["1. රහස් ආරක්‍ෂිතව තියාගැනීම\n(.env file)"]
    A --> C["2. MySQL එකට connect වීම\n(Prisma ORM)"]
    A --> D["3. Files අතරේ කෝඩ් share කිරීම\n(import/export)"]
```

### ❌ The Problem — Hardcoded Secrets (කෝඩ් එකේම රහස් ලිවීම)

හිතන්න ඔයා ඔයාගේ කෝඩ් එකේ මේ විදිහට ලියනවා කියලා:

```javascript
// ❌ DANGER! ඔයාගේ ඇත්තම MySQL password එක කෝඩ් එකේම තියෙනවා!
const database = connectToMySQL("root", "MySecretPassword123");
const jwtSecret = "super-secret-key-12345";
```

දැන් ඔයා මේක GitHub එකට push කරනවා. **එතකොට මොකද වෙන්නේ?**

```mermaid
flowchart TD
    A["😊 ඔයා කෝඩ් එක\nGitHub එකට push කරනවා"] --> B["🌍 කෝඩ් එක internet එකේ\nPUBLIC විදිහට තියෙනවා"]
    B --> C["😈 Hacker කෙනෙක් ඔයාගේ\npassword එක හොයාගන්නවා"]
    C --> D["💀 DISASTER (විනාශයයි)!"]
    D --> E["Hacker ඔයාගේ database එක\ndelete කරනවා"]
    D --> F["Hacker ඔක්කොම user data\nහොරකම් කරනවා"]
    D --> G["Hacker ඔයාගේ server එක\ncrypto mining වලට පාවිච්චි කරනවා"]
```

> ⚠️ **මේක හැමදාම වෙන දෙයක්.** Developers ලා අත්වැරදීමකින් GitHub එකට passwords push කරපු නිසා ඇත්තම companies වලට මිලියන ගාණක සල්ලි නැති වෙලා තියෙනවා. GitHub වල bots ඉන්නවා ඔයා push කරලා තත්පර ගාණක් යන්න කලින් passwords තියෙනවද කියලා scan කරන.

#### 🎬 Scenario: අමාරාගේ වැරැද්ද

අමාරා (අපේ admin) Day 1 ඉවර වෙලා ගොඩක් සතුටින් ඉන්නේ. එයා එයාගේ MySQL password එක වෙන `MySecretPassword123` කියන එක `server.js` එකේම ලියලා GitHub එකට push කරනවා. තත්පර 30ක් යන්න කලින්, bot කෙනෙක් ඒ password එක හොයාගන්නවා. පහුවදා උදේ බලනකොට එයාගේ සම්පූර්ණ `attendance_system_db` database එකම නෑ. Students ලගේ records ඔක්කොම — delete වෙලා. එයාට මුල ඉඳන් ඔක්කොම ආපහු හදන්න වෙනවා. මේක වළක්වා ගන්න පුළුවන් දෙයක්.

### ✅ The Solution — Environment Variables (.env)

Passwords කෝඩ් එකේ ලියනවා වෙනුවට, අපි ඒවා NEVER GitHub එකට push වෙන්නේ නැති `.env` කියලා **secret file එකක** (රහස් ගොනුවක) දානවා.

```mermaid
flowchart LR
    A[".env file\n(SECRET — ඔයාගේ laptop එකේ විතරයි තියෙන්නේ)"] -->|"dotenv ඒක load කරනවා"| B["process.env\n(කෝඩ් එකේ පාවිච්චි කරන්න පුළුවන්)"]
    C[".env.example\n(TEMPLATE — GitHub එකට push කරනවා)"] -->|"Format එක පෙන්නනවා"| D["අනිත් developers ලට තේරෙනවා\nමොනවද fill කරන්න ඕනේ කියලා"]
```

#### 📁 File: `.env`

`backend/` folder එක ඇතුළේ `.env` කියලා file එකක් හදන්න:

#### 🚀 FULL CODE (READY TO COPY)

```env
# Database Connection
DATABASE_URL="mysql://root:YOUR_MYSQL_PASSWORD@localhost:3306/attendance_system_db"

# JWT Secret Key (ඕනෑම random string එකක් — දිග එකක් දෙන්න!)
JWT_SECRET="designher-bootcamp-2026-super-secret-key"

# Server Port
PORT=5000
```

> ⚠️ `YOUR_MYSQL_PASSWORD` කියන තැනට ඔයාගේ ඇත්තම MySQL password එක දෙන්න.

| Line | ඇයි අපි මේක ලිව්වේ? |
|------|------------------------|
| `DATABASE_URL` | Prisma එකට අපේ MySQL database එකට connect වෙන්න ඕන කරන සම්පූර්ණ connection string එක. |
| `JWT_SECRET` | JWT tokens sign කරන්න පාවිච්චි කරන secret key එකක්. මේක දන්න ඕනෑම කෙනෙකුට බොරු tokens හදන්න පුළුවන්! |
| `PORT` | අපේ server එක listen කරන port එක. |

#### 📁 File: `.env.example`

මේ file එක **template** එකක්, මේක ඔයා GitHub එකට push කරනවා. මේකෙන් අනිත් developers ලට එයාලට ඕන කරන variables මොනවද කියලා පෙන්වනවා, හැබැයි ඇත්තම values නැතුව:

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

මේකෙන් Git එකට කියනවා කවදාවත් මේ files push කරන්න එපා කියලා:

#### 🚀 FULL CODE (READY TO COPY)

```
node_modules/
.env
```

#### Environment Variables කෝඩ් එකේ පාවිච්චි කරන්නේ කොහොමද

```javascript
// ✅ SAFE! ඇත්තම password එක තියෙන්නේ .env එකේ මිසක් කෝඩ් එකේ නෙවෙයි
import "dotenv/config"; // .env file එක ලෝඩ් කරනවා

const secret = process.env.JWT_SECRET;   // .env එකෙන් කියවනවා
const dbUrl = process.env.DATABASE_URL;  // .env එකෙන් කියවනවා
```

```mermaid
flowchart LR
    A["ඔයාගේ කෝඩ් එක\n(GitHub එකේ)"] -->|"process.env.JWT_SECRET"| B[".env එකෙන් කියවනවා\n(GitHub එකේ නෑ)"]
    B --> C["ඇත්තම value එක ගන්නවා\ndesignher-bootcamp-2026-..."]
```

> 💡 **නීතිය:** කවදාවත් passwords, API keys, හෝ secret tokens කෙලින්ම කෝඩ් එකේ ලියන්න එපා. හැමවෙලේම `.env` පාවිච්චි කරන්න.

---

### Prisma පාවිච්චි කරලා Database එකට Connect වීම

#### ❌ The Problem — Raw SQL ලිවීම එපා වෙනවා

Day 1 එකේදී, ඔයා මේ වගේ SQL queries ලිව්වා:

```sql
SELECT s.name, s.registration_number, a.status
FROM students s
INNER JOIN attendance a ON s.id = a.student_id
WHERE a.classroom_id = 1 AND a.date = '2026-04-28';
```

දැන් හිතන්න මේ SQL strings JavaScript ඇතුළේ ලියනවා කියලා:

```javascript
// ❌ මේක කැතයි, කියවන්න අමාරුයි, වරදින්න තියෙන ඉඩකඩ වැඩියි!
const result = await connection.query(
  "SELECT s.name, s.registration_number, a.status FROM students s INNER JOIN attendance a ON s.id = a.student_id WHERE a.classroom_id = " + classroomId + " AND a.date = '" + date + "'"
);
// ඒ මදිවට: SQL injection attacks වලින් ඔයාගේ database එක hack කරන්න පුළුවන්! 😱
```

**JavaScript ඇතුළේ raw SQL ලිව්වම එන ප්‍රශ්න:**
1. ලියන්න සහ කියවන්න අමාරුයි
2. Typos (අකුරු වැරදීම්) වෙන්න ලේසියි (autocomplete නෑ)
3. SQL injection attacks වලට ගොදුරු වෙන්න පුළුවන්
4. Run කරනකන් errors බලාගන්න විදිහක් නෑ

#### ✅ The Solution — Prisma ORM

**Prisma** කියන්නේ ORM (Object-Relational Mapper) එකක්. මේකෙන් අපිට SQL වෙනුවට JavaScript පාවිච්චි කරලා database එකත් එක්ක කතා කරන්න ඉඩ දෙනවා.

```javascript
// ✅ පිරිසිදුයි, ආරක්ෂිතයි, කියවන්නත් ලේසියි!
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
    A["ඔයාගේ JavaScript කෝඩ් එක"] -->|"prisma.user.findMany()"| B["Prisma ORM\n(ඔයා වෙනුවෙන් translate කරනවා)"]
    B -->|"SELECT * FROM users"| C["MySQL Database"]
```

#### Prisma Set Up කිරීම

```bash
npx prisma init
```

මේකෙන් `prisma/` කියලා folder එකක් හදලා ඒක ඇතුළේ `schema.prisma` file එකක් හදනවා.

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

// User model — "users" table එකට සම්බන්ධ වෙනවා
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

// Classroom model — "classrooms" table එකට සම්බන්ධ වෙනවා
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

// Student model — "students" table එකට සම්බන්ධ වෙනවා
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

// Attendance model — "attendance" table එකට සම්බන්ධ වෙනවා
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

| Prisma Code | කරන්නේ මොකක්ද |
|-------------|-------------|
| `@id` | මේ field එක තමයි primary key එක |
| `@default(autoincrement())` | 1, 2, 3... විදිහට ඉබේම generate වෙනවා |
| `@unique` | කිසිම records දෙකකට එකම value එක තියෙන්න බෑ |
| `@map("teacher_id")` | JavaScript වල පාවිච්චි කරන්නේ `teacherId` වුණාට database column එක `teacher_id` |
| `@@map("users")` | JavaScript වල පාවිච්චි කරන්නේ `User` වුණාට database table එක `users` |
| `@relation` | Tables දෙකක් අතර සම්බන්ධයක් (FOREIGN KEY එකක් වගේ) හදනවා |
| `@@unique([studentId, date])` | Student කෙනෙකුට දවසකට තියෙන්න පුළුවන් ONE attendance record එකක් විතරයි |

#### Prisma Client එක Generate කිරීම

> ⚠️ **STOP!** මේක run කරන්න කලින්, අනිවාර්යයෙන්ම ඔයා Phase 1 එකේදී හදපු `.env` file එකේ `DATABASE_URL` එකට ඔයාගේ ඇත්තම MySQL password එක දීලා තියෙන්න ඕනේ. Prisma එකට `.env` file එක හොයාගන්න බැරි වුණොත්, මේක crash වෙනවා!

```bash
npx prisma generate
```

මේකෙන් අපිට අපේ JavaScript files ඇතුළේ පාවිච්චි කරන්න පුළුවන් Prisma client code එක හදනවා.

---

### The "Locked Room" — Import/Export වැඩ කරන්නේ කොහොමද

#### ❌ The Problem — Lines 5000ක Nightmare එක

අපිට `import` සහ `export` තිබ්බේ නෑ කියලා හිතන්න. එහෙම වුණා නම් අපිට සම්පූර්ණ backend එකම — database logic, user auth, students, teachers, routes ඔක්කොම — ලියන්න වෙන්නේ එකම එක `server.js` file එකක් ඇතුළේ. ඒක lines 5000ක් විතර දිග වෙයි! Bug එකක් හොයාගන්න එක ලොකු වදයක් වෙනවා. අපේ කෝඩ් එක පොඩි, පිළිවෙළ files වලට කඩන්න අපිට ක්‍රමයක් ඕනේ.

#### ✅ The Solution — Modules ("Locked Room" Analogy එක)

Node.js වලදී, හැම `.js` file එකක්ම හරියට **"Locked Room"** (ඉබි යතුරු දාපු කාමරයක්) එකක් වගේ.

ඔයා `db.js` ඇතුළේ function එකක් හරි variable එකක් හරි හැදුවොත්, ඔයාගේ app එකේ අනිත් තැන්වලට ඒක පේන්නේ නෑ පාවිච්චි කරන්නත් බෑ. ඒක ඒ කාමරේ ඇතුළේ ලොක් වෙලා තියෙන්නේ.

- **`export`** කියන්නේ හරියට දොරේ තියෙන පොඩි ජනේලයක් ඇරලා ඒ function එක එළියට දෙනවා වගේ වැඩක්. "මෙන්න, ඕනෑම කෙනෙකුට මේක පාවිච්චි කරන්න පුළුවන්."
- **`import`** කියන්නේ වෙන file එකක් ඒ ජනේලේ ගාවට ඇවිල්ලා ඒක භාරගන්නවා වගේ වැඩක්. "මට ඒ function එක ඕනේ!"

**Exports වර්ග දෙකක් තියෙනවා:**

1. **Default Export (`export default`)**
   මේක පාවිච්චි කරන්නේ file එකක share කරන්න තියෙන්නේ **එක main boss කෙනෙක්ව** විතරක් නම්.
   *Example:* `db.js` එකෙන් export කරන්නේ `prisma` client එක විතරයි.
   *import කරන විදිහ:* ඔයාට කැමති නමක් දෙන්න පුළුවන්: `import myDatabase from "./db.js"`.

2. **Named Export (`export { ... }`)**
   මේක පාවිච්චි කරන්නේ file එකකින් **tools ගොඩක්** share කරනකොට.
   *Example:* `authRepository.js` එකෙන් `findUser`, `createUser`, සහ `deleteUser` කියන සේරම export කරනවා.
   *import කරන විදිහ:* ඔයා අනිවාර්යයෙන්ම ඒ හරියටම තියෙන නම් සඟල වරහන් (curly braces) ඇතුළේ පාවිච්චි කරන්න ඕනේ: `import { createUser } from "./authRepository.js"`.

```mermaid
flowchart LR
    A["📦 db.js\n(Locked Room එක)"] -->|"export default prisma\n(ජනේලෙන් එළියට දෙනවා)"| B["import prisma...\n(භාරගන්නවා)"]
    C["authRepository.js\n(තව Room එකක්)"] -->|"import prisma"| A
```

> ⚠️ **ESM නීතිය:** Modern JavaScript (ESM) වලදී, ඔයා imports වල අනිවාර්යයෙන්ම `.js` extension එක දාන්නම ඕනේ. `"../config/db"` කියලා දැම්මොත් වැඩ කරන්නේ නෑ — ඒක `"../config/db.js"` වෙන්නම ඕනේ. මේක පරණ CommonJS `require()` වලට වඩා වෙනස්, ඒකෙදි extensions නොදා ඉන්න පුළුවන්.

---

### Database Connection File එක හැදීම

#### 📁 File: `src/config/db.js`

#### 🚀 FULL CODE (READY TO COPY)

```javascript
// Prisma package එකෙන් PrismaClient එක import කරගන්නවා
import { PrismaClient } from "@prisma/client";

// අලුත් Prisma client instance එකක් හදනවා
const prisma = new PrismaClient();

// අනිත් files වලට පාවිච්චි කරන්න පුළුවන් වෙන්න ඒක export කරනවා
export default prisma;
```

| Line | ඇයි අපි මේක ලිව්වේ? |
|------|------------------------|
| `import { PrismaClient } from "@prisma/client"` | අපි install කරපු package එකෙන් Prisma tool එක ගන්නවා. `{ }` සඟල වරහන් වලින් කියන්නේ "මට මේ package එකෙන් මේ එක දේ විතරයි ඕනේ" කියලා. |
| `const prisma = new PrismaClient()` | අපේ database එකට අලුත් connection එකක් හදනවා. `new` එකෙන් අලුත් instance එකක් හදනවා. මේක හරියට database එකේ phone number එකට dial කරනවා වගේ වැඩක්. අපි මුළු app එකටම මේක කරන්නේ එක පාරයි. |
| `export default prisma` | මේ connection එක අනිත් ඔක්කොම files එක්ක share කරනවා. `export default` වලින් කියන්නේ "මේ file එකෙන් දෙන main දේ මේකයි" කියලා. අනිත් files වලට `import prisma from "./config/db.js"` පාවිච්චි කරලා ඒක ගන්න පුළුවන්. |

> ⚠️ **ඇයි ONE Prisma client එකක් විතරක් පාවිච්චි කරන්නේ?** හැම `new PrismaClient()` එකකින්ම database එකට අලුත් connection pool එකක් හදනවා. හැම file එකකින්ම අලුත් එකක් හැදුවොත්, ඔයාගේ connections ඉක්මනටම ඉවර වෙලා database එක crash වෙයි. එක පාරක් හදලා ඒක share කරන එකෙන්, අපි එක කාර්යක්ෂම connection pool එකක් පාවිච්චි කරනවා.

```mermaid
flowchart TD
    A["db.js\n(ONE Prisma client එකක් හදනවා)"] --> B["authRepository.js\nimport prisma from db.js"]
    A --> C["classroomRepository.js\nimport prisma from db.js"]
    A --> D["studentRepository.js\nimport prisma from db.js"]
    A --> E["attendanceRepository.js\nimport prisma from db.js"]
```

### 🧪 Phase 2 Test: Prisma එකට ඔයාගේ Database එකත් එක්ක කතා කරන්න පුළුවන්ද?

```bash
npx prisma generate
```

**මොනවද බලන්න ඕනේ:**
```
✔ Generated Prisma Client (vX.X.X) to ./node_modules/@prisma/client
```

✅ ඔයාට මේක පේනවා නම්, Phase 2 සම්පූර්ණයි! Prisma එකට ඔයාගේ database එකත් එක්ක කතා කරන්න පුළුවන්.

| Common Error | Cause (හේතුව) | Fix (විසඳුම) |
|-------------|-------|-----|
| `P1001: Can't reach database server` | MySQL run වෙන්නේ නෑ | XAMPP එකෙන් MySQL start කරන්න |
| `Error: schema.prisma not found` | ඔයා `npx prisma init` run කරලා නෑ | `backend/` folder එකේ ඉඳන් ඒක run කරන්න |
| `Error loading .env file` | `.env` file එක නෑ නැත්නම් වැරදි තැනක තියෙන්නේ | `.env` එක `backend/` එකේ මිසක් `backend/src/` එකේ නෙවෙයි තියෙන්නේ කියලා make sure කරන්න |

---

## 🔑 Phase 3: The Register Slice (Repository → Service → Controller → Route)

> **Goal:** සම්පූර්ණ Register feature එක — database එකේ ඉඳන් URL එක වෙනකන් හදලා Postman එකෙන් test කිරීම.

අපි මේ slice එක ඔක්කොම layers හරහා හදනවා, එතකොට ඔයාට පෙනෙයි ඒවා කොහොමද connect වෙන්නේ කියලා:

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
    DB->>RP: null (හොයාගන්න නෑ)
    S->>S: bcrypt වලින් Hash password කරනවා
    S->>RP: createUser(name, email, hashedPassword, role)
    RP->>DB: INSERT INTO users ...
    DB->>RP: newUser
    RP->>S: newUser
    S->>C: { success: true, data: { id, name, email, role } }
    C->>P: 201 Created + JSON
```

### async/await තේරුම් ගැනීම — JavaScript ට ඉවසීමක් නෑ!

අපි අපේ පලවෙනි database query එක ලියන්න කලින්, ඔයා JavaScript ගැන ගොඩක් වැදගත් දෙයක් තේරුම් ගන්න ඕනේ.

JavaScript ට **ඉවසීමක් නෑ** (impatient). ඔයා ඒකට හිමින් වෙන දෙයක් (database එකක් එක්ක කතා කරනවා වගේ) කරන්න කිව්වම, ඒක බලාගෙන ඉන්නේ නෑ. ඒක අනිත් line එකට ඉක්මනට යනවා.

```javascript
// ❌ මේක වැඩ කරන්නේ නෑ! JavaScript ට ඉවසීමක් නෑ!
function getUser() {
  const user = database.findUser("nimal@school.com"); // 100ms යනවා...
  console.log(user); // ඉක්මනටම run වෙනවා — බලාගෙන ඉන්නේ නෑ!
  // Result: undefined 😱
}
```

```mermaid
flowchart LR
    A["Line 1:\nDatabase එකෙන් අහනවා"] --> B["Line 2:\nconsole.log(user)"]
    B --> C["Result: undefined!\nDatabase එක තාම reply කරලා නෑ"]
    A -.->|"100ms ගියාට පස්සේ..."| D["Database එකේ reply එක එනවා\nහැබැයි දැන් පරක්කු වැඩියි!"]
```

#### 🎬 Scenario: Nimal ගේ Debugging Nightmare එක

Nimal `const user = prisma.user.findUnique(...)` කියලා ලියනවා හැබැයි එයාට `await` දාන්න අමතක වෙනවා. Code එක run වෙනවා, `user` කියන එක `undefined` වෙනවා, ඊටපස්සේ ඊළඟ line එකේ `Cannot read properties of undefined` කියලා crash වෙනවා. එයා විනාඩි 30ක් විතර එයාගේ Prisma query එක check කරනවා, හැබැයි ඇත්තම ප්‍රශ්නේ වුණේ එක වචනයක් අමතක වෙච්ච එකයි: `await`.

#### ✅ The Solution — async/await

`async/await` වලින් JavaScript ට කියනවා: **"මේක ඉවර වෙනකන් මෙතන බලාගෙන ඉන්න (WAIT)."**

```javascript
// ✅ මේක වැඩ! JavaScript database එක වෙනුවෙන් බලාගෙන ඉන්නවා!
async function getUser() {
  const user = await database.findUser("nimal@school.com"); // මෙතන ඉන්න!
  console.log(user); // Database එක response එක දුන්නට පස්සේ run වෙනවා!
  // Result: { name: "Nimal", email: "nimal@school.com" } ✅
}
```

```mermaid
flowchart LR
    A["Line 1:\ndatabase query එකට await කරනවා"] -->|"100ms ඉන්නවා..."| B["Database එක reply කරනවා!"]
    B --> C["Line 2:\nconsole.log(user)\nදැන් ඇත්තම data තියෙනවා ✅"]
```

**සරල නීති 3ක්:**
1. Function name එකට කලින් `async` දාන්න
2. ඕනෑම හිමින් වෙන වැඩකට කලින් (database queries, API calls) `await` දාන්න
3. `await` පාවිච්චි කරන්න පුළුවන් `async` function එකක් ඇතුළේ විතරයි

---

### Layer 1: Auth Repository (Fridge එක)

මේ file එක කතා කරන්නේ database එකත් එක්ක විතරයි. මේක HTTP, passwords, හෝ tokens ගැන මුකුත්ම දන්නේ නෑ.

**Relative paths තේරුම් ගැනීම:** අපි ඉන්නේ `src/repositories/authRepository.js` වල, අපිට `src/config/db.js` import කරගන්න ඕනේ:

```
src/
├── config/
│   └── db.js            ← අපිට යන්න ඕනේ මෙතනට
├── repositories/
│   └── authRepository.js  ← අපි ඉන්නේ මෙතන
```

| Symbol | තේරුම | Analogy |
|--------|---------|---------|
| `./` | Current folder (දැන් ඉන්න folder එක) | "මම දැන් ඉන්න කාමරේම බලන්න" |
| `../` | Parent folder (එකක් උඩට යන්න) | "දොරෙන් එළියට ගිහින් බලන්න" |
| `../../` | Folders දෙකක් උඩට යන්න | "දොරවල් දෙකකින් එළියට යන්න" |

```mermaid
flowchart LR
    A["authRepository.js\n(repositories/ ඇතුළේ)"] -->|"../ = src/ එකට යන්න"| B["src/"]
    B -->|"config/ = folder එකට යන්න"| C["config/"]
    C -->|"db.js = file එක"| D["db.js ✅"]
```

#### 📁 File: `src/repositories/authRepository.js`

#### 🚀 FULL CODE (READY TO COPY)

```javascript
import prisma from "../config/db.js";

// Email එකෙන් user කෙනෙක්ව හොයන්න
async function findUserByEmail(email) {
  const user = await prisma.user.findUnique({
    where: {
      email: email,
    },
  });
  return user;
}

// ID එකෙන් user කෙනෙක්ව හොයන්න
async function findUserById(id) {
  const user = await prisma.user.findUnique({
    where: {
      id: id,
    },
  });
  return user;
}

// Database එකේ අලුත් user කෙනෙක්ව හදන්න
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

// ඔක්කොම users ලව ගන්න (passwords නැතුව!)
async function findAllUsers() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      // අපි password select කරන්නේ නෑ — කවදාවත් passwords යවන්න එපා!
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

| Line | ඇයි අපි මේක ලිව්වේ? |
|------|------------------------|
| `import prisma from "../config/db.js"` | `db.js` එකෙන් share කරපු Prisma client එක ගන්නවා. |
| `prisma.user.findUnique({ where: { email } })` | Unique email එකෙන් එක user කෙනෙක්ව හොයනවා. එකක් හම්බවුණාම හොයන එක නවත්තනවා. |
| `prisma.user.create({ data: { ... } })` | `users` table එකට අලුත් row එකක් දානවා. |
| `prisma.user.findMany({ select: { ... } })` | ඔක්කොම users ලව ගන්නවා, හැබැයි අපි තෝරපු fields ටික විතරක් දෙනවා. |
| `export { findUserByEmail, ... }` | Named exports — functions ගොඩක් share කරනවා. අනිත් files වලදී `import { createUser } from ...` කියලා ගන්න පුළුවන්. |

| Prisma Method | කරන්නේ මොකක්ද | SQL සමාන කම |
|---------------|-------------|----------------|
| `prisma.user.findUnique()` | Unique field එකකින් ONE record එකක් හොයනවා | `SELECT * FROM users WHERE email = ?` |
| `prisma.user.findMany()` | Match වෙන ඔක්කොම records හොයනවා | `SELECT * FROM users` |
| `prisma.user.create()` | අලුත් record එකක් insert කරනවා | `INSERT INTO users VALUES (...)` |

> ⚠️ **Security:** `findAllUsers` එකේදී, අපි `select` පාවිච්චි කරලා අපිට return කරන්න ඕන fields මොනවද කියලා තෝරනවා. අපි කවදාවත් `password` field එක දෙන්නේ නෑ! අපි එහෙම කරොත්, මේ API එක call කරන ඕනෑම කෙනෙකුට හැමෝගෙම password hashes බලන්න පුළුවන්.


### Layer 2: Auth Service — Passwords & Hashing (Chef)

Service layer එකෙන් කරන්නේ **business logic** එක — ඒ කියන්නේ නීති සහ තීරණ ගන්න එකයි.

#### ❌ The Problem — Plain Text විදිහට Passwords Save කිරීම

```javascript
// ❌ කවදාවත් මේක කරන්න එපා! සාමාන්‍ය අකුරු විදිහට password එක save කරනවා!
async function registerUser(name, email, password) {
  const user = await createUser(name, email, password, "teacher");
  // දැන් Database එකේ තියෙන්නේ: password = "teacher123"
  // Database එක දකින ඕනෑම කෙනෙකුට මේක කියවන්න පුළුවන්!
}
```

```mermaid
flowchart TD
    A["😊 Nimal register වෙනවා\npassword: teacher123"] --> B["📦 Database එකේ save වෙනවා:\npassword = teacher123"]
    B --> C["😈 Hacker කෙනෙක් ඔයාගේ\ndatabase එකට කඩාවදිනවා"]
    C --> D["💀 Hacker ට ඔක්කොම passwords\nසාමාන්‍ය අකුරෙන් පේනවා!"]
    D --> E["🔓 Hacker Nimal විදිහට\nlogin වෙනවා"]
    D --> F["🌐 Hacker ඒ password එකම\nGmail, Facebook, Bank වලටත් ගහලා බලනවා..."]
```

> ⚠️ **ඇත්තම උදාහරණයක්:** 2012 දී LinkedIn එක hack වුණා. Passwords මිලියන 6.5ක් හොරකම් කරා. ගොඩක් ඒවා දුර්වල විදිහට තමයි hash කරලා තිබ්බේ. එකම password එක හැමතැනටම පාවිච්චි කරපු අයගේ අනිත් accounts වලටත් පාඩු වුණා.

#### ✅ The Solution — bcrypt වලින් Hashing කිරීම

**Hashing** කියන්නේ එක පැත්තකට විතරක් කරන්න පුළුවන් වෙනස් කිරීමක්. ඔයාට password එකක් hash එකක් කරන්න පුළුවන්, හැබැයි ඔයාට **කවදාවත් hash එකක් ආපහු password එකක් කරන්න බෑ**. මේක හරියට මස් අඹරන මැෂින් එකක් වගේ — ඔයාට මස් වලින් බර්ගර් එකක් හදන්න පුළුවන්, හැබැයි බර්ගර් එකකින් ආපහු මුල් මස් ටික ගන්න බෑ.

```mermaid
flowchart LR
    A["teacher123\n(plain text)"] -->|"bcrypt.hash()"| B["$2b$10$VxB/Z1jc...\n(hashed — ආපහු හරවන්න බෑ!)"]
    B -.->|"❌ ආපහු හැරවීම\nඅශක්‍යයි"| A
```

**Salting කියන්නේ මොකක්ද?** "Salt" එකක් කියන්නේ hash කරන්න කලින් password එකට එකතු කරන random අකුරු ගොඩක්. Users දෙන්නෙකුට එකම password එක තිබ්බත්, එයාලගේ hashes දෙක වෙනස් වෙනවා!

```
User 1: "teacher123" + random_salt_abc → $2b$10$Abc...
User 2: "teacher123" + random_salt_xyz → $2b$10$Xyz...  (වෙනස්!)
```

#### 📁 File: `src/services/authService.js`

දැනට අපි ලියන්නේ `registerUser` function එක විතරයි. අපි `loginUser` එක Phase 4 එකේදී එකතු කරනවා.

#### 🚀 FULL CODE (READY TO COPY)

```javascript
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { findUserByEmail, createUser, findAllUsers } from "../repositories/authRepository.js";

// අලුත් user කෙනෙක්ව register කිරීම
async function registerUser(name, email, password, role) {
  // Step 1: Email එක දැනටමත් තියෙනවද බලන්න
  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    return {
      success: false,
      message: "මේ email එකෙන් දැනටමත් user කෙනෙක් ඉන්නවා.",
      data: null,
    };
  }

  // Step 2: Password එක Hash කිරීම (කවදාවත් plain text save කරන්න එපා!)
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  // Step 3: Database එකේ save කිරීම (HASH කරපු password එකත් එක්ක)
  const newUser = await createUser(name, email, hashedPassword, role);

  // Step 4: Success එක return කිරීම (password එක නැතුව!)
  return {
    success: true,
    message: "User ව සාර්ථකව register කරා.",
    data: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
    },
  };
}

// User කෙනෙක්ව Login කිරීම
async function loginUser(email, password) {
  // Step 1: Email එකෙන් user ව හොයන්න
  const user = await findUserByEmail(email);
  if (!user) {
    return {
      success: false,
      message: "Email එක හෝ password එක වැරදියි.",
      data: null,
    };
  }

  // Step 2: Store කරලා තියෙන hash එකත් එක්ක password එක ගලපලා බලන්න
  const isPasswordCorrect = await bcrypt.compare(password, user.password);
  if (!isPasswordCorrect) {
    return {
      success: false,
      message: "Email එක හෝ password එක වැරදියි.",
      data: null,
    };
  }

  // Step 3: JWT token එක හදන්න
  const tokenPayload = {
    userId: user.id,
    role: user.role,
  };
  const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
    expiresIn: "24h",
  });

  // Step 4: Token එක සහ user info return කරන්න
  return {
    success: true,
    message: "සාර්ථකව Login වුණා.",
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

// ඔක්කොම users ලව ගන්න (admin ට)
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

| Line | ඇයි අපි මේක ලිව්වේ? |
|------|------------------------|
| `import bcrypt from "bcrypt"` | Password hashing tool එක ගන්නවා. bcrypt හදලම තියෙන්නේ හිමින් වැඩ කරන්න — ඒකෙන් brute-force attacks කරන එක අමාරු කරනවා. |
| `import jwt from "jsonwebtoken"` | JWT token tool එක ගන්නවා (Phase 4 login එකේදී පාවිච්චි වෙනවා). |
| `import { findUserByEmail, ... }` | Named imports — repository එකෙන් ඕනම කරන functions විතරක් ගන්නවා. |
| `await findUserByEmail(email)` | මේ email එකෙන් කවුරුහරි දැනටමත් register වෙලාද බලනවා. |
| `const saltRounds = 10` | Hashing strength එක දෙනවා. 10 කියන්නේ bcrypt එක password එක 2^10 = 1024 පාරක් process කරනවා කියන එකයි (~100ms). |
| `await bcrypt.hash(password, saltRounds)` | Plain text එක hash එකක් කරනවා. මේක CPU-heavy වැඩක් නිසා `await` අනිවාර්යයි. |
| `return { success, message, data }` | එකම විදිහේ response format එකක්. Frontend එකට හැමවෙලේම මොනවද එන්නේ කියලා දන්නවා. |

**Register වෙන flow එක:**

```mermaid
flowchart TD
    A["User name, email, password එවනවා"] --> B{"Email එක\nදැනටමත් තියෙනවද?"}
    B -->|"ඔව්"| C["Error එකක් දෙනවා:\nEmail එක දැනටමත් තියෙනවා"]
    B -->|"නෑ"| D["bcrypt වලින්\nPassword එක Hash කරනවා"]
    D --> E["User ව database එකේ\nsave කරනවා"]
    E --> F["Success දෙනවා\n(password එක නැතුව!)"]
```

> 💡 **Security tip:** අපි වැරදි email එකටයි වැරදි password එකටයි දෙකටම කියන්නේ "Invalid email or password" කියලයි. ඒකෙන් hacker කෙනෙකුට බැහැ අපේ system එකේ යම් email එකක් තියෙනවද නැද්ද කියලා හොයාගන්න.

---

### Layer 3: Auth Controller (Waiter)

Controller එකෙන් කරන්නේ HTTP request එක කියවලා HTTP response එක යවන එකයි.

#### HTTP කියන්නේ මොකක්ද?

HTTP කියන්නේ browsers සහ servers අතරේ කතා කරන භාෂාවයි.

| Part | Example | අරමුණ |
|------|---------|---------|
| **Method** | GET, POST, PUT, DELETE | මොකක්ද කරන්න ඕනේ කියන action එක |
| **URL** | `/api/students/5` | කොයි resource එකද ගන්න ඕනේ කියන එක |
| **Headers** | `Authorization: Bearer token...` | අමතර විස්තර (ඔයාගේ ID card එක වගේ) |
| **Body** | `{ "name": "Nimal", "email": "..." }` | ඔයා යවන data ටික |

**ගොඩක් පාවිච්චි වෙන status codes:**

| Code | තේරුම | පාවිච්චි කරන්නේ කවදද |
|------|---------|------------|
| `200` | OK | Request එක සාර්ථකයි |
| `201` | Created | අලුත් record එකක් හැදුවා |
| `400` | Bad Request | Client එව්වේ වැරදි data |
| `401` | Unauthorized | Login වෙලා නෑ (token එකක් නෑ) |
| `403` | Forbidden | Login වෙලා ඉන්නේ හැබැයි අවසර නෑ |
| `404` | Not Found | අදාළ resource එක හොයාගන්න නෑ |
| `500` | Server Error | අපේ පැත්තේ මොකක්හරි කැඩිලා |

#### ❌ The Problem — Error Handling නැති වුණොත් Server එක Crash වෙනවා

```javascript
// ❌ DANGEROUS! Database එක down වුණොත්, මේකෙන් මුළු server එකම CRASH වෙනවා!
async function getUsers(req, res) {
  const users = await getAllUsers();  // 💥 Database error!
  return res.status(200).json(users); // මේ line එක කවදාවත් run වෙන්නේ නෑ
  // Server එක crash වෙනවා. ඔක්කොම users ලට access නැති වෙනවා. 😱
}
```

```mermaid
flowchart TD
    A["Request එක එනවා"] --> B["Database එකට call කරනවා"]
    B --> C["💥 Database එක down!"]
    C --> D["❌ Unhandled Error"]
    D --> E["🔥 මුළු SERVER එකම CRASH වෙනවා"]
    E --> F["ඔක්කොම users ලට errors එනවා\nකවුරුහරි server එක restart කරනකන්"]
```

#### ✅ The Solution — try/catch

`try/catch` කියන්නේ ආරක්ෂිත දැලක් වගේ:

```mermaid
flowchart TD
    A["Request එක එනවා"] --> B["TRY: Database එකට call කරනවා"]
    B --> C{"ඒක හරි ගියාද?"}
    C -->|"ඔව් ✅"| D["200 OK යවනවා\ndata ත් එක්ක"]
    C -->|"නෑ ❌"| E["CATCH: 500 Error යවනවා\nහොඳ message එකකුත් එක්ක"]
    E --> F["Server එක දිගටම දුවනවා!\nඅනිත් users ලට ප්‍රශ්නයක් නෑ ✅"]
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
        message: "Name, email, සහ password අනිවාර්යයි.",
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
      message: "මොකක්දෝ වැරදීමක් වුණා. කරුණාකර නැවත උත්සාහ කරන්න.",
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
        message: "Email සහ password අනිවාර්යයි.",
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
      message: "මොකක්දෝ වැරදීමක් වුණා. කරුණාකර නැවත උත්සාහ කරන්න.",
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
      message: "මොකක්දෝ වැරදීමක් වුණා. කරුණාකර නැවත උත්සාහ කරන්න.",
      data: null,
    });
  }
}

// GET /api/auth/me (login වෙච්ච ඕනෑම කෙනෙකුට)
async function getMe(req, res) {
  try {
    return res.status(200).json({
      success: true,
      message: "User info සාර්ථකව ගත්තා.",
      data: {
        id: req.user.userId,
        role: req.user.role,
      },
    });
  } catch (error) {
    console.error("Get me error:", error);
    return res.status(500).json({
      success: false,
      message: "මොකක්දෝ වැරදීමක් වුණා. කරුණාකර නැවත උත්සාහ කරන්න.",
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

| Line | ඇයි අපි මේක ලිව්වේ? |
|------|------------------------|
| `req.body.name` | Client එවපු JSON එකෙන් `name` field එක කියවනවා. |
| `if (!name \|\| !email \|\| !password)` | අනිවාර්ය fields තියෙනවද කියලා බලනවා. `!` කියන්නේ "NOT" — හිස් strings සහ `undefined` කියන්නේ falsy values. |
| `res.status(201).json(result)` | HTTP 201 (Created) එකත් එක්ක JSON විදිහට result එක යවනවා. |
| `res.status(400).json(result)` | HTTP 400 (Bad Request) යවනවා — client එව්වේ වැරදි data. |
| `catch (error)` | `try` එක ඇතුළේ මොකක්හරි CRASH වුණොත්, මේක ඒ වෙනුවට run වෙනවා — server එක දිගටම දුවනවා. |

> 💡 **Pattern:** හැම controller function එකක්ම දේවල් 3ක් කරනවා: (1) `req` එකෙන් data කියවනවා, (2) Service එක call කරනවා, (3) හරි status code එකත් එක්ක `res` එක යවනවා. හැමවෙලේම මේවා `try/catch` ඇතුළේ දාන්න.

---

### Layer 4: Auth Routes (Front Desk එක)

#### REST කියන්නේ මොකක්ද?

REST කියන්නේ APIs design කරන්න තියෙන නීති මාලාවක්. URLs වලින් **දේවල්** (resources) නියෝජනය කරනවා, HTTP methods වලින් **ක්‍රියාවන්** (actions) නියෝජනය කරනවා.

| HTTP Method | Action (ක්‍රියාව) | උදාහරණය |
|-------------|--------|---------|
| **GET** | Data කියවීම | ඔක්කොම students ලව ගන්නවා |
| **POST** | අලුත් data හැදීම | අලුත් student කෙනෙක්ව හදනවා |
| **PUT** | තියෙන data update කිරීම | Student ගේ නම වෙනස් කරනවා |
| **DELETE** | Data මැකීම | Student ව මකනවා |

#### 📁 File: `src/routes/authRoutes.js`

#### 🚀 FULL CODE (READY TO COPY)

```javascript
import express from "express";
const router = express.Router();

import { register, login, getUsers, getMe } from "../controllers/authController.js";
import { verifyToken, authorizeRoles } from "../middlewares/authMiddleware.js";

// Public routes (login වෙන්න ඕනේ නෑ)
router.post("/register", register);
router.post("/login", login);

// Protected routes (login වෙන්න ඕනේ)
router.get("/me", verifyToken, getMe);

// Admin only route
router.get("/users", verifyToken, authorizeRoles("admin"), getUsers);

export default router;
```

| Line | ඇයි අපි මේක ලිව්වේ? |
|------|------------------------|
| `express.Router()` | එකට සම්බන්ධ routes ගොනු කරන "mini-app" එකක් හදනවා. |
| `router.post("/register", register)` | කවුරුහරි `/register` වලට POST එකක් එව්වම, `register` controller function එක run කරනවා. |
| `router.get("/me", verifyToken, getMe)` | ඉස්සෙල්ලා `verifyToken` middleware එක run කරනවා, ඊටපස්සේ `getMe` එක run කරනවා. |
| `export default router` | මේ router එක share කරනවා එතකොට `server.js` එකට මේක පාවිච්චි කරන්න පුළුවන්. |

> 💡 **ඇයි `/register` public වෙලා තියෙන්නේ?**
> ඇත්තම ලෝකේ app එකක, ඔයාට අලුත් teachers ලව register කරන එක සීමා කරන්න වෙනවා (උදා: Admins ලට විතරක්). හැබැයි අපේ bootcamp project එක සරලව තියාගන්න, අපි මේක public විදිහට තියනවා එතකොට Day 2 එකේදී tokens යවන එක ගැන කරදර වෙන්නේ නැතුව Admin Panel එකෙන් මේක ලේසියෙන්ම පාවිච්චි කරන්න පුළුවන්!

> ⚠️ **Note:** `verifyToken` සහ `authorizeRoles` imports වලින් errors පෙන්නයි මොකද අපි තාම middleware file එක හදලා නැති නිසා. ඒක ප්‍රශ්නයක් නෑ — අපි ඒක Phase 5 වලදී හදනවා! දැනට, Register route එක middleware නැතුව වැඩ කරනවා.

### server.js එකේ Register Route එක Connect කරන්න

`src/server.js` update කරන්න — auth routes import එකතු කරන්න:

ඔයාගේ දැනට තියෙන `server.js` එකට මේ lines ටික එකතු කරන්න:

```javascript
// දැනට තියෙන middleware lines වලට පස්සේ මේක දාන්න:
import authRoutes from "./routes/authRoutes.js";

// Test route එකට කලින් මේක දාන්න:
app.use("/api/auth", authRoutes);
```

> ⚠️ **Important:** `authRoutes.js` එක `authMiddleware.js` (තාම නැති file එකක්) එකෙන් import කරන නිසා, ඔයා දැන් server එක start කරන්න හැදුවොත් crash වෙයි. Phase 5 එකේ middleware file එක (හිස් එකක් හරි) ඉස්සෙල්ලා හදන්න, එහෙම නැත්නම් `authRoutes.js` එකේ `verifyToken` imports ටික තාවකාලිකව comment කරලා තියන්න. අපි මේක Phase 5 වලදී හරියට හදනවා.

### 🧪 Phase 3 Test: User කෙනෙක්ව Register කිරීම!

> ⚠️ අපේ routes තාම නැති middleware එකක් import කරන නිසා, අපි Phase 5 ට පස්සේ එකටම test කරමු. හැබැයි Register එකේ **code logic** එක සම්පූර්ණයි වගේම හරි. ඔයාට දැන්ම test කරන්න ඕනේ නම්, `authRoutes.js` එකෙන් `verifyToken` සහ `authorizeRoles` imports සහ protected routes තාවකාලිකව අයින් කරලා, public routes විතරක් ඉතුරු කරන්න.

**Postman එකෙන් Test කිරීම (Phase 5 ට පස්සේ):**
```
Method: POST
URL:    http://localhost:5000/api/auth/register
Body → raw → JSON:
```
```json
{ "name": "Kavitha Perera", "email": "kavitha@school.com", "password": "mypassword123", "role": "teacher" }
```

**මොනවද බලන්න ඕනේ:** `201 Created` එක්ක `{ "success": true, ... }` එන්න ඕනේ

**එකම email එකෙන් ආපහු try කරන්න:**
Expected: `400 Bad Request` — `"A user with this email already exists."` (මේ email එකෙන් දැනටමත් user කෙනෙක් ඉන්නවා.)

---

## 🐟 Phase 4: The Login Slice (JWT & Statelessness)

> **Goal:** HTTP වලට ඔයාව අමතක වෙන්නේ ඇයි කියලා තේරුම් ගන්න එක, Login feature එක හදන එක, සහ jwt.io එකෙන් token එකක් decode කරලා ඒක test කරන එක.

### ❌ The Problem — HTTP කියන්නේ Stateless (Goldfish මතකය)

හරි, user ලොගින් වුණා. හැබැයි HTTP වල ප්‍රශ්නයක් තියෙනවා: **ඒකට ඔයාව ඉක්මනටම අමතක වෙනවා**.

```mermaid
sequenceDiagram
    participant U as Nimal
    participant S as Server

    U->>S: POST /login (email + password)
    S->>U: ✅ Login successful!

    U->>S: GET /students
    S->>U: ❌ ඔයා කවුද?? මම ඔයාව දන්නේ නෑ!
    Note right of S: හැම request එකකටම පස්සේ<br/>HTTP වලට ඔයාව අමතක වෙනවා!
```

#### 🎬 Scenario: Nimal ගේ කලකිරීම

Nimal සාර්ථකව ලොගින් වෙනවා. Server එක කියනවා "Welcome, Nimal!" කියලා. එයා තත්පරේකට පස්සේ "View Students" click කරනවා. Server එක අහනවා "ඔයා කවුද?" කියලා. Nimal ට පිස්සු වගේ — එයා මේ දැන් ලොගින් වුණේ! හැබැයි HTTP කියන්නේ හරියට goldfish කෙනෙක් වගේ — ඒකට මතකයක් නෑ. එන හැම request එකක්ම අලුත් එකක්.

### ✅ The Solution — JWT Tokens (Digital ID Cards / Wristbands)

**JWT** (JSON Web Token) කියන්නේ හරියට concert එකක දෙන wristband එකක් වගේ. ලොගින් වුණාට පස්සේ, server එක token එකක් හදලා ඔයාට දෙනවා. ඊටපස්සේ එන හැම request එකකදීම ඔයා මේ token එක පෙන්වන්න ඕනේ.

```mermaid
sequenceDiagram
    participant U as Nimal
    participant S as Server

    U->>S: POST /login (email + password)
    S->>S: Password එක හරිද බලනවා ✅
    S->>S: JWT token එක හදනවා
    S->>U: මෙන්න ඔයාගේ token එක: eyJhbG...

    U->>S: GET /students (header එකේ token එකත් එක්ක)
    S->>S: Token එක verify කරනවා ✅ — ආහ්, ඔයා Teacher Nimal නේ!
    S->>U: මෙන්න student list එක!
```

**JWT token එකක් පේන්නේ කොහොමද?**

```
eyJhbGciOiJIUzI1NiIs.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiJ9.abc123signature

මේකේ තිත් වලින් වෙන් කරපු කොටස් 3ක් තියෙනවා:
Part 1: Header    → algorithm විස්තර
Part 2: Payload   → ඔයාගේ data: { userId: 1, role: "admin" }
Part 3: Signature → මේ token එක හැදුවේ අපේ SERVER එකෙන්මයි කියන සාක්ෂිය
```

> 💡 **Analogy:** JWT කියන්නේ හරියට concert wristband එකක් වගේ. ඔයා ඇතුළට එනකොට (ලොගින් වෙනකොට), bouncer ඔයාගේ ටිකට් එක බලලා ඔයාට wristband එකක් දෙනවා. ඊටපස්සේ, ඔයාට ඕනෑම තැනකට යන්න ඒ wristband එක පෙන්නුවම ඇති. ඔයාට ආපහු ටිකට් එක පෙන්වන්න ඕනේ නෑ.

**අපිට hash එක ආපහු හරවන්න බැරිනම් ලොගින් verify කරන්නේ කොහොමද?**

අපි `bcrypt.compare()` පාවිච්චි කරනවා:

```mermaid
flowchart TD
    A["Nimal type කරනවා: teacher123"] --> B["bcrypt ඒක store කරපු salt එකත් එක්ක\nhash කරනවා"]
    B --> C{"අලුත් hash එකයි\nstore කරපු hash එකයි match වෙනවද?"}
    C -->|"ඔව් ✅"| D["Password එක හරි!\nLogin සාර්ථකයි"]
    C -->|"නෑ ❌"| E["වැරදි password එකක්!\nLogin වෙන්න බෑ"]
```

**Login වෙන flow එක:**

```mermaid
flowchart TD
    A["User email එකයි, password එකයි එවනවා"] --> B{"User\nඉන්නවද?"}
    B -->|"නෑ"| C["Error දෙනවා:\nInvalid credentials"]
    B -->|"ඔව්"| D{"Password එකයි hash එකයි\nmatch වෙනවද?"}
    D -->|"නෑ"| C
    D -->|"ඔව්"| E["JWT token එක හදනවා"]
    E --> F["Token එකයි user info එකයි return කරනවා"]
```

> 🛠️ **Debugging Tool — jwt.io:** JWT token එකක් ඇතුළේ මොනවද තියෙන්නේ කියලා බලන්න ඕනෙද? [https://jwt.io](https://jwt.io) එකට යන්න. ඔයාගේ token එක ඒකේ "Encoded" box එකට paste කරන්න, එතකොට ඒකෙන් ක්ෂණිකවම decode වෙච්ච Header සහ Payload එක පෙන්වයි! Login ප්‍රශ්න debug කරනකොට මේක ගොඩක් ප්‍රයෝජනවත්.

```mermaid
flowchart LR
    A["ඔයාගේ token එක copy කරන්න\neyJhbGciOiJ..."] -->|"jwt.io එකේ paste කරන්න"| B["Decoded data බලන්න:\nuserId: 1\nrole: admin\nexp: 1714358400"]
    B --> C["ඔයාගේ ප්‍රශ්න debug කරන්න!\nවැරදි userId එකක්ද? වැරදි role එකක්ද?\nToken එක expire වෙලාද?"]
```

`loginUser` function එක අපි Phase 3 වලදී `authService.js` එකේ ලිව්වා. ඒකේ වැදගත්ම lines:

| Line | ඇයි අපි මේක ලිව්වේ? |
|------|------------------------|
| `await bcrypt.compare(password, user.password)` | Type කරපු password එක අර salt එකෙන්ම hash කරලා match වෙනවද බලනවා. `true` හෝ `false` දෙනවා. |
| `const tokenPayload = { userId, role }` | Token එක ඇතුළේ store කරන data. අත්‍යවශ්‍ය දේවල් විතරක් දාන්න — ඕනෑම කෙනෙකුට JWT එකක් decode කරන්න පුළුවන්! |
| `jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: "24h" })` | Token එක හදනවා. Args 3යි: (1) data, (2) `.env` එකේ තියෙන secret key එක, (3) expire වෙන කාලය. |

### 🧪 Phase 4 Test: Login වෙලා Token එක Decode කිරීම!

**Postman එකෙන් Test කිරීම (server එක run වෙනකොට Phase 5 ට පස්සේ):**
```
Method: POST
URL:    http://localhost:5000/api/auth/login
Body → raw → JSON:
```
```json
{ "email": "amara@school.com", "password": "admin123" }
```

**මොනවද බලන්න ඕනේ:**
- `200 OK` එක්ක response එකේ `token` field එකක් තියෙන්න ඕනේ
- **⭐ මේ TOKEN එක COPY කරගන්න! ඉස්සරහට එන tests ඔක්කොටම මේක ඕනේ.**
- [https://jwt.io](https://jwt.io) එකට ගිහින්, token එක paste කරලා, payload එකේ `userId: 1, role: "admin"` කියලා තියෙනවද බලන්න

**වැරදි password එකකුත් එක්ක test කරලා බලන්න:**
```json
{ "email": "amara@school.com", "password": "wrongpassword" }
```
Expected: `401 Unauthorized` — "Email එක හෝ password එක වැරදියි."

---

## 🛡️ Phase 5: The Bouncer (Middleware)

> **Goal:** අපිට routes protect කරන්න පුළුවන් වෙන්න `verifyToken` සහ `authorizeRoles` middleware හදන එක. මේ phase එකෙන් පස්සේ අවසානයේ අපිට server එක run කරන්න පුළුවන්!

### ❌ The Problem — ඕනෑම කෙනෙකුට ඕනෑම දෙයක් බලන්න පුළුවන්!

දැනට තියෙන විදිහට, කවුරුහරි `GET /api/students` යැව්වොත්, එයාලට data හම්බවෙනවා — login වෙලා හිටියේ නැතත්.

```mermaid
flowchart LR
    A["😈 Hacker\n(login වෙලා නෑ)"] -->|"GET /api/students"| B["Server"]
    B -->|"මෙන්න ඔක්කොම data ටික!"| A
```

අපිට හැම request එකකටම ප්‍රශ්න දෙකකට උත්තර දෙන්න වෙනවා:

| ප්‍රශ්නය | නම | උදාහරණයක් |
|----------|------|---------|
| ඔයා කවුද? | **Authentication** | JWT token එක check කිරීම |
| ඔයාට මොනවද කරන්න පුළුවන්? | **Authorization** | Admin ට classrooms හදන්න පුළුවන්. Teacher ට බෑ. |

### ✅ The Solution — Middleware (Security Guards)

**Middleware** එකක් කියන්නේ controller එකට කලින් run වෙන function එකක්:

```mermaid
sequenceDiagram
    participant R as Request
    participant VT as verifyToken
    participant AR as authorizeRoles
    participant C as Controller

    R->>VT: Authorization header එක තියෙනවද?
    VT->>VT: "Bearer eyJ..." එකෙන් token එක ගන්නවා
    VT->>VT: jwt.verify() — valid ද? expire වෙලා නැද්ද?
    VT->>VT: Decode කරපු { userId, role } එක req.user එකට අමුණනවා
    VT->>AR: next() ✅
    AR->>AR: req.user.role එක allowedRoles වල තියෙනවද?
    AR->>C: next() ✅
    C->>C: ඇත්තම logic එක run කරනවා
```

#### 🎬 Scenario: Sanduni Classroom එකක් හදන්න හදනවා

Sanduni (teacher කෙනෙක්) එයාගේ JWT token එකත් එක්ක `POST /api/classrooms` යවනවා. `verifyToken` middleware එක එයාගේ token එක check කරනවා — ඒක valid ✅. හැබැයි ඊටපස්සේ `authorizeRoles("admin")` එකෙන් එයාගේ role එක check කරනවා — එයා "teacher" කෙනෙක් මිසක්, "admin" කෙනෙක් නෙවෙයි ❌. එයාට `403 Forbidden` හම්බවෙනවා. Classrooms හදන්න පුළුවන් Amara (admin) ට විතරයි.

**401 සහ 403 අතර වෙනස:**

| Code | තේරුම | Analogy |
|------|---------|---------|
| `401 Unauthorized` | ඔයා ලොගින් වෙලා නෑ | ඔයාට wristband එකක් ඇත්තෙම නෑ |
| `403 Forbidden` | ඔයා ලොගින් වෙලා ඉන්නේ හැබැයි අවසර නෑ | ඔයාට wristband එකක් තියෙනවා හැබැයි ඒක General, VIP නෙවෙයි |

#### 📁 File: `src/middlewares/authMiddleware.js`

#### 🚀 FULL CODE (READY TO COPY)

```javascript
import jwt from "jsonwebtoken";

// User ට valid JWT token එකක් තියෙනවද කියලා බලනවා
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

  // Step 2: Token එක ගන්නවා ("Bearer " කෑල්ල අයින් කරනවා)
  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Access denied. වැරදි token format එකක්.",
      data: null,
    });
  }

  // Step 3: Token එක Verify කරනවා
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // User info එක request එකට අමුණනවා
    next(); // Controller එකට යන්න දෙනවා
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Access denied. Token එක invalid හෝ expire වෙලා.",
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
        message: "Access denied. ඔයාට මේකට අවසර නෑ.",
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

| Line | ඇයි අපි මේක ලිව්වේ? |
|------|------------------------|
| `req.headers.authorization` | Client එයාලගේ JWT token එක දාන `Authorization` header එක කියවනවා. Format එක: `Bearer <token>`. |
| `authHeader.split(" ")[1]` | `"Bearer eyJhbG..."` එක space එකෙන් කඩනවා `["Bearer", "eyJhbG..."]` විදිහට. Index `[1]` (token එක) ගන්නවා. |
| `jwt.verify(token, process.env.JWT_SECRET)` | Check කරනවා: (1) Token එක valid ද? (2) ඒක අපේ secret එකෙන් sign කරලද තියෙන්නේ? (3) ඒක expire වෙලාද? |
| `req.user = decoded` | `{ userId: 1, role: "admin" }` කියන එක request එකට අමුණනවා, එතකොට controllers ලට ඒක කියවන්න පුළුවන්. |
| `next()` | Express එකට කියනවා: "මම ඉවරයි. Chain එකේ තියෙන ඊළඟ function එකට යන්න." |
| `authorizeRoles(...allowedRoles)` | `...` වලින් ඔක්කොම arguments ටික array එකකට එකතු කරනවා. `authorizeRoles("admin", "teacher")` → `["admin", "teacher"]`. |
| `allowedRoles.includes(userRole)` | User ගේ role එක allowed list එකේ තියෙනවද බලනවා. |

**`verifyToken` වැඩ කරන්නේ කොහොමද පියවරෙන් පියවර:**

```
1. Client යවනවා:  Authorization: Bearer eyJhbGciOiJIUzI1NiIs...

2. අපි space එකෙන් කඩනවා: ["Bearer", "eyJhbGciOiJIUzI1NiIs..."]

3. අපි index [1] ගන්නවා:  "eyJhbGciOiJIUzI1NiIs..."

4. jwt.verify() එකෙන් token එක ඇත්ත එකක්ද වගේම expire වෙලා නැද්ද කියලා බලනවා

5. Valid නම්: decoded = { userId: 1, role: "admin" }
   අපි මේක req.user එකට දානවා එතකොට controllers ලට මේක පාවිච්චි කරන්න පුළුවන්

6. next() → Controller එකට යන්න දෙනවා
```

> 💡 **`next()` කියන්නේ මොකක්ද?** Express වලදී, middleware functions වලට arguments තුනක් හම්බවෙනවා: `req`, `res`, සහ `next`. `next()` call කරාම Express එකට කියනවා: "මම ඉවරයි. Chain එකේ තියෙන ඊළඟ function එකට යන්න." ඔයා `next()` call කරේ නැත්නම්, request එක එතනම හිර වෙනවා — controller එක කවදාවත් run වෙන්නේ නෑ.

> ⚠️ **මොනවද වැරදෙන්න පුළුවන්? — Token Expiry**
>
> අපිට මතකද අපි token එක හදනකොට `expiresIn: "24h"` දුන්නා? පැය 24කට පස්සේ, token එක **expire වෙනවා**:
>
> 1. User ඊයේ ලොගින් වෙලා token එකක් ගත්තා.
> 2. අද, එයාලා ඒ token එකම දාලා request එකක් යවනවා.
> 3. `jwt.verify()` එක දකිනවා token එක expire වෙලා කියලා ඒ නිසා **error එකක් දෙනවා**.
> 4. `catch` block එක run වෙනවා → `401: Token is invalid or expired` කියලා යවනවා.
> 5. අලුත් token එකක් ගන්න user ට ආපහු ලොගින් වෙන්න වෙනවා.

> 🛠️ **Debugging Tips — Common Errors:**
>
> **JWT Errors:**
>
> | Error | තේරුම | විසඳුම |
> |-------|--------------|------------|
> | `jwt malformed` | Token string එක කැඩිලා හරි භාගෙට හරි තියෙන්නේ | Login response එකෙන් FULL token එක copy කරන්න |
> | `invalid signature` | Token එක හදලා තියෙන්නේ වෙන secret එකකින් | `.env` එකේ `JWT_SECRET` එක බලන්න |
> | `jwt expired` | Token එකට පැය 24කට වඩා වයසයි | අලුත් token එකක් ගන්න ආපහු ලොගින් වෙන්න |
> | `secretOrPrivateKey must have a value` | `.env` එකේ `JWT_SECRET` එක නෑ | ඔයාගේ `.env` file එකට `JWT_SECRET` එක දාන්න |
>
> **Prisma Errors:**
>
> | Error | තේරුම | විසඳුම |
> |-------|--------------|------------|
> | `Unique constraint failed on the fields: (email)` | Email එක දැනටමත් තියෙනවා | වෙන email එකක් පාවිච්චි කරන්න |
> | `Foreign key constraint failed` | අදාළ ID එක හොයාගන්න නෑ | ඉස්සෙල්ලා අදාළ record එක හදන්න |
> | `P1001: Can't reach database server` | MySQL run වෙන්නේ නෑ | XAMPP එකෙන් MySQL start කරන්න |

### දැන් ඔක්කොම server.js එකට Connect කරන්න

Auth routes import කරන්න `src/server.js` එක update කරන්න. දැන් අපිට middleware file එක තියෙන නිසා, imports ටික වැඩ කරාවි:

`import cors from "cors";` එකට පස්සේ මේ line එක දාන්න:
```javascript
import authRoutes from "./routes/authRoutes.js";
```

Test route එකට කලින් මේ line එක දාන්න:
```javascript
app.use("/api/auth", authRoutes);
```

### 🧪 Phase 5 Test: Bouncer වැඩ කරන විදිහ බලමු!

Server එක start කරන්න:
```bash
npm run dev
```

**Test 1: User කෙනෙක්ව Register කරන්න**
```
Method: POST
URL:    http://localhost:5000/api/auth/register
Body:   { "name": "Kavitha Perera", "email": "kavitha@school.com", "password": "mypassword123", "role": "teacher" }
```
Expected: `201 Created` ✅

**Test 2: Admin කෙනෙක් විදිහට Login වෙන්න**
```
Method: POST
URL:    http://localhost:5000/api/auth/login
Body:   { "email": "amara@school.com", "password": "admin123" }
```
Expected: `200 OK` එක්ක `token` එකක්. **⭐ මේ TOKEN එක COPY කරගන්න!**

**Test 3: Token එකක් නැතුව /me වලට යන්න**
```
Method: GET
URL:    http://localhost:5000/api/auth/me
Headers: (මුකුත් නෑ)
```
Expected: `401` — "Access denied. Token එකක් දීලා නෑ." ✅ Bouncer ඔයාව block කරා!

**Test 4: Token එකත් එක්ක /me වලට යන්න**
```
Method: GET
URL:    http://localhost:5000/api/auth/me
Headers: Authorization: Bearer <ඔයාගේ-token-එක-මෙතන-paste-කරන්න>
```
Expected: `200 OK` එක්ක `{ userId: 1, role: "admin" }` ✅

**Test 5: Teacher කෙනෙක් විදිහට /users වලට යන්න**
`nimal@school.com` / `teacher123` විදිහට ලොගින් වෙලා, token එක copy කරගෙන, ඊටපස්සේ:
```
Method: GET
URL:    http://localhost:5000/api/auth/users
Headers: Authorization: Bearer <nimal-token>
```
Expected: `403 Forbidden` — "Access denied. ඔයාට මේකට අවසර නෑ." ✅

> 💡 **Tip:** Postman එකේ, **Authorization** tab එක click කරලා → **Bearer Token** තෝරලා → token එක විතරක් paste කරන්න. Postman එකෙන් ඉබේම "Bearer " එකතු කරනවා.

**Postman එකේ token එක දාන විදිහ:**
```
✅ නිවැරදියි: Bearer eyJhbGciOiJIUzI1NiIs...
❌ වැරදියි:  BearereyJhbGciOiJIUzI1NiIs...    (space එකක් නෑ!)
❌ වැරදියි:  eyJhbGciOiJIUzI1NiIs...          ("Bearer" කෑල්ල නෑ)
```

---

## 🏫 Phase 6: Classroom & Student Slices

> **Goal:** Classroom සහ Student systems දෙක හදන එක. එකම 4-layer pattern එක: Repository → Service → Controller → Routes. ඊටපස්සේ Admin vs Teacher permissions test කරන එක.

```mermaid
flowchart TD
    A["Phase 6"] --> B["Classroom System\nendpoints 4යි"]
    A --> C["Student System\nendpoints 4යි"]
    B --> D["POST /classrooms (Admin විතරයි)"]
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

async function updateClassroom(id, name, section, teacherId) {
  const classroom = await prisma.classroom.update({
    where: { id: id },
    data: {
      ...(name && { name: name }),
      ...(section !== undefined && { section: section }),
      ...(teacherId && { teacherId: teacherId }),
    },
    include: {
      teacher: { select: { id: true, name: true, email: true } },
    },
  });
  return classroom;
}

export { createClassroom, findAllClassrooms, findClassroomById, findClassroomsByTeacherId, updateClassroom };
```

| Line | ඇයි අපි මේක ලිව්වේ? |
|------|------------------------|
| `include: { teacher: { select: { ... } } }` | SQL JOIN එකක් වගේ — teacher ගේ විස්තරත් ගන්නවා, හැබැයි id, name, email විතරයි (password එක නෙවෙයි!). |
| `include: { students: true }` | `findClassroomById` එකේදී, ඒ classroom එකේ ඉන්න ඔක්කොම students ලවත් ගන්නවා. |
| `findClassroomsByTeacherId` | අදාළ teacher ට අදාළව classrooms filter කරනවා. |
| `...(name && { name: name })` | JS Spread trick එක. මේකෙන් `name` එක update කරන්නේ ඇත්තටම `name` එකක් දීලා තිබ්බොත් විතරයි. |

> 💡 **`include` = SQL JOIN.** මේක නැත්නම්, ඔයාට එන්නේ `teacherId: 3` (නිකන්ම අංකයක් විතරයි) කියලා. මේකත් එක්ක, ඔයාට සම්පූර්ණ teacher object එකම ඒක ඇතුළේ එනවා.

---

#### 📁 File: `src/services/classroomService.js`

#### 🚀 FULL CODE (READY TO COPY)

```javascript
import * as classroomRepository from "../repositories/classroomRepository.js";

async function createClassroom(name, section, teacherId) {
  if (!name || !teacherId) {
    return { success: false, message: "Classroom name සහ teacher ID අනිවාර්යයි.", data: null };
  }
  const classroom = await classroomRepository.createClassroom(name, section, teacherId);


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

async function updateClassroom(id, name, section, teacherId) {
  if (!id) return { success: false, message: "Classroom ID එක අනිවාර්යයි.", data: null };
  
  const existing = await classroomRepository.findClassroomById(id);
  if (!existing) return { success: false, message: "Classroom එක හොයාගන්න නෑ.", data: null };

  const classroom = await classroomRepository.updateClassroom(id, name, section, teacherId);
  return { success: true, message: "Classroom එක සාර්ථකව update කරා.", data: classroom };
}

export { createClassroom, getAllClassrooms, getClassroomById, getClassroomsByTeacherId, updateClassroom };
```

| Line | ඇයි අපි මේක ලිව්වේ? |
|------|------------------------|
| `import * as classroomRepository` | ඔක්කොම exports එක object එකක් විදිහට ගන්නවා. මේක පාවිච්චි කරන්නේ `classroomRepository.createClassroom(...)` වගේ. |
| `if (!existing)` | Prisma errors වළක්වා ගන්න update කරන්න කලින් classroom එක තියෙනවද කියලා බලනවා. |
| `if (!classroom)` | "Early Return" pattern එක — හොයාගන්න බැරි වුණොත්, ක්ෂණිකවම error එක return කරලා නවත්තනවා. |

> 💡 **`import * as` සහ `import { }` අතර වෙනස:** `import * as classroomRepository` එකෙන් ඔක්කොම ටික අරගෙන එක පෙට්ටියකට දානවා. ඒකෙන් functions එන්නේ කොහෙන්ද කියලා පැහැදිලි වෙනවා: `classroomRepository.createClassroom(...)`.

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
    return res.status(500).json({ success: false, message: "මොකක්දෝ වැරදීමක් වුණා. කරුණාකර නැවත උත්සාහ කරන්න.", data: null });
  }
}

async function getAllClassrooms(req, res) {
  try {
    let result;
    // Role-based filtering: Admin ට ඔක්කොම පේනවා, Teacher ට එයාගේ ඒවා විතරයි පේන්නේ
    if (req.user.role === "admin") {
      result = await classroomService.getAllClassrooms();
    } else {
      result = await classroomService.getClassroomsByTeacherId(req.user.userId);
    }
    
    return res.status(200).json(result);
  } catch (error) {
    console.error("Get classrooms error:", error);
    return res.status(500).json({ success: false, message: "මොකක්දෝ වැරදීමක් වුණා. කරුණාකර නැවත උත්සාහ කරන්න.", data: null });
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
    return res.status(500).json({ success: false, message: "මොකක්දෝ වැරදීමක් වුණා. කරුණාකර නැවත උත්සාහ කරන්න.", data: null });
  }
}

async function getClassroomsByTeacher(req, res) {
  try {
    const teacherId = parseInt(req.params.teacherId);
    const result = await classroomService.getClassroomsByTeacherId(teacherId);
    return res.status(200).json(result);
  } catch (error) {
    console.error("Get teacher classrooms error:", error);
    return res.status(500).json({ success: false, message: "මොකක්දෝ වැරදීමක් වුණා. කරුණාකර නැවත උත්සාහ කරන්න.", data: null });
  }
}

async function updateClassroom(req, res) {
  try {
    const id = parseInt(req.params.id);
    const { name, section, teacherId } = req.body;
    const result = await classroomService.updateClassroom(id, name, section, teacherId);
    if (!result.success) { return res.status(404).json(result); }
    return res.status(200).json(result);
  } catch (error) {
    console.error("Update classroom error:", error);
    return res.status(500).json({ success: false, message: "මොකක්දෝ වැරදීමක් වුණා. කරුණාකර නැවත උත්සාහ කරන්න.", data: null });
  }
}

export { createClassroom, getAllClassrooms, getClassroomById, getClassroomsByTeacher, updateClassroom };
```

| Line | ඇයි අපි මේක ලිව්වේ? |
|------|------------------------|
| `if (req.user.role === "admin")` | **Role-Based Filtering!** Teacher කෙනෙක් `/api/classrooms` ගත්තොත්, අපි return කරන්නේ එයාලගේ classrooms විතරයි. Admin ට ඔක්කොම හම්බවෙනවා. |
| `parseInt(req.params.id)` | URL params කියන්නේ strings. `/5` → `"5"`. `parseInt` එකෙන් Prisma එකට හරියන්න ඒක `5` කියන අංකය කරනවා. |
| `res.status(404).json(result)` | 404 = Not Found. Classroom ID එක හොයාගන්න නෑ. |

> 💡 **`req.params`** — `/api/classrooms/5` වලදී, Express එකෙන් `5` කියන එක `req.params.id` එකට දානවා. Route එක define කරලා තියෙන්නේ `/:id` විදිහටයි — colon එකෙන් dynamic variable එකක් හදනවා.

---

#### 📁 File: `src/routes/classroomRoutes.js`

#### 🚀 FULL CODE (READY TO COPY)

```javascript
import express from "express";
const router = express.Router();
import { createClassroom, getAllClassrooms, getClassroomById, getClassroomsByTeacher, updateClassroom } from "../controllers/classroomController.js";
import { verifyToken, authorizeRoles } from "../middlewares/authMiddleware.js";

router.post("/", verifyToken, authorizeRoles("admin"), createClassroom);
router.get("/", verifyToken, getAllClassrooms);
router.get("/:id", verifyToken, getClassroomById);
router.get("/teacher/:teacherId", verifyToken, getClassroomsByTeacher);
router.put("/:id", verifyToken, authorizeRoles("admin"), updateClassroom);

export default router;
```

| Line | ඇයි අපි මේක ලිව්වේ? |
|------|------------------------|
| `router.post("/", verifyToken, authorizeRoles("admin"), createClassroom)` | Chain එක: token එක බලනවා → admin role එක බලනවා → create කරනවා. Teachers ලට classrooms හදන්න බෑ. |
| `router.get("/", verifyToken, getAllClassrooms)` | Login වෙච්ච ඕනෑම කෙනෙකුට classrooms බලන්න පුළුවන්. |
| `router.put("/:id", ...)` | Classroom එකක් update කරනවා (උදා: teacher කෙනෙක්ව මාරු කරනවා). මේක කරන්න පුළුවන් admins ලට විතරයි! |
| `router.get("/:id", ...)` | `:id` කියන්නේ dynamic URL parameter එකක්. |

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

async function findStudentsByTeacherId(teacherId) {
  const students = await prisma.student.findMany({
    where: { classroom: { teacherId: teacherId } },
    include: { classroom: { select: { id: true, name: true, section: true } } },
  });
  return students;
}

export { createStudent, findAllStudents, findStudentById, findStudentsByClassroomId, findStudentsByTeacherId };
```

| Line | ඇයි අපි මේක ලිව්වේ? |
|------|------------------------|
| `where: { classroom: { teacherId: ... } }` | Prisma Relational Filtering! මේකෙන් අදාළ teacher ID එක තියෙන classroom එකකට අදාළ ඔක්කොම students ලව හොයනවා. |

---

#### 📁 File: `src/services/studentService.js`

#### 🚀 FULL CODE (READY TO COPY)

```javascript
import * as studentRepository from "../repositories/studentRepository.js";

async function createStudent(name, email, registrationNumber, classroomId) {
  if (!name || !email || !registrationNumber || !classroomId) {
    return { success: false, message: "ඔක්කොම fields අනිවාර්යයි: name, email, registrationNumber, classroomId.", data: null };
  }
  const student = await studentRepository.createStudent(name, email, registrationNumber, classroomId);
  return { success: true, message: "Student ව සාර්ථකව හැදුවා.", data: student };
}

async function getAllStudents() {
  const students = await studentRepository.findAllStudents();
  return { success: true, message: "Students ලව සාර්ථකව ගත්තා.", data: students };
}

async function getStudentById(id) {
  const student = await studentRepository.findStudentById(id);
  if (!student) { return { success: false, message: "Student ව හොයාගන්න නෑ.", data: null }; }
  return { success: true, message: "Student ව සාර්ථකව ගත්තා.", data: student };
}

async function getStudentsByClassroomId(classroomId) {
  const students = await studentRepository.findStudentsByClassroomId(classroomId);
  return { success: true, message: "Students ලව සාර්ථකව ගත්තා.", data: students };
}

async function getStudentsByTeacherId(teacherId) {
  const students = await studentRepository.findStudentsByTeacherId(teacherId);
  return { success: true, message: "Students ලව සාර්ථකව ගත්තා.", data: students };
}

export { createStudent, getAllStudents, getStudentById, getStudentsByClassroomId, getStudentsByTeacherId };
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
    return res.status(500).json({ success: false, message: "මොකක්දෝ වැරදීමක් වුණා.", data: null });
  }
}

async function getAllStudents(req, res) {
  try {
    let result;
    // Role-based filtering: Admin ට ඔක්කොම පේනවා, Teacher ට එයාලගේ අයව විතරයි පේන්නේ
    if (req.user.role === "admin") {
      result = await studentService.getAllStudents();
    } else {
      result = await studentService.getStudentsByTeacherId(req.user.userId);
    }
    
    return res.status(200).json(result);
  } catch (error) {
    console.error("Get students error:", error);
    return res.status(500).json({ success: false, message: "මොකක්දෝ වැරදීමක් වුණා.", data: null });
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
    return res.status(500).json({ success: false, message: "මොකක්දෝ වැරදීමක් වුණා.", data: null });
  }
}

async function getStudentsByClassroom(req, res) {
  try {
    const classroomId = parseInt(req.params.classroomId);
    const result = await studentService.getStudentsByClassroomId(classroomId);
    return res.status(200).json(result);
  } catch (error) {
    console.error("Get classroom students error:", error);
    return res.status(500).json({ success: false, message: "මොකක්දෝ වැරදීමක් වුණා.", data: null });
  }
}

export { createStudent, getAllStudents, getStudentById, getStudentsByClassroom };
```

| Line | ඇයි අපි මේක ලිව්වේ? |
|------|------------------------|
| `if (req.user.role === "admin")` | **Role-Based Filtering!** Teacher කෙනෙක් `/api/students` ගත්තොත්, අපි return කරන්නේ එයාලගේ students ලව විතරයි. Admin ට හැමෝම හම්බවෙනවා. |
| `const { name, email, registrationNumber, classroomId } = req.body` | Destructuring — fields ගොඩක් එක පාර ගන්න පාවිච්චි කරන shortcut එකක්. මේක හරියට `const x = req.body.x` කියලා වෙනම පේළි 4ක් ලියනවා වගේමයි. |

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

| Line | ඇයි අපි මේක ලිව්වේ? |
|------|------------------------|
| `authorizeRoles("admin", "teacher")` | Admins ලට වගේම teachers ලටත් students ලව add කරන්න පුළුවන්. |

### server.js එකට Connect කිරීම

`src/server.js` එකට මේ imports සහ routes එකතු කරන්න:

```javascript
import classroomRoutes from "./routes/classroomRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";

app.use("/api/classrooms", classroomRoutes);
app.use("/api/students", studentRoutes);
```

### 🧪 Phase 6 Test: Admin vs Teacher Permissions!

**Test 1: ඔක්කොම Classrooms ගන්න**
```
GET http://localhost:5000/api/classrooms  +  ඕනෑම token එකක්
```
Expected: `200 OK` එක්ක classrooms list එකක් ✅

**Test 2: Admin විදිහට Classroom එකක් හදන්න**
```
POST http://localhost:5000/api/classrooms  +  Admin token
Body: { "name": "Batch 2026 - Data Science", "section": "Afternoon", "teacherId": 2 }
```
Expected: `201 Created` ✅

**Test 3: Classroom එකේ Teacher ව මාරු කරන්න (Admin ට විතරයි)**
```
PUT http://localhost:5000/api/classrooms/1  +  Admin token
Body: { "teacherId": 3 }
```
Expected: `200 OK` — දැන් Classroom 1 අයිති Teacher 3 ට ✅

**Test 4: Teacher කෙනෙක් විදිහට Classroom එකක් හදන්න**
```
POST http://localhost:5000/api/classrooms  +  Teacher token (Nimal)
Body: { "name": "Test Class", "section": "Test", "teacherId": 2 }
```
Expected: `403 Forbidden` ❌ — Teachers ලට classrooms හදන්න බෑ!

**Test 4: ඔක්කොම Students ලව ගන්න**
```
GET http://localhost:5000/api/students  +  ඕනෑම token එකක්
```
Expected: `200 OK` ✅

**Test 5: Student කෙනෙක්ව හදන්න**
```
POST http://localhost:5000/api/students  +  Token (admin හෝ teacher)
Body: { "name": "Dilshan Wickramasinghe", "email": "dilshan@student.com", "registrationNumber": "STU-2026-005", "classroomId": 1 }
```
Expected: `201 Created` ✅

**Test 6: Classroom එකෙන් Students ලව ගන්න**
```
GET http://localhost:5000/api/students/classroom/1  +  Token
```
Expected: `200 OK` එක්ක Classroom 1 එකේ ඉන්න students ලව ✅

---

## 📝 Phase 7: The Attendance Slice (අවසාන Logic එක)

> **Goal:** ගොඩක්ම වැදගත් feature එක හදන එක — මුළු පන්තියේම attendance එක එකපාර mark කරන එක. ඊටපස්සේ routes ඔක්කොමත් එක්ක `server.js` එක අවසන් කරන එක.

```mermaid
flowchart TD
    A["Phase 7"] --> B["Single Attendance\nPOST /attendance"]
    A --> C["Bulk Attendance\nPOST /attendance/bulk"]
    A --> D["Classroom එකෙන් බලන්න\nGET /attendance/classroom/:id?date="]
    A --> E["Student ගෙන් බලන්න\nGET /attendance/student/:id"]
    A --> F["අවසන් server.js\n(routes ඔක්කොම connect කරලා)"]
```

### `req.params`, `req.query` සහ `req.body` තේරුම් ගැනීම

Beginners ලට ගොඩක්ම පැටලෙන තැන මේකයි! කවදද මොකක්ද පාවිච්චි කරන්නේ?

| Express code | Data තියෙන්නේ කොහෙද? | Analogy | පාවිච්චි කරන්නේ කවදද |
|--------------|-------------------|---------|----------------|
| `req.body` | හැංගිලා තියෙන POST request data වල | ලියුම් කවරෙ ඇතුළේ තියෙන දේවල් | ලොකු data යවනකොට (user කෙනෙක් හදනකොට, passwords, bulk arrays) |
| `req.params` | URL path එකේම කොටසක් විදිහට (`/users/5`) | දොරේ ගහලා තියෙන කාමර අංකය | නිශ්චිත resource එකක් තෝරගන්නකොට (User #5 ව ගන්න) |
| `req.query` | URL එකේ `?` එකට පස්සේ (`?date=today`) | Shopping site එකක තියෙන filter options වගේ | Search කරන්න, filter කරන්න, නැත්නම් sort කරන්න |

#### 🎬 Scenario: Nimal Attendance Mark කරනවා

Nimal ට (teacher) ඕනේ එයාගේ "Web Development" class එකේ (ID 1) April 28 වෙනිදා attendance එක බලන්න. URL එක වෙන්නේ:
`GET /api/attendance/classroom/1?date=2026-04-28`
- `req.params.classroomId` = `1` (කොයි classroom එකද)
- `req.query.date` = `"2026-04-28"` (filter කරන්න ඕනේ කොයි දවසටද)

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

| Line | ඇයි අපි මේක ලිව්වේ? |
|------|------------------------|
| `new Date(date)` | `"2026-04-28"` කියන string එක Prisma එකට හරියන JavaScript Date object එකක් කරනවා. |
| `orderBy: { date: "desc" }` | අලුත්ම ඒවා මුලින් එන්න sort කරනවා. `"desc"` = descending (අවරෝහණ), `"asc"` = ascending (ආරෝහණ). |
| `findExistingAttendance` | Student ට ඒ දවසට දැනටමත් record එකක් තියෙනවද බලනවා (දෙපාරක් වැටෙන එක වළක්වනවා). |

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
    return { success: false, message: "Status එක 'present', 'absent', හෝ 'late' වෙන්නම ඕනේ.", data: null };
  }

  // Duplicates තියෙනවද බලනවා — student කෙනෙකුට දවසකට තියෙන්න පුළුවන් ONE record එකක් විතරයි
  const existing = await attendanceRepository.findExistingAttendance(studentId, date);
  if (existing) {
    return { success: false, message: "මේ දවසට අදාළව මේ student ගේ attendance එක දැනටමත් mark කරලා තියෙන්නේ.", data: null };
  }

  const record = await attendanceRepository.createAttendance(studentId, classroomId, date, status, markedBy);
  return { success: true, message: "Attendance සාර්ථකව mark කරා.", data: record };
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

  return { success: true, message: results.length + " ක් save කරා, " + errors.length + " ක් errors ආවා.", data: { saved: results, errors: errors } };
}

async function getAttendanceByClassroomAndDate(classroomId, date) {
  if (!classroomId || !date) {
    return { success: false, message: "Classroom ID එක සහ date එක අනිවාර්යයි.", data: null };
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

| Line | ඇයි අපි මේක ලිව්වේ? |
|------|------------------------|
| `allowedStatuses.includes(status)` | "present", "absent", හෝ "late" විතරක් භාරගන්නවා. "sick", "holiday", වගේ දේවල් ප්‍රතික්ෂේප කරනවා. |
| `findExistingAttendance` | එකම දවසේ එකම student ව දෙපාරක් mark කරන එක වළක්වනවා. |
| `for` loop with `await` | එකිනෙකා බැගින් හැම student කෙනෙක්වම process කරනවා, එක්කෙනෙක් save වෙනකන් ඉඳලා ඊළඟ කෙනාට යනවා. |
| `results` සහ `errors` arrays | 5 වෙනි student fail වුණොත්, අපි crash වෙන්නේ නෑ — අපි 6-30 students ලව දිගටම කරගෙන යනවා. |

**Bulk attendance flow එක:**

```mermaid
flowchart TD
    A["Teacher students ලගේ attendance\nrecords ලැයිස්තුවක් එවනවා"] --> B["එකිනෙකා බැගින් හැම student කෙනෙක්වම බලනවා (Loop)"]
    B --> C{"මේ දවසට දැනටමත්\nmark කරලද?"}
    C -->|"ඔව්"| D["Errors list එකට දානවා"]
    C -->|"නෑ"| E["Database එකට save කරනවා"]
    E --> F["Results list එකට දානවා"]
    D --> G{"තව students ලා ඉන්නවද?"}
    F --> G
    G -->|"ඔව්"| B
    G -->|"නෑ"| H["Results ටික return කරනවා:\nX ගාණක් save කරා, Y ගාණක් errors"]
```

---

#### 📁 File: `src/controllers/attendanceController.js`

#### 🚀 FULL CODE (READY TO COPY)

```javascript
import * as attendanceService from "../services/attendanceService.js";

async function markAttendance(req, res) {
  try {
    const { studentId, classroomId, date, status } = req.body;
    const markedBy = req.user.userId; // Auth middleware එකෙන් එනවා!
    const result = await attendanceService.markAttendance(studentId, classroomId, date, status, markedBy);
    if (!result.success) { return res.status(400).json(result); }
    return res.status(201).json(result);
  } catch (error) {
    console.error("Mark attendance error:", error);
    return res.status(500).json({ success: false, message: "මොකක්දෝ වැරදීමක් වුණා.", data: null });
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
    return res.status(500).json({ success: false, message: "මොකක්දෝ වැරදීමක් වුණා.", data: null });
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
    return res.status(500).json({ success: false, message: "මොකක්දෝ වැරදීමක් වුණා.", data: null });
  }
}

async function getAttendanceByStudent(req, res) {
  try {
    const studentId = parseInt(req.params.studentId);
    const result = await attendanceService.getAttendanceByStudentId(studentId);
    return res.status(200).json(result);
  } catch (error) {
    console.error("Get student attendance error:", error);
    return res.status(500).json({ success: false, message: "මොකක්දෝ වැරදීමක් වුණා.", data: null });
  }
}

export { markAttendance, markBulkAttendance, getAttendanceByClassroom, getAttendanceByStudent };
```

| Line | ඇයි අපි මේක ලිව්වේ? |
|------|------------------------|
| `req.user.userId` | `verifyToken` middleware එකෙන් decode කරපු JWT data `req.user` එකට දානවා. මේක තමයි ලොගින් වෙලා ඉන්න teacher ගේ ID එක — අපි ඒක ඉබේම `markedBy` එකට පාවිච්චි කරනවා. |
| `req.query.date` | `/api/attendance/classroom/1?date=2026-04-28` එකේදී, `req.query.date` එක `"2026-04-28"` වෙනවා. |
| `req.body.attendanceList` | Bulk endpoint එක බලාපොරොත්තු වෙන්නේ body එකේ `{ "attendanceList": [ ... ] }` එකක් එයි කියලයි. |

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

### 🚀 Final server.js — සම්පූර්ණ කෝඩ් එක

දැන් ඔක්කොම route files තියෙන නිසා, `src/server.js` එක අවසන් මට්ටමට update කරන්න:

#### 📁 File: `src/server.js` (Final Version)

#### 🚀 FULL CODE (READY TO COPY)

```javascript
// Step 1: Load environment variables (මේක අනිවාර්යයෙන්ම මුලින්ම තියෙන්න ඕනේ!)
import "dotenv/config";

// Step 2: අනිවාර්ය environment variables තියෙනවද බලන්න (Fail-Fast!)
const requiredEnvVars = ["DATABASE_URL", "JWT_SECRET"];
const missingVars = requiredEnvVars.filter(function (varName) {
  return !process.env[varName];
});

if (missingVars.length > 0) {
  console.error("❌ අනිවාර්ය environment variables අඩුයි:");
  console.error("   " + missingVars.join(", "));
  console.error("");
  console.error("   කරුණාකර ඔයාගේ .env file එක check කරන්න!");
  process.exit(1); // Server එක ක්ෂණිකවම නවත්වනවා
}

// Step 3: Import packages
import express from "express";
import cors from "cors";

// Step 4: අපේ route files ටික import කිරීම
import authRoutes from "./routes/authRoutes.js";
import classroomRoutes from "./routes/classroomRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";

// Step 5: Express app එක හදන්න
const app = express();

// Step 6: Add middleware
app.use(cors());          // React frontend එකට connect වෙන්න දෙනවා
app.use(express.json());  // JSON request bodies තේරුම් ගන්නවා

// Step 7: Routes ටික Connect කරන්න
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

// Step 9: Server එක Start කරන්න
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

| Line | ඇයි අපි මේක ලිව්වේ? |
|------|------------------------|
| `import "dotenv/config"` | `.env` file එක `process.env` එකට ලෝඩ් කරනවා. මේක මුලින්ම තියෙන්න ඕනේ! |
| Fail-Fast validation | `JWT_SECRET` හෝ `DATABASE_URL` නැත්නම්, පස්සේ crash වෙනවාට වඩා පැහැදිලි error එකක් දීලා server එක ක්ෂණිකවම නවත්වනවා. |
| `app.use("/api/auth", authRoutes)` | `authRoutes` ඇතුළේ තියෙන ඔක්කොම routes පටන් ගන්නේ `/api/auth` වලින්. |
| `app.use("/api/attendance", attendanceRoutes)` | ඔක්කොම attendance routes පටන් ගන්නේ `/api/attendance` වලින්. |

**Frontend එක මේ Backend එකත් එක්ක කතා කරන්නේ කොහොමද:**

```mermaid
sequenceDiagram
    participant U as User
    participant R as React App
    participant A as අපේ API එක
    participant D as Database

    U->>R: "Login" button එක click කරනවා
    R->>A: POST /api/auth/login { email, password }
    A->>D: Email එකෙන් user ව හොයනවා
    D->>A: User ව හම්බවෙනවා
    A->>R: { success: true, data: { token: "..." } }
    R->>R: Token එක localStorage එකේ save කරනවා

    U->>R: "Students" page එක open කරනවා
    R->>A: GET /api/students (header එකේ token එකත් එක්ක)
    A->>A: Token එක verify කරනවා ✅
    A->>D: SELECT * FROM students
    D->>A: [student1, student2, ...]
    A->>R: { success: true, data: [...] }
    R->>U: Screen එකේ student list එක පෙන්වනවා
```

### 🧪 Phase 7 Test: සම්පූර්ණ Attendance System එක!

**Test 1: එක්කෙනෙකුගේ Attendance Mark කරන්න**
```
POST http://localhost:5000/api/attendance  +  Token
Body: { "studentId": 1, "classroomId": 1, "date": "2026-05-01", "status": "present" }
```
Expected: `201 Created` ✅

**Test 2: ඒ Student ගෙම ආපහු Mark කරන්න Try කරන්න**
```
POST http://localhost:5000/api/attendance  +  Token
Body: { "studentId": 1, "classroomId": 1, "date": "2026-05-01", "status": "absent" }
```
Expected: `400` — "මේ දවසට අදාළව මේ student ගේ attendance එක දැනටමත් mark කරලා තියෙන්නේ." ✅

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
Expected: `201 Created` එක්ක `"2 ක් save කරා, 0 ක් errors ආවා."` ✅

**Test 4: Classroom එකේ Attendance දවස අනුව ගන්න**
```
GET http://localhost:5000/api/attendance/classroom/1?date=2026-04-28  +  Token
```
Expected: `200 OK` එක්ක ඒ දවසට අදාළ attendance records ටික ✅

**Test 5: Student ගේ Attendance History එක ගන්න**
```
GET http://localhost:5000/api/attendance/student/1  +  Token
```
Expected: `200 OK` එක්ක Tharindu ගේ ඔක්කොම attendance records ටික ✅

**Test 6: Invalid Status එකක් දාලා බලන්න**
```
POST http://localhost:5000/api/attendance  +  Token
Body: { "studentId": 3, "classroomId": 2, "date": "2026-05-01", "status": "sick" }
```
Expected: `400` — "Status එක 'present', 'absent', හෝ 'late' වෙන්නම ඕනේ." ✅

### Error Cases සාරාංශය

| Test | බලාපොරොත්තු වෙන දේ |
|------|----------|
| `POST /api/auth/login` වැරදි password එකක් එක්ක | `401` — "Email එක හෝ password එක වැරදියි." |
| `GET /api/students` token එකක් නැතුව | `401` — "Access denied. Token එකක් දීලා නෑ." |
| `POST /api/classrooms` teacher token එකක් එක්ක | `403` — "Access denied. ඔයාට මේකට අවසර නෑ." |
| `POST /api/auth/register` දැනටමත් තියෙන email එකක් එක්ක | `400` — "මේ email එකෙන් දැනටමත් user කෙනෙක් ඉන්නවා." |
| `POST /api/attendance` එක්ක `"status": "sick"` | `400` — "Status එක 'present', 'absent', හෝ 'late' වෙන්නම ඕනේ." |

### Testing Flow සාරාංශය

```mermaid
flowchart TD
    A["1. Server එක Start කරන්න\nnpm run dev"] --> B["2. Health එක Test කරන්න\nGET /"]
    B --> C["3. Login වෙන්න\nPOST /api/auth/login"]
    C --> D["4. TOKEN එක Copy කරගන්න"]
    D --> E["5. Headers වලට token එක දාන්න"]
    E --> F["6. GET endpoints ටික Test කරන්න"]
    F --> G["7. POST endpoints ටික Test කරන්න"]
    G --> H["8. Error cases ටික Test කරන්න"]
```

---

### 🧪 Test Credentials (Day 1 Seed Data එකෙන්)

| Email | Password | Role |
|-------|----------|------|
| amara@school.com | admin123 | Admin |
| nimal@school.com | teacher123 | Teacher |
| sanduni@school.com | teacher123 | Teacher |

---

## 🎉 සුබ පැතුම්! ඔයා ඒක කළා!

ඔයා දැන් මුල ඉඳන්ම සම්පූර්ණ REST API එකක් හැදුවා! ඔයා අද ඉගෙනගත්ත දේවල් මෙන්න:

| මාතෘකාව | ඔයා ඉගෙනගත්ත දේ |
|-------|--------------------|
| **Environment Variables** | `.env` එක්ක රහස් ආරක්‍ෂිතව තියාගන්නවා (ප්‍රශ්නය: hardcoded passwords) |
| **Prisma ORM** | JavaScript වලින් database එකත් එක්ක කතා කරනවා (ප්‍රශ්නය: raw SQL ලියන එක වදයක්) |
| **Async/Await** | හිමින් වෙන දේවල් වලට JavaScript ට ඉන්න කියනවා (ප්‍රශ්නය: JS ට ඉවසීමක් නෑ) |
| **Password Security** | bcrypt වලින් Hashing කරනවා (ප්‍රශ්නය: plain text passwords කියන්නේ විනාශයක්) |
| **JWT Tokens** | දිගටම ලොගින් වෙලා ඉන්නවා (ප්‍රශ්නය: හැම request එකකදීම HTTP ට ඔයාව අමතක වෙනවා) |
| **HTTP Fundamentals** | Requests, Responses, Methods, Status Codes |
| **Error Handling** | try/catch වලින් server එක crash වෙන එක වළක්වනවා (ප්‍රශ්නය: unhandled errors = crash) |
| **Authentication** | ඔයා කවුද කියලා තහවුරු කරගන්නවා (ප්‍රශ්නය: ඕනෑම කෙනෙකුට ඕනෑම දෙයක් බලන්න පුළුවන්) |
| **Authorization** | ඔයාට කරන්න පුළුවන් දේවල් තහවුරු කරගන්නවා (ප්‍රශ්නය: teachers ලා admin වැඩ කරන එක) |
| **REST API Design** | Resource-based URLs එක්ක HTTP methods පාවිච්චි කිරීම |
| **CORS** | Frontend එකට backend එකත් එක්ක කතා කරන්න ඉඩ දෙනවා (ප්‍රශ්නය: browser එක requests block කරනවා) |
| **Layered Architecture** | Route → Middleware → Controller → Service → Repository |

> **ඊළඟට (Day 3):** මේ API එකට connect වෙන React frontend එක අපි හදනවා! අපි Axios පාවිච්චි කරලා මේ endpoints call කරනවා, JWT token එක localStorage එකේ save කරනවා, සහ attendance dashboard එක හදනවා.

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

| Prisma Method | කරන්නේ මොකක්ද | උදාහරණයක් |
|---------------|-------------|--------|
| `findUnique()` | Unique field (id, email) එකකින් ONE record එකක් හොයනවා | `prisma.user.findUnique({ where: { id: 1 } })` |
| `findFirst()` | Condition එකකට ගැලපෙන පළවෙනි record එක හොයනවා | `prisma.attendance.findFirst({ where: { studentId: 1, date: new Date("2026-05-01") } })` |
| `findMany()` | ගැලපෙන ඔක්කොම records හොයනවා (`where` නැත්නම් ඔක්කොම එනවා) | `prisma.student.findMany({ where: { classroomId: 1 } })` |
| `create()` | අලුත් record එකක් දානවා | `prisma.user.create({ data: { name: "Nimal", email: "nimal@school.com", password: "hashed...", role: "teacher" } })` |
| `update()` | තියෙන record එකක් වෙනස් කරනවා | `prisma.user.update({ where: { id: 1 }, data: { name: "New Name" } })` |
| `delete()` | Record එකක් DELETE කරනවා | `prisma.student.delete({ where: { id: 5 } })` |

### ගොඩක් පාවිච්චි වෙන Prisma Options

| Option | කරන්නේ මොකක්ද | උදාහරණයක් |
|--------|-------------|--------|
| `where` | Filter කිරීම — මොන records ද හොයන්න ඕනේ | `where: { email: "nimal@school.com" }` |
| `select` | Return කරන්න ඕන fields මොනවද කියලා තෝරනවා | `select: { id: true, name: true, email: true }` |
| `include` | සම්බන්ධ records ත් ගන්නවා (SQL JOIN වගේ) | `include: { classroom: true }` |
| `orderBy` | Results ටික Sort කරනවා | `orderBy: { date: "desc" }` |
| `data` | Save කරන්න ඕන values (create/update වලදී) | `data: { name: "Nimal", email: "n@s.com" }` |

### select සහ include — කවදද මොකක්ද පාවිච්චි කරන්නේ?

```javascript
// SELECT: "මට මේ table එකෙන් FIELDS කිහිපයක් විතරයි ඕනේ"
const users = await prisma.user.findMany({
  select: {
    id: true,
    name: true,
    email: true,
    // password එක select කරලා නෑ — ඒක හැංගිලා තියෙන්නේ!
  },
});

// INCLUDE: "මට ඔක්කොම fields + අනිත් table එකෙන් සම්බන්ධ වෙච්ච records ඕනේ"
const classroom = await prisma.classroom.findUnique({
  where: { id: 1 },
  include: {
    teacher: true,   // Teacher වත් ගන්නවා (users table එකෙන්)
    students: true,  // මේ class එකේ ඉන්න ඔක්කොම students ලවත් ගන්නවා
  },
});

// COMBINE: "මට සම්බන්ධ වෙච්ච records ඕනේ, හැබැයි fields කිහිපයක් විතරයි"
const students = await prisma.student.findMany({
  include: {
    classroom: {
      select: { id: true, name: true },  // Classroom id එකයි name එකයි විතරක් ගන්නවා
    },
  },
});
```

> 💡 **Tip:** ඔයාට `select` සහ `include` දෙකම එකම top level එකේ පාවිච්චි කරන්න බෑ. දෙකෙන් එකක් තෝරගන්න. හැබැයි ඔයාට උඩ පෙන්වලා තියෙනවා වගේ `include` එකක් ඇතුළේ `select` එකක් දාන්න පුළුවන්!

---

### Common Errors සහ Fixes

| Error | හේතුව | විසඳුම |
|-------|-------|-----|
| `Cannot find module 'express'` | Packages install කරලා නෑ | `npm install` run කරන්න |
| `P1001: Can't reach database server` | MySQL run වෙන්නේ නෑ | XAMPP එකෙන් MySQL start කරන්න |
| `Invalid prisma.user.findUnique() invocation` | Prisma client එක generate කරලා නෑ | `npx prisma generate` run කරන්න |
| `Error: secretOrPrivateKey must have a value` | `.env` එකේ JWT_SECRET නෑ | ඔයාගේ `.env` file එක බලන්න |
| `Port 5000 is already in use` | වෙන server එකක් දුවනවා | `.env` එකේ PORT එක 5001 කරන්න |

---

> ❤️ ආදරෙන් හැදුවේ **designHer 2.0 Bootcamp 2026** වෙනුවෙන්
