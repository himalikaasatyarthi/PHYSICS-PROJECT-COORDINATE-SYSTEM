

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js";

// ==========================================
// MULTIVERSE OF COORDINATES
// 3D VISUALIZATION ENGINE
// ==========================================

export const SYSTEMS = {
    CARTESIAN: 0,
    POLAR: 1,
    CYLINDRICAL: 2,
    SPHERICAL: 3
};

const COLORS = {
    x: 0xff5577,
    y: 0x55ddaa,
    z: 0x5599ff,
    point: 0xffd166,
    line: 0xb28aff
};

const DEG = Math.PI / 180;


// ==========================================
// CONVERT INPUT TO CARTESIAN FOR 3D DISPLAY
// ==========================================

function toCartesian(system, values) {

    const [a, b, c] = values;

    switch (Number(system)) {

        case SYSTEMS.CARTESIAN:
            return new THREE.Vector3(a, b, c);

        case SYSTEMS.POLAR: {
            const theta = b * DEG;

            return new THREE.Vector3(
                a * Math.cos(theta),
                a * Math.sin(theta),
                0
            );
        }

        case SYSTEMS.CYLINDRICAL: {
            const theta = b * DEG;

            return new THREE.Vector3(
                a * Math.cos(theta),
                a * Math.sin(theta),
                c
            );
        }

        case SYSTEMS.SPHERICAL: {
            const theta = b * DEG;
            const phi = c * DEG;

            return new THREE.Vector3(
                a * Math.sin(phi) * Math.cos(theta),
                a * Math.sin(phi) * Math.sin(theta),
                a * Math.cos(phi)
            );
        }

        default:
            throw new Error("Unknown coordinate system.");
    }
}


// ==========================================
// SYSTEM NAMES
// ==========================================

function getSystemName(system) {

    const names = [
        "Cartesian",
        "Polar",
        "Cylindrical",
        "Spherical"
    ];

    return names[Number(system)] || "Unknown";
}


// ==========================================
// CREATE VISUALIZER
// ==========================================

