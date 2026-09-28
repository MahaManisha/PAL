import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Users, Plus, Search, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import apiClient from '../api/apiClient';
import { AuthContext } from '../context/AuthContext';

const StudyGroupsPage = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [groups, setGroups] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newGroupData, setNewGroupData] = useState({ name: '', description: '', subjectId: '' });
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [groupsRes, subjectsRes] = await Promise.all([
                apiClient.get('/api/study-groups'),
                apiClient.get('/api/subjects')
            ]);
            setGroups(groupsRes.data);
            setSubjects(subjectsRes.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching data', err);
            setError('Failed to load study groups');
            setLoading(false);
        }
    };

    const handleCreateGroup = async (e) => {
        e.preventDefault();
        try {
            setCreating(true);
            setError(null);
            const res = await apiClient.post('/api/study-groups', newGroupData);
            setGroups([res.data, ...groups]); // Add to front
            setShowCreateModal(false);
            setNewGroupData({ name: '', description: '', subjectId: '' });
            navigate(`/study-groups/${res.data._id}`);
        } catch (err) {
            setError(err.response?.data?.msg || 'Failed to create group');
        } finally {
            setCreating(false);
        }
    };

    if (loading) {
        return (
            <div className="container" style={{ paddingTop: '6rem', textAlign: 'center' }}>
                <p style={{ color: 'var(--text-muted)' }}>Loading Study Groups...</p>
            </div>
        );
    }

    return (
        <div className="container" style={{ paddingTop: '6rem', paddingBottom: '4rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                <div>
                    <h1 className="heading-gradient" style={{ fontSize: '2.5rem', margin: 0, display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <Users size={36} /> Study Groups
                    </h1>
                    <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                        Join a community of learners and master subjects together.
                    </p>
                </div>
                <button className="primary-btn" onClick={() => setShowCreateModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Plus size={18} /> Create Group
                </button>
            </div>

            {error && !showCreateModal && (
                <div style={{ padding: '1rem', background: '#fee2e2', color: '#b91c1c', borderRadius: '8px', marginBottom: '2rem' }}>
                    {error}
                </div>
            )}

            {groups.length === 0 ? (
                <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
                    <Users size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
                    <h3 style={{ margin: '0 0 1rem 0' }}>No Study Groups Yet</h3>
                    <p style={{ color: 'var(--text-muted)' }}>Be the first to create a study group and invite others!</p>
                    <button className="primary-btn" onClick={() => setShowCreateModal(true)} style={{ marginTop: '1rem' }}>
                        Create a Group
                    </button>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
                    {groups.map((group) => (
                        <motion.div key={group._id} whileHover={{ y: -5 }} className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{group.name}</h3>
                                <span style={{ background: 'rgba(37,99,235,0.1)', color: 'var(--primary)', padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                    <BookOpen size={14} /> {group.subject?.name || 'Unknown'}
                                </span>
                            </div>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', flexGrow: 1, marginBottom: '1.5rem' }}>
                                {group.description}
                            </p>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--card-border)', paddingTop: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                    <Users size={16} /> {group.memberCount} member{group.memberCount !== 1 && 's'}
                                </div>
                                <Link to={`/study-groups/${group._id}`} className="primary-btn" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
                                    View Group
                                </Link>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Create Group Modal */}
            {showCreateModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', zIndex: 1000,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-card" style={{ width: '100%', maxWidth: '500px', padding: '2rem' }}>
                        <h2 style={{ marginTop: 0, marginBottom: '1.5rem' }}>Create Study Group</h2>
                        
                        {error && (
                            <div style={{ padding: '0.75rem', background: '#fee2e2', color: '#b91c1c', borderRadius: '8px', marginBottom: '1rem' }}>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleCreateGroup}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Group Name</label>
                                <input 
                                    type="text" 
                                    value={newGroupData.name}
                                    onChange={(e) => setNewGroupData({...newGroupData, name: e.target.value})}
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--card-border)', background: 'var(--bg-color)', color: 'var(--text-color)' }}
                                    placeholder="E.g., Physics Enthusiasts"
                                    required
                                />
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Subject</label>
                                <select 
                                    value={newGroupData.subjectId}
                                    onChange={(e) => setNewGroupData({...newGroupData, subjectId: e.target.value})}
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--card-border)', background: 'var(--bg-color)', color: 'var(--text-color)' }}
                                    required
                                >
                                    <option value="">Select a subject</option>
                                    {subjects.map(sub => (
                                        <option key={sub._id} value={sub._id}>{sub.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div style={{ marginBottom: '2rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Description</label>
                                <textarea 
                                    value={newGroupData.description}
                                    onChange={(e) => setNewGroupData({...newGroupData, description: e.target.value})}
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--card-border)', background: 'var(--bg-color)', color: 'var(--text-color)', minHeight: '100px' }}
                                    placeholder="What is this group about?"
                                    required
                                />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                                <button type="button" onClick={() => setShowCreateModal(false)} style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', border: '1px solid var(--card-border)', background: 'transparent', color: 'var(--text-color)', cursor: 'pointer' }}>
                                    Cancel
                                </button>
                                <button type="submit" disabled={creating} className="primary-btn">
                                    {creating ? 'Creating...' : 'Create Group'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default StudyGroupsPage;
