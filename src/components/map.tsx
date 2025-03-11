import { useEffect, useRef, useState } from 'react';
import { Map, View } from 'ol';
import { ImageTile, OSM } from 'ol/source';
import { Tile as TileLayer } from 'ol/layer';
import TileGrid from 'ol/tilegrid/TileGrid';
import proj4 from 'proj4';
import { register } from 'ol/proj/proj4';
import { fromLonLat, get as getProjection, transformExtent } from 'ol/proj';

import "ol/ol.css";
import { LayerMeta } from '../lib/types';

// import lercWasm from "../../public/lerc-wasm.wasm";

proj4.defs(
    "EPSG:2176",
    "+proj=tmerc +lat_0=0 +lon_0=15 +k=0.999923 +x_0=5500000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs"
);
register(proj4);
const proj2176 = getProjection('EPSG:2176');

// WebAssembly.instantiateStreaming(fetch(lercWasm)).then(
//     obj => console.log(obj)
// );

const MapComponent = () => {

    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<Map | null>(null);
    const [layerMeta, setLayerMeta] = useState<LayerMeta | null>(null);

    // Initial map with OSM layer
    useEffect(() => {
        if (!mapRef.current) return;

        mapInstance.current = new Map({
            target: mapRef.current,
            layers: [new TileLayer({ source: new OSM() })],
            view: new View({
                center: fromLonLat([19.1451, 51.9194]),
                zoom: 7
            })
        });

        mapInstance.current.on('error', (e) => {
            console.log('error occured!', e);

        })

        return () => {
            if (mapInstance.current) {
                mapInstance.current.setTarget(undefined);
            }
        };
    }, []);

    // Pobierz metadane i dodaj warstwę rastrową
    useEffect(() => {
        const fetchMetadata = async () => {
            const res = await fetch("/data/6/rasters/500/500/metadata.json");
            const json = await res.json();
            setLayerMeta(json);
        };

        fetchMetadata();
    }, []);

    // Dodaj warstwę rastrową gdy metadane są dostępne
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

    return <div ref={mapRef} style={{ width: '100%', height: '100%' }} />;
};

export default MapComponent;