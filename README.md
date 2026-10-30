# Verita - Anonymous College Grievance & Support System

**Verita** is a full-stack web application designed for college students to report grievances, complaints, concerns, or suggestions to college authorities **100% anonymously** without creating an account or revealing their identity.

The platform integrates an **AI Assistant** (powered by Google Gemini API with smart offline NLP fallback) that moderates abusive content, personal threats, harassment, and spam while **safeguarding legitimate student grievances regarding faculty, marks, or administration**.

---

## 🌟 Key Features

1. **Anonymous Student Interface (No Login Required)**
   - Select complaint category, department, and preferred authority.
   - Describe issue & optionally attach evidence files.
   - Pass through AI moderation in real-time.
   - Receive a unique Complaint ID (e.g. `VRT-2026-00101`).
   - Track complaint progress via interactive visual timeline without revealing identity.

2. **AI Moderation Assistant**
   - **APPROVED**: Genuine complaints are automatically routed to relevant authorities.
   - **NEEDS REVIEW**: Ambiguous complaints are sent for human admin review.
   - **REJECTED**: Severe profanity, threats, or spam are blocked with constructive rewrite advice.

3. **5 Role-Based Dashboards & Access Control**
   - **Student Portal**: Open access submission & status lookup.
   - **Faculty Dashboard**: Filter assigned complaints, change status, and post official responses.
   - **HOD Dashboard**: View department grievances, assign to faculty, and escalate to leadership.
   - **Principal Dashboard**: View institution-wide metrics, category charts, department breakdown, and issue executive directives.
   - **CEO / Management Dashboard**: Monitor high-level KPIs, resolution turnaround speed, monthly trends, and emergency escalations.

4. **Zero-Config Database**
   - Pre-seeded SQLite database ready to run locally out-of-the-box (`verita.db`).
   - Standard MySQL & PostgreSQL DDL schemas included in `server/config/schema.sql`.

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: v18.0.0 or higher installed on your machine.
- **npm**: v9.0.0 or higher.

### Step 1: Install Dependencies

From the project root directory, run:

```bash
# Install root, server, and client dependencies in one command
npm run install:all
```

Alternatively, install manually in each folder:
```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

---

### Step 2: Environment Variables Setup (Optional)

The system works **out-of-the-box** using a built-in smart NLP classifier even without an API key. 

To enable live Google Gemini AI moderation:
1. Open or create `server/.env` (reference `server/.env.example`):

```env
PORT=5000
JWT_SECRET=verita_secret_jwt_key_2026

# Optional: Google Gemini API Key
GEMINI_API_KEY=your_gemini_api_key_here
```

---

### Step 3: Database Setup

The backend automatically creates and seeds `server/verita.db` on first start!

If you prefer to deploy to **MySQL** or **PostgreSQL**, execute the provided DDL script:
- `server/config/schema.sql`

---

### Step 4: Running Backend & Frontend

#### Method A: Run concurrently from root
```bash
npm run dev
```

#### Method B: Run separately
**Backend Server (Port 5000):**
```bash
cd server
npm run dev
```

**Frontend React Client (Port 3000):**
```bash
cd client
npm run dev
```

Open your browser to: **`http://localhost:3000`**

---

## 🔑 Demo Test Credentials

To facilitate project demonstration, all test accounts are pre-seeded with password: `password123`

You can also use the **One-Click Quick Demo Login** buttons on the Login page!

| Role | Email / ID | Password | Access Scope |
| :--- | :--- | :--- | :--- |
| **Faculty (CSE)** | `faculty1@verita.edu` | `password123` | View & respond to assigned CSE grievances |
| **Faculty (ECE)** | `faculty2@verita.edu` | `password123` | View & respond to assigned ECE grievances |
| **HOD (CSE)** | `hod_cse@verita.edu` | `password123` | CSE Department overview & faculty assignment |
| **HOD (ECE)** | `hod_ece@verita.edu` | `password123` | ECE Department overview & faculty assignment |
| **Principal** | `principal@verita.edu` | `password123` | College-wide analytics, reassignments & directives |
| **CEO / Board** | `ceo@verita.edu` | `password123` | Executive summary, resolution speed KPIs & escalations |

---

## 🧪 Testing Workflows

### 1. Anonymous Complaint Submission Test
1. Go to `http://localhost:3000/submit`.
2. Select Category: **Academic Issues**, Department: **Computer Science & Engineering**.
3. Type a legitimate grievance:
   > *"My internal marks for Web Technologies course were reduced by 5 points without feedback or rubrics provided."*
4. Click **Submit Anonymous Grievance**.
5. Observe the AI Moderation result modal: **APPROVED**.
6. Note your generated Complaint ID (e.g., `VRT-2026-00101`).

### 2. AI Content Filtering Test (Toxic Content Rejection)
1. Submit another complaint containing abusive or threatening words.
2. Observe the AI Moderation result modal: **REJECTED**.
3. Read the feedback asking the student to rewrite using respectful language.

### 3. Anonymous Complaint Tracking Test
1. Go to `http://localhost:3000/track`.
2. Enter Complaint ID: `VRT-2026-00101`.
3. View the multi-stage visual timeline (Submitted → AI Verified → Forwarded → Under Review → Resolved) and official staff update logs.

### 4. Faculty Response Workflow Test
1. Log in as Faculty (`faculty1@verita.edu` / `password123`).
2. Click **Respond / Update** on complaint `VRT-2026-00101`.
3. Change status to **IN PROGRESS** and enter message: *"Reviewing evaluation sheet with internal exam committee."*
4. Log out and search `VRT-2026-00101` on the Track page to see the update reflected live on the timeline!

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, Lucide Icons, Recharts, Custom CSS Glassmorphism Design System.
- **Backend**: Node.js, Express.js, JWT, bcryptjs, Multer.
- **AI Moderation**: Google Gemini API (`@google/generative-ai`) + Fallback NLP Rules Engine.
- **Database**: SQLite3 zero-config DB driver + SQL Schema scripts.
