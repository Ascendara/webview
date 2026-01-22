<div align="center">
    <img align="center" width="128" height="128" src="./readme/icon.png" alt="Ascendara Logo">
    <h1>Ascendara Monitor</h1>
    <p>
        <img src="https://img.shields.io/github/last-commit/ascendara/webview" alt="Last Commit">
        <a href="https://ascendara.app/"><img src="https://img.shields.io/badge/website-ascendara.app-blue" alt="Website"></a>
        <img src="https://img.shields.io/github/license/ascendara/webview" alt="License">
    </p>
</div>

## 📦 About

Ascendara Monitor is a mobile-first web application that acts as a remote monitoring and control companion for Ascendara downloads. Built with Next.js, TypeScript, and Tailwind CSS, it provides a seamless experience for managing your downloads from anywhere.

## ✨ Key Features

- **6-Digit Connection Code**: Secure connection to Ascendara desktop app using a simple 6-digit code
- **Real-time Download Monitoring**: View active, paused, completed, and failed downloads
- **Download Controls**: Pause, resume, and cancel downloads remotely
- **Auto-refresh**: Downloads update automatically every 30 seconds
- **Mobile-first Design**: Optimized for mobile devices with responsive layout
- **Dark Mode Support**: Automatic dark mode support
- **Modern UI**: Built with shadcn/ui components and Tailwind CSS

## 🔧 Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui (New York style)
- **Icons**: Lucide React

## 💻 Building From Source

### Prerequisites
- Node.js 20 or higher
- npm, yarn, pnpm, or bun

### Setup and Run
1. Clone the repository
   ```bash
   git clone https://github.com/ascendara/webview.git
   cd webview
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Run the development server
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production
To build a production-ready application:

```bash
npm run build
npm start
```

## 📁 Project Structure

```
Webview/
├── app/
│   ├── dashboard/
│   │   └── page.tsx          # Dashboard with download monitoring
│   ├── globals.css            # Global styles
│   ├── layout.tsx             # Root layout with Toaster
│   └── page.tsx               # Connection page (home)
├── components/
│   ├── ui/                    # shadcn/ui components
│   ├── code-input.tsx         # 6-digit code input component
│   ├── download-card.tsx      # Download card with controls
│   └── download-skeleton.tsx  # Loading skeleton
├── hooks/
│   └── use-toast.ts           # Toast notification hook
├── lib/
│   ├── api.ts                 # API client and types
│   ├── format.ts              # Formatting utilities
│   └── utils.ts               # Utility functions
└── types/                     # TypeScript type definitions
```

## 🚀 Usage

### Connecting to Ascendara

1. Open Ascendara desktop app
2. Navigate to Settings → Remote Access
3. Generate a 6-digit connection code
4. Enter the code in the web app
5. Start monitoring your downloads

### Download Management

- **Pause**: Temporarily stop a download
- **Resume**: Continue a paused download
- **Cancel**: Stop and remove a download
- **Auto-refresh**: Downloads update every 30 seconds automatically (configurable)

## 🔌 API Integration

The application requires a backend API server to function. You'll need to set up your own monitor endpoint that implements the following API:

- `POST /verify-code` - Verify connection code
- `GET /downloads` - Fetch active downloads
- `POST /downloads/:id/pause` - Pause a download
- `POST /downloads/:id/resume` - Resume a download
- `POST /downloads/:id/cancel` - Cancel a download
- `GET /check-connection` - Check connection status

Configure your API endpoint in the application settings or environment variables.

## 📝 License & Contact  

This project is part of the Ascendara ecosystem

Licensed under [CC BY-NC 1.0 Universal](./LICENSE) - 2025 tagoWorks

### Get in Touch
- Email: [santiago@tago.works](mailto:santiago@tago.works)
- Website: [tago.works](https://tago.works)
- Discord: [Join our community](https://ascendara.app/discord)

---
<div align="center">
    <sub>Built with 💖 by <a href="https://tago.works">tago</a></sub>
</div>
