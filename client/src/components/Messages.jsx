import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';
import { getAvatarUrl } from '../utils/avatar';

const Messages = ({ selectedUser, onBack }) => {
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [previousMessageCount, setPreviousMessageCount] = useState(0);

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
        if (user && selectedUser) {
            fetchMessages();
            const interval = setInterval(fetchMessages, 3000);
            return () => clearInterval(interval);
        }
    }, [user, selectedUser]);

    const fetchMessages = async () => {
        try {
            const res = await fetch(`${API_URL}/api/messages/${user.username}`);
            const allMessages = await res.json();

            const conversation = allMessages.filter(
                m => (m.from === user.username && m.to === selectedUser.username) ||
                    (m.from === selectedUser.username && m.to === user.username)
            );

            const sortedConversation = conversation.reverse();

            if (previousMessageCount > 0 && sortedConversation.length > previousMessageCount) {
                const newMsg = sortedConversation[sortedConversation.length - 1];
                if (newMsg.from === selectedUser.username) {
                    playNotificationSound();
                }
            }

            setPreviousMessageCount(sortedConversation.length);
            setMessages(sortedConversation);

            conversation.forEach(async (msg) => {
                if (msg.to === user.username && !msg.read) {
                    await fetch(`${API_URL}/api/messages/${msg._id || msg.id}/read`, {
                        method: 'PUT'
                    });
                }
            });
        } catch (err) {
            console.error('Failed to fetch messages:', err);
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            await fetch(`${API_URL}/api/messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    from: user.username,
                    to: selectedUser.username,
                    content: newMessage
                })
            });
            setNewMessage('');
            fetchMessages();
        } catch (err) {
            alert('메시지 전송에 실패했습니다.');
        }
    };

    const handleDelete = async (messageId) => {
        if (!window.confirm('이 메시지를 삭제하시겠습니까?')) return;

        try {
            const res = await fetch(`${API_URL}/api/messages/${messageId}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: user.username })
            });

            if (res.ok) {
                fetchMessages();
            } else {
                const data = await res.json();
                alert(data.error || '삭제에 실패했습니다.');
            }
        } catch (err) {
            alert('오류가 발생했습니다.');
        }
    };

    return (
        <div style={{ padding: '1rem', maxWidth: '800px', margin: '0 auto' }}>
            <button
                onClick={onBack}
                style={{
                    marginBottom: '1rem',
                    background: '#F6F6F6',
                    color: '#191919'
                }}
            >
                ← 뒤로가기
            </button>

            {/* KakaoTalk-style Header */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                marginBottom: '1rem',
                padding: '1.25rem',
                backgroundColor: '#FEE500',
                borderRadius: '16px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
                <img
                    src={getAvatarUrl(selectedUser)}
                    alt="avatar"
                    style={{ width: '48px', height: '48px', borderRadius: '50%', border: '2px solid #3C1E1E' }}
                />
                <h2 style={{ margin: 0, color: '#3C1E1E', fontWeight: '700' }}>
                    {selectedUser.username}
                </h2>
            </div>

            {/* Chat Messages Area */}
            <div style={{
                backgroundColor: '#B2C7D9',
                borderRadius: '16px',
                padding: '1.5rem',
                height: '500px',
                overflowY: 'auto',
                marginBottom: '1rem',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06)'
            }}>
                {messages.length === 0 ? (
                    <p style={{ textAlign: 'center', color: '#7C7C7C', marginTop: '3rem' }}>
                        아직 메시지가 없습니다.
                    </p>
                ) : (
                    messages.map((msg, index) => {
                        const isMine = msg.from === user.username;
                        return (
                            <div
                                key={index}
                                style={{
                                    display: 'flex',
                                    justifyContent: isMine ? 'flex-end' : 'flex-start',
                                    marginBottom: '0.75rem',
                                    alignItems: 'flex-end',
                                    gap: '0.5rem'
                                }}
                            >
                                {!isMine && (
                                    <img
                                        src={getAvatarUrl(selectedUser)}
                                        alt="avatar"
                                        style={{
                                            width: '32px',
                                            height: '32px',
                                            borderRadius: '50%',
                                            marginBottom: '0.25rem'
                                        }}
                                    />
                                )}

                                <div style={{
                                    maxWidth: '70%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: isMine ? 'flex-end' : 'flex-start'
                                }}>
                                    <div style={{
                                        padding: '0.875rem 1.125rem',
                                        borderRadius: isMine ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                                        backgroundColor: isMine ? '#FEE500' : '#FFFFFF',
                                        color: '#191919',
                                        boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                                        wordBreak: 'break-word',
                                        fontSize: '0.95rem',
                                        lineHeight: '1.5'
                                    }}>
                                        {msg.content}
                                    </div>

                                    <div style={{
                                        fontSize: '0.7rem',
                                        color: '#7C7C7C',
                                        marginTop: '0.25rem',
                                        display: 'flex',
                                        gap: '0.5rem',
                                        alignItems: 'center'
                                    }}>
                                        <span>{new Date(msg.date).toLocaleTimeString('ko-KR', {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}</span>
                                        {isMine && (
                                            <span style={{ color: msg.read ? '#00C73C' : '#FFB800' }}>
                                                {msg.read ? '✓✓ 읽음' : '✓ 안읽음'}
                                            </span>
                                        )}
                                        {isMine && (
                                            <button
                                                onClick={() => handleDelete(msg._id || msg.id)}
                                                style={{
                                                    background: 'transparent',
                                                    color: '#FF4444',
                                                    padding: '0.25rem 0.5rem',
                                                    fontSize: '0.7rem',
                                                    boxShadow: 'none'
                                                }}
                                            >
                                                삭제
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Input Area */}
            <form onSubmit={handleSend} style={{ display: 'flex', gap: '0.75rem' }}>
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="메시지를 입력하세요"
                    style={{
                        flex: 1,
                        padding: '1rem 1.25rem',
                        border: '2px solid #E5E5EA',
                        borderRadius: '24px',
                        fontSize: '0.95rem',
                        backgroundColor: '#FFFFFF'
                    }}
                />
                <button
                    type="submit"
                    style={{
                        padding: '1rem 2rem',
                        backgroundColor: '#FEE500',
                        color: '#3C1E1E',
                        border: 'none',
                        borderRadius: '24px',
                        cursor: 'pointer',
                        fontSize: '0.95rem',
                        fontWeight: '700',
                        boxShadow: '0 2px 8px rgba(254,229,0,0.3)'
                    }}
                >
                    전송
                </button>
            </form>
        </div>
    );
};

export default Messages;
