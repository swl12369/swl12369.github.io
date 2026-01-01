import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';

const GroupChatList = ({ onSelectGroup, onBack }) => {
    const { user } = useAuth();
    const [groups, setGroups] = useState([]);

    useEffect(() => {
        fetchGroups();
        const interval = setInterval(fetchGroups, 5000);
        return () => clearInterval(interval);
    }, []);

    const fetchGroups = async () => {
        try {
            const res = await fetch(`${API_URL}/api/groupchats/${user.username}`);
            const data = await res.json();
            setGroups(data);
        } catch (err) {
            console.error('Failed to fetch groups:', err);
        }
    };

    return (
        <div style={{ padding: '2rem' }}>
            <button onClick={onBack} style={{ marginBottom: '1rem' }}>
                ← 뒤로가기
            </button>

            <h2>💬 단체 채팅방 목록</h2>

            {groups.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#999', marginTop: '3rem' }}>
                    참여 중인 채팅방이 없습니다.
                </p>
            ) : (
                <div style={{ display: 'grid', gap: '1rem', marginTop: '1.5rem' }}>
                    {groups.map(group => (
                        <div
                            key={group._id || group.id}
                            onClick={() => onSelectGroup(group)}
                            style={{
                                padding: '1.5rem',
                                border: '2px solid #e2e8f0',
                                borderRadius: '12px',
                                cursor: 'pointer',
                                transition: 'all 0.3s',
                                backgroundColor: '#fff'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = '#667eea';
                                e.currentTarget.style.transform = 'translateY(-4px)';
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.2)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = '#e2e8f0';
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h3 style={{ margin: '0 0 0.5rem 0', color: '#667eea' }}>
                                        {group.name}
                                    </h3>
                                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#718096' }}>
                                        👥 {group.members.length}명 · 💬 {group.messages?.length || 0}개 메시지
                                    </p>
                                </div>
                                <div style={{ fontSize: '2rem' }}>💬</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default GroupChatList;
