// Game state
const gameState = {
    airline: {
        name: "Your Airline",
        code: "YA",
        hub: "LHR",
        primaryColor: "#0066CC",
        secondaryColor: "#FFFFFF",
        cash: 100000000, // $100M starting cash
        revenue: 5000000, // Starting with $5M in revenue
        founded: false
    },
    fleet: [
        {
            id: "A320-1",
            type: "A320",
            registration: "",
            inService: false,
            location: "",
            crew: {
                pilot: null,
                copilot: null,
                cabinCrew: 0
            },
            status: "Idle",
            range: 3300, // km
            capacity: 180,
            purchasePrice: 90000000,
            operatingCost: 4500 // per hour
        },
        {
            id: "A330-1",
            type: "A330-300",
            registration: "",
            inService: false,
            location: "",
            crew: {
                pilot: null,
                copilot: null,
                cabinCrew: 0
            },
            status: "Idle",
            range: 11300, // km
            capacity: 300,
            purchasePrice: 235000000,
            operatingCost: 8200 // per hour
        },
        {
            id: "B777-1",
            type: "B777-300ER",
            registration: "",
            inService: false,
            location: "",
            crew: {
                pilot: null,
                copilot: null,
                cabinCrew: 0
            },
            status: "Idle",
            range: 14600, // km
            capacity: 396,
            purchasePrice: 320000000,
            operatingCost: 9800 // per hour
        }
    ],
    staff: {
        pilots: [],
        copilots: [],
        cabinCrew: 0
    },
    market: [
        {
            type: "A320neo",
            available: 5,
            price: 110000000,
            range: 3500,
            capacity: 180
        },
        {
            type: "B737-800",
            available: 3,
            price: 95000000,
            range: 3000,
            capacity: 189
        },
        {
            type: "A350-900",
            available: 2,
            price: 317000000,
            range: 15000,
            capacity: 325
        }
    ],
    activeFlights: [],
    flights: []
};

// Airports data
const airports = {
    LHR: { name: "London Heathrow", code: "LHR", lat: 51.4700, lon: -0.4543 },
    JFK: { name: "New York JFK", code: "JFK", lat: 40.6413, lon: -73.7781 },
    LAX: { name: "Los Angeles", code: "LAX", lat: 33.9416, lon: -118.4085 },
    DXB: { name: "Dubai", code: "DXB", lat: 25.2532, lon: 55.3657 },
    SIN: { name: "Singapore Changi", code: "SIN", lat: 1.3644, lon: 103.9915 }
};

// Add a game time system
const gameTime = {
    day: 1,
    month: 1,
    year: 2023,
    speed: 1, // 1 = normal, 2 = fast, 3 = super fast
    paused: false,
    lastUpdate: Date.now()
};

// Add financial tracking
const financials = {
    dailyRevenue: 0,
    dailyExpenses: 0,
    totalRevenue: 5000000, // Initialize with $5M
    totalExpenses: 0,
    monthlyStats: [],
    yearlyStats: []
};

// Add passenger satisfaction metrics
const passengerMetrics = {
    overall: 85, // 0-100 scale
    comfort: 80,
    punctuality: 90,
    service: 85,
    history: []
};

// Add route system
const routes = [];

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', initGame);

// DOM elements
const gameContent = document.getElementById('game-content');
const navButtons = document.querySelectorAll('.nav-button');
const airlineName = document.getElementById('airline-name');
const airlineCash = document.getElementById('airline-cash');

// Initialize the game
function initGame() {
    expandGameState();
    loadGameState();
    expandAircraftMarket();
    expandAirports();
    updateMarketWithImages();
    ensureAircraftImages();
    fixImageReferences(); // Add this line to fix image references
    
    // Initialize staff if none exist
    if (gameState.staff.pilots.length === 0) {
        hireStaff();
    }
    
    setupEventListeners();
    setupGameClock();
    
    if (!gameState.airline.founded) {
        showSetupScreen();
    } else {
        showFleetScreen();
    }
}

// Setup event listeners
function setupEventListeners() {
    // Remove any existing custom buttons first
    const existingButtons = document.querySelectorAll('#nav-dashboard, #nav-routes, #nav-flights');
    existingButtons.forEach(btn => btn.remove());
    
    document.getElementById('nav-setup').addEventListener('click', () => {
        if (gameState.airline.founded) {
            showAirlineInfoScreen();
        } else {
            showSetupScreen();
        }
    });
    
    document.getElementById('nav-fleet').addEventListener('click', showFleetScreen);
    document.getElementById('nav-map').addEventListener('click', showMapScreen);
    document.getElementById('nav-market').addEventListener('click', showMarketScreen);
    
    // Add dashboard, routes and flights buttons to navigation
    const nav = document.querySelector('nav');
    
    const dashboardBtn = document.createElement('button');
    dashboardBtn.id = 'nav-dashboard';
    dashboardBtn.className = 'nav-button';
    dashboardBtn.textContent = 'Dashboard';
    dashboardBtn.addEventListener('click', showDashboardScreen);
    
    const routesBtn = document.createElement('button');
    routesBtn.id = 'nav-routes';
    routesBtn.className = 'nav-button';
    routesBtn.textContent = 'Routes';
    routesBtn.addEventListener('click', showRouteScreen);
    
    const flightsBtn = document.createElement('button');
    flightsBtn.id = 'nav-flights';
    flightsBtn.className = 'nav-button';
    flightsBtn.textContent = 'Flights';
    flightsBtn.addEventListener('click', showFlightsScreen);
    
    // Insert buttons in order
    const fleetBtn = document.getElementById('nav-fleet');
    nav.insertBefore(dashboardBtn, fleetBtn.nextSibling);
    nav.insertBefore(routesBtn, dashboardBtn.nextSibling);
    nav.insertBefore(flightsBtn, routesBtn.nextSibling);
}

// Load game state from localStorage
function loadGameState() {
    const savedState = localStorage.getItem('airlineGame');
    if (savedState) {
        Object.assign(gameState, JSON.parse(savedState));
        updateHeader();
    }
}

// Save game state to localStorage
function saveGameState() {
    localStorage.setItem('airlineGame', JSON.stringify(gameState));
    updateHeader();
}

// Update header information
function updateHeader() {
    airlineName.textContent = gameState.airline.name;
    airlineCash.textContent = formatMoney(gameState.airline.cash);
}

// Format money values
function formatMoney(amount) {
    return '$' + amount.toLocaleString();
}

// Set active navigation button
function setActiveNavButton(buttonId) {
    navButtons.forEach(button => button.classList.remove('active'));
    document.getElementById(buttonId).classList.add('active');
}

// Show airline setup screen
function showSetupScreen() {
    setActiveNavButton('nav-setup');
    const template = document.getElementById('setup-template');
    const content = template.content.cloneNode(true);
    gameContent.innerHTML = '';
    gameContent.appendChild(content);

    // Add event listener to save button
    document.getElementById('save-airline-btn').addEventListener('click', saveAirlineSetup);
}

// Save airline setup
function saveAirlineSetup() {
    const nameInput = document.getElementById('airline-name-input');
    const codeInput = document.getElementById('airline-code-input');
    const hubSelect = document.getElementById('hub-select');
    
    if (!nameInput.value || !codeInput.value) {
        alert('Please enter both airline name and code');
        return;
    }

    gameState.airline.name = nameInput.value;
    gameState.airline.code = codeInput.value.toUpperCase();
    gameState.airline.hub = hubSelect.value;
    gameState.airline.founded = true;

    // Set initial aircraft registrations
    gameState.fleet.forEach((aircraft, index) => {
        aircraft.registration = `${gameState.airline.code}${index + 100}`;
        aircraft.location = gameState.airline.hub;
    });

    generateInitialStaff();
    saveGameState();
    showFleetScreen();
}

// Generate initial staff
function generateInitialStaff() {
    // Generate pilots
    for (let i = 0; i < 5; i++) {
        gameState.staff.pilots.push({
            id: `P${i + 1}`,
            name: generateRandomName(),
            experience: Math.floor(Math.random() * 15) + 5,
            salary: 120000 + Math.floor(Math.random() * 50000),
            assigned: false
        });
    }

    // Generate co-pilots
    for (let i = 0; i < 5; i++) {
        gameState.staff.copilots.push({
            id: `CP${i + 1}`,
            name: generateRandomName(),
            experience: Math.floor(Math.random() * 8) + 2,
            salary: 70000 + Math.floor(Math.random() * 30000),
            assigned: false
        });
    }

    gameState.staff.cabinCrew = 20; // Initial cabin crew pool
}

// Generate random name
function generateRandomName() {
    const firstNames = ["James", "John", "Robert", "Michael", "William", "David", "Richard", "Joseph", "Thomas", "Charles"];
    const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez"];
    
    return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
}

// Show fleet management screen
function showFleetScreen() {
    if (!gameState.airline.founded) {
        showSetupScreen();
        return;
    }

    setActiveNavButton('nav-fleet');
    const template = document.getElementById('fleet-template');
    const content = template.content.cloneNode(true);
    gameContent.innerHTML = '';
    gameContent.appendChild(content);

    // Add hire staff button
    const fleetHeader = document.createElement('div');
    fleetHeader.className = 'fleet-header';
    fleetHeader.innerHTML = `
        <h2>Fleet Management</h2>
        <div class="staff-info">
            <p>Available Staff: ${gameState.staff.pilots.length} Pilots, ${gameState.staff.copilots.length} Co-Pilots, ${gameState.staff.cabinCrew} Cabin Crew</p>
            <button id="hire-staff-btn">Hire Staff</button>
        </div>
    `;
    
    // Insert at the beginning of the fleet screen
    const fleetScreen = document.getElementById('fleet-screen');
    fleetScreen.insertBefore(fleetHeader, fleetScreen.firstChild);
    
    // Add event listener to hire staff button
    document.getElementById('hire-staff-btn').addEventListener('click', hireStaff);

    // Display fleet
    const fleetList = document.getElementById('fleet-list');
    gameState.fleet.forEach((aircraft, index) => {
        const card = createAircraftCard(aircraft);
        card.style.setProperty('--i', index); // For staggered animation
        fleetList.appendChild(card);
    });
}

// Create aircraft card
function createAircraftCard(aircraft) {
    const card = document.createElement('div');
    card.className = 'aircraft-card';
    card.dataset.id = aircraft.id;

    // Use custom image if available, otherwise use base image
    const imagePath = aircraft.customImage || aircraft.baseImage || 'images/generic_aircraft.jpg';

    card.innerHTML = `
        <div class="aircraft-image">
            <img src="${imagePath}" alt="${aircraft.type}" />
        </div>
        <h3>${aircraft.type} (${aircraft.registration})</h3>
        <p>Status: ${aircraft.status}</p>
        <p>Location: ${aircraft.location}</p>
        <p>Crew: ${aircraft.crew.pilot ? 'Assigned' : 'Not Assigned'}</p>
    `;

    card.addEventListener('click', () => showAircraftDetails(aircraft.id));
    return card;
}

// Show aircraft details
function showAircraftDetails(aircraftId) {
    const aircraft = gameState.fleet.find(a => a.id === aircraftId);
    if (!aircraft) return;
    
    // Mark the selected aircraft card
    document.querySelectorAll('.aircraft-card').forEach(card => {
        card.classList.remove('selected');
        if (card.dataset.id === aircraftId) {
            card.classList.add('selected');
        }
    });
    
    const detailsContainer = document.getElementById('selected-aircraft-info');
    const crewAssignment = document.getElementById('crew-assignment');
    
    // Show aircraft details including revenue if in service
    detailsContainer.innerHTML = `
        <h3>${aircraft.type} (${aircraft.registration})</h3>
        <p><strong>Status:</strong> ${aircraft.status}</p>
        <p><strong>Location:</strong> ${aircraft.location || 'Not assigned'}</p>
        <p><strong>Range:</strong> ${aircraft.range.toLocaleString()} km</p>
        <p><strong>Capacity:</strong> ${aircraft.capacity} passengers</p>
        <p><strong>Operating Cost:</strong> ${formatMoney(aircraft.operatingCost)} per hour</p>
        ${aircraft.inService ? `<p><strong>Daily Revenue:</strong> ${formatMoney(aircraft.dailyRevenue)}</p>` : ''}
        <p><strong>Crew:</strong></p>
        <ul>
            <li>Pilot: ${aircraft.crew.pilot ? gameState.staff.pilots.find(p => p.id === aircraft.crew.pilot)?.name || 'Unknown' : 'Not assigned'}</li>
            <li>Co-Pilot: ${aircraft.crew.copilot ? gameState.staff.copilots.find(p => p.id === aircraft.crew.copilot)?.name || 'Unknown' : 'Not assigned'}</li>
            <li>Cabin Crew: ${aircraft.crew.cabinCrew} members</li>
        </ul>
        <button id="toggle-service-btn">${aircraft.inService ? 'Take Out of Service' : 'Put Into Service'}</button>
    `;
    
    // Show crew assignment section
    crewAssignment.classList.remove('hidden');
    
    // Populate crew selection dropdowns
    populateCrewSelects(aircraft);
    
    // Set current cabin crew count
    document.getElementById('cabin-crew-count').value = aircraft.crew.cabinCrew;
    
    // Add event listeners
    document.getElementById('toggle-service-btn').addEventListener('click', () => {
        toggleAircraftService(aircraftId);
    });
    
    document.getElementById('assign-crew-btn').addEventListener('click', () => {
        assignCrew(aircraftId);
    });
}

