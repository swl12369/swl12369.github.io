import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';

const GroupChat = ({ group, onBack }) => {
    const { user } = useAuth();
    const [messages, setMessages] = useState(group.messages || []);
    const [newMessage, setNewMessage] = useState('');

    useEffect(() => {
        const interval = setInterval(fetchMessages, 3000);
        return () => clearInterval(interval);
    }, []);

    const fetchMessages = async () => {
        try {
            const res = await fetch(`${API_URL}/api/groupchats/${user.username}`);
            const groups = await res.json();
            const currentGroup = groups.find(g => g._id === group._id || g.id === group.id);
            if (currentGroup) {
                setMessages(currentGroup.messages);
            }
        } catch (err) {
            console.error('Failed to fetch messages:', err);
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            await fetch(`${API_URL}/api/groupchats/${group._id || group.id}/messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    from: user.username,
                    content: newMessage
                })
            });
            setNewMessage('');
            fetchMessages();
        } catch (err) {
            alert('메시지 전송에 실패했습니다.');
        }
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
            <button onClick={onBack} style={{ marginBottom: '1rem', padding: '0.5rem 1rem', cursor: 'pointer' }}>
                ← 뒤로가기
            </button>

            <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
                <h2 style={{ margin: 0 }}>{group.name}</h2>
                <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem', color: '#666' }}>
                    멤버: {group.members.join(', ')}
                </p>
            </div>

            <div style={{
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '1rem',
                height: '400px',
                overflowY: 'auto',
                backgroundColor: '#fff',
                marginBottom: '1rem'
            }}>
                {messages.length === 0 ? (
                    <p style={{ textAlign: 'center', color: '#999' }}>아직 메시지가 없습니다.</p>
                ) : (
                    messages.map((msg, index) => {
                        const isMine = msg.from === user.username;
                        return (
                            <div
                                key={index}
                                style={{
                                    display: 'flex',
                                    justifyContent: isMine ? 'flex-end' : 'flex-start',
                                    marginBottom: '1rem'
                                }}
                            >
                                <div style={{
                                    maxWidth: '70%',
                                    padding: '0.75rem 1rem',
                                    borderRadius: '12px',
                                    backgroundColor: isMine ? '#667eea' : '#f0f0f0',
                                    color: isMine ? '#fff' : '#000'
                                }}>
                                    {!isMine && (
                                        <div style={{ fontSize: '0.75rem', fontWeight: 'bold', marginBottom: '0.25rem', opacity: 0.8 }}>
                                            {msg.from}
                                        </div>
                                    )}
                                    <div>{msg.content}</div>
                                    <div style={{
                                        fontSize: '0.7rem',
                                        marginTop: '0.25rem',
                                        opacity: 0.7
                                    }}>
                                        {new Date(msg.date).toLocaleString()}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            <form onSubmit={handleSend} style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="메시지를 입력하세요..."
                    style={{
                        flex: 1,
                        padding: '0.75rem',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        fontSize: '1rem'
                    }}
                />
                <button
                    type="submit"
                    style={{
                        padding: '0.75rem 1.5rem',
                        backgroundColor: '#667eea',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '1rem'
                    }}
                >
                    전송
                </button>
            </form>
        </div>
    );
};

export default GroupChat;
