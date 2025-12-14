# Apex Legends Kart Series 2026

Progressive Web App (PWA) for the Apex Legends Kart Series - Amateur Karting Cup

## Features

✅ **Races Overview** - View all upcoming races with dates and locations  
✅ **Rules** - Browse racing rules in a swipeable card carousel  
✅ **Racer Sign Up** - Register as a racer with name, photo, and rules acknowledgment  
✅ **Google Sheets Integration** - All data loaded from a Google Sheet  
✅ **iOS Compatible** - Fully optimized for iOS Safari with "Add to Home Screen" support  
✅ **Progressive Web App** - Works offline with service worker caching  
✅ **Responsive Design** - Mobile-first responsive layout using Bulma CSS  

## Pages

- **Home** - Welcome page with quick links to all features
- **Races** - List of upcoming races loaded from Google Sheets
- **Rules** - Swipeable card carousel with all racing rules
- **Sign Up** - Registration form with rules acknowledgment

## Google Sheets Setup

The app loads data from a Google Sheet. The sheet should have the following tabs:

### Races Tab
| Column | Description |
|--------|-------------|
| Date | Race date |
| Location | Track/venue name |
| Description | Additional details |
| Status | Race status (e.g., "Upcoming") |

### Rules Tab
| Column | Description |
|--------|-------------|
| Title | Rule title/name |
| Description | Full rule text |

### Racists Tab (Racers)
Where registered racers are stored:
| Column | Description |
|--------|-------------|
| Name | Racer's full name |
| Photo | Profile photo (Base64 or URL) |
| Timestamp | Registration date/time |

## Installation on iOS

1. Open Safari on your iPhone or iPad
2. Navigate to the GitHub Pages URL
3. Tap the **Share** button (⬆️) at the bottom
4. Scroll down and tap **"Add to Home Screen"**
5. Tap **"Add"** to confirm

## Development

This is a static PWA with no build process required:

- `index.html` - Main application with all pages and logic
- `manifest.json` - PWA manifest configuration
- `service-worker.js` - Offline caching support
- `icons/` - App icons for various device sizes

### Technologies Used

- HTML5, CSS3, JavaScript (ES6+)
- [Bulma CSS](https://bulma.io/) - Modern CSS framework
- [Font Awesome](https://fontawesome.com/) - Icon library
- Google Sheets API (gviz/tq endpoint)
- Service Worker for offline support

## License

See [LICENSE](LICENSE) file for details.
