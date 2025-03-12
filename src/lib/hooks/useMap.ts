import { useEffect, useRef } from "react";
import { Map, View } from 'ol';
import TileLayer from "ol/layer/Tile";
import { OSM } from "ol/source";
import { fromLonLat } from "ol/proj";

export function useMap() {
    const mapRef = useRef<HTMLDivElement | null>(null);
    const mapInstance = useRef<Map | null>(null);

    useEffect(() => {
        if (!mapRef.current) return;

        //add base OpenStreetMaps layer
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
            if (mapRef.current) {
                mapInstance.current = null;
            }
        };
    }, []);

    return {
        mapRef,
        mapInstance
    }
}