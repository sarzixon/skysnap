namespace Potree {
    const PointSizeType = {
        FIXED: 0,
        ATTENUATED: 1,
        ADAPTIVE: 2
    };
    const PointShape = {
        SQUARE: 0,
        CIRCLE: 1,
        PARABOLOID: 2
    };

    class Viewer {
        scene: Scene;
        constructor(element: HTMLElement);
        setPointBudget(budget: number): void;
        loadPointCloud(path: string, name: string, callback?: (e: PointCloudEventVariable) => void): void;
        setEDLEnabled(enabled: boolean): void;
        setBackground(color: string): void;
        setFOV(fov: number): void;
        fitToScreen(): void;
        loadGUI(callback: () => void)
        setLanguage(code: string): void
        toggleSidebar(): void
    }

    class PointCloudEventVariable {
        pointcloud: PointCloud;
        type: string
    }
    class PointCloud {
        position: THREE.Vector3;
        scale: THREE.Vector3;
        material: PointCloudMaterial;
    }
    class Scene {
        addPointCloud(pointcloud: PointCloud): void;
    }
    class PointCloudMaterial {
        size: number;
        pointSizeType: PointSizeType;
        shape: PointShape;
    }
    function loadPointCloud(
        path: string,
        name: string,
        callback: (e: PointCloudEventVariable) => void
    ): void;
}