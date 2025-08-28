/**
 * Trail Loading Test Utility for Queen Rose Hiking Trail App
 * Provides debugging and testing functions for trail loading system
 */

console.log('🧪 Loading Trail Loading Test Utility...');

class TrailLoadingTester {
    constructor() {
        this.testResults = {};
        this.embeddedTrailCount = 0;
        this.regularTrailCount = 0;
    }
    
    // Test all trail types
    async testAllTrails() {
        console.log('🧪 [Trail Test] Starting comprehensive trail loading test...');
        
        if (typeof trailsData === 'undefined') {
            console.error('🧪 [Trail Test] ❌ trailsData not available');
            return false;
        }
        
        const results = {
            embedded: [],
            regular: [],
            failed: [],
            total: trailsData.length
        };
        
        for (const trail of trailsData) {
            try {
                console.log(`🧪 [Trail Test] Testing trail: ${trail.id} (${trail.name})`);
                
                // Check if it's an embedded trail
                if (typeof hasEmbeddedKMLData === 'function' && hasEmbeddedKMLData(trail.kmlFilename)) {
                    console.log(`🧪 [Trail Test] ✅ ${trail.id} is embedded trail`);
                    results.embedded.push({
                        id: trail.id,
                        name: trail.name,
                        kmlFilename: trail.kmlFilename,
                        type: trail.type,
                        hasData: !!getEmbeddedKMLData(trail.kmlFilename)
                    });
                    this.embeddedTrailCount++;
                } else {
                    console.log(`🧪 [Trail Test] 📁 ${trail.id} is regular KML file trail`);
                    results.regular.push({
                        id: trail.id,
                        name: trail.name,
                        kmlFilename: trail.kmlFilename,
                        type: trail.type,
                        kmlPath: `/kml/${trail.kmlFilename}`
                    });
                    this.regularTrailCount++;
                }
            } catch (error) {
                console.error(`🧪 [Trail Test] ❌ Error testing trail ${trail.id}:`, error);
                results.failed.push({
                    id: trail.id,
                    name: trail.name,
                    error: error.message
                });
            }
        }
        
        this.testResults = results;
        this.logTestResults();
        return results;
    }
    
    // Test embedded KML system
    testEmbeddedSystem() {
        console.log('🧪 [Trail Test] Testing embedded KML system...');
        
        const tests = {
            hasEmbeddedKMLData: typeof hasEmbeddedKMLData === 'function',
            getEmbeddedKMLData: typeof getEmbeddedKMLData === 'function',
            hasPenrynEmbeddedKMLData: typeof hasPenrynEmbeddedKMLData === 'function',
            getPenrynEmbeddedKMLData: typeof getPenrynEmbeddedKMLData === 'function'
        };
        
        console.log('🧪 [Trail Test] Embedded system functions:', tests);
        
        // Test Penryn trails specifically
        const penrynTrails = [
            'PenrynDay1-7.9km.kml',
            'PenrynDay2-10.1km.kml',
            'PenrynDay3-9.8km.kml',
            'PenrynDay4-6.2km.kml',
            'PenrynDay5-12.7km.kml',
            'PenrynDay6-7.0km.kml'
        ];
        
        for (const filename of penrynTrails) {
            const hasData = hasEmbeddedKMLData && hasEmbeddedKMLData(filename);
            const dataLength = hasData ? getEmbeddedKMLData(filename)?.length : 0;
            console.log(`🧪 [Trail Test] ${filename}: ${hasData ? '✅' : '❌'} (${dataLength} chars)`);
        }
        
        return tests;
    }
    
    // Test network timeout handling
    async testNetworkTimeouts() {
        console.log('🧪 [Trail Test] Testing network timeout handling...');
        
        // Test KML file request timeout
        const testUrl = '/kml/RamPumpTrail-1.6km.kml';
        const startTime = Date.now();
        
        try {
            const response = await fetch(testUrl);
            const endTime = Date.now();
            const duration = endTime - startTime;
            
            console.log(`🧪 [Trail Test] KML fetch test: ${response.ok ? '✅' : '❌'} (${duration}ms)`);
            return {
                success: response.ok,
                duration: duration,
                status: response.status
            };
        } catch (error) {
            const endTime = Date.now();
            const duration = endTime - startTime;
            console.log(`🧪 [Trail Test] KML fetch test: ❌ ${error.message} (${duration}ms)`);
            return {
                success: false,
                duration: duration,
                error: error.message
            };
        }
    }
    
    // Log comprehensive test results
    logTestResults() {
        if (!this.testResults) {
            console.log('🧪 [Trail Test] No test results available');
            return;
        }
        
        const { embedded, regular, failed, total } = this.testResults;
        
        console.log('🧪 [Trail Test] ========== TRAIL LOADING TEST RESULTS ==========');
        console.log(`🧪 [Trail Test] Total trails: ${total}`);
        console.log(`🧪 [Trail Test] Embedded trails: ${embedded.length}`);
        console.log(`🧪 [Trail Test] Regular KML trails: ${regular.length}`);
        console.log(`🧪 [Trail Test] Failed trails: ${failed.length}`);
        
        if (embedded.length > 0) {
            console.log('🧪 [Trail Test] --- EMBEDDED TRAILS ---');
            embedded.forEach(trail => {
                console.log(`🧪 [Trail Test] ✅ ${trail.id}: ${trail.hasData ? 'Data OK' : 'No Data'}`);
            });
        }
        
        if (regular.length > 0) {
            console.log('🧪 [Trail Test] --- REGULAR KML TRAILS ---');
            regular.forEach(trail => {
                console.log(`🧪 [Trail Test] 📁 ${trail.id}: ${trail.kmlPath}`);
            });
        }
        
        if (failed.length > 0) {
            console.log('🧪 [Trail Test] --- FAILED TRAILS ---');
            failed.forEach(trail => {
                console.log(`🧪 [Trail Test] ❌ ${trail.id}: ${trail.error}`);
            });
        }
        
        console.log('🧪 [Trail Test] ================================================');
    }
    
    // Quick diagnostic function
    quickDiagnostic() {
        console.log('🧪 [Trail Test] Running quick diagnostic...');
        
        const diagnostics = {
            trailsDataAvailable: typeof trailsData !== 'undefined',
            trailsDataLength: typeof trailsData !== 'undefined' ? trailsData.length : 0,
            loadTrailFunction: typeof loadTrail === 'function',
            embeddedSystemAvailable: typeof hasEmbeddedKMLData === 'function',
            mapInitialized: typeof map !== 'undefined' && map !== null,
            leafletAvailable: typeof L !== 'undefined',
            toGeoJSONAvailable: typeof toGeoJSON !== 'undefined'
        };
        
        console.log('🧪 [Trail Test] Quick Diagnostic Results:', diagnostics);
        return diagnostics;
    }
}

// Make tester globally available for debugging
window.trailLoadingTester = new TrailLoadingTester();

// Auto-run quick diagnostic
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => window.trailLoadingTester.quickDiagnostic(), 2000);
    });
} else {
    setTimeout(() => window.trailLoadingTester.quickDiagnostic(), 2000);
}

console.log('✅ Trail Loading Test Utility loaded');
console.log('🧪 Use window.trailLoadingTester.testAllTrails() to run comprehensive tests');

