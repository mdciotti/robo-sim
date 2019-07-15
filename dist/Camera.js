import { Entity, AutoMarker, ManualMarker } from './Entity.js';
// import { vec3, vec4 } from 'gl-matrix';
/// <reference path="../node_modules/@types/gl-matrix/index.d.ts"/>
const { vec3, vec4 } = glMatrix;
export class Camera extends Entity {
    constructor(options) {
        const { width, height, pos, dir, fov, fps } = Object.assign({
            pos: vec3.create(),
            dir: vec4.create(),
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