// Populate crew selection dropdowns
function populateCrewSelects(aircraft) {
    const pilotSelect = document.getElementById('pilot-select');
    const copilotSelect = document.getElementById('copilot-select');
    
    // Clear existing options
    pilotSelect.innerHTML = '<option value="">Select Pilot</option>';
    copilotSelect.innerHTML = '<option value="">Select Co-Pilot</option>';
    
    // Add pilots
    gameState.staff.pilots.forEach(pilot => {
        const option = document.createElement('option');
        option.value = pilot.id;
        option.textContent = `${pilot.name} (Experience: ${pilot.experience} years, Rating: ${pilot.rating})`;
        
        // Check if this pilot is already assigned to this aircraft
        if (aircraft.crew.pilot === pilot.id) {
            option.selected = true;
        }
        
        // Check if this pilot is already assigned to another aircraft
        const isAssigned = gameState.fleet.some(a => 
            a.id !== aircraft.id && a.crew.pilot === pilot.id
        );
        
        if (isAssigned) {
            option.disabled = true;
            option.textContent += ' (Assigned to another aircraft)';
        }
        
        pilotSelect.appendChild(option);
    });
    
    // Add co-pilots
    gameState.staff.copilots.forEach(copilot => {
        const option = document.createElement('option');
        option.value = copilot.id;
        option.textContent = `${copilot.name} (Experience: ${copilot.experience} years, Rating: ${copilot.rating})`;
        
        // Check if this copilot is already assigned to this aircraft
        if (aircraft.crew.copilot === copilot.id) {
            option.selected = true;
        }
        
        // Check if this copilot is already assigned to another aircraft
        const isAssigned = gameState.fleet.some(a => 
            a.id !== aircraft.id && a.crew.copilot === copilot.id
        );
        
        if (isAssigned) {
            option.disabled = true;
            option.textContent += ' (Assigned to another aircraft)';
        }
        
        copilotSelect.appendChild(option);
    });
}

// Toggle aircraft service status
function toggleAircraftService(aircraftId) {
    const aircraft = gameState.fleet.find(a => a.id === aircraftId);
    if (!aircraft) return;

    // Check if aircraft has crew assigned before putting into service
    if (!aircraft.inService && (!aircraft.crew.pilot || !aircraft.crew.copilot || aircraft.crew.cabinCrew < 3)) {
        alert('You need to assign a complete crew (pilot, co-pilot, and at least 3 cabin crew members) before putting the aircraft in service.');
        return;
    }

    // Toggle service status
    aircraft.inService = !aircraft.inService;
    
    if (aircraft.inService) {
        // Aircraft is now in service
        aircraft.status = 'In Service';
        aircraft.location = gameState.airline.hub; // Set initial location to hub
        
        // Calculate daily revenue for this aircraft (simplified calculation)
        const dailyRevenuePerSeat = 500; // $500 per seat per day
        const loadFactor = 0.85; // 85% of seats filled on average
        const dailyRevenue = aircraft.capacity * dailyRevenuePerSeat * loadFactor;
        
        // Store revenue potential in the aircraft object
        aircraft.dailyRevenue = dailyRevenue;
        
        alert(`${aircraft.type} (${aircraft.registration}) is now in service and will generate approximately ${formatMoney(dailyRevenue)} per day.`);
    } else {
        // Aircraft is taken out of service
        aircraft.status = 'Idle';
        aircraft.dailyRevenue = 0; // No revenue when not in service
        
        alert(`${aircraft.type} (${aircraft.registration}) has been taken out of service and will no longer generate revenue.`);
    }
    
    saveGameState();
    showFleetScreen();
}

// Add this variable to store the map instance
let worldMap = null;

// Add this variable to store active flight markers
let flightMarkers = [];

// Update the showMapScreen function to include animated flights
function showMapScreen() {
    if (!gameState.airline.founded) {
        showSetupScreen();
        return;
    }
    
    setActiveNavButton('nav-map');
    
    gameContent.innerHTML = `
        <div id="map-screen">
            <div class="map-header">
                <h2>Route Network</h2>
                <div class="map-controls">
                    <button id="show-all-routes">Show All Routes</button>
                    <button id="show-active-routes">Show Active Routes</button>
                    <button id="show-flights">Show Live Flights</button>
                    <button id="create-test-flight">Create Test Flight</button>
                </div>
            </div>
            <div id="world-map"></div>
            <div id="flight-legend" class="map-legend">
                <div class="legend-item">
                    <span class="legend-icon">🛫</span> Airport
                </div>
                <div class="legend-item">
                    <span class="legend-line active-route"></span> Active Route
                </div>
                <div class="legend-item">
                    <span class="legend-icon">✈️</span> Aircraft in Flight
                </div>
            </div>
        </div>
    `;
    
    // Clear any existing flight markers
    flightMarkers = [];
    
    // Check if Leaflet is available
    if (typeof L !== 'undefined') {
        // Initialize the map
        const worldMap = L.map('world-map').setView([30, 0], 2);
        
        // Add the base map layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 18
        }).addTo(worldMap);
        
        // Add airport markers
        Object.values(airports).forEach(airport => {
            const marker = L.marker([airport.lat, airport.lon], {
                icon: L.divIcon({
                    className: 'airport-marker',
                    html: `<span class="airport-icon">🛫</span>`,
                    iconSize: [24, 24]
                })
            }).addTo(worldMap);
            
            // Add popup with airport info
            marker.bindPopup(`
                <div class="airport-popup">
                    <h3>${airport.name}</h3>
                    <p>Code: ${airport.code}</p>
                    ${airport.code === gameState.airline.hub ? '<p class="hub-label">Hub Airport</p>' : ''}
                    <button onclick="showRouteOptions('${airport.code}')">Create Route</button>
                </div>
            `);
        });
        
        // Draw routes if they exist
        if (routes && routes.length > 0) {
            routes.filter(r => r.active).forEach(route => {
                const origin = airports[route.origin];
                const destination = airports[route.destination];
                
                if (origin && destination) {
                    // Create route line
                    const routeLine = L.polyline(
                        [[origin.lat, origin.lon], [destination.lat, destination.lon]],
                        {
                            color: '#2ecc71',
                            weight: 3,
                            opacity: 0.7,
                            dashArray: '5, 10'
                        }
                    ).addTo(worldMap);
                    
                    // Add route info popup
                    routeLine.bindPopup(`
                        <div class="route-popup">
                            <h3>${route.flightNumber}</h3>
                            <p>${route.origin} → ${route.destination}</p>
                            <p>Distance: ${route.distance.toLocaleString()} km</p>
                            <p>Aircraft: ${getAircraftInfo(route.aircraftId)}</p>
                            <button onclick="scheduleFlightForRoute('${route.id}')">Schedule Flight</button>
                        </div>
                    `);
                }
            });
        }
        
        // Draw active flights
        if (gameState.flights) {
            const activeFlights = gameState.flights.filter(f => f.status === 'In Air');
            
            activeFlights.forEach(flight => {
                addFlightToMap(flight, worldMap);
            });
            
            // Set up animation interval for flight markers
            if (activeFlights.length > 0) {
                setInterval(() => updateFlightPositions(worldMap), 5000);
            }
        }
        
        // Add event listeners for controls
        document.getElementById('show-all-routes').addEventListener('click', () => {
            showAllRoutes(worldMap);
        });
        
        document.getElementById('show-active-routes').addEventListener('click', () => {
            showActiveRoutes(worldMap);
        });
        
        document.getElementById('show-flights').addEventListener('click', () => {
            showLiveFlights(worldMap);
        });
    } else {
        // Fallback if Leaflet is not available
        document.getElementById('world-map').innerHTML = `
            <div class="map-placeholder">
                <p>Map loading failed. Please make sure Leaflet.js is properly loaded.</p>
                <p>Add the following to your HTML head:</p>
                <pre>
&lt;link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" /&gt;
&lt;script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"&gt;&lt;/script&gt;
                </pre>
            </div>
        `;
    }
    
    // Add event listener for test flight button
    document.getElementById('create-test-flight').addEventListener('click', () => {
        if (createTestFlights()) {
            showLiveFlights(worldMap);
            alert('Test flight created! You can now see it on the map.');
        } else {
            alert('Could not create test flight. Make sure you have active routes.');
        }
    });
}

// Function to add a flight to the map
function addFlightToMap(flight, map) {
    const route = routes.find(r => r.id === flight.routeId);
    if (!route) return;
    
    const origin = airports[route.origin];
    const destination = airports[route.destination];
    
    if (!origin || !destination) return;
    
    // Calculate current position
    const progress = calculateFlightProgress(flight);
    const currentPos = calculateIntermediatePosition(
        origin.lat, origin.lon,
        destination.lat, destination.lon,
        progress
    );
    
    // Calculate rotation angle for the aircraft icon
    const angle = calculateBearing(origin.lat, origin.lon, destination.lat, destination.lon);
    
    // Create aircraft icon with rotation
    const planeIcon = L.divIcon({
        className: 'flight-marker',
        html: `<div class="plane-icon" style="transform: rotate(${angle}deg)">✈️</div>`,
        iconSize: [24, 24]
    });
    
    // Add marker
    const marker = L.marker([currentPos.lat, currentPos.lon], {
        icon: planeIcon
    }).addTo(map);
    
    // Add popup
    marker.bindPopup(`
        <div class="flight-popup">
            <h3>Flight ${flight.flightNumber}</h3>
            <p>${route.origin} → ${route.destination}</p>
            <p>Aircraft: ${getAircraftInfo(route.aircraftId)}</p>
            <p>Progress: ${Math.round(progress * 100)}%</p>
            <p>ETA: ${formatDateTime(flight.arrivalTime)}</p>
        </div>
    `);
    
    // Store marker with flight info for animation
    flightMarkers.push({
        marker: marker,
        flight: flight,
        route: route,
        origin: origin,
        destination: destination
    });
}

// Function to update flight positions
function updateFlightPositions(map) {
    flightMarkers.forEach(item => {
        // Calculate new position
        const progress = calculateFlightProgress(item.flight);
        const newPos = calculateIntermediatePosition(
            item.origin.lat, item.origin.lon,
            item.destination.lat, item.destination.lon,
            progress
        );
        
        // Update marker position
        item.marker.setLatLng([newPos.lat, newPos.lon]);
        
        // Update popup content
        item.marker.getPopup().setContent(`
            <div class="flight-popup">
                <h3>Flight ${item.flight.flightNumber}</h3>
                <p>${item.route.origin} → ${item.route.destination}</p>
                <p>Aircraft: ${getAircraftInfo(item.route.aircraftId)}</p>
                <p>Progress: ${Math.round(progress * 100)}%</p>
                <p>ETA: ${formatDateTime(item.flight.arrivalTime)}</p>
            </div>
        `);
    });
}

