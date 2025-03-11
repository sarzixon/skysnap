import { useEffect, useState } from "react";
import Map from "ol/map";
import View from "ol/view";
import TileLayer from "ol/layer/tile";
import OSM from "ol/source/osm";
import "ol/ol.css";
import ImageTile from "ol/source/ImageTile";
import { fromLonLat, Projection, toLonLat, transform } from "ol/proj";
import { TileGrid } from "ol/tilegrid";
import { XYZ } from "ol/source";

// default to EPSG:3857

type LayerMetadata = {
    maxX: number,
    maxY: number,
    minX: number,
    minY: number,
    resolutions: number[],
    tileSize: number
}

export default function MapComponent() {
    const [metadata, setMetadata] = useState<LayerMetadata | null>(null);

    const polandCoordinates = fromLonLat([19.0, 52.0]);


    useEffect(() => {
        async function getRasterData() {
            const res = await fetch("/data/6/rasters/500/500/metadata.json");
            // console.log(res);
            const json = await res.json();
            // console.log(json);

            if (json) {
                setMetadata(json as LayerMetadata);
            }

        }
        getRasterData();


    }, []);

    useEffect(() => {
        const layers: TileLayer[] = [
            new TileLayer({
                source: new OSM(),
            }),
        ]
        console.log(metadata);

        if (metadata) {
            const { minX, minY, maxX, maxY, resolutions, tileSize } = metadata;

            layers.push(new TileLayer({
                source: new XYZ({
                    url: '/data/6/rasters/500/{z}/{x}/{y}.png',
                    // projection: 'EPSG:2176',
                })
                // source: new ImageTile({
                //     url: "/data/6/rasters/500/500/{z}/{x}/{y}.webp",
                //     // maxResolution: resolutions[0],
                //     // tileGrid: new TileGrid({
                //     //     extent: [minX, minY, maxX, maxY],
                //     //     resolutions: resolutions,
                //     //     tileSize: tileSize
                //     // })
                //     tileSize: 512,
                //     projection: 'EPSG:2176'
                // }),
                // extent: [minX, minY, maxX, maxY]

            }))
        }

        const map = new Map({
            target: "map",
            layers,
            view: new View({
                center: polandCoordinates,
                zoom: 7,
            }),
        });

        map.on('moveend', () => {
            const view = map.getView();
            const center = view.getCenter();
            const zoom = view.getZoom();
            const lonLat = toLonLat(center!);
            const decimal = `Lon: ${lonLat[0].toFixed(6)}, Lat: ${lonLat[1].toFixed(6)}`;
            const resolution = view.getResolution();
            console.log(decimal);
            console.log(`Zoom: ${zoom}`);
            console.log(`Resolution: ${resolution}`);


        })

        return () => {
            map.setTarget(undefined);
        };
    }, [metadata]);

    return (
        <>
            <div id="map" style={{
                width: "100%",
                height: "100%",
            }}></div>
        </>
    );
};
