/**
 * themeNormalize.js
 *
 * Maps legacy interest values stored in MongoDB to the canonical Phase 2 names.
 * This runs purely on the frontend so no DB migration is needed.
 *
 * Legacy → Canonical:
 *   'gameified' → 'gamified'
 *   'movie'     → 'cinematic'
 *
 * All canonical values pass through unchanged.
 * Any unrecognised value falls back to 'professional'.
 */

const LEGACY_MAP = {
    gameified: 'gamified',
    movie: 'cinematic',
};

const CANONICAL = new Set(['professional', 'gamified', 'cinematic']);

/**
 * Normalise a raw interest string to a canonical experience name.
 * @param {string|null|undefined} raw
 * @returns {'professional'|'gamified'|'cinematic'}
 */
export function normalizeExperience(raw) {
    if (!raw || raw === 'none') return 'none';
    if (LEGACY_MAP[raw]) return LEGACY_MAP[raw];
    if (CANONICAL.has(raw)) return raw;
    return 'none';
}

/**
 * Determine whether a user still needs to complete theme setup.
 *
 * A user needs setup if they have no subTheme saved AND no client-side
 * flag confirming they already went through the picker.
 *
 * @param {{ id: string, subTheme?: string }} user
 * @returns {boolean}
 */
export function needsThemeSetup(user) {
    if (!user) return false;
    
    // Brand new user / no valid experience -> force setup
    if (!user.interest || user.interest === 'none') return true;

    // Legacy user with valid experience but missing subTheme
    // We auto-apply default, so they DO NOT need the mandatory setup modal
    if (user.subTheme === '') return false;

    // Already has a sub-theme saved → never show the picker again
    if (user.subTheme && user.subTheme !== '') return false;

    // Client flag: set after the user saves from ThemeSelectModal
    const flag = localStorage.getItem(`pal_theme_setup_${user.id}`);
    if (flag === 'done') return false;
    
    // In theory unreachable if they have an interest and subTheme handling above,
    // but just in case, legacy users bypass setup.
    return false;
}

/**
 * Mark theme setup as complete for this user (client-side only).
 * Call this after the preference is successfully saved to the backend.
 * @param {string} userId
 */
export function markThemeSetupDone(userId) {
    localStorage.setItem(`pal_theme_setup_${userId}`, 'done');
}