// Helper function to calculate bearing between two points
function calculateBearing(lat1, lon1, lat2, lon2) {
    const toRad = value => value * Math.PI / 180;
    const toDeg = value => value * 180 / Math.PI;
    
    const startLat = toRad(lat1);
    const startLng = toRad(lon1);
    const destLat = toRad(lat2);
    const destLng = toRad(lon2);
    
    const y = Math.sin(destLng - startLng) * Math.cos(destLat);
    const x = Math.cos(startLat) * Math.sin(destLat) -
              Math.sin(startLat) * Math.cos(destLat) * Math.cos(destLng - startLng);
    let brng = Math.atan2(y, x);
    brng = toDeg(brng);
    
    return (brng + 360) % 360;
}

// Helper function to get aircraft info
function getAircraftInfo(aircraftId) {
    const aircraft = gameState.fleet.find(a => a.id === aircraftId);
    return aircraft ? `${aircraft.type} (${aircraft.registration})` : 'Unknown';
}

// Function to schedule a flight for a specific route
function scheduleFlightForRoute(routeId) {
    // Create a modal for flight scheduling
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    
    const route = routes.find(r => r.id === routeId);
    if (!route) return;
    
    const aircraft = gameState.fleet.find(a => a.id === route.aircraftId);
    if (!aircraft) return;
    
    modal.innerHTML = `
        <div class="schedule-flight-modal">
            <h2>Schedule Flight ${route.flightNumber}</h2>
            
            <div class="route-info">
                <h4>Route Information</h4>
                <p><strong>Origin:</strong> ${airports[route.origin].name} (${route.origin})</p>
                <p><strong>Destination:</strong> ${airports[route.destination].name} (${route.destination})</p>
                <p><strong>Aircraft:</strong> ${aircraft.type} (${aircraft.registration})</p>
                <p><strong>Flight Time:</strong> ${route.flightTime.toFixed(1)} hours</p>
            </div>
            
            <div class="form-group">
                <label for="flight-date">Departure Date:</label>
                <input type="date" id="flight-date" min="${formatDateForInput(new Date())}">
            </div>
            
            <div class="form-group">
                <label for="flight-time">Departure Time:</label>
                <input type="time" id="flight-time">
            </div>
            
            <div class="modal-buttons">
                <button id="schedule-route-btn">Schedule Flight</button>
                <button id="cancel-modal-btn">Cancel</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Set default date and time
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    document.getElementById('flight-date').value = formatDateForInput(tomorrow);
    document.getElementById('flight-time').value = '08:00';
    
    // Add event listeners
    document.getElementById('schedule-route-btn').addEventListener('click', () => {
        const dateStr = document.getElementById('flight-date').value;
        const timeStr = document.getElementById('flight-time').value;
        
        if (!dateStr || !timeStr) {
            alert('Please specify departure date and time.');
            return;
        }
        
        // Create departure time
        const departureTime = new Date(`${dateStr}T${timeStr}`);
        
        // Create flight
        const result = createFlight(routeId, departureTime);
        
        if (result.success) {
            alert(`Flight ${result.flight.flightNumber} scheduled successfully!`);
            document.body.removeChild(modal);
        } else {
            alert(`Failed to schedule flight: ${result.message}`);
        }
    });
    
    document.getElementById('cancel-modal-btn').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
}

// Function to draw routes on the map
function drawRoutes(filter = 'active') {
    // Clear existing route lines
    worldMap.eachLayer((layer) => {
        if (layer instanceof L.Polyline && !(layer instanceof L.TileLayer)) {
            worldMap.removeLayer(layer);
        }
    });

    // Filter routes based on parameter
    const routesToDraw = filter === 'all' ? routes : routes.filter(r => r.active);

    routesToDraw.forEach(route => {
        const origin = airports[route.origin];
        const destination = airports[route.destination];
        
        if (origin && destination) {
            // Create route line
            const routeLine = L.polyline(
                [[origin.lat, origin.lon], [destination.lat, destination.lon]],
                {
                    color: route.active ? '#2ecc71' : '#95a5a6',
                    weight: 2,
                    opacity: 0.8,
                    dashArray: route.active ? null : '5, 10'
                }
            ).addTo(worldMap);

            // Add route info popup
            routeLine.bindPopup(`
                <div class="route-popup">
                    <h3>${route.flightNumber}</h3>
                    <p>${route.origin} → ${route.destination}</p>
                    <p>Distance: ${route.distance.toLocaleString()} km</p>
                    <p>Status: ${route.active ? 'Active' : 'Inactive'}</p>
                </div>
            `);
        }
    });
}

// Function to draw active flights
function drawActiveFlights() {
    const currentFlights = gameState.flights.filter(f => f.status === 'In Air');
    
    currentFlights.forEach(flight => {
        const route = routes.find(r => r.id === flight.routeId);
        if (!route) return;

        const origin = airports[route.origin];
        const destination = airports[route.destination];
        
        if (origin && destination) {
            // Calculate current position based on flight progress
            const progress = calculateFlightProgress(flight);
            const currentPos = calculateIntermediatePosition(
                origin.lat, origin.lon,
                destination.lat, destination.lon,
                progress
            );

            // Add aircraft marker
            L.marker([currentPos.lat, currentPos.lon], {
                icon: L.divIcon({
                    className: 'flight-marker',
                    html: '✈️',
                    iconSize: [20, 20]
                })
            }).addTo(worldMap)
            .bindPopup(`
                <div class="flight-popup">
                    <h3>Flight ${flight.flightNumber}</h3>
                    <p>${route.origin} → ${route.destination}</p>
                    <p>Progress: ${Math.round(progress * 100)}%</p>
                </div>
            `);
        }
    });
}

// Helper function to calculate flight progress
function calculateFlightProgress(flight) {
    const now = new Date();
    const departure = new Date(flight.departureTime);
    const arrival = new Date(flight.arrivalTime);
    const total = arrival - departure;
    const elapsed = now - departure;
    return Math.min(Math.max(elapsed / total, 0), 1);
}

// Helper function to calculate intermediate position
function calculateIntermediatePosition(lat1, lon1, lat2, lon2, progress) {
    return {
        lat: lat1 + (lat2 - lat1) * progress,
        lon: lon1 + (lon2 - lon1) * progress
    };
}

// Helper function to check if airport is hub
function isHub(code) {
    return code === gameState.airline.hub;
}

// Function to show route options when clicking on an airport
function showRouteOptions(originCode) {
    // Create a modal for route creation
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    
    // Get available aircraft for routes
    const availableAircraft = gameState.fleet.filter(a => a.inService);
    
    if (availableAircraft.length === 0) {
        alert('You need aircraft in service to create routes.');
        return;
    }
    
    // Get destination options (excluding the origin)
    const destinations = Object.values(airports).filter(a => a.code !== originCode);
    
    modal.innerHTML = `
        <div class="route-modal">
            <h2>Create New Route from ${airports[originCode].name}</h2>
            
            <div class="form-group">
                <label for="destination-select">Destination:</label>
                <select id="destination-select">
                    <option value="">-- Select Destination --</option>
                    ${destinations.map(airport => 
                        `<option value="${airport.code}">${airport.name} (${airport.code})</option>`
                    ).join('')}
                </select>
            </div>
            
            <div class="form-group">
                <label for="aircraft-select">Aircraft:</label>
                <select id="aircraft-select">
                    <option value="">-- Select Aircraft --</option>
                    ${availableAircraft.map(aircraft => 
                        `<option value="${aircraft.id}">${aircraft.type} (${aircraft.registration})</option>`
                    ).join('')}
                </select>
            </div>
            
            <div class="form-group">
                <label for="flight-number">Flight Number:</label>
                <input type="text" id="flight-number" placeholder="e.g. ${gameState.airline.code}123" value="${gameState.airline.code}${Math.floor(Math.random() * 900) + 100}">
            </div>
            
            <div id="route-preview" class="hidden">
                <!-- Route preview will be shown here -->
            </div>
            
            <div class="modal-buttons">
                <button id="create-route-btn">Create Route</button>
                <button id="cancel-route-btn">Cancel</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add event listeners
    document.getElementById('destination-select').addEventListener('change', previewRoute);
    document.getElementById('aircraft-select').addEventListener('change', previewRoute);
    document.getElementById('create-route-btn').addEventListener('click', () => createNewRoute(originCode));
    document.getElementById('cancel-route-btn').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
}

// Show aircraft market screen
function showMarketScreen() {
    if (!gameState.airline.founded) {
        showSetupScreen();
        return;
    }

    setActiveNavButton('nav-market');
    const template = document.getElementById('market-template');
    const content = template.content.cloneNode(true);
    gameContent.innerHTML = '';
    gameContent.appendChild(content);

    const marketContainer = document.getElementById('available-aircraft');
    
    gameState.market.forEach(aircraft => {
        if (aircraft.available > 0) {
            const aircraftItem = document.createElement('div');
            aircraftItem.className = 'aircraft-item';
            aircraftItem.innerHTML = `
                <div class="aircraft-info">
                    <h3>${aircraft.type}</h3>
                    <p>Price: ${formatMoney(aircraft.price)}</p>
                    <p>Range: ${aircraft.range.toLocaleString()} km</p>
                    <p>Capacity: ${aircraft.capacity} passengers</p>
                    <p>Available: ${aircraft.available}</p>
                </div>
                <button class="buy-btn" data-type="${aircraft.type}">Purchase</button>
            `;
            
            aircraftItem.querySelector('.buy-btn').addEventListener('click', () => {
                purchaseAircraft(aircraft.type);
            });
            
            marketContainer.appendChild(aircraftItem);
        }
    });
}

// Update the purchaseAircraft function to show the factory process
function purchaseAircraft(aircraftType) {
    const aircraft = gameState.market.find(a => a.type === aircraftType);
    
    if (!aircraft || aircraft.available <= 0) {
        alert('This aircraft is not available for purchase.');
        return;
    }
    
    if (gameState.airline.cash < aircraft.price) {
        alert('Not enough funds to purchase this aircraft.');
        return;
    }
    
    // Show the factory process instead of immediately purchasing
    showAircraftFactory(aircraftType);
}

// Create a new function for the actual purchase after factory process
function finalizeAircraftPurchase(aircraftType) {
    const aircraft = gameState.market.find(a => a.type === aircraftType);
    
    // Deduct cost
    gameState.airline.cash -= aircraft.price;
    
    // Reduce available count
    aircraft.available--;
    
    // Generate registration
    const registration = generateRegistration();
    
    // Add to fleet
    const newAircraft = {
        id: `${aircraftType}-${Date.now()}`,
        type: aircraftType,
        registration: registration,
        inService: false,
        location: gameState.airline.hub,
        crew: {
            pilot: null,
            copilot: null,
            cabinCrew: 0
        },
        status: 'Idle',
        range: aircraft.range,
        capacity: aircraft.capacity,
        purchasePrice: aircraft.price,
        operatingCost: aircraft.operatingCost || Math.round(aircraft.price * 0.00005), // Default if not specified
        baseImage: aircraft.baseImage,
        customImage: createCustomLivery(aircraftType)
    };
    
    gameState.fleet.push(newAircraft);
    saveGameState();
    
    alert(`Successfully purchased ${aircraftType} with registration ${registration}!`);
    showFleetScreen();
}

