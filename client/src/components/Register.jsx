import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';

const Register = ({ onSuccess }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [securityQuestion, setSecurityQuestion] = useState('');
    const [securityAnswer, setSecurityAnswer] = useState('');
    const [error, setError] = useState('');
    const { register } = useAuth();

    const securityQuestions = [
        '가장 좋아하는 음식은?',
        '태어난 도시는?',
        '첫 번째 반려동물 이름은?',
        '어머니의 성함은?',
        '가장 좋아하는 색깔은?'
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('비밀번호가 일치하지 않습니다.');
            return;
        }

        if (password.length < 4) {
            setError('비밀번호는 최소 4자 이상이어야 합니다.');
            return;
        }

        if (!securityQuestion || !securityAnswer) {
            setError('보안 질문과 답변을 입력해주세요.');
            return;
        }

        try {
            const res = await fetch(`${API_URL}/api/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password, securityQuestion, securityAnswer })
            });

            const data = await res.json();

            if (res.ok) {
                register(data);
                if (onSuccess) onSuccess();
            } else {
                setError(data.error || '회원가입에 실패했습니다.');
            }
        } catch (err) {
            setError('서버 연결에 실패했습니다.');
        }
    };

    return (
        <div className="form-container">
            <h2>회원가입</h2>
            <form onSubmit={handleSubmit}>
                {error && <div className="error-message">{error}</div>}
                <input
                    type="text"
                    placeholder="아이디"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="비밀번호"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="비밀번호 확인"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    required
                />
                <select
                    value={securityQuestion}
                    onChange={e => setSecurityQuestion(e.target.value)}
                    required
                    style={{ marginBottom: '1rem' }}
                >
                    <option value="">보안 질문 선택</option>
                    {securityQuestions.map((q, i) => (
                        <option key={i} value={q}>{q}</option>
                    ))}
                </select>
                <input
                    type="text"
                    placeholder="보안 질문 답변"
                    value={securityAnswer}
                    onChange={e => setSecurityAnswer(e.target.value)}
                    required
                />
                <button type="submit">회원가입</button>
            </form>
        </div>
    );
};

export default Register;
