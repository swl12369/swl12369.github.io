import React, { useState, useEffect } from 'react';

const UpdateChecker = ({ onBack, onUpdateV2, isV2Unlocked }) => {
    const currentVersion = isV2Unlocked ? 'Version 2' : 'Version 1';
    const latestVersion = 'Version 2';

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

                {!isV2Unlocked ? (
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
                            onClick={onUpdateV2}
                            style={{
                                width: '100%',
                                padding: '1.25rem',
                                backgroundColor: '#00C73C',
                                color: 'white',
                                fontSize: '1.1rem',
                                fontWeight: '700',
                                borderRadius: '12px',
                                boxShadow: '0 4px 12px rgba(0,199,60,0.3)',
                                border: 'none',
                                cursor: 'pointer'
                            }}
                        >
                            🚀 {latestVersion}로 업데이트 하기
                        </button>
                    </>
                ) : (
                    <div style={{
                        padding: '2rem',
                        color: '#00C73C',
                        fontSize: '1.1rem',
                        fontWeight: '600'
                    }}>
                        ✅ 최신 버전을 사용 중입니다!<br />
                        <span style={{ fontSize: '0.9rem', color: '#666', fontWeight: 'normal' }}>(포인트 시스템, 출석체크, 사다리타기 활성화됨)</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UpdateChecker;
