import React from 'react';

const TopNav = ({ onBack, onForward, onHome, canGoBack, canGoForward }) => {
    return (
        <div style={{
            position: 'sticky', // or fixed if preferred, but sticky plays nicer with content flow
            top: 0,
            left: 0,
            right: 0,
            backgroundColor: '#FFFFFF',
            borderBottom: '1px solid #E5E5EA',
            display: 'flex',
            alignItems: 'center',
            padding: '0.5rem 1rem',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
            zIndex: 1100, // Higher than BottomNav just in case
            gap: '1rem'
        }}>
            <button
                onClick={onBack}
                disabled={!canGoBack}
                style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '1.5rem',
                    cursor: canGoBack ? 'pointer' : 'default',
                    opacity: canGoBack ? 1 : 0.3,
                    padding: '0.25rem'
                }}
                title="뒤로가기"
            >
                ⬅️
            </button>

            <button
                onClick={onHome}
                style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '1.5rem',
                    cursor: 'pointer',
                    padding: '0.25rem'
                }}
                title="홈으로"
            >
                🏠
            </button>

            <button
                onClick={onForward}
                disabled={!canGoForward}
                style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '1.5rem',
                    cursor: canGoForward ? 'pointer' : 'default',
                    opacity: canGoForward ? 1 : 0.3,
                    padding: '0.25rem'
                }}
                title="앞으로가기"
            >
                ➡️
            </button>
        </div>
    );
};

export default TopNav;
