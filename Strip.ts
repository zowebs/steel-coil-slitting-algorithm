export class Strip {
  private _width: number;
  private _neededWeight: number;
  private _currentWeight: number = 0;

  constructor(width: number, neededWeight: number) {
    this._width = width;
    this._neededWeight = neededWeight;
  }

  get width(): number {
    return this._width;
  }

  get neededWeight(): number {
    return this._neededWeight;
  }

  get currentWeight(): number {
    return this._currentWeight;
  }

  addWeight(value: number) {
    this._currentWeight += value;
  }
}
