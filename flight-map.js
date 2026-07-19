// Flight Tracker Map - JavaScript

let map;
let flightMarkers = {};
let airportMarkers = {};
let flightPolylines = {};
let selectedFlight = null;

// Sample Flight Data (in production, this would come from a real API)
const sampleFlights = [
    {
        id: 'AA123',
        airline: 'American Airlines',
        callsign: 'AAL123',
        latitude: 40.7128,
        longitude: -74.0060,
        altitude: 35000,
        heading: 90,
        speed: 450,
        from: { code: 'JFK', name: 'New York' },
        to: { code: 'LAX', name: 'Los Angeles' },
        status: 'In Flight',
        progress: 45,
        trail: []
    },
    {
        id: 'UA456',
        airline: 'United Airlines',
        callsign: 'UAL456',
        latitude: 34.0522,
        longitude: -118.2437,
        altitude: 38000,
        heading: 270,
        speed: 480,
        from: { code: 'LAX', name: 'Los Angeles' },
        to: { code: ORD', name: 'Chicago' },
        status: 'In Flight',
        progress: 35,
        trail: []
    },
    {
        id: 'DL789',
        airline: 'Delta Airlines',
        callsign: 'DAL789',
        latitude: 41.8781,
        longitude: -87.6298,
        altitude: 32000,
        heading: 180,
        speed: 420,
        from: { code: 'ORD', name: 'Chicago' },
        to: { code: 'MIA', name: 'Miami' },
        status: 'In Flight',
        progress: 60,
        trail: []
    },
    {
        id: 'SW321',
        airline: 'Southwest Airlines',
        callsign: 'SWA321',
        latitude: 25.7617,
        longitude: -80.1918,
        altitude: 28000,
        heading: 45,
        speed: 400,
        from: { code: 'MIA', name: 'Miami' },
        to: { code: 'DEN', name: 'Denver' },
        status: 'Climbing',
        progress: 20,
        trail: []
    },
    {
        id: 'BA654',
        airline: 'British Airways',
        callsign: 'BAW654',
        latitude: 51.5074,
        longitude: -0.1278,
        altitude: 39000,
        heading: 270,
        speed: 500,
        from: { code: 'LHR', name: 'London' },
        to: { code: 'JFK', name: 'New York' },
        status: 'In Flight',
        progress: 50,
        trail: []
    }
];

// Airport Locations
const airports = [
    { code: 'JFK', name: 'John F. Kennedy', lat: 40.6413, lng: -73.7781 },
    { code: 'LAX', name: 'Los Angeles International', lat: 33.9425, lng: -118.4081 },
    { code: 'ORD', name: "Chicago O'Hare", lat: 41.9742, lng: -87.9073 },
    { code: 'MIA', name: 'Miami International', lat: 25.7959, lng: -80.2870 },
    { code: 'DEN', name: 'Denver International', lat: 39.8561, lng: -104.6737 },
    { code: 'LHR', name: 'London Heathrow', lat: 51.4700, lng: -0.4543 }
];

// Initialize Map
function initMap() {
    // Create map centered on North America
    map = L.map('map').setView([39, -98], 4);

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
        className: 'map-tiles'
    }).addTo(map);

    // Initialize airports
    drawAirports();

    // Initialize flights
    updateFlights();

    // Update flights periodically
    setInterval(updateFlights, 3000);
}

// Draw Airport Markers
function drawAirports() {
    airports.forEach(airport => {
        const marker = L.marker([airport.lat, airport.lng], {
            icon: L.divIcon({
                html: '✈️',
                className: 'airport-marker',
                iconSize: [30, 30],
                iconAnchor: [15, 15]
            })
        }).bindPopup(`<b>${airport.code}</b><br>${airport.name}`).addTo(map);

        airportMarkers[airport.code] = marker;
    });
}

