import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';

const AvatarSelector = ({ onCancel, onSave }) => {
    const { user, login } = useAuth(); // We might need to update user context
    const [seed, setSeed] = useState(user.avatarSeed || user.username);
    const [loading, setLoading] = useState(false);

    const handleRandomize = () => {
        setSeed(Math.random().toString(36).substring(7));
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/user/avatar`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username: user.username, avatarSeed: seed }),
            });

            if (res.ok) {
                const data = await res.json();
                alert(data.message);

                // Update local user context if possible, or force re-login/reload
                // For now, we assume the parent component handles context update or we do a soft update here
                // A complete fix requires updating AuthContext to allow partial updates.
                // As a workaround, we can manually update the user object if 'login' allows it, 
                // but AuthContext usually expects a full login payload.
                // Let's rely on the onSave callback to trigger a refresh or just notify.

                if (onSave) onSave(data.avatarSeed);
            } else {
                alert('아바타 저장 실패');
            }
        } catch (err) {
            alert('오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    return (
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
                maxWidth: '400px',
                textAlign: 'center',
                boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
            }}>
                <h2 style={{ color: '#1A237E', marginBottom: '1.5rem' }}>아바타 변경</h2>

                <div style={{ marginBottom: '2rem' }}>
                    <img
                        src={`https://api.dicebear.com/9.x/dylan/svg?seed=${seed}`}
                        alt="Avatar Preview"
                        style={{
                            width: '120px',
                            height: '120px',
                            borderRadius: '50%',
                            border: '4px solid #E8EAF6',
                            marginBottom: '1rem',
                            backgroundColor: '#f5f5f5'
                        }}
                    />
                    <div>
                        <button
                            onClick={handleRandomize}
                            style={{
                                padding: '0.8rem 1.2rem',
                                backgroundColor: '#1A237E',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '1rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                margin: '0 auto'
                            }}
                        >
                            🎲 랜덤 돌리기
                        </button>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                    <button
                        onClick={onCancel}
                        style={{
                            padding: '0.8rem 1.5rem',
                            border: '1px solid #ccc',
                            backgroundColor: 'white',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '1rem'
                        }}
                    >
                        취소
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        style={{
                            padding: '0.8rem 1.5rem',
                            backgroundColor: '#FFC107',
                            color: '#333',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '1rem',
                            fontWeight: 'bold'
                        }}
                    >
                        {loading ? '저장 중...' : '저장하기'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AvatarSelector;
