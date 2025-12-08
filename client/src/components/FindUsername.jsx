import React, { useState } from 'react';
import { API_URL } from '../config';

const FindUsername = ({ onBack }) => {
    const [securityQuestion, setSecurityQuestion] = useState('');
    const [securityAnswer, setSecurityAnswer] = useState('');
    const [foundUsernames, setFoundUsernames] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

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
        setSuccess(false);

        try {
            const res = await fetch(`${API_URL}/api/find-username`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ securityQuestion, securityAnswer })
            });

            const data = await res.json();

            if (res.ok) {
                setFoundUsernames(data.usernames);
                setSuccess(true);
            } else {
                setError(data.error || '아이디를 찾을 수 없습니다.');
            }
        } catch (err) {
            setError('서버 연결에 실패했습니다.');
        }
    };

    return (
        <div className="form-container">
            <h2>아이디 찾기</h2>
            {!success ? (
                <form onSubmit={handleSubmit}>
                    {error && <div className="error-message">{error}</div>}
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
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button type="submit">찾기</button>
                        <button type="button" onClick={onBack} style={{ backgroundColor: '#888' }}>취소</button>
                    </div>
                </form>
            ) : (
                <div>
                    <div className="success-message">
                        <p>찾은 아이디:</p>
                        {foundUsernames.map((username, i) => (
                            <p key={i} style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>{username}</p>
                        ))}
                    </div>
                    <button onClick={onBack}>로그인으로 돌아가기</button>
                </div>
            )}
        </div>
    );
};

export default FindUsername;
