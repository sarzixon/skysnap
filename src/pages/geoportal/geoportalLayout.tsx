import { Outlet } from "react-router";
import Header from "../../components/header";
import { css } from "@mui/material";

export default function GeoportalLayout() {
    return (
        <div css={css`
            width: 100vw;
            height: 100vh;
            display: flex;
            flex-direction: column;
        `}>
            <Header />
            <div css={css`
                flex: 1;
            `}>
                <Outlet />
            </div>
        </div>
    )
};
