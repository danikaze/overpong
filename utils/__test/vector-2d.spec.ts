import 'jest';
import { Vector2D } from '@utils/vector-2d';

describe('Vector2D', () => {
  it('should create vectors', () => {
    const v = new Vector2D();
    expect(v.x).toBe(0);
    expect(v.y).toBe(0);
    expect(v.getMod()).toBe(0);

    const w = new Vector2D(3, 4);
    expect(w.x).toBe(3);
    expect(w.y).toBe(4);
    expect(w.getMod()).toBe(5);
  });

  it('should compare vectors', () => {
    const v = new Vector2D();
    const u = new Vector2D(0, 0);

    expect(v.equals(u)).toBe(true);
    expect(u.equals(v)).toBe(true);

    const w = new Vector2D(3, 4);
    const y = new Vector2D(4, 3);
    expect(w.equals(w)).toBe(true);

    expect(w.equals(v)).toBe(false);
    expect(w.equals(u)).toBe(false);
    expect(w.equals(y)).toBe(false);
    expect(y.equals(w)).toBe(false);
  });

  it('should normalize vectors', () => {
    const v = new Vector2D();
    const u = new Vector2D(1, 0);
    const w = new Vector2D(1, 1);
    const y = new Vector2D(3, 4);

    expect(v.getMod()).toBe(0);
    expect(u.getMod()).toBe(1);
    expect(w.getMod()).toBe(Math.SQRT2);
    expect(y.getMod()).toBe(5);

    expect(v.normalize()).toBeUndefined();
    expect(u.normalize()).toBeUndefined();
    expect(w.normalize()).toBeUndefined();
    expect(y.normalize()).toBeUndefined();

    expect(v.getMod()).toEqual(0);
    expect(v.equals(new Vector2D(0, 0))).toBe(true);

    expect(u.getMod()).toEqual(1);
    expect(u.equals(new Vector2D(1, 0))).toBe(true);

    expect(w.getMod()).toEqual(1);
    expect(w.x).toBeCloseTo(Math.SQRT1_2);
    expect(w.y).toBeCloseTo(Math.SQRT1_2);

    expect(y.getMod()).toEqual(1);
    expect(y.equals(new Vector2D(3 / 5, 4 / 5))).toBe(true);
  });

  it('should allow to set raw values', () => {
    const v = new Vector2D();
    expect(v.equals(new Vector2D(0, 0))).toBe(true);

    v.set(new Vector2D(3, 4));
    expect(v.equals(new Vector2D(3, 4))).toBe(true);
    expect(v.getMod()).toBe(5);
  });

  it('should be able to add and substract', () => {
    const v = new Vector2D(1, 2);
    const u = new Vector2D(2, 2);
    const w = new Vector2D(3, 4);

    const add = v.add(u);
    expect(add.equals(new Vector2D(3, 4)));
    expect(add.getMod()).toBe(5);

    const sub = add.substract(w);
    expect(sub.equals(new Vector2D(0, 0)));
    expect(sub.getMod()).toBe(0);
  });

  it('should scale the vector', () => {
    const v = new Vector2D(1, 2);
    const res = v.scale(3);
    expect(res.equals(new Vector2D(3, 6))).toBe(true);

    const div = res.scale(1 / 3);
    expect(div.equals(new Vector2D(1, 2))).toBe(true);
  });

  it('should calculate the dot (scalar) product', () => {
    const v = new Vector2D(3, 4);
    const w = new Vector2D(5, 6);
    const res1 = v.dotProduct(w);
    const res2 = w.dotProduct(v);

    expect(res1).toBe(39);
    expect(res2).toBe(res1);

    const p = new Vector2D(2, 0);
    const q = new Vector2D(0, 3);
    expect(p.dotProduct(q)).toBe(0);
  });

  it('should calculate the cos of the angle between two vectors', () => {
    const h = new Vector2D(3, 0); // ー
    const d = new Vector2D(3, 3); // /
    const v = new Vector2D(0, 3); // |

    expect(h.cos(h)).toBe(1); // 0 deg
    expect(h.cos(v)).toBe(0); // 90 deg
    expect(v.cos(d)).toBeCloseTo(Math.cos(Math.PI / 4)); // 45 deg
    expect(h.cos(d)).toBeCloseTo(Math.cos(Math.PI / 4)); // 45 deg
  });

  it('should calculate the result of a reflection', () => {
    const h = new Vector2D(1, 0); // ー
    const d = new Vector2D(3, 3); // /
    const v = new Vector2D(0, 2); // |

    const r1 = h.bounce(v);
    expect(r1.equals(new Vector2D(-1, 0)));

    const r2 = d.bounce(v);
    expect(r2.equals(new Vector2D(-3, 3)));

    const r3 = h.bounce(d);
    expect(r3.equals(new Vector2D(0, 1)));

    const r4 = v.bounce(d);
    expect(r4.equals(new Vector2D(2, 0)));
  });
});
