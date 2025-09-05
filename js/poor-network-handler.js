// Poor Network Handler for Queen Rose Hiking App
// Detects poor network conditions and forces cache-first loading

console.log("[PoorNetwork] Poor network handler loaded");

class PoorNetworkHandler {
    constructor() {
        this.isSlowConnection = false;
        this.networkTimeouts = new Map();
        this.maxNetworkTimeout = 3000; // 3 seconds max wait for network
        this.connectionCheckTimeout = 1500; // 1.5 seconds for connection test
        this.cacheFirstMode = false;
        
        this.init();
    }
    
    init() {
        console.log("[PoorNetwork] Initializing poor network detection...");
        
        // Check connection quality on load
        this.checkConnectionQuality();
        
        // Monitor network events
        this.setupNetworkEventListeners();
        
        // Override fetch for smart caching
        this.setupSmartFetch();
        
        // Periodic connection quality checks
        setInterval(() => this.checkConnectionQuality(), 30000); // Check every 30 seconds
    }
    
    setupNetworkEventListeners() {
        // Listen for online/offline events
        window.addEventListener('online', () => {
            console.log("[PoorNetwork] Device came online");
            this.isSlowConnection = false;
            this.cacheFirstMode = false;
            this.checkConnectionQuality();
        });
        
        window.addEventListener('offline', () => {
            console.log("[PoorNetwork] Device went offline - enabling cache-first mode");
            this.isSlowConnection = true;
            this.cacheFirstMode = true;
        });
        
        // Listen for connection type changes (if supported)
        if ('connection' in navigator) {
            navigator.connection.addEventListener('change', () => {
                this.checkConnectionType();
            });
            this.checkConnectionType();
        }
    }
    
    checkConnectionType() {
        if ('connection' in navigator) {
            const connection = navigator.connection;
            const slowConnections = ['slow-2g', '2g', '3g'];
            
            if (slowConnections.includes(connection.effectiveType)) {
                console.log(`[PoorNetwork] Slow connection detected: ${connection.effectiveType}`);
                this.isSlowConnection = true;
                this.cacheFirstMode = true;
            } else {
                console.log(`[PoorNetwork] Good connection detected: ${connection.effectiveType}`);
                this.isSlowConnection = false;
                this.cacheFirstMode = false;
            }
        }
    }
    
    async checkConnectionQuality() {
        if (!navigator.onLine) {
            this.isSlowConnection = true;
            this.cacheFirstMode = true;
            return;
        }
        
        console.log("[PoorNetwork] Testing connection quality...");
        const startTime = Date.now();
        
        try {
            // Test with a small resource
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this.connectionCheckTimeout);
            
            const response = await fetch('./manifest.json', {
                signal: controller.signal,
                cache: 'no-cache'
            });
            
            clearTimeout(timeoutId);
            const endTime = Date.now();
            const responseTime = endTime - startTime;
            
            if (response.ok && responseTime < 1000) {
                console.log(`[PoorNetwork] Good connection - response time: ${responseTime}ms`);
                this.isSlowConnection = false;
                this.cacheFirstMode = false;
            } else {
                console.log(`[PoorNetwork] Slow connection detected - response time: ${responseTime}ms`);
                this.isSlowConnection = true;
                this.cacheFirstMode = true;
            }
        } catch (error) {
            console.log("[PoorNetwork] Connection test failed - enabling cache-first mode");
            this.isSlowConnection = true;
            this.cacheFirstMode = true;
        }
    }
    
    setupSmartFetch() {
        // Store original fetch
        const originalFetch = window.fetch;
        
        // Override fetch with smart caching
        window.fetch = async (resource, options = {}) => {
            const url = typeof resource === 'string' ? resource : resource.url;
            
            // Skip our smart handling for external APIs
            if (url.includes('open-meteo.com') || url.startsWith('http') && !url.includes('localhost')) {
                return originalFetch(resource, options);
            }
            
            console.log(`[PoorNetwork] Smart fetch for: ${url}`);
            
            // If we're in cache-first mode or have slow connection, try cache first
            if (this.cacheFirstMode || this.isSlowConnection) {
                try {
                    const cachedResponse = await this.getCachedResponse(url);
                    if (cachedResponse) {
                        console.log(`[PoorNetwork] Serving from cache: ${url}`);
                        return cachedResponse;
                    }
                } catch (error) {
                    console.log(`[PoorNetwork] Cache lookup failed for ${url}:`, error);
                }
            }
            
            // Try network with timeout
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => {
                    console.log(`[PoorNetwork] Network timeout for ${url} - falling back to cache`);
                    controller.abort();
                }, this.maxNetworkTimeout);
                
                const networkResponse = await originalFetch(resource, {
                    ...options,
                    signal: controller.signal
                });
                
                clearTimeout(timeoutId);
                
                if (networkResponse.ok) {
                    console.log(`[PoorNetwork] Network success for: ${url}`);
                    return networkResponse;
                }
            } catch (error) {
                console.log(`[PoorNetwork] Network failed for ${url}, trying cache:`, error.message);
                
                // Network failed, try cache as fallback
                try {
                    const cachedResponse = await this.getCachedResponse(url);
                    if (cachedResponse) {
                        console.log(`[PoorNetwork] Cache fallback success for: ${url}`);
                        return cachedResponse;
                    }
                } catch (cacheError) {
                    console.log(`[PoorNetwork] Cache fallback failed for ${url}:`, cacheError);
                }
                
                // Re-throw original network error if cache also fails
                throw error;
            }
            
            // If we get here, try original fetch as last resort
            return originalFetch(resource, options);
        };
    }
    
    async getCachedResponse(url) {
        try {
            const cache = await caches.open('queen-rose-hiking-trail-v7-1-weather-persist');
            const cachedResponse = await cache.match(url);
            return cachedResponse;
        } catch (error) {
            console.log(`[PoorNetwork] Cache access failed:`, error);
            return null;
        }
    }
    
    // Public method to force cache-first mode
    enableCacheFirstMode() {
        console.log("[PoorNetwork] Cache-first mode enabled manually");
        this.cacheFirstMode = true;
        this.isSlowConnection = true;
    }
    
    // Public method to disable cache-first mode
    disableCacheFirstMode() {
        console.log("[PoorNetwork] Cache-first mode disabled manually");
        this.cacheFirstMode = false;
        this.isSlowConnection = false;
    }
    
    // Get current network status
    getNetworkStatus() {
        return {
            isSlowConnection: this.isSlowConnection,
            cacheFirstMode: this.cacheFirstMode,
            isOnline: navigator.onLine
        };
    }
}

// Initialize poor network handler
const poorNetworkHandler = new PoorNetworkHandler();

// Make it globally available
window.poorNetworkHandler = poorNetworkHandler;

console.log("[PoorNetwork] Poor network handler initialized");

