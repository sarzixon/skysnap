import { useEffect, useState } from "react";
import { z } from "zod";

export function useLayerMeta<T>(url: string, schema: z.ZodType<T>) {
    // what i neeed to store:
    //loading, data, error

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

                if (validatedData.success) {
                    setData(validatedData.data)
                } else {
                    throw new Error(`Validation error: ${validatedData.error.message}`);
                }

                setLoading(false);

            } catch (error) {
                setError(error instanceof Error ? error.message : "Couldn't fetch layer metadata.");
            }
        }

        fetchMeta();
    }, []);


    return { loading, data, error }
}