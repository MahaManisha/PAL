import { useState, useEffect, useCallback, useContext } from 'react';
import apiClient from '../api/apiClient';
import { AuthContext } from '../context/AuthContext';

export const useAiCoach = () => {
    const { user } = useContext(AuthContext);
    const [insight, setInsight] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchInsight = useCallback(async () => {
        if (!user || (!user.id && !user._id)) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            const res = await apiClient.get('/api/coach/insight');
            setInsight(res.data);
        } catch (err) {
            console.error("Failed to fetch coach insight", err);
            setError(err);
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchInsight();
    }, [fetchInsight]);

    return {
        insight,
        isLoading,
        error,
        refreshInsight: fetchInsight
    };
};
