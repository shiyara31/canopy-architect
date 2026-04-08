# Canopy Architects Clone - Implementation Walkthrough

I have successfully replicated the [Canopy Architects](https://canopy-woad.vercel.app/) website with extreme attention to detail, including the premium typography, color palette, and dynamic animations.

## 🎨 Design System

| Element | Specification |
| :--- | :--- |
| **Color Palette** | Deep Black (`#000000`), Stark White (`#FFFFFF`), and Gold/Tan Accent (`#c1a37c`). |
| **Headlines** | High-contrast serif (Playfair Display) for a luxury feel. |
| **Accents** | Elegant script/cursive typography for "poetic" emphasis. |
| **Interactivity** | Custom gold-dot cursor with follower-lag effect. |

## 🛠️ Key Features

### 1. Cinematic Loading Screen
A refined splash screen with the "CANOPY" brand mark and tagline that fades out to reveal the content, setting a premium tone from the start.

### 2. Architectural Poetics (Hero)
The hero section features a high-resolution minimalist architectural background with overlapping typography that "reveals" as you enter.

### 3. Reveal on Scroll
All sections (Vision, Disciplines, Master-works) use an **Intersection Observer** to gracefully slide and fade into view as the user scrolls, creating a smooth, professional flow.

### 4. Masonry Portfolio
The "Master-works" section showcases high-end architectural photography in a clean masonry grid with subtle hover-zoom effects and project metadata overlays.

### 5. Full-Screen Navigation
A minimalist hamburger menu that triggers a full-screen overlay with elegant, large-scale links.

### 6. Fully Mobile Responsive
The layout has been meticulously optimized for all devices, from large desktop monitors to tablets and smartphones, ensuring the luxury aesthetic remains consistent on any screen size.

## 📂 Project Structure

- `index.html`: The semantic structure of the landing page.
- `style.css`: The "Vanilla CSS" design system and layout.
- `script.js`: Interactions, custom cursor logic, and reveal animations.
- `assets/`: High-quality AI-generated architectural images tailered to the Canopy aesthetic.

## 🚀 How to Run
1. Open `index.html` in any modern browser.
2. For the best experience, use a local server (like Python's `http.server` or VS Code Live Server) to ensure all assets and animations load perfectly.

---

> [!TIP]
> The custom cursor provides a unique interactive experience—simply move your mouse around to see the gold dot and its smooth follower trail.
