# Video Bounding Box Labeling Tool

A web-based tool for creating bounding box annotations on video frames. Draw boxes on paused video frames, and the tool will generate timestamped coordinates in JSON format.

## Features

- 📹 Import and play video files
- 🎯 Draw bounding boxes on video frames
- 📊 Generate JSON output with timestamped coordinates (scaled to 1920x1080)
- 📋 View and manage all created labels
- 📋 Copy JSON output to clipboard

## Prerequisites

- Node.js v16 or higher
- npm 8 or higher

## Run Locally

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Open in browser:**
   - Navigate to `http://localhost:3000/`
   - Or your machine IP: `http://<your-ip>:3000/`

## Usage

1. Click **"Choose File"** to import a video
2. Click **"Label"** to activate labeling mode
3. Seek to desired frame and **draw boxes** by clicking and dragging
4. View all created labels in the **Generated Labels** panel
5. Copy the **JSON Output** to use in your application

## Build

To build for production:
```bash
npm run build
```

## Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Vite** - Build tool
