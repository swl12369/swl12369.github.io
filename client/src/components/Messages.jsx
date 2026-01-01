import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';
import { getAvatarUrl } from '../utils/avatar';
import VoiceCall from './VoiceCall';

const Messages = ({ selectedUser, onBack }) => {
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [previousMessageCount, setPreviousMessageCount] = useState(0);
    const [showVoiceCall, setShowVoiceCall] = useState(false);

    // Play notification sound
    const playNotificationSound = () => {
        try {
            // Create audio context
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            // Set frequency and type
            oscillator.frequency.value = 800;
            oscillator.type = 'sine';

            // Set volume
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

            // Play sound
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        } catch (error) {
            console.log('Notification sound failed:', error);
            // Fallback: try using beep sound
            try {
                const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGGS57OihUBELTKXh8bllHAU2jdXyzn0vBSh+zPDajkALFF+16+mjUxELSKHf8r1pIAUsgs/y24k2CBhku+zooVARC0yl4fG5ZRwFNo3V8s59LwUofszw2o5ACxRftevrpFIRC0mh3/K9aR8FLILPstmJNggYZLvs6KFQEQtMpeHxuWUcBTaN1fLOfS8FKH7M8NqOQAsUX7Xr66RSEQtJod/yvWkfBSyCz7LZiTYIGGS77OihUBELTKXh8bllHAU2jdXyzn0vBSh+zPDajkALFF+16+ukUhELSaHf8r1pHwUsgs+y2Yk2CBhku+zooVARC0yl4fG5ZRwFNo3V8s59LwUofszw2o5ACxRftevrpFIRC0mh3/K9aR8FLILPstmJNggYZLvs6KFQEQtMpeHxuWUcBTaN1fLOfS8FKH7M8NqOQAsUX7Xr66RSEQtJod/yvWkfBSyCz7LZiTYIGGS77OihUBELTKXh8bllHAU2jdXyzn0vBSh+zPDajkALFF+16+ukUhELSaHf8r1pHwUsgs+y2Yk2CBhku+zooVARC0yl4fG5ZRwFNo3V8s59LwUofszw2o5ACxRftevrpFIRC0mh3/K9aR8FLILPstmJNggYZLvs6KFQEQtMpeHxuWUcBTaN1fLOfS8FKH7M8NqOQAsUX7Xr66RSEQtJod/yvWkfBSyCz7LZiTYIGGS77OihUBELTKXh8bllHAU2jdXyzn0vBSh+zPDajkALFF+16+ukUhELSaHf8r1pHwUsgs+y2Yk2CBhku+zooVARC0yl4fG5ZRwFNo3V8s59LwUofszw2o5ACxRftevrpFIRC0mh3/K9aR8FLILPstmJNggYZLvs6KFQEQtMpeHxuWUcBTaN1fLOfS8FKH7M8NqOQAsUX7Xr66RSEQtJod/yvWkfBQ==');
                audio.play();
            } catch (e) {
                console.log('Fallback sound also failed');
            }
        }
    };

    useEffect(() => {
        if (user && selectedUser) {
            fetchMessages();
            const interval = setInterval(fetchMessages, 3000); // 3초마다 새 메시지 확인
            return () => clearInterval(interval);
        }
    }, [user, selectedUser]);

    const fetchMessages = async () => {
        try {
            const res = await fetch(`${API_URL}/api/messages/${user.username}`);
            const allMessages = await res.json();

            // 선택한 사용자와의 대화만 필터링
            const conversation = allMessages.filter(
                m => (m.from === user.username && m.to === selectedUser.username) ||
                    (m.from === selectedUser.username && m.to === user.username)
            );

            const sortedConversation = conversation.reverse(); // 오래된 것부터 표시

            // Check if new message arrived
            if (previousMessageCount > 0 && sortedConversation.length > previousMessageCount) {
                const newMsg = sortedConversation[sortedConversation.length - 1];
                // Only play sound if the new message is from the other person
                if (newMsg.from === selectedUser.username) {
                    playNotificationSound();
                }
            }

            setPreviousMessageCount(sortedConversation.length);
            setMessages(sortedConversation);

            // 읽지 않은 메시지 읽음 처리
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
        <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
            <button onClick={onBack} style={{ marginBottom: '1rem', padding: '0.5rem 1rem', cursor: 'pointer' }}>
                ← 뒤로가기
            </button>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', padding: '1rem', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <img
                        src={getAvatarUrl(selectedUser)}
                        alt="avatar"
                        style={{ width: '40px', height: '40px', borderRadius: '50%' }}
                    />
                    <h2 style={{ margin: 0 }}>{selectedUser.username}님과의 대화</h2>
                </div>
                <button
                    onClick={() => setShowVoiceCall(true)}
                    style={{
                        backgroundColor: '#48bb78',
                        padding: '0.75rem 1.5rem',
                        fontSize: '1.2rem'
                    }}
                    title="음성 통화"
                >
                    📞
                </button>
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
                                    marginBottom: '1rem',
                                    alignItems: 'flex-start',
                                    gap: '0.5rem'
                                }}
                            >
                                {isMine && (
                                    <button
                                        onClick={() => handleDelete(msg._id || msg.id)}
                                        style={{
                                            backgroundColor: '#ff5252',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            padding: '4px 8px',
                                            fontSize: '0.7rem',
                                            cursor: 'pointer',
                                            marginTop: '0.5rem'
                                        }}
                                        title="메시지 삭제"
                                    >
                                        삭제
                                    </button>
                                )}
                                <div style={{
                                    maxWidth: '70%',
                                    padding: '0.75rem 1rem',
                                    borderRadius: '12px',
                                    backgroundColor: isMine ? '#1976d2' : '#f0f0f0',
                                    color: isMine ? '#fff' : '#000'
                                }}>
                                    <div>{msg.content}</div>
                                    <div style={{
                                        fontSize: '0.7rem',
                                        marginTop: '0.25rem',
                                        opacity: 0.7,
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}>
                                        <span>{new Date(msg.date).toLocaleString()}</span>
                                        {isMine && (
                                            <span style={{
                                                fontSize: '0.65rem',
                                                fontWeight: 'bold'
                                            }}>
                                                {msg.read ? '✓✓ 읽음' : '✓ 안읽음'}
                                            </span>
                                        )}
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
                        backgroundColor: '#1976d2',
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

            {showVoiceCall && (
                <VoiceCall
                    targetUser={selectedUser}
                    onClose={() => setShowVoiceCall(false)}
                />
            )}
        </div>
    );
};

export default Messages;
