import { Entity } from './Entity';
import EventTargetShim from './EventTargetShim';
// import { vec2 } from '../lib/gl-matrix/esm/index.js';
import { vec2 } from 'gl-matrix';

export type SimState = {
  /** the current simulation time in seconds */
  time: number,
  /** the input state at the start of the step */
  input: {
    pointer: {
      position: vec2,
      button1: boolean,
      button2: boolean,
      button3: boolean,
      button4: boolean,
      button5: boolean,
    },
  },
  /** the list of entities known to the simulation */
  entities: Set<Entity>,
};

export class Simulation extends EventTargetShim {
  public static PX_PER_METER = 96;
  /** the time between simulation steps (ms) */
  public timestep = 20;
  /** the multiplier for relating simulation time to real time */
  private timeMultiplier = 1;
  public state: SimState;
  public isStopped = true;
  public isPaused = false;
  private stepTimer?: number;

  constructor() {
    super();

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

  public get timeScale() { return this.timeMultiplier; }
  public set timeScale(newScale: number) {
    const passedTime = performance.now() - this.state.time;
    clearTimeout(this.stepTimer);
    this.timeMultiplier = newScale;
    this.stepTimer = setTimeout(this.step.bind(this), this.timestep / this.timeMultiplier - passedTime);
  }

  private createInitialState(): SimState {
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

  public reset() {
    this.state = this.createInitialState();
    this.dispatchEvent(new CustomEvent<SimState>('update', { detail: this.state }));
  }

  public addEntity(entity: Entity) {
    this.state.entities.add(entity);
    entity.initialize(this);
  }

  public start(): void {
    this.stepTimer = setTimeout(this.step.bind(this), this.timestep / this.timeMultiplier);
    if (this.isStopped) {
      this.dispatchEvent(new Event('start'));
      this.isStopped = false;
    } else {
      this.isPaused = false;
      this.dispatchEvent(new Event('resume'));
    }
  }

  public pause(): void {
    this.isPaused = true;
    this.dispatchEvent(new Event('pause'));
    clearTimeout(this.stepTimer);
  }

  public stop(): void {
    clearTimeout(this.stepTimer);
    this.isStopped = true;
    this.dispatchEvent(new Event('stop'));
    this.reset();
  }

  public update(state: SimState): void {
    this.dispatchEvent(new CustomEvent<SimState>('update', { detail: state }));
    for (const entity of this.state.entities) {
      entity.update(state);
    }
  }

  public step(): void {
    const start = performance.now();
    this.state.time += this.timestep / 1000;
    if (!this.isPaused) this.stepTimer = setTimeout(this.step.bind(this), this.timestep / this.timeMultiplier);
    this.update(this.state);
    const end = performance.now();
    // console.log(start == end);
    // console.log((end - start) / (this.timestep / this.timeMultiplier));
  }
}
