import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';

const UserList = ({ onSelectUser }) => {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [unreadCounts, setUnreadCounts] = useState({});

    useEffect(() => {
        fetchUsers();
        if (currentUser) {
            fetchUnreadCounts();
            const interval = setInterval(fetchUnreadCounts, 5000);
            return () => clearInterval(interval);
        }
    }, [currentUser]);

    const fetchUsers = async () => {
        try {
            const res = await fetch(`${API_URL}/api/admin/users`);
            const data = await res.json();
            // 승인된 회원만 표시 (본인 제외)
            const approvedUsers = data.filter(u => u.isApproved && u.username !== currentUser?.username);
            setUsers(approvedUsers);
        } catch (err) {
            console.error('Failed to fetch users:', err);
        }
    };

    const fetchUnreadCounts = async () => {
        try {
            const res = await fetch(`${API_URL}/api/messages/${currentUser.username}`);
            const messages = await res.json();

            // Count unread messages per user
            const counts = {};
            messages.forEach(msg => {
                if (msg.to === currentUser.username && !msg.read) {
                    counts[msg.from] = (counts[msg.from] || 0) + 1;
                }
            });
            setUnreadCounts(counts);
        } catch (err) {
            console.error('Failed to fetch unread counts:', err);
        }
    };

    return (
        <div style={{ padding: '2rem' }}>
            <h2>👥 회원 목록</h2>
            <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
                {users.map(user => (
                    <div
                        key={user.id}
                        onClick={() => onSelectUser(user)}
                        style={{
                            padding: '1rem',
                            border: '1px solid #ddd',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            transition: 'all 0.2s',
                            backgroundColor: '#fff'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
                    >
                        <div style={{ position: 'relative' }}>
                            <img
                                src={`https://api.dicebear.com/9.x/dylan/svg?seed=${user.avatarSeed || user.username}`}
                                alt="avatar"
                                style={{ width: '40px', height: '40px', borderRadius: '50%' }}
                            />
                            {unreadCounts[user.username] > 0 && (
                                <span style={{
                                    position: 'absolute',
                                    top: '-5px',
                                    right: '-5px',
                                    backgroundColor: '#FF9800',
                                    color: 'white',
                                    borderRadius: '50%',
                                    padding: '2px 6px',
                                    fontSize: '0.7rem',
                                    fontWeight: 'bold',
                                    minWidth: '18px',
                                    textAlign: 'center'
                                }}>
                                    {unreadCounts[user.username]}
                                </span>
                            )}
                        </div>
                        <div>
                            <div style={{ fontWeight: 'bold' }}>{user.username}</div>
                            {user.role === 'admin' && (
                                <span style={{ fontSize: '0.8rem', color: '#1976d2' }}>👑 관리자</span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default UserList;
