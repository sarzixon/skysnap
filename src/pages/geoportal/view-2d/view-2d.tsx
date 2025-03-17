import MapComponent from "../../../components/map";
import Settings from "../../../components/settings";
import CircularProgress from "@mui/material/CircularProgress";
import { LayerState } from "../../../lib/types";
import { css } from "@emotion/react";
import { useState } from "react";
import { Alert, Stack } from "@mui/material";
import FloatingPanel from "../../../components/floatingPanel";


export default function View2D() {
    const [isLoadingLayers, setIsLoadingLayers] = useState(false);
    const [layers, setLayers] = useState<LayerState[]>([]);
    const [errors, setErrors] = useState<string[]>([]);

    return (
        <div css={css`
            width: 100%;
            height: 100%;
            position: relative;
        `}>
            {isLoadingLayers ? <div css={css`
                display: flex;
                height: 100%;
                flex-direction: column;
                justify-content: center;
                align-items: center;
            `}>
                <CircularProgress />
            </div> : <>

                <Settings layers={layers} layersHandler={setLayers} />
                <MapComponent
                    layers={layers}
                    loadingHandler={setIsLoadingLayers}
                    layersHandler={setLayers}
                    errorsHandler={setErrors}
                />
            </>}
            {errors &&
                <FloatingPanel bottom="5%">
                    <Stack spacing={2}>
                        {errors.map((err, i) => <Alert key={i} severity="error">{err}</Alert>)}
                    </Stack>
                </FloatingPanel>}
        </div>
    )
};
