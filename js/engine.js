
/*
  MULTIVERSE OF COORDINATES
  WebAssembly Integration Engine
*/

export const SYSTEMS = {
    CARTESIAN: 0,
    POLAR: 1,
    CYLINDRICAL: 2,
    SPHERICAL: 3
};

let wasmModule = null;
let conversionFunction = null;


// Initialize the C engine
export async function initializeEngine() {

    if (wasmModule) return true;

    if (typeof window.createCoordinateModule !== "function") {
        throw new Error("WebAssembly module not loaded.");
    }

    wasmModule = await window.createCoordinateModule();

    conversionFunction = wasmModule.cwrap(
        "convertCoordinates",
        "number",
        ["number", "number", "number",
         "number", "number", "number"]
    );

    if (!wasmModule.getValue || !wasmModule.setValue) {
        throw new Error(
            "WebAssembly memory helper functions are unavailable."
        );
    }

    console.log("Multiverse C Engine initialized successfully!");

    return true;
}


// Convert coordinates through C
export function convert(from, to, coordinates) {

    if (!wasmModule || !conversionFunction) {
        throw new Error("C engine is not initialized.");
    }

    if (
        !Array.isArray(coordinates) ||
        coordinates.length !== 3 ||
        !coordinates.every(Number.isFinite)
    ) {
        throw new Error("Invalid coordinate input.");
    }

    const outputPointer = wasmModule._malloc(24);

    if (!outputPointer) {
        throw new Error("WebAssembly memory allocation failed.");
    }

    try {

        // Initialize output memory
        for (let i = 0; i < 3; i++) {
            wasmModule.setValue(
                outputPointer + i * 8,
                0,
                "double"
            );
        }

        // Call C conversion function
        const status = conversionFunction(
            from,
            to,
            coordinates[0],
            coordinates[1],
            coordinates[2],
            outputPointer
        );

        // Read converted coordinates
        const values = [];

        for (let i = 0; i < 3; i++) {
            values.push(
                wasmModule.getValue(
                    outputPointer + i * 8,
                    "double"
                )
            );
        }

        if (status === -1) {
            throw new Error(
                "Invalid coordinate system or input values."
            );
        }

        return {
            success: true,
            status: status,
            values: values,
            warning: status === 1
                ? "Polar coordinates show only the XY projection. Height information is omitted."
                : null
        };

    } finally {

        wasmModule._free(outputPointer);

    }
}


// Engine status
export function isEngineReady() {
    return wasmModule !== null;
}
