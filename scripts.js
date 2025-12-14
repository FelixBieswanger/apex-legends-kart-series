// Google Sheets Configuration
const SHEET_ID = '1_TJF_-He2zpZ5-OlHtVmWGCZu57_ab18p3idRLC8D0U';
const API_KEY = ''; // For public sheets, we use the published CSV method

// Sheet names (as tabs in Google Sheets)
const SHEETS = {
    RACES: 'Races',
    RULES: 'Rules',
    RACERS: 'Racists' // As per the issue description
};

// Function to get sheet data using published CSV method
function getSheetUrl(sheetName) {
    // Using the gviz/tq endpoint which returns JSON for public sheets
    return `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(sheetName)}`;
}

// Parse the weird Google response format
function parseGoogleSheetsResponse(text) {
    try {
        // Remove the google.visualization.Query.setResponse() wrapper
        // Use a more specific pattern to safely extract the JSON payload
        // Trim whitespace and handle potential line breaks
        // Also handle the /*O_o*/ comment prefix that Google Sheets includes
        const trimmedText = text.trim();
        
        // Try to extract the JSON from the JSONP callback
        const match = trimmedText.match(/google\.visualization\.Query\.setResponse\(([\s\S]+)\);?\s*$/);
        if (!match) {
            throw new Error('Invalid Google Sheets response format');
        }
        
        const jsonString = match[1];
        const data = JSON.parse(jsonString);
        
        // Check if the response status is ok
        if (data.status !== 'ok') {
            throw new Error(data.errors?.[0]?.message || 'Failed to load data');
        }
        
        // Safely access the table data
        if (!data.table || !data.table.cols || !data.table.rows) {
            throw new Error('Invalid table structure in response');
        }
        
        const table = data.table;
        const headers = table.cols.map(col => col.label || col.id);
        const rows = table.rows.map(row => {
            const obj = {};
            // Safely handle missing or null cells
            if (row.c) {
                row.c.forEach((cell, index) => {
                    const header = headers[index];
                    if (header) {
                        obj[header] = cell && cell.v !== null && cell.v !== undefined ? cell.v : '';
                    }
                });
            }
            return obj;
        });
        
        return { headers, rows };
    } catch (error) {
        console.error('Error parsing Google Sheets response:', error);
        console.error('Response text (first 500 chars):', text.substring(0, 500));
        throw error;
    }
}

// Fetch sheet data
async function fetchSheetData(sheetName) {
    try {
        const response = await fetch(getSheetUrl(sheetName));
        const text = await response.text();
        return parseGoogleSheetsResponse(text);
    } catch (error) {
        console.error(`Error fetching ${sheetName}:`, error);
        throw error;
    }
}

// State management
let rulesData = [];
let racesData = [];

// Navigation
function navigateTo(pageId) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Show selected page
    document.getElementById(pageId).classList.add('active');
    
    // Update nav active state
    document.querySelectorAll('.navbar-item').forEach(item => {
        item.classList.remove('is-active');
        if (item.getAttribute('href') === '#' + pageId) {
            item.classList.add('is-active');
        }
    });
    
    // Close mobile menu
    document.querySelector('.navbar-menu').classList.remove('is-active');
    document.querySelector('.navbar-burger').classList.remove('is-active');
    
    // Load page data if needed
    if (pageId === 'races' && racesData.length === 0) {
        loadRaces();
    }
    if (pageId === 'rules' && rulesData.length === 0) {
        loadRules();
    }
    
    // Update URL hash
    window.location.hash = pageId;
    
    // Scroll to top
    window.scrollTo(0, 0);
}

// Handle hash navigation
window.addEventListener('hashchange', () => {
    const hash = window.location.hash.slice(1) || 'home';
    if (['home', 'races', 'rules'].includes(hash)) {
        navigateTo(hash);
    }
});

