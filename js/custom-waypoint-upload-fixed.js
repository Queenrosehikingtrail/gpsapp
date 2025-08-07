// Custom Waypoint Upload System - Queen Rose Hiking Trail App
// Allows users to upload waypoint files (GPX, KML, CSV) and display them on the map

console.log('🎯 Custom Waypoint Upload System - Loading...');

window.customWaypointUpload = {
    uploadedWaypoints: [],
    
    // Initialize the upload system
    init: function() {
        console.log('🎯 Initializing custom waypoint upload...');
        this.createUploadInterface();
        this.setupEventListeners();
        this.loadStoredWaypoints();
    },
    
    // Create the upload interface
    createUploadInterface: function() {
        // Find the existing My KML Files section and add waypoint upload there
        const kmlSection = document.getElementById('my-kmls-section');
        
        if (kmlSection && !document.getElementById('waypoint-file-input')) {
            // Add waypoint upload to the existing KML section
            const uploadDiv = document.createElement('div');
            uploadDiv.innerHTML = `
                <div style="margin-top: 20px; padding: 15px; border: 1px solid #ddd; border-radius: 8px; background-color: #f9f9f9;">
                    <h3 style="color: #2E7D32; margin-bottom: 15px;">📍 Custom Waypoint Upload</h3>
                    <p style="margin-bottom: 15px; color: #666;">Upload your own waypoint files (GPX, KML, CSV) to display them on the map.</p>
                    
                    <div style="margin-bottom: 15px;">
                        <input type="file" id="waypoint-file-input" accept=".gpx,.kml,.csv,.txt" style="margin-bottom: 10px;">
                        <button id="upload-waypoints-btn" style="background-color: #2E7D32; color: white; padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer;">
                            📤 Upload Waypoints
                        </button>
                    </div>
                    
                    <div id="waypoint-upload-status" style="margin-bottom: 15px; font-weight: bold;"></div>
                    
                    <div id="uploaded-waypoints-list">
                        <h4 style="color: #2E7D32; margin-bottom: 10px;">Uploaded Waypoint Files:</h4>
                        <div id="waypoint-files-container" style="max-height: 200px; overflow-y: auto;">
                            <p style="color: #666; font-style: italic;">No waypoint files uploaded yet.</p>
                        </div>
                    </div>
                </div>
            `;
            
            kmlSection.appendChild(uploadDiv);
            console.log('✅ Waypoint upload interface created');
        }
    },
    
    // Setup event listeners
    setupEventListeners: function() {
        const uploadBtn = document.getElementById('upload-waypoints-btn');
        const fileInput = document.getElementById('waypoint-file-input');
        
        if (uploadBtn && fileInput) {
            uploadBtn.addEventListener('click', () => {
                const file = fileInput.files[0];
                if (file) {
                    this.processWaypointFile(file);
                } else {
                    this.showStatus('Please select a file first.', 'error');
                }
            });
            
            console.log('✅ Event listeners setup complete');
        }
    },
    
    // Process uploaded waypoint file
    processWaypointFile: function(file) {
        console.log('📁 Processing waypoint file:', file.name);
        this.showStatus('Processing file...', 'info');
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target.result;
            const fileExtension = file.name.split('.').pop().toLowerCase();
            
            try {
                let waypoints = [];
                
                if (fileExtension === 'gpx') {
                    waypoints = this.parseGPX(content);
                } else if (fileExtension === 'kml') {
                    waypoints = this.parseKML(content);
                } else if (fileExtension === 'csv') {
                    waypoints = this.parseCSV(content);
                } else {
                    throw new Error('Unsupported file format');
                }
                
                if (waypoints.length > 0) {
                    this.addWaypointsToMap(waypoints, file.name);
                    this.showStatus(`Successfully uploaded ${waypoints.length} waypoints!`, 'success');
                } else {
                    this.showStatus('No waypoints found in file.', 'warning');
                }
                
            } catch (error) {
                console.error('Error processing waypoint file:', error);
                this.showStatus('Error processing file: ' + error.message, 'error');
            }
        };
        
        reader.readAsText(file);
    },
    
    // Parse GPX file
    parseGPX: function(content) {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(content, 'text/xml');
        const waypoints = [];
        
        // Parse waypoints
        const wptElements = xmlDoc.getElementsByTagName('wpt');
        for (let i = 0; i < wptElements.length; i++) {
            const wpt = wptElements[i];
            const lat = parseFloat(wpt.getAttribute('lat'));
            const lon = parseFloat(wpt.getAttribute('lon'));
            const name = wpt.getElementsByTagName('name')[0]?.textContent || `Waypoint ${i + 1}`;
            const desc = wpt.getElementsByTagName('desc')[0]?.textContent || '';
            
            waypoints.push({
                lat: lat,
                lng: lon,
                name: name,
                description: desc
            });
        }
        
        console.log(`📍 Parsed ${waypoints.length} waypoints from GPX`);
        return waypoints;
    },
    
    // Parse KML file
    parseKML: function(content) {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(content, 'text/xml');
        const waypoints = [];
        
        // Parse placemarks
        const placemarks = xmlDoc.getElementsByTagName('Placemark');
        for (let i = 0; i < placemarks.length; i++) {
            const placemark = placemarks[i];
            const name = placemark.getElementsByTagName('name')[0]?.textContent || `Waypoint ${i + 1}`;
            const desc = placemark.getElementsByTagName('description')[0]?.textContent || '';
            const coordinates = placemark.getElementsByTagName('coordinates')[0]?.textContent;
            
            if (coordinates) {
                const coords = coordinates.trim().split(',');
                if (coords.length >= 2) {
                    waypoints.push({
                        lat: parseFloat(coords[1]),
                        lng: parseFloat(coords[0]),
                        name: name,
                        description: desc
                    });
                }
            }
        }
        
        console.log(`📍 Parsed ${waypoints.length} waypoints from KML`);
        return waypoints;
    },
    
    // Parse CSV file
    parseCSV: function(content) {
        const lines = content.split('\n');
        const waypoints = [];
        
        for (let i = 1; i < lines.length; i++) { // Skip header
            const line = lines[i].trim();
            if (line) {
                const parts = line.split(',');
                if (parts.length >= 2) {
                    const lat = parseFloat(parts[0]);
                    const lng = parseFloat(parts[1]);
                    const name = parts[2] || `Waypoint ${i}`;
                    const desc = parts[3] || '';
                    
                    if (!isNaN(lat) && !isNaN(lng)) {
                        waypoints.push({
                            lat: lat,
                            lng: lng,
                            name: name,
                            description: desc
                        });
                    }
                }
            }
        }
        
        console.log(`📍 Parsed ${waypoints.length} waypoints from CSV`);
        return waypoints;
    },
    
    // Add waypoints to map
    addWaypointsToMap: function(waypoints, filename) {
        console.log(`🗺️ Adding ${waypoints.length} waypoints to map`);
        
        // Get map instance - try multiple possible references
        let map = null;
        if (window.leafletMap) {
            map = window.leafletMap;
            console.log('📍 Found map as window.leafletMap');
        } else if (window.map) {
            map = window.map;
            console.log('📍 Found map as window.map');
        } else if (window.myMap) {
            map = window.myMap;
            console.log('📍 Found map as window.myMap');
        } else if (window.mapInstance) {
            map = window.mapInstance;
            console.log('📍 Found map as window.mapInstance');
        } else {
            // Try to find map in global scope
            for (let key in window) {
                if (window[key] && typeof window[key] === 'object' && window[key]._container) {
                    map = window[key];
                    console.log(`📍 Found map as window.${key}`);
                    break;
                }
            }
        }
        
        if (!map) {
            console.error('❌ Map instance not found - available objects:', Object.keys(window).filter(k => k.includes('map')));
            this.showStatus('Error: Map not available. Please ensure map is loaded.', 'error');
            return;
        }
        
        console.log('✅ Map instance found:', map);
        
        // Create layer group for waypoints with custom styling
        const waypointLayer = L.layerGroup();
        
        waypoints.forEach((waypoint, index) => {
            console.log(`📍 Creating marker for: ${waypoint.name} at [${waypoint.lat}, ${waypoint.lng}]`);
            
            // Use simple circle marker that doesn't require external resources
            const marker = L.circleMarker([waypoint.lat, waypoint.lng], {
                radius: 8,
                fillColor: '#ff4444',
                color: '#ffffff',
                weight: 2,
                opacity: 1,
                fillOpacity: 0.8
            }).bindPopup(`<strong>${waypoint.name}</strong><br>${waypoint.description || 'Custom waypoint'}`);
            
            waypointLayer.addLayer(marker);
            console.log(`📌 Added circle marker to layer: ${waypoint.name}`);
        });
        
        // Add to map
        try {
            waypointLayer.addTo(map);
            console.log('✅ Waypoint layer added to map');
        } catch (error) {
            console.error('❌ Error adding waypoints to map:', error);
            this.showStatus('Error adding waypoints to map: ' + error.message, 'error');
            return;
        }
        
        // Store the layer for later management
        const waypointData = {
            filename: filename,
            layer: waypointLayer,
            waypoints: waypoints, // Store original waypoint data for persistence
            count: waypoints.length,
            timestamp: new Date().toLocaleDateString(),
            visible: true // Default to visible when first uploaded
        };
        
        this.uploadedWaypoints.push(waypointData);
        
        // Save to localStorage
        this.saveWaypointsToStorage();
        
        // Update UI
        this.updateWaypointsList();
        
        // Zoom to waypoints
        if (waypoints.length > 0) {
            try {
                const group = new L.featureGroup(waypointLayer.getLayers());
                map.fitBounds(group.getBounds().pad(0.1));
                console.log('✅ Map zoomed to waypoints');
            } catch (error) {
                console.log('⚠️ Could not zoom to waypoints:', error);
            }
        }
        
        console.log('✅ Waypoints added to map successfully');
        this.showStatus(`${waypoints.length} waypoints added to map and saved!`, 'success');
    },
    
    // Update waypoints list in UI
    updateWaypointsList: function() {
        const container = document.getElementById('waypoint-files-container');
        if (!container) return;
        
        if (this.uploadedWaypoints.length === 0) {
            container.innerHTML = '<p style="color: #666; font-style: italic;">No waypoint files uploaded yet.</p>';
        } else {
            let html = '';
            this.uploadedWaypoints.forEach((item, index) => {
                const isVisible = item.visible !== false; // Default to visible
                const eyeIcon = isVisible ? '👁️' : '👁️‍🗨️';
                const eyeTitle = isVisible ? 'Hide waypoints' : 'Show waypoints';
                
                html += `
                    <div style="padding: 8px; border: 1px solid #ddd; margin-bottom: 5px; border-radius: 4px; background-color: white; display: flex; align-items: center; justify-content: space-between;">
                        <div style="flex: 1;">
                            <strong>${item.filename}</strong><br>
                            <small style="color: #666;">${item.count} waypoints • ${item.timestamp}</small>
                        </div>
                        <div style="display: flex; gap: 5px;">
                            <button onclick="window.customWaypointUpload.toggleWaypointVisibility(${index})" 
                                    style="background: ${isVisible ? '#4caf50' : '#9e9e9e'}; color: white; border: none; padding: 4px 8px; border-radius: 3px; cursor: pointer; font-size: 14px;"
                                    title="${eyeTitle}">
                                ${eyeIcon}
                            </button>
                            <button onclick="window.customWaypointUpload.removeWaypoints(${index})" 
                                    style="background: #f44336; color: white; border: none; padding: 4px 8px; border-radius: 3px; cursor: pointer;"
                                    title="Remove waypoints">
                                ×
                            </button>
                        </div>
                    </div>
                `;
            });
            container.innerHTML = html;
        }
    },
    
    // Toggle waypoint visibility
    toggleWaypointVisibility: function(index) {
        if (!this.uploadedWaypoints[index]) return;
        
        const item = this.uploadedWaypoints[index];
        const map = window.leafletMap || window.map || window.myMap;
        
        if (!map || !item.layer) {
            console.error('Map or layer not found');
            return;
        }
        
        // Toggle visibility state
        item.visible = item.visible !== false ? false : true;
        
        if (item.visible) {
            // Show waypoints
            if (!map.hasLayer(item.layer)) {
                map.addLayer(item.layer);
            }
            console.log(`👁️ Showing waypoints: ${item.filename}`);
            this.showStatus(`Showing waypoints: ${item.filename}`, 'success');
        } else {
            // Hide waypoints
            if (map.hasLayer(item.layer)) {
                map.removeLayer(item.layer);
            }
            console.log(`👁️‍🗨️ Hiding waypoints: ${item.filename}`);
            this.showStatus(`Hiding waypoints: ${item.filename}`, 'info');
        }
        
        // Save updated state to localStorage
        this.saveWaypointsToStorage();
        
        // Update UI to reflect new state
        this.updateWaypointsList();
    },

    // Remove waypoints
    removeWaypoints: function(index) {
        if (this.uploadedWaypoints[index]) {
            const map = window.leafletMap || window.map || window.myMap;
            if (map && this.uploadedWaypoints[index].layer) {
                map.removeLayer(this.uploadedWaypoints[index].layer);
            }
            this.uploadedWaypoints.splice(index, 1);
            
            // Update localStorage after removal
            this.saveWaypointsToStorage();
            
            this.updateWaypointsList();
            this.showStatus('Waypoints removed', 'info');
        }
    },
    
    // Save waypoints to localStorage
    saveWaypointsToStorage: function() {
        try {
            const waypointData = this.uploadedWaypoints.map(item => ({
                filename: item.filename,
                waypoints: item.waypoints,
                count: item.count,
                timestamp: item.timestamp,
                visible: item.visible
            }));
            
            localStorage.setItem('queenRoseWaypoints', JSON.stringify(waypointData));
            console.log('💾 Waypoints saved to localStorage');
        } catch (error) {
            console.error('❌ Error saving waypoints to localStorage:', error);
        }
    },

    // Load waypoints from localStorage
    loadStoredWaypoints: function() {
        try {
            const stored = localStorage.getItem('queenRoseWaypoints');
            if (stored) {
                const waypointData = JSON.parse(stored);
                console.log(`📂 Loading ${waypointData.length} stored waypoint files...`);
                
                waypointData.forEach(item => {
                    if (item.waypoints && item.waypoints.length > 0) {
                        // Recreate the waypoint layer
                        this.addWaypointsToMap(item.waypoints, item.filename);
                        
                        // Set visibility state
                        const lastIndex = this.uploadedWaypoints.length - 1;
                        if (lastIndex >= 0) {
                            this.uploadedWaypoints[lastIndex].visible = item.visible;
                            
                            // Hide if it was hidden before
                            if (!item.visible) {
                                this.toggleWaypointVisibility(lastIndex);
                            }
                        }
                    }
                });
                
                console.log('✅ Stored waypoints loaded successfully');
            } else {
                console.log('📂 No stored waypoints found');
            }
        } catch (error) {
            console.error('❌ Error loading stored waypoints:', error);
        }
    },

    // Show status message
    showStatus: function(message, type) {
        const statusDiv = document.getElementById('waypoint-upload-status');
        if (statusDiv) {
            statusDiv.textContent = message;
            statusDiv.style.color = type === 'error' ? '#f44336' : 
                                   type === 'success' ? '#4caf50' : 
                                   type === 'warning' ? '#ff9800' : '#2196f3';
            
            // Clear status after 5 seconds
            setTimeout(() => {
                statusDiv.textContent = '';
            }, 5000);
        }
    }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            if (window.customWaypointUpload) {
                window.customWaypointUpload.init();
            }
        }, 1000);
    });
} else {
    setTimeout(() => {
        if (window.customWaypointUpload) {
            window.customWaypointUpload.init();
        }
    }, 1000);
}

console.log('📦 Custom Waypoint Upload System script loaded');

