import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';

const GroupChat = ({ group, onBack }) => {
    const { user } = useAuth();
    const [messages, setMessages] = useState(group.messages || []);
    const [newMessage, setNewMessage] = useState('');
    const [previousMessageCount, setPreviousMessageCount] = useState(group.messages?.length || 0);

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

    const handleDeleteGroup = async () => {
        if (!confirm('정말 이 채팅방을 삭제하시겠습니까? 모든 메시지가 사라집니다.')) return;

        try {
            const res = await fetch(`${API_URL}/api/groupchats/${group._id || group.id}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: user.username })
            });

            if (res.ok) {
                alert('채팅방이 삭제되었습니다.');
                onBack();
            } else {
                const error = await res.json();
                alert(error.error || '채팅방 삭제에 실패했습니다.');
            }
        } catch (err) {
            alert('오류가 발생했습니다.');
        }
    };

    const isCreator = group.createdBy === user.username;

    return (
        <div style={{ padding: '1rem', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <button onClick={onBack} style={{ background: '#F6F6F6', color: '#191919' }}>
                    ← 뒤로가기
                </button>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {isCreator && (
                        <button
                            onClick={handleDeleteGroup}
                            style={{ backgroundColor: '#e53e3e' }}
                        >
                            🗑️ 삭제
                        </button>
                    )}
                    <button
                        onClick={handleLeaveGroup}
                        style={{ backgroundColor: '#f56565' }}
                    >
                        🚪 나가기
                    </button>
                </div>
            </div>

            {/* KakaoTalk-style Header */}
            <div style={{
                marginBottom: '1rem',
                padding: '1.25rem',
                backgroundColor: '#FEE500',
                borderRadius: '16px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
                <h2 style={{ margin: '0 0 0.5rem 0', color: '#3C1E1E', fontWeight: '700' }}>
                    {group.name}
                </h2>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#3C1E1E', opacity: 0.8 }}>
                    👥 {group.members.join(', ')}
                </p>
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
                                    marginBottom: '0.75rem'
                                }}
                            >
                                <div style={{
                                    maxWidth: '70%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: isMine ? 'flex-end' : 'flex-start'
                                }}>
                                    {!isMine && (
                                        <div style={{
                                            fontSize: '0.75rem',
                                            fontWeight: 'bold',
                                            marginBottom: '0.25rem',
                                            color: '#3C1E1E',
                                            marginLeft: '0.5rem'
                                        }}>
                                            {msg.from}
                                        </div>
                                    )}
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
                                        marginLeft: isMine ? 0 : '0.5rem',
                                        marginRight: isMine ? '0.5rem' : 0
                                    }}>
                                        {new Date(msg.date).toLocaleTimeString('ko-KR', {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
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

export default GroupChat;
