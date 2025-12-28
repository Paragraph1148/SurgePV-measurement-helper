// MeasurementSystem.ts
import System from "./baseClasses/System.ts";
import * as THREE from "three";

export const MEASUREMENT_EVENTS = {
  CATEGORY: "MEASUREMENT",
  START: "MEASUREMENT_START",
  POINT_ADDED: "MEASUREMENT_POINT_ADDED",
  COMPLETE: "MEASUREMENT_COMPLETE",
  CANCEL: "MEASUREMENT_CANCEL",
} as const;

interface Measurement {
  id: string;
  startPoint: THREE.Vector3;
  endPoint: THREE.Vector3;
  distance: number;
  lineGroup: THREE.Group; // Contains all visual elements
}

export class MeasurementSystem extends System {
  private scene: THREE.Scene | null = null;
  private camera: THREE.Camera | null = null;
  // State
  private isActive: boolean = false;
  private isMeasuring: boolean = false;
  private startPoint: THREE.Vector3 | null = null;
  // Visual elements
  private previewLine: THREE.Line | null = null;
  private measurements: Map<string, Measurement> = new Map();
  // Reusable materials (for memory efficiency)
  private dimensionLineMaterial: THREE.LineBasicMaterial | null = null;
  private previewLineMaterial: THREE.LineDashedMaterial | null = null;
  constructor() {
    super();
  }

  init(dependencies: { scene: THREE.Scene; camera: THREE.Camera }): void {
    this.scene = dependencies.scene;
    this.camera = dependencies.camera;
    this.initMaterials();
  }

  private initMaterials(): void {
    // TODO: Initialize reusable materials
    this.dimensionLineMaterial = new THREE.LineBasicMaterial({
      color: 0x2563eb,
      linewidth: 1,
    });

    this.previewLineMaterial = new THREE.LineDashedMaterial({
      color: 0x94a3b8,
      dashSize: 0.2,
      gapSize: 0.1,
    });
  }

  handleEvent(category: string, eventData: any): boolean {
    if (!this.isActive) return false;
    // TODO: Handle MOUSE.CLICK for adding points
    // TODO: Handle MOUSE.MOVE for preview line
    // TODO: Handle KEYBOARD.KEY_DOWN for Escape to cancel

    if (category === "MOUSE") {
      if (eventData.type === "MOUSE_CLICK") {
        this.handleClick(eventData.worldPosition, eventData.shiftKey);
        return true;
      }

      if (eventData.type === "MOUSE_MOVE") {
        this.handleMouseMove(eventData.worldPosition);
        return this.isMeasuring;
      }
    }

    if (category === "KEY" && eventData.type === "KEY_DOWN") {
      if (eventData.key === "Escape") {
        this.cancelMeasurement();
        return true;
      }
    }

    return false;
  }

  activate(): void {
    // TODO: Enable measurement mode
    // - Set isActive = true
    // - Show cursor indicator
    // - Reset any partial measurement state
    this.isActive = true;
    this.isMeasuring = false;
    this.startPoint = null;
    this.cancelMeasurement();
  }

  deactivate(): void {
    // TODO: Clean up when mode changes
    // - Cancel any in-progress measurement
    // - Remove preview line
    // - Keep completed measurements visible? (design decision)
    this.isActive = false;
    this.cancelMeasurement();
  }

  dispose(): void {
    // TODO: Full cleanup
    // - Remove ALL measurements from scene
    // - Dispose ALL geometries and materials
    // - Clear maps
    this.clearAllMeasurements();
    this.dimensionLineMaterial?.dispose();
    this.previewLineMaterial?.dispose();
  }