// Add a new function for the painting process
function showPaintingProcess(aircraftType) {
    const aircraft = gameState.market.find(a => a.type === aircraftType);
    
    // Create modal overlay
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    
    modal.innerHTML = `
        <div class="painting-modal">
            <h2>Aircraft Painting Process</h2>
            <div class="painting-progress">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: 0%"></div>
                </div>
                <p class="progress-text">Preparing aircraft...</p>
            </div>
            <div class="painting-image-container">
                <img src="${aircraft.factoryImage}" alt="${aircraft.type}" class="painting-image">
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Simulate painting process
    const progressFill = modal.querySelector('.progress-fill');
    const progressText = modal.querySelector('.progress-text');
    const paintingImage = modal.querySelector('.painting-image');
    
    // Create a custom painted image based on airline colors
    const customImagePath = createCustomLivery(aircraftType);
    
    let progress = 0;
    const paintingInterval = setInterval(() => {
        progress += 5;
        progressFill.style.width = `${progress}%`;
        
        if (progress === 25) {
            progressText.textContent = "Applying base coat...";
        } else if (progress === 50) {
            progressText.textContent = "Painting airline colors...";
            // Start transitioning to the custom livery
            paintingImage.style.opacity = "0.7";
        } else if (progress === 75) {
            progressText.textContent = "Adding airline logo...";
            paintingImage.style.opacity = "0.3";
        } else if (progress === 95) {
            progressText.textContent = "Finishing touches...";
            paintingImage.style.opacity = "0";
            setTimeout(() => {
                paintingImage.src = customImagePath;
                paintingImage.style.opacity = "1";
            }, 500);
        } else if (progress >= 100) {
            clearInterval(paintingInterval);
            progressText.textContent = "Painting complete!";
            
            // Add button to continue
            const continueBtn = document.createElement('button');
            continueBtn.textContent = "Add to Fleet";
            continueBtn.className = "continue-btn";
            continueBtn.addEventListener('click', () => {
                document.body.removeChild(modal);
                finalizeAircraftPurchase(aircraftType, customImagePath);
            });
            
            modal.querySelector('.painting-modal').appendChild(continueBtn);
        }
    }, 300);
}

// Modify the updateMarketWithImages function to use placeholder images
function updateMarketWithImages() {
    gameState.market.forEach(aircraft => {
        if (!aircraft.factoryImage) {
            const factoryColor = "cccccc"; // Light gray for factory
            aircraft.factoryImage = `https://placehold.co/300x200/${factoryColor}/000000/png?text=${aircraft.type}+Factory`;
        }
        
        if (!aircraft.baseImage) {
            let baseColor;
            
            // Assign colors based on manufacturer
            if (aircraft.type.startsWith('A')) {
                // Airbus - blue family
                baseColor = "3498db";
                if (aircraft.type.includes('A380')) {
                    baseColor = "1a5276"; // Darker blue for A380
                }
            } else if (aircraft.type.startsWith('B')) {
                // Boeing - green family
                baseColor = "2ecc71";
                if (aircraft.type.includes('747')) {
                    baseColor = "186a3b"; // Darker green for 747
                }
            } else if (aircraft.type.includes('ATR')) {
                // ATR - orange
                baseColor = "e67e22";
            } else if (aircraft.type.includes('Dash')) {
                // Dash 8 - purple
                baseColor = "9b59b6";
            } else {
                // Default
                baseColor = "3498db";
            }
            
            aircraft.baseImage = `https://placehold.co/300x200/${baseColor}/ffffff/png?text=${aircraft.type}+Base`;
        }
    });
    
    saveGameState();
}

// Modify the createCustomLivery function to generate a custom colored placeholder
function createCustomLivery(aircraftType) {
    const aircraft = gameState.market.find(a => a.type === aircraftType);
    
    // Remove the query parameters from the base image URL
    const baseUrl = "https://via.placeholder.com/300x200/";
    
    // Use the airline's primary color (without the # symbol)
    const primaryColor = gameState.airline.primaryColor.replace('#', '');
    const secondaryColor = gameState.airline.secondaryColor.replace('#', '');
    
    // Create a new placeholder with the airline's colors
    return `${baseUrl}${primaryColor}/${secondaryColor}?text=${aircraft.type}+${gameState.airline.code}`;
}

// Update the showAirlineInfoScreen function if it exists
function showAirlineInfoScreen() {
    setActiveNavButton('nav-setup');
    gameContent.innerHTML = `
        <div id="airline-info-screen">
            <h2>${gameState.airline.name} (${gameState.airline.code})</h2>
            <p>Hub: ${airports[gameState.airline.hub].name}</p>
            <p>Cash: ${formatMoney(gameState.airline.cash)}</p>
            <div class="airline-colors">
                <div class="color-sample" style="background-color: ${gameState.airline.primaryColor}"></div>
                <div class="color-sample" style="background-color: ${gameState.airline.secondaryColor}"></div>
            </div>
        </div>
    `;
}

// Make sure all aircraft in the fleet have proper images
function ensureAircraftImages() {
    const placeholderBaseUrl = "https://via.placeholder.com/300x200/";
    
    gameState.fleet.forEach(aircraft => {
        if (!aircraft.baseImage || aircraft.baseImage.includes('images/')) {
            // If the image path is using the old file system path, update it
            let baseColor;
            
            switch(aircraft.type) {
                case "A320":
                    baseColor = "3498db"; // Blue for Airbus
                    break;
                case "A330-300":
                    baseColor = "9b59b6"; // Purple for Airbus widebody
                    break;
                case "B777-300ER":
                    baseColor = "e74c3c"; // Red for Boeing widebody
                    break;
                default:
                    baseColor = "3498db";
            }
            
            aircraft.baseImage = `${placeholderBaseUrl}${baseColor}/FFFFFF?text=${aircraft.type}`;
        }
        
        // If the aircraft has a custom image using the old path format, update it
        if (aircraft.customImage && aircraft.customImage.includes('images/')) {
            const primaryColor = gameState.airline.primaryColor.replace('#', '');
            const secondaryColor = gameState.airline.secondaryColor.replace('#', '');
            aircraft.customImage = `${placeholderBaseUrl}${primaryColor}/${secondaryColor}?text=${aircraft.type}+${gameState.airline.code}`;
        }
    });
}

// Add more aircraft to the market
function expandAircraftMarket() {
    // Clear existing market first to avoid duplicates
    gameState.market = [];
    
    // Add a variety of aircraft to the market
    gameState.market = [
        {
            type: "DHC Dash 8 Q400",
            available: 5,
            price: 32000000,
            range: 2040,
            capacity: 78,
            operatingCost: 2200
        },
        {
            type: "ATR 72-600",
            available: 4,
            price: 26000000,
            range: 1528,
            capacity: 72,
            operatingCost: 1900
        },
        {
            type: "A220-300",
            available: 3,
            price: 91500000,
            range: 3400,
            capacity: 160,
            operatingCost: 3800
        },
        {
            type: "A320neo",
            available: 5,
            price: 110000000,
            range: 3500,
            capacity: 180,
            operatingCost: 4200
        },
        {
            type: "A321XLR",
            available: 2,
            price: 133000000,
            range: 8700,
            capacity: 220,
            operatingCost: 5100
        },
        {
            type: "A330-900neo",
            available: 3,
            price: 296000000,
            range: 13400,
            capacity: 300,
            operatingCost: 7800
        },
        {
            type: "A350-900",
            available: 2,
            price: 317000000,
            range: 15000,
            capacity: 325,
            operatingCost: 8500
        },
        {
            type: "A380-800",
            available: 1,
            price: 445000000,
            range: 14800,
            capacity: 525,
            operatingCost: 26000
        },
        {
            type: "B737-8",
            available: 4,
            price: 106000000,
            range: 3550,
            capacity: 189,
            operatingCost: 4300
        },
        {
            type: "B737-10",
            available: 2,
            price: 134000000,
            range: 3300,
            capacity: 230,
            operatingCost: 4900
        },
        {
            type: "B747-8",
            available: 1,
            price: 418000000,
            range: 14320,
            capacity: 467,
            operatingCost: 18500
        },
        {
            type: "B787-9",
            available: 3,
            price: 292000000,
            range: 14010,
            capacity: 290,
            operatingCost: 7600
        },
        {
            type: "B787-10",
            available: 2,
            price: 338000000,
            range: 11730,
            capacity: 330,
            operatingCost: 8200
        },
        {
            type: "B777-9",
            available: 1,
            price: 442000000,
            range: 13500,
            capacity: 426,
            operatingCost: 10500
        }
    ];
    
    // Add images to market aircraft
    updateMarketWithImages();
}

// Function to expand airports with the requested cities
function expandAirports() {
    // Remove Delhi if it exists
    if (airports.DEL) {
        delete airports.DEL;
    }
    
    // Add the requested cities
    Object.assign(airports, {
        ICN: { name: "Seoul Incheon", code: "ICN", lat: 37.4602, lon: 126.4407 },
        YVR: { name: "Vancouver", code: "YVR", lat: 49.1967, lon: -123.1815 },
        PUS: { name: "Busan Gimhae", code: "PUS", lat: 35.1796, lon: 128.9380 },
        YYZ: { name: "Toronto Pearson", code: "YYZ", lat: 43.6777, lon: -79.6248 },
        YQB: { name: "Quebec City", code: "YQB", lat: 46.7911, lon: -71.3933 },
        YYC: { name: "Calgary", code: "YYC", lat: 51.1215, lon: -114.0076 },
        YUL: { name: "Montreal", code: "YUL", lat: 45.4706, lon: -73.7408 },
        CJU: { name: "Jeju", code: "CJU", lat: 33.5113, lon: 126.4930 },
        PVG: { name: "Shanghai Pudong", code: "PVG", lat: 31.1443, lon: 121.8083 },
        SZX: { name: "Shenzhen", code: "SZX", lat: 22.6395, lon: 113.8107 },
        HKG: { name: "Hong Kong", code: "HKG", lat: 22.3080, lon: 113.9185 },
        SEA: { name: "Seattle-Tacoma", code: "SEA", lat: 47.4502, lon: -122.3088 }
    });
}

// Add route planning functionality
function createRoute(origin, destination, aircraftId, departureTime, frequency) {
    // Calculate distance between airports
    const originAirport = airports[origin];
    const destAirport = airports[destination];
    const distance = calculateDistance(
        originAirport.lat, originAirport.lon,
        destAirport.lat, destAirport.lon
    );
    
    // Get aircraft details
    const aircraft = gameState.fleet.find(a => a.id === aircraftId);
    
    // Check if route is within aircraft range
    if (distance > aircraft.range) {
        return { success: false, message: "This route exceeds the aircraft's range." };
    }
    
    // Calculate flight time (in hours)
    const flightTime = distance / 850; // Assume average speed of 850 km/h
    
    // Calculate estimated revenue
    const baseTicketPrice = 50 + (distance / 100) * 10;
    const estimatedRevenue = baseTicketPrice * aircraft.capacity * 0.85; // Assume 85% load factor
    
    // Calculate operating costs
    const operatingCost = aircraft.operatingCost * flightTime;
    
    // Create route object
    const newRoute = {
        id: `${origin}-${destination}-${Date.now()}`,
        origin,
        destination,
        distance,
        aircraftId,
        flightNumber: `${gameState.airline.code}${100 + routes.length}`,
        departureTime,
        arrivalTime: addHours(departureTime, flightTime),
        frequency, // "daily", "weekly", etc.
        flightTime,
        estimatedRevenue,
        operatingCost,
        profitMargin: (estimatedRevenue - operatingCost) / estimatedRevenue * 100,
        active: false,
        flights: []
    };
    
    routes.push(newRoute);
    return { success: true, route: newRoute };
}

// Helper function to calculate distance between coordinates (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

// Helper function to add hours to a date
function addHours(date, hours) {
    const result = new Date(date);
    result.setHours(result.getHours() + hours);
    return result;
}

// Set up game clock for simulation
function setupGameClock() {
    setInterval(updateGameTime, 1000);
}

// Update game time
function updateGameTime() {
    if (gameState.airline.founded && !gameTime.paused) {
        const now = Date.now();
        const elapsed = now - gameTime.lastUpdate;
        gameTime.lastUpdate = now;
        
        // Advance time based on game speed
        const daysToAdvance = (elapsed / 1000) * (gameTime.speed / 10);
        advanceGameDays(daysToAdvance);
        
        // Update UI if dashboard is visible
        updateTimeDisplay();
        
        // Run simulation for active flights
        simulateFlights();
        
        // Calculate daily finances
        calculateDailyFinances();

        // Update flights
        updateFlights();
    }
}

// Advance game days
function advanceGameDays(days) {
    gameTime.day += days;
    
    // Handle month/year rollover
    while (gameTime.day > 30) {
        gameTime.day -= 30;
        gameTime.month++;
        
        // Monthly financial report
        generateMonthlyReport();
        
        if (gameTime.month > 12) {
            gameTime.month = 1;
            gameTime.year++;
            
            // Yearly financial report
            generateYearlyReport();
        }
    }
}

// Update time display
function updateTimeDisplay() {
    const timeDisplay = document.getElementById('game-time');
    if (timeDisplay) {
        timeDisplay.textContent = `Day ${Math.floor(gameTime.day)}, Month ${gameTime.month}, Year ${gameTime.year}`;
    }
}

