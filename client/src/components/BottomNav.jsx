import React from 'react';
import { useAuth } from '../context/AuthContext';

const BottomNav = ({ currentView, onNavigate }) => {
    const { user } = useAuth();
    const isAdmin = user?.username === 'xManager';

    const navItems = [
        { id: 'users', icon: '👤', label: '회원보기' },
        { id: 'createChat', icon: '➕', label: '채팅방' },
        { id: 'search', icon: '🔍', label: '검색' },
        { id: 'createPost', icon: '💾', label: '글만들기' },
        { id: 'posts', icon: '📄', label: '글쓰기' },
    ];

    if (isAdmin) {
        navItems.push(
            { id: 'autoUpdate', icon: '🔄', label: '자동선택' },
            { id: 'admin', icon: '👑', label: '관리자' }
        );
    } else {
        navItems.push({ id: 'more', icon: '➕', label: '더보기' });
    }

    return (
        <div style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: '#FFFFFF',
            borderTop: '2px solid #E5E5EA',
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            padding: '0.75rem 0',
            boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
            zIndex: 1000
        }}>
            {navItems.map(item => (
                <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.25rem',
                        cursor: 'pointer',
                        padding: '0.5rem',
                        transition: 'transform 0.2s',
                        transform: currentView === item.id ? 'scale(1.1)' : 'scale(1)',
                        opacity: currentView === item.id ? 1 : 0.6
                    }}
                    title={item.label}
                >
                    <span style={{ fontSize: '1.5rem' }}>{item.icon}</span>
                    <span style={{
                        fontSize: '0.65rem',
                        color: currentView === item.id ? '#FEE500' : '#7C7C7C',
                        fontWeight: currentView === item.id ? '700' : '500'
                    }}>
                        {item.label}
                    </span>
                </button>
            ))}
        </div>
    );
};

export default BottomNav;
