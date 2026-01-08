import React, { useState } from 'react';

const RockPaperScissors = ({ onBack }) => {
    const [userChoice, setUserChoice] = useState(null);
    const [computerChoice, setComputerChoice] = useState(null);
    const [result, setResult] = useState(null);

    const choices = [
        { id: 'rock', emoji: '✊', label: '바위' },
        { id: 'paper', emoji: '✋', label: '보' },
        { id: 'scissors', emoji: '✌️', label: '가위' }
    ];

    const handleChoice = (choiceId) => {
        const computer = choices[Math.floor(Math.random() * choices.length)];
        setUserChoice(choices.find(c => c.id === choiceId));
        setComputerChoice(computer);

        if (choiceId === computer.id) {
            setResult('draw');
        } else if (
            (choiceId === 'rock' && computer.id === 'scissors') ||
            (choiceId === 'paper' && computer.id === 'rock') ||
            (choiceId === 'scissors' && computer.id === 'paper')
        ) {
            setResult('win');
        } else {
            setResult('lose');
        }
    };

    const resetGame = () => {
        setUserChoice(null);
        setComputerChoice(null);
        setResult(null);
    };

    return (
        <div style={{ padding: '1rem', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
            <button onClick={onBack} style={{ marginBottom: '1rem', float: 'left', background: '#F6F6F6' }}>← 뒤로가기</button>
            <div style={{ clear: 'both' }}></div>

            <h2 style={{ marginBottom: '2rem', color: '#3C1E1E' }}>✌️ 가위 바위 보 ✊</h2>

            {!userChoice ? (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '3rem' }}>
                    {choices.map(choice => (
                        <button
                            key={choice.id}
                            onClick={() => handleChoice(choice.id)}
                            style={{
                                fontSize: '3rem',
                                padding: '1.5rem',
                                borderRadius: '50%',
                                border: '3px solid #FEE500',
                                backgroundColor: 'white',
                                cursor: 'pointer',
                                transition: 'transform 0.2s'
                            }}
                        >
                            {choice.emoji}
                        </button>
                    ))}
                </div>
            ) : (
                <div style={{ marginTop: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '2rem', marginBottom: '2rem' }}>
                        <div>
                            <div style={{ fontSize: '1rem', color: '#888' }}>나</div>
                            <div style={{ fontSize: '4rem' }}>{userChoice.emoji}</div>
                        </div>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>VS</div>
                        <div>
                            <div style={{ fontSize: '1rem', color: '#888' }}>컴퓨터</div>
                            <div style={{ fontSize: '4rem' }}>{computerChoice.emoji}</div>
                        </div>
                    </div>

                    <div style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem', color: result === 'win' ? '#00C73C' : result === 'lose' ? '#E03E3E' : '#333' }}>
                        {result === 'win' ? '이겼다! 🎉' : result === 'lose' ? '졌다... 😭' : '비겼다!'}
                    </div>

                    <button
                        onClick={resetGame}
                        style={{ padding: '1rem 2rem', background: '#FEE500', borderRadius: '12px', fontWeight: 'bold', fontSize: '1.1rem' }}
                    >
                        다시 하기
                    </button>
                </div>
            )}
        </div>
    );
};

export default RockPaperScissors;
