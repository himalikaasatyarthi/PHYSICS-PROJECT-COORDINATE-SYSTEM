
/*
  MULTIVERSE OF COORDINATES
  C / WebAssembly Integration Engine
*/

// Coordinate system identifiers
export const SYSTEMS = {
    CARTESIAN: 0,
    POLAR: 1,
    CYLINDRICAL: 2,
    SPHERICAL: 3
};

let wasmModule = null;
let conversionFunction = null;


// Initialize WebAssembly
export async function initializeEngine() {

    if (wasmModule) {
        return true;
    }

    if (typeof window.createCoordinateModule !== "function") {
        throw new Error(
            "WebAssembly module not found. Check coordinates.js."
        );
    }

    wasmModule = await window.createCoordinateModule();

    conversionFunction = wasmModule.cwrap(
        "convertCoordinates",
        "number",
        [
            "number",
            "number",
            "number",
            "number",
            "number",
            "number"
        ]
    );

    console.log(
        "Multiverse C Engine initialized successfully!"
    );

    return true;
}


// Convert coordinates using the C engine
export function convert(from, to, coordinates) {

    if (!wasmModule || !conversionFunction) {
        throw new Error(
            "Coordinate engine has not been initialized."
        );
    }

    if (!Array.isArray(coordinates) ||
        coordinates.length !== 3 ||
        !coordinates.every(Number.isFinite)) {
        throw new Error("Invalid coordinate input.");
    }

    const outputPointer = wasmModule._malloc(24);

    if (!outputPointer) {
        throw new Error("Unable to allocate WebAssembly memory.");
    }

    try {

        // Initialize three output values
        const index = outputPointer / Float64Array.BYTES_PER_ELEMENT;

        wasmModule.HEAPF64.set(
            [0, 0, 0],
            index
        );

        // Call the actual C conversion function
        const status = conversionFunction(
            from,
            to,
            coordinates[0],
            coordinates[1],
            coordinates[2],
            outputPointer
        );

        // Read converted values from WebAssembly memory
        const values = Array.from(
            wasmModule.HEAPF64.slice(index, index + 3)
        );

        if (status === -1) {
            throw new Error(
                "Invalid coordinate system or input values."
            );
        }

        return {
            success: true,
            status,
            values,
            warning: status === 1
                ? "Polar coordinates represent only the XY projection. Height information is omitted."
                : null
        };

    } finally {

        // Release allocated memory
        wasmModule._free(outputPointer);

    }
}


// Check engine status
export function isEngineReady() {
    return wasmModule !== null;
}

