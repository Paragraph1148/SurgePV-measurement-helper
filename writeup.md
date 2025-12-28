# Measurement System – Implementation Notes

## Overview

This project implements an interactive 3D measurement tool designed to integrate into an ECS-based Three.js engine. The system enables users to measure distances in world space using a two-click workflow, providing live visual feedback and finalized engineering-style dimension annotations.

The implementation focuses on correctness, visual clarity, and adherence to standard engineering drawing conventions.

---

## Interaction Flow

- Activating the measurement mode enables distance measurement.
- The first mouse click sets the start point.
- Mouse movement displays a dashed preview line to the cursor position.
- The second mouse click completes the measurement and renders the final dimension.
- Pressing **Escape** cancels an in-progress measurement.
- Multiple completed measurements can coexist simultaneously.

---

## Visual & Engineering Standards

The visualization follows common engineering dimensioning rules:

- **Dimension Line**
  Rendered as a solid line offset from the measured object, using a consistent color.

- **Extension Lines**
  Drawn from the measured points toward the dimension line with:

  - A small gap between the measured point and the extension line
  - A slight overshoot beyond the dimension line
    These values are implemented proportionally in world space rather than pixels, which is standard practice in 3D engines.

- **Arrow Terminators**
  Filled triangular arrowheads oriented inward at both ends of the dimension line.

- **Text Label**
  Displays the measured distance with two decimal precision and unit suffix (e.g., `4.52 m`), using a monospace font and a semi-transparent background for readability.

---

## Text Placement & Rotation Logic

Text orientation is determined by the angle of the dimension line relative to the horizontal plane:

- **0–30° (Horizontal)**
  Text remains horizontal and is centered above the dimension line.

- **30–60° (Angled)**
  Text rotates to align with the dimension line direction.

- **60–90° (Steep / Vertical)**
  Text remains horizontal and is positioned to the side of the line to maintain readability.

This logic ensures consistent legibility across all measurement orientations.

---

## World-Space Measurement

All distance calculations are performed using full 3D world coordinates (`Vector3.distanceTo`), allowing the system to measure arbitrary spatial distances.

For local validation, mouse input was raycast onto a reference plane to simulate interaction. In a production environment, `worldPosition` would be provided by raycasting against scene geometry (e.g., roofs, panels, or terrain), enabling true 3D measurement without changes to the system logic.

---

## Memory & Architecture Considerations

- Reusable materials are shared across measurements to reduce memory overhead.
- Measurement visuals are grouped per measurement for clean scene management.
- Cleanup hooks are designed to integrate with the host engine’s lifecycle and disposal strategy.

---

## Conclusion

The measurement system provides accurate world-space distance calculation, visually correct engineering annotations, and clean system isolation suitable for integration into a larger ECS-driven Three.js application.
