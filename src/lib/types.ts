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

export const vectorObjSchema = z.object({
    id: z.number(),
    photos_m2m: z.array(z.unknown()),
    tabulars_m2m: z.array(z.unknown()),
    is_active: z.boolean(),
    data_type_fk: z.number(),
    geom: z.object({
        type: z.string(),
        coordinates: z.array(z.array(z.array(z.number())))
    }),
    is_2d: z.boolean(),
    properties: z.object({ pred_ID: z.number() }).optional(),
    dataset_fk: z.number(),
    file_fk: z.number()
});

export const vectorsResponseSchema = z.object({
    count: z.number(),
    next: z.null(),
    previous: z.null(),
    results: z.array(vectorObjSchema)
})

export type VectorObj = z.infer<typeof vectorObjSchema>
export type VectorsResponse = z.infer<typeof vectorsResponseSchema>