// Simulate active flights
function simulateFlights() {
    // Process active flights
    gameState.activeFlights.forEach(flight => {
        // Update flight progress
        if (flight.status === 'In Air') {
            flight.progress += gameTime.speed / 10;
            
            // Check if flight has arrived
            if (flight.progress >= flight.duration) {
                completeFlight(flight);
            }
        }
    });
    
    // Start new flights from routes
    routes.forEach(route => {
        if (route.active) {
            // Check if it's time to start a new flight based on frequency
            const shouldStartFlight = checkFlightSchedule(route);
            
            if (shouldStartFlight) {
                startNewFlight(route);
            }
        }
    });
}

// Calculate daily finances
function calculateDailyFinances() {
    // Reset daily calculations
    financials.dailyRevenue = 0;
    financials.dailyExpenses = 0;
    
    // Calculate revenue from in-service aircraft
    gameState.fleet.forEach(aircraft => {
        if (aircraft.inService && aircraft.dailyRevenue) {
            financials.dailyRevenue += aircraft.dailyRevenue;
        }
    });
    
    // Calculate expenses (crew salaries, maintenance, etc.)
    gameState.fleet.forEach(aircraft => {
        // Basic maintenance costs even if not in service
        let dailyCost = aircraft.operatingCost / 24; // Convert hourly cost to daily
        
        // Additional costs if in service
        if (aircraft.inService) {
            // Crew costs
            const pilotDailySalary = 1000; // $1000 per day
            const copilotDailySalary = 800; // $800 per day
            const cabinCrewDailySalary = 400; // $400 per crew member per day
            
            dailyCost += pilotDailySalary + copilotDailySalary + (aircraft.crew.cabinCrew * cabinCrewDailySalary);
            
            // Fuel and operational costs
            dailyCost += aircraft.operatingCost * 8; // Assume 8 hours of flight per day
        }
        
        financials.dailyExpenses += dailyCost;
    });
    
    // Update airline cash based on daily profit/loss
    const dailyProfit = financials.dailyRevenue - financials.dailyExpenses;
    gameState.airline.cash += dailyProfit;
    
    // Update total revenue and expenses
    financials.totalRevenue += financials.dailyRevenue;
    financials.totalExpenses += financials.dailyExpenses;
    
    // Update UI if dashboard is visible
    updateFinancialDisplay();
}

// Add this function to update the financial display on the dashboard
function updateFinancialDisplay() {
    const revenueDisplay = document.getElementById('daily-revenue');
    const expensesDisplay = document.getElementById('daily-expenses');
    const profitDisplay = document.getElementById('daily-profit');
    
    if (revenueDisplay && expensesDisplay && profitDisplay) {
        revenueDisplay.textContent = formatMoney(financials.dailyRevenue);
        expensesDisplay.textContent = formatMoney(financials.dailyExpenses);
        
        const dailyProfit = financials.dailyRevenue - financials.dailyExpenses;
        profitDisplay.textContent = formatMoney(dailyProfit);
        profitDisplay.style.color = dailyProfit >= 0 ? '#2ecc71' : '#e74c3c';
    }
}

// Add a dashboard screen
function showDashboardScreen() {
    setActiveNavButton('nav-dashboard');
    
    const dashboardHTML = `
        <div id="dashboard-screen">
            <div class="dashboard-header">
                <h2>Airline Dashboard</h2>
                <div id="game-time">Day ${Math.floor(gameTime.day)}, Month ${gameTime.month}, Year ${gameTime.year}</div>
                <div class="time-controls">
                    <button id="pause-btn">${gameTime.paused ? 'Resume' : 'Pause'}</button>
                    <button id="speed-1" class="${gameTime.speed === 1 ? 'active' : ''}">1x</button>
                    <button id="speed-2" class="${gameTime.speed === 2 ? 'active' : ''}">2x</button>
                    <button id="speed-3" class="${gameTime.speed === 3 ? 'active' : ''}">3x</button>
                </div>
            </div>
            
            <div class="dashboard-grid">
                <div class="dashboard-card">
                    <h3>Financial Overview</h3>
                    <p>Cash: ${formatMoney(gameState.airline.cash)}</p>
                    <p>Daily Revenue: ${formatMoney(financials.dailyRevenue)}</p>
                    <p>Daily Expenses: ${formatMoney(financials.dailyExpenses)}</p>
                    <p>Daily Profit: ${formatMoney(financials.dailyRevenue - financials.dailyExpenses)}</p>
                </div>
                
                <div class="dashboard-card">
                    <h3>Fleet Summary</h3>
                    <p>Total Aircraft: ${gameState.fleet.length}</p>
                    <p>In Service: ${gameState.fleet.filter(a => a.inService).length}</p>
                    <p>Idle: ${gameState.fleet.filter(a => !a.inService).length}</p>
                </div>
                
                <div class="dashboard-card">
                    <h3>Passenger Satisfaction</h3>
                    <div class="satisfaction-meter">
                        <div class="satisfaction-fill" style="width: ${passengerMetrics.overall}%"></div>
                    </div>
                    <p>${passengerMetrics.overall}% Overall Satisfaction</p>
                </div>
                
                <div class="dashboard-card">
                    <h3>Active Routes</h3>
                    <p>Total Routes: ${routes.length}</p>
                    <p>Active Routes: ${routes.filter(r => r.active).length}</p>
                </div>
            </div>
            
            <div class="dashboard-row">
                <div class="dashboard-card full-width">
                    <h3>Recent Flights</h3>
                    <table class="flights-table">
                        <thead>
                            <tr>
                                <th>Flight</th>
                                <th>Route</th>
                                <th>Status</th>
                                <th>Revenue</th>
                            </tr>
                        </thead>
                        <tbody id="recent-flights">
                            <!-- Recent flights will be listed here -->
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
    
    gameContent.innerHTML = dashboardHTML;
    
    // Populate recent flights
    const recentFlightsTable = document.getElementById('recent-flights');
    const recentFlights = gameState.activeFlights
        .filter(f => f.status === 'Completed')
        .sort((a, b) => b.completionTime - a.completionTime)
        .slice(0, 5);
    
    if (recentFlights.length === 0) {
        recentFlightsTable.innerHTML = '<tr><td colspan="4">No completed flights yet</td></tr>';
    } else {
        recentFlights.forEach(flight => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${flight.flightNumber}</td>
                <td>${flight.origin} → ${flight.destination}</td>
                <td>${flight.status}</td>
                <td>${formatMoney(flight.revenue)}</td>
            `;
            recentFlightsTable.appendChild(row);
        });
    }
    
    // Add event listeners for time controls
    document.getElementById('pause-btn').addEventListener('click', togglePause);
    document.getElementById('speed-1').addEventListener('click', () => setGameSpeed(1));
    document.getElementById('speed-2').addEventListener('click', () => setGameSpeed(2));
    document.getElementById('speed-3').addEventListener('click', () => setGameSpeed(3));
}

// Toggle game pause
function togglePause() {
    gameTime.paused = !gameTime.paused;
    document.getElementById('pause-btn').textContent = gameTime.paused ? 'Resume' : 'Pause';
}

// Set game speed
function setGameSpeed(speed) {
    gameTime.speed = speed;
    document.querySelectorAll('.time-controls button').forEach(btn => {
        btn.classList.remove('active');
    });
    document.getElementById(`speed-${speed}`).classList.add('active');
}

// Add route planning screen
function showRouteScreen() {
    if (!gameState.airline.founded) {
        showSetupScreen();
        return;
    }

    setActiveNavButton('nav-routes');
    
    const routeHTML = `
        <div id="route-screen">
            <h2>Route Planning</h2>
            
            <div class="route-grid">
                <div class="route-form">
                    <h3>Create New Route</h3>
                    <div class="form-group">
                        <label for="origin-select">Origin:</label>
                        <select id="origin-select">
                            <option value="">Select Origin Airport</option>
                            ${Object.keys(airports).map(code => 
                                `<option value="${code}">${airports[code].name} (${code})</option>`
                            ).join('')}
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="destination-select">Destination:</label>
                        <select id="destination-select">
                            <option value="">Select Destination Airport</option>
                            ${Object.keys(airports).map(code => 
                                `<option value="${code}">${airports[code].name} (${code})</option>`
                            ).join('')}
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="aircraft-select">Aircraft:</label>
                        <select id="aircraft-select">
                            <option value="">Select Aircraft</option>
                            ${gameState.fleet.filter(a => a.inService).map(aircraft => 
                                `<option value="${aircraft.id}">${aircraft.type} (${aircraft.registration})</option>`
                            ).join('')}
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="frequency-select">Frequency:</label>
                        <select id="frequency-select">
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                        </select>
                    </div>
                    
                    <button id="calculate-route-btn">Calculate Route</button>
                    
                    <div id="route-calculation" class="hidden">
                        <h4>Route Details</h4>
                        <p>Distance: <span id="route-distance"></span> km</p>
                        <p>Flight Time: <span id="route-time"></span> hours</p>
                        <p>Estimated Revenue: <span id="route-revenue"></span></p>
                        <p>Operating Cost: <span id="route-cost"></span></p>
                        <p>Profit Margin: <span id="route-profit"></span>%</p>
                        
                        <button id="create-route-btn">Create Route</button>
                    </div>
                </div>
                
                <div class="route-list">
                    <h3>Your Routes</h3>
                    <div id="routes-container">
                        <!-- Routes will be listed here -->
                    </div>
                </div>
            </div>
        </div>
    `;
    
    gameContent.innerHTML = routeHTML;
    
    // Add event listeners
    document.getElementById('calculate-route-btn').addEventListener('click', calculateRouteDetails);
    document.getElementById('create-route-btn').addEventListener('click', createNewRoute);
    
    // Display existing routes
    displayRoutes();
}

// Calculate route details
function calculateRouteDetails() {
    const origin = document.getElementById('origin-select').value;
    const destination = document.getElementById('destination-select').value;
    const aircraftId = document.getElementById('aircraft-select').value;
    
    if (!origin || !destination || !aircraftId) {
        alert('Please select origin, destination, and aircraft.');
        return;
    }
    
    if (origin === destination) {
        alert('Origin and destination cannot be the same.');
        return;
    }
    
    // Get airport coordinates
    const originAirport = airports[origin];
    const destAirport = airports[destination];
    
    // Calculate distance
    const distance = calculateDistance(
        originAirport.lat, originAirport.lon,
        destAirport.lat, destAirport.lon
    );
    
    // Get aircraft details
    const aircraft = gameState.fleet.find(a => a.id === aircraftId);
    
    // Check if route is within aircraft range
    if (distance > aircraft.range) {
        alert(`This route exceeds the aircraft's range (${aircraft.range.toLocaleString()} km).`);
        return;
    }
    
    // Calculate flight time (in hours)
    const flightTime = distance / 850; // Assume average speed of 850 km/h
    
    // Calculate estimated revenue
    const baseTicketPrice = 50 + (distance / 100) * 10;
    const estimatedRevenue = baseTicketPrice * aircraft.capacity * 0.85; // Assume 85% load factor
    
    // Calculate operating costs
    const operatingCost = aircraft.operatingCost * flightTime;
    
    // Calculate profit margin
    const profitMargin = (estimatedRevenue - operatingCost) / estimatedRevenue * 100;
    
    // Display results
    document.getElementById('route-distance').textContent = distance.toLocaleString();
    document.getElementById('route-time').textContent = flightTime.toFixed(1);
    document.getElementById('route-revenue').textContent = formatMoney(estimatedRevenue);
    document.getElementById('route-cost').textContent = formatMoney(operatingCost);
    document.getElementById('route-profit').textContent = profitMargin.toFixed(1);
    
    document.getElementById('route-calculation').classList.remove('hidden');
}

// Create new route
function createNewRoute() {
    const origin = document.getElementById('origin-select').value;
    const destination = document.getElementById('destination-select').value;
    const aircraftId = document.getElementById('aircraft-select').value;
    const frequency = document.getElementById('frequency-select').value;
    
    // Create a departure time (simplified)
    const departureTime = new Date();
    departureTime.setHours(8, 0, 0, 0); // 8:00 AM
    
    const result = createRoute(origin, destination, aircraftId, departureTime, frequency);
    
    if (result.success) {
        alert(`Route created successfully! Flight number: ${result.route.flightNumber}`);
        displayRoutes();
    } else {
        alert(`Failed to create route: ${result.message}`);
    }
}

