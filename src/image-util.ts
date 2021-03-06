import { vec2 } from 'gl-matrix';

/** Maps a full-range (single-channel) image to a binary image at the threshold value specified. */
export function threshold(image: ImageData2<any>, value: number): ImageData2<boolean[]> {
  const { width, height } = image;
  const data: boolean[] = new Array<boolean>(width * height);

  for (let i = 0; i < height; i++) {
    for (let j = 0; j < width; j++) {
      const index = i * width + j;
      data[index] = image.data[image.channels * index] < value;
    }
  }

  return { width, height, channels: 1, data };
}

/** Computes the distance between two colors in RGBA color space */
export function distanceRGBA(color1: Uint8ClampedArray, color2: Uint8ClampedArray): number {
  const dr = color1[0] - color2[0];
  const dg = color1[1] - color2[1];
  const db = color1[2] - color2[2];
  const da = color1[3] - color2[3];
  return Math.hypot(dr, dg, db, da);
}

export interface ImageData2<T> {
  width: number;
  height: number;
  channels: number;
  data: T;
}

/** Maps a RGBA8 image to a Float32 image, computes pixel-wise distance in RGBA color space. */
export function colorDistance(image: ImageData, color: Uint8ClampedArray): ImageData2<Float32Array> {
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

/** Binary Labeled Object */
export interface blob {
  /** the number of pixels in this blob */
  count: number;
  /** the centroid of this blob (row, col) */
  centroid: vec2;
}

// [ ][ ][ ][1][ ]
// [ ][2][1][1][ ]
// [ ][2][1][ ][ ]
// [ ][ ][ ][ ][ ]
// [ ][ ][ ][ ][ ]

export function blobify(image: ImageData2<boolean[]>): Map<number, blob> {
  const { width, height } = image;
  const labels = new Uint32Array(width * height);
  labels.fill(0);
  let lastLabel = 1;

  for (let i = 0; i < height; i++) {
    for (let j = 0; j < width; j++) {
      const center = i * width + j;
      if (image.data[center] === false) continue;
      const left = labels[i * width + (j - 1)] || null;
      const top = labels[(i - 1) * width + j] || null;
      if (top !== null && top > 0 && left !== null && left > 0) {
        // join center with top
        labels[center] = top;
        // join left with top
        labels[i * width + (j - 1)] = top;
        // TODO: this does not fix pixels past the one immediately left
      } else if (top !== null && top > 0) {
        // join center with top
        labels[center] = top;
      } else if (left !== null && left > 0) {
        // join center with left
        labels[center] = left;
      } else {
        // new label
        lastLabel += 1;
        labels[center] = lastLabel;
      }
    }
  }

  // compute list of blobs
  const blobs: Map<number, blob> = new Map();
  for (let i = 0; i < height; i++) {
    for (let j = 0; j < width; j++) {
      const label = labels[i * width + j];
      if (label === 0) continue;
      const b = blobs.get(label);
      if (!b) blobs.set(label, { count: 1, centroid: vec2.fromValues(i, j) });
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
