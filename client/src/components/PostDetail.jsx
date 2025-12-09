import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import EditPost from './EditPost';
import { API_URL } from '../config';

const PostDetail = ({ post, onBack, onPostUpdated }) => {
    const { user } = useAuth();
    const [isEditing, setIsEditing] = useState(false);

    if (!post) return null;

    // Handle post update success
    const handleUpdateSuccess = (updatedPost) => {
        setIsEditing(false);
        if (onPostUpdated) {
            onPostUpdated(updatedPost);
        }
    };

    if (isEditing) {
        return <EditPost post={post} onCancel={() => setIsEditing(false)} onUpdateSuccess={handleUpdateSuccess} />;
    }

    const handleDelete = async () => {
        if (!window.confirm('정말로 이 게시물을 삭제하시겠습니까?')) {
            return;
        }

        try {
            const res = await fetch(`${API_URL}/api/posts/${post.id}`, {
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

    const isAuthor = user && (user.username === post.author);
    const isAdmin = user && (user.role === 'admin' || user.username === 'xManager');

    return (
        <div className="post-detail-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <button onClick={onBack} className="back-button">← 목록으로</button>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {isAuthor && (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="edit-button"
                            style={{
                                backgroundColor: '#FFC107',
                                color: '#333',
                                border: 'none',
                                padding: '0.5rem 1rem',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontWeight: '600'
                            }}
                        >
                            수정하기
                        </button>
                    )}
                    {(isAuthor || isAdmin) && (
                        <button
                            onClick={handleDelete}
                            className="delete-button"
                            style={{
                                backgroundColor: '#d32f2f', // Darker red for Navy theme
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
            </div>

            <div className="post-detail">
                {post.imagePath && (
                    <img
                        src={`${API_URL}${post.imagePath}`}
                        alt={post.title}
                        className="detail-image"
                    />
                )}
                <div className="detail-content">

                    {/* Poll Section */}
                    {post.poll && (
                        <div style={{ margin: '2rem 2rem 0', padding: '1.5rem', backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                            <h3 style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#1A237E' }}>🗳️ 투표</h3>
                            <div style={{ display: 'flex', gap: '1rem', flexDirection: 'row', minHeight: '150px' }}>
                                {post.poll.options.map((option, index) => {
                                    const totalVotes = post.poll.options.reduce((acc, curr) => acc + curr.votes.length, 0);
                                    const voteCount = option.votes.length;
                                    const percentage = totalVotes === 0 ? 0 : Math.round((voteCount / totalVotes) * 100);
                                    const isVoted = user && option.votes.includes(user.username);

                                    return (
                                        <button
                                            key={index}
                                            onClick={async () => {
                                                if (!user) return alert('로그인이 필요합니다.');
                                                try {
                                                    const res = await fetch(`${API_URL}/api/posts/${post.id}/vote`, {
                                                        method: 'POST',
                                                        headers: { 'Content-Type': 'application/json' },
                                                        body: JSON.stringify({ username: user.username, optionIndex: index })
                                                    });
                                                    if (res.ok) {
                                                        const updatedPost = await res.json();
                                                        if (onPostUpdated) onPostUpdated(updatedPost);
                                                    }
                                                } catch (e) {
                                                    console.error(e);
                                                }
                                            }}
                                            style={{
                                                flex: 1,
                                                padding: '1.5rem',
                                                border: isVoted ? '3px solid #1A237E' : '2px solid #e0e0e0',
                                                borderRadius: '12px',
                                                backgroundColor: isVoted ? '#E8EAF6' : 'white',
                                                cursor: 'pointer',
                                                position: 'relative',
                                                overflow: 'hidden',
                                                transition: 'all 0.2s',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                boxShadow: isVoted ? '0 0 10px rgba(26, 35, 126, 0.2)' : 'none'
                                            }}
                                        >
                                            <div style={{
                                                position: 'absolute',
                                                bottom: 0,
                                                left: 0,
                                                width: '100%',
                                                height: `${percentage}%`,
                                                backgroundColor: index === 0 ? 'rgba(26, 35, 126, 0.1)' : 'rgba(198, 40, 40, 0.1)',
                                                transition: 'height 0.5s ease-in-out',
                                                zIndex: 0
                                            }} />

                                            <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
                                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#333' }}>
                                                    {option.text}
                                                </div>
                                                <div style={{ fontSize: '1.2rem', color: '#555', marginBottom: '0.5rem' }}>
                                                    {percentage}%
                                                </div>
                                                <div style={{ fontSize: '0.9rem', color: '#888' }}>
                                                    ({voteCount}표)
                                                </div>
                                                {isVoted && <div style={{ marginTop: '0.5rem', color: '#1A237E', fontWeight: 'bold' }}>✅ 선택됨</div>}
                                                {!isVoted && (
                                                    <div style={{
                                                        marginTop: '0.8rem',
                                                        color: '#fff',
                                                        backgroundColor: '#1A237E',
                                                        padding: '5px 15px',
                                                        borderRadius: '20px',
                                                        fontSize: '0.9rem'
                                                    }}>
                                                        투표하기
                                                    </div>
                                                )}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Comment Section */}
                    <div style={{ padding: '2rem', borderTop: '1px solid #eee' }}>
                        <h3>댓글 ({post.comments ? post.comments.length : 0})</h3>

                        <ul style={{ listStyle: 'none', padding: 0, marginBottom: '2rem' }}>
                            {post.comments && post.comments.map(comment => (
                                <li key={comment.id} style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid #f9f9f9' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', alignItems: 'center' }}>
                                        <div>
                                            <strong style={{ color: '#1A237E', marginRight: '0.5rem' }}>
                                                <img
                                                    src={`https://api.dicebear.com/9.x/dylan/svg?seed=${comment.authorAvatar || comment.author}`}
                                                    alt="avatar"
                                                    style={{ width: '20px', height: '20px', borderRadius: '50%', verticalAlign: 'middle', marginRight: '5px' }}
                                                />
                                                {comment.author}
                                            </strong>
                                            <span style={{ fontSize: '0.85rem', color: '#888' }}>
                                                {new Date(comment.date).toLocaleDateString()}
                                            </span>
                                        </div>
                                        {(user && (user.username === comment.author || isAdmin)) && (
                                            <button
                                                onClick={async () => {
                                                    if (!window.confirm('댓글을 삭제하시겠습니까?')) return;
                                                    try {
                                                        const res = await fetch(`${API_URL}/api/posts/${post.id}/comments/${comment.id}`, {
                                                            method: 'DELETE',
                                                            headers: { 'Content-Type': 'application/json' },
                                                            body: JSON.stringify({ username: user.username })
                                                        });
                                                        if (res.ok) {
                                                            const updatedPost = await res.json();
                                                            if (onPostUpdated) onPostUpdated(updatedPost);
                                                        } else {
                                                            alert('댓글 삭제 실패');
                                                        }
                                                    } catch (e) {
                                                        console.error(e);
                                                        alert('오류 발생');
                                                    }
                                                }}
                                                style={{
                                                    background: 'none',
                                                    border: 'none',
                                                    color: '#d32f2f',
                                                    cursor: 'pointer',
                                                    fontSize: '0.9rem'
                                                }}
                                            >
                                                삭제
                                            </button>
                                        )}
                                    </div>
                                    <div>{comment.content}</div>
                                </li>
                            ))}
                        </ul>

                        {user && (
                            <form onSubmit={async (e) => {
                                e.preventDefault();
                                const form = e.target;
                                const content = form.comment.value;

                                if (!content.trim()) return;

                                try {
                                    const res = await fetch(`${API_URL}/api/posts/${post.id}/comments`, {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ username: user.username, content })
                                    });

                                    if (res.ok) {
                                        const updatedPost = await res.json();
                                        if (onPostUpdated) onPostUpdated(updatedPost);
                                        form.reset();
                                    } else {
                                        alert('댓글 작성에 실패했습니다.');
                                    }
                                } catch (err) {
                                    console.error(err);
                                    alert('오류가 발생했습니다.');
                                }
                            }}>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <input
                                        name="comment"
                                        type="text"
                                        placeholder="댓글을 남겨보세요..."
                                        style={{ flex: 1, marginBottom: 0 }}
                                        required
                                    />
                                    <button type="submit" style={{ padding: '0.8rem 1.5rem', whiteSpace: 'nowrap' }}>등록</button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PostDetail;
