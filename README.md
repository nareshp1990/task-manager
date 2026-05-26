# 📋 Task Manager (ZenTask)

A modern, high-performance, and visually stunning client-side task manager and weekly planner. Built with **React**, **TypeScript**, **Vite**, and styled with **Vanilla CSS** featuring a premium glassmorphic UI.

---

## ✨ Features

- **Double Layout View modes**:
  - **List View**: Expandable glassmorphic task cards with progress badges, due reminders, subtasks checklist, notes, edit options, and delete prompts.
  - **Weekly Planner View**: A Kanban-style board grouping tasks across days of the current week (Monday to Sunday) with an **Inbox** column for unscheduled tasks. Includes "Today" highlights and column-specific "Quick Add" date pre-filling.
- **Visual Analytics Dashboard**:
  - SVG circular progress completion ring.
  - Detailed task count grid (Total, Pending, Completed, Overdue).
  - Dynamic category-specific completion progress bars.
- **Granular Task Control**:
  - Title, detailed descriptions, and due date/time pickers.
  - Priority levels: High (Coral/Red), Medium (Orange/Yellow), Low (Green/Teal).
  - Categorization: Seeding presets (Work, Personal, Shopping, Health) and inline custom category creation.
  - Nestable subtasks checklists.
- **Search & Filtering Dashboard**:
  - Full-text search on titles and descriptions.
  - Category filter tabs, status filters, and priority filters.
  - Sorting by Date Created, Due Date, or Priority weight.
- **Data Portability**:
  - **Export Backup**: Save all tasks, settings, and categories into a validated `.json` file.
  - **Import Backup**: Restore tasks from a backup file with structural verification check-guards.
- **Personal Preferences**:
  - Light/Dark theme switch with smooth transitions.
  - Mute/Unmute audio chime that plays upon task completions.
  - Toast feedback messages for every key user action.

---

## 🗄️ Database & Local Persistence

The application uses **HTML5 LocalStorage** for database persistence. This is the **best architecture selection** for this client-side deployment because:
- **100% Client-Side Privacy**: Your data is stored directly in your browser. It is never uploaded to any remote server.
- **Zero Latency**: Reading and writing tasks take less than 1 millisecond.
- **Offline Capable**: The app works fully offline (perfect for plane rides or remote work).
- **Serverless Hosting Ready**: Allows easy, free, static hosting in folders or services like GitHub Pages without needing a backend server database.
- **Backup Support**: You can easily bypass local browser size limits or transfer your database between devices using the **Export/Import** buttons.

---

## 💻 System Requirements

- **Node.js**: Version 18.0.0 or higher.
- **NPM**: Package manager (comes preloaded with Node).
- **Web Browser**: Modern browser (Chrome, Safari, Edge, or Firefox).

---

## 🚀 Running Locally

Clone or extract the repository, open your terminal (macOS) or Command Prompt/PowerShell (Windows), and navigate to the project directory.

### macOS (Terminal)
1. **First-Time Setup** (install packages):
   ```bash
   npm install
   ```
2. **Launch Dev Server**:
   ```bash
   npm run dev
   ```
3. Open [http://localhost:5173](http://localhost:5173) in your browser.

#### macOS Single-Click Desktop Icon:
Inside the repository folder, a `Launch.command` script is provided. Double-clicking it automatically starts the server and opens the browser.
* **To put it on your Desktop**: Right-click `Launch.command` -> select **Make Alias** -> drag the alias file to your **Desktop**. Double-click it anytime to launch.

---

### Windows (Command Prompt / PowerShell)
1. **First-Time Setup** (install packages):
   ```cmd
   npm install
   ```
2. **Launch Dev Server**:
   ```cmd
   npm run dev
   ```
3. Open [http://localhost:5173](http://localhost:5173) in your browser.

#### Windows Single-Click Desktop Icon:
Inside the repository folder, a `Launch.bat` script is provided. Double-clicking it starts the server and launches your browser.
* **To put it on your Desktop**: Right-click `Launch.bat` -> select **Send to** -> **Desktop (create shortcut)**. Double-click the shortcut anytime to launch.

---

## 🌐 Deployment to GitHub Pages

This project is configured with a GitHub Actions workflow that automates compiling and deploying to GitHub Pages for free.

1. Create a repository on your personal GitHub account (e.g. `task-manager`).
2. Push your codebase to the repository:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<your-repo-name>.git
   git push -u origin main --force
   ```
3. Enable Actions Deployment on GitHub:
   - Go to your repository **Settings** tab.
   - Click **Pages** in the left sidebar.
   - Under **Build and deployment** -> **Source**, change the dropdown from *"Deploy from a branch"* to **"GitHub Actions"**.
4. The deployment workflow will trigger automatically. Once finished (usually less than a minute), your app is live at:
   `https://<your-username>.github.io/<your-repo-name>/`