// Load races from Google Sheets
async function loadRaces() {
    try {
        document.getElementById('racesLoading').style.display = 'flex';
        document.getElementById('racesContent').style.display = 'none';
        document.getElementById('racesError').style.display = 'none';
        
        const data = await fetchSheetData(SHEETS.RACES);
        racesData = data.rows;
        
        const racesList = document.getElementById('racesList');
        
        if (racesData.length === 0) {
            racesList.innerHTML = '<div class="notification is-info">No races scheduled yet. Check back soon!</div>';
        } else {
            racesList.innerHTML = racesData.map((race, index) => {
                const raceName = race['Race'] || `Race ${index + 1}`;
                const trackName = race['Name'] || 'TBA';
                const raceType = race['Type'] || '';
                const kartType = race['Art'] || '';
                const horsePower = race['PS'] || '';
                const trackLength = race['Länge in meter'] || '';
                const costPerPerson = race['Kosten-Rennpakt pp'] || '';
                const qualifyingTime = race['Qualifiying in Min'] || '';
                const raceTime = race['Rennen in Min'] || '';
                const raceDate = race['Datum'] || 'TBA';
                const trackLink = race['Link'] || '';
                const trackImage = race['Track Image'] || '';
                
                return `
                    <div class="race-card-wrapper">
                        <div class="card race-card-enhanced">
                            ${trackImage ? `
                                <div class="card-image">
                                    <figure class="image">
                                        <img src="${trackImage}" alt="${trackName}" onerror="this.parentElement.parentElement.style.display='none'">
                                    </figure>
                                </div>
                            ` : ''}
                            <div class="card-content">
                                <div class="race-number">${raceName}</div>
                                <h3 class="title is-4 has-text-white mb-3">${trackName}</h3>
                                
                                <div class="race-details">
                                    ${raceType ? `
                                        <div class="race-detail-item">
                                            <i class="fas fa-home"></i>
                                            <span><strong>Type:</strong> ${raceType}</span>
                                        </div>
                                    ` : ''}
                                    ${kartType ? `
                                        <div class="race-detail-item">
                                            <i class="fas fa-car"></i>
                                            <span><strong>Kart Type:</strong> ${kartType}</span>
                                        </div>
                                    ` : ''}
                                    ${horsePower ? `
                                        <div class="race-detail-item">
                                            <i class="fas fa-tachometer-alt"></i>
                                            <span><strong>Power:</strong> ${horsePower} PS</span>
                                        </div>
                                    ` : ''}
                                    ${trackLength ? `
                                        <div class="race-detail-item">
                                            <i class="fas fa-road"></i>
                                            <span><strong>Length:</strong> ${trackLength}m</span>
                                        </div>
                                    ` : ''}
                                    ${costPerPerson ? `
                                        <div class="race-detail-item">
                                            <i class="fas fa-euro-sign"></i>
                                            <span><strong>Cost per Person:</strong> ${costPerPerson}</span>
                                        </div>
                                    ` : ''}
                                    ${qualifyingTime ? `
                                        <div class="race-detail-item">
                                            <i class="fas fa-stopwatch"></i>
                                            <span><strong>Qualifying:</strong> ${qualifyingTime} min</span>
                                        </div>
                                    ` : ''}
                                    ${raceTime ? `
                                        <div class="race-detail-item">
                                            <i class="fas fa-flag-checkered"></i>
                                            <span><strong>Race:</strong> ${raceTime} min</span>
                                        </div>
                                    ` : ''}
                                    ${raceDate && raceDate !== 'TBA' ? `
                                        <div class="race-detail-item">
                                            <i class="fas fa-calendar-alt"></i>
                                            <span><strong>Date:</strong> ${raceDate}</span>
                                        </div>
                                    ` : ''}
                                </div>
                                
                                ${trackLink ? `
                                    <a href="${trackLink}" target="_blank" rel="noopener noreferrer" class="button is-primary is-fullwidth mt-4">
                                        <i class="fas fa-external-link-alt mr-2"></i>
                                        Visit Track Website
                                    </a>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        }
        
        document.getElementById('racesLoading').style.display = 'none';
        document.getElementById('racesContent').style.display = 'block';
    } catch (error) {
        console.error('Error loading races:', error);
        document.getElementById('racesLoading').style.display = 'none';
        document.getElementById('racesError').style.display = 'block';
    }
}

// Karting background images (free to use images)
const kartingBackgrounds = [
    'https://images.unsplash.com/photo-1612892508341-4d6bca7d1d1f?w=800&q=80', // Go-kart racing
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80', // Racing track
    'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&q=80', // Racing helmet
    'https://images.unsplash.com/photo-1583874129097-32c4c9682747?w=800&q=80', // Motorsport
    'https://images.unsplash.com/photo-1547038577-7b3131116dd4?w=800&q=80'  // Racing flags
];

// Load rules from Google Sheets
async function loadRules() {
    try {
        document.getElementById('rulesLoading').style.display = 'flex';
        document.getElementById('rulesContent').style.display = 'none';
        document.getElementById('rulesError').style.display = 'none';
        
        const data = await fetchSheetData(SHEETS.RULES);
        rulesData = data.rows;
        
        const carousel = document.getElementById('rulesCarousel');
        const nav = document.getElementById('rulesNav');
        
        if (rulesData.length === 0) {
            carousel.innerHTML = '<div class="notification is-info">No rules defined yet.</div>';
        } else {
            carousel.innerHTML = rulesData.map((rule, index) => {
                const bgImage = kartingBackgrounds[index % kartingBackgrounds.length];
                return `
                    <div class="card rule-card-with-bg" data-index="${index}" style="background-image: url('${bgImage}');">
                        <div class="rule-card-overlay">
                            <div class="card-content">
                                <div class="rule-number">${rule.nr || index + 1}</div>
                                <h3 class="title is-5 has-text-white">
                                    Rule ${rule.nr || index + 1}
                                </h3>
                                <p class="has-text-white rule-text">
                                    ${rule.rule || rule.Rule || rule.Description || rule.description || rule.Details || rule.details || rule.Text || rule.text || rule.Title || rule.title || ''}
                                </p>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
            
            // Add navigation dots
            nav.innerHTML = rulesData.map((_, index) => 
                `<div class="carousel-dot ${index === 0 ? 'active' : ''}" data-index="${index}"></div>`
            ).join('');
            
            // Add scroll listener for dots
            carousel.addEventListener('scroll', updateCarouselDots);
            
            // Add click listener for dots
            nav.querySelectorAll('.carousel-dot').forEach(dot => {
                dot.addEventListener('click', () => {
                    const index = parseInt(dot.dataset.index);
                    const card = carousel.querySelector(`[data-index="${index}"]`);
                    card.scrollIntoView({ behavior: 'smooth', inline: 'start' });
                });
            });
        }
        
        document.getElementById('rulesLoading').style.display = 'none';
        document.getElementById('rulesContent').style.display = 'block';
    } catch (error) {
        console.error('Error loading rules:', error);
        document.getElementById('rulesLoading').style.display = 'none';
        document.getElementById('rulesError').style.display = 'block';
    }
}

function updateCarouselDots() {
    const carousel = document.getElementById('rulesCarousel');
    const cards = carousel.querySelectorAll('.card');
    const dots = document.querySelectorAll('#rulesNav .carousel-dot');
    
    let activeIndex = 0;
    cards.forEach((card, index) => {
        const rect = card.getBoundingClientRect();
        const carouselRect = carousel.getBoundingClientRect();
        if (rect.left >= carouselRect.left && rect.left < carouselRect.left + carouselRect.width / 2) {
            activeIndex = index;
        }
    });
    
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === activeIndex);
    });
}



// Mobile menu toggle
document.querySelector('.navbar-burger').addEventListener('click', function() {
    this.classList.toggle('is-active');
    document.querySelector('.navbar-menu').classList.toggle('is-active');
});

// Install banner
function dismissInstallBanner() {
    document.getElementById('installBanner').classList.remove('show');
    localStorage.setItem('installBannerDismissed', 'true');
}

// Show install banner for mobile users
function showInstallBanner() {
    const isStandalone = window.navigator.standalone === true || window.matchMedia('(display-mode: standalone)').matches;
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const dismissed = localStorage.getItem('installBannerDismissed');
    
    if (isTouchDevice && !isStandalone && !dismissed) {
        document.getElementById('installBanner').classList.add('show');
    }
}

// Register service worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Use relative path for GitHub Pages compatibility
        const swPath = window.location.pathname.includes('/apex-legends-kart-series') 
            ? '/apex-legends-kart-series/service-worker.js' 
            : '/service-worker.js';
            
        navigator.serviceWorker.register(swPath)
            .then(registration => {
                console.log('ServiceWorker registered:', registration);
            })
            .catch(error => {
                console.log('ServiceWorker registration failed:', error);
            });
    });
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    showInstallBanner();
    
    // Handle initial hash
    const hash = window.location.hash.slice(1) || 'home';
    if (['home', 'races', 'rules'].includes(hash)) {
        navigateTo(hash);
    }
});

// Handle PWA install prompt for Android/Chrome
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
});