// Display routes
function displayRoutes() {
    const routesContainer = document.getElementById('routes-container');
    
    if (routes.length === 0) {
        routesContainer.innerHTML = '<p>No routes created yet.</p>';
        return;
    }
    
    routesContainer.innerHTML = '';
    
    routes.forEach(route => {
        const routeCard = document.createElement('div');
        routeCard.className = `route-card ${route.active ? 'active' : 'inactive'}`;
        
        routeCard.innerHTML = `
            <div class="route-header">
                <h4>${route.flightNumber}: ${route.origin} → ${route.destination}</h4>
                <div class="route-status">${route.active ? 'Active' : 'Inactive'}</div>
            </div>
            <p>Aircraft: ${gameState.fleet.find(a => a.id === route.aircraftId)?.type || 'Unknown'}</p>
            <p>Distance: ${route.distance.toLocaleString()} km</p>
            <p>Flight Time: ${route.flightTime.toFixed(1)} hours</p>
            <p>Profit Margin: ${route.profitMargin.toFixed(1)}%</p>
            <button class="toggle-route-btn" data-id="${route.id}">
                ${route.active ? 'Deactivate' : 'Activate'} Route
            </button>
        `;
        
        routesContainer.appendChild(routeCard);
    });
    
    // Add event listeners to toggle buttons
    document.querySelectorAll('.toggle-route-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const routeId = e.target.dataset.id;
            toggleRouteStatus(routeId);
        });
    });
}

// Toggle route status
function toggleRouteStatus(routeId) {
    const route = routes.find(r => r.id === routeId);
    if (route) {
        route.active = !route.active;
        displayRoutes();
    }
}

// Function to hire staff
function hireStaff() {
    // Generate pilots
    for (let i = 0; i < 5; i++) {
        const pilot = {
            id: `pilot-${gameState.staff.pilots.length + 1}`,
            name: generateRandomName(),
            experience: Math.floor(Math.random() * 15) + 5, // 5-20 years experience
            salary: Math.floor(Math.random() * 50000) + 100000, // $100k-$150k salary
            rating: Math.floor(Math.random() * 20) + 80 // 80-100 rating
        };
        gameState.staff.pilots.push(pilot);
    }
    
    // Generate co-pilots
    for (let i = 0; i < 5; i++) {
        const copilot = {
            id: `copilot-${gameState.staff.copilots.length + 1}`,
            name: generateRandomName(),
            experience: Math.floor(Math.random() * 10) + 2, // 2-12 years experience
            salary: Math.floor(Math.random() * 30000) + 70000, // $70k-$100k salary
            rating: Math.floor(Math.random() * 30) + 70 // 70-100 rating
        };
        gameState.staff.copilots.push(copilot);
    }
    
    // Add cabin crew
    gameState.staff.cabinCrew += 20;
    
    saveGameState();
    alert('New staff hired successfully!');
}

// Function to assign crew to aircraft
function assignCrew(aircraftId) {
    const aircraft = gameState.fleet.find(a => a.id === aircraftId);
    if (!aircraft) return;
    
    const pilotId = document.getElementById('pilot-select').value;
    const copilotId = document.getElementById('copilot-select').value;
    const cabinCrewCount = parseInt(document.getElementById('cabin-crew-count').value) || 0;
    
    // Validate cabin crew count
    const maxCabinCrew = Math.ceil(aircraft.capacity / 30); // Roughly 1 crew per 30 passengers
    
    if (cabinCrewCount > maxCabinCrew) {
        alert(`Maximum cabin crew for this aircraft is ${maxCabinCrew}.`);
        return;
    }
    
    if (cabinCrewCount > gameState.staff.cabinCrew + aircraft.crew.cabinCrew) {
        alert(`You don't have enough cabin crew available. You have ${gameState.staff.cabinCrew + aircraft.crew.cabinCrew} available.`);
        return;
    }
    
    // Update available cabin crew count
    gameState.staff.cabinCrew += aircraft.crew.cabinCrew - cabinCrewCount;
    
    // Update aircraft crew
    aircraft.crew = {
        pilot: pilotId || null,
        copilot: copilotId || null,
        cabinCrew: cabinCrewCount
    };
    
    saveGameState();
    showAircraftDetails(aircraftId);
    
    alert('Crew assigned successfully!');
}

// Add to your gameState object
function expandGameState() {
    // Add flights array if it doesn't exist
    if (!gameState.flights) {
        gameState.flights = [];
    }
}

// Add this function to create a new flight
function createFlight(routeId, departureTime) {
    const route = routes.find(r => r.id === routeId);
    if (!route) {
        return { success: false, message: "Route not found" };
    }
    
    const aircraft = gameState.fleet.find(a => a.id === route.aircraftId);
    if (!aircraft) {
        return { success: false, message: "Aircraft not found" };
    }
    
    // Check if aircraft is in service
    if (!aircraft.inService) {
        return { success: false, message: "Aircraft is not in service" };
    }
    
    // Check if aircraft has crew assigned
    if (!aircraft.crew.pilot || !aircraft.crew.copilot || aircraft.crew.cabinCrew < 3) {
        return { success: false, message: "Aircraft doesn't have a complete crew assigned" };
    }
    
    // Calculate arrival time
    const arrivalTime = new Date(departureTime.getTime() + route.flightTime * 60 * 60 * 1000);
    
    // Generate a random load factor between 70% and 100%
    const loadFactor = 0.7 + Math.random() * 0.3;
    const passengerCount = Math.floor(aircraft.capacity * loadFactor);
    
    // Calculate revenue based on passenger count and route
    const baseTicketPrice = 50 + (route.distance / 100) * 10;
    const revenue = baseTicketPrice * passengerCount;
    
    // Create flight object
    const flight = {
        id: `flight-${Date.now()}`,
        flightNumber: route.flightNumber,
        routeId: route.id,
        aircraftId: aircraft.id,
        origin: route.origin,
        destination: route.destination,
        departureTime: departureTime,
        arrivalTime: arrivalTime,
        status: "Scheduled",
        passengerCount,
        loadFactor,
        revenue,
        operatingCost: route.operatingCost,
        profit: revenue - route.operatingCost,
        delay: 0
    };
    
    // Add to flights array
    gameState.flights.push(flight);
    saveGameState();
    
    return { success: true, flight };
}

// Add a function to update flight status based on game time
function updateFlights() {
    const currentTime = new Date();
    currentTime.setFullYear(gameTime.year, gameTime.month - 1, gameTime.day);
    
    gameState.flights.forEach(flight => {
        const departureTime = new Date(flight.departureTime);
        const arrivalTime = new Date(flight.arrivalTime);
        
        if (flight.status === "Scheduled" && currentTime >= departureTime) {
            flight.status = "In Air";
            
            // Randomly determine if flight is delayed (10% chance)
            if (Math.random() < 0.1) {
                flight.delay = Math.floor(Math.random() * 60) + 15; // 15-75 minute delay
                
                // Update arrival time
                flight.arrivalTime = new Date(arrivalTime.getTime() + flight.delay * 60 * 1000);
                
                // Reduce passenger satisfaction
                passengerMetrics.punctuality = Math.max(60, passengerMetrics.punctuality - 2);
            }
        } else if (flight.status === "In Air" && currentTime >= arrivalTime) {
            flight.status = "Completed";
            
            // Add revenue to airline cash
            gameState.airline.cash += flight.revenue;
            gameState.airline.revenue += flight.revenue;
            
            // Deduct operating costs
            gameState.airline.cash -= flight.operatingCost;
            
            // Update passenger satisfaction based on flight experience
            if (flight.delay === 0) {
                passengerMetrics.punctuality = Math.min(100, passengerMetrics.punctuality + 0.5);
            }
        }
    });
    
    saveGameState();
}

// Add a function to show the flights screen
function showFlightsScreen() {
    if (!gameState.airline.founded) {
        showSetupScreen();
        return;
    }

    setActiveNavButton('nav-flights');
    
    // Create HTML for flights screen
    const flightsHTML = `
        <div id="flights-screen">
            <div class="flights-header">
                <h2>Flight Operations</h2>
                <div class="flight-controls">
                    <button id="schedule-flight-btn">Schedule New Flight</button>
                    <select id="flight-filter">
                        <option value="all">All Flights</option>
                        <option value="scheduled">Scheduled</option>
                        <option value="in-air">In Air</option>
                        <option value="completed">Completed</option>
                    </select>
                </div>
            </div>
            
            <div class="flights-table-container">
                <table class="flights-table">
                    <thead>
                        <tr>
                            <th>Flight</th>
                            <th>Route</th>
                            <th>Aircraft</th>
                            <th>Departure</th>
                            <th>Arrival</th>
                            <th>Status</th>
                            <th>Passengers</th>
                            <th>Revenue</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="flights-list">
                        <!-- Flights will be listed here -->
                    </tbody>
                </table>
            </div>
            
            <div id="flight-details" class="hidden">
                <!-- Flight details will be shown here -->
            </div>
        </div>
    `;
    
    gameContent.innerHTML = flightsHTML;
    
    // Add event listeners
    document.getElementById('schedule-flight-btn').addEventListener('click', showScheduleFlightModal);
    document.getElementById('flight-filter').addEventListener('change', filterFlights);
    
    // Display flights
    displayFlights();
}

// Function to display flights
function displayFlights(filter = 'all') {
    const flightsList = document.getElementById('flights-list');
    flightsList.innerHTML = '';
    
    // Sort flights by departure time (newest first)
    const sortedFlights = [...gameState.flights].sort((a, b) => 
        new Date(b.departureTime) - new Date(a.departureTime)
    );
    
    // Filter flights if needed
    const filteredFlights = filter === 'all' 
        ? sortedFlights 
        : sortedFlights.filter(f => f.status.toLowerCase() === filter);
    
    if (filteredFlights.length === 0) {
        flightsList.innerHTML = `
            <tr>
                <td colspan="9" class="no-flights">No flights found</td>
            </tr>
        `;
        return;
    }
    
    filteredFlights.forEach(flight => {
        const aircraft = gameState.fleet.find(a => a.id === flight.aircraftId);
        const departureDate = new Date(flight.departureTime);
        const arrivalDate = new Date(flight.arrivalTime);
        
        const row = document.createElement('tr');
        row.className = `flight-row status-${flight.status.toLowerCase().replace(' ', '-')}`;
        
        row.innerHTML = `
            <td>${flight.flightNumber}</td>
            <td>${flight.origin} → ${flight.destination}</td>
            <td>${aircraft ? aircraft.type : 'Unknown'} (${aircraft ? aircraft.registration : 'N/A'})</td>
            <td>${formatDateTime(departureDate)}${flight.delay ? ' <span class="delay">+' + flight.delay + 'm</span>' : ''}</td>
            <td>${formatDateTime(arrivalDate)}</td>
            <td><span class="status-badge status-${flight.status.toLowerCase().replace(' ', '-')}">${flight.status}</span></td>
            <td>${flight.passengerCount}/${aircraft ? aircraft.capacity : '?'} (${Math.round(flight.loadFactor * 100)}%)</td>
            <td>${formatMoney(flight.revenue)}</td>
            <td>
                <button class="view-flight-btn" data-id="${flight.id}">View</button>
                ${flight.status === 'Scheduled' ? `<button class="cancel-flight-btn" data-id="${flight.id}">Cancel</button>` : ''}
            </td>
        `;
        
        flightsList.appendChild(row);
    });
    
    // Add event listeners to buttons
    document.querySelectorAll('.view-flight-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            showFlightDetails(btn.dataset.id);
        });
    });
    
    document.querySelectorAll('.cancel-flight-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            cancelFlight(btn.dataset.id);
        });
    });
}

// Function to filter flights
function filterFlights(e) {
    const filter = e.target.value;
    displayFlights(filter);
}

