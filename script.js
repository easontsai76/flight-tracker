// Local Storage Keys
const STORAGE_USERS = 'flightTracker_users';
const STORAGE_FAVORITES = 'flightTracker_favorites';
const STORAGE_CURRENT_USER = 'flightTracker_currentUser';

// Sample Flight Data
const SAMPLE_FLIGHTS = [
    { number: 'UA123', airline: 'United', departure: 'JFK', arrival: 'LAX', departureTime: '08:00', arrivalTime: '11:00', status: 'On Time', aircraft: 'Boeing 777' },
    { number: 'DL456', airline: 'Delta', departure: 'LAX', arrival: 'ORD', departureTime: '14:30', arrivalTime: '20:00', status: 'Delayed', aircraft: 'Airbus A350' },
    { number: 'AA789', airline: 'American', departure: 'JFK', arrival: 'LHR', departureTime: '19:00', arrivalTime: '07:15', status: 'On Time', aircraft: 'Boeing 787' },
    { number: 'SW321', airline: 'Southwest', departure: 'ORD', arrival: 'DEN', departureTime: '10:00', arrivalTime: '11:30', status: 'Boarding', aircraft: 'Boeing 737' },
    { number: 'BA654', airline: 'British Airways', departure: 'LHR', arrival: 'JFK', departureTime: '11:00', arrivalTime: '14:30', status: 'On Time', aircraft: 'Airbus A380' },
];

const SAMPLE_AIRPORTS = {
    'JFK': { name: 'John F. Kennedy International Airport', city: 'New York', country: 'USA', iata: 'JFK', icao: 'KJFK' },
    'LAX': { name: 'Los Angeles International Airport', city: 'Los Angeles', country: 'USA', iata: 'LAX', icao: 'KLAX' },
    'LHR': { name: 'London Heathrow Airport', city: 'London', country: 'UK', iata: 'LHR', icao: 'EGLL' },
    'ORD': { name: "Chicago O'Hare International Airport", city: 'Chicago', country: 'USA', iata: 'ORD', icao: 'KORD' },
    'DEN': { name: 'Denver International Airport', city: 'Denver', country: 'USA', iata: 'DEN', icao: 'KDEN' },
};

// Initialize Application
window.addEventListener('DOMContentLoaded', function() {
    loadUsers();
    checkCurrentUser();
    showSection('home');
});

// Section Navigation
function showSection(sectionId) {
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => section.classList.remove('active'));
    
    const activeSection = document.getElementById(sectionId);
    if (activeSection) {
        activeSection.classList.add('active');
        window.scrollTo(0, 0);
    }
}

// User Management
function loadUsers() {
    if (!localStorage.getItem(STORAGE_USERS)) {
        localStorage.setItem(STORAGE_USERS, JSON.stringify({}));
    }
}

function login() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();

    if (!username || !password) {
        showAlert('Please enter both username and password', 'error');
        return;
    }

    const users = JSON.parse(localStorage.getItem(STORAGE_USERS));
    
    if (users[username]) {
        // User exists - check password
        if (users[username].password === password) {
            localStorage.setItem(STORAGE_CURRENT_USER, username);
            checkCurrentUser();
            showAlert(`Welcome back, ${username}!`, 'success');
            document.getElementById('username').value = '';
            document.getElementById('password').value = '';
        } else {
            showAlert('Incorrect password', 'error');
        }
    } else {
        // Create new user
        users[username] = {
            password: password,
            created: new Date().toISOString(),
            favorites: []
        };
        localStorage.setItem(STORAGE_USERS, JSON.stringify(users));
        localStorage.setItem(STORAGE_CURRENT_USER, username);
        checkCurrentUser();
        showAlert(`Account created and logged in as ${username}!`, 'success');
        document.getElementById('username').value = '';
        document.getElementById('password').value = '';
    }
}

function logout() {
    localStorage.removeItem(STORAGE_CURRENT_USER);
    checkCurrentUser();
    showAlert('Logged out successfully', 'success');
}

