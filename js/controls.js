
export function setupControls({ convert, SYSTEMS, visualizers }) {

    // =====================================
    // 1. GET HTML ELEMENTS
    // =====================================

    const sourceSelect = document.getElementById("source-system");
    const destinationSelect = document.getElementById("destination-system");

    const addPointBtn = document.getElementById("add-point-btn");
    const coordinateInputs = document.getElementById("coordinate-inputs");
    const convertBtn = document.getElementById("convert-btn");

    const resultsContainer = document.getElementById("conversion-results");
    const resultPlaceholder = document.getElementById("result-placeholder");
    const resultList = document.getElementById("result-list");

    const calculationSection = document.getElementById("calculation-section");
    const calculationContent = document.getElementById("calculation-content");

    const sourceLabel = document.getElementById("source-system-label");
    const destinationLabel = document.getElementById("destination-system-label");

    const engineDot = document.getElementById("engine-dot");
    const engineStatus = document.getElementById("engine-status");

    if (!sourceSelect || !destinationSelect || !coordinateInputs || !convertBtn) {
        console.error("Required coordinate converter HTML elements are missing.");
        return;
    }

    // =====================================
    // 2. SYSTEM INFORMATION
    // =====================================

    const systemNames = {
        [SYSTEMS.CARTESIAN]: "Cartesian",
        [SYSTEMS.POLAR]: "Polar",
        [SYSTEMS.CYLINDRICAL]: "Cylindrical",
        [SYSTEMS.SPHERICAL]: "Spherical"
    };

    const systemFields = {
        [SYSTEMS.CARTESIAN]: [
            { label: "X", placeholder: "Enter X" },
            { label: "Y", placeholder: "Enter Y" },
            { label: "Z", placeholder: "Enter Z" }
        ],

        [SYSTEMS.POLAR]: [
            { label: "r", placeholder: "Enter radius" },
            { label: "θ (degrees)", placeholder: "Enter angle" },
            null
        ],

        [SYSTEMS.CYLINDRICAL]: [
            { label: "ρ", placeholder: "Enter radius" },
            { label: "θ (degrees)", placeholder: "Enter angle" },
            { label: "Z", placeholder: "Enter height" }
        ],

        [SYSTEMS.SPHERICAL]: [
            { label: "r", placeholder: "Enter radius" },
            { label: "θ (degrees)", placeholder: "Enter azimuth" },
            { label: "φ (degrees)", placeholder: "Enter polar angle" }
        ]
    };

    // =====================================
    // 3. GET SELECTED SYSTEM
    // =====================================

    function getSystem(select) {
        const value = String(select.value).toLowerCase();

        const names = {
            cartesian: SYSTEMS.CARTESIAN,
            polar: SYSTEMS.POLAR,
            cylindrical: SYSTEMS.CYLINDRICAL,
            spherical: SYSTEMS.SPHERICAL
        };

        return Object.prototype.hasOwnProperty.call(names, value)
            ? names[value]
            : Number(select.value);
    }

    // =====================================
    // 4. CREATE COORDINATE INPUT ROW
    // =====================================

    function createInputRow(number) {
        const row = document.createElement("div");

        row.className = "coordinate-row";
        row.dataset.point = number;

        row.innerHTML = `
            <div class="coordinate-row-heading">
                <span>Point ${number}</span>
                <button type="button" class="remove-point-btn">
                    Remove
                </button>
            </div>

            <div class="coordinate-fields">

                <label>
                    <span class="field-x-label">X</span>
                    <input type="number" step="any" class="coord-x"
                        placeholder="Enter X">
                </label>

                <label>
                    <span class="field-y-label">Y</span>
                    <input type="number" step="any" class="coord-y"
                        placeholder="Enter Y">
                </label>

                <label>
                    <span class="field-z-label">Z</span>
                    <input type="number" step="any" class="coord-z"
                        placeholder="Enter Z">
                </label>

            </div>
        `;

        coordinateInputs.appendChild(row);
        updateInputLabels();

        return row;
    }

    // =====================================
    // 5. GET ALL INPUT ROWS
    // =====================================

    function getRows() {
        return [...coordinateInputs.querySelectorAll(".coordinate-row")];
    }

    // =====================================
    // 6. UPDATE INPUT LABELS
    // =====================================

    function updateInputLabels() {
        const system = getSystem(sourceSelect);
        const fields = systemFields[system];

        if (!fields) {
            console.error("Unknown coordinate system:", system);
            return;
        }

        const labelClasses = [
            "field-x-label",
            "field-y-label",
            "field-z-label"
        ];

        getRows().forEach(row => {

            const inputs = [
                row.querySelector(".coord-x"),
                row.querySelector(".coord-y"),
                row.querySelector(".coord-z")
            ];

            inputs.forEach((input, index) => {
                if (!input) return;

                const field = fields[index];

                let label = row.querySelector(
                    "." + labelClasses[index]
                );

                // Safely create a missing label
                if (!label && input.parentElement) {
                    label = document.createElement("span");
                    label.className = labelClasses[index];
                    input.parentElement.insertBefore(label, input);
                }

                const wrapper = input.closest("label") || input.parentElement;

                if (!field) {
                    input.value = "";
                    input.disabled = true;

                    if (wrapper) wrapper.style.display = "none";

                    return;
                }

                input.disabled = false;

                if (wrapper) wrapper.style.display = "";

                if (label) label.textContent = field.label;

                input.placeholder = field.placeholder;
            });
        });

        if (sourceLabel) {
            sourceLabel.textContent = systemNames[system] || "Source";
        }

        if (destinationLabel) {
            const destination = getSystem(destinationSelect);

            destinationLabel.textContent =
                systemNames[destination] || "Destination";
        }
    }

    // =====================================
    // 7. READ COORDINATE VALUES
    // =====================================

    function readCoordinates(row) {
        const x = row.querySelector(".coord-x");
        const y = row.querySelector(".coord-y");
        const z = row.querySelector(".coord-z");

        const system = getSystem(sourceSelect);
        const fields = systemFields[system];

        const values = [
            x && x.value !== "" ? Number(x.value) : NaN,
            y && y.value !== "" ? Number(y.value) : NaN,
            z && z.value !== "" ? Number(z.value) : 0
        ];

        if (!fields) return null;

        for (let i = 0; i < 3; i++) {
            if (fields[i] && !Number.isFinite(values[i])) {
                return null;
            }
        }

        return values;
    }

    // =====================================
    // 8. DISPLAY RESULTS
    // =====================================

    function displayResult(values, from, to, status) {
        if (!resultList) return;

        const item = document.createElement("div");
        item.className = "conversion-result-item";

        const destinationName = systemNames[to];

        item.innerHTML = `
            <h4>${destinationName} Coordinates</h4>
            <p>
                ${values.map(value =>
                    Number(value.toFixed(4))
                ).join(", ")}
            </p>
            ${status === 1
                ? `<p class="conversion-warning">
                    Height information is omitted in Polar coordinates.
                   </p>`
                : ""}
        `;

        resultList.appendChild(item);

        if (resultPlaceholder) {
            resultPlaceholder.style.display = "none";
        }

        if (resultsContainer) {
            resultsContainer.style.display = "";
        }
    }

    // =====================================
    // 9. CALCULATION EXPLANATION
    // =====================================

    function displayCalculation(from, to, input, output) {
        if (!calculationContent) return;

        const fromName = systemNames[from];
        const toName = systemNames[to];

        calculationContent.innerHTML = `
            <div class="calculation-step">
                <h4>Step 1: Original Coordinates</h4>
                <p>${fromName}: ${input.join(", ")}</p>
            </div>

            <div class="calculation-step">
                <h4>Step 2: Coordinate Transformation</h4>
                <p>
                    Converting from ${fromName} to ${toName}
                    using the mathematical conversion engine.
                </p>
            </div>

            <div class="calculation-step">
                <h4>Step 3: Final Coordinates</h4>
                <p>${toName}: ${output.map(v =>
                    Number(v.toFixed(4))
                ).join(", ")}</p>
            </div>
        `;

        if (calculationSection) {
            calculationSection.style.display = "";
        }
    }

    // =====================================
    // 10. CONVERT COORDINATES
    // =====================================

    function calculate() {
        const from = getSystem(sourceSelect);
        const to = getSystem(destinationSelect);

        if (!systemFields[from] || !systemNames[to]) {
            alert("Please select valid coordinate systems.");
            return;
        }

        const rows = getRows();

        if (rows.length === 0) {
            alert("Please add at least one coordinate point.");
            return;
        }

        if (resultList) resultList.innerHTML = "";

        let successCount = 0;

        rows.forEach((row, index) => {
            const input = readCoordinates(row);

            if (!input) {
                alert(`Please enter valid coordinates for Point ${index + 1}.`);
                return;
            }

            try {
                const result = convert(from, to, input);

                if (!result || !result.success) {
                    throw new Error("Coordinate conversion failed.");
                }

                displayResult(result.values, from, to, result.status);

                displayCalculation(from, to, input, result.values);

                if (index === 0) {
                    if (visualizers?.source) {
                        visualizers.source.update(from, input);
                    }

                    if (visualizers?.destination) {
                        visualizers.destination.update(to, result.values);
                    }
                }

                successCount++;

            } catch (error) {
                console.error("Conversion error:", error);
                alert(error.message || "Unable to convert coordinates.");
            }
        });

        if (successCount === 0 && resultPlaceholder) {
            resultPlaceholder.style.display = "";
        }
    }

    // =====================================
    // 11. ADD AND REMOVE POINTS
    // =====================================

    if (addPointBtn) {
        addPointBtn.addEventListener("click", () => {
            createInputRow(getRows().length + 1);
        });
    }

    coordinateInputs.addEventListener("click", event => {
        if (!event.target.classList.contains("remove-point-btn")) return;

        const rows = getRows();

        if (rows.length <= 1) {
            alert("At least one coordinate point is required.");
            return;
        }

        event.target.closest(".coordinate-row")?.remove();

        getRows().forEach((row, index) => {
            const heading = row.querySelector(".coordinate-row-heading span");

            if (heading) heading.textContent = `Point ${index + 1}`;

            row.dataset.point = index + 1;
        });
    });

    // =====================================
    // 12. EVENT LISTENERS
    // =====================================

    sourceSelect.addEventListener("change", () => {
        updateInputLabels();

        if (resultList) resultList.innerHTML = "";
    });

    destinationSelect.addEventListener("change", updateInputLabels);

    convertBtn.addEventListener("click", calculate);

    // =====================================
    // 13. INITIALIZE
    // =====================================

    if (getRows().length === 0) {
        createInputRow(1);
    }

    updateInputLabels();

    if (engineDot) engineDot.classList.add("online");

    if (engineStatus) {
        engineStatus.textContent = "C ENGINE: ONLINE";
    }

    console.log("Coordinate controls initialized successfully!");
}
