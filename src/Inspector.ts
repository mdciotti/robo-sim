// import { vec3, vec4 } from 'gl-matrix';
// const { vec3, vec4 } = glMatrix;

export interface InspectorView {
  name: string;
  render(): HTMLElement;
}

export class VectorView implements InspectorView {
  public name: string = 'vector';
  private outX = document.createElement('input');
  private outY = document.createElement('input');
  private outZ = document.createElement('input');

  public get disabled() {
    return this.outX.disabled;
  }

  public set disabled(isDisabled: boolean) {
    this.outX.disabled = isDisabled;
    this.outY.disabled = isDisabled;
    this.outZ.disabled = isDisabled;
  }

  public setData(vector: vec3): void {
    this.outX.value = vector[0].toFixed(3);
    this.outY.value = vector[1].toFixed(3);
    this.outZ.value = vector[2].toFixed(3);
  }

  public render(): HTMLElement {
    const fieldset = document.createElement('fieldset');
    fieldset.classList.add('view', 'vector');
    const legend = document.createElement('legend');
    legend.textContent = this.name;
    this.disabled = true;
    fieldset.appendChild(legend);
    fieldset.appendChild(this.outX);
    fieldset.appendChild(this.outY);
    fieldset.appendChild(this.outZ);
    return fieldset;
  }
}

export class ImageDataView<T> implements InspectorView {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D|null;
  public name: string = 'image';

  constructor({ width, height }: { width: number, height: number}) {
    this.canvas = document.createElement('canvas');
    this.canvas.width = width;
    this.canvas.height = height;
    this.canvas.classList.add('pixelated');
    this.ctx = this.canvas.getContext('2d', { alpha: false });
  }

  public setData(data: T): void {
    if (this.ctx === null) return;
    const { width, height } = this.canvas;
    if (data instanceof Uint8ClampedArray) {
      this.ctx.putImageData(new ImageData(data, width, height), 0, 0);
    } else if (data instanceof Float32Array) {
      const max = Math.max(...data);
      const data2 = new Uint8ClampedArray(data.reduce((prev, x) => {
        prev.push(...new Array(4).fill(256 * x / max))
        return prev;
      }, new Array()));
      this.ctx.putImageData(new ImageData(data2, width, height), 0, 0);
    } else if (Array.isArray(data)) {
      if (typeof data[0] === 'boolean') {
        const data2 = new Uint8ClampedArray(data.reduce((prev, x) => {
          prev.push(...new Array(4).fill(x ? 255 : 0))
          return prev;
        }, new Array()));
        this.ctx.putImageData(new ImageData(data2, width, height), 0, 0);
      } else {
        throw new TypeError(`data type '${typeof data[0]}[]' not supported`);
      }
    } else {
      throw new TypeError(`data type '${typeof data}' not supported`);
    }
  }

  public render(): HTMLElement {
    const fieldset = document.createElement('fieldset');
    fieldset.classList.add('view', 'image-data');
    const legend = document.createElement('legend');
    legend.textContent = this.name;
    fieldset.appendChild(legend);
    fieldset.appendChild(this.canvas);
    return fieldset;
  }
}

function normalize(value: number, min: number, max: number): number {
  return (value - min) / (max - min);
}

export class PlotTimeSeriesView implements InspectorView {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  public name: string = 'image';
  /** pixels per second */
  public scrollRate: number = 10;
  private series: Map<string, { value?: number, getValue?: (t: number) => number, color: string, min: number, max: number }> = new Map();
  public paused: boolean = true;
  private stopped: boolean = true;

  private colors = (function*() {
    let i = 0;
    const colors = [
      '#f28779',
      '#5c6773',
      '#ffa759',
      '#d4bfff',
      '#ffd580',
      '#73d0ff',
      '#bae67e',
      '#95e6cb',
      '#cbccc6',
    ];
    while (true) yield colors[i++ % colors.length];
  })();

  constructor() {
    this.canvas = document.createElement('canvas');
    const ctx = this.canvas.getContext('2d', { alpha: true });
    if (ctx === null) throw new Error('Failed to get canvas context');
    this.ctx = ctx;
    this.canvas.width = 64 * 3;
    this.canvas.height = this.canvas.width;
    // requestAnimationFrame(this.draw.bind(this));

    this.addSeries('zero', {
      value: 0,
      color: '#191e2a',
      min: -1,
      max: 1,
    });
    // this.addSeries('sin(t/500)', {
    //   getValue(t: number) { return Math.sin(t / 500); },
    //   // color: 'red',
    //   min: -2,
    //   max: 2,
    // });
    // this.addSeries('cos(t/100)', {
    //   getValue(t: number) { return Math.cos(t / 100); },
    //   // color: 'blue',
    //   min: -4,
    //   max: 4,
    // });
  }

  public stop(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.stopped = true;
  }

  public start(): void {
    this.paused = false;
    this.stopped = false;
    requestAnimationFrame(this.draw.bind(this));
  }

  private draw(): void {
    const t = performance.now();
    if (!this.stopped) requestAnimationFrame(this.draw.bind(this));
    if (this.paused) return;
    const data = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.putImageData(data, 1, 0);
    this.ctx.clearRect(0, 0, 1, this.canvas.height);
    for (let data of this.series.values()) {
      let value;
      if (typeof data.getValue !== 'undefined') value = data.getValue(t);
      else if (typeof data.value !== 'undefined') value = data.value;
      else throw new Error('no defined data');
      const y = this.canvas.height * (1 - normalize(value, data.min, data.max));
      this.ctx.fillStyle = data.color;
      this.ctx.fillRect(0, y, 1, 1);
    }
  }

  public addSeries(name: string, { value, getValue, color, min, max }: { value?: number, getValue?: (t: number) => number, color?: string, min: number, max: number }): void {
    if (!color) color = this.colors.next().value;
    this.series.set(name, { value, getValue, color, min, max });
  }

  public setValue(seriesName: string, value: number): void {
    const series = this.series.get(seriesName);
    if (!series) throw new Error(`Series '${seriesName}' not found.`);
    series.value = value;
  }

  public render(): HTMLCanvasElement {
    return this.canvas;
  }
}

export class Inspector {
  private views: Set<InspectorView> = new Set();
  constructor() {
  }

  public addView(view: InspectorView) {
    this.views.add(view);
  }

  public removeView(view: InspectorView) {
    this.views.delete(view);
  }

  public render(): HTMLElement {
    const fieldset = document.createElement('fieldset');
    fieldset.classList.add('inspector');
    const legend = document.createElement('legend');
    legend.textContent = 'Inspector';
    fieldset.appendChild(legend);
    for (let view of this.views) {
      fieldset.appendChild(view.render());
    }
    return fieldset;
  }
}
