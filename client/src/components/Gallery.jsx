import React, { useState, useEffect } from 'react';
import { API_URL } from '../config';

const Gallery = ({ onBack }) => {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchImages = async () => {
            try {
                const res = await fetch(`${API_URL}/api/posts`);
                if (res.ok) {
                    const posts = await res.json();
                    // Filter posts with images and Cloudinary URLs
                    const imagePosts = posts.filter(post =>
                        post.imagePath && post.imagePath.includes('http') &&
                        (post.imagePath.toLowerCase().endsWith('.jpg') ||
                            post.imagePath.toLowerCase().endsWith('.jpeg') ||
                            post.imagePath.toLowerCase().endsWith('.png') ||
                            post.imagePath.toLowerCase().endsWith('.gif') ||
                            // Cloudinary usually returns extension, but sometimes optimized. 
                            // Just check if it looks like an image URL or has format
                            true // Cloudinary URLs might not have extensions if transformed, but let's assume valid imagePath is image.
                        )
                    ).map(post => ({
                        id: post._id,
                        url: post.imagePath,
                        title: post.title,
                        date: post.date
                    }));
                    setImages(imagePosts);
                }
            } catch (err) {
                console.error('Failed to fetch images:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchImages();
    }, []);

    return (
        <div style={{ padding: '1rem', paddingBottom: '100px', maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ color: '#3C1E1E', marginBottom: '1.5rem', textAlign: 'center' }}>📷 사진 앨범</h2>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '2rem' }}>로딩 중...</div>
            ) : images.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>
                    등록된 사진이 없습니다.
                </div>
            ) : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                    gap: '10px'
                }}>
                    {images.map((img) => (
                        <div key={img.id} style={{
                            position: 'relative',
                            paddingTop: '100%', // 1:1 Aspect Ratio
                            borderRadius: '8px',
                            overflow: 'hidden',
                            boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                        }}>
                            <img
                                src={img.url}
                                alt={img.title}
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                    cursor: 'pointer'
                                }}
                                onClick={() => window.open(img.url, '_blank')}
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Gallery;
