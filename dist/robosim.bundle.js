class EventTargetShim {
    constructor() {
        this.listeners = new Map();
    }
    addEventListener(eventType, listener) {
        const existing = this.listeners.get(eventType);
        if (existing)
            existing.add(listener);
        else
            this.listeners.set(eventType, new Set([listener]));
    }
    removeEventListener(eventType, listener) {
        const existing = this.listeners.get(eventType);
        if (existing)
            existing.delete(listener);
    }
    dispatchEvent(event) {
        const existing = this.listeners.get(event.type);
        if (existing)
            for (let listener of existing.values())
                listener(event);
    }
}

/**
 * Common utilities
 * @module glMatrix
 */
var ARRAY_TYPE = typeof Float32Array !== 'undefined' ? Float32Array : Array;
var degree = Math.PI / 180;

/**
 * 3 Dimensional Vector
 * @module vec3
 */

/**
 * Creates a new, empty vec3
 *
 * @returns {vec3} a new 3D vector
 */

function create() {
  var out = new ARRAY_TYPE(3);

  if (ARRAY_TYPE != Float32Array) {
    out[0] = 0;
    out[1] = 0;
    out[2] = 0;
  }

  return out;
}
/**
 * Creates a new vec3 initialized with the given values
 *
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @returns {vec3} a new 3D vector
 */

function fromValues(x, y, z) {
  var out = new ARRAY_TYPE(3);
  out[0] = x;
  out[1] = y;
  out[2] = z;
  return out;
}
/**
 * Perform some operation over an array of vec3s.
 *
 * @param {Array} a the array of vectors to iterate over
 * @param {Number} stride Number of elements between the start of each vec3. If 0 assumes tightly packed
 * @param {Number} offset Number of elements to skip at the beginning of the array
 * @param {Number} count Number of vec3s to iterate over. If 0 iterates over entire array
 * @param {Function} fn Function to call for each vector in the array
 * @param {Object} [arg] additional argument to pass to fn
 * @returns {Array} a
 * @function
 */

var forEach = function () {
  var vec = create();
  return function (a, stride, offset, count, fn, arg) {
    var i, l;

    if (!stride) {
      stride = 3;
    }

    if (!offset) {
      offset = 0;
    }

    if (count) {
      l = Math.min(count * stride + offset, a.length);
    } else {
      l = a.length;
    }

    for (i = offset; i < l; i += stride) {
      vec[0] = a[i];
      vec[1] = a[i + 1];
      vec[2] = a[i + 2];
      fn(vec, vec, arg);
      a[i] = vec[0];
      a[i + 1] = vec[1];
      a[i + 2] = vec[2];
    }

    return a;
  };
}();

/**
 * 4 Dimensional Vector
 * @module vec4
 */

/**
 * Creates a new, empty vec4
 *
 * @returns {vec4} a new 4D vector
 */

function create$1() {
  var out = new ARRAY_TYPE(4);

  if (ARRAY_TYPE != Float32Array) {
    out[0] = 0;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
  }

  return out;
}
/**
 * Perform some operation over an array of vec4s.
 *
 * @param {Array} a the array of vectors to iterate over
 * @param {Number} stride Number of elements between the start of each vec4. If 0 assumes tightly packed
 * @param {Number} offset Number of elements to skip at the beginning of the array
 * @param {Number} count Number of vec4s to iterate over. If 0 iterates over entire array
 * @param {Function} fn Function to call for each vector in the array
 * @param {Object} [arg] additional argument to pass to fn
 * @returns {Array} a
 * @function
 */

var forEach$1 = function () {
  var vec = create$1();
  return function (a, stride, offset, count, fn, arg) {
    var i, l;

    if (!stride) {
      stride = 4;
    }

    if (!offset) {
      offset = 0;
    }

    if (count) {
      l = Math.min(count * stride + offset, a.length);
    } else {
      l = a.length;
    }

    for (i = offset; i < l; i += stride) {
      vec[0] = a[i];
      vec[1] = a[i + 1];
      vec[2] = a[i + 2];
      vec[3] = a[i + 3];
      fn(vec, vec, arg);
      a[i] = vec[0];
      a[i + 1] = vec[1];
      a[i + 2] = vec[2];
      a[i + 3] = vec[3];
    }

    return a;
  };
}();

