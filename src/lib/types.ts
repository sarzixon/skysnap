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

export type LayerMeta = z.infer<typeof layerMetaSchema>
export type ElevationLayerMeta = z.infer<typeof elevationLayerMetaSchema>