import { Projection } from "ol/proj";
import { Loader } from "ol/source/ImageTile";
import { z } from "zod"

export const layerMetaSchema = z.object({
    maxX: z.number(),
    maxY: z.number(),
    minX: z.number(),
    minY: z.number(),
    resolutions: z.array(z.number()),
    tileSize: z.number()
});

export const elevationLayerMetaSchema = layerMetaSchema.extend({
    minVal: z.number(),
    maxVal: z.number()
});

export const geojsonResponseSchema = z.record(z.string(), z.any());
export type GeoJsonResponse = z.infer<typeof geojsonResponseSchema>;

export type LayerMeta = z.infer<typeof layerMetaSchema>;
export type ElevationLayerMeta = z.infer<typeof elevationLayerMetaSchema>;

export type CreateRasterLayerParams =
    | { url: string; loader?: never; metadata: LayerMeta; projection: Projection }
    | { url?: never; loader: Loader; metadata: LayerMeta; projection: Projection };