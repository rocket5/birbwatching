# BirdWatching

A website dedicated to bird watching enthusiasts, providing information about birds and bird watching locations.

## Project Setup

### Prerequisites
- Node.js (v20 or later)
- Git with Git LFS

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd birbwatching
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm run dev
```

4. Build for production
```bash
npm run build
```

## Deployment

This project is set up to automatically deploy to GitHub Pages using GitHub Actions when changes are pushed to the main branch.

### Automatic Deployment

When you push to the main branch, the GitHub Actions workflow will:
1. Check out the code
2. Set up Node.js v20
3. Install dependencies
4. Build the website using Vite
5. Upload build artifacts
6. Deploy to GitHub Pages

The site will be available at: `https://<username>.github.io/birbwatching/`

### Manual Deployment

If needed, you can also deploy manually using:

```bash
npm run build
# Then deploy the dist folder to your server
```

## Build Configuration

### Vite Configuration
- Base path set for GitHub Pages: `/birbwatching/`
- Development server runs on port 3001
- Production builds:
  - Output directory: `dist`
  - Minification: Terser
  - Manual code chunking for Three.js

## Project Structure

```
birbwatching/
├── public/            # Static assets that will be copied to build folder
├── src/               # Source files
│   ├── assets/        # Assets that will be processed by the build tool
│   │   ├── fonts/     # Font files
│   │   └── images/    # Image files
│   ├── css/           # CSS files
│   └── js/            # JavaScript files
├── .github/           # GitHub configuration
│   └── workflows/     # GitHub Actions workflows for CD
├── index.html         # Main HTML file
├── package.json       # Project configuration
├── vite.config.js     # Vite configuration
├── .gitignore         # Git ignore file
└── .gitattributes     # Git LFS configuration
```

## Git LFS

This project uses Git LFS to manage large binary files such as images, videos, and other assets. The following file types are tracked by Git LFS:

- Images: .png, .jpg, .jpeg, .gif
- Design files: .psd, .ai
- Video files: .mp4, .mov
- Audio files: .mp3, .wav
- Documents: .pdf
- Archives: .zip, .tar.gz

## Troubleshooting

### Three.js Import Issues

For future reference, if you encounter similar issues with Three.js imports, remember that the paths should match the actual directory structure in the node_modules folder. The error happened because the system was trying to find OrbitControls in `three/addons/` when it's actually in `three/examples/jsm/`.

When working with Three.js modules, use these import paths:

```javascript
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
```
