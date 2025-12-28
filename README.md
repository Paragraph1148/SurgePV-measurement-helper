# Measurement System

This project implements an interactive 3D measurement tool following engineering drawing standards.  
The system is designed to integrate into an ECS-based Three.js engine and operates entirely on world-space input.

## Behavior

- Two-click measurement workflow with live dashed preview
- Escape key cancels an in-progress measurement
- Multiple completed measurements can coexist

## Visual Standards

- Dimension and extension lines follow standard engineering conventions
- Filled arrow terminators are oriented inward
- Distance text is formatted to two decimals with unit suffix

## Text Placement Logic

Text orientation is determined by the line angle:

- 0–30°: horizontal text positioned above the dimension line
- 30–60°: text rotates to follow the line direction
- 60–90°: text remains horizontal and is positioned to the side

## Implementation Notes

Pixel-based specifications (e.g. 2px gaps, 8px arrows) are translated into proportional world-space units, which is standard practice in 3D engines.

For local validation, mouse input was raycast onto a reference plane. In production, `worldPosition` is expected to come from mesh raycasting, enabling true 3D measurements without changes to the system.
