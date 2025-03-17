import { useEffect, useCallback } from 'react';
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
import { Feature } from 'ol';
import { Geometry } from 'ol/geom';
import { v4 as uuidv4 } from 'uuid';

import "ol/ol.css";
import {
    CreateRasterLayerParams,
    ElevationLayerMeta,
    elevationLayerMetaSchema,
    GeoJsonResponse,
    geojsonResponseSchema,
    LayerMeta,
    layerMetaSchema,
    LayerState,
    MapComponentProps,
    VectorsResponse,
    vectorsResponseSchema
} from '../lib/types';
import { useLayer } from '../lib/hooks/useLayer';
import { useMap } from '../lib/hooks/useMap';
import { useLerc } from '../lib/hooks/useLerc';
import { generateElevationTile } from '../lib/utils';

// Register the projection used by datasets
proj4.defs(
    "EPSG:2176",
    "+proj=tmerc +lat_0=0 +lon_0=15 +k=0.999923 +x_0=5500000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs"
);
register(proj4);
const proj2176 = getProjection('EPSG:2176');


const MapComponent = ({
    layers,
    loadingHandler,
    layersHandler,
    errorsHandler
}: MapComponentProps) => {
    const { mapRef, mapInstance } = useMap();
    const { isLercLoaded } = useLerc("lerc-wasm.wasm");

    // Fetch layer data
    const { loading: loadingRaster, data: rasterMeta, error: rasterError } =
        useLayer<LayerMeta>("/data/6/rasters/500/500/metadata.json", layerMetaSchema);

    const { loading: loadingElevation, data: elevationData, error: elevationError } =
        useLayer<ElevationLayerMeta>("/data/6/rasters/499/499/metadata.json", elevationLayerMetaSchema);

    const { loading: loadingGeojson, data: geojsonData, error: geojsonError } =
        useLayer<GeoJsonResponse>("/data/6/vectors/2472/2472.geojson", geojsonResponseSchema);

    const { loading: loadingVectors, data: vectorsData, error: vectorsError } =
        useLayer<VectorsResponse>("/data/vectors_response.json", vectorsResponseSchema);

    // Check if all data is loaded
    const allLoaded = !loadingRaster && !loadingElevation && !loadingGeojson && !loadingVectors;

    // Handle errors from data fetching & validation
    useEffect(() => {
        const errors = [
            rasterError,
            elevationError,
            geojsonError,
            vectorsError
        ].filter(Boolean) as string[];

        if (errors.length > 0) {
            errorsHandler(prev => [...prev, ...errors]);
        }
    }, [rasterError, elevationError, geojsonError, vectorsError]);

    // creates a raster layer
    const createRasterLayer = useCallback(({ url, loader, metadata, projection }: CreateRasterLayerParams): TileLayer => {
        const sourceConfig: Options = {
            projection,
            tileGrid: new TileGrid({
                origin: [metadata.minX, metadata.maxY],
                resolutions: metadata.resolutions,
                tileSize: [metadata.tileSize, metadata.tileSize],
                extent: [metadata.minX, metadata.minY, metadata.maxX, metadata.maxY]
            }),
        };

        if (url) {
            sourceConfig.url = url;
        } else {
            sourceConfig.loader = loader;
        }

        return new TileLayer({
            source: new ImageTile(sourceConfig),
        });
    }, []);

    // Add a layer to the map and update layer state
    const addLayerToMap = useCallback((layer: TileLayer | VectorLayer, name: string): LayerState => {
        const layerId = uuidv4();
        layer.set('id', layerId);

        if (mapInstance.current) {
            mapInstance.current.addLayer(layer);
        }

        return {
            id: layerId,
            name,
            opacity: 1,
            isVisible: true,
        };
    }, [mapInstance]);

    // Initialize the map with layers when map is ready and data loaded
    useEffect(() => {
        if (!mapInstance.current || !isLercLoaded || !allLoaded) {
            return;
        }

        loadingHandler(true);

        try {
            const newLayers: LayerState[] = [];

            if (rasterMeta) {
                const rasterLayer = createRasterLayer({
                    url: "/data/6/rasters/500/500/{z}/{x}/{y}.webp",
                    metadata: rasterMeta,
                    projection: proj2176!
                });

                newLayers.push(addLayerToMap(rasterLayer, 'Raster layer'));

                // Fit map view to raster extent
                const wgs84Extent = transformExtent(
                    [rasterMeta.minX, rasterMeta.minY, rasterMeta.maxX, rasterMeta.maxY],
                    'EPSG:2176',
                    'EPSG:3857'
                );

                mapInstance.current.getView().fit(
                    wgs84Extent,
                    { padding: [50, 50, 50, 50] }
                );
            }

            if (elevationData) {
                const elevationLayer = createRasterLayer({
                    loader: generateElevationTile,
                    metadata: elevationData,
                    projection: proj2176!
                });

                newLayers.push(addLayerToMap(elevationLayer, 'Elevation layer'));
            }

            if (geojsonData) {
                const geoJsonVectorLayer = new VectorLayer({
                    source: new VectorSource({
                        features: new GeoJSON().readFeatures(geojsonData, {
                            dataProjection: proj2176!,
                            featureProjection: 'EPSG:3857'
                        }),
                    }),
                    style: {
                        'stroke-color': 'rgba(16, 1, 1, 0.7)',
                        'stroke-width': 2,
                        'fill-color': 'rgba(231, 27, 27, 0.7)'
                    },
                });

                newLayers.push(addLayerToMap(geoJsonVectorLayer, 'Geojson layer'));
            }

            if (vectorsData) {
                const features: Feature<Geometry>[] = [];

                vectorsData.results.forEach(el => {
                    const feature = new GeoJSON().readFeature(el.geom, {
                        featureProjection: 'EPSG:3857'
                    });

                    Array.isArray(feature) ? features.push(...feature) : features.push(feature)
                });

                const vectorsLayer = new VectorLayer({
                    source: new VectorSource({
                        features: features
                    }),
                    style: {
                        'stroke-color': 'rgba(27, 231, 78, 0.7)',
                        'stroke-width': 2,
                        'fill-color': 'rgba(54, 27, 231, 0.7)'
                    }
                });

                newLayers.push(addLayerToMap(vectorsLayer, 'Vectors layer'));
            }

            // Update layer state
            if (newLayers.length > 0) {
                layersHandler(prev => [...prev, ...newLayers]);
            }
        } catch (error) {
            console.error('Error initializing map layers:', error);
            if (error instanceof Error) {
                errorsHandler(prev => [...prev, error.message]);
            }
        } finally {
            loadingHandler(false);
        }

        // remove layers when component unmounts and reset layers state
        return () => {
            if (mapInstance.current) {
                const layers = mapInstance.current.getLayers().getArray();

                layers.forEach(layer => {
                    if (layer.get('id')) {
                        mapInstance.current!.removeLayer(layer);
                    }
                });
            }

            layersHandler([]);
        };
    }, [
        mapInstance,
        isLercLoaded,
        allLoaded,
        rasterMeta,
        elevationData,
        geojsonData,
        vectorsData,
        createRasterLayer,
        addLayerToMap,
        loadingHandler,
        layersHandler,
        errorsHandler
    ]);

    //handle layers properties update
    useEffect(() => {
        if (!mapInstance.current) return;

        mapInstance.current.getLayers().getArray().forEach(layer => {
            const layerId = layer.get('id');

            if (!layerId) return;

            const layerState = layers.find(l => l.id === layerId);

            if (layerState) {
                layer.setVisible(layerState.isVisible);
                layer.setOpacity(layerState.opacity);
            }

        });

    }, [layers, mapInstance]);

    return <div ref={mapRef} style={{ width: '100%', height: '100%' }} />;
};

export default MapComponent;