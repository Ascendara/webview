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
- **End-to-End Encryption**: All communications are encrypted end-to-end on the production webview at [webview.ascendara.app](https://webview.ascendara.app/)
- **Real-time Download Monitoring**: View active, paused, completed, and failed downloads
- **Download Controls**: Pause, resume, and cancel downloads remotely
- **Auto-refresh**: Downloads update automatically every 30 seconds
- **Mobile-first Design**: Optimized for mobile devices with responsive layout
- **Theme Customization**: Multiple theme options with dark mode support
- **PWA Support**: Install as a Progressive Web App on mobile devices
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
│   ├── [code]/
│   │   └── page.tsx           # Dynamic code route handler
│   ├── dashboard/
│   │   └── page.tsx           # Dashboard with download monitoring
│   ├── error.tsx              # Error boundary
│   ├── favicon.ico            # App icon
│   ├── globals.css            # Global styles and theme variables
│   ├── layout.tsx             # Root layout with providers
│   ├── loading.tsx            # Loading state
│   ├── manifest.ts            # PWA manifest configuration
│   ├── not-found.tsx          # 404 page
│   └── page.tsx               # Connection page (home)
├── components/
│   ├── ui/                    # shadcn/ui components
│   │   ├── alert-dialog.tsx   # Alert dialog component
│   │   ├── button.tsx         # Button component
│   │   ├── card.tsx           # Card component
│   │   ├── input.tsx          # Input component
│   │   ├── progress.tsx       # Progress bar component
│   │   ├── skeleton.tsx       # Skeleton loader
│   │   ├── toast.tsx          # Toast notification
│   │   └── toaster.tsx        # Toast container
│   ├── bottom-navbar.tsx      # Mobile bottom navigation
│   ├── code-input.tsx         # 6-digit code input component
│   ├── connection-guard.tsx   # Connection state guard
│   ├── download-card.tsx      # Download card with controls
│   ├── download-skeleton.tsx  # Download loading skeleton
│   ├── install-prompt.tsx     # PWA install prompt
│   ├── theme-button.tsx       # Theme toggle button
│   ├── theme-selector-modal.tsx # Theme selection modal
│   └── theme-selector.tsx     # Theme picker component
├── contexts/
│   └── theme-context.tsx      # Theme context provider
├── hooks/
│   └── use-toast.ts           # Toast notification hook
├── lib/
│   ├── api.ts                 # API client and types
│   ├── config.ts              # App configuration
│   ├── crypto.ts              # End-to-end encryption utilities
│   ├── format.ts              # Formatting utilities
│   ├── themes.ts              # Theme definitions
│   ├── utils.ts               # Utility functions
│   └── version.ts             # App version
├── types/
│   ├── cache-life.d.ts        # Cache lifetime type definitions
│   └── routes.d.ts            # Route type definitions
├── .env.example               # Environment variables template
├── components.json            # shadcn/ui configuration
├── next.config.ts             # Next.js configuration
├── package.json               # Dependencies and scripts
└── tsconfig.json              # TypeScript configuration
```

## 🚀 Usage

### Connecting to Ascendara

1. Open Ascendara desktop app
2. Navigate to Settings → Remote Access
3. Generate a 6-digit connection code
4. Enter the code in the web app
5. Start monitoring your downloads

### 🧪 Development Mode (Mock Dashboard)

For UI development and testing without requiring a real backend connection, the app includes a **dev mock mode**:

#### Activating Dev Mode

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Navigate to [http://localhost:3000](http://localhost:3000)

3. Enter the connection code: **`123456`**

4. You'll be redirected to a mock dashboard with simulated data

#### Dev Mode Features

- **No Real API Calls**: All backend calls are blocked in mock mode to prevent accidental production requests
- **Fake Download Data**: Randomly generated game downloads with realistic names and sizes
- **Simulated Progress**: Download progress bars update automatically every 2 seconds
- **Full UI Testing**: Test pause, resume, and cancel actions without affecting real downloads
- **Visual Indicator**: A purple "DEVELOPMENT" badge appears in the bottom navbar
- **Safe Disconnect**: Exiting mock mode clears the dev session without affecting real data

#### Important Notes

- **Production Safety**: Dev mode only works when `NODE_ENV === 'development'`
- **No Backend Required**: Perfect for frontend development and UI iteration
- **Isolated Environment**: Mock mode uses separate localStorage keys and never touches real sessions
- **API Protection**: The API client automatically blocks all real network requests when mock mode is active

#### Use Cases

- Rapid UI prototyping and iteration
- Testing theme changes and animations
- Developing new download card layouts
- Testing loading states and empty states
- Component development without backend dependencies

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

Licensed under [MIT](./LICENSE) - 2026 tagoWorks

### Get in Touch
- Email: [santiago@tago.works](mailto:santiago@tago.works)
- Website: [tago.works](https://tago.works)
- Discord: [Join our community](https://ascendara.app/discord)

---
<div align="center">
    <sub>Built with 💖 by <a href="https://tago.works">tago</a></sub>
</div>