// Update Flight Positions
function updateFlights() {
    showLoadingIndicator();

    // Simulate flight movement
    sampleFlights.forEach(flight => {
        // Update flight position slightly
        flight.latitude += (Math.random() - 0.5) * 0.1;
        flight.longitude += (Math.random() - 0.5) * 0.1;
        flight.altitude += (Math.random() - 0.5) * 500;
        flight.progress += Math.random() * 5;

        if (flight.progress > 95) flight.progress = 95;

        // Add to trail
        if (flight.trail.length < 50) {
            flight.trail.push([flight.latitude, flight.longitude]);
        } else {
            flight.trail.shift();
            flight.trail.push([flight.latitude, flight.longitude]);
        }

        drawFlight(flight);
    });

    updateFlightsList();
    updateStatistics();
    hideLoadingIndicator();
}

// Draw Individual Flight
function drawFlight(flight) {
    // Remove existing marker if present
    if (flightMarkers[flight.id]) {
        map.removeLayer(flightMarkers[flight.id]);
    }

    // Create rotated aircraft icon
    const rotation = flight.heading;
    const marker = L.marker([flight.latitude, flight.longitude], {
        icon: L.divIcon({
            html: `<div style="transform: rotate(${rotation}deg); font-size: 24px;">✈️</div>`,
            className: 'aircraft-marker',
            iconSize: [30, 30],
            iconAnchor: [15, 15]
        }),
        title: flight.id
    }).bindPopup(`
        <b>${flight.id}</b> - ${flight.airline}<br>
        Altitude: ${flight.altitude.toLocaleString()} ft<br>
        Speed: ${flight.speed} knots<br>
        Status: ${flight.status}
    `).on('click', () => showFlightDetails(flight)).addTo(map);

    flightMarkers[flight.id] = marker;

    // Draw flight trail if enabled
    if (document.getElementById('filterTrails').checked && flight.trail.length > 1) {
        if (flightPolylines[flight.id]) {
            map.removeLayer(flightPolylines[flight.id]);
        }

        const polyline = L.polyline(flight.trail, {
            color: '#00d4ff',
            weight: 2,
            opacity: 0.6,
            dashArray: '5, 5'
        }).addTo(map);

        flightPolylines[flight.id] = polyline;
    }
}

// Update Flights List
function updateFlightsList() {
    const flightsList = document.getElementById('flightsList');
    
    let html = '';
    sampleFlights.forEach(flight => {
        const isSelected = selectedFlight && selectedFlight.id === flight.id;
        html += `
            <div class="flight-item ${isSelected ? 'active' : ''}" onclick="selectFlight('${flight.id}')">
                <div class="flight-number">${flight.id}</div>
                <div class="flight-airline">${flight.airline}</div>
                <div class="flight-route">${flight.from.code} → ${flight.to.code}</div>
                <div class="flight-altitude">Alt: ${flight.altitude.toLocaleString()} ft</div>
            </div>
        `;
    });

    flightsList.innerHTML = html;
}

// Update Statistics
function updateStatistics() {
    document.getElementById('statsFlights').textContent = sampleFlights.length;
    
    let totalAircraft = sampleFlights.length;
    document.getElementById('statsAircraft').textContent = totalAircraft;

    const avgAltitude = Math.round(
        sampleFlights.reduce((sum, f) => sum + f.altitude, 0) / sampleFlights.length
    );
    document.getElementById('statsAltitude').textContent = avgAltitude.toLocaleString() + ' ft';
}

// Select Flight from List
function selectFlight(flightId) {
    const flight = sampleFlights.find(f => f.id === flightId);
    if (flight) {
        selectedFlight = flight;
        showFlightDetails(flight);
        updateFlightsList();
        
        // Center map on selected flight
        map.setView([flight.latitude, flight.longitude], 6);
    }
}

