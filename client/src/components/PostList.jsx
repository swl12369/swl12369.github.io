import React, { useEffect, useState } from 'react';
import { API_URL } from '../config';

const PostList = ({ onPostClick }) => {
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        fetch(`${API_URL}/api/posts`)
            .then(res => res.json())
            .then(data => setPosts(data))
            .catch(err => console.error('Error fetching posts:', err));
    }, []);

    return (
        <div className="card-grid">
            {posts.map(post => (
                <div key={post.id} className="card" onClick={() => onPostClick(post)} style={{ cursor: 'pointer' }}>
                    {post.imagePath && (
                        <img
                            src={`${API_URL}${post.imagePath}`}
                            alt={post.title}
                            className="card-image"
                        />
                    )}
                    <div className="card-content">
                        <h3>{post.title}</h3>
                        <p className="card-author">
                            <img
                                src={`https://api.dicebear.com/9.x/dylan/svg?seed=${post.authorAvatar || post.author}`}
                                alt="avatar"
                                style={{ width: '24px', height: '24px', borderRadius: '50%', verticalAlign: 'middle', marginRight: '5px' }}
                            />
                            {post.author}
                        </p>
                        <p className="card-date">{new Date(post.date).toLocaleDateString()}</p>
                        <p className="card-count" style={{ fontSize: '0.9rem', color: '#666', marginTop: '5px' }}>
                            💬 댓글 {post.comments ? post.comments.length : 0}개
                        </p>
                        <p className="card-text">{post.content}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default PostList;
