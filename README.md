# apex-legends-kart-series
Progressive Web App (PWA) for Apex Legends Kart Series

## Features

✅ **iOS Compatible** - Fully optimized for iOS Safari with "Add to Home Screen" support  
✅ **Progressive Web App** - Works offline with service worker caching  
✅ **Responsive Design** - Mobile-first responsive layout that adapts to any screen size  
✅ **GitHub Pages Ready** - Static site ready for deployment  

## Installation on iOS

1. Open Safari on your iPhone or iPad
2. Navigate to the GitHub Pages URL: `https://felixbieswanger.github.io/apex-legends-kart-series/`
3. Tap the **Share** button (⬆️) at the bottom of the screen
4. Scroll down and tap **"Add to Home Screen"**
5. Tap **"Add"** to confirm
6. The app icon will appear on your home screen!

## GitHub Pages Deployment

This PWA is configured for GitHub Pages deployment:

1. Go to your repository **Settings** → **Pages**
2. Under **Source**, select the branch: `copilot/build-minimal-pwa-ios` (or your main branch)
3. Click **Save**
4. Your PWA will be available at: `https://[username].github.io/[repository-name]/`

## Files Structure

```
.
├── index.html          # Main HTML file with PWA meta tags
├── manifest.json       # PWA manifest for app configuration
├── service-worker.js   # Service worker for offline functionality
├── icons/              # App icons for various sizes
│   ├── icon-72.png
│   ├── icon-96.png
│   ├── icon-128.png
│   ├── icon-144.png
│   ├── icon-152.png   # iOS iPad
│   ├── icon-167.png   # iOS iPad Pro
│   ├── icon-180.png   # iOS iPhone
│   ├── icon-192.png
│   ├── icon-384.png
│   └── icon-512.png
└── .nojekyll          # Tells GitHub Pages to serve all files
```

## Technologies Used

- Pure HTML5, CSS3, and JavaScript (no build process required)
- Service Worker API for offline functionality
- Web App Manifest for PWA capabilities
- iOS-specific meta tags for optimal Safari experience

## License

See [LICENSE](LICENSE) file for details.
