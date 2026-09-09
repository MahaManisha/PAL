import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Users, LogOut, LogIn, MessageSquare, Trophy, Send, Swords, CheckCircle, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import apiClient from '../api/apiClient';
import { AuthContext } from '../context/AuthContext';

const StudyGroupDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    
    const [group, setGroup] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const [newPostContent, setNewPostContent] = useState('');
    const [replyContent, setReplyContent] = useState({}); // postId -> content map
    const [actionLoading, setActionLoading] = useState(false);
    
    // Duels state
    const [myDuels, setMyDuels] = useState([]);
    const [duelsLoading, setDuelsLoading] = useState(false);

    useEffect(() => {
        fetchGroupDetails();
        fetchMyDuels();
    }, [id]);

    const fetchMyDuels = async () => {
        try {
            setDuelsLoading(true);
            const res = await apiClient.get('/api/duels/user/me');
            // Filter only duels related to this subject if we want, or just show all
            setMyDuels(res.data);
            setDuelsLoading(false);
        } catch (err) {
            console.error('Error fetching duels:', err);
            setDuelsLoading(false);
        }
    };

    const fetchGroupDetails = async () => {
        try {
            setLoading(true);
            const res = await apiClient.get(`/api/study-groups/${id}`);
            setGroup(res.data.group);
            setPosts(res.data.posts);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching group details:', err);
            setError('Failed to load group details');
            setLoading(false);
        }
    };

    const isMember = group?.members?.some(member => member._id === user?.id || member._id === user?._id);

    const handleJoinLeave = async () => {
        try {
            setActionLoading(true);
            if (isMember) {
                await apiClient.post(`/api/study-groups/${id}/leave`);
            } else {
                await apiClient.post(`/api/study-groups/${id}/join`);
            }
            await fetchGroupDetails();
        } catch (err) {
            console.error('Error joining/leaving group:', err);
            alert(err.response?.data?.msg || 'Failed to update membership');
        } finally {
            setActionLoading(false);
        }
    };

    const handleCreatePost = async (e) => {
        e.preventDefault();
        if (!newPostContent.trim()) return;
        
        try {
            setActionLoading(true);
            const res = await apiClient.post(`/api/study-groups/${id}/posts`, { content: newPostContent });
            setPosts([res.data, ...posts]);
            setNewPostContent('');
        } catch (err) {
            console.error('Error creating post:', err);
            alert(err.response?.data?.msg || 'Failed to create post');
        } finally {
            setActionLoading(false);
        }
    };

    const handleReply = async (postId) => {
        const content = replyContent[postId];
        if (!content?.trim()) return;
        
        try {
            setActionLoading(true);
            const res = await apiClient.post(`/api/study-groups/${id}/posts/${postId}/reply`, { content });
            // Update the specific post with new data
            setPosts(posts.map(p => p._id === postId ? res.data : p));
            setReplyContent({...replyContent, [postId]: ''});
        } catch (err) {
            console.error('Error replying:', err);
            alert(err.response?.data?.msg || 'Failed to reply');
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return <div className="container" style={{ paddingTop: '6rem', textAlign: 'center' }}>Loading Group...</div>;
    }

    if (error || !group) {
        return (
            <div className="container" style={{ paddingTop: '6rem', textAlign: 'center' }}>
                <div className="glass-card" style={{ padding: '2rem' }}>
                    <h3 style={{ color: '#ef4444' }}>{error || 'Group not found'}</h3>
                    <button className="primary-btn" onClick={() => navigate('/study-groups')} style={{ marginTop: '1rem' }}>
                        Back to Study Groups
                    </button>
                </div>
            </div>
        );
    }

    // Sort members by XP/points descending for the leaderboard
    const sortedMembers = [...(group.members || [])].sort((a, b) => (b.points || 0) - (a.points || 0));

    const handleChallengeMember = async (opponentId) => {
        try {
            setActionLoading(true);
            await apiClient.post('/api/duels/challenge', {
                opponentId,
                subjectId: group.subjectId._id
            });
            await fetchMyDuels();
            alert('Challenge sent!');
        } catch (err) {
            console.error('Error challenging:', err);
            alert(err.response?.data?.msg || 'Failed to challenge');
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div className="container" style={{ paddingTop: '6rem', paddingBottom: '4rem' }}>
            
            {/* Header Area */}
            <div className="glass-card" style={{ padding: '2rem', marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <div style={{ display: 'inline-block', background: 'rgba(37,99,235,0.1)', color: 'var(--primary)', padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: 600 }}>
                            {group.subjectId?.name || 'Subject'}
                        </div>
                        <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '2.5rem' }}>{group.name}</h1>
                        <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '1.1rem' }}>{group.description}</p>
                    </div>
                    <div>
                        <button 
                            className={`primary-btn ${isMember ? 'outline' : ''}`}
                            onClick={handleJoinLeave}
                            disabled={actionLoading}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: isMember ? 'transparent' : 'var(--primary)', border: isMember ? '1px solid var(--text-color)' : 'none', color: isMember ? 'var(--text-color)' : '#fff' }}
                        >
                            {isMember ? <><LogOut size={18}/> Leave Group</> : <><LogIn size={18}/> Join Group</>}
                        </button>
                    </div>
                </div>
                
                <div style={{ display: 'flex', gap: '2rem', borderTop: '1px solid var(--card-border)', paddingTop: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Users size={20} style={{ color: 'var(--primary)' }} />
                        <span style={{ fontWeight: 600, fontSize: '1.2rem' }}>{group.members.length}</span>
                        <span style={{ color: 'var(--text-muted)' }}>Members</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Trophy size={20} style={{ color: '#f59e0b' }} />
                        <span style={{ fontWeight: 600, fontSize: '1.2rem' }}>
                            {group.members.reduce((sum, m) => sum + (m.points || 0), 0)}
                        </span>
                        <span style={{ color: 'var(--text-muted)' }}>Total Group XP</span>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem' }}>
                
                {/* Left Column: Discussion Board */}
                <div>
                    <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                        <MessageSquare size={24} /> Discussion Board
                    </h2>

                    {!isMember ? (
                        <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                            Join the group to view and participate in discussions!
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {/* Create Post */}
                            <div className="glass-card" style={{ padding: '1.5rem' }}>
                                <form onSubmit={handleCreatePost}>
                                    <textarea 
                                        placeholder="Have a question or something to share?"
                                        value={newPostContent}
                                        onChange={(e) => setNewPostContent(e.target.value)}
                                        style={{ width: '100%', padding: '1rem', borderRadius: '8px', border: '1px solid var(--card-border)', background: 'var(--bg-color)', color: 'var(--text-color)', minHeight: '80px', marginBottom: '1rem' }}
                                    />
                                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                        <button type="submit" disabled={!newPostContent.trim() || actionLoading} className="primary-btn" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <Send size={16} /> Post
                                        </button>
                                    </div>
                                </form>
                            </div>

                            {/* Posts List */}
                            {posts.length === 0 ? (
                                <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                                    No posts yet. Start the conversation!
                                </div>
                            ) : (
                                posts.map(post => (
                                    <div key={post._id} className="glass-card" style={{ padding: '1.5rem' }}>
                                        {/* Post Author & Content */}
                                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                                                {post.authorId?.name?.charAt(0)?.toUpperCase() || 'U'}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{post.authorId?.name}</div>
                                                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.75rem' }}>
                                                    {new Date(post.createdAt).toLocaleString()}
                                                </div>
                                                <div style={{ lineHeight: 1.5 }}>{post.content}</div>
                                            </div>
                                        </div>

                                        {/* Replies */}
                                        <div style={{ paddingLeft: '3.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                            {post.replies?.map((reply, idx) => (
                                                <div key={idx} style={{ display: 'flex', gap: '0.75rem', padding: '1rem', background: 'rgba(128,128,128,0.05)', borderRadius: '8px' }}>
                                                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--card-border)', color: 'var(--text-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.8rem' }}>
                                                        {reply.authorId?.name?.charAt(0)?.toUpperCase() || 'U'}
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{reply.authorId?.name}</div>
                                                        <div style={{ fontSize: '0.95rem', marginTop: '0.25rem' }}>{reply.content}</div>
                                                    </div>
                                                </div>
                                            ))}
                                            
                                            {/* Reply Input */}
                                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                                                <input 
                                                    type="text" 
                                                    placeholder="Write a reply..."
                                                    value={replyContent[post._id] || ''}
                                                    onChange={(e) => setReplyContent({...replyContent, [post._id]: e.target.value})}
                                                    style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--card-border)', background: 'var(--bg-color)', color: 'var(--text-color)' }}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') handleReply(post._id);
                                                    }}
                                                />
                                                <button 
                                                    onClick={() => handleReply(post._id)}
                                                    disabled={!(replyContent[post._id] || '').trim() || actionLoading}
                                                    className="primary-btn"
                                                    style={{ padding: '0.75rem 1rem' }}
                                                >
                                                    Reply
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>

                {/* Right Column: Leaderboard / Members */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    
                    {/* Your Challenges */}
                    {isMember && (
                        <div className="glass-card" style={{ padding: '1.5rem' }}>
                            <h3 style={{ marginTop: 0, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Swords size={20} style={{ color: 'var(--primary)' }} /> Your Challenges
                            </h3>
                            {duelsLoading ? (
                                <div style={{ color: 'var(--text-muted)' }}>Loading challenges...</div>
                            ) : myDuels.filter(d => d.subjectId._id === group.subjectId._id).length === 0 ? (
                                <div style={{ color: 'var(--text-muted)' }}>No challenges yet. Start one!</div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {myDuels.filter(d => d.subjectId._id === group.subjectId._id).slice(0,5).map(duel => {
                                        const isChallenger = duel.challengerId._id === user.id;
                                        const other = isChallenger ? duel.opponentId : duel.challengerId;
                                        return (
                                            <div key={duel._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--card-border)', cursor: 'pointer' }} onClick={() => navigate(`/duel/${duel._id}`)}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--card-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.8rem' }}>
                                                        {other.name?.charAt(0)?.toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>vs {other.name}</div>
                                                        <div style={{ fontSize: '0.75rem', color: duel.status === 'COMPLETED' ? '#10b981' : 'var(--primary)' }}>
                                                            {duel.status}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Leaderboard */}
                    <div className="glass-card" style={{ padding: '1.5rem' }}>
                        <h3 style={{ marginTop: 0, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Trophy size={20} style={{ color: '#f59e0b' }} /> Group Leaderboard
                        </h3>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {sortedMembers.map((member, idx) => (
                                <div key={member._id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem', borderRadius: '8px', background: idx < 3 ? 'rgba(245, 158, 11, 0.05)' : 'transparent', border: idx < 3 ? '1px solid rgba(245, 158, 11, 0.2)' : '1px solid transparent' }}>
                                    <div style={{ fontWeight: 'bold', color: idx === 0 ? '#f59e0b' : idx === 1 ? '#9ca3af' : idx === 2 ? '#b45309' : 'var(--text-muted)', width: '20px', textAlign: 'center' }}>
                                        {idx + 1}
                                    </div>
                                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--card-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                                        {member.name?.charAt(0)?.toUpperCase()}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 500 }}>{member.name}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{member.points || 0} XP</div>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem' }}>
                                        {group.creatorId?._id === member._id && (
                                            <div style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', background: 'var(--primary)', color: 'white', borderRadius: '4px' }}>Admin</div>
                                        )}
                                        {user && user.id !== member._id && isMember && (
                                            <button 
                                                onClick={() => handleChallengeMember(member._id)}
                                                disabled={actionLoading}
                                                style={{ fontSize: '0.7rem', padding: '0.25rem 0.5rem', background: 'transparent', border: '1px solid var(--primary)', color: 'var(--primary)', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                                            >
                                                <Swords size={12} /> Challenge
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default StudyGroupDetails;
