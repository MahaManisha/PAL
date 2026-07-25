import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import apiClient from '../api/apiClient';
import { AuthContext } from './AuthContext';
import { normalizeExperience, needsThemeSetup, markThemeSetupDone } from '../utils/themeNormalize';
import { getThemeConfig, EXPERIENCE_CONFIG } from '../config/experiences';

export const ThemeContext = createContext();

// Apply CSS variables and body classes from the resolved themeConfig
function applyThemeToDOM(themeConfig) {
    const { experience, subTheme, palette, atmosphere } = themeConfig;

    // Remove all previous theme classes
    const cls = document.body.classList;
    [...cls].forEach(c => {
        if (c.startsWith('theme-') || c.startsWith('subtheme-') || c.startsWith('atmosphere-')) {
            cls.remove(c);
        }
    });

    // Add new classes
    cls.add(`theme-${experience}`);
    cls.add(`subtheme-${subTheme}`);
    cls.add(`atmosphere-${atmosphere}`);

    // Apply CSS variable palette
    const root = document.documentElement;
    if (palette) {
        Object.entries(palette).forEach(([key, val]) => {
            root.style.setProperty(key, val);
        });
    }
}

export const ThemeProvider = ({ children }) => {
    const { user, updateUserInterest } = useContext(AuthContext);

    const [experience, setExperienceState] = useState('professional');
    const [subTheme, setSubThemeState] = useState('corporate');
    const [themeConfig, setThemeConfig] = useState(() => getThemeConfig('professional', 'corporate'));
    const [needsSetup, setNeedsSetup] = useState(false);
    const [isChanging, setIsChanging] = useState(false);

    // Initialise theme from user data whenever user changes
    useEffect(() => {
        if (!user) return;

        const canonical = normalizeExperience(user.interest);
        const expCfg = EXPERIENCE_CONFIG[canonical] || EXPERIENCE_CONFIG.professional;
        const resolvedSubTheme = (user.subTheme && expCfg.subThemes[user.subTheme])
            ? user.subTheme
            : expCfg.defaultSubTheme;

        const config = getThemeConfig(canonical, resolvedSubTheme);

        setExperienceState(canonical);
        setSubThemeState(resolvedSubTheme);
        setThemeConfig(config);
        applyThemeToDOM(config);
        setNeedsSetup(needsThemeSetup(user));

        // Silently persist the default sub-theme for legacy users
        if (canonical !== 'none' && (!user.subTheme || user.subTheme === '')) {
            apiClient.put('/api/auth/update-interest', {
                userId: user.id,
                interest: canonical,
                subTheme: resolvedSubTheme,
            }).then(() => {
                const stored = localStorage.getItem('user');
                if (stored) {
                    const parsed = JSON.parse(stored);
                    parsed.interest = canonical;
                    parsed.subTheme = resolvedSubTheme;
                    localStorage.setItem('user', JSON.stringify(parsed));
                }
            }).catch(err => console.error('Silent persist failed:', err));
        }
    }, [user]);

    /**
     * Persist a new experience + sub-theme to the backend and update local state.
     * On failure: reverts to previous state and returns { success: false, error }.
     */
    const savePreference = useCallback(async (newExperience, newSubTheme) => {
        const prev = { experience, subTheme, themeConfig };
        setIsChanging(true);

        // Optimistic update
        const newConfig = getThemeConfig(newExperience, newSubTheme);
        setExperienceState(newExperience);
        setSubThemeState(newSubTheme);
        setThemeConfig(newConfig);
        applyThemeToDOM(newConfig);

        try {
            const res = await apiClient.put('/api/auth/update-interest', {
                userId: user.id,
                interest: newExperience,
                subTheme: newSubTheme,
            });

            // Update AuthContext with new user data (persists to localStorage)
            updateUserInterest(newExperience); // updates interest in context
            // Also patch subTheme directly in localStorage for instant hydration
            const stored = localStorage.getItem('user');
            if (stored) {
                const parsed = JSON.parse(stored);
                parsed.interest = newExperience;
                parsed.subTheme = newSubTheme;
                localStorage.setItem('user', JSON.stringify(parsed));
            }

            markThemeSetupDone(user.id);
            setNeedsSetup(false);
            setIsChanging(false);
            return { success: true };
        } catch (err) {
            // Revert on failure
            setExperienceState(prev.experience);
            setSubThemeState(prev.subTheme);
            setThemeConfig(prev.themeConfig);
            applyThemeToDOM(prev.themeConfig);
            setIsChanging(false);
            console.error('Failed to save theme preference:', err);
            return { success: false, error: err };
        }
    }, [experience, subTheme, themeConfig, user, updateUserInterest]);

    /**
     * Dismiss the setup modal without saving.
     * Sets the localStorage flag so the modal won't reappear this session.
     */
    const dismissSetup = useCallback(() => {
        if (user) markThemeSetupDone(user.id);
        setNeedsSetup(false);
    }, [user]);

    const value = {
        experience,
        subTheme,
        themeConfig,
        needsSetup,
        isChanging,
        savePreference,
        dismissSetup,
        // Convenience: expose full experience config for pickers
        EXPERIENCE_CONFIG,
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};

/** Convenience hook */
export const useTheme = () => useContext(ThemeContext);
