import { Simulation, SimState } from './Simulation.js';
import { AutoMarker, ManualMarker } from './Entity.js';
import { Robot } from './Robot.js';
// import * as vec3 from '../node_modules/gl-matrix/esm/vec3.js';
// import { vec3, vec4 } from 'gl-matrix';
/// <reference path="gl-matrix"/>
const { vec3, vec4 } = glMatrix;

function formatTime(seconds: number) {
  let minutes = Math.floor(seconds / 60);
  seconds -= minutes * 60
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
    center: vec3.fromValues(32, 32, 0),
    phase: 0,
    period: 1,
  }));

  sim.addEntity(new AutoMarker({
    radius: 2,
    color: '#0000FF',
    ax: 12,
    ay: 4,
    center: vec3.fromValues(20, 20, 0),
    phase: 1,
    period: 0.4,
  }));

  const robot = new Robot(vec3.fromValues(0, 0.1, -1), vec4.create());
  sim.addEntity(robot);
  document.body.appendChild(robot.inspector.render());

  const $time: HTMLInputElement = document.createElement('input');
  $time.title = 'Simulation time';
  $time.disabled = true;
  $time.value = formatTime(sim.state.time);
  toolbar.appendChild($time);

  const $delta: HTMLInputElement = document.createElement('input');
  $delta.title = 'Time step (ms)';
  $delta.type = 'number';
  $delta.value = sim.timestep.toFixed(3);
  $delta.step = '1';
  $delta.min = '1';
  $delta.style.width = `64px`;
  $delta.addEventListener('input', () => sim.timestep = parseFloat($delta.value));
  toolbar.appendChild($delta);

  const $timeScaleOut: HTMLOutputElement = document.createElement('output');
  $timeScaleOut.value = `${sim.timeScale}x`;
  $timeScaleOut.title = 'Time scale';
  $timeScaleOut.style.width = `48px`;
  toolbar.appendChild($timeScaleOut);

  const $timeScale: HTMLInputElement = document.createElement('input');
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

  const $startButton: HTMLButtonElement = document.createElement('button');
  $startButton.title = 'Start';
  $startButton.classList.add('ms-Icon', 'ms-Icon--Play');
  // $startButton.classList.add('icon');
  // $startButton.textContent = 'play 􀊃\uDBC0\uDE83\u{100283}';
  $startButton.addEventListener('click', sim.start.bind(sim));
  toolbar.appendChild($startButton);

  const $pauseButton: HTMLButtonElement = document.createElement('button');
  $pauseButton.title = 'Pause';
  $pauseButton.disabled = true;
  $pauseButton.classList.add('ms-Icon', 'ms-Icon--Pause');
  $pauseButton.addEventListener('click', sim.pause.bind(sim));
  toolbar.appendChild($pauseButton);

  const $stopButton: HTMLButtonElement = document.createElement('button');
  $stopButton.title = 'Stop';
  $stopButton.disabled = true;
  $stopButton.classList.add('ms-Icon', 'ms-Icon--Stop');
  $stopButton.addEventListener('click', sim.stop.bind(sim));
  toolbar.appendChild($stopButton);

  const $stepButton: HTMLButtonElement = document.createElement('button');
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

  sim.addEventListener('update', ((event: CustomEvent<SimState>) => {
    const state = event.detail;
    $time.value = formatTime(state.time);
  }) as EventListener);
});
