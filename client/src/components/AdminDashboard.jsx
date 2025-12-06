import React, { useState, useEffect } from 'react';

const AdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const [error, setError] = useState('');

    const fetchUsers = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/admin/users');
            const data = await res.json();
            setUsers(data);
        } catch (err) {
            setError('사용자 목록을 불러오는데 실패했습니다.');
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleApprove = async (username) => {
        try {
            const res = await fetch('http://localhost:5000/api/admin/approve', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username }),
            });

            if (res.ok) {
                alert(`${username}님이 승인되었습니다.`);
                fetchUsers(); // Refresh list
            } else {
                alert('승인 실패');
            }
        } catch (err) {
            alert('오류가 발생했습니다.');
        }
    };

    const pendingUsers = users.filter(u => !u.isApproved && u.role !== 'admin');
    const approvedUsers = users.filter(u => u.isApproved && u.role !== 'admin');

    return (
        <div className="admin-dashboard">
            <h2>👑 관리자 대시보드 - 회원 관리</h2>

            {error && <p className="error-message">{error}</p>}

            <div className="user-section">
                <h3>⏳ 승인 대기 회원 ({pendingUsers.length})</h3>
                {pendingUsers.length === 0 ? (
                    <p>대기 중인 회원이 없습니다.</p>
                ) : (
                    <ul className="user-list">
                        {pendingUsers.map(user => (
                            <li key={user.id} className="user-item">
                                <span>{user.username}</span>
                                <button
                                    onClick={() => handleApprove(user.username)}
                                    className="btn-approve"
                                >
                                    승인하기
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <div className="user-section" style={{ marginTop: '2rem' }}>
                <h3>✅ 승인된 회원 ({approvedUsers.length})</h3>
                <ul className="user-list">
                    {approvedUsers.map(user => (
                        <li key={user.id} className="user-item">
                            <span>{user.username}</span>
                            <span className="status-badge">승인됨</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default AdminDashboard;
