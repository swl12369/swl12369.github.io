import React, { useState, useEffect } from 'react';
import { API_URL } from '../config';

const UserList = ({ onSelectUser }) => {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await fetch(`${API_URL}/api/admin/users`);
            const data = await res.json();
            // 승인된 회원만 표시
            const approvedUsers = data.filter(u => u.isApproved);
            setUsers(approvedUsers);
        } catch (err) {
            console.error('Failed to fetch users:', err);
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
                        <img
                            src={`https://api.dicebear.com/9.x/dylan/svg?seed=${user.avatarSeed || user.username}`}
                            alt="avatar"
                            style={{ width: '40px', height: '40px', borderRadius: '50%' }}
                        />
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
