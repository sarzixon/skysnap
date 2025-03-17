import { useEffect, useState } from "react";
import { z } from "zod";

export function useLayer<T>(url: string, schema: z.ZodType<T>) {
    const [loading, setLoading] = useState<boolean>(false);
    const [data, setData] = useState<T | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchMeta() {
            try {
                setLoading(true)
                const response = await fetch(url);

                if (!response.ok) {
                    throw new Error("Couldn't fetch layer meta: " + response.statusText);

                }

                const json = await response.json();

                //validate data using Zod
                const validatedData = schema.safeParse(json);

                //just for testing
                // if (url === "/data/6/rasters/499/499/metadata.json") {
                //     throw new Error("Test error from UseLayer hook");
                // }

                // if (url === "/data/6/vectors/2472/2472.geojson") {
                //     throw new Error("Test error from UseLayer hook");
                // }

                if (validatedData.success) {
                    setData(validatedData.data)
                } else {
                    throw new Error(`Validation error: ${validatedData.error.message}`);
                }



            } catch (error) {
                setError(error instanceof Error ? error.message : "Couldn't fetch layer metadata.");
                setLoading(false);
            } finally {
                setLoading(false);
            }
        }

        fetchMeta();
    }, []);


    return { loading, data, error }
}