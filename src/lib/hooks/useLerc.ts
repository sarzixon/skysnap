import { isLoaded, load } from "lerc";
import { useEffect, useState } from "react";

export function useLerc(wasmPath: string) {
    const [isLercLoaded, setIsLercLoaded] = useState(false);
    const [error, setError] = useState<string | null>(null);
    useEffect(() => {
        async function loadLerc() {
            try {
                await load({
                    locateFile() {
                        return wasmPath;
                    },
                });


                setIsLercLoaded(isLoaded());
            } catch (error) {
                setIsLercLoaded(false);
                setError(`Couldn't laod Lerc wasm module: ${error instanceof Error ? error.message : ""}`);
            }
        }
        loadLerc();
    }, []);

    return { isLercLoaded, error };
}