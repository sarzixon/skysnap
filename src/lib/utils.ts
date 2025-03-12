import { decode } from "lerc";
import { ImageLike } from "ol/DataTile";

// https://developer.mozilla.org/en-US/docs/Web/API/ImageData
export async function generateElevationTile(z: number, x: number, y: number): Promise<ImageLike> {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;

    try {
        const response = await fetch(`/data/6/rasters/499/499/${z}/${x}/${y}.lerc`);
        const arrayBuffer = await response.arrayBuffer();
        const result = decode(arrayBuffer);

        const { width, height, mask } = result;
        const pixels = result.pixels[0];
        const { minValue, maxValue } = result.statistics[0];
        const scale = 255 / (maxValue - minValue);

        canvas.width = width;
        canvas.height = height;

        const imageData = new Uint8ClampedArray(result.width * result.height * 4);
        // I need to add mask param
        for (let i = 0; i < pixels.length; i++) {
            const masking = mask[i];
            const value = pixels[i];
            // const value = Math.round((pixels[i] - minValue) * scale);
            const idx = i * 4;
            imageData[idx] = value;
            imageData[idx + 1] = value;
            imageData[idx + 2] = value;
            imageData[idx + 3] = value * 4;


        }

        ctx.putImageData(new ImageData(imageData, result.width, result.height), 0, 0);

    } catch (error) {

    }


    // const canvas = document.createElement('canvas');
    // canvas.width = result.width;
    // canvas.height = result.height;
    // const ctx = canvas.getContext('2d')!;

    return canvas;
}
