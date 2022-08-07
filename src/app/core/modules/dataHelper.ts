export class DataHelper {
  public static makeid(size: number): string {
    let text = '';
    let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < size; i++) text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
  }

  calcHitMatrix(pixel: number[]): Array<Array<number>> {
    let X = 11; // -5 to + 5 in x
    let Y = 11; // -5 to + 5 in y
    let x = 0;
    let y = 0;
    let dx = 0;
    let dy = -1;
    let t = Math.max(X, Y);
    let maxI = t * t;
    let pixelX = pixel[0];
    let pixelY = pixel[1];
    let all_pixels = Array();
    for (let i = 0; i < maxI; i++) {
      if (-X / 2 <= x && x <= X / 2 && -Y / 2 <= y && y <= Y / 2) {
        all_pixels.push([pixelX + x, pixelY + y]);
      }
      if (x === y || (x < 0 && x === -y) || (x > 0 && x === 1 - y)) {
        t = dx;
        dx = -dy;
        dy = t;
      }
      x += dx;
      y += dy;
    }
    return all_pixels;
  }

  public static isAttributesInObjectOfAnArray(table: Array<any>, attribute: string, value: any): number {
    let position: number;
    for (let index = 0; index < table.length; index++) {
      const element = table[index];
      if (element[attribute] == value) {
        position = index;
      }
    }
    return position!;
  }

  static hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16)
        }
      : null;
  }

  getFormattedArea(unit: 'sqm' | 'sqft' | 'sqkm' | 'sqmi' | 'hectar' = 'sqm', area = 0): number {
    switch (unit) {
      case 'sqm':
        return area;
      case 'sqft':
        return this._sqmTosqft(area);
      case 'sqkm':
        return this._sqmTosqkm(area);
      case 'sqmi':
        return this._sqmTosqmi(area);
      case 'hectar':
        return this._sqmToHectar(area);
      default:
        return area;
    }
  }

  _sqmTosqft(area: number) {
    return area * 10.7639;
  }

  _sqmTosqkm(area: number) {
    return area * 0.000001;
  }

  _sqmTosqmi(area: number) {
    return area * 0.000000386102159;
  }

  _sqmToHectar(area: number) {
    return area * 0.0001;
  }
}
