
import {
    initializeEngine,
    convert,
    SYSTEMS
} from "./engine.js";

// ===================================
// MULTIVERSE OF COORDINATES
// MAIN APPLICATION
// ===================================

async function startApplication() {

    console.log(
        "Starting Multiverse of Coordinates..."
    );

    try {

        // Initialize C / WebAssembly
        await initializeEngine();

        console.log("C Engine: ONLINE");

        // Make engine available for other modules
        window.CoordinateEngine = {
            convert,
            SYSTEMS
        };

        // Test a sample coordinate
        // Cartesian (3, 4, 12)
        const result = convert(
            SYSTEMS.CARTESIAN,
            SYSTEMS.SPHERICAL,
            [3, 4, 12]
        );

        console.log(
            "Sample Cartesian to Spherical:",
            result.values
        );

        console.log(
            "Multiverse of Coordinates is ready!"
        );

    } catch (error) {

        console.error(
            "Engine initialization failed:",
            error
        );

    }
}

// Start application
startApplication();

