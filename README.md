# 🌌 Multiverse of Coordinates

### An Interactive 3D Coordinate Conversion and Visualization Project

**Multiverse of Coordinates** is an interactive web-based physics project designed to explore and understand four major coordinate systems: Cartesian, Polar, Cylindrical, and Spherical.

The project allows users to convert coordinates between different systems and visualize the mathematical transformations through interactive 3D models.

---

## 🎯 Project Objective

The main objective of this project is to make coordinate geometry easier to understand through interactive visualization and real-time mathematical calculations.

It connects theoretical concepts of physics and mathematics with practical web technologies.

## ✨ Key Features

- **Four Coordinate Systems:** Supports Cartesian, Polar, Cylindrical, and Spherical coordinates.
- **Coordinate Converter:** Converts values from one coordinate system to another.
- **Interactive 3D Visualization:** Displays coordinate points and their positions in 3D space.
- **Dynamic Transformations:** Updates visualizations according to the input coordinates.
- **Mathematical Calculations:** Demonstrates the mathematical relationships between coordinate systems.
- **WebAssembly Integration:** Uses a C-based mathematical engine compiled into WebAssembly.
- **Interactive Interface:** Provides an easy-to-use interface for exploring coordinate transformations.

## 🧮 Coordinate Systems

| Coordinate System | Coordinates | Description |
|---|---|---|
| Cartesian | (x, y, z) | Represents a point using three perpendicular axes. |
| Polar | (r, θ) | Represents a point using radius and angle in a plane. |
| Cylindrical | (r, θ, z) | Extends polar coordinates into three dimensions. |
| Spherical | (ρ, θ, φ) | Represents a point using radial distance and two angles. |

## 🛠️ Technologies Used

- **HTML5** – Website structure
- **CSS3** – Styling and responsive design
- **JavaScript (ES6)** – Application logic and interactivity
- **Three.js** – 3D graphics and visualization
- **C Programming** – Mathematical conversion engine
- **WebAssembly (WASM)** – Executes the C engine in the browser
- **GitHub Pages** – Website hosting
- **GitHub Actions** – Automated build and deployment

## ⚙️ How It Works

1. The user selects a source coordinate system.
2. The user selects a destination coordinate system.
3. The user enters the coordinate values.
4. JavaScript passes the values to the WebAssembly-based C engine.
5. The C engine performs the mathematical conversion.
6. The converted coordinates are displayed on the website.
7. Three.js updates the 3D visualization to represent the resulting point.

## 📁 Project Structure

```text
PHYSICS-PROJECT/
│
├── .github/
│   └── workflows/
│       ├── deploy.yml
│       └── test-c.yml
│
├── assets/
│
├── c-engine/
│   └── coordinates.c
│
├── css/
│   └── style.css
│
├── js/
│   ├── engine.js
│   ├── main.js
│   ├── visualizer.js
│   └── controls.js
│
├── index.html
└── README.md
```

## 🚀 Live Website

Explore the project here:

**[🌐 Multiverse of Coordinates – Live Website](https://himalikaasatyarthi.github.io/PHYSICS-PROJECT-COORDINATE-SYSTEM/)**

## 💡 Applications

- Understanding coordinate geometry.
- Studying three-dimensional space.
- Learning transformations between coordinate systems.
- Visualizing mathematical concepts in physics.
- Exploring the relationship between mathematics and computer science.

## 🎓 Conclusion

Multiverse of Coordinates combines physics, mathematics, and programming to create an interactive learning experience. By integrating a C-based WebAssembly engine with JavaScript and Three.js, the project demonstrates how mathematical coordinate transformations can be calculated and visualized in real time.

**Explore coordinates. Visualize dimensions. Discover the multiverse!** 🌌

---
CONTRIBUTORS: AAYUSH KUNDU
              HIMALIKA SATYARTHI
*Developed as an educational Physics Project.*
