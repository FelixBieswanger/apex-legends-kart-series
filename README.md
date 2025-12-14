# Apex Legends Kart Series 2026

Progressive Web App (PWA) for the Apex Legends Kart Series - Amateur Karting Cup

## Features

✅ **Races Overview** - Visual racetrack display with detailed race information  
✅ **Point System** - Clear breakdown of championship points structure  
✅ **Rules** - Browse racing rules in a swipeable card carousel with karting backgrounds  
✅ **Google Sheets Integration** - All data loaded from a Google Sheet  
✅ **iOS Compatible** - Fully optimized for iOS Safari with "Add to Home Screen" support  
✅ **Progressive Web App** - Works offline with service worker caching  
✅ **Responsive Design** - Mobile-first responsive layout using Bulma CSS  

## Pages

- **Home** - Welcome page with quick links to races and rules
- **Races** - Visual racetrack layout showing all races with detailed information (track type, kart specs, costs, times, dates, and links)
- **Rules** - Point system table and swipeable card carousel with racing rules on karting-themed backgrounds

## Google Sheets Setup

The app loads data from a Google Sheet. The sheet should have the following tabs:

### Races Tab
| Column | Description |
|--------|-------------|
| Race | Race identifier (e.g., "Race 1") |
| Name | Track/venue name |
| Type | Indoor/Outdoor/Indoor+Outdoor |
| Art | Kart type (Benzin/Elektro) |
| PS | Horsepower |
| Länge in meter | Track length in meters |
| Kosten-Rennpakt pp | Cost per person |
| Qualifiying in Min | Qualifying time in minutes |
| Rennen in Min | Race time in minutes |
| Datum | Race date |
| Link | Track website URL |
| Track Image | URL to track layout image |

### Rules Tab
| Column | Description |
|--------|-------------|
| nr | Rule number |
| rule | Full rule text |

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