/**
 * 2 Dimensional Vector
 * @module vec2
 */

/**
 * Creates a new, empty vec2
 *
 * @returns {vec2} a new 2D vector
 */

function create$2() {
  var out = new ARRAY_TYPE(2);

  if (ARRAY_TYPE != Float32Array) {
    out[0] = 0;
    out[1] = 0;
  }

  return out;
}
/**
 * Perform some operation over an array of vec2s.
 *
 * @param {Array} a the array of vectors to iterate over
 * @param {Number} stride Number of elements between the start of each vec2. If 0 assumes tightly packed
 * @param {Number} offset Number of elements to skip at the beginning of the array
 * @param {Number} count Number of vec2s to iterate over. If 0 iterates over entire array
 * @param {Function} fn Function to call for each vector in the array
 * @param {Object} [arg] additional argument to pass to fn
 * @returns {Array} a
 * @function
 */

var forEach$2 = function () {
  var vec = create$2();
  return function (a, stride, offset, count, fn, arg) {
    var i, l;

    if (!stride) {
      stride = 2;
    }

    if (!offset) {
      offset = 0;
    }

    if (count) {
      l = Math.min(count * stride + offset, a.length);
    } else {
      l = a.length;
    }

    for (i = offset; i < l; i += stride) {
      vec[0] = a[i];
      vec[1] = a[i + 1];
      fn(vec, vec, arg);
      a[i] = vec[0];
      a[i + 1] = vec[1];
    }

    return a;
  };
}();

class Simulation extends EventTargetShim {
    constructor() {
        super();
        /** the time between simulation steps (ms) */
        this.timestep = 20;
        /** the multiplier for relating simulation time to real time */
        this.timeMultiplier = 1;
        this.isStopped = true;
        this.isPaused = false;
        this.state = this.createInitialState();
        document.body.addEventListener('pointermove', (event) => {
            this.state.input.pointer.position[0] = event.clientX;
            this.state.input.pointer.position[1] = event.clientY;
        });
        document.body.addEventListener('pointerdown', (event) => {
            this.state.input.pointer.button1 = (event.buttons & 0x01) > 0;
            this.state.input.pointer.button2 = (event.buttons & 0x02) > 0;
            this.state.input.pointer.button3 = (event.buttons & 0x04) > 0;
            this.state.input.pointer.button4 = (event.buttons & 0x08) > 0;
            this.state.input.pointer.button5 = (event.buttons & 0x16) > 0;
        });
        document.body.addEventListener('pointerup', (event) => {
            this.state.input.pointer.button1 = (event.buttons & 0x01) > 0;
            this.state.input.pointer.button2 = (event.buttons & 0x02) > 0;
            this.state.input.pointer.button3 = (event.buttons & 0x04) > 0;
            this.state.input.pointer.button4 = (event.buttons & 0x08) > 0;
            this.state.input.pointer.button5 = (event.buttons & 0x16) > 0;
        });
    }
    get timeScale() { return this.timeMultiplier; }
    set timeScale(newScale) {
        const passedTime = performance.now() - this.state.time;
        clearTimeout(this.stepTimer);
        this.timeMultiplier = newScale;
        this.stepTimer = setTimeout(this.step.bind(this), this.timestep / this.timeMultiplier - passedTime);
    }
    createInitialState() {
        return {
            time: 0,
            input: {
                pointer: {
                    position: create$2(),
                    button1: false,
                    button2: false,
                    button3: false,
                    button4: false,
                    button5: false,
                },
            },
            entities: new Set()
        };
    }
    reset() {
        this.state = this.createInitialState();
        this.dispatchEvent(new CustomEvent('update', { detail: this.state }));
    }
    addEntity(entity) {
        this.state.entities.add(entity);
        entity.initialize(this);
    }
    start() {
        this.stepTimer = setTimeout(this.step.bind(this), this.timestep / this.timeMultiplier);
        if (this.isStopped) {
            this.dispatchEvent(new Event('start'));
            this.isStopped = false;
        }
        else {
            this.isPaused = false;
            this.dispatchEvent(new Event('resume'));
        }
    }
    pause() {
        this.isPaused = true;
        this.dispatchEvent(new Event('pause'));
        clearTimeout(this.stepTimer);
    }
    stop() {
        clearTimeout(this.stepTimer);
        this.isStopped = true;
        this.dispatchEvent(new Event('stop'));
        this.reset();
    }
    update(state) {
        this.dispatchEvent(new CustomEvent('update', { detail: state }));
        for (const entity of this.state.entities) {
            entity.update(state);
        }
    }
    step() {
        const start = performance.now();
        this.state.time += this.timestep / 1000;
        if (!this.isPaused)
            this.stepTimer = setTimeout(this.step.bind(this), this.timestep / this.timeMultiplier);
        this.update(this.state);
        const end = performance.now();
        // console.log(start == end);
        // console.log((end - start) / (this.timestep / this.timeMultiplier));
    }
}
Simulation.PX_PER_METER = 96;