  // ============ HELPER METHODS TO IMPLEMENT ============
  private generateId(): string {
    return `measurement-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;
  }

  private handleClick(worldPosition: THREE.Vector3, shiftKey: boolean): void {
    // TODO: Implement click handling
    // First click: set start point, create preview line
    // Second click: complete measurement, create dimension line group
    if (!this.isMeasuring) {
      // First click
      this.startPoint = worldPosition.clone();
      this.isMeasuring = true;
      this.createPreviewLine(this.startPoint);
      return;
    }

    // Second click
    this.completeMeasurement(worldPosition.clone());
  }

  private createPreviewLine(start: THREE.Vector3): void {
    if (!this.scene || !this.previewLineMaterial) return;

    if (this.previewLine) {
      this.scene.remove(this.previewLine);
      this.previewLine.geometry.dispose();
      this.previewLine = null;
    }

    const geometry = new THREE.BufferGeometry().setFromPoints([
      start,
      start.clone(),
    ]);

    this.previewLine = new THREE.Line(geometry, this.previewLineMaterial);
    this.previewLine.computeLineDistances();
    this.scene.add(this.previewLine);
  }

  private handleMouseMove(worldPosition: THREE.Vector3): void {
    // TODO: Update preview line to follow cursor
    if (!this.isMeasuring || !this.previewLine) return;

    const positions = (this.previewLine.geometry as THREE.BufferGeometry)
      .attributes.position as THREE.BufferAttribute;

    positions.setXYZ(1, worldPosition.x, worldPosition.y, worldPosition.z);
    positions.needsUpdate = true;

    this.previewLine.computeLineDistances();
  }

  private cancelMeasurement(): void {
    // TODO: Cancel in-progress measurement
    // - Remove preview line
    // - Reset state
    if (this.previewLine && this.scene) {
      this.scene.remove(this.previewLine);
      this.previewLine.geometry.dispose();
      this.previewLine = null;
    }

    this.startPoint = null;
    this.isMeasuring = false;
  }

  private completeMeasurement(endPoint: THREE.Vector3): void {
    // TODO: Create the full dimension line visualization
    // - Create line group with all elements
    // - Add to scene and measurements map
    if (!this.startPoint || !this.scene) return;

    console.log("Distance:", this.calculateDistance(this.startPoint, endPoint));

    const group = this.createDimensionLineGroup(this.startPoint, endPoint);
    this.scene.add(group);

    const id = this.generateId();
    this.measurements.set(id, {
      id,
      startPoint: this.startPoint,
      endPoint,
      distance: this.calculateDistance(this.startPoint, endPoint),
      lineGroup: group,
    });

    this.cancelMeasurement();
  }

  private createDimensionLineGroup(
    start: THREE.Vector3,
    end: THREE.Vector3
  ): THREE.Group {
    // TODO: Create a Group containing:
    // 1. Main dimension line (between arrows)
    // 2. Extension lines (from points to dimension line)
    // 2. Extension lines (from points to dimension line)
    // 3. Arrow terminators (at both ends)
    // 4. Text sprite with distance label
    const group = new THREE.Group();
    // Your implementation here...
    if (!this.dimensionLineMaterial) return group;

    const direction = this.getDirection(start, end);
    const perpendicular = this.getPerpendicular(direction);

    const offsetDistance = 0.2; // visual offset from object
    const dimStart = start
      .clone()
      .add(perpendicular.clone().multiplyScalar(offsetDistance));
    const dimEnd = end
      .clone()
      .add(perpendicular.clone().multiplyScalar(offsetDistance));

    // Main dimension line
    const dimGeometry = new THREE.BufferGeometry().setFromPoints([
      dimStart,
      dimEnd,
    ]);

    const gap = 0.02;
    const overshoot = 0.03;

    const extStart1 = start
      .clone()
      .add(perpendicular.clone().multiplyScalar(gap));
    const extEnd1 = dimStart
      .clone()
      .add(perpendicular.clone().multiplyScalar(overshoot));

    const extStart2 = end
      .clone()
      .add(perpendicular.clone().multiplyScalar(gap));
    const extEnd2 = dimEnd
      .clone()
      .add(perpendicular.clone().multiplyScalar(overshoot));

    const extGeom1 = new THREE.BufferGeometry().setFromPoints([
      extStart1,
      extEnd1,
    ]);
    const extGeom2 = new THREE.BufferGeometry().setFromPoints([
      extStart2,
      extEnd2,
    ]);

    group.add(new THREE.Line(extGeom1, this.dimensionLineMaterial));
    group.add(new THREE.Line(extGeom2, this.dimensionLineMaterial));

    group.add(this.createArrowHead(dimStart, direction));
    group.add(this.createArrowHead(dimEnd, direction.clone().negate()));

    const distance = this.formatDistance(start.distanceTo(end));
    const angle = this.getLineAngle(start, end);

    const midPoint = dimStart.clone().add(dimEnd).multiplyScalar(0.5);

    // Offset text above line
    const textOffset = perpendicular.clone().multiplyScalar(0.18);
    midPoint.add(textOffset);

    const textSprite = this.createTextSprite(distance, midPoint);

    // Rotation rules
    if (angle >= 30 && angle <= 60) {
      const radians = Math.atan2(direction.y, direction.x);
      textSprite.material.rotation = radians;
    }
    if (angle > 60) {
      // move text sideways instead of above
      const sideOffset = direction.clone().multiplyScalar(0.25);
      textSprite.position.add(sideOffset);
    }

    group.add(textSprite);

    const dimensionLine = new THREE.Line(
      dimGeometry,
      this.dimensionLineMaterial
    );
    group.add(dimensionLine);

    return group;
  }

  private createArrowHead(
    position: THREE.Vector3,
    direction: THREE.Vector3
  ): THREE.Mesh {
    // TODO: Create a filled arrow triangle
    // - 45-degree angle
    // - 8px length at default zoom
    // - Pointing in the given direction

    const size = 0.08 * (this.camera ? this.camera.position.length() / 5 : 1);

    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.lineTo(-size, size / 2);
    shape.lineTo(-size, -size / 2);
    shape.closePath();

    const geometry = new THREE.ShapeGeometry(shape);
    const material = new THREE.MeshBasicMaterial({
      color: 0x2563eb,
      side: THREE.DoubleSide,
    });

    const arrow = new THREE.Mesh(geometry, material);
    arrow.position.copy(position);

    const angle = Math.atan2(direction.y, direction.x);
    arrow.rotation.z = angle;

    return arrow;
  }

  private createTextSprite(
    text: string,
    position: THREE.Vector3
  ): THREE.Sprite {
    // TODO: Create text label using Canvas + Sprite
    // - Monospace font
    // - White background with padding
    // - Proper positioning above the line
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;

    const fontSize = 24;
    ctx.font = `${fontSize}px monospace`;

    const textMetrics = ctx.measureText(text);
    const padding = 4;

    canvas.width = textMetrics.width + padding * 2;
    canvas.height = fontSize + padding * 2;

    ctx.font = `${fontSize}px monospace`;
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#1e40af";
    ctx.textBaseline = "middle";
    ctx.fillText(text, padding, canvas.height / 2);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;

    const material = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
    });

    const sprite = new THREE.Sprite(material);
    sprite.scale.set(0.01 * canvas.width, 0.01 * canvas.height, 1);
    sprite.position.copy(position);

    return sprite;
  }

  private calculateDistance(p1: THREE.Vector3, p2: THREE.Vector3): number {
    return p1.distanceTo(p2);
  }

  private formatDistance(distance: number): string {
    return `${distance.toFixed(2)} m`;
  }

  private getDirection(
    start: THREE.Vector3,
    end: THREE.Vector3
  ): THREE.Vector3 {
    return end.clone().sub(start).normalize();
  }

  private getPerpendicular(dir: THREE.Vector3): THREE.Vector3 {
    const up = new THREE.Vector3(0, 1, 0);
    return new THREE.Vector3().crossVectors(dir, up).normalize();
  }

  private getLineAngle(start: THREE.Vector3, end: THREE.Vector3): number {
    // TODO: Calculate angle of line from horizontal (in degrees)
    // Used for text rotation decisions
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    return Math.abs((Math.atan2(dy, dx) * 180) / Math.PI);
  }

  // ============ CLEANUP METHODS ============
  private removeMeasurement(id: string): void {
    // TODO: Remove a specific measurement
    // - Remove group from scene
    // - Dispose all geometries in the group
    // - Remove from map
  }

  private clearAllMeasurements(): void {
    // TODO: Remove all measurements
  }

  private disposeGroup(group: THREE.Group): void {
    // TODO: Recursively dispose all geometries and materials in a group
  }
}