function checkCurrentUser() {
    const currentUser = localStorage.getItem(STORAGE_CURRENT_USER);
    const loginForm = document.getElementById('loginForm');
    const userPanel = document.getElementById('userPanel');
    const currentUserSpan = document.getElementById('currentUser');

    if (currentUser) {
        loginForm.style.display = 'none';
        userPanel.style.display = 'block';
        currentUserSpan.textContent = currentUser;
        loadFavorites();
    } else {
        loginForm.style.display = 'block';
        userPanel.style.display = 'none';
        document.getElementById('favoritesList').innerHTML = '<p class="no-favorites">Please login to view your favorites</p>';
    }
}

// Flight Search
function searchFlights() {
    const departure = document.getElementById('departure').value.toUpperCase().trim();
    const arrival = document.getElementById('arrival').value.toUpperCase().trim();
    const airline = document.getElementById('airline').value.toLowerCase().trim();
    const date = document.getElementById('date').value;

    if (!departure || !arrival) {
        showAlert('Please enter departure and arrival airports', 'error');
        return;
    }

    let results = SAMPLE_FLIGHTS.filter(flight => {
        return flight.departure === departure && flight.arrival === arrival;
    });

    if (airline) {
        results = results.filter(flight => flight.airline.toLowerCase().includes(airline));
    }

    displaySearchResults(results, departure, arrival);
}

function displaySearchResults(flights, departure, arrival) {
    const resultsContainer = document.getElementById('searchResults');
    
    if (flights.length === 0) {
        resultsContainer.innerHTML = '<div class="alert alert-info">No flights found for this route.</div>';
        return;
    }

    let html = `<h3>Found ${flights.length} flight(s) from ${departure} to ${arrival}</h3>`;
    
    flights.forEach(flight => {
        html += createFlightCard(flight);
    });

    resultsContainer.innerHTML = html;
}

// Flight Tracking
function trackFlight() {
    const flightNumber = document.getElementById('flightNumber').value.toUpperCase().trim();

    if (!flightNumber) {
        showAlert('Please enter a flight number', 'error');
        return;
    }

    const flight = SAMPLE_FLIGHTS.find(f => f.number === flightNumber);

    if (!flight) {
        document.getElementById('trackingResults').innerHTML = '<div class="alert alert-info">Flight not found in our system.</div>';
        return;
    }

    let html = `<h3>Flight ${flight.number} - ${flight.airline}</h3>`;
    html += createFlightCard(flight);
    
    document.getElementById('trackingResults').innerHTML = html;
}

function createFlightCard(flight) {
    const statusClass = flight.status === 'On Time' ? 'on-time' : 
                       flight.status === 'Delayed' ? 'delayed' : 
                       flight.status === 'Boarding' ? 'boarding' : 'cancelled';

    return `
        <div class="flight-card">
            <div style="display: flex; justify-content: space-between; align-items: start;">
                <div>
                    <h3>${flight.number}</h3>
                    <p>${flight.airline}</p>
                </div>
                <span class="status ${statusClass}">${flight.status}</span>
            </div>
            <div class="flight-info">
                <div class="info-item">
                    <div class="info-label">Departure</div>
                    <div class="info-value">${flight.departure}</div>
                    <small>${flight.departureTime}</small>
                </div>
                <div class="info-item">
                    <div class="info-label">Arrival</div>
                    <div class="info-value">${flight.arrival}</div>
                    <small>${flight.arrivalTime}</small>
                </div>
                <div class="info-item">
                    <div class="info-label">Aircraft</div>
                    <div class="info-value">${flight.aircraft}</div>
                </div>
            </div>
            <div style="margin-top: 1rem;">
                <button class="btn btn-primary btn-sm" onclick="addToFavorites('${flight.number}', '${flight.airline}', '${flight.departure}', '${flight.arrival}')">Add to Favorites ⭐</button>
            </div>
        </div>
    `;
}

