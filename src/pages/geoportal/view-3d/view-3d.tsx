import { css } from "@emotion/react";
import { useEffect, useRef } from "react";

export default function View3D() {
    const viewerContainerRef = useRef(null);
    const potreeInitializedRef = useRef(false);

    useEffect(() => {
        if (potreeInitializedRef.current) {
            return;
        }
        // Check if Potree has been loaded
        if (typeof window !== 'undefined' && window.Potree) {
            initializePotree();
        }

        function initializePotree() {
            if (!viewerContainerRef.current) return;

            potreeInitializedRef.current = true;

            const viewer = new Potree.Viewer(viewerContainerRef.current);

            viewer.setEDLEnabled(true);
            viewer.setFOV(60);
            viewer.setPointBudget(2_500_000);
            viewer.setBackground('gradient');
            viewer.loadGUI(() => {
                viewer.setLanguage('en');
                viewer.toggleSidebar();
            });

            // Load EPT format point cloud
            Potree.loadPointCloud("/data/6/pointclouds/2473/ept/ept.json", "ept", e => {

                if (e.type === "pointcloud_loaded") {
                    let pointcloud = e.pointcloud;
                    let material = pointcloud.material;

                    material.pointSizeType = Potree.PointSizeType.ADAPTIVE;
                    material.size = 1;

                    viewer.scene.addPointCloud(pointcloud);
                    viewer.fitToScreen();
                }
            });

            return () => {
                viewerContainerRef.current = null;
                // better way to dispose Potree?
            }
        }
    }, []);

    return (
        <div className="potree_container" css={css`
            width: 100%;
            height: 100%;
            position: relative;
        `}>
            <div ref={viewerContainerRef} id="potree_render_area"></div>
            <div id="potree_sidebar_container"> </div>
        </div>
    )
};
