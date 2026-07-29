import { useState, useEffect, useCallback } from "react";
import { getSubscriptionStatus } from "../api-calls/payments.api.js";

export const useSubscriptionStatus = () => {
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchStatus = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getSubscriptionStatus();
            setStatus(data);
            setError(null);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStatus();
    }, [fetchStatus]);

    return { status, loading, error, refetch: fetchStatus };
};