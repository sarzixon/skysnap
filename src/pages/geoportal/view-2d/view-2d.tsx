import { css } from "@emotion/react";
import MapComponent from "../../../components/map";
import Settings from "../../../components/settings";

export default function View2D() {
    return (
        <div css={css`
            width: 100%;
            height: 100%;
            position: relative;
        `}>
            <Settings />
            <MapComponent />
        </div>
    )
};
