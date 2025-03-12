import { useEffect, useRef, useState } from 'react';
import { Map, View } from 'ol';
import { ImageTile, OSM, XYZ } from 'ol/source';
import { Tile as TileLayer } from 'ol/layer';
import TileGrid from 'ol/tilegrid/TileGrid';
import proj4 from 'proj4';
import { register } from 'ol/proj/proj4';
import { fromLonLat, get as getProjection, transformExtent } from 'ol/proj';
import { load, isLoaded, decode } from "lerc";

import "ol/ol.css";
import { ElevationLayerMeta, elevationLayerMetaSchema, LayerMeta, layerMetaSchema } from '../lib/types';
import { useLayerMeta } from '../lib/hooks/useLayerMeta';
import { useMap } from '../lib/hooks/useMap';
import { asImageLike } from 'ol/DataTile';

proj4.defs(
    "EPSG:2176",
    "+proj=tmerc +lat_0=0 +lon_0=15 +k=0.999923 +x_0=5500000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs"
);
register(proj4);
const proj2176 = getProjection('EPSG:2176');


// Lerc.
const MapComponent = () => {


    const { mapRef, mapInstance } = useMap();
    const { loading, data: layerMeta, error } = useLayerMeta<LayerMeta>("/data/6/rasters/500/500/metadata.json", layerMetaSchema);
    const { loading: loadingElevation, data: elevationData, error: elevationError } = useLayerMeta<ElevationLayerMeta>("/data/6/rasters/499/499/metadata.json", elevationLayerMetaSchema);
    const [isLercLoaded, setIsLercLoaded] = useState(false);

    useEffect(() => {
        async function loadLerc() {
            try {
                await load({
                    locateFile(wasmFileName, scriptDir) {
                        return 'lerc-wasm.wasm';
                    },
                });


                setIsLercLoaded(isLoaded());
            } catch (error) {
                setIsLercLoaded(false);
            }
        }
        loadLerc();
    }, []);

    useEffect(() => {
        if (!mapInstance.current || !elevationData || !isLercLoaded) return;

        const generateElevationTile = async (z: number, x: number, y: number) => {
            const response = await fetch(`/data/6/rasters/499/499/${z}/${x}/${y}.lerc`);
            const arrayBuffer = await response.arrayBuffer();
            const result = decode(arrayBuffer);

            const pixels = result.pixels[0];
            const { minValue, maxValue } = result.statistics[0];
            const scale = 255 / (maxValue - minValue);

            const imageData = new Uint8ClampedArray(result.width * result.height * 4);
            for (let i = 0; i < pixels.length; i++) {
                const value = Math.round((pixels[i] - minValue) * scale);
                const idx = i * 4;
                imageData[idx] = value;
                imageData[idx + 1] = value;
                imageData[idx + 2] = value;
                imageData[idx + 3] = 255;
            }

            const canvas = document.createElement('canvas');
            canvas.width = result.width;
            canvas.height = result.height;
            const ctx = canvas.getContext('2d')!;
            ctx.putImageData(new ImageData(imageData, result.width, result.height), 0, 0);

            return canvas;
        }

        const source = new ImageTile({
            // url: '/data/6/rasters/499/499/{z}/{x}/{y}.lerc',
            projection: proj2176!,
            loader: generateElevationTile,
            tileGrid: new TileGrid({
                origin: [elevationData.minX, elevationData.maxY],
                resolutions: elevationData.resolutions,
                tileSize: [elevationData.tileSize, elevationData.tileSize],
                extent: [elevationData.minX, elevationData.minY, elevationData.maxX, elevationData.maxY]
            })
        })

        const elevationLayer = new TileLayer({
            source
        });
        // elevationLayer

        mapInstance.current.addLayer(elevationLayer);

    }, [isLercLoaded, elevationData]);

    useEffect(() => {
        if (!layerMeta || !mapInstance.current) return;

        const rasterLayer = new TileLayer({
            source: new ImageTile({
                url: '/data/6/rasters/500/500/{z}/{x}/{y}.webp',
                projection: proj2176!,
                tileGrid: new TileGrid({
                    origin: [layerMeta.minX, layerMeta.maxY],
                    resolutions: layerMeta.resolutions,
                    tileSize: [layerMeta.tileSize, layerMeta.tileSize],
                    extent: [layerMeta.minX, layerMeta.minY, layerMeta.maxX, layerMeta.maxY]
                }),
            }),
        });

        mapInstance.current.addLayer(rasterLayer);

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

    return <>
        <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
        <div id="test"></div>
    </>;
};

export default MapComponent;