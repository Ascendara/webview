# Ascendara Monitor

A mobile-first web application that acts as a remote monitoring and control companion for Ascendara downloads. Built with Next.js, TypeScript, and Tailwind CSS.

## Features

- **6-Digit Connection Code**: Secure connection to Ascendara desktop app using a simple 6-digit code
- **Real-time Download Monitoring**: View active, paused, completed, and failed downloads
- **Download Controls**: Pause, resume, and cancel downloads remotely
- **Auto-refresh**: Downloads update automatically every 30 seconds
- **Mobile-first Design**: Optimized for mobile devices with responsive layout
- **Dark Mode Support**: Automatic dark mode support
- **Modern UI**: Built with shadcn/ui components and Tailwind CSS

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui (New York style)
- **Icons**: Lucide React
- **Backend API**: https://monitor.ascendara.app

## Getting Started

### Prerequisites

- Node.js 20 or higher
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Webview
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

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

## Usage

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

## API Integration

The application communicates with the backend at `https://monitor.ascendara.app` using the following endpoints:

- `POST /verify-code` - Verify connection code
- `GET /downloads` - Fetch active downloads
- `POST /downloads/:id/pause` - Pause a download
- `POST /downloads/:id/resume` - Resume a download
- `POST /downloads/:id/cancel` - Cancel a download
- `GET /check-connection` - Check connection status

## Development

### Building for Production

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

## Features in Detail

### Connection Page
- 6 individual digit inputs with auto-focus and auto-advance
- Backspace navigation between inputs
- Paste support for quick code entry
- Loading and error states
- Clear helper text

### Dashboard
- Categorized downloads (Active, Paused, Completed, Failed)
- Real-time progress bars
- Download speed and ETA display
- File size information
- Action buttons for each download
- Empty state when no downloads
- Sticky header with refresh and disconnect buttons

### UI/UX
- Mobile-first responsive design
- Smooth animations and transitions
- Toast notifications for user feedback
- Loading skeletons for better perceived performance
- Error handling with user-friendly messages
- Dark mode support

## License

This project is part of the Ascendara ecosystem.

## Support

For issues or questions, please refer to the main Ascendara documentation.
