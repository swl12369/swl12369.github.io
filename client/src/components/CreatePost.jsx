import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const CreatePost = ({ onPostCreated, initialTitle = '', isPollMode = false }) => {
    const [title, setTitle] = useState(initialTitle);
    const [content, setContent] = useState('');
    const [pollOption1, setPollOption1] = useState('');
    const [pollOption2, setPollOption2] = useState('');
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

        if (isPollMode) {
            formData.append('title', `${pollOption1} vs ${pollOption2}`);
            formData.append('pollOption1', pollOption1);
            formData.append('pollOption2', pollOption2);
        } else {
            formData.append('title', title);
        }

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
                setPollOption1('');
                setPollOption2('');
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
            <h2>{isPollMode ? '투표 만들기' : '새로운 추억 남기기'}</h2>
            <form onSubmit={handleSubmit}>
                {isPollMode ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                        <input
                            type="text"
                            placeholder="항목 A (예: 짜장)"
                            value={pollOption1}
                            onChange={e => setPollOption1(e.target.value)}
                            required={isPollMode}
                            style={{ flex: 1, textAlign: 'center', fontSize: '1.1rem', fontWeight: 'bold' }}
                        />
                        <span style={{ fontWeight: '900', fontSize: '1.2rem', color: '#888' }}>VS</span>
                        <input
                            type="text"
                            placeholder="항목 B (예: 짬뽕)"
                            value={pollOption2}
                            onChange={e => setPollOption2(e.target.value)}
                            required={isPollMode}
                            style={{ flex: 1, textAlign: 'center', fontSize: '1.1rem', fontWeight: 'bold' }}
                        />
                    </div>
                ) : (
                    <input
                        type="text"
                        placeholder="제목"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        required
                    />
                )}

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
