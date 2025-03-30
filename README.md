# BirdWatching

A website dedicated to bird watching enthusiasts, providing information about birds and bird watching locations.

## Project Setup

### Prerequisites
- Node.js (v14 or later)
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
├── index.html         # Main HTML file
├── package.json       # Project configuration
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