// Function to show flight details
function showFlightDetails(flightId) {
    const flight = gameState.flights.find(f => f.id === flightId);
    if (!flight) return;
    
    const aircraft = gameState.fleet.find(a => a.id === flight.aircraftId);
    const route = routes.find(r => r.id === flight.routeId);
    
    const flightDetails = document.getElementById('flight-details');
    flightDetails.classList.remove('hidden');
    
    flightDetails.innerHTML = `
        <h3>Flight Details: ${flight.flightNumber}</h3>
        <div class="flight-detail-grid">
            <div class="flight-detail-card">
                <h4>Basic Information</h4>
                <p><strong>Route:</strong> ${flight.origin} → ${flight.destination}</p>
                <p><strong>Distance:</strong> ${route ? route.distance.toLocaleString() : 'Unknown'} km</p>
                <p><strong>Aircraft:</strong> ${aircraft ? aircraft.type : 'Unknown'} (${aircraft ? aircraft.registration : 'N/A'})</p>
                <p><strong>Status:</strong> ${flight.status}</p>
                ${flight.delay ? `<p><strong>Delay:</strong> ${flight.delay} minutes</p>` : ''}
            </div>
            
            <div class="flight-detail-card">
                <h4>Schedule</h4>
                <p><strong>Departure:</strong> ${formatDateTime(new Date(flight.departureTime))}</p>
                <p><strong>Arrival:</strong> ${formatDateTime(new Date(flight.arrivalTime))}</p>
                <p><strong>Flight Time:</strong> ${calculateFlightDuration(flight.departureTime, flight.arrivalTime)}</p>
            </div>
            
            <div class="flight-detail-card">
                <h4>Passengers & Revenue</h4>
                <p><strong>Passengers:</strong> ${flight.passengerCount}/${aircraft ? aircraft.capacity : '?'}</p>
                <p><strong>Load Factor:</strong> ${Math.round(flight.loadFactor * 100)}%</p>
                <p><strong>Revenue:</strong> ${formatMoney(flight.revenue)}</p>
                <p><strong>Operating Cost:</strong> ${formatMoney(flight.operatingCost)}</p>
                <p><strong>Profit:</strong> ${formatMoney(flight.profit)}</p>
            </div>
            
            <div class="flight-detail-card">
                <h4>Crew</h4>
                <p><strong>Pilot:</strong> ${aircraft && aircraft.crew.pilot ? gameState.staff.pilots.find(p => p.id === aircraft.crew.pilot)?.name || 'Unknown' : 'Not assigned'}</p>
                <p><strong>Co-Pilot:</strong> ${aircraft && aircraft.crew.copilot ? gameState.staff.copilots.find(p => p.id === aircraft.crew.copilot)?.name || 'Unknown' : 'Not assigned'}</p>
                <p><strong>Cabin Crew:</strong> ${aircraft ? aircraft.crew.cabinCrew : 0} members</p>
            </div>
        </div>
        
        <button id="close-details-btn">Close Details</button>
    `;
    
    document.getElementById('close-details-btn').addEventListener('click', () => {
        flightDetails.classList.add('hidden');
    });
}

