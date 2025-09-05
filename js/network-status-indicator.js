// Network Status Indicator for Queen Rose Hiking App
// Shows users when they're in poor network conditions

console.log("[NetworkStatus] Network status indicator loaded");

class NetworkStatusIndicator {
    constructor() {
        this.indicator = null;
        this.currentStatus = 'unknown';
        this.isVisible = false;
        
        this.init();
    }
    
    init() {
        this.createIndicator();
        this.setupEventListeners();
        this.checkInitialStatus();
    }
    
    createIndicator() {
        // Create status indicator element
        this.indicator = document.createElement('div');
        this.indicator.id = 'network-status-indicator';
        this.indicator.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            z-index: 10000;
            padding: 8px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 500;
            color: white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            transition: all 0.3s ease;
            transform: translateY(-100px);
            opacity: 0;
            pointer-events: none;
            max-width: 200px;
            text-align: center;
        `;
        
        document.body.appendChild(this.indicator);
    }
    
    setupEventListeners() {
        // Listen for network events
        window.addEventListener('online', () => {
            this.updateStatus('online');
        });
        
        window.addEventListener('offline', () => {
            this.updateStatus('offline');
        });
        
        // Listen for poor network detection from our handler
        if (window.poorNetworkHandler) {
            // Check status periodically
            setInterval(() => {
                const status = window.poorNetworkHandler.getNetworkStatus();
                if (status.isSlowConnection && navigator.onLine) {
                    this.updateStatus('slow');
                } else if (navigator.onLine && !status.isSlowConnection) {
                    this.updateStatus('good');
                }
            }, 5000);
        }
    }
    
    checkInitialStatus() {
        if (!navigator.onLine) {
            this.updateStatus('offline');
        } else {
            // Wait a bit for poor network handler to initialize
            setTimeout(() => {
                if (window.poorNetworkHandler) {
                    const status = window.poorNetworkHandler.getNetworkStatus();
                    if (status.isSlowConnection) {
                        this.updateStatus('slow');
                    } else {
                        this.updateStatus('good');
                    }
                } else {
                    this.updateStatus('good');
                }
            }, 2000);
        }
    }
    
    updateStatus(status) {
        if (this.currentStatus === status) return;
        
        this.currentStatus = status;
        
        let message = '';
        let backgroundColor = '';
        let shouldShow = false;
        
        switch (status) {
            case 'offline':
                message = '📱 Offline Mode';
                backgroundColor = '#f44336';
                shouldShow = true;
                break;
                
            case 'slow':
                message = '🐌 Slow Connection - Using Cache';
                backgroundColor = '#ff9800';
                shouldShow = true;
                break;
                
            case 'good':
                message = '✅ Good Connection';
                backgroundColor = '#4caf50';
                shouldShow = true;
                // Hide good connection status after 3 seconds
                setTimeout(() => {
                    if (this.currentStatus === 'good') {
                        this.hide();
                    }
                }, 3000);
                break;
                
            default:
                shouldShow = false;
        }
        
        if (shouldShow) {
            this.show(message, backgroundColor);
        } else {
            this.hide();
        }
    }
    
    show(message, backgroundColor) {
        if (!this.indicator) return;
        
        this.indicator.textContent = message;
        this.indicator.style.backgroundColor = backgroundColor;
        this.indicator.style.transform = 'translateY(0)';
        this.indicator.style.opacity = '1';
        this.isVisible = true;
        
        console.log(`[NetworkStatus] Showing status: ${message}`);
    }
    
    hide() {
        if (!this.indicator || !this.isVisible) return;
        
        this.indicator.style.transform = 'translateY(-100px)';
        this.indicator.style.opacity = '0';
        this.isVisible = false;
        
        console.log('[NetworkStatus] Hiding status indicator');
    }
    
    // Public method to manually trigger status update
    refresh() {
        this.checkInitialStatus();
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const networkStatusIndicator = new NetworkStatusIndicator();
    window.networkStatusIndicator = networkStatusIndicator;
    
    console.log("[NetworkStatus] Network status indicator initialized");
});

console.log("[NetworkStatus] Network status indicator script loaded");

