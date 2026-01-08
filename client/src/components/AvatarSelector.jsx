import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';

const AvatarSelector = ({ onCancel, onSave }) => {
    const { user, updateUser } = useAuth();
    const [seed, setSeed] = useState(user.avatarSeed || user.username);
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [loading, setLoading] = useState(false);
    const [mode, setMode] = useState('random'); // 'random' or 'upload'

    const handleRandomize = () => {
        setSeed(Math.random().toString(36).substring(7));
        setMode('random');
        setSelectedFile(null);
        setPreviewUrl(null);
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                alert('파일 크기는 5MB 이하여야 합니다.');
                return;
            }
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
            setMode('upload');
        }
    };

    const fetchUpdatedUser = async () => {
        try {
            const res = await fetch(`${API_URL}/api/admin/users`);
            const users = await res.json();
            const updatedUser = users.find(u => u.username === user.username);
            if (updatedUser) {
                updateUser(updatedUser);
            }
        } catch (err) {
            console.error('Failed to fetch updated user:', err);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            if (mode === 'upload' && selectedFile) {
                // Upload file
                const formData = new FormData();
                formData.append('avatar', selectedFile);

                const res = await fetch(`${API_URL}/api/users/${user.username}/avatar`, {
                    method: 'POST',
                    body: formData,
                });

                if (res.ok) {
                    alert('아바타가 업로드되었습니다!');
                    await fetchUpdatedUser();
                    if (onSave) onSave(null);
                    window.location.reload();
                } else {
                    alert(`업로드 실패: ${res.status} ${res.statusText}`);
                }
            } else {
                // Save random avatar seed
                const res = await fetch(`${API_URL}/api/user/avatar`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ username: user.username, avatarSeed: seed }),
                });

                if (res.ok) {
                    alert('아바타가 저장되었습니다!');
                    await fetchUpdatedUser();
                    if (onSave) onSave(seed);
                    window.location.reload();
                } else {
                    alert('저장 실패');
                }
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
                maxWidth: '450px',
                textAlign: 'center',
                boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
            }}>
                <h2 style={{ color: '#667eea', marginBottom: '1.5rem' }}>아바타 변경</h2>

                {/* Avatar Preview */}
                <div style={{ marginBottom: '2rem' }}>
                    {mode === 'upload' && previewUrl ? (
                        <img
                            src={previewUrl}
                            alt="Avatar Preview"
                            style={{
                                width: '120px',
                                height: '120px',
                                borderRadius: '50%',
                                border: '4px solid #667eea',
                                marginBottom: '1rem',
                                objectFit: 'cover'
                            }}
                        />
                    ) : (
                        <img
                            src={`https://api.dicebear.com/9.x/dylan/svg?seed=${seed}`}
                            alt="Avatar Preview"
                            style={{
                                width: '120px',
                                height: '120px',
                                borderRadius: '50%',
                                border: '4px solid #667eea',
                                marginBottom: '1rem',
                                backgroundColor: '#f5f5f5'
                            }}
                        />
                    )}
                </div>

                {/* Mode Selection */}
                <div style={{ display: 'flex', gap: '10px', marginBottom: '1.5rem', justifyContent: 'center' }}>
                    <button
                        onClick={handleRandomize}
                        style={{
                            padding: '0.8rem 1.2rem',
                            backgroundColor: mode === 'random' ? '#667eea' : '#e2e8f0',
                            color: mode === 'random' ? 'white' : '#718096',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            fontWeight: '600'
                        }}
                    >
                        🎲 랜덤 아바타
                    </button>
                    <label style={{
                        padding: '0.8rem 1.2rem',
                        backgroundColor: mode === 'upload' ? '#667eea' : '#e2e8f0',
                        color: mode === 'upload' ? 'white' : '#718096',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        display: 'inline-block'
                    }}>
                        📁 파일 업로드
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileSelect}
                            style={{ display: 'none' }}
                        />
                    </label>
                </div>

                {/* Action Buttons */}
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
                            backgroundColor: '#48bb78',
                            color: 'white',
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
