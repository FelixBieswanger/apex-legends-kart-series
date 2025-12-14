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
    // Remove the google.visualization.Query.setResponse() wrapper
    // Use a more specific pattern to safely extract the JSON payload
    // Trim whitespace and handle potential line breaks
    const trimmedText = text.trim();
    const match = trimmedText.match(/google\.visualization\.Query\.setResponse\(([\s\S]+)\);?\s*$/);
    if (!match) {
        throw new Error('Invalid Google Sheets response format');
    }
    const jsonString = match[1];
    const data = JSON.parse(jsonString);
    
    if (data.status !== 'ok') {
        throw new Error(data.errors?.[0]?.message || 'Failed to load data');
    }
    
    const table = data.table;
    const headers = table.cols.map(col => col.label || col.id);
    const rows = table.rows.map(row => {
        const obj = {};
        row.c.forEach((cell, index) => {
            obj[headers[index]] = cell ? (cell.v || '') : '';
        });
        return obj;
    });
    
    return { headers, rows };
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
let photoDataUrl = null;

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
    if (pageId === 'signup') {
        loadRulesForSignup();
    }
    
    // Update URL hash
    window.location.hash = pageId;
    
    // Scroll to top
    window.scrollTo(0, 0);
}

// Handle hash navigation
window.addEventListener('hashchange', () => {
    const hash = window.location.hash.slice(1) || 'home';
    if (['home', 'races', 'rules', 'signup'].includes(hash)) {
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
            racesList.innerHTML = racesData.map((race, index) => `
                <div class="card race-card">
                    <div class="card-content">
                        <div class="race-date">
                            <i class="fas fa-calendar-alt mr-1"></i>
                            ${race.Date || race.date || 'TBA'}
                        </div>
                        <div class="race-location">
                            <i class="fas fa-map-marker-alt mr-1" style="color: var(--primary-red);"></i>
                            ${race.Location || race.location || race.Track || race.track || 'Location TBA'}
                        </div>
                        <p class="has-text-grey-light mt-2">
                            ${race.Description || race.description || race.Notes || race.notes || ''}
                        </p>
                        ${race.Status || race.status ? `
                            <span class="tag ${(race.Status || race.status).toLowerCase() === 'upcoming' ? 'is-success' : 'is-warning'} mt-3">
                                ${race.Status || race.status}
                            </span>
                        ` : ''}
                    </div>
                </div>
            `).join('');
        }
        
        document.getElementById('racesLoading').style.display = 'none';
        document.getElementById('racesContent').style.display = 'block';
    } catch (error) {
        console.error('Error loading races:', error);
        document.getElementById('racesLoading').style.display = 'none';
        document.getElementById('racesError').style.display = 'block';
    }
}

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
            carousel.innerHTML = rulesData.map((rule, index) => `
                <div class="card" data-index="${index}">
                    <div class="card-content">
                        <div class="rule-number">${index + 1}</div>
                        <h3 class="title is-5 has-text-white">
                            ${rule.Title || rule.title || rule.Rule || rule.rule || `Rule ${index + 1}`}
                        </h3>
                        <p class="has-text-grey-light">
                            ${rule.Description || rule.description || rule.Details || rule.details || rule.Text || rule.text || ''}
                        </p>
                    </div>
                </div>
            `).join('');
            
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

// Load rules checkboxes for signup page
async function loadRulesForSignup() {
    const container = document.getElementById('rulesCheckboxes');
    
    try {
        if (rulesData.length === 0) {
            const data = await fetchSheetData(SHEETS.RULES);
            rulesData = data.rows;
        }
        
        if (rulesData.length === 0) {
            container.innerHTML = '<p class="has-text-grey">No rules to acknowledge.</p>';
        } else {
            container.innerHTML = rulesData.map((rule, index) => `
                <div class="field">
                    <label class="checkbox">
                        <input type="checkbox" class="rule-checkbox" data-index="${index}">
                        <strong>${index + 1}.</strong> ${rule.Title || rule.title || rule.Rule || rule.rule || `Rule ${index + 1}`}
                    </label>
                </div>
            `).join('');
            
            // Add listener to check all individual boxes when "acknowledge all" is checked
            document.getElementById('acknowledgeAll').addEventListener('change', function() {
                document.querySelectorAll('.rule-checkbox').forEach(cb => {
                    cb.checked = this.checked;
                });
            });
        }
    } catch (error) {
        container.innerHTML = '<p class="has-text-danger">Failed to load rules. Please refresh the page.</p>';
    }
}

// Handle photo upload
function handlePhotoUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            photoDataUrl = e.target.result;
            document.getElementById('photoPreview').src = photoDataUrl;
            document.getElementById('photoPreview').style.display = 'block';
            document.getElementById('photoPlaceholder').style.display = 'none';
            document.getElementById('photoUpload').classList.add('has-image');
        };
        reader.readAsDataURL(file);
    }
}

// Handle signup form submission
async function handleSignup(event) {
    event.preventDefault();
    
    const name = document.getElementById('racerName').value.trim();
    const acknowledgeAll = document.getElementById('acknowledgeAll').checked;
    
    // Hide previous messages
    document.getElementById('signupSuccess').style.display = 'none';
    document.getElementById('signupError').style.display = 'none';
    
    // Validation
    if (!name) {
        showSignupError('Please enter your name.');
        return;
    }
    
    if (!acknowledgeAll) {
        showSignupError('You must acknowledge all rules to sign up.');
        return;
    }
    
    // Show loading state
    const submitBtn = document.getElementById('submitBtn');
    submitBtn.classList.add('is-loading');
    submitBtn.disabled = true;
    
    try {
        // For a hobby project without backend, we'll use Google Forms or Apps Script
        // For now, we'll show success and explain how to set up the backend
        
        // Simulating submission - in production, you'd send to a Google Apps Script web app
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Show success
        document.getElementById('signupSuccess').style.display = 'block';
        
        // Reset form
        document.getElementById('signupForm').reset();
        document.getElementById('photoPreview').style.display = 'none';
        document.getElementById('photoPlaceholder').style.display = 'block';
        document.getElementById('photoUpload').classList.remove('has-image');
        photoDataUrl = null;
        
        // Reload checkboxes
        loadRulesForSignup();
        
        // Scroll to success message
        document.getElementById('signupSuccess').scrollIntoView({ behavior: 'smooth' });
        
    } catch (error) {
        showSignupError('Registration failed. Please try again.');
    } finally {
        submitBtn.classList.remove('is-loading');
        submitBtn.disabled = false;
    }
}

function showSignupError(message) {
    document.getElementById('signupErrorText').textContent = message;
    document.getElementById('signupError').style.display = 'block';
    document.getElementById('signupError').scrollIntoView({ behavior: 'smooth' });
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
    if (['home', 'races', 'rules', 'signup'].includes(hash)) {
        navigateTo(hash);
    }
});

// Handle PWA install prompt for Android/Chrome
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
});
