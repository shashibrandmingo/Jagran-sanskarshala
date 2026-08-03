# 🚀 Jagran Sanskarshala - Project Tech Stack & Documentation

## 1. Project Overview
- **Project Name:** Jagran Sanskarshala 2026
- **Type:** Full-Stack Web Application (Frontend + Backend REST API)
- **Description:** Interactive educational & survey platform for parents and students with weekly values stories, automated PDF certificate generation, and an administrative control dashboard.

---

## 2. Frontend Technologies (Client-Side)
- **Framework:** Next.js 16 (App Router with Server & Client Components)
- **Core Library:** React 19
- **Styling Framework:** Tailwind CSS v4 & PostCSS
- **Custom Design Tokens:** Vanilla CSS Variables (Glassmorphism & Dynamic Color Palettes)
- **Internationalization (i18n):** `i18next`, `react-i18next`, `i18next-browser-languagedetector` (Bilingual support for Hindi & English)
- **Icons Libraries:** `react-icons/fa6` & `@fortawesome/react-fontawesome`
- **Animations:** `framer-motion` & `aos` (Animate On Scroll)
- **PDF Certificate Generation:** `jspdf` & `pdf-lib` (Client-side instant PDF certificate builder)
- **Data Export:** `xlsx` (SheetJS - Admin Excel export engine)
- **Carousels & Media Sliders:** `swiper` v14
- **Email Service:** `nodemailer`

---

## 3. Backend Technologies (Server-Side)
- **Runtime Environment:** Node.js (ES Modules `import`/`export`)
- **Server Framework:** Express.js v5
- **Database Engine:** MongoDB
- **ORM / ODM:** Mongoose ORM
- **Authentication:** JWT (JSON Web Tokens) with custom `protectAdmin` middleware
- **Password Hashing:** `bcryptjs`
- **Security Middlewares:**
  - `helmet` (HTTP security headers)
  - `cors` (Cross-Origin Resource Sharing)
  - `cookie-parser` (HTTP-Only security cookies)
  - `express-rate-limit` (DDoS & brute-force protection)
  - `hpp` (HTTP Parameter Pollution prevention)
- **Performance & Logging:** `compression` (gzip response compression) & `morgan` (HTTP request logger)
- **File Upload & Cloud Storage:** `multer` (Memory storage) + `cloudinary` (CDN media host for gallery photos)
- **Data Validation:** `zod` schema validator
- **Environment Management:** `dotenv`

---

## 4. Hosting, Server & DevOps Architecture
- **Server OS:** Ubuntu Linux VPS
- **Web Server & Reverse Proxy:** Nginx (Proxying Port 80 to Next.js & Express API)
- **Process Manager:** PM2 (24/7 background process execution, auto-restart, memory limit management)
- **Domain & IP Setup:** Configured for Direct IP (`200.141.11.165`) & future Domain SSL
- **Version Control:** Git & GitHub

---

## 5. Main Application Features & Modules
- **Parent & Student Survey System:** Dynamic forms, instant score calculation, percentage breakdown, and downloadable PDF certificates.
- **Weekly Values Stories:** 8-week structured story reading module in Hindi and English (`/story/[id]`).
- **Admin Authentication:** Secure admin login system (`/admin-login`).
- **Admin Control Dashboard (`/admin/dashboard`):**
  - **Survey Submissions:** Real-time live MongoDB submissions table, date range filters, multi-state dropdowns, Excel export.
  - **Publish Story:** Story management, draft vs published state toggle, Hindi/English story detail editor.
  - **Analytics & Leads:** Parent vs student submission metrics and contact leads database.
  - **Push Notification:** System broadcast tool.
- **Gallery Management (`/admin/gallery`):** Years, categories, and direct photo uploads to Cloudinary CDN.
