import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';

const UserList = ({ onSelectUser, onSelectGroup }) => {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [unreadCounts, setUnreadCounts] = useState({});
    const [showGroupModal, setShowGroupModal] = useState(false);
    const [groupName, setGroupName] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedMembers, setSelectedMembers] = useState([]);

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

    const handleCreateGroup = async () => {
        if (!groupName.trim()) {
            alert('그룹 이름을 입력하세요.');
            return;
        }
        if (selectedMembers.length === 0) {
            alert('최소 1명의 멤버를 추가하세요.');
            return;
        }

        try {
            const res = await fetch(`${API_URL}/api/groupchats`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: groupName,
                    members: [currentUser.username, ...selectedMembers],
                    createdBy: currentUser.username
                })
            });

            if (res.ok) {
                const group = await res.json();
                alert('그룹이 생성되었습니다!');
                setShowGroupModal(false);
                setGroupName('');
                setSelectedMembers([]);
                setSearchQuery('');
                if (onSelectGroup) onSelectGroup(group);
            } else {
                alert('그룹 생성에 실패했습니다.');
            }
        } catch (err) {
            alert('오류가 발생했습니다.');
        }
    };

    const toggleMember = (username) => {
        if (selectedMembers.includes(username)) {
            setSelectedMembers(selectedMembers.filter(m => m !== username));
        } else {
            setSelectedMembers([...selectedMembers, username]);
        }
    };

    const filteredUsers = users.filter(u =>
        u.username.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2>👥 회원 목록</h2>
                <button
                    onClick={() => setShowGroupModal(true)}
                    style={{
                        backgroundColor: '#48bb78',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        width: '40px',
                        height: '40px',
                        fontSize: '1.5rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                    title="단체 채팅 만들기"
                >
                    +
                </button>
            </div>

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

            {/* Group Creation Modal */}
            {showGroupModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        padding: '2rem',
                        borderRadius: '16px',
                        width: '90%',
                        maxWidth: '500px',
                        maxHeight: '80vh',
                        overflowY: 'auto'
                    }}>
                        <h2 style={{ marginTop: 0 }}>단체 채팅 만들기</h2>

                        <input
                            type="text"
                            placeholder="그룹 이름"
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                marginBottom: '1rem',
                                border: '1px solid #ddd',
                                borderRadius: '8px',
                                fontSize: '1rem'
                            }}
                        />

                        <input
                            type="text"
                            placeholder="회원 검색..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                marginBottom: '1rem',
                                border: '1px solid #ddd',
                                borderRadius: '8px',
                                fontSize: '1rem'
                            }}
                        />

                        <div style={{ marginBottom: '1rem' }}>
                            <strong>선택된 멤버: {selectedMembers.length}명</strong>
                        </div>

                        <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '1rem' }}>
                            {filteredUsers.map(user => (
                                <div
                                    key={user.id}
                                    onClick={() => toggleMember(user.username)}
                                    style={{
                                        padding: '0.75rem',
                                        border: '1px solid #ddd',
                                        borderRadius: '8px',
                                        marginBottom: '0.5rem',
                                        cursor: 'pointer',
                                        backgroundColor: selectedMembers.includes(user.username) ? '#e3f2fd' : '#fff',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedMembers.includes(user.username)}
                                        readOnly
                                    />
                                    <span>{user.username}</span>
                                </div>
                            ))}
                        </div>

                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                                onClick={() => {
                                    setShowGroupModal(false);
                                    setGroupName('');
                                    setSelectedMembers([]);
                                    setSearchQuery('');
                                }}
                                style={{
                                    flex: 1,
                                    padding: '0.75rem',
                                    border: '1px solid #ddd',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    backgroundColor: 'white'
                                }}
                            >
                                취소
                            </button>
                            <button
                                onClick={handleCreateGroup}
                                style={{
                                    flex: 1,
                                    padding: '0.75rem',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    backgroundColor: '#48bb78',
                                    color: 'white',
                                    fontWeight: 'bold'
                                }}
                            >
                                생성
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserList;
