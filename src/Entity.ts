import { Simulation, SimState } from './Simulation.js';
import { Inspector } from './Inspector.js';
import EventTargetShim from './EventTargetShim.js';
// import { vec3, vec4 } from 'gl-matrix';
const { vec3, vec4 } = glMatrix;

export class Entity extends EventTargetShim {
  public position: vec3;
  public direction: vec4;
  public inspector: Inspector;
  public name: string = 'entity';

  constructor(pos = vec3.create(), dir = vec4.create()) {
    super();
    this.position = pos;
    this.direction = dir;
    this.inspector = new Inspector();
  }

  public initialize(sim: Simulation) {}

  public update(state: SimState) {}
}

type ManualMarkerOptions = {
  radius?: number,
  color?: string,
};

type AutoMarkerOptions = ManualMarkerOptions & {
  period?: number,
  phase?: number,
  ax?: number,
  ay?: number,
  center?: vec3,
};

export class ManualMarker extends Entity {
  public radius: number;
  public color: string;

  constructor(options: ManualMarkerOptions) {
    const defaults = Object.assign({
      radius: 5,
      color: '#ffffff',
    }, options);
    super();
    this.radius = defaults.radius;
    this.color = defaults.color;
  }

  public renderToCamera(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.position[0], this.position[1], this.radius, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.fill();
  }

  public update(state: SimState): void {
    this.position[0] = state.input.pointer.position[0] / 3;
    this.position[1] = state.input.pointer.position[1] / 3;
  }
}

export class AutoMarker extends ManualMarker {
  public period: number;
  public phase: number;
  public ax: number;
  public ay: number;
  public center: vec3;

  constructor(options: AutoMarkerOptions) {
    const defaults = Object.assign({
      radius: 5,
      period: 1,
      phase: 0,
      ax: 8,
      ay: 8,
      center: vec3.fromValues(20, 20, 0),
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

  public update(state: SimState): void {
    const t = this.phase + state.time / this.period;
    this.position[0] = this.center[0] + this.ax * Math.cos(t);
    this.position[1] = this.center[1] + this.ay * Math.sin(t);
  }
}
