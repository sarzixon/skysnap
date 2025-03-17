import { css } from "@emotion/react";
import { NavLink } from "react-router";

export default function Header() {
    return (
        <header css={css`
                    padding: .5rem 1rem;
                    background-color: #3a3a3a;
                `}>
            <nav>
                <ul css={css`
                        list-style-type: none;
                        display: flex;
                        gap: 2rem;
                        font-weight: bold;
                    `}>
                    <li>
                        <NavLink
                            to={"/geoportal"}
                        >
                            Mapa 2D
                        </NavLink>
                    </li>
                    <li>
                        <NavLink
                            to={"/geoportal/3d"}
                        >
                            Chmura Punktów 3D
                        </NavLink>
                    </li>
                </ul>
            </nav>
        </header>
    )
};
