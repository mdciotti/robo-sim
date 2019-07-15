import EventTargetShim from './EventTargetShim.js';
// import { vec2 } from 'gl-matrix';
const { vec2 } = glMatrix;
export class Simulation extends EventTargetShim {
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
                    position: vec2.create(),
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
