import React, { useState } from 'react';
import { API_URL } from '../config';

const ResetPassword = ({ onBack, onSuccess }) => {
    const [username, setUsername] = useState('');
    const [securityQuestion, setSecurityQuestion] = useState('');
    const [securityAnswer, setSecurityAnswer] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');

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

        if (newPassword !== confirmPassword) {
            setError('비밀번호가 일치하지 않습니다.');
            return;
        }

        if (newPassword.length < 4) {
            setError('비밀번호는 최소 4자 이상이어야 합니다.');
            return;
        }

        try {
            const res = await fetch(`${API_URL}/api/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, securityQuestion, securityAnswer, newPassword })
            });

            const data = await res.json();

            if (res.ok) {
                alert(data.message);
                if (onSuccess) onSuccess();
            } else {
                setError(data.error || '비밀번호 재설정에 실패했습니다.');
            }
        } catch (err) {
            setError('서버 연결에 실패했습니다.');
        }
    };

    return (
        <div className="form-container">
            <h2>비밀번호 재설정</h2>
            <form onSubmit={handleSubmit}>
                {error && <div className="error-message">{error}</div>}
                <input
                    type="text"
                    placeholder="아이디"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
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
                <input
                    type="password"
                    placeholder="새 비밀번호"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="새 비밀번호 확인"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    required
                />
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button type="submit">비밀번호 재설정</button>
                    <button type="button" onClick={onBack} style={{ backgroundColor: '#888' }}>취소</button>
                </div>
            </form>
        </div>
    );
};

export default ResetPassword;