export function createVisualizer(containerId) {

    const container = document.getElementById(containerId);

    if (!container) {
        throw new Error(
            `Visualizer container not found: ${containerId}`
        );
    }

    // Scene

    const scene = new THREE.Scene();

    scene.background = new THREE.Color(0x0b1122);

    // Camera

    const camera = new THREE.PerspectiveCamera(
        45,
        1,
        0.1,
        1000
    );

    camera.position.set(12, 10, 14);

    camera.up.set(0, 0, 1);

    camera.lookAt(0, 0, 0);

    // Renderer

    const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: false
    });

    renderer.setPixelRatio(
        Math.min(window.devicePixelRatio, 2)
    );

    renderer.setSize(
        Math.max(container.clientWidth, 1),
        Math.max(container.clientHeight, 1)
    );

    renderer.shadowMap.enabled = true;

    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.display = "block";


    // ======================================
    // LIGHTING
    // ======================================

    const ambientLight = new THREE.AmbientLight(
        0xffffff,
        1.5
    );

    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(
        0xffffff,
        2
    );

    directionalLight.position.set(8, 10, 12);

    scene.add(directionalLight);


    // ======================================
    // GRID
    // ======================================

    const grid = new THREE.GridHelper(
        20,
        20,
        0x52658c,
        0x27344f
    );

    // GridHelper is created in XY.
    // Rotate it so that it lies in the XY plane
    // with Z as the vertical axis.

    grid.rotation.x = Math.PI / 2;

    scene.add(grid);


    // ======================================
    // COORDINATE AXES
    // ======================================

    function createAxis(direction, color, length) {

        const origin = new THREE.Vector3(0, 0, 0);

        const arrow = new THREE.ArrowHelper(
            direction,
            origin,
            length,
            color,
            0.45,
            0.22
        );

        scene.add(arrow);
    }

    createAxis(
        new THREE.Vector3(1, 0, 0),
        COLORS.x,
        10
    );

    createAxis(
        new THREE.Vector3(0, 1, 0),
        COLORS.y,
        10
    );

    createAxis(
        new THREE.Vector3(0, 0, 1),
        COLORS.z,
        10
    );


    // ======================================
    // AXIS LABELS
    // ======================================

    function createLabel(text, position, color) {

        const canvas = document.createElement("canvas");

        canvas.width = 128;
        canvas.height = 64;

        const context = canvas.getContext("2d");

        context.font = "bold 36px Arial";
        context.fillStyle = color;
        context.textAlign = "center";
        context.fillText(text, 64, 43);

        const texture = new THREE.CanvasTexture(canvas);

        const material = new THREE.SpriteMaterial({
            map: texture,
            transparent: true
        });

        const sprite = new THREE.Sprite(material);

        sprite.position.copy(position);
        sprite.scale.set(1.3, 0.65, 1);

        scene.add(sprite);
    }

    createLabel(
        "X",
        new THREE.Vector3(10.8, 0, 0),
        "#ff5577"
    );

    createLabel(
        "Y",
        new THREE.Vector3(0, 10.8, 0),
        "#55ddaa"
    );

    createLabel(
        "Z",
        new THREE.Vector3(0, 0, 10.8),
        "#5599ff"
    );


    // ======================================
    // ORIGIN
    // ======================================

    const originGeometry = new THREE.SphereGeometry(
        0.12,
        20,
        20
    );

    const originMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff
    });

    const originPoint = new THREE.Mesh(
        originGeometry,
        originMaterial
    );

    scene.add(originPoint);


    // ======================================
    // DYNAMIC OBJECTS
    // ======================================

    const dynamicObjects = [];

    function clearDynamicObjects() {

        dynamicObjects.forEach(object => {

            scene.remove(object);

            if (object.geometry) {
                object.geometry.dispose();
            }

            if (object.material) {

                if (object.material.map) {
                    object.material.map.dispose();
                }

                object.material.dispose();
            }
        });

        dynamicObjects.length = 0;
    }

    function addDynamic(object) {

        scene.add(object);

        dynamicObjects.push(object);
    }


    // ======================================
    // UPDATE POINT
    // ======================================

    function update(system, values) {

        if (
            !Array.isArray(values) ||
            values.length !== 3 ||
            !values.every(Number.isFinite)
        ) {
            return;
        }

        clearDynamicObjects();

        const point = toCartesian(system, values);

        const distance = point.length();

        // Automatically scale the camera view
        // for larger coordinate values.

        const viewSize = Math.max(12, distance * 1.5 + 3);

        camera.position.set(
            viewSize,
            viewSize * 0.85,
            viewSize
        );

        camera.lookAt(0, 0, 0);


        // POINT

        const pointGeometry = new THREE.SphereGeometry(
            0.18,
            32,
            32
        );

        const pointMaterial = new THREE.MeshStandardMaterial({
            color: COLORS.point,
            emissive: COLORS.point,
            emissiveIntensity: 0.4
        });

        const pointMesh = new THREE.Mesh(
            pointGeometry,
            pointMaterial
        );

        pointMesh.position.copy(point);

        addDynamic(pointMesh);


        // VECTOR FROM ORIGIN TO POINT

        if (distance > 0.000001) {

            const vector = new THREE.ArrowHelper(
                point.clone().normalize(),
                new THREE.Vector3(0, 0, 0),
                distance,
                COLORS.line,
                0.3,
                0.15
            );

            addDynamic(vector);
        }


        // PROJECTION ON XY PLANE

        const projection = new THREE.Vector3(
            point.x,
            point.y,
            0
        );

        const projectionGeometry = new THREE.BufferGeometry()
            .setFromPoints([
                point,
                projection
            ]);

        const projectionLine = new THREE.Line(
            projectionGeometry,
            new THREE.LineDashedMaterial({
                color: 0x8ba4cc,
                dashSize: 0.2,
                gapSize: 0.12
            })
        );

        projectionLine.computeLineDistances();

        addDynamic(projectionLine);


        // PROJECTION ON X AXIS

        const xProjection = new THREE.Vector3(
            point.x,
            0,
            0
        );

        const xLineGeometry = new THREE.BufferGeometry()
            .setFromPoints([
                projection,
                xProjection
            ]);

        const xLine = new THREE.Line(
            xLineGeometry,
            new THREE.LineDashedMaterial({
                color: COLORS.x,
                dashSize: 0.15,
                gapSize: 0.1
            })
        );

        xLine.computeLineDistances();

        addDynamic(xLine);


        // PROJECTION ON Y AXIS

        const yProjection = new THREE.Vector3(
            0,
            point.y,
            0
        );

        const yLineGeometry = new THREE.BufferGeometry()
            .setFromPoints([
                projection,
                yProjection
            ]);

        const yLine = new THREE.Line(
            yLineGeometry,
            new THREE.LineDashedMaterial({
                color: COLORS.y,
                dashSize: 0.15,
                gapSize: 0.1
            })
        );

        yLine.computeLineDistances();

        addDynamic(yLine);


        // POINT LABEL

        const labelCanvas = document.createElement("canvas");

        labelCanvas.width = 256;
        labelCanvas.height = 80;

        const ctx = labelCanvas.getContext("2d");

        ctx.font = "bold 28px Arial";
        ctx.fillStyle = "#ffffff";

        ctx.fillText(
            `P (${point.x.toFixed(2)}, ${point.y.toFixed(2)}, ${point.z.toFixed(2)})`,
            8,
            45
        );

        const labelTexture = new THREE.CanvasTexture(
            labelCanvas
        );

        const labelMaterial = new THREE.SpriteMaterial({
            map: labelTexture,
            transparent: true
        });

        const label = new THREE.Sprite(labelMaterial);

        label.position.copy(point).add(
            new THREE.Vector3(0, 0, 0.8)
        );

        label.scale.set(3.8, 1.2, 1);

        addDynamic(label);


        // UPDATE INFORMATION

        const coordinateLabel = document.getElementById(
            containerId === "source-scene"
                ? "source-coordinate-label"
                : "destination-coordinate-label"
        );

        const systemLabel = document.getElementById(
            containerId === "source-scene"
                ? "source-system-label"
                : "destination-system-label"
        );

        if (coordinateLabel) {

            coordinateLabel.textContent =
                `Input: (${values.join(", ")})`;
        }

        if (systemLabel) {

            systemLabel.textContent =
                `${getSystemName(system)} Coordinate System`;
        }

        render();
    }


    // ======================================
    // BASIC MOUSE ROTATION AND ZOOM
    // ======================================

    let isDragging = false;

    let previousX = 0;
    let previousY = 0;

    let rotationX = Math.atan2(
        camera.position.y,
        camera.position.z
    );

    let rotationZ = Math.atan2(
        camera.position.x,
        camera.position.y
    );

    let cameraDistance = camera.position.length();

    function updateCamera() {

        const x = cameraDistance *
            Math.sin(rotationZ) *
            Math.sin(rotationX);

        const y = cameraDistance *
            Math.cos(rotationZ) *
            Math.sin(rotationX);

        const z = cameraDistance *
            Math.cos(rotationX);

        camera.position.set(x, y, z);

        camera.lookAt(0, 0, 0);

        render();
    }

    renderer.domElement.addEventListener(
        "pointerdown",
        event => {

            isDragging = true;

            previousX = event.clientX;
            previousY = event.clientY;

            renderer.domElement.setPointerCapture(
                event.pointerId
            );
        }
    );

    renderer.domElement.addEventListener(
        "pointermove",
        event => {

            if (!isDragging) return;

            const dx = event.clientX - previousX;
            const dy = event.clientY - previousY;

            previousX = event.clientX;
            previousY = event.clientY;

            rotationZ -= dx * 0.008;

            rotationX += dy * 0.008;

            rotationX = Math.max(
                0.08,
                Math.min(Math.PI - 0.08, rotationX)
            );

            updateCamera();
        }
    );

    renderer.domElement.addEventListener(
        "pointerup",
        () => {
            isDragging = false;
        }
    );

    renderer.domElement.addEventListener(
        "pointercancel",
        () => {
            isDragging = false;
        }
    );

    renderer.domElement.addEventListener(
        "wheel",
        event => {

            event.preventDefault();

            cameraDistance += event.deltaY * 0.01;

            cameraDistance = Math.max(
                4,
                Math.min(1000, cameraDistance)
            );

            updateCamera();

        },
        { passive: false }
    );


    // ======================================
    // RESPONSIVE RESIZE
    // ======================================

    function resize() {

        const width = Math.max(
            container.clientWidth,
            1
        );

        const height = Math.max(
            container.clientHeight,
            1
        );

        camera.aspect = width / height;

        camera.updateProjectionMatrix();

        renderer.setSize(width, height);

        render();
    }

    const resizeObserver = new ResizeObserver(resize);

    resizeObserver.observe(container);


    // ======================================
    // RENDER
    // ======================================

    function render() {

        renderer.render(scene, camera);
    }

    render();


    // ======================================
    // PUBLIC METHODS
    // ======================================

    return {

        update,

        render,

        reset() {

            rotationX = Math.PI / 4;

            rotationZ = Math.PI / 4;

            cameraDistance = 20;

            updateCamera();
        },

        dispose() {

            resizeObserver.disconnect();

            clearDynamicObjects();

            renderer.dispose();

            container.innerHTML = "";
        }

    };
}
