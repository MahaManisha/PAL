import { useState, useEffect, useCallback, useContext } from 'react';
import apiClient from '../api/apiClient';
import { AuthContext } from '../context/AuthContext';

export const useNextAction = () => {
    const { user } = useContext(AuthContext);
    const [nextAction, setNextAction] = useState(null);
    const [allRecommendations, setAllRecommendations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchNextAction = useCallback(async () => {
        if (!user || !user.id) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            const res = await apiClient.get(`/api/recommendations/${user.id}`);
            if (res.data && res.data.primaryRecommendation) {
                setNextAction(res.data.primaryRecommendation);
                setAllRecommendations(res.data.recommendations || []);
            } else {
                setNextAction(null);
                setAllRecommendations([]);
            }
        } catch (err) {
            console.error("Failed to fetch next action", err);
            setError(err);
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchNextAction();
    }, [fetchNextAction]);

    return {
        nextAction,
        allRecommendations,
        isLoading,
        error,
        refreshAction: fetchNextAction
    };
};
