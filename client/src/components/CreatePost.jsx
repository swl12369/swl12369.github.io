import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const CreatePost = ({ onPostCreated }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
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
        formData.append('author', user?.username || '익명');
        if (image) {
            formData.append('image', image);
        }

        try {
            const res = await fetch('http://localhost:5000/api/posts', {
                method: 'POST',
                body: formData
            });
            if (res.ok) {
                setTitle('');
                setContent('');
                setImage(null);
                setPreview(null);
                if (onPostCreated) onPostCreated();
            }
        } catch (err) {
            console.error('Error creating post:', err);
        }
    };

    return (
        <div className="form-container">
            <h2>새로운 추억 남기기</h2>
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
                    rows="4"
                    required
                />
                <div className="file-input-wrapper">
                    <input type="file" accept="image/*" onChange={handleImageChange} />
                </div>
                {preview && <img src={preview} alt="Preview" className="preview-image" />}
                <div style={{ marginTop: '1rem', textAlign: 'right' }}>
                    <button type="submit">게시하기</button>
                </div>
            </form>
        </div>
    );
};

export default CreatePost;
