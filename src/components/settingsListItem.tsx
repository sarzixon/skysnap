import Checkbox from "@mui/material/Checkbox";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import { LayerState } from "../lib/types";
import { useState } from "react";
import Collapse from "@mui/material/Collapse";
import ListItemButton from "@mui/material/ListItemButton";
import { css } from "@emotion/react";
import { Slider } from "@mui/material";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";

export default function SettingsListItem({ layer, visibilityHandler, opacityHandler }: {
    layer: LayerState,
    visibilityHandler: (layerId: string) => void,
    opacityHandler: (layerId: string, opacity: number) => void,
}) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <ListItem key={layer.id} css={css`
        display: flex;
        flex-direction: column;
        `}>
            <div css={css`
                display: flex;
                width: 100%;
            `}>
                <Checkbox checked={layer.isVisible} onChange={() => visibilityHandler(layer.id)} />
                <ListItemButton onClick={() => setIsOpen(!isOpen)}>
                    <ListItemText>{layer.name}</ListItemText>
                    {isOpen ? <ExpandLess /> : <ExpandMore />}
                </ListItemButton>
            </div>
            <Collapse in={isOpen} timeout="auto" css={css`
                    min-width: 100px;
                `}>
                <ListItemText>
                    Opacity:
                </ListItemText>
                <Slider
                    value={layer.opacity}
                    step={0.01}
                    min={0}
                    max={1}
                    onChange={(_, newVal) => opacityHandler(layer.id, newVal as number)}
                    disabled={!layer.isVisible}
                />
            </Collapse>
        </ListItem>
    );
};
