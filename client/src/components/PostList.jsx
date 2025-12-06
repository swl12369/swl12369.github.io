import React, { useEffect, useState } from 'react';

const PostList = ({ onPostClick }) => {
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        fetch('http://localhost:5000/api/posts')
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
                            src={`http://localhost:5000${post.imagePath}`}
                            alt={post.title}
                            className="card-image"
                        />
                    )}
                    <div className="card-content">
                        <h3 className="card-title">{post.title}</h3>
                        <div className="card-date">{new Date(post.date).toLocaleDateString()}</div>
                        <p className="card-text">{post.content}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default PostList;
