import { SimState, Simulation } from './Simulation.js';
import { Entity } from './Entity.js';
import { Camera } from './Camera.js';
import { ImageDataView, PlotTimeSeriesView } from './Inspector.js';
import {
  colorDistance,
  blobify,
  threshold,
  blob,
} from './image-util.js';
// import { vec3, vec4 } from '../lib/gl-matrix/esm/index.js';
import { vec3, vec4 } from 'gl-matrix';

export class Robot extends Entity {
  private camera: Camera;
  // private output1: HTMLTextAreaElement;
  // private output2: HTMLOutputElement;
  private view0: ImageDataView<Uint8ClampedArray>;
  private view1: ImageDataView<boolean[]>;
  private view2: ImageDataView<Float32Array>;
  private view3: PlotTimeSeriesView;
  private dx: number = 0;;

  constructor(pos = vec3.create(), dir = vec4.create()) {
    super(pos, dir);
    // Camera re-uses the same position and direction vectors
    this.camera = new Camera({ width: 64, height: 64, pos, dir });
    this.camera.addEventListener('capture', this.onCapture.bind(this) as EventListener);
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

  public initialize(sim: Simulation): void {
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
  private findTarget(image: ImageData): blob {
    const distMap = colorDistance(image, new Uint8ClampedArray([255, 0, 0, 255]));
    this.view2.setData(distMap.data);
    const binMap = threshold(distMap, 32);
    this.view1.setData(binMap.data);
    const blobs = blobify(binMap);
    // this.output2.value = Array.from(blobs.values()).map(b => JSON.stringify(b)).join('\n');
    let maxBlob: blob = { centroid: [0, 0], count: 0 };
    for (let [label, b] of blobs) {
      if (b.count > maxBlob.count) maxBlob = b;
    }
    return maxBlob;
  }

  /** Handler for the camera's `capture` event. */
  private onCapture(event: CustomEvent<ImageData>): void {
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

  public update(state: SimState): void {
    
  }
}
