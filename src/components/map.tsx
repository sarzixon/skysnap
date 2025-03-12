import { useEffect } from 'react';
import { ImageTile } from 'ol/source';
import { Tile as TileLayer } from 'ol/layer';
import TileGrid from 'ol/tilegrid/TileGrid';
import proj4 from 'proj4';
import { register } from 'ol/proj/proj4';
import { get as getProjection, transformExtent } from 'ol/proj';
import VectorLayer from 'ol/layer/Vector';
import { Options } from 'ol/source/ImageTile';
import GeoJSON from 'ol/format/GeoJSON.js';
import VectorSource from 'ol/source/Vector';

import "ol/ol.css";
import { CreateRasterLayerParams, ElevationLayerMeta, elevationLayerMetaSchema, GeoJsonResponse, geojsonResponseSchema, LayerMeta, layerMetaSchema } from '../lib/types';
import { useLayerMeta } from '../lib/hooks/useLayerMeta';
import { useMap } from '../lib/hooks/useMap';
import { useLerc } from '../lib/hooks/useLerc';
import { generateElevationTile } from '../lib/utils';

proj4.defs(
    "EPSG:2176",
    "+proj=tmerc +lat_0=0 +lon_0=15 +k=0.999923 +x_0=5500000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs"
);
register(proj4);
const proj2176 = getProjection('EPSG:2176');

const MapComponent = () => {
    const { mapRef, mapInstance } = useMap();
    const { data: layerMeta } = useLayerMeta<LayerMeta>("/data/6/rasters/500/500/metadata.json", layerMetaSchema);
    const { data: elevationData } = useLayerMeta<ElevationLayerMeta>("/data/6/rasters/499/499/metadata.json", elevationLayerMetaSchema);
    // TODO: better typing?
    const { data: geojsonData } = useLayerMeta<GeoJsonResponse>("/data/6/vectors/2472/2472.geojson", geojsonResponseSchema);
    const { isLercLoaded } = useLerc("lerc-wasm.wasm");

    function createRasterLayer({ url, loader, metadata, projection }: CreateRasterLayerParams): TileLayer {
        const sourceConfig: Options = {
            projection,
            tileGrid: new TileGrid({
                origin: [metadata.minX, metadata.maxY],
                resolutions: metadata.resolutions,
                tileSize: [metadata.tileSize, metadata.tileSize],
                extent: [metadata.minX, metadata.minY, metadata.maxX, metadata.maxY]
            }),
        }

        if (url) {
            sourceConfig.url = url;
        } else {
            sourceConfig.loader = loader;
        }

        return new TileLayer({
            source: new ImageTile(sourceConfig),
        });
    }

    useEffect(() => {
        if (!layerMeta || !mapInstance.current || !elevationData || !isLercLoaded || !geojsonData) return;

        const rasterLayer = createRasterLayer({
            url: "/data/6/rasters/500/500/{z}/{x}/{y}.webp",
            metadata: layerMeta,
            projection: proj2176!
        });
        const elevationLayer = createRasterLayer({
            loader: generateElevationTile,
            metadata: layerMeta,
            projection: proj2176!
        });

        const geoJsonVectorLayer = new VectorLayer({
            source: new VectorSource({
                features: new GeoJSON().readFeatures(geojsonData, {
                    dataProjection: proj2176!,
                    featureProjection: 'EPSG:3857'
                }),

            }),
            style: {
                'stroke-color': 'rgba(231, 27, 27, 0.7)',
                'stroke-width': 2,
                'fill-color': 'rgba(231, 27, 27, 0.7)'
            },
        })

        mapInstance.current.addLayer(rasterLayer);
        mapInstance.current.addLayer(elevationLayer);
        mapInstance.current.addLayer(geoJsonVectorLayer);

        const wgs84Extent = transformExtent(
            [layerMeta.minX, layerMeta.minY, layerMeta.maxX, layerMeta.maxY],
            'EPSG:2176',
            'EPSG:3857'
        );

        mapInstance.current.getView().fit(
            wgs84Extent,
            { padding: [50, 50, 50, 50] }
        );

    }, [layerMeta]);

    return <div ref={mapRef} style={{ width: '100%', height: '100%' }} />;

};

export default MapComponent;