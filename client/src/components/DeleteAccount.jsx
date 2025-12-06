import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const DeleteAccount = ({ onBack, onSuccess }) => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const { user, logout } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('비밀번호가 일치하지 않습니다.');
            return;
        }

        if (!window.confirm('정말로 회원탈퇴 하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
            return;
        }

        try {
            const res = await fetch('http://localhost:5000/api/user', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: user.username, password })
            });

            const data = await res.json();

            if (res.ok) {
                alert(data.message);
                logout();
                if (onSuccess) onSuccess();
            } else {
                setError(data.error || '회원탈퇴에 실패했습니다.');
            }
        } catch (err) {
            setError('서버 연결에 실패했습니다.');
        }
    };

    return (
        <div className="form-container">
            <h2>회원탈퇴</h2>
            <div className="warning-message">
                <p>⚠️ 회원탈퇴 시 모든 데이터가 삭제되며 복구할 수 없습니다.</p>
                <p>탈퇴하려면 비밀번호를 입력해주세요.</p>
            </div>
            <form onSubmit={handleSubmit}>
                {error && <div className="error-message">{error}</div>}
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
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button type="submit" style={{ backgroundColor: '#c33' }}>회원탈퇴</button>
                    <button type="button" onClick={onBack} style={{ backgroundColor: '#888' }}>취소</button>
                </div>
            </form>
        </div>
    );
};

export default DeleteAccount;
