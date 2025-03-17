import { decode } from "lerc";
import { ImageLike } from "ol/DataTile";

/**
 * Creates a color object from elevation value
 * @param elevation - elevation value
 * @param minValue - Min elevation in the dataset
 * @param maxValue - Max elevation in the dataset
 * @returns Object with RGB values
 */
function getElevationColor(elevation: number, minValue: number, maxValue: number): { r: number, g: number, b: number } {
    const normalizedElevation = (elevation - minValue) / (maxValue - minValue);

    // Create a stepped color gradient from green (low) to yellow to red (high)
    if (normalizedElevation < 0.25) {
        // Green to yellow-green
        return {
            r: Math.round(normalizedElevation * 4 * 255),
            g: 255,
            b: 0
        };
    } else if (normalizedElevation < 0.5) {
        // Yellow-green to yellow
        return {
            r: 255,
            g: 255,
            b: 0
        };
    } else if (normalizedElevation < 0.75) {
        // Yellow to orange
        return {
            r: 255,
            g: Math.round(255 - (normalizedElevation - 0.5) * 4 * 255),
            b: 0
        };
    } else {
        // Orange to red
        return {
            r: 255,
            g: Math.round((1 - normalizedElevation) * 255),
            b: 0
        };
    }
}

/**
 * Generates an elevation tile using decoded LERC data
 * with a physical map color scheme (red for high elevations, green for low)
 * 
 * @param z - Zoom level
 * @param x - X coordinate
 * @param y - Y coordinate
 * @returns Canvas element representing the tile
 * @example 
 * //use as loader function for TileLayer source:
 * new TileLayer({
 *  source: new ImageTile({
 *      loader: generateElevationTile,
 *      projection: "2176"
 *  })
 * })
 * Understand how ImageData is constructed using LERC data
 * @see https://developer.mozilla.org/en-US/docs/Web/API/ImageData
 */
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
        canvas.width = width;
        canvas.height = height;

        // Create the image data array - 4 bytes per pixel - (R,G,B,A) 
        const imageData = new Uint8ClampedArray(width * height * 4);

        for (let i = 0; i < pixels.length; i++) {
            const maskValue = mask.length ? mask[i] : null;
            const elevationValue = pixels[i];
            const idx = i * 4;

            // Check if the pixel is masked (valid data)
            if (maskValue) {
                const { r, g, b } = getElevationColor(elevationValue, minValue, maxValue);

                imageData[idx] = r;
                imageData[idx + 1] = g;
                imageData[idx + 2] = b;
                imageData[idx + 3] = 255; // alpha
            } else {
                imageData[idx] = 0;
                imageData[idx + 1] = 0;
                imageData[idx + 2] = 0;
                imageData[idx + 3] = 0;
            }
        }

        // Put the image data on the canvas
        ctx.putImageData(new ImageData(imageData, width, height), 0, 0);
    } catch (error) {
        console.error("Error generating elevation tile:", error);
    } finally {
        return canvas;
    }
}