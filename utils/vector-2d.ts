export class Vector2D {
  public x: number;
  public y: number;

  protected mod: number | undefined;
  protected normal: Vector2D | undefined;

  constructor();

  constructor(x: number, y: number);

  constructor(x?: number, y?: number) {
    this.x = x || 0;
    this.y = y || 0;
  }

  public equals(v: Vector2D): boolean {
    return this.x === v.x && this.y === v.y;
  }

  public clone(): Vector2D {
    return new Vector2D(this.x, this.y);
  }

  public normalize(): void {
    const mod = this.getMod();
    if (mod === 0 || mod === 1) return;
    this.x /= mod;
    this.y /= mod;
    this.mod = 1;
  }

  public set(v: Vector2D): void {
    this.x = v.x;
    this.y = v.y;
    this.mod = v.mod;
    this.normal = v.normal;
  }

  /**
   * ```
   * [A, B] + [C, D] = [A + C, B + D]
   * ```
   */
  public add(v: Vector2D): Vector2D {
    return new Vector2D(this.x + v.x, this.y + v.y);
  }

  /**
   * ```
   * [A, B] - [C, D] = [A - C, B - D]
   * ```
   */
  public substract(v: Vector2D): Vector2D {
    return new Vector2D(this.x - v.x, this.y - v.y);
  }

  /**
   * ```
   * N * [X, Y] = [N * X, N * Y]
   * ```
   */
  public scale(n: number): Vector2D {
    return new Vector2D(n * this.x, n * this.y);
  }

  /**
   * ```
   * V・W = |V| * |W| * cos(Θ)
   * ```
   */
  public dotProduct(v: Vector2D): number {
    return this.getMod() * v.getMod() * this.cos(v);
  }

  /**
   * Returns `cos(Θ)` being `Θ` the angle between this and the given vector
   */
  public cos(v: Vector2D): number {
    return (this.x * v.x + this.y * v.y) / (this.getMod() * v.getMod());
  }

  /**
   * Returns the length of this vector |V|
   */
  public getMod(): number {
    if (!this.mod) {
      this.mod = Math.sqrt(this.x * this.x + this.y * this.y);
    }
    return this.mod;
  }

  /**
   * Returns the normalized perpendicular vector `W` that asserts `V・W == 0`
   */
  public getNormal(): Vector2D {
    if (!this.normal) {
      this.normal = new Vector2D(-this.y, this.x);
      this.normal.normalize();
    }
    return this.normal;
  }

  /**
   * Reflects or "bounces" the current vector against a givel surface.
   * Return the resulting direction vector
   * ```
   * R = V - 2 * (V・N)
   * ```
   */
  public bounce(surface: Vector2D): Vector2D {
    return this.bounceWithNormal(surface.getNormal());
  }

  public bounceWithNormal(normal: Vector2D): Vector2D {
    return this.substract(normal.scale(2 * this.dotProduct(normal)));
  }
}
