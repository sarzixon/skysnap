import { NavLink } from "react-router";

export default function Header() {
    return (
        <header>
            <nav>
                <NavLink
                    to={"/geoportal"}
                >
                    Mapa 2D
                </NavLink>
                <NavLink
                    to={"/geoportal/3d"}
                >
                    Chmura Punktów 3D
                </NavLink>
            </nav>
        </header>
    )
};
