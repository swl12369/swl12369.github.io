import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';

const GroupChat = ({ group, onBack }) => {
    const { user } = useAuth();
    const [messages, setMessages] = useState(group.messages || []);
    const [newMessage, setNewMessage] = useState('');
    const [previousMessageCount, setPreviousMessageCount] = useState(group.messages?.length || 0);

    // Play notification sound
    const playNotificationSound = () => {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = 800;
            oscillator.type = 'sine';
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        } catch (error) {
            console.log('Notification sound failed:', error);
        }
    };

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
                const newMessages = currentGroup.messages;

                // Check for new messages and play sound
                if (previousMessageCount > 0 && newMessages.length > previousMessageCount) {
                    const latestMsg = newMessages[newMessages.length - 1];
                    if (latestMsg.from !== user.username) {
                        playNotificationSound();
                    }
                }

                setPreviousMessageCount(newMessages.length);
                setMessages(newMessages);
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

    const handleLeaveGroup = async () => {
        if (!confirm('정말 이 채팅방을 나가시겠습니까?')) return;

        try {
            const res = await fetch(`${API_URL}/api/groupchats/${group._id || group.id}/leave`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: user.username })
            });

            if (res.ok) {
                alert('채팅방을 나갔습니다.');
                onBack();
            } else {
                alert('채팅방 나가기에 실패했습니다.');
            }
        } catch (err) {
            alert('오류가 발생했습니다.');
        }
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <button onClick={onBack} style={{ padding: '0.5rem 1rem' }}>
                    ← 뒤로가기
                </button>
                <button
                    onClick={handleLeaveGroup}
                    style={{
                        backgroundColor: '#f56565',
                        padding: '0.5rem 1rem'
                    }}
                >
                    🚪 나가기
                </button>
            </div>

            <div style={{ marginBottom: '1rem', padding: '1.5rem', backgroundColor: '#f7fafc', borderRadius: '12px' }}>
                <h2 style={{ margin: '0 0 0.5rem 0', color: '#667eea' }}>{group.name}</h2>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#718096' }}>
                    👥 멤버: {group.members.join(', ')}
                </p>
            </div>

            <div style={{
                border: '2px solid #e2e8f0',
                borderRadius: '12px',
                padding: '1.5rem',
                height: '450px',
                overflowY: 'auto',
                backgroundColor: '#f8f9fa',
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
                                    position: 'relative'
                                }}>
                                    {!isMine && (
                                        <div style={{
                                            fontSize: '0.75rem',
                                            fontWeight: 'bold',
                                            marginBottom: '0.25rem',
                                            color: '#667eea',
                                            marginLeft: '0.5rem'
                                        }}>
                                            {msg.from}
                                        </div>
                                    )}
                                    <div style={{
                                        padding: '0.875rem 1.125rem',
                                        borderRadius: isMine ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                                        backgroundColor: isMine ? '#667eea' : '#ffffff',
                                        color: isMine ? '#fff' : '#1a202c',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                        position: 'relative',
                                        wordBreak: 'break-word'
                                    }}>
                                        <div style={{ marginBottom: '0.25rem' }}>{msg.content}</div>
                                        <div style={{
                                            fontSize: '0.7rem',
                                            opacity: 0.7,
                                            textAlign: 'right'
                                        }}>
                                            {new Date(msg.date).toLocaleTimeString('ko-KR', {
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </div>
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
                        padding: '0.875rem 1.125rem',
                        border: '2px solid #e2e8f0',
                        borderRadius: '25px',
                        fontSize: '1rem'
                    }}
                />
                <button
                    type="submit"
                    style={{
                        padding: '0.875rem 2rem',
                        backgroundColor: '#667eea',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '25px',
                        cursor: 'pointer',
                        fontSize: '1rem',
                        fontWeight: '600'
                    }}
                >
                    전송
                </button>
            </form>
        </div>
    );
};

export default GroupChat;
