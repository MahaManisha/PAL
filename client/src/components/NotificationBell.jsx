import React, { useState, useEffect, useRef } from 'react';
import { Bell, Trophy, Swords, Map, Target, BookOpen, Users, Check, CheckCircle } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import apiClient from '../api/apiClient';

const NotificationBell = () => {
    const [unreadCount, setUnreadCount] = useState(0);
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    
    const dropdownRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Fetch on mount and when route changes
    useEffect(() => {
        fetchUnreadCount();
    }, [location.pathname]);

    const fetchUnreadCount = async () => {
        try {
            const res = await apiClient.get('/api/notifications/unread-count');
            setUnreadCount(res.data.count);
        } catch (err) {
            console.error('Error fetching unread count', err);
        }
    };

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const res = await apiClient.get('/api/notifications');
            setNotifications(res.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching notifications', err);
            setLoading(false);
        }
    };

    const toggleDropdown = () => {
        const nextState = !isOpen;
        setIsOpen(nextState);
        if (nextState) {
            fetchNotifications();
        }
    };

    const handleNotificationClick = async (notif) => {
        setIsOpen(false);
        
        // Mark as read if not already
        if (!notif.read) {
            try {
                await apiClient.put(`/api/notifications/${notif._id}/read`);
                setUnreadCount(prev => Math.max(0, prev - 1));
                setNotifications(notifications.map(n => n._id === notif._id ? { ...n, read: true } : n));
            } catch (err) {
                console.error('Error marking as read', err);
            }
        }

        // Navigate
        if (notif.actionUrl) {
            navigate(notif.actionUrl);
        }
    };

    const markAllAsRead = async () => {
        try {
            await apiClient.put('/api/notifications/read-all');
            setUnreadCount(0);
            setNotifications(notifications.map(n => ({ ...n, read: true })));
        } catch (err) {
            console.error('Error marking all as read', err);
        }
    };

    const getIconForType = (type) => {
        switch (type) {
            case 'ACHIEVEMENT': return <Trophy size={16} color="#f59e0b" />;
            case 'DUEL': return <Swords size={16} color="#ef4444" />;
            case 'ROADMAP': return <Map size={16} color="#10b981" />;
            case 'MISSION': return <Target size={16} color="#8b5cf6" />;
            case 'REVISION': return <BookOpen size={16} color="#3b82f6" />;
            case 'STUDY_GROUP': return <Users size={16} color="#06b6d4" />;
            default: return <Bell size={16} color="var(--text-muted)" />;
        }
    };

    return (
        <div style={{ position: 'relative' }} ref={dropdownRef}>
            <button 
                onClick={toggleDropdown}
                style={{ 
                    background: 'transparent', 
                    border: 'none', 
                    cursor: 'pointer', 
                    padding: '0.5rem',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--text-color)'
                }}
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span style={{
                        position: 'absolute',
                        top: '2px',
                        right: '2px',
                        background: '#ef4444',
                        color: 'white',
                        fontSize: '0.65rem',
                        fontWeight: 'bold',
                        padding: '0.1rem 0.35rem',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    width: '320px',
                    maxHeight: '400px',
                    background: 'var(--bg-color)',
                    border: '1px solid var(--card-border)',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                    overflowY: 'auto',
                    zIndex: 1000,
                    marginTop: '0.5rem',
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    <div style={{ 
                        padding: '1rem', 
                        borderBottom: '1px solid var(--card-border)', 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        position: 'sticky',
                        top: 0,
                        background: 'var(--bg-color)',
                        zIndex: 1
                    }}>
                        <h3 style={{ margin: 0, fontSize: '1rem' }}>Notifications</h3>
                        {unreadCount > 0 && (
                            <button 
                                onClick={markAllAsRead}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: 'var(--primary)',
                                    fontSize: '0.8rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.25rem'
                                }}
                            >
                                <CheckCircle size={14} /> Mark all read
                            </button>
                        )}
                    </div>

                    <div style={{ padding: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        {loading ? (
                            <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>
                        ) : notifications.length === 0 ? (
                            <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                <Bell size={32} style={{ opacity: 0.2, margin: '0 auto 0.5rem auto', display: 'block' }} />
                                No notifications yet
                            </div>
                        ) : (
                            notifications.map(notif => (
                                <div 
                                    key={notif._id}
                                    onClick={() => handleNotificationClick(notif)}
                                    style={{
                                        padding: '0.75rem',
                                        borderRadius: '8px',
                                        background: notif.read ? 'transparent' : 'rgba(37,99,235,0.05)',
                                        cursor: 'pointer',
                                        transition: 'background 0.2s',
                                        display: 'flex',
                                        gap: '0.75rem',
                                        border: notif.read ? '1px solid transparent' : '1px solid rgba(37,99,235,0.1)'
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'var(--card-bg)'}
                                    onMouseLeave={e => e.currentTarget.style.background = notif.read ? 'transparent' : 'rgba(37,99,235,0.05)'}
                                >
                                    <div style={{ 
                                        width: '32px', 
                                        height: '32px', 
                                        borderRadius: '50%', 
                                        background: 'var(--card-border)', 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'center',
                                        flexShrink: 0
                                    }}>
                                        {getIconForType(notif.type)}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: notif.read ? 500 : 700, fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                                            {notif.title}
                                        </div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                                            {notif.message}
                                        </div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.4rem', opacity: 0.7 }}>
                                            {new Date(notif.createdAt).toLocaleDateString()} {new Date(notif.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                        </div>
                                    </div>
                                    {!notif.read && (
                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)', alignSelf: 'center', flexShrink: 0 }} />
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
