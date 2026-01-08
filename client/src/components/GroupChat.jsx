import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';

const GroupChat = ({ group, onBack, isV2Unlocked }) => {
    const { user } = useAuth();
    const [messages, setMessages] = useState(group.messages || []);
    const [newMessage, setNewMessage] = useState('');
    const [previousMessageCount, setPreviousMessageCount] = useState(group.messages?.length || 0);
    const [isSecret, setIsSecret] = useState(false); // V2 Feature
    const [replyTo, setReplyTo] = useState(null);    // V2 Feature
    const [revealedSecrets, setRevealedSecrets] = useState({}); // Track verified secrets

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

        let contentToSend = newMessage;

        // V2 Features Logic
        if (isV2Unlocked) {
            if (replyTo) {
                contentToSend = ` ➤ @${replyTo.from} ${contentToSend}`;
            }
            if (isSecret) {
                contentToSend = `[SECRET] ${contentToSend}`;
            }
        }

        try {
            await fetch(`${API_URL}/api/groupchats/${group._id || group.id}/messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    from: user.username,
                    content: contentToSend
                })
            });
            setNewMessage('');
            setReplyTo(null);
            setIsSecret(false);
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

    const toggleSecretReveal = (index) => {
        if (!isV2Unlocked) return;
        setRevealedSecrets(prev => ({ ...prev, [index]: !prev[index] }));

        // Auto-hide after 5 seconds
        if (!revealedSecrets[index]) {
            setTimeout(() => {
                setRevealedSecrets(prev => ({ ...prev, [index]: false }));
            }, 5000);
        }
    };

    const [showEmoticons, setShowEmoticons] = useState(false); // Emoticon Picker Toggle

    // Emoticons Data
    const basicEmojis = ['😀', '😂', '😍', '😭', '😡', '👍', '👎', '❤️', '🎉', '🔥'];
    const stickers = [
        { id: 'emo1', url: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Happy' },
        { id: 'emo2', url: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Cute' },
        { id: 'emo3', url: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Love' },
        { id: 'emo4', url: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Angry' },
    ];

    const sendSticker = async (stickerId) => {
        // Send sticker as a special text format
        const contentToSend = `[STICKER:${stickerId}]`;
        try {
            await fetch(`${API_URL}/api/groupchats/${group._id || group.id}/messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    from: user.username,
                    content: contentToSend
                })
            });
            setShowEmoticons(false);
            fetchMessages();
        } catch (err) {
            alert('이모티콘 전송 실패');
        }
    };

    const addEmoji = (emoji) => {
        setNewMessage(prev => prev + emoji);
    };


    const isCreator = group.createdBy === user.username;

    // Helper to render message content (Text vs Sticker)
    const renderContent = (content) => {
        if (content.startsWith('[STICKER:') && content.endsWith(']')) {
            const stickerId = content.substring(9, content.length - 1);
            const sticker = stickers.find(s => s.id === stickerId);
            if (sticker) {
                return <img src={sticker.url} alt="sticker" style={{ width: '100px', height: '100px' }} />;
            }
        }
        return content;
    };

    return (
        <div style={{ padding: '1rem', maxWidth: '800px', margin: '0 auto', position: 'relative' }}>
            {/* Emoticon Picker Overlay */}
            {showEmoticons && (
                <div style={{
                    position: 'absolute',
                    bottom: '80px',
                    left: '1rem',
                    right: '1rem',
                    backgroundColor: 'white',
                    borderRadius: '16px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                    padding: '1rem',
                    zIndex: 100,
                    border: '1px solid #ddd'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <strong>이모티콘</strong>
                        <button onClick={() => setShowEmoticons(false)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>×</button>
                    </div>

                    {/* Basic Emojis */}
                    <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                        {basicEmojis.map(emoji => (
                            <button
                                key={emoji}
                                onClick={() => addEmoji(emoji)}
                                style={{ fontSize: '1.5rem', border: 'none', background: 'none', cursor: 'pointer' }}
                            >
                                {emoji}
                            </button>
                        ))}
                    </div>

                    {/* Stickers (Only V2) */}
                    {isV2Unlocked && (
                        <div>
                            <div style={{ fontSize: '0.8rem', color: '#888', marginBottom: '0.5rem' }}>스티커 (Version 2)</div>
                            <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto' }}>
                                {stickers.map(sticker => (
                                    <img
                                        key={sticker.id}
                                        src={sticker.url}
                                        alt="sticker"
                                        onClick={() => sendSticker(sticker.id)}
                                        style={{ width: '60px', height: '60px', cursor: 'pointer', borderRadius: '8px', border: '1px solid #eee' }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

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

            {/* Header */}
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
                        const isSecretMsg = msg.content.startsWith('[SECRET]');
                        const actualContent = isSecretMsg ? msg.content.replace('[SECRET]', '').trim() : msg.content;

                        // Parse Reply (simple check)
                        const isReply = actualContent.includes('➤ @');

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
                                            marginLeft: '0.5rem',
                                            cursor: 'pointer' // Enable click to reply
                                        }}
                                            onClick={() => isV2Unlocked && setReplyTo(msg)}
                                            title={isV2Unlocked ? "클릭하여 답장" : ""}
                                        >
                                            {msg.from}
                                        </div>
                                    )}
                                    <div
                                        onClick={() => {
                                            if (isSecretMsg) toggleSecretReveal(index);
                                            else if (isV2Unlocked && !isMine) setReplyTo(msg);
                                        }}
                                        style={{
                                            padding: '0.875rem 1.125rem',
                                            borderRadius: isMine ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                                            backgroundColor: isSecretMsg && !revealedSecrets[index] ? '#333' : (isMine ? '#FEE500' : '#FFFFFF'),
                                            color: isSecretMsg && !revealedSecrets[index] ? '#fff' : '#191919',
                                            boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                                            wordBreak: 'break-word',
                                            fontSize: '0.95rem',
                                            lineHeight: '1.5',
                                            cursor: (isSecretMsg || (isV2Unlocked && !isMine)) ? 'pointer' : 'default',
                                            position: 'relative'
                                        }}
                                    >
                                        {isSecretMsg && !revealedSecrets[index] ? (
                                            <span>🔒 비밀 메시지 (클릭)</span>
                                        ) : (
                                            renderContent(actualContent)
                                        )}
                                        {isSecretMsg && revealedSecrets[index] && (
                                            <span style={{ display: 'block', fontSize: '0.7rem', color: 'red', marginTop: '0.2rem' }}>
                                                5초 후 사라집니다
                                            </span>
                                        )}
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

            {/* Reply Indicator */}
            {replyTo && (
                <div style={{
                    padding: '0.5rem 1rem',
                    background: '#f0f0f0',
                    borderRadius: '8px',
                    marginBottom: '0.5rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '0.9rem'
                }}>
                    <span>↩️ <b>{replyTo.from}</b>님에게 답장 중...</span>
                    <button onClick={() => setReplyTo(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>×</button>
                </div>
            )}

            {/* Input Area */}
            <form onSubmit={handleSend} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                {isV2Unlocked && (
                    <button
                        type="button"
                        onClick={() => setIsSecret(!isSecret)}
                        style={{
                            background: 'none',
                            border: 'none',
                            fontSize: '1.5rem',
                            cursor: 'pointer',
                            opacity: isSecret ? 1 : 0.4,
                            transition: 'opacity 0.2s'
                        }}
                        title="비밀 메시지 (5초 후 삭제)"
                    >
                        🔒
                    </button>
                )}

                <button
                    type="button"
                    onClick={() => setShowEmoticons(!showEmoticons)}
                    style={{
                        background: 'none',
                        border: 'none',
                        fontSize: '1.5rem',
                        cursor: 'pointer',
                        padding: '0 0.5rem'
                    }}
                >
                    😀
                </button>


                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={isSecret ? "🔒 비밀 메시지를 입력하세요" : "메시지를 입력하세요"}
                    style={{
                        flex: 1,
                        padding: '1rem 1.25rem',
                        border: isSecret ? '2px solid #333' : '2px solid #E5E5EA',
                        borderRadius: '24px',
                        fontSize: '0.95rem',
                        backgroundColor: isSecret ? '#f0f0f0' : '#FFFFFF'
                    }}
                />
                <button
                    type="submit"
                    style={{
                        padding: '1rem 2rem',
                        backgroundColor: isSecret ? '#333' : '#FEE500',
                        color: isSecret ? '#fff' : '#3C1E1E',
                        border: 'none',
                        borderRadius: '24px',
                        cursor: 'pointer',
                        fontSize: '0.95rem',
                        fontWeight: '700',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}
                >
                    전송
                </button>
            </form>
        </div>
    );
};

export default GroupChat;
