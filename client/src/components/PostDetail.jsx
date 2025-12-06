import React from 'react';
import { useAuth } from '../context/AuthContext';

const PostDetail = ({ post, onBack }) => {
    const { user } = useAuth();

    if (!post) return null;

    const handleDelete = async () => {
        if (!window.confirm('정말로 이 게시물을 삭제하시겠습니까?')) {
            return;
        }

        try {
            const res = await fetch(`http://localhost:5000/api/posts/${post.id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username: user.username }),
            });

            if (res.ok) {
                alert('게시물이 삭제되었습니다.');
                onBack();
            } else {
                const data = await res.json();
                alert(data.error || '삭제에 실패했습니다.');
            }
        } catch (err) {
            alert('서버 오류가 발생했습니다.');
        }
    };

    const isAuthor = user && (user.username === post.author || user.role === 'admin' || user.username === 'xManager');

    return (
        <div className="post-detail-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <button onClick={onBack} className="back-button">← 목록으로</button>
                {isAuthor && (
                    <button
                        onClick={handleDelete}
                        className="delete-button"
                        style={{
                            backgroundColor: '#ff4444',
                            color: 'white',
                            border: 'none',
                            padding: '0.5rem 1rem',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        삭제하기
                    </button>
                )}
            </div>

            <div className="post-detail">
                {post.imagePath && (
                    <img
                        src={`http://localhost:5000${post.imagePath}`}
                        alt={post.title}
                        className="detail-image"
                    />
                )}
                <div className="detail-content">
                    <h1 className="detail-title">{post.title}</h1>
                    <div className="detail-meta">
                        <span className="detail-author">{post.author || '익명'}</span>
                        <span className="detail-date">{new Date(post.date).toLocaleDateString('ko-KR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            weekday: 'long'
                        })}</span>
                    </div>
                    <div className="detail-text">{post.content}</div>
                </div>
            </div>
        </div>
    );
};

export default PostDetail;