// Show Flight Details Panel
function showFlightDetails(flight) {
    selectedFlight = flight;
    const detailsPanel = document.getElementById('detailsPanel');
    const detailsContent = document.getElementById('detailsContent');

    const progressPercentage = flight.progress;
    const distanceRemaining = Math.round(progressPercentage / 100 * 2500); // Estimate

    detailsContent.innerHTML = `
        <h2>${flight.id}</h2>
        <div class="detail-item">
            <div class="detail-label">Airline</div>
            <div class="detail-value">${flight.airline}</div>
        </div>
        <div class="detail-item">
            <div class="detail-label">Callsign</div>
            <div class="detail-value">${flight.callsign}</div>
        </div>
        <div class="detail-item">
            <div class="detail-label">Route</div>
            <div class="detail-value">${flight.from.code} → ${flight.to.code}</div>
        </div>
        <div class="detail-item">
            <div class="detail-label">Current Altitude</div>
            <div class="detail-value">${flight.altitude.toLocaleString()} ft</div>
        </div>
        <div class="detail-item">
            <div class="detail-label">Speed</div>
            <div class="detail-value">${flight.speed} knots</div>
        </div>
        <div class="detail-item">
            <div class="detail-label">Heading</div>
            <div class="detail-value">${flight.heading}°</div>
        </div>
        <div class="detail-item">
            <div class="detail-label">Status</div>
            <div class="detail-value">${flight.status}</div>
        </div>
        <div class="detail-item">
            <div class="detail-label">Progress</div>
            <div class="detail-value">
                <div style="background: rgba(0, 212, 255, 0.2); height: 10px; border-radius: 5px; overflow: hidden;">
                    <div style="background: #00d4ff; height: 100%; width: ${flight.progress}%;"></div>
                </div>
                ${Math.round(flight.progress)}% Complete
            </div>
        </div>
    `;

    detailsPanel.classList.remove('hidden');
}

// Close Details Panel
function closeDetailsPanel() {
    document.getElementById('detailsPanel').classList.add('hidden');
    selectedFlight = null;
    updateFlightsList();
}

// Search Flight
function searchFlight() {
    const searchTerm = document.getElementById('flightSearch').value.toUpperCase();
    const flight = sampleFlights.find(f => f.id === searchTerm);

    if (flight) {
        selectFlight(flight.id);
    } else {
        alert('Flight not found');
    }
}

// Handle Enter Key in Search
function handleSearchEnter(event) {
    if (event.key === 'Enter') {
        searchFlight();
    }
}

// Apply Filters
function applyFilters() {
    const showAircraft = document.getElementById('filterAircraft').checked;
    const showAirports = document.getElementById('filterAirports').checked;
    const showTrails = document.getElementById('filterTrails').checked;

    // Toggle aircraft markers
    Object.values(flightMarkers).forEach(marker => {
        if (showAircraft) {
            marker.addTo(map);
        } else {
            map.removeLayer(marker);
        }
    });

    // Toggle airport markers
    Object.values(airportMarkers).forEach(marker => {
        if (showAirports) {
            marker.addTo(map);
        } else {
            map.removeLayer(marker);
        }
    });

    // Toggle flight trails
    if (!showTrails) {
        Object.values(flightPolylines).forEach(polyline => {
            map.removeLayer(polyline);
        });
    }
}

// Map Controls
function zoomIn() {
    map.zoomIn();
}

function zoomOut() {
    map.zoomOut();
}

function centerMap() {
    map.setView([39, -98], 4);
}

function toggleFullscreen() {
    const mapContainer = document.getElementById('map');
    if (mapContainer.requestFullscreen) {
        mapContainer.requestFullscreen();
    }
}

// Toggle Sidebar
function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    sidebar.classList.toggle('collapsed');
}

// Loading Indicator
function showLoadingIndicator() {
    document.getElementById('loadingIndicator').classList.remove('hidden');
}

function hideLoadingIndicator() {
    document.getElementById('loadingIndicator').classList.add('hidden');
}

// Initialize map when DOM is loaded
document.addEventListener('DOMContentLoaded', initMap);
