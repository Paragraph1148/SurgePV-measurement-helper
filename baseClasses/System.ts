// System.ts - Base class for all systems
export default class System {
  private static registry: WeakMap<Function, System> = new WeakMap();
  protected enabled: boolean = true;
  protected modeChangeCallback?: (mode: string) => void;
  protected constructor() {
    this.enabled = true;
  }
  /**
   * Singleton factory - creates instance if not exists, returns existing otherwise
   */
  static createReference(this: any, ...args: any[]): any {
    const existing = System.registry.get(this);
    if (existing) return existing as any;
    const instance = new (this as any)(...args);
    System.registry.set(this, instance);
    return instance;
  }
  static getReference(this: any): any {
    const existing = System.registry.get(this);
    if (!existing) {
      throw new Error(
        `${this.name} instance not created. Call createReference first.`
      );
    }
    return existing as any;
  }
  /** Called when system is initialized */
  init(_dependencies: any): void {}
  /** Called every frame */
  update(_deltaTime: number): void {}
  /** Called when system's mode becomes active */
  activate(): void {}
  /** Called when system's mode becomes inactive */
  deactivate(): void {}
  /** Full cleanup when system is destroyed */
  dispose(): void {}
  /**
   * Handle events from the event system
   * @returns true if event was handled (stops propagation), false otherwise
   */
  handleEvent(_category: string, _eventData: any): boolean {
    return false;
  }
}
