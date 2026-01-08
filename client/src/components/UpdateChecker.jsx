import React, { useState, useEffect } from 'react';

const UpdateChecker = ({ onBack }) => {
    const [currentVersion] = useState('Version 1');
    const [latestVersion, setLatestVersion] = useState('Version 1');
    const [hasUpdate, setHasUpdate] = useState(false);

    useEffect(() => {
        // Simulate checking for updates
        setTimeout(() => {
            setLatestVersion('Version 2');
            setHasUpdate(true);
        }, 1000);
    }, []);

    const handleUpdate = () => {
        alert('업데이트 기능은 준비 중입니다!');
        // In production, this would trigger an update process
    };

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

            <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                padding: '2rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                textAlign: 'center'
            }}>
                <h2 style={{ margin: '0 0 2rem 0', color: '#3C1E1E' }}>업데이트</h2>

                {/* Current Version */}
                <div style={{
                    padding: '1.5rem',
                    backgroundColor: '#F6F6F6',
                    borderRadius: '12px',
                    marginBottom: '1.5rem'
                }}>
                    <div style={{ fontSize: '0.9rem', color: '#7C7C7C', marginBottom: '0.5rem' }}>
                        현재 버전
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#3C1E1E' }}>
                        {currentVersion}
                    </div>
                </div>

                {/* Latest Version */}
                {hasUpdate && (
                    <>
                        <div style={{
                            padding: '1.5rem',
                            backgroundColor: '#FEE500',
                            borderRadius: '12px',
                            marginBottom: '1.5rem'
                        }}>
                            <div style={{ fontSize: '0.9rem', color: '#3C1E1E', marginBottom: '0.5rem' }}>
                                최신 버전
                            </div>
                            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#3C1E1E' }}>
                                {latestVersion}
                            </div>
                        </div>

                        <button
                            onClick={handleUpdate}
                            style={{
                                width: '100%',
                                padding: '1.25rem',
                                backgroundColor: '#00C73C',
                                color: 'white',
                                fontSize: '1.1rem',
                                fontWeight: '700',
                                borderRadius: '12px',
                                boxShadow: '0 4px 12px rgba(0,199,60,0.3)'
                            }}
                        >
                            새로운 {latestVersion}로 업데이트 하기
                        </button>
                    </>
                )}

                {!hasUpdate && (
                    <div style={{
                        padding: '2rem',
                        color: '#00C73C',
                        fontSize: '1.1rem',
                        fontWeight: '600'
                    }}>
                        ✅ 최신 버전을 사용 중입니다!
                    </div>
                )}
            </div>
        </div>
    );
};

export default UpdateChecker;