// Airport Information
function searchAirport() {
    const airportCode = document.getElementById('airportCode').value.toUpperCase().trim();

    if (!airportCode) {
        showAlert('Please enter an airport code', 'error');
        return;
    }

    const airport = SAMPLE_AIRPORTS[airportCode];

    if (!airport) {
        document.getElementById('airportResults').innerHTML = '<div class="alert alert-info">Airport not found in our system.</div>';
        return;
    }

    let html = `
        <div class="airport-card">
            <h3>${airport.name}</h3>
            <div class="flight-info">
                <div class="info-item">
                    <div class="info-label">IATA Code</div>
                    <div class="info-value">${airport.iata}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">ICAO Code</div>
                    <div class="info-value">${airport.icao}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">City</div>
                    <div class="info-value">${airport.city}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Country</div>
                    <div class="info-value">${airport.country}</div>
                </div>
            </div>
        </div>
    `;

    document.getElementById('airportResults').innerHTML = html;
}

// Favorites Management
function addToFavorites(flightNumber, airline, departure, arrival) {
    const currentUser = localStorage.getItem(STORAGE_CURRENT_USER);

    if (!currentUser) {
        showAlert('Please login to add favorites', 'error');
        return;
    }

    const users = JSON.parse(localStorage.getItem(STORAGE_USERS));
    const favorite = {
        flightNumber,
        airline,
        departure,
        arrival,
        addedDate: new Date().toISOString()
    };

    if (!users[currentUser].favorites) {
        users[currentUser].favorites = [];
    }

    // Check if already exists
    const exists = users[currentUser].favorites.some(fav => fav.flightNumber === flightNumber);
    
    if (exists) {
        showAlert('This flight is already in your favorites', 'info');
        return;
    }

    users[currentUser].favorites.push(favorite);
    localStorage.setItem(STORAGE_USERS, JSON.stringify(users));
    loadFavorites();
    showAlert(`Added ${flightNumber} to favorites!`, 'success');
}

function loadFavorites() {
    const currentUser = localStorage.getItem(STORAGE_CURRENT_USER);
    const favoritesList = document.getElementById('favoritesList');

    if (!currentUser) {
        favoritesList.innerHTML = '<p class="no-favorites">Please login to view your favorites</p>';
        return;
    }

    const users = JSON.parse(localStorage.getItem(STORAGE_USERS));
    const favorites = users[currentUser].favorites || [];

    if (favorites.length === 0) {
        favoritesList.innerHTML = '<p class="no-favorites">No favorite flights yet. Add some to get started!</p>';
        return;
    }

    let html = '';
    favorites.forEach((fav, index) => {
        html += `
            <div class="favorite-item">
                <div class="favorite-item-info">
                    <strong>${fav.flightNumber}</strong> - ${fav.airline}<br>
                    <small>${fav.departure} → ${fav.arrival}</small>
                </div>
                <div class="favorite-item-actions">
                    <button class="btn btn-secondary btn-sm" onclick="removeFavorite(${index})">Remove</button>
                </div>
            </div>
        `;
    });

    favoritesList.innerHTML = html;
}

function removeFavorite(index) {
    const currentUser = localStorage.getItem(STORAGE_CURRENT_USER);
    const users = JSON.parse(localStorage.getItem(STORAGE_USERS));

    users[currentUser].favorites.splice(index, 1);
    localStorage.setItem(STORAGE_USERS, JSON.stringify(users));
    loadFavorites();
    showAlert('Favorite removed', 'success');
}

// Alert System
function showAlert(message, type = 'info') {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    
    // Insert at the top of the current section
    const activeSection = document.querySelector('.section.active .container') || document.querySelector('.section.active');
    if (activeSection) {
        activeSection.insertBefore(alert, activeSection.firstChild);
    }

    // Auto-remove after 5 seconds
    setTimeout(() => alert.remove(), 5000);
}
