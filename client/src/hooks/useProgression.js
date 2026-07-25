import { useState, useEffect, useContext, useRef, useCallback } from 'react';
import apiClient from '../api/apiClient';
import { AuthContext } from '../context/AuthContext';
import {
    normalizeId,
    getEffectiveBestScore,
    normalizeProgress,
    calculateTopicState,
    calculateChapterState,
    calculateChapterProgress,
    findCurrentChapter,
    getMasteryBand,
    determineNextAction
} from '../utils/progressionEngine';

export const useProgression = (subjectId) => {
    const { user } = useContext(AuthContext);
    
    const [chapters, setChapters] = useState([]);
    const [progressRecords, setProgressRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const mountedRef = useRef(true);
    const requestGenerationRef = useRef(0);
    const activeUserIdRef = useRef(user?.id);

    useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
        };
    }, []);

    useEffect(() => {
        activeUserIdRef.current = user?.id;
    }, [user?.id]);

    useEffect(() => {
        if (!user || !user.id || !subjectId) {
            setChapters([]);
            setProgressRecords([]);
            setLoading(false);
            setError(null);
            return;
        }

        requestGenerationRef.current += 1;
        const currentGeneration = requestGenerationRef.current;
        setLoading(true);
        setError(null);

        const fetchData = async () => {
            try {
                // 1. Fetch Chapters
                const chapRes = await apiClient.get(`/api/chapters/${subjectId}`);
                let fetchedChapters = Array.isArray(chapRes.data) ? [...chapRes.data] : [];

                // Sort Chapters by order safely
                fetchedChapters.sort((a, b) => {
                    const orderA = typeof a.order === 'number' ? a.order : 0;
                    const orderB = typeof b.order === 'number' ? b.order : 0;
                    return orderA - orderB;
                });

                // 2. Fetch Topics for all Chapters
                const topicPromises = fetchedChapters.map(c => apiClient.get(`/api/topics/${normalizeId(c._id || c.id)}`));
                const topicResponses = await Promise.all(topicPromises);

                // 3. Construct Subject Tree
                const tree = fetchedChapters.map((c, i) => {
                    let fetchedTopics = Array.isArray(topicResponses[i].data) ? [...topicResponses[i].data] : [];
                    // Sort Topics by order safely
                    fetchedTopics.sort((a, b) => {
                        const orderA = typeof a.order === 'number' ? a.order : 0;
                        const orderB = typeof b.order === 'number' ? b.order : 0;
                        return orderA - orderB;
                    });
                    return { ...c, topics: fetchedTopics };
                });

                // 4. Fetch Progress
                const progRes = await apiClient.get(`/api/progress/${user.id}`);
                const fetchedProgress = Array.isArray(progRes.data) ? progRes.data : [];

                if (!mountedRef.current || requestGenerationRef.current !== currentGeneration) return;

                setChapters(tree);
                setProgressRecords(fetchedProgress);
                setLoading(false);
            } catch (err) {
                console.error('useProgression: Error fetching data', err);
                if (!mountedRef.current || requestGenerationRef.current !== currentGeneration) return;
                setError(err.message || 'Failed to load progression data');
                setChapters([]);
                setLoading(false);
            }
        };

        fetchData();
    }, [subjectId, user?.id]);

    const refreshProgress = useCallback(async () => {
        const requestUserId = activeUserIdRef.current;
        if (!requestUserId) return;

        try {
            const res = await apiClient.get(`/api/progress/${requestUserId}`);
            if (!mountedRef.current || activeUserIdRef.current !== requestUserId) return;
            setProgressRecords(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error('useProgression: Failed to refresh progress', err);
        }
    }, []);

    const currentChapter = findCurrentChapter(chapters, progressRecords);
    const nextAction = determineNextAction(subjectId, chapters, progressRecords);

    const getChapterState = useCallback((chapter) => {
        if (!chapter) return 'LOCKED';
        const targetId = normalizeId(chapter._id || chapter.id);
        
        let isPreviousCompleted = true;
        for (let i = 0; i < chapters.length; i++) {
            const current = chapters[i];
            const currentId = normalizeId(current._id || current.id);
            if (currentId === targetId) {
                break;
            }
            const state = calculateChapterState(current, progressRecords, isPreviousCompleted);
            isPreviousCompleted = (state === 'COMPLETED');
        }
        
        return calculateChapterState(chapter, progressRecords, isPreviousCompleted);
    }, [chapters, progressRecords]);

    const getChapterProgress = useCallback((chapter) => {
        return calculateChapterProgress(chapter, progressRecords);
    }, [progressRecords]);

    const getTopicState = useCallback((topic, chapter) => {
        const chapterState = getChapterState(chapter);
        const isParentChapterLocked = chapterState === 'LOCKED';
        const topicIdStr = normalizeId(topic?._id || topic?.id);
        const normalized = normalizeProgress(progressRecords, topicIdStr);
        return calculateTopicState(topic, normalized, isParentChapterLocked);
    }, [getChapterState, progressRecords]);

    const getMasteryBandForTopic = useCallback((topicId) => {
        const topicIdStr = normalizeId(topicId);
        const normalized = normalizeProgress(progressRecords, topicIdStr);
        if (!normalized) return getMasteryBand(null);
        const effectiveScore = getEffectiveBestScore(normalized);
        return getMasteryBand(effectiveScore);
    }, [progressRecords]);

    return {
        loading,
        error,
        chapters,
        progressRecords,
        currentChapter,
        nextAction,
        getChapterState,
        getChapterProgress,
        getTopicState,
        getMasteryBandForTopic,
        refreshProgress
    };
};
