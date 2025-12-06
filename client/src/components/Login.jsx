import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Login = ({ onSuccess, onFindUsername, onResetPassword, onRegisterClick }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const res = await fetch('http://localhost:5000/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await res.json();

            if (res.ok) {
                login(data);
                if (onSuccess) onSuccess();
            } else {
                setError(data.error || '로그인에 실패했습니다.');
            }
        } catch (err) {
            setError('서버 연결에 실패했습니다.');
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>로그인</h2>
                <form onSubmit={handleSubmit}>
                    {error && <div className="error-message">{error}</div>}
                    <input
                        type="text"
                        placeholder="아이디"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        required
                        className="form-input"
                    />
                    <input
                        type="password"
                        placeholder="비밀번호"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                        className="form-input"
                    />
                    <button type="submit" className="btn btn-primary">로그인</button>
                </form>
                <div className="auth-links">
                    <button onClick={onRegisterClick} className="btn-link">회원가입</button>
                    <button onClick={onFindUsername} className="btn-link">아이디 찾기</button>
                    <button onClick={onResetPassword} className="btn-link">비밀번호 재설정</button>
                </div>
            </div>
        </div>
    );
};

export default Login;
