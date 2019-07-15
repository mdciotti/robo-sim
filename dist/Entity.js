import { Inspector } from './Inspector.js';
import EventTargetShim from './EventTargetShim.js';
// import { vec3, vec4 } from 'gl-matrix';
const { vec3, vec4 } = glMatrix;
export class Entity extends EventTargetShim {
    constructor(pos = vec3.create(), dir = vec4.create()) {
        super();
        this.name = 'entity';
        this.position = pos;
        this.direction = dir;
        this.inspector = new Inspector();
    }
    initialize(sim) { }
    update(state) { }
}
export class ManualMarker extends Entity {
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
export class AutoMarker extends ManualMarker {
    constructor(options) {
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
    update(state) {
        const t = this.phase + state.time / this.period;
        this.position[0] = this.center[0] + this.ax * Math.cos(t);
        this.position[1] = this.center[1] + this.ay * Math.sin(t);
    }
}
