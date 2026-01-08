import React, { useState, useEffect } from 'react';

const LadderGame = ({ onBack }) => {
    const [numPlayers, setNumPlayers] = useState(2);
    const [results, setResults] = useState(['', '']);
    const [isStarted, setIsStarted] = useState(false);
    const [finalResult, setFinalResult] = useState(null);

    const handleStart = () => {
        if (results.some(r => !r.trim())) {
            alert('모든 결과를 입력해주세요!');
            return;
        }
        setIsStarted(true);

        // Simple random shuffle simulation for now
        setTimeout(() => {
            const shuffledResults = [...results].sort(() => Math.random() - 0.5);
            setFinalResult(shuffledResults);
        }, 2000);
    };

    const handleReset = () => {
        setIsStarted(false);
        setFinalResult(null);
        setResults(Array(numPlayers).fill(''));
    };

    const updateNumPlayers = (n) => {
        if (n < 2 || n > 6) return;
        setNumPlayers(n);
        setResults(Array(n).fill(''));
    };

    return (
        <div style={{ padding: '1rem', maxWidth: '600px', margin: '0 auto', paddingBottom: '100px' }}>
            <button onClick={onBack} style={{ marginBottom: '1rem', background: '#F6F6F6' }}>← 뒤로가기</button>

            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#3C1E1E' }}>🎢 사다리 타기</h2>

                {!isStarted ? (
                    <>
                        <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
                            <label>참여 인원: </label>
                            <button onClick={() => updateNumPlayers(numPlayers - 1)}>-</button>
                            <span style={{ margin: '0 1rem', fontWeight: 'bold' }}>{numPlayers}명</span>
                            <button onClick={() => updateNumPlayers(numPlayers + 1)}>+</button>
                        </div>

                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', overflowX: 'auto' }}>
                            {Array.from({ length: numPlayers }).map((_, i) => (
                                <div key={i} style={{ flex: 1, minWidth: '60px' }}>
                                    <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>{i + 1}번</div>
                                    <input
                                        placeholder="결과 (꽝/당첨)"
                                        value={results[i]}
                                        onChange={(e) => {
                                            const newResults = [...results];
                                            newResults[i] = e.target.value;
                                            setResults(newResults);
                                        }}
                                        style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '8px' }}
                                    />
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={handleStart}
                            style={{ width: '100%', padding: '1rem', background: '#FEE500', color: '#3C1E1E', fontWeight: 'bold', borderRadius: '12px' }}
                        >
                            게임 시작!
                        </button>
                    </>
                ) : (
                    <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                        {!finalResult ? (
                            <h3 style={{ color: '#E03E3E' }}>두구두구... 사다리 타는 중... 🏃</h3>
                        ) : (
                            <div>
                                <h3 style={{ marginBottom: '1.5rem' }}>🎉 결과 발표!</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                                    {finalResult.map((res, i) => (
                                        <div key={i} style={{ padding: '1rem', background: '#F6F6F6', borderRadius: '8px' }}>
                                            <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>{i + 1}번 플레이어</div>
                                            <div style={{ color: '#E03E3E' }}>{res}</div>
                                        </div>
                                    ))}
                                </div>
                                <button onClick={handleReset} style={{ padding: '0.75rem 1.5rem', background: '#3C1E1E', color: 'white', borderRadius: '8px' }}>
                                    다시 하기
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default LadderGame;
