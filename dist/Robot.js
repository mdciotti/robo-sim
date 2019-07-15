import { Entity } from './Entity.js';
import { Camera } from './Camera.js';
import { ImageDataView, PlotTimeSeriesView } from './Inspector.js';
import { colorDistance, blobify, threshold, } from './image-util.js';
// import { vec3, vec4 } from 'gl-matrix';
const { vec3, vec4 } = glMatrix;
export class Robot extends Entity {
    constructor(pos = vec3.create(), dir = vec4.create()) {
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
