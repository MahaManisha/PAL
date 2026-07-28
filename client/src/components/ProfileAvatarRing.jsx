import React from 'react';
import { calculateProfileCompletion } from '../utils/profileUtils';

const ProfileAvatarRing = ({ user, size = 44, strokeWidth = 3, showBadge = false, onClick }) => {
    const { percentage, ringColor, isComplete } = calculateProfileCompletion(user);

    const radius = (size - strokeWidth * 2) / 2;
    const center = size / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    const avatarSrc = user?.avatarUrl || (user?.equipped?.avatar && user.equipped.avatar.startsWith('http') ? user.equipped.avatar : null);
    const initial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

    return (
        <div
            onClick={onClick}
            style={{
                position: 'relative',
                width: `${size}px`,
                height: `${size}px`,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: onClick ? 'pointer' : 'default',
                flexShrink: 0
            }}
            title={`Profile ${percentage}% Complete`}
        >
            {/* SVG Ring */}
            <svg
                width={size}
                height={size}
                style={{
                    position: 'absolute',
                    inset: 0,
                    transform: 'rotate(-90deg)',
                    filter: isComplete ? 'drop-shadow(0 0 6px rgba(34, 197, 94, 0.7))' : 'none',
                    transition: 'filter 0.3s ease'
                }}
            >
                {/* Background Ring Track */}
                <circle
                    cx={center}
                    cy={center}
                    r={radius}
                    fill="transparent"
                    stroke="rgba(148, 163, 184, 0.25)"
                    strokeWidth={strokeWidth}
                />
                {/* Progress Arc */}
                <circle
                    cx={center}
                    cy={center}
                    r={radius}
                    fill="transparent"
                    stroke={ringColor}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    style={{
                        transition: 'stroke-dashoffset 0.6s cubic-bezier(0.4, 0, 0.2, 1), stroke 0.6s ease'
                    }}
                />
            </svg>

            {/* Inner Avatar Content */}
            <div
                style={{
                    width: `${size - strokeWidth * 3}px`,
                    height: `${size - strokeWidth * 3}px`,
                    borderRadius: '50%',
                    overflow: 'hidden',
                    background: avatarSrc ? 'transparent' : 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    fontWeight: 800,
                    fontSize: `${size * 0.4}px`,
                    boxShadow: 'inset 0 0 4px rgba(0,0,0,0.15)'
                }}
            >
                {avatarSrc ? (
                    <img
                        src={avatarSrc}
                        alt={user?.name || 'User Avatar'}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => {
                            e.target.style.display = 'none';
                        }}
                    />
                ) : (
                    initial
                )}
            </div>

            {/* Optional Percentage Badge */}
            {showBadge && (
                <div
                    style={{
                        position: 'absolute',
                        bottom: '-2px',
                        right: '-2px',
                        background: ringColor,
                        color: '#ffffff',
                        fontSize: '0.62rem',
                        fontWeight: 800,
                        padding: '1px 5px',
                        borderRadius: '999px',
                        border: '1.5px solid #ffffff',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                        lineHeight: 1.2
                    }}
                >
                    {percentage}%
                </div>
            )}
        </div>
    );
};

export default ProfileAvatarRing;
