import { Card, List } from "@mui/material";
import { LayerState } from "../lib/types";
import SettingsListItem from "./settingsListItem";
import FloatingPanel from "./floatingPanel";

export default function Settings({ layers, layersHandler }: {
    layers: LayerState[],
    layersHandler: React.Dispatch<React.SetStateAction<LayerState[]>>,
}) {

    const toggleLayerVisibility = (layerId: string) => {
        layersHandler((prevLayers) =>
            prevLayers.map(layer =>
                layer.id === layerId ? { ...layer, isVisible: !layer.isVisible } : layer
            )
        );
    };

    const handleLayerOpacityChange = (layerId: string, opacity: number) => {
        layersHandler((prevLayers) =>
            prevLayers.map(layer =>
                layer.id === layerId ? { ...layer, opacity } : layer
            )
        );
    }

    return (
        <FloatingPanel top="5%">
            <Card>
                <List>
                    {layers && layers.map(layer =>
                        <SettingsListItem
                            key={layer.id}
                            layer={layer}
                            visibilityHandler={toggleLayerVisibility}
                            opacityHandler={handleLayerOpacityChange}
                        />
                    )}
                </List>
            </Card>
        </FloatingPanel>
    );
};
