import { Strip } from "./Strip";

export class Roll {
  private _weight: number;
  private _serie: string;
  private _thickness: number;
  private _width: number;
  private _strips: Map<Strip, number> = null;

  constructor(weight: number, serie: string, thickness: number, width: number) {
    this._weight = weight;
    this._serie = serie;
    this._thickness = thickness;
    this._width = width;
  }

  get weight(): number {
    return this._weight;
  }

  get serie(): string {
    return this._serie;
  }

  get thickness(): number {
    return this._thickness;
  }

  get width(): number {
    return this._width;
  }

  get strips(): Map<Strip, number> {
    return this._strips;
  }

  set strips(value: Map<Strip, number>) {
    this._strips = value;
  }
}
