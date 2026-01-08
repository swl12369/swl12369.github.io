import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const items = [
    { id: 'emo1', name: '기본 이모티콘 팩', price: 100, icon: '😀' },
    { id: 'emo2', name: '동물 친구들', price: 200, icon: '🐶' },
    { id: 'emo3', name: '활력소 팩', price: 300, icon: '💪' },
    { id: 'emo4', name: '사랑 가득', price: 500, icon: '❤️' },
];

import { API_URL } from '../config';

const Shop = ({ onBack }) => {
    const { user, updateUser } = useAuth();

    const handleBuy = async (item) => {
        if (user.points < item.price) {
            alert('포인트가 부족합니다!');
            return;
        }

        if (confirm(`${item.name}을(를) ${item.price}P에 구매하시겠습니까?`)) {
            try {
                const res = await fetch(`${API_URL}/api/shop/buy`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        username: user.username,
                        itemId: item.id,
                        cost: item.price,
                        itemName: item.name
                    })
                });
                const data = await res.json();

                if (data.success) {
                    alert('구매 완료!');
                    // Update global user state (AuthContext)
                    updateUser({ ...user, points: data.points, inventory: data.inventory });
                } else {
                    alert(data.error || '구매 실패');
                }
            } catch (err) {
                console.error(err);
                alert('서버 오류로 구매에 실패했습니다.');
            }
        }
    };

    return (
        <div style={{ padding: '1rem', maxWidth: '600px', margin: '0 auto', paddingBottom: '100px' }}>
            <button onClick={onBack} style={{ marginBottom: '1rem', background: '#F6F6F6' }}>← 뒤로가기</button>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={{ margin: 0, color: '#3C1E1E' }}>🛒 이모티콘 샵</h2>
                <div style={{ background: '#FEE500', padding: '0.5rem 1rem', borderRadius: '12px', fontWeight: 'bold' }}>
                    내 포인트: {user?.points || 0} P
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '1rem' }}>
                {items.map(item => {
                    const hasItem = user.inventory && user.inventory.some(i => i.itemId === item.id);
                    return (
                        <div key={item.id} style={{
                            background: 'white',
                            padding: '1.5rem',
                            borderRadius: '16px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                            textAlign: 'center'
                        }}>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{item.icon}</div>
                            <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>{item.name}</div>
                            <div style={{ color: '#E03E3E', fontWeight: 'bold', marginBottom: '1rem' }}>{item.price} P</div>

                            {hasItem ? (
                                <button disabled style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: 'none', background: '#ddd' }}>보유중</button>
                            ) : (
                                <button
                                    onClick={() => handleBuy(item)}
                                    style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: 'none', background: '#FEE500', color: '#3C1E1E', cursor: 'pointer', fontWeight: 'bold' }}
                                >
                                    구매하기
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Shop;
