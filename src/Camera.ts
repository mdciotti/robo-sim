import { Simulation, SimState } from './Simulation.js';
import { Entity, AutoMarker, ManualMarker } from './Entity.js';
// import { vec3, vec4 } from '../node_modules/gl-matrix/esm/index.js';
import { vec3, vec4 } from 'gl-matrix';

interface CameraOptions {
  width: number;
  height: number;
  pos?: vec3;
  dir?: vec4;
  fov?: number;
  fps?: number;
}

export class Camera extends Entity {
  /** the camera's field of view in degrees */
  public fov: number;

  /** the canvas onto which the image is rendered */
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  /** the most recent image captured */
  public lastCapture: ImageData|null;

  /** the framerate of the camera */
  private fps: number;

  readonly width: number;
  readonly height: number;

  constructor(options: CameraOptions) {
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
    if (ctx === null) throw new Error('Failed to get canvas context for camera');
    this.ctx = ctx;
  }

  /**
   * Initialize the simulation listeners
   */
  public initialize(sim: Simulation) {
    let captureTimer: number;
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

  private capture(state: SimState) {
    const w = this.canvas.width;
    const h = this.canvas.height;

    this.ctx.clearRect(0, 0, w, h);
    for (const entity of state.entities) {
      if (entity instanceof AutoMarker) {
        entity.renderToCamera(this.ctx);
      } else if (entity instanceof ManualMarker) {
        entity.renderToCamera(this.ctx);
      }
    }

    this.lastCapture = this.ctx.getImageData(0, 0, w, h);
    this.dispatchEvent(new CustomEvent('capture', { detail: this.lastCapture }));
  }
}