class ImageDataView {
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
class PlotTimeSeriesView {
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
class Inspector {
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

class Entity extends EventTargetShim {
    constructor(pos = create(), dir = create$1()) {
        super();
        this.name = 'entity';
        this.position = pos;
        this.direction = dir;
        this.inspector = new Inspector();
    }
    initialize(sim) { }
    update(state) { }
}
class ManualMarker extends Entity {
    constructor(options) {
        const defaults = Object.assign({
            radius: 5,
            color: '#ffffff',
        }, options);
        super();
        this.radius = defaults.radius;
        this.color = defaults.color;
    }
    renderToCamera(ctx) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.position[0], this.position[1], this.radius, 0, 2 * Math.PI);
        ctx.closePath();
        ctx.fill();
    }
    update(state) {
        this.position[0] = state.input.pointer.position[0] / 3;
        this.position[1] = state.input.pointer.position[1] / 3;
    }
}
class AutoMarker extends ManualMarker {
    constructor(options) {
        const defaults = Object.assign({
            radius: 5,
            period: 1,
            phase: 0,
            ax: 8,
            ay: 8,
            center: fromValues(20, 20, 0),
            color: '#ffffff',
        }, options);
        super({
            radius: defaults.radius,
            color: defaults.color
        });
        this.period = defaults.period;
        this.phase = defaults.phase;
        this.ax = defaults.ax;
        this.ay = defaults.ay;
        this.center = defaults.center;
    }
    update(state) {
        const t = this.phase + state.time / this.period;
        this.position[0] = this.center[0] + this.ax * Math.cos(t);
        this.position[1] = this.center[1] + this.ay * Math.sin(t);
    }
}

class Camera extends Entity {
    constructor(options) {
        const { width, height, pos, dir, fov, fps } = Object.assign({
            pos: create(),
            dir: create$1(),
            fov: 90,
            fps: 20,
        }, options);
        super(pos, dir);
        this.fov = fov;
        this.fps = fps;
        this.lastCapture = null;
        this.canvas = document.createElement('canvas');
        this.canvas.classList.add('pixelated');
        this.width = this.canvas.width = width;
        this.height = this.canvas.height = height;
        const ctx = this.canvas.getContext('2d', { alpha: false });
        if (ctx === null)
            throw new Error('Failed to get canvas context for camera');
        this.ctx = ctx;
    }
    /**
     * Initialize the simulation listeners
     */
    initialize(sim) {
        let captureTimer;
        sim.addEventListener('start', () => {
            captureTimer = setInterval(this.capture.bind(this), 1000 / this.fps, sim.state);
        });
        sim.addEventListener('stop', () => clearInterval(captureTimer));
        // Can't inspect camera views if we stop capturing on pause
        // sim.addEventListener('resume', () => {
        //   captureTimer = setInterval(this.capture.bind(this), 1000 / this.fps, sim.state);
        // });
        // sim.addEventListener('pause', () => clearInterval(captureTimer));
    }
    capture(state) {
        const w = this.canvas.width;
        const h = this.canvas.height;
        this.ctx.clearRect(0, 0, w, h);
        for (const entity of state.entities) {
            if (entity instanceof AutoMarker) {
                entity.renderToCamera(this.ctx);
            }
            else if (entity instanceof ManualMarker) {
                entity.renderToCamera(this.ctx);
            }
        }
        this.lastCapture = this.ctx.getImageData(0, 0, w, h);
        this.dispatchEvent(new CustomEvent('capture', { detail: this.lastCapture }));
    }
}

/** Maps a full-range (single-channel) image to a binary image at the threshold value specified. */
function threshold(image, value) {
    const { width, height } = image;
    const data = new Array(width * height);
    for (let i = 0; i < height; i++) {
        for (let j = 0; j < width; j++) {
            const index = i * width + j;
            data[index] = image.data[image.channels * index] < value;
        }
    }
    return { width, height, channels: 1, data };
}
/** Computes the distance between two colors in RGBA color space */
function distanceRGBA(color1, color2) {
    const dr = color1[0] - color2[0];
    const dg = color1[1] - color2[1];
    const db = color1[2] - color2[2];
    const da = color1[3] - color2[3];
    return Math.hypot(dr, dg, db, da);
}
/** Maps a RGBA8 image to a Float32 image, computes pixel-wise distance in RGBA color space. */
function colorDistance(image, color) {
    const { width, height } = image;
    const data = new Float32Array(width * height);
    for (let i = 0; i < height; i++) {
        for (let j = 0; j < width; j++) {
            const index = i * width + j;
            const pixel = image.data.subarray(4 * index, 4 * index + 4);
            data[index] = distanceRGBA(pixel, color);
        }
    }
    return { width, height, channels: 1, data };
}
// [ ][ ][ ][1][ ]
// [ ][2][1][1][ ]
// [ ][2][1][ ][ ]
// [ ][ ][ ][ ][ ]
// [ ][ ][ ][ ][ ]
function blobify(image) {
    const { width, height } = image;
    const labels = new Uint32Array(width * height);
    labels.fill(0);
    let lastLabel = 1;
    for (let i = 0; i < height; i++) {
        for (let j = 0; j < width; j++) {
            const center = i * width + j;
            if (image.data[center] === false)
                continue;
            const left = labels[i * width + (j - 1)] || null;
            const top = labels[(i - 1) * width + j] || null;
            if (top !== null && top > 0 && left !== null && left > 0) {
                // join center with top
                labels[center] = top;
                // join left with top
                labels[i * width + (j - 1)] = top;
                // TODO: this does not fix pixels past the one immediately left
            }
            else if (top !== null && top > 0) {
                // join center with top
                labels[center] = top;
            }
            else if (left !== null && left > 0) {
                // join center with left
                labels[center] = left;
            }
            else {
                // new label
                lastLabel += 1;
                labels[center] = lastLabel;
            }
        }
    }
    // compute list of blobs
    const blobs = new Map();
    for (let i = 0; i < height; i++) {
        for (let j = 0; j < width; j++) {
            const label = labels[i * width + j];
            if (label === 0)
                continue;
            const b = blobs.get(label);
            if (!b)
                blobs.set(label, { count: 1, centroid: [i, j] });
            else {
                b.count += 1;
                b.centroid[0] += i;
                b.centroid[1] += j;
            }
        }
    }
    // normalize centroids
    for (let [label, b] of blobs) {
        b.centroid[0] /= b.count;
        b.centroid[1] /= b.count;
    }
    return blobs;
}

class Robot extends Entity {
    constructor(pos = create(), dir = create$1()) {
        super(pos, dir);
        this.dx = 0;
        // Camera re-uses the same position and direction vectors
        this.camera = new Camera({ width: 64, height: 64, pos, dir });
        this.camera.addEventListener('capture', this.onCapture.bind(this));
        // this.output1 = document.createElement('textarea');
        // this.output2 = document.createElement('output');
        this.view0 = new ImageDataView({ width: 64, height: 64 });
        this.view0.name = 'camera';
        this.view1 = new ImageDataView({ width: 64, height: 64 });
        this.view1.name = 'threshold';
        this.view2 = new ImageDataView({ width: 64, height: 64 });
        this.view2.name = 'detect red';
        this.view3 = new PlotTimeSeriesView();
        this.inspector.addView(this.view0);
        this.inspector.addView(this.view2);
        this.inspector.addView(this.view1);
        this.inspector.addView(this.view3);
        // document.body.appendChild(this.output1);
        // document.body.appendChild(this.output2);
    }
    ;
    initialize(sim) {
        this.camera.initialize(sim);
        sim.addEventListener('pause', () => this.view3.paused = true);
        sim.addEventListener('resume', () => this.view3.paused = false);
        sim.addEventListener('stop', () => this.view3.stop());
        sim.addEventListener('start', () => this.view3.start());
        this.view3.addSeries('dx', {
            getValue: () => this.dx,
            min: -32,
            max: 32,
        });
    }
    /** Given an image, find the largest red object. */
    findTarget(image) {
        const distMap = colorDistance(image, new Uint8ClampedArray([255, 0, 0, 255]));
        this.view2.setData(distMap.data);
        const binMap = threshold(distMap, 32);
        this.view1.setData(binMap.data);
        const blobs = blobify(binMap);
        // this.output2.value = Array.from(blobs.values()).map(b => JSON.stringify(b)).join('\n');
        let maxBlob = { centroid: [0, 0], count: 0 };
        for (let [label, b] of blobs) {
            if (b.count > maxBlob.count)
                maxBlob = b;
        }
        return maxBlob;
    }
    /** Handler for the camera's `capture` event. */
    onCapture(event) {
        this.view0.setData(event.detail.data);
        const b = this.findTarget(event.detail);
        const targetX = this.camera.width / 2;
        this.dx = b.centroid[1] - targetX;
        // this.output1.value = JSON.stringify({
        //   dx: dx.toFixed(2),
        //   cr: b.centroid[0].toFixed(2),
        //   cc: b.centroid[1].toFixed(2),
        //   count: b.count
        // });
    }
    update(state) {
    }
}

function formatTime(seconds) {
    let minutes = Math.floor(seconds / 60);
    seconds -= minutes * 60;
    let hours = Math.floor(minutes / 60);
    minutes -= hours * 60;
    let days = Math.floor(hours / 24);
    hours -= days * 24;
    let years = Math.floor(days / 365);
    days -= years * 365;
    const ddd = `${days}`.padStart(3, '0');
    const time = [
        `${hours}`.padStart(2, '0'),
        `${minutes}`.padStart(2, '0'),
        seconds.toFixed(3).padStart(6, '0'),
    ].join(':');
    return `${years}-${ddd}/${time}`;
}
window.addEventListener('load', () => {
    const toolbar = document.createElement('div');
    toolbar.setAttribute('role', 'toolbar');
    document.body.appendChild(toolbar);
    const sim = new Simulation();
    sim.addEntity(new ManualMarker({
        radius: 3,
        color: '#FF0000',
    }));
    sim.addEntity(new AutoMarker({
        radius: 4,
        color: '#00FF00',
        ax: 24,
        ay: 8,
        center: fromValues(32, 32, 0),
        phase: 0,
        period: 1,
    }));
    sim.addEntity(new AutoMarker({
        radius: 2,
        color: '#0000FF',
        ax: 12,
        ay: 4,
        center: fromValues(20, 20, 0),
        phase: 1,
        period: 0.4,
    }));
    const robot = new Robot(fromValues(0, 0.1, -1), create$1());
    sim.addEntity(robot);
    document.body.appendChild(robot.inspector.render());
    const $time = document.createElement('input');
    $time.title = 'Simulation time';
    $time.disabled = true;
    $time.value = formatTime(sim.state.time);
    toolbar.appendChild($time);
    const $delta = document.createElement('input');
    $delta.title = 'Time step (ms)';
    $delta.type = 'number';
    $delta.value = sim.timestep.toFixed(3);
    $delta.step = '1';
    $delta.min = '1';
    $delta.style.width = `64px`;
    $delta.addEventListener('input', () => sim.timestep = parseFloat($delta.value));
    toolbar.appendChild($delta);
    const $timeScaleOut = document.createElement('output');
    $timeScaleOut.value = `${sim.timeScale}x`;
    $timeScaleOut.title = 'Time scale';
    $timeScaleOut.style.width = `48px`;
    toolbar.appendChild($timeScaleOut);
    const $timeScale = document.createElement('input');
    $timeScale.type = 'number';
    $timeScale.value = sim.timeScale.toString();
    $timeScale.step = '1';
    $timeScale.style.width = `16px`;
    $timeScale.addEventListener('input', () => {
        sim.timeScale = Math.pow(2, parseFloat($timeScale.value));
        // sim.timeMultiplier = ;
        $timeScaleOut.value = sim.timeScale < 1
            ? `1\u2044${1 / sim.timeScale}x`
            : `${sim.timeScale}x`;
    });
    toolbar.appendChild($timeScale);
    const $startButton = document.createElement('button');
    $startButton.title = 'Start';
    $startButton.classList.add('ms-Icon', 'ms-Icon--Play');
    // $startButton.classList.add('icon');
    // $startButton.textContent = 'play 􀊃\uDBC0\uDE83\u{100283}';
    $startButton.addEventListener('click', sim.start.bind(sim));
    toolbar.appendChild($startButton);
    const $pauseButton = document.createElement('button');
    $pauseButton.title = 'Pause';
    $pauseButton.disabled = true;
    $pauseButton.classList.add('ms-Icon', 'ms-Icon--Pause');
    $pauseButton.addEventListener('click', sim.pause.bind(sim));
    toolbar.appendChild($pauseButton);
    const $stopButton = document.createElement('button');
    $stopButton.title = 'Stop';
    $stopButton.disabled = true;
    $stopButton.classList.add('ms-Icon', 'ms-Icon--Stop');
    $stopButton.addEventListener('click', sim.stop.bind(sim));
    toolbar.appendChild($stopButton);
    const $stepButton = document.createElement('button');
    $stepButton.title = 'Step';
    $stepButton.disabled = true;
    $stepButton.classList.add('ms-Icon', 'ms-Icon--Next');
    $stepButton.addEventListener('click', sim.step.bind(sim));
    toolbar.appendChild($stepButton);
    // const $ffButton: HTMLButtonElement = document.createElement('button');
    // $ffButton.title = 'Speed';
    // $ffButton.disabled = true;
    // $ffButton.classList.add('ms-Icon', 'ms-Icon--FastForward');
    // $ffButton.addEventListener('click', sim.step.bind(sim));
    // toolbar.appendChild($ffButton);
    sim.addEventListener('start', () => {
        $startButton.disabled = true;
        $stopButton.disabled = false;
        $pauseButton.disabled = false;
        $stepButton.disabled = true;
        $startButton.classList.remove('ms-Icon--Play');
        $startButton.classList.add('ms-Icon--PlayResume');
        $startButton.title = 'Resume';
    });
    sim.addEventListener('stop', () => {
        $startButton.disabled = false;
        $stopButton.disabled = true;
        $pauseButton.disabled = true;
        $stepButton.disabled = true;
        $startButton.classList.remove('ms-Icon--PlayResume');
        $startButton.classList.add('ms-Icon--Play');
        $startButton.title = 'Start';
    });
    sim.addEventListener('pause', () => {
        $startButton.disabled = false;
        $stopButton.disabled = true;
        $pauseButton.disabled = true;
        $stepButton.disabled = false;
    });
    sim.addEventListener('resume', () => {
        $startButton.disabled = true;
        $stopButton.disabled = false;
        $pauseButton.disabled = false;
        $stepButton.disabled = true;
    });
    sim.addEventListener('update', ((event) => {
        const state = event.detail;
        $time.value = formatTime(state.time);
    }));
});
