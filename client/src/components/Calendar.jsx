import React, { useState } from 'react';

const Calendar = ({ onBack }) => {
    // Demo Data
    const [events, setEvents] = useState([
        { id: 1, date: '2025-05-05', title: '어린이날 가족 식사 🍕', author: 'Mom' },
        { id: 2, date: '2025-05-08', title: '어버이날 카네이션 드리기 💐', author: 'Dad' },
    ]);
    const [newEvent, setNewEvent] = useState({ date: '', title: '' });

    const handleAddEvent = () => {
        if (newEvent.date && newEvent.title) {
            setEvents([...events, { ...newEvent, id: Date.now(), author: 'Me' }]);
            setNewEvent({ date: '', title: '' });
        } else {
            alert('날짜와 내용을 입력해주세요.');
        }
    };

    return (
        <div style={{ padding: '1rem', maxWidth: '600px', margin: '0 auto', paddingBottom: '100px' }}>
            <button onClick={onBack} style={{ marginBottom: '1rem', background: '#F6F6F6' }}>← 뒤로가기</button>
            <h2 style={{ color: '#3C1E1E', marginBottom: '1.5rem' }}>📅 우리 가족 일정</h2>

            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', marginBottom: '2rem' }}>
                <h3 style={{ marginTop: 0 }}>일정 추가</h3>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <input
                        type="date"
                        value={newEvent.date}
                        onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                        style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd' }}
                    />
                    <input
                        type="text"
                        placeholder="일정 내용"
                        value={newEvent.title}
                        onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                        style={{ flex: 1, padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd' }}
                    />
                </div>
                <button
                    onClick={handleAddEvent}
                    style={{ width: '100%', padding: '0.8rem', background: '#FEE500', border: 'none', borderRadius: '8px', fontWeight: 'bold' }}
                >
                    추가하기
                </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {events.sort((a, b) => a.date.localeCompare(b.date)).map(event => (
                    <div key={event.id} style={{ background: 'white', padding: '1rem', borderRadius: '12px', borderLeft: '5px solid #FEE500', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                        <div style={{ fontSize: '0.9rem', color: '#888', marginBottom: '0.2rem' }}>{event.date}</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{event.title}</div>
                        <div style={{ fontSize: '0.8rem', color: '#aaa', textAlign: 'right', marginTop: '0.5rem' }}>작성자: {event.author}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Calendar;
