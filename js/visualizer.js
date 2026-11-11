
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js";

// ==========================================
// MULTIVERSE OF COORDINATES
// ANIMATED 3D VISUALIZATION ENGINE
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
const ANIMATION_DURATION = 1200;

// ==========================================
// CONVERT COORDINATES TO CARTESIAN
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
    return [
        "Cartesian",
        "Polar",
        "Cylindrical",
        "Spherical"
    ][Number(system)] || "Unknown";
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

    // SCENE

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0b1122);

    // CAMERA

    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 2000);

    camera.up.set(0, 0, 1);

    let rotationX = Math.PI / 4;
    let rotationZ = Math.PI / 4;
    let cameraDistance = 20;

    // RENDERER

    const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: false
    });

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.display = "block";
    renderer.domElement.style.touchAction = "none";

    // ======================================
    // LIGHTING
    // ======================================

    scene.add(new THREE.AmbientLight(0xffffff, 1.5));

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

    grid.rotation.x = Math.PI / 2;
    scene.add(grid);

    // ======================================
    // COORDINATE AXES
    // ======================================

    function createAxis(direction, color) {
        const arrow = new THREE.ArrowHelper(
            direction,
            new THREE.Vector3(0, 0, 0),
            10,
            color,
            0.45,
            0.22
        );

        scene.add(arrow);
    }

    createAxis(new THREE.Vector3(1, 0, 0), COLORS.x);
    createAxis(new THREE.Vector3(0, 1, 0), COLORS.y);
    createAxis(new THREE.Vector3(0, 0, 1), COLORS.z);

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

        const sprite = new THREE.Sprite(
            new THREE.SpriteMaterial({
                map: texture,
                transparent: true
            })
        );

        sprite.position.copy(position);
        sprite.scale.set(1.3, 0.65, 1);

        scene.add(sprite);
    }

    createLabel("X", new THREE.Vector3(10.8, 0, 0), "#ff5577");
    createLabel("Y", new THREE.Vector3(0, 10.8, 0), "#55ddaa");
    createLabel("Z", new THREE.Vector3(0, 0, 10.8), "#5599ff");

    // ======================================
    // ORIGIN
    // ======================================

    const originPoint = new THREE.Mesh(
        new THREE.SphereGeometry(0.12, 20, 20),
        new THREE.MeshBasicMaterial({ color: 0xffffff })
    );

    scene.add(originPoint);

    // ======================================
    // ANIMATION STATE
    // ======================================

    let animationFrame = null;
    let animationStart = 0;
    let animationProgress = 1;
    let isPaused = false;

    let startPoint = new THREE.Vector3(0, 0, 0);
    let targetPoint = new THREE.Vector3(0, 0, 0);
    let currentPoint = new THREE.Vector3(0, 0, 0);

    let lastSystem = null;
    let lastValues = null;

    // ======================================
    // DYNAMIC OBJECTS
    // ======================================

    let pointMesh = null;
    let vectorArrow = null;
    let projectionLine = null;
    let xLine = null;
    let yLine = null;
    let pointLabel = null;

    function makeLine(color, dashed = true) {
        const geometry = new THREE.BufferGeometry();

        const material = dashed
            ? new THREE.LineDashedMaterial({
                color,
                dashSize: 0.2,
                gapSize: 0.12
            })
            : new THREE.LineBasicMaterial({ color });

        const line = new THREE.Line(geometry, material);

        scene.add(line);

        return line;
    }

    function createDynamicObjects() {
        if (pointMesh) return;

        pointMesh = new THREE.Mesh(
            new THREE.SphereGeometry(0.18, 32, 32),
            new THREE.MeshStandardMaterial({
                color: COLORS.point,
                emissive: COLORS.point,
                emissiveIntensity: 0.4
            })
        );

        scene.add(pointMesh);

        vectorArrow = new THREE.ArrowHelper(
            new THREE.Vector3(1, 0, 0),
            new THREE.Vector3(0, 0, 0),
            0.001,
            COLORS.line,
            0.3,
            0.15
        );

        scene.add(vectorArrow);

        projectionLine = makeLine(0x8ba4cc);
        xLine = makeLine(COLORS.x);
        yLine = makeLine(COLORS.y);

        const labelCanvas = document.createElement("canvas");

        labelCanvas.width = 512;
        labelCanvas.height = 100;

        const ctx = labelCanvas.getContext("2d");

        ctx.font = "bold 28px Arial";
        ctx.fillStyle = "#ffffff";

        const texture = new THREE.CanvasTexture(labelCanvas);

        pointLabel = new THREE.Sprite(
            new THREE.SpriteMaterial({
                map: texture,
                transparent: true
            })
        );

        pointLabel.scale.set(4.5, 1.2, 1);

        scene.add(pointLabel);
    }

    // ======================================
    // UPDATE ANIMATED POSITION
    // ======================================

    function applyPosition(position) {
        currentPoint.copy(position);

        pointMesh.position.copy(position);

        const distance = position.length();

        // Main vector

        if (distance > 0.000001) {
            vectorArrow.visible = true;

            vectorArrow.setDirection(
                position.clone().normalize()
            );

            vectorArrow.setLength(
                distance,
                Math.min(0.3, distance * 0.25),
                Math.min(0.15, distance * 0.12)
            );
        } else {
            vectorArrow.visible = false;
        }

        // XY projection

        const projection = new THREE.Vector3(
            position.x,
            position.y,
            0
        );

        const xProjection = new THREE.Vector3(
            position.x,
            0,
            0
        );

        const yProjection = new THREE.Vector3(
            0,
            position.y,
            0
        );

        projectionLine.geometry.setFromPoints([
            position,
            projection
        ]);

        xLine.geometry.setFromPoints([
            projection,
            xProjection
        ]);

        yLine.geometry.setFromPoints([
            projection,
            yProjection
        ]);

        projectionLine.computeLineDistances();
        xLine.computeLineDistances();
        yLine.computeLineDistances();

        // Point label

        pointLabel.position.copy(position).add(
            new THREE.Vector3(0, 0, 0.8)
        );

        const ctx = pointLabel.material.map.image
            ? document.createElement("canvas").getContext("2d")
            : null;

        // Update label texture

        const canvas = pointLabel.material.map.image;

        const labelContext = canvas.getContext("2d");

        labelContext.clearRect(0, 0, 512, 100);
        labelContext.font = "bold 28px Arial";
        labelContext.fillStyle = "#ffffff";

        labelContext.fillText(
            `P (${position.x.toFixed(2)}, ${position.y.toFixed(2)}, ${position.z.toFixed(2)})`,
            8,
            58
        );

        pointLabel.material.map.needsUpdate = true;

        render();
    }

    // ======================================
    // ANIMATION LOOP
    // ======================================

    function animate(timestamp) {
        animationFrame = null;

        if (isPaused) return;

        const elapsed = timestamp - animationStart;

        animationProgress = Math.min(
            elapsed / ANIMATION_DURATION,
            1
        );

        // Smooth ease-in/ease-out

        const t = animationProgress;

        const eased = t * t * (3 - 2 * t);

        const position = startPoint.clone().lerp(
            targetPoint,
            eased
        );

        applyPosition(position);

        if (animationProgress < 1) {
            animationFrame = requestAnimationFrame(animate);
        }
    }

    function stopAnimationFrame() {
        if (animationFrame !== null) {
            cancelAnimationFrame(animationFrame);
            animationFrame = null;
        }
    }

    // ======================================
    // PLAY / PAUSE / RESET
    // ======================================

    function play() {
        if (animationProgress >= 1) {
            startPoint.copy(currentPoint);
        }

        if (!isPaused && animationFrame !== null) return;

        isPaused = false;

        animationStart =
            performance.now() -
            animationProgress * ANIMATION_DURATION;

        animationFrame = requestAnimationFrame(animate);
    }

    function pause() {
        if (animationFrame === null) return;

        isPaused = true;
        stopAnimationFrame();
    }

    function resetAnimation() {
        pause();

        animationProgress = 0;

        startPoint.set(0, 0, 0);

        applyPosition(startPoint);

        animationProgress = 1;
    }

    // ======================================
    // UPDATE COORDINATES
    // ======================================

    function update(system, values) {
        if (
            !Array.isArray(values) ||
            values.length !== 3 ||
            !values.every(Number.isFinite)
        ) {
            return;
        }

        const point = toCartesian(system, values);

        createDynamicObjects();

        // Camera automatically adjusts to point distance

        const distance = point.length();

        cameraDistance = Math.max(
            16,
            distance * 1.7 + 5
        );

        updateCamera();

        // Remember current coordinates

        lastSystem = system;
        lastValues = [...values];

        // Animate from current position to destination

        stopAnimationFrame();

        isPaused = false;

        startPoint.copy(currentPoint);
        targetPoint.copy(point);

        animationProgress = 0;
        animationStart = performance.now();

        animationFrame = requestAnimationFrame(animate);

        // Update HTML labels

        const prefix = containerId === "source-scene"
            ? "source"
            : "destination";

        const coordinateLabel = document.getElementById(
            `${prefix}-coordinate-label`
        );

        const systemLabel = document.getElementById(
            `${prefix}-system-label`
        );

        if (coordinateLabel) {
            coordinateLabel.textContent =
                `Input: (${values.join(", ")})`;
        }

        if (systemLabel) {
            systemLabel.textContent =
                `${getSystemName(system)} Coordinate System`;
        }
    }

    // ======================================
    // CAMERA
    // ======================================

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

    // ======================================
    // MOUSE ROTATION
    // ======================================

    let isDragging = false;
    let previousX = 0;
    let previousY = 0;

    renderer.domElement.addEventListener("pointerdown", event => {
        isDragging = true;

        previousX = event.clientX;
        previousY = event.clientY;

        renderer.domElement.setPointerCapture(event.pointerId);
    });

    renderer.domElement.addEventListener("pointermove", event => {
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
    });

    function stopDragging() {
        isDragging = false;
    }

    renderer.domElement.addEventListener("pointerup", stopDragging);
    renderer.domElement.addEventListener("pointercancel", stopDragging);

    // ======================================
    // ZOOM
    // ======================================

    renderer.domElement.addEventListener("wheel", event => {
        event.preventDefault();

        cameraDistance += event.deltaY * 0.01;

        cameraDistance = Math.max(
            4,
            Math.min(1000, cameraDistance)
        );

        updateCamera();
    }, { passive: false });

    // ======================================
    // RESPONSIVE RESIZE
    // ======================================

    function resize() {
        const width = Math.max(container.clientWidth, 1);
        const height = Math.max(container.clientHeight, 1);

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

    resize();
    render();

    // ======================================
    // PUBLIC METHODS
    // ======================================

    return {
        update,
        render,

        play,
        pause,

        resetAnimation,

        isAnimating() {
            return animationFrame !== null;
        },

        reset() {
            rotationX = Math.PI / 4;
            rotationZ = Math.PI / 4;
            cameraDistance = 20;

            updateCamera();
        },

        dispose() {
            pause();

            resizeObserver.disconnect();

            scene.traverse(object => {
                if (object.geometry) {
                    object.geometry.dispose();
                }

                if (object.material) {
                    const materials = Array.isArray(object.material)
                        ? object.material
                        : [object.material];

                    materials.forEach(material => {
                        if (material.map) material.map.dispose();
                        material.dispose();
                    });
                }
            });

            renderer.dispose();

            container.innerHTML = "";
        }
    };
}
