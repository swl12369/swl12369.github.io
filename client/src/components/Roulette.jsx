import React, { useState } from 'react';

const Roulette = ({ onBack }) => {
    const [items, setItems] = useState(['치킨', '피자', '커피']);
    const [newItem, setNewItem] = useState('');
    const [result, setResult] = useState(null);
    const [isSpinning, setIsSpinning] = useState(false);

    const handleAddItem = () => {
        if (newItem.trim()) {
            setItems([...items, newItem.trim()]);
            setNewItem('');
        }
    };

    const handleRemoveItem = (index) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const spinRoulette = () => {
        if (items.length < 2) {
            alert('최소 2개의 항목이 필요합니다!');
            return;
        }
        setIsSpinning(true);
        setResult(null);

        // Simulate spinning
        let count = 0;
        const interval = setInterval(() => {
            setResult(items[Math.floor(Math.random() * items.length)]);
            count++;
            if (count > 20) {
                clearInterval(interval);
                setIsSpinning(false);
                const final = items[Math.floor(Math.random() * items.length)];
                setResult(final);
            }
        }, 100);
    };

    return (
        <div style={{ padding: '1rem', maxWidth: '600px', margin: '0 auto' }}>
            <button onClick={onBack} style={{ marginBottom: '1rem', background: '#F6F6F6' }}>← 뒤로가기</button>

            <h2 style={{ textAlign: 'center', marginBottom: '2rem', color: '#3C1E1E' }}>🎡 행운의 룰렛</h2>

            <div style={{
                background: 'white',
                padding: '2rem',
                borderRadius: '16px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                textAlign: 'center',
                minHeight: '200px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center'
            }}>
                {result ? (
                    <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: isSpinning ? '#ccc' : '#E03E3E' }}>
                        {result}
                    </div>
                ) : (
                    <div style={{ color: '#aaa' }}>룰렛을 돌려보세요!</div>
                )}
            </div>

            <button
                onClick={spinRoulette}
                disabled={isSpinning}
                style={{
                    width: '100%',
                    padding: '1.2rem',
                    background: isSpinning ? '#ddd' : '#FEE500',
                    marginTop: '2rem',
                    borderRadius: '12px',
                    fontWeight: 'bold',
                    fontSize: '1.2rem',
                    marginBottom: '2rem'
                }}
            >
                {isSpinning ? '돌아가는 중...' : 'START!'}
            </button>

            {/* Setup Section */}
            <div style={{ background: '#F9F9F9', padding: '1.5rem', borderRadius: '12px' }}>
                <h3 style={{ marginTop: 0 }}>항목 설정</h3>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                    <input
                        value={newItem}
                        onChange={(e) => setNewItem(e.target.value)}
                        placeholder="항목 추가 (예: 설거지)"
                        style={{ flex: 1, padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd' }}
                    />
                    <button onClick={handleAddItem} style={{ padding: '0.8rem', background: '#333', color: 'white', borderRadius: '8px' }}>추가</button>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {items.map((item, index) => (
                        <div key={index} style={{ background: 'white', padding: '0.5rem 1rem', borderRadius: '20px', border: '1px solid #ddd', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            {item}
                            <button onClick={() => handleRemoveItem(index)} style={{ background: 'none', border: 'none', color: '#aaa', cursor: 'pointer' }}>×</button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Roulette;
