import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const EditPost = ({ post, onCancel, onUpdateSuccess }) => {
    const [title, setTitle] = useState(post.title);
    const [content, setContent] = useState(post.content);
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(post.imagePath ? `http://localhost:5000${post.imagePath}` : null);
    const { user } = useAuth();

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('title', title);
        formData.append('content', content);
        formData.append('username', user.username); // For backend verification
        if (image) {
            formData.append('image', image);
        }

        try {
            const res = await fetch(`http://localhost:5000/api/posts/${post.id}`, {
                method: 'PUT',
                body: formData
            });

            if (res.ok) {
                const updatedPost = await res.json();
                onUpdateSuccess(updatedPost);
            } else {
                const data = await res.json();
                alert(data.error || '수정에 실패했습니다.');
            }
        } catch (err) {
            console.error('Error updating post:', err);
            alert('서버 오류가 발생했습니다.');
        }
    };

    return (
        <div className="form-container">
            <h2>게시물 수정하기</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="제목"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    required
                />
                <textarea
                    placeholder="내용을 입력하세요..."
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    rows="6"
                    required
                />
                <div className="file-input-wrapper">
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>사진 변경 (선택사항)</label>
                    <input type="file" accept="image/*" onChange={handleImageChange} />
                </div>
                {preview && (
                    <div style={{ marginBottom: '1rem' }}>
                        <img src={preview} alt="Preview" className="preview-image" style={{ maxHeight: '200px' }} />
                    </div>
                )}
                <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                    <button type="button" onClick={onCancel} style={{ backgroundColor: '#ccc', color: '#333' }}>취소</button>
                    <button type="submit">수정 완료</button>
                </div>
            </form>
        </div>
    );
};

export default EditPost;
