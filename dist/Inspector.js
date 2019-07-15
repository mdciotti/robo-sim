// import { vec3, vec4 } from 'gl-matrix';
// const { vec3, vec4 } = glMatrix;
export class VectorView {
    constructor() {
        this.name = 'vector';
        this.outX = document.createElement('input');
        this.outY = document.createElement('input');
        this.outZ = document.createElement('input');
    }
    get disabled() {
        return this.outX.disabled;
    }
    set disabled(isDisabled) {
        this.outX.disabled = isDisabled;
        this.outY.disabled = isDisabled;
        this.outZ.disabled = isDisabled;
    }
    setData(vector) {
        this.outX.value = vector[0].toFixed(3);
        this.outY.value = vector[1].toFixed(3);
        this.outZ.value = vector[2].toFixed(3);
    }
    render() {
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
export class ImageDataView {
    constructor({ width, height }) {
        this.name = 'image';
        this.canvas = document.createElement('canvas');
        this.canvas.width = width;
        this.canvas.height = height;
        this.canvas.classList.add('pixelated');
        this.ctx = this.canvas.getContext('2d', { alpha: false });
    }
    setData(data) {
        if (this.ctx === null)
            return;
        const { width, height } = this.canvas;
        if (data instanceof Uint8ClampedArray) {
            this.ctx.putImageData(new ImageData(data, width, height), 0, 0);
        }
        else if (data instanceof Float32Array) {
            const max = Math.max(...data);
            const data2 = new Uint8ClampedArray(data.reduce((prev, x) => {
                prev.push(...new Array(4).fill(256 * x / max));
                return prev;
            }, new Array()));
            this.ctx.putImageData(new ImageData(data2, width, height), 0, 0);
        }
        else if (Array.isArray(data)) {
            if (typeof data[0] === 'boolean') {
                const data2 = new Uint8ClampedArray(data.reduce((prev, x) => {
                    prev.push(...new Array(4).fill(x ? 255 : 0));
                    return prev;
                }, new Array()));
                this.ctx.putImageData(new ImageData(data2, width, height), 0, 0);
            }
            else {
                throw new TypeError(`data type '${typeof data[0]}[]' not supported`);
            }
        }
        else {
            throw new TypeError(`data type '${typeof data}' not supported`);
        }
    }
    render() {
        const fieldset = document.createElement('fieldset');
        fieldset.classList.add('view', 'image-data');
        const legend = document.createElement('legend');
        legend.textContent = this.name;
        fieldset.appendChild(legend);
        fieldset.appendChild(this.canvas);
        return fieldset;
    }
}
function normalize(value, min, max) {
    return (value - min) / (max - min);
}
export class PlotTimeSeriesView {
    constructor() {
        this.name = 'image';
        /** pixels per second */
        this.scrollRate = 10;
        this.series = new Map();
        this.paused = true;
        this.stopped = true;
        this.colors = (function* () {
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
            while (true)
                yield colors[i++ % colors.length];
        })();
        this.canvas = document.createElement('canvas');
        const ctx = this.canvas.getContext('2d', { alpha: true });
        if (ctx === null)
            throw new Error('Failed to get canvas context');
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
    stop() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.stopped = true;
    }
    start() {
        this.paused = false;
        this.stopped = false;
        requestAnimationFrame(this.draw.bind(this));
    }
    draw() {
        const t = performance.now();
        if (!this.stopped)
            requestAnimationFrame(this.draw.bind(this));
        if (this.paused)
            return;
        const data = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.putImageData(data, 1, 0);
        this.ctx.clearRect(0, 0, 1, this.canvas.height);
        for (let data of this.series.values()) {
            let value;
            if (typeof data.getValue !== 'undefined')
                value = data.getValue(t);
            else if (typeof data.value !== 'undefined')
                value = data.value;
            else
                throw new Error('no defined data');
            const y = this.canvas.height * (1 - normalize(value, data.min, data.max));
            this.ctx.fillStyle = data.color;
            this.ctx.fillRect(0, y, 1, 1);
        }
    }
    addSeries(name, { value, getValue, color, min, max }) {
        if (!color)
            color = this.colors.next().value;
        this.series.set(name, { value, getValue, color, min, max });
    }
    setValue(seriesName, value) {
        const series = this.series.get(seriesName);
        if (!series)
            throw new Error(`Series '${seriesName}' not found.`);
        series.value = value;
    }
    render() {
        return this.canvas;
    }
}
export class Inspector {
    constructor() {
        this.views = new Set();
    }
    addView(view) {
        this.views.add(view);
    }
    removeView(view) {
        this.views.delete(view);
    }
    render() {
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
