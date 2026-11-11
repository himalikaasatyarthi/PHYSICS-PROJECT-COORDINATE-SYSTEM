
/*
  MULTIVERSE OF COORDINATES
  Main Application Controller
*/

import {
    initializeEngine,
    convert,
    SYSTEMS
} from "./engine.js";

import { createVisualizer } from "./visualizer.js";

import { setupControls } from "./controls.js";


// =====================================
// 1. UPDATE ENGINE STATUS
// =====================================

function updateEngineStatus(online, message) {

    const engineDot = document.getElementById("engine-dot");
    const engineStatus = document.getElementById("engine-status");

    if (engineDot) {
        engineDot.classList.toggle("online", online);
        engineDot.classList.toggle("offline", !online);
    }

    if (engineStatus) {
        engineStatus.textContent = message;
    }
}


// =====================================
// 2. START APPLICATION
// =====================================

async function startApplication() {

    console.log("Starting Multiverse of Coordinates...");

    updateEngineStatus(false, "INITIALIZING C ENGINE...");

    try {

        // Initialize WebAssembly C engine
        await initializeEngine();

        console.log("C Engine: ONLINE");


        // =====================================
        // 3. CREATE 3D VISUALIZERS
        // =====================================

        const sourceVisualizer = createVisualizer("source-scene");

        const destinationVisualizer = createVisualizer("destination-scene");

        const visualizers = {
            source: sourceVisualizer,
            destination: destinationVisualizer
        };


        // =====================================
        // 4. CONNECT COORDINATE CONTROLS
        // =====================================

        setupControls({
            convert,
            SYSTEMS,
            visualizers
        });


        // =====================================
        // 5. EXPOSE ENGINE FOR DEBUGGING
        // =====================================

        window.CoordinateEngine = {
            convert,
            SYSTEMS,
            visualizers
        };


        // =====================================
        // 6. TEST C ENGINE
        // =====================================

        const testResult = convert(
            SYSTEMS.CARTESIAN,
            SYSTEMS.SPHERICAL,
            [3, 4, 12]
        );

        console.log(
            "Sample Cartesian to Spherical:",
            testResult.values
        );


        // =====================================
        // 7. APPLICATION READY
        // =====================================

        updateEngineStatus(true, "C ENGINE: ONLINE");

        console.log("--------------------------------");
        console.log("MULTIVERSE OF COORDINATES READY");
        console.log("--------------------------------");

    } catch (error) {

        console.error("Application initialization failed:", error);

        updateEngineStatus(false, "C ENGINE: OFFLINE");

        const sceneContainer = document.getElementById("source-scene");

        if (sceneContainer) {
            sceneContainer.innerHTML =
                "<p class='visualizer-error'>3D visualizer could not initialize. Check the browser console.</p>";
        }

        const destinationContainer =
            document.getElementById("destination-scene");

        if (destinationContainer) {
            destinationContainer.innerHTML =
                "<p class='visualizer-error'>3D visualizer could not initialize.</p>";
        }
    }
}


// =====================================
// 8. RUN APPLICATION
// =====================================

startApplication();
