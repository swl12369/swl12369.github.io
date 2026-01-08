import React, { useState } from 'react';

const TodoList = ({ onBack }) => {
    // Demo Data
    const [todos, setTodos] = useState([
        { id: 1, text: '우유 사오기 🥛', completed: false },
        { id: 2, text: '관리비 납부 💸', completed: true },
    ]);
    const [newTodo, setNewTodo] = useState('');

    const toggleTodo = (id) => {
        setTodos(todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    };

    const deleteTodo = (id) => {
        setTodos(todos.filter(t => t.id !== id));
    };

    const addTodo = () => {
        if (newTodo.trim()) {
            setTodos([...todos, { id: Date.now(), text: newTodo, completed: false }]);
            setNewTodo('');
        }
    };

    return (
        <div style={{ padding: '1rem', maxWidth: '600px', margin: '0 auto', paddingBottom: '100px' }}>
            <button onClick={onBack} style={{ marginBottom: '1rem', background: '#F6F6F6' }}>← 뒤로가기</button>
            <h2 style={{ color: '#3C1E1E', marginBottom: '1.5rem' }}>✅ 같이 할 일</h2>

            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
                <input
                    value={newTodo}
                    onChange={(e) => setNewTodo(e.target.value)}
                    placeholder="할 일 추가..."
                    style={{ flex: 1, padding: '1rem', borderRadius: '12px', border: '1px solid #ddd', fontSize: '1rem' }}
                    onKeyPress={(e) => e.key === 'Enter' && addTodo()}
                />
                <button
                    onClick={addTodo}
                    style={{ padding: '0 1.5rem', background: '#FEE500', border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '1.5rem' }}
                >
                    +
                </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                {todos.map(todo => (
                    <div key={todo.id} style={{
                        background: 'white',
                        padding: '1rem',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                        opacity: todo.completed ? 0.6 : 1
                    }}>
                        <div
                            onClick={() => toggleTodo(todo.id)}
                            style={{
                                width: '24px',
                                height: '24px',
                                borderRadius: '50%',
                                border: `2px solid ${todo.completed ? '#00C73C' : '#ddd'}`,
                                background: todo.completed ? '#00C73C' : 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                color: 'white'
                            }}
                        >
                            {todo.completed && '✓'}
                        </div>
                        <div
                            style={{ flex: 1, textDecoration: todo.completed ? 'line-through' : 'none', fontSize: '1.1rem' }}
                        >
                            {todo.text}
                        </div>
                        <button onClick={() => deleteTodo(todo.id)} style={{ background: 'none', border: 'none', color: '#aaa', cursor: 'pointer' }}>×</button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TodoList;
