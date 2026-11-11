
/*
  MULTIVERSE OF COORDINATES
  Coordinate Controls
*/

export function setupControls({ convert, SYSTEMS, visualizers }) {

    // =====================================
    // 1. GET HTML ELEMENTS
    // =====================================

    const sourceSelect = document.getElementById("source-system");
    const destinationSelect = document.getElementById("destination-system");

    const addPointButton = document.getElementById("add-point-btn");
    const coordinateInputs = document.getElementById("coordinate-inputs");
    const convertButton = document.getElementById("convert-btn");

    const resultsContainer = document.getElementById("conversion-results");
    const resultPlaceholder = document.getElementById("result-placeholder");
    const resultList = document.getElementById("result-list");

    const calculationSection = document.getElementById("calculation-section");
    const calculationContent = document.getElementById("calculation-content");

    const sourceLabel = document.getElementById("source-system-label");
    const destinationLabel = document.getElementById("destination-system-label");

    const engineDot = document.getElementById("engine-dot");
    const engineStatus = document.getElementById("engine-status");

    if (!sourceSelect || !destinationSelect || !coordinateInputs || !convertButton) {
        console.error("Required converter elements are missing.");
        return;
    }

    // =====================================
    // 2. COORDINATE SYSTEM INFORMATION
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
            { label: "θ (degrees)", placeholder: "Enter angle" }
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

    function getSystem(select) {
        const value = select.value.toLowerCase();

        const names = {
            cartesian: SYSTEMS.CARTESIAN,
            polar: SYSTEMS.POLAR,
            cylindrical: SYSTEMS.CYLINDRICAL,
            spherical: SYSTEMS.SPHERICAL
        };

        return names[value] ?? Number(value);
    }

    // =====================================
    // 3. CREATE COORDINATE INPUT ROW
    // =====================================

    function createInputRow(index) {
        const row = document.createElement("div");

        row.className = "coordinate-row";
        row.dataset.point = index;

        row.innerHTML = `
            <div class="coordinate-row-heading">
                <strong>Point ${index + 1}</strong>
                <button type="button" class="remove-point-btn">
                    Remove
                </button>
            </div>

            <div class="coordinate-fields">
                <label>
                    <span class="field-x-label">X</span>
                    <input type="number" step="any"
                        class="coord-x" placeholder="Enter X">
                </label>

                <label>
                    <span class="field-y-label">Y</span>
                    <input type="number" step="any"
                        class="coord-y" placeholder="Enter Y">
                </label>

                <label>
                    <span class="field-z-label">Z</span>
                    <input type="number" step="any"
                        class="coord-z" placeholder="Enter Z">
                </label>
            </div>
        `;

        return row;
    }

    function getRows() {
        return [...coordinateInputs.querySelectorAll(".coordinate-row")];
    }

    function updateInputLabels() {
        const system = getSystem(sourceSelect);
        const fields = systemFields[system];

        if (!fields) return;

        getRows().forEach(row => {
            const inputs = [
                row.querySelector(".coord-x"),
                row.querySelector(".coord-y"),
                row.querySelector(".coord-z")
            ];

            const labels = [
                row.querySelector(".field-x-label"),
                row.querySelector(".field-y-label"),
                row.querySelector(".field-z-label")
            ];

            inputs.forEach((input, index) => {
                const field = fields[index];

                input.parentElement.style.display = field ? "" : "none";

                if (field) {
                    labels[index].textContent = field.label;
                    input.placeholder = field.placeholder;
                } else {
                    input.value = "";
                }
            });
        });

        if (sourceLabel) {
            sourceLabel.textContent = systemNames[system] || "Source";
        }

        if (destinationLabel) {
            destinationLabel.textContent =
                systemNames[getSystem(destinationSelect)] || "Destination";
        }
    }

    // =====================================
    // 4. ADD AND REMOVE POINTS
    // =====================================

    if (getRows().length === 0) {
        coordinateInputs.appendChild(createInputRow(0));
    }

    function refreshRows() {
        getRows().forEach((row, index) => {
            row.dataset.point = index;

            const heading = row.querySelector("strong");
            if (heading) heading.textContent = `Point ${index + 1}`;

            const removeButton = row.querySelector(".remove-point-btn");

            if (removeButton) {
                removeButton.disabled = getRows().length === 1;
            }
        });

        updateInputLabels();
    }

    if (addPointButton) {
        addPointButton.addEventListener("click", () => {
            coordinateInputs.appendChild(
                createInputRow(getRows().length)
            );

            refreshRows();
        });
    }

    coordinateInputs.addEventListener("click", event => {
        if (event.target.closest(".remove-point-btn")) {
            const row = event.target.closest(".coordinate-row");

            if (getRows().length > 1) {
                row.remove();
                refreshRows();
            }
        }
    });

    // =====================================
    // 5. READ INPUT COORDINATES
    // =====================================

    function readCoordinates(row, system) {
        const x = row.querySelector(".coord-x");
        const y = row.querySelector(".coord-y");
        const z = row.querySelector(".coord-z");

        const fields = systemFields[system];

        const values = [
            Number(x.value),
            Number(y.value),
            fields.length === 2 ? 0 : Number(z.value)
        ];

        const inputs = [x, y, z];

        for (let i = 0; i < fields.length; i++) {
            if (inputs[i].value.trim() === "" ||
                !Number.isFinite(values[i])) {
                throw new Error(
                    `Please enter a valid ${fields[i].label} value for every point.`
                );
            }
        }

        return values;
    }

    // =====================================
    // 6. FORMAT RESULTS
    // =====================================

    function formatValues(system, values) {
        const names = {
            [SYSTEMS.CARTESIAN]: ["x", "y", "z"],
            [SYSTEMS.POLAR]: ["r", "θ"],
            [SYSTEMS.CYLINDRICAL]: ["ρ", "θ", "z"],
            [SYSTEMS.SPHERICAL]: ["r", "θ", "φ"]
        };

        return names[system]
            .map((name, index) =>
                `${name} = ${Number(values[index]).toFixed(4)}`
            )
            .join(" , ");
    }

    function showResults(results, from, to) {
        if (!resultList) return;

        resultList.innerHTML = "";

        results.forEach((result, index) => {
            const item = document.createElement("div");
            item.className = "conversion-result-item";

            const heading = document.createElement("h4");
            heading.textContent = `Point ${index + 1}`;

            const original = document.createElement("p");
            original.textContent =
                `${systemNames[from]}: ${formatValues(from, result.input)}`;

            const converted = document.createElement("p");
            converted.textContent =
                `${systemNames[to]}: ${formatValues(to, result.values)}`;

            item.append(heading, original, converted);

            if (result.warning) {
                const warning = document.createElement("p");
                warning.className = "conversion-warning";
                warning.textContent = result.warning;
                item.appendChild(warning);
            }

            resultList.appendChild(item);
        });

        if (resultPlaceholder) resultPlaceholder.style.display = "none";
        if (resultsContainer) resultsContainer.style.display = "block";
    }

    // =====================================
    // 7. CALCULATION EXPLANATION
    // =====================================

    function showCalculation(from, to, input, output) {
        if (!calculationContent) return;

        calculationContent.innerHTML = "";

        const heading = document.createElement("h3");
        heading.textContent = "Conversion Process";

        const step1 = document.createElement("p");
        step1.textContent =
            `Step 1: Read the ${systemNames[from]} coordinates.`;

        const step2 = document.createElement("p");
        step2.textContent =
            "Step 2: Convert the input into Cartesian coordinates internally.";

        const step3 = document.createElement("p");
        step3.textContent =
            `Step 3: Convert Cartesian coordinates into ${systemNames[to]} coordinates.`;

        const result = document.createElement("p");
        result.textContent =
            `Final result: ${formatValues(to, output)}`;

        calculationContent.append(
            heading, step1, step2, step3, result
        );

        if (calculationSection) {
            calculationSection.style.display = "block";
        }
    }

    // =====================================
    // 8. UPDATE 3D VISUALIZATIONS
    // =====================================

    function updateVisualizers(from, to, input, output) {
        if (visualizers?.source) {
            visualizers.source.update(from, input);
        }

        if (visualizers?.destination) {
            visualizers.destination.update(to, output);
        }
    }

    // =====================================
    // 9. CONVERT BUTTON
    // =====================================

    convertButton.addEventListener("click", () => {
        try {
            const from = getSystem(sourceSelect);
            const to = getSystem(destinationSelect);

            if (!systemNames[from] || !systemNames[to]) {
                throw new Error("Please select valid coordinate systems.");
            }

            const rows = getRows();

            if (rows.length === 0) {
                throw new Error("Please add at least one coordinate point.");
            }

            const results = [];

            rows.forEach(row => {
                const input = readCoordinates(row, from);
                const result = convert(from, to, input);

                results.push({
                    input,
                    values: result.values,
                    warning: result.warning
                });
            });

            showResults(results, from, to);

            const first = results[0];

            updateVisualizers(
                from,
                to,
                first.input,
                first.values
            );

            showCalculation(
                from,
                to,
                first.input,
                first.values
            );

            console.log("Conversion successful:", results);

        } catch (error) {
            alert(error.message);
            console.error("Conversion error:", error);
        }
    });

    // =====================================
    // 10. SYSTEM SELECTORS
    // =====================================

    sourceSelect.addEventListener("change", updateInputLabels);

    destinationSelect.addEventListener("change", () => {
        const system = getSystem(destinationSelect);

        if (destinationLabel) {
            destinationLabel.textContent = systemNames[system] || "Destination";
        }
    });

    // =====================================
    // 11. ENGINE STATUS
    // =====================================

    if (engineDot) {
        engineDot.classList.add("online");
    }

    if (engineStatus) {
        engineStatus.textContent = "C ENGINE: ONLINE";
    }

    refreshRows();

    console.log("Coordinate controls initialized successfully.");

    return true;
}