// Function to show schedule flight modal
function showScheduleFlightModal() {
    // Check if there are active routes
    if (routes.filter(r => r.active).length === 0) {
        alert('You need to create and activate routes before scheduling flights.');
        return;
    }
    
    // Create modal HTML
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    
    modal.innerHTML = `
        <div class="schedule-flight-modal">
            <h2>Schedule New Flight</h2>
            
            <div class="form-group">
                <label for="route-select">Select Route:</label>
                <select id="route-select">
                    <option value="">-- Select a Route --</option>
                    ${routes.filter(r => r.active).map(route => 
                        `<option value="${route.id}">${route.flightNumber}: ${route.origin} → ${route.destination}</option>`
                    ).join('')}
                </select>
            </div>
            
            <div class="form-group">
                <label for="flight-date">Departure Date:</label>
                <input type="date" id="flight-date" min="${formatDateForInput(new Date())}">
            </div>
            
            <div class="form-group">
                <label for="flight-time">Departure Time:</label>
                <input type="time" id="flight-time">
            </div>
            
            <div class="route-info hidden" id="route-info">
                <!-- Route info will be displayed here -->
            </div>
            
            <div class="modal-buttons">
                <button id="schedule-btn">Schedule Flight</button>
                <button id="cancel-modal-btn">Cancel</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Set default date and time
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    document.getElementById('flight-date').value = formatDateForInput(tomorrow);
    document.getElementById('flight-time').value = '08:00';
    
    // Add event listeners
    document.getElementById('route-select').addEventListener('change', showRouteInfo);
    document.getElementById('schedule-btn').addEventListener('click', scheduleNewFlight);
    document.getElementById('cancel-modal-btn').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
}

// Function to show route info when selecting a route
function showRouteInfo() {
    const routeId = document.getElementById('route-select').value;
    if (!routeId) {
        document.getElementById('route-info').classList.add('hidden');
        return;
    }
    
    const route = routes.find(r => r.id === routeId);
    if (!route) return;
    
    const aircraft = gameState.fleet.find(a => a.id === route.aircraftId);
    if (!aircraft) return;
    
    const routeInfo = document.getElementById('route-info');
    routeInfo.classList.remove('hidden');
    
    routeInfo.innerHTML = `
        <h4>Route Information</h4>
        <p><strong>Aircraft:</strong> ${aircraft.type} (${aircraft.registration})</p>
        <p><strong>Distance:</strong> ${route.distance.toLocaleString()} km</p>
        <p><strong>Flight Time:</strong> ${route.flightTime.toFixed(1)} hours</p>
        <p><strong>Capacity:</strong> ${aircraft.capacity} passengers</p>
        <p><strong>Estimated Revenue:</strong> ${formatMoney(route.estimatedRevenue)}</p>
    `;
}

// Function to schedule a new flight
function scheduleNewFlight() {
    const routeId = document.getElementById('route-select').value;
    const dateStr = document.getElementById('flight-date').value;
    const timeStr = document.getElementById('flight-time').value;
    
    if (!routeId || !dateStr || !timeStr) {
        alert('Please select a route and specify departure date and time.');
        return;
    }
    
    // Create departure time
    const departureTime = new Date(`${dateStr}T${timeStr}`);
    
    // Create flight
    const result = createFlight(routeId, departureTime);
    
    if (result.success) {
        alert(`Flight ${result.flight.flightNumber} scheduled successfully!`);
        document.body.removeChild(document.querySelector('.modal-overlay'));
        displayFlights();
    } else {
        alert(`Failed to schedule flight: ${result.message}`);
    }
}

// Function to cancel a flight
function cancelFlight(flightId) {
    const flight = gameState.flights.find(f => f.id === flightId);
    if (!flight) return;
    
    if (flight.status !== 'Scheduled') {
        alert('Only scheduled flights can be cancelled.');
        return;
    }
    
    if (confirm(`Are you sure you want to cancel flight ${flight.flightNumber}?`)) {
        // Remove flight from array
        gameState.flights = gameState.flights.filter(f => f.id !== flightId);
        saveGameState();
        displayFlights();
        
        // Hide details if open
        document.getElementById('flight-details').classList.add('hidden');
        
        alert('Flight cancelled successfully.');
    }
}

// Helper function to format date and time
function formatDateTime(date) {
    return date.toLocaleString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit'
    });
}

// Helper function to format date for input fields
function formatDateForInput(date) {
    return date.toISOString().split('T')[0];
}

// Helper function to calculate flight duration
function calculateFlightDuration(departure, arrival) {
    const durationMs = new Date(arrival) - new Date(departure);
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
}

// Add this function to your game.js file to fix the image loading issues

// Fix all image references to use placeholder URLs
function fixImageReferences() {
    // Use placehold.co instead of via.placeholder.com
    const placeholderBaseUrl = "https://placehold.co/300x200/";
    
    // Check if any aircraft in the fleet has image paths that reference local files
    gameState.fleet.forEach(aircraft => {
        // Check if baseImage is a local file path or using the old placeholder service
        if (!aircraft.baseImage || 
            aircraft.baseImage.includes('jpg') || 
            aircraft.baseImage.includes('png') ||
            aircraft.baseImage.includes('via.placeholder.com')) {
            
            let baseColor;
            
            switch(aircraft.type) {
                case "A320":
                    baseColor = "3498db"; // Blue for Airbus
                    break;
                case "A330-300":
                    baseColor = "9b59b6"; // Purple for Airbus widebody
                    break;
                case "B777-300ER":
                    baseColor = "e74c3c"; // Red for Boeing widebody
                    break;
                default:
                    baseColor = "3498db";
            }
            
            aircraft.baseImage = `${placeholderBaseUrl}${baseColor}/ffffff/png?text=${aircraft.type}`;
        }
        
        // Check if customImage is a local file path or using the old placeholder service
        if (aircraft.customImage && 
            (aircraft.customImage.includes('jpg') || 
             aircraft.customImage.includes('png') ||
             aircraft.customImage.includes('via.placeholder.com'))) {
            
            const primaryColor = gameState.airline.primaryColor.replace('#', '');
            const secondaryColor = gameState.airline.secondaryColor.replace('#', '');
            aircraft.customImage = `${placeholderBaseUrl}${primaryColor}/${secondaryColor}/png?text=${aircraft.type}+${gameState.airline.code}`;
        }
    });
    
    // Also check market aircraft
    gameState.market.forEach(aircraft => {
        if (!aircraft.factoryImage || 
            aircraft.factoryImage.includes('jpg') || 
            aircraft.factoryImage.includes('png') ||
            aircraft.factoryImage.includes('via.placeholder.com')) {
            
            const factoryColor = "cccccc"; // Light gray for factory
            aircraft.factoryImage = `${placeholderBaseUrl}${factoryColor}/000000/png?text=${aircraft.type}+Factory`;
        }
        
        if (!aircraft.baseImage || 
            aircraft.baseImage.includes('jpg') || 
            aircraft.baseImage.includes('png') ||
            aircraft.baseImage.includes('via.placeholder.com')) {
            
            let baseColor;
            
            switch(aircraft.type) {
                case "A320neo":
                    baseColor = "3498db"; // Blue for Airbus
                    break;
                case "B737-800":
                    baseColor = "2ecc71"; // Green for Boeing
                    break;
                case "A350-900":
                    baseColor = "9b59b6"; // Purple for Airbus widebody
                    break;
                default:
                    baseColor = "3498db";
            }
            
            aircraft.baseImage = `${placeholderBaseUrl}${baseColor}/ffffff/png?text=${aircraft.type}+Base`;
        }
    });
    
    saveGameState();
}

// Add these functions to make the flight animations work

// Function to show all routes on the map
function showAllRoutes(map) {
    // Clear existing route lines
    map.eachLayer((layer) => {
        if (layer instanceof L.Polyline) {
            map.removeLayer(layer);
        }
    });
    
    // Draw all routes
    routes.forEach(route => {
        const origin = airports[route.origin];
        const destination = airports[route.destination];
        
        if (origin && destination) {
            // Create route line
            const routeLine = L.polyline(
                [[origin.lat, origin.lon], [destination.lat, destination.lon]],
                {
                    color: route.active ? '#2ecc71' : '#95a5a6',
                    weight: 2,
                    opacity: 0.7,
                    dashArray: route.active ? null : '5, 10'
                }
            ).addTo(map);
            
            // Add route info popup
            routeLine.bindPopup(`
                <div class="route-popup">
                    <h3>${route.flightNumber}</h3>
                    <p>${route.origin} → ${route.destination}</p>
                    <p>Distance: ${route.distance.toLocaleString()} km</p>
                    <p>Status: ${route.active ? 'Active' : 'Inactive'}</p>
                </div>
            `);
        }
    });
}

// Function to show only active routes
function showActiveRoutes(map) {
    // Clear existing route lines
    map.eachLayer((layer) => {
        if (layer instanceof L.Polyline) {
            map.removeLayer(layer);
        }
    });
    
    // Draw only active routes
    routes.filter(r => r.active).forEach(route => {
        const origin = airports[route.origin];
        const destination = airports[route.destination];
        
        if (origin && destination) {
            // Create route line
            const routeLine = L.polyline(
                [[origin.lat, origin.lon], [destination.lat, destination.lon]],
                {
                    color: '#2ecc71',
                    weight: 3,
                    opacity: 0.7
                }
            ).addTo(map);
            
            // Add route info popup
            routeLine.bindPopup(`
                <div class="route-popup">
                    <h3>${route.flightNumber}</h3>
                    <p>${route.origin} → ${route.destination}</p>
                    <p>Distance: ${route.distance.toLocaleString()} km</p>
                </div>
            `);
        }
    });
}

// Function to show live flights
function showLiveFlights(map) {
    // Clear existing route lines and flight markers
    map.eachLayer((layer) => {
        if (layer instanceof L.Polyline || layer.options.icon instanceof L.DivIcon) {
            if (layer.options.icon && layer.options.icon.options.html && layer.options.icon.options.html.includes('plane-icon')) {
                map.removeLayer(layer);
            }
        }
    });
    
    // Clear flight markers array
    flightMarkers = [];
    
    // Add active flights
    if (gameState.flights && gameState.flights.length > 0) {
        const activeFlights = gameState.flights.filter(f => f.status === 'In Air');
        
        activeFlights.forEach(flight => {
            addFlightToMap(flight, map);
            
            // Draw route line for this flight
            const route = routes.find(r => r.id === flight.routeId);
            if (route) {
                const origin = airports[route.origin];
                const destination = airports[route.destination];
                
                if (origin && destination) {
                    // Create route line
                    L.polyline(
                        [[origin.lat, origin.lon], [destination.lat, destination.lon]],
                        {
                            color: '#f39c12',
                            weight: 2,
                            opacity: 0.7
                        }
                    ).addTo(map);
                }
            }
        });
        
        // Set up animation interval for flight markers
        if (activeFlights.length > 0) {
            // Clear any existing interval
            if (window.flightAnimationInterval) {
                clearInterval(window.flightAnimationInterval);
            }
            
            // Set new interval
            window.flightAnimationInterval = setInterval(() => updateFlightPositions(map), 5000);
        }
    } else {
        alert('No active flights at the moment.');
    }
}

// Helper function to create test flights if needed
function createTestFlights() {
    // Only create test flights if we have routes but no flights
    if (routes.length > 0 && (!gameState.flights || gameState.flights.length === 0)) {
        // Find an active route
        const activeRoute = routes.find(r => r.active);
        if (activeRoute) {
            // Create a flight that's in progress
            const now = new Date();
            const departureTime = new Date(now);
            departureTime.setHours(departureTime.getHours() - 1); // Departed 1 hour ago
            
            const arrivalTime = new Date(now);
            arrivalTime.setHours(arrivalTime.getHours() + 1); // Will arrive in 1 hour
            
            const testFlight = {
                id: `test-${Date.now()}`,
                routeId: activeRoute.id,
                flightNumber: activeRoute.flightNumber,
                departureTime: departureTime.toISOString(),
                arrivalTime: arrivalTime.toISOString(),
                status: 'In Air',
                passengers: Math.floor(Math.random() * 150) + 50,
                revenue: activeRoute.estimatedRevenue,
                delay: 0
            };
            
            if (!gameState.flights) {
                gameState.flights = [];
            }
            
            gameState.flights.push(testFlight);
            saveGameState();
            
            console.log('Created test flight:', testFlight);
            return true;
        }
    }
    return false;
}

// Add a function to show the aircraft factory and building process
function showAircraftFactory(aircraftType) {
    // Create a modal for the factory view
    const modal = document.createElement('div');
    modal.className = 'modal-overlay factory-modal-overlay';
    
    const aircraft = gameState.market.find(a => a.type === aircraftType);
    if (!aircraft) return;
    
    // Create the factory view HTML
    modal.innerHTML = `
        <div class="factory-modal">
            <h2>Aircraft Factory</h2>
            <div class="factory-content">
                <div class="factory-progress">
                    <div class="progress-stage active" id="stage-1">
                        <div class="stage-icon">🏭</div>
                        <div class="stage-label">Assembly</div>
                    </div>
                    <div class="progress-connector"></div>
                    <div class="progress-stage" id="stage-2">
                        <div class="stage-icon">🔧</div>
                        <div class="stage-label">Testing</div>
                    </div>
                    <div class="progress-connector"></div>
                    <div class="progress-stage" id="stage-3">
                        <div class="stage-icon">🎨</div>
                        <div class="stage-label">Painting</div>
                    </div>
                    <div class="progress-connector"></div>
                    <div class="progress-stage" id="stage-4">
                        <div class="stage-icon">✈️</div>
                        <div class="stage-label">Delivery</div>
                    </div>
                </div>
                
                <div class="factory-visualization">
                    <img id="factory-image" src="${aircraft.factoryImage}" alt="${aircraft.type}">
                    <div class="factory-effects"></div>
                </div>
                
                <div class="factory-info">
                    <h3>${aircraft.type}</h3>
                    <p><strong>Status:</strong> <span id="build-status">Assembly in progress...</span></p>
                    <p><strong>Progress:</strong> <span id="build-progress">0%</span></p>
                    <div class="progress-bar-container">
                        <div class="progress-bar" id="build-progress-bar" style="width: 0%"></div>
                    </div>
                    <p class="eta"><strong>Estimated completion:</strong> <span id="build-eta">Calculating...</span></p>
                </div>
            </div>
            
            <div class="factory-controls">
                <button id="speed-up-btn">Speed Up ($500,000)</button>
                <button id="cancel-build-btn">Cancel</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Set up the build process
    let currentStage = 1;
    let progress = 0;
    const totalStages = 4;
    const buildTime = 60; // seconds for the entire process
    const interval = 100; // update every 100ms
    const progressIncrement = (interval / 1000) / buildTime * 100;
    
    // Calculate ETA
    const startTime = Date.now();
    const endTime = startTime + (buildTime * 1000);
    updateETA();
    
    // Start the build process
    const buildInterval = setInterval(() => {
        progress += progressIncrement;
        
        // Update progress bar
        const progressBar = document.getElementById('build-progress-bar');
        const progressText = document.getElementById('build-progress');
        progressBar.style.width = `${progress}%`;
        progressText.textContent = `${Math.min(Math.round(progress), 100)}%`;
        
        // Update ETA
        updateETA();
        
        // Check for stage changes
        const stageThreshold = 100 / totalStages;
        const newStage = Math.min(Math.floor(progress / stageThreshold) + 1, totalStages);
        
        if (newStage > currentStage) {
            // Update stage
            document.getElementById(`stage-${currentStage}`).classList.remove('active');
            document.getElementById(`stage-${newStage}`).classList.add('active');
            currentStage = newStage;
            
            // Update status text
            const statusText = document.getElementById('build-status');
            switch(currentStage) {
                case 2:
                    statusText.textContent = 'Testing systems...';
                    addEffect('testing');
                    break;
                case 3:
                    statusText.textContent = 'Applying paint...';
                    updateFactoryImage(aircraft.type, 'painting');
                    addEffect('painting');
                    break;
                case 4:
                    statusText.textContent = 'Ready for delivery!';
                    updateFactoryImage(aircraft.type, 'complete');
                    addEffect('complete');
                    break;
            }
        }
        
        // Check if build is complete
        if (progress >= 100) {
            clearInterval(buildInterval);
            
            // Show completion message
            setTimeout(() => {
                const controls = document.querySelector('.factory-controls');
                controls.innerHTML = `
                    <button id="accept-aircraft-btn">Accept Delivery</button>
                `;
                
                document.getElementById('accept-aircraft-btn').addEventListener('click', () => {
                    finalizeAircraftPurchase(aircraftType);
                    document.body.removeChild(modal);
                });
            }, 1000);
        }
    }, interval);
    
    // Function to update the ETA display
    function updateETA() {
        const now = Date.now();
        const remaining = Math.max(0, endTime - now);
        const seconds = Math.ceil(remaining / 1000);
        
        const etaText = document.getElementById('build-eta');
        etaText.textContent = `${seconds} seconds`;
    }
    
    // Function to update the factory image based on stage
    function updateFactoryImage(aircraftType, stage) {
        const image = document.getElementById('factory-image');
        
        if (stage === 'painting') {
            // Show partially painted aircraft
            const primaryColor = gameState.airline.primaryColor.replace('#', '');
            const secondaryColor = gameState.airline.secondaryColor.replace('#', '');
            image.src = `https://placehold.co/300x200/${primaryColor}/${secondaryColor}/png?text=${aircraftType}+Painting`;
        } else if (stage === 'complete') {
            // Show completed aircraft with airline livery
            const primaryColor = gameState.airline.primaryColor.replace('#', '');
            const secondaryColor = gameState.airline.secondaryColor.replace('#', '');
            image.src = `https://placehold.co/300x200/${primaryColor}/${secondaryColor}/png?text=${aircraftType}+${gameState.airline.code}`;
        }
    }
    
    // Function to add visual effects
    function addEffect(effectType) {
        const effectsContainer = document.querySelector('.factory-effects');
        
        switch(effectType) {
            case 'testing':
                effectsContainer.innerHTML = `
                    <div class="effect testing-effect">
                        <div class="spark"></div>
                        <div class="spark"></div>
                        <div class="spark"></div>
                    </div>
                `;
                break;
            case 'painting':
                effectsContainer.innerHTML = `
                    <div class="effect painting-effect">
                        <div class="paint-spray"></div>
                        <div class="paint-spray"></div>
                    </div>
                `;
                break;
            case 'complete':
                effectsContainer.innerHTML = `
                    <div class="effect complete-effect">
                        <div class="sparkle"></div>
                        <div class="sparkle"></div>
                        <div class="sparkle"></div>
                        <div class="sparkle"></div>
                    </div>
                `;
                break;
        }
    }
    
    // Add event listeners for buttons
    document.getElementById('speed-up-btn').addEventListener('click', () => {
        // Check if player can afford speed up
        if (gameState.airline.cash >= 500000) {
            // Deduct cost
            gameState.airline.cash -= 500000;
            saveGameState();
            
            // Double the progress speed
            clearInterval(buildInterval);
            const newInterval = setInterval(() => {
                progress += progressIncrement * 2;
                
                // Update progress bar
                const progressBar = document.getElementById('build-progress-bar');
                const progressText = document.getElementById('build-progress');
                progressBar.style.width = `${progress}%`;
                progressText.textContent = `${Math.min(Math.round(progress), 100)}%`;
                
                // Update ETA
                const now = Date.now();
                const remaining = Math.max(0, endTime - now) / 2; // Half the time
                const seconds = Math.ceil(remaining / 1000);
                
                const etaText = document.getElementById('build-eta');
                etaText.textContent = `${seconds} seconds`;
                
                // Check for stage changes
                const stageThreshold = 100 / totalStages;
                const newStage = Math.min(Math.floor(progress / stageThreshold) + 1, totalStages);
                
                if (newStage > currentStage) {
                    // Update stage
                    document.getElementById(`stage-${currentStage}`).classList.remove('active');
                    document.getElementById(`stage-${newStage}`).classList.add('active');
                    currentStage = newStage;
                    
                    // Update status text
                    const statusText = document.getElementById('build-status');
                    switch(currentStage) {
                        case 2:
                            statusText.textContent = 'Testing systems...';
                            addEffect('testing');
                            break;
                        case 3:
                            statusText.textContent = 'Applying paint...';
                            updateFactoryImage(aircraft.type, 'painting');
                            addEffect('painting');
                            break;
                        case 4:
                            statusText.textContent = 'Ready for delivery!';
                            updateFactoryImage(aircraft.type, 'complete');
                            addEffect('complete');
                            break;
                    }
                }
                
                // Check if build is complete
                if (progress >= 100) {
                    clearInterval(newInterval);
                    
                    // Show completion message
                    setTimeout(() => {
                        const controls = document.querySelector('.factory-controls');
                        controls.innerHTML = `
                            <button id="accept-aircraft-btn">Accept Delivery</button>
                        `;
                        
                        document.getElementById('accept-aircraft-btn').addEventListener('click', () => {
                            finalizeAircraftPurchase(aircraftType);
                            document.body.removeChild(modal);
                        });
                    }, 1000);
                }
            }, interval);
            
            // Disable the speed up button
            document.getElementById('speed-up-btn').disabled = true;
            document.getElementById('speed-up-btn').textContent = 'Production Accelerated';
        } else {
            alert('Not enough funds to speed up production.');
        }
    });
    
    document.getElementById('cancel-build-btn').addEventListener('click', () => {
        clearInterval(buildInterval);
        document.body.removeChild(modal);
    });
}

// Initialize the game when the page loads
initGame();

// Function to generate a unique aircraft registration
function generateRegistration() {
    // Get the airline code
    const airlineCode = gameState.airline.code;
    
    // Generate a random 3-4 digit number
    const randomDigits = Math.floor(Math.random() * 9000) + 1000;
    
    // Create registration in format XX-1234
    return `${airlineCode}-${randomDigits}`;
} 