import React from 'react';
import { useAuth } from '../context/AuthContext';
import { getAvatarUrl } from '../utils/avatar';

const Profile = ({ onBack, onNavigate, onShowAvatar, isV2Unlocked }) => {
    const { user } = useAuth();

    return (
        <div style={{
            padding: '1rem',
            maxWidth: '600px',
            margin: '0 auto',
            paddingBottom: '100px'
        }}>
            <button onClick={onBack} style={{ marginBottom: '1rem', background: '#F6F6F6', color: '#191919' }}>
                ← 뒤로가기
            </button>

            {/* Header */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '1.5rem',
                backgroundColor: '#FEE500',
                borderRadius: '16px',
                marginBottom: '1.5rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
                <img
                    src={getAvatarUrl(user)}
                    alt="avatar"
                    style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        border: '3px solid #3C1E1E'
                    }}
                />
                <div>
                    <h2 style={{ margin: 0, color: '#3C1E1E', fontWeight: '700' }}>
                        {user?.username}
                    </h2>
                    <p style={{ margin: '0.25rem 0 0 0', color: '#3C1E1E', opacity: 0.8, fontSize: '0.9rem' }}>
                        {isV2Unlocked ? (
                            <>포인트: <span style={{ fontWeight: 'bold', color: '#E03E3E' }}>{user?.points || 0} P</span></>
                        ) : (
                            <>프로필 설정</>
                        )}
                    </p>
                </div>
            </div>

            {/* Profile Items */}
            <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
                {/* Avatar */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '1.25rem',
                    borderBottom: '1px solid #E5E5EA'
                }}>
                    <div>
                        <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>아바타</div>
                        <div style={{ fontSize: '0.85rem', color: '#7C7C7C' }}>
                            {user?.username} 프로필 이미지
                        </div>
                    </div>
                    <button
                        onClick={onShowAvatar}
                        style={{
                            backgroundColor: '#FEE500',
                            padding: '0.5rem 1rem',
                            fontSize: '0.9rem'
                        }}
                    >
                        보기
                    </button>
                </div>

                {/* Chat Rooms */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '1.25rem',
                    borderBottom: '1px solid #E5E5EA'
                }}>
                    <div>
                        <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>대화방 보기</div>
                        <div style={{ fontSize: '0.85rem', color: '#7C7C7C' }}>
                            내 채팅방 목록
                        </div>
                    </div>
                    <button
                        onClick={() => onNavigate('groupchatlist')} // Navigate to Chat List
                        style={{
                            backgroundColor: '#FEE500',
                            padding: '0.5rem 1rem',
                            fontSize: '0.9rem'
                        }}
                    >
                        보기
                    </button>
                </div>

                {/* Password */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '1.25rem'
                }}>
                    <div>
                        <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>비밀번호 바꾸기</div>
                        <div style={{ fontSize: '0.85rem', color: '#7C7C7C' }}>
                            보안 설정
                        </div>
                    </div>
                    <button
                        onClick={() => onNavigate('reset-password')} // Navigate to Password Reset
                        style={{
                            backgroundColor: '#FEE500',
                            padding: '0.5rem 1rem',
                            fontSize: '0.9rem'
                        }}
                    >
                        보기
                    </button>
                </div>


                {/* Ladder Game (Only show if V2 is unlocked) */}
                {/* Version 2 Features */}
                {isV2Unlocked && (
                    <>
                        {[
                            { id: 'ladder-game', label: '🎢 사다리 타기', desc: '미니게임 한 판!' },
                            { id: 'rock-paper-scissors', label: '✌️ 가위 바위 보', desc: '승부를 가려라!' },
                            { id: 'roulette', label: '🎡 행운의 룰렛', desc: '오늘의 운세는?' },
                            { id: 'shop', label: '🛒 이모티콘 샵', desc: '포인트로 쇼핑하기' },
                            { id: 'calendar', label: '📅 우리 가족 일정', desc: '생일, 모임 공유' },
                            { id: 'todo', label: '✅ 같이 할 일', desc: '장보기, 청소 등' },
                        ].map(item => (
                            <div key={item.id} style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '1.25rem',
                                borderTop: '1px solid #E5E5EA'
                            }}>
                                <div>
                                    <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>{item.label}</div>
                                    <div style={{ fontSize: '0.85rem', color: '#7C7C7C' }}>
                                        {item.desc}
                                    </div>
                                </div>
                                <button
                                    onClick={() => onNavigate(item.id)}
                                    style={{
                                        backgroundColor: '#FEE500',
                                        padding: '0.5rem 1rem',
                                        fontSize: '0.9rem'
                                    }}
                                >
                                    GO
                                </button>
                            </div>
                        ))}
                    </>
                )}
            </div>

            {/* Logout */}
            <button
                onClick={() => {
                    localStorage.removeItem('user');
                    window.location.reload();
                }}
                style={{
                    width: '100%',
                    marginTop: '1.5rem',
                    backgroundColor: '#FF4444',
                    color: 'white',
                    padding: '1rem',
                    fontSize: '1rem',
                    fontWeight: '600'
                }}
            >
                로그아웃
            </button>
        </div >
    );
};

export default Profile;
