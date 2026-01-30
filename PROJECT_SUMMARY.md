# Family Board V2 - Project Summary & Operation Guide

**Created on:** 2026-01-11
**Version:** 2.0 (Complete)

## 📌 Project Overview
This project is a React-based "Family Board" application with a Node.js/Express backend and MongoDB database. It features a secure login system, photo sharing, mini-games, an emoticon shop, and real-time chat.

## ✨ Implemented Features (Version 2)

### 1. Main Features
- **Gallery (📷 갤러리)**: Grid-style photo album viewing.
- **Board (📝 게시판)**: Rich text posts with image uploads, polls, and comments.
- **Shop (🛒 이모티콘 샵)**: Buy emoticons with points earned from attendance/games.
- **Calendar (📅 일정)**: Shared family calendar.
- **Todo (✅ 할 일)**: Shared task list.

### 2. Mini Games
- **Ladder Game (사다리타기)**: For making fair decisions.
- **Rock-Paper-Scissors (가위바위보)**: Play against AI to earn points.
- **Roulette (룰렛)**: Spin the wheel for random outcomes.

### 3. Communication
- **1:1 Chat & Group Chat**: Real-time messaging with emoticons.
- **Secret Chat**: Private messages.
- **Reply/Mention**: Direct replies in chat.

### 4. Admin Features
- **xManager**: Master admin account.
- **Approval System**: New users require admin approval to access the site.

---

## 🚀 Deployment & Operations

### 1. Client (Frontend)
- **Host**: GitHub Pages
- **URL**: `https://swl12369.github.io/`
- **How to Update**:
  1. Make changes in `client/` folder.
  2. Run command:
     ```bash
     cd client
     npm run deploy
     ```

### 2. Server (Backend)
- **Host**: Render
- **URL**: `https://family-board-serve.onrender.com`
- **How to Update**:
  1. Make changes in `server/` folder.
  2. Commit and push to GitHub:
     ```bash
     git add .
     git commit -m "Your update message"
     git push origin master
     ```
  3. Render will automatically redeploy (takes 1-3 minutes).

---

## 🔧 Important Configuration (Troubleshooting)

### Cloudinary (Image Uploads)
If photo uploads fail (500 Error or "Missing API Key"), check **Render Environment Variables**.
1. Go to [Render Dashboard](https://dashboard.render.com/) -> `family-board-serve` -> **Environment**.
2. Ensure these keys exist and are correct (Check for extra spaces!):
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
3. If "Invalid Signature" error occurs, re-copy the **API Secret**.

### Debugging
- Check server config status at: `https://family-board-serve.onrender.com/api/debug/config`

---

## 🔐 Admin Accounts
- **Master Admin**: `xManager`
- **Initial Admin**: `irene`

---

*This file serves as a summary of the development work done for Version 2.*
