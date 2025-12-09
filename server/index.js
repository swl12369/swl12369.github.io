require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI;

// Connect to MongoDB
if (MONGO_URI) {
    mongoose.connect(MONGO_URI)
        .then(() => {
            console.log('Connected to MongoDB');
            initializeAdmin();
        })
        .catch(err => console.error('MongoDB connection error:', err));
} else {
    console.warn('MONGO_URI is not set. Database features will not work.');
}

// --- Mongoose Models ---

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    securityQuestion: { type: String, required: true },
    securityAnswer: { type: String, required: true },
    role: { type: String, default: 'user' },
    avatarSeed: { type: String }, // For customizable avatars
    isApproved: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

const postSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    imagePath: { type: String },
    author: { type: String, default: '익명' },
    date: { type: Date, default: Date.now },
    comments: [{
        author: { type: String },
        content: { type: String },
        date: { type: Date, default: Date.now }
    }],
    poll: {
        options: [{
            text: { type: String },
            votes: [{ type: String }] // Array of usernames who voted
        }]
    }
});

// Configure schemas to include virtuals/id in JSON
userSchema.set('toJSON', { virtuals: true });
postSchema.set('toJSON', { virtuals: true });

const User = mongoose.model('User', userSchema);
const Post = mongoose.model('Post', postSchema);

// --- Admin Initialization ---
const initializeAdmin = async () => {
    const adminUsername = process.env.ADMIN_USERNAME;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (adminUsername && adminPassword) {
        try {
            const adminExists = await User.findOne({ username: new RegExp(`^${adminUsername}$`, 'i') });
            if (!adminExists) {
                console.log('Creating admin user from environment variables...');
                await User.create({
                    username: adminUsername,
                    password: adminPassword,
                    securityQuestion: 'System Generated',
                    securityAnswer: 'system',
                    role: 'admin',
                    isApproved: true
                });
                console.log(`Admin user '${adminUsername}' created.`);
            }
        } catch (error) {
            console.error('Error initializing admin:', error);
        }
    }
};


// --- Multer Setup ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });


// --- ROUTES ---

// Auth Routes
app.post('/api/register', async (req, res) => {
    // Check Database Connection
    if (mongoose.connection.readyState !== 1) {
        return res.status(503).json({ error: '데이터베이스에 연결되지 않았습니다. 잠시 후 다시 시도해주세요.' });
    }

    const { username, password, securityQuestion, securityAnswer } = req.body;

    if (!username || !password || !securityQuestion || !securityAnswer) {
        return res.status(400).json({ error: '모든 필드를 입력해주세요.' });
    }

    try {
        const existingUser = await User.findOne({ username: new RegExp(`^${username}$`, 'i') });
        if (existingUser) {
            return res.status(400).json({ error: '이미 존재하는 아이디입니다.' });
        }

        const isXManager = username.toLowerCase() === 'xmanager';
        const newUser = await User.create({
            username,
            password, // Should be hashed in production
            securityQuestion,
            securityAnswer: securityAnswer.toLowerCase().trim(),
            role: isXManager ? 'admin' : 'user',
            avatarSeed: username, // Default avatar seed is the username
            isApproved: isXManager ? true : false
        });

        res.status(201).json({
            id: newUser.id,
            username: newUser.username,
            message: newUser.isApproved ? '관리자(xManager)로 자동 승인되었습니다.' : '회원가입이 완료되었습니다. 관리자 승인 대기 중입니다.'
        });
    } catch (err) {
        console.error('Registration Error:', err);
        res.status(500).json({ error: '회원가입 처리 중 오류가 발생했습니다.' });
    }
});

app.post('/api/login', async (req, res) => {
    // Check Database Connection
    if (mongoose.connection.readyState !== 1) {
        return res.status(503).json({ error: '데이터베이스에 연결되지 않았습니다. 잠시 후 다시 시도해주세요.' });
    }

    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: '아이디와 비밀번호를 입력해주세요.' });
    }

    try {
        const user = await User.findOne({ username }); // Case-sensitive search for login usually, but let's check exact match first

        // For debugging
        if (!user) {
            console.log(`Login failed: User '${username}' not found.`);
            return res.status(401).json({ error: '아이디 또는 비밀번호가 올바르지 않습니다.' });
        }

        // Simple password check (plaintext)
        if (user.password !== password) {
            console.log(`Login failed: Incorrect password for '${username}'.`);
            return res.status(401).json({ error: '아이디 또는 비밀번호가 올바르지 않습니다.' });
        }

        res.json({
            id: user.id,
            username: user.username,
            role: user.role,
            avatarSeed: user.avatarSeed || user.username,
            isApproved: user.isApproved,
            message: '로그인 성공!'
        });
    } catch (err) {
        console.error('Login Error:', err);
        res.status(500).json({ error: '로그인 처리 중 오류가 발생했습니다.' });
    }
});

// Admin User Management
app.get('/api/admin/users', async (req, res) => {
    try {
        const users = await User.find({});
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: '데이터를 불러오는데 실패했습니다.' });
    }
});

app.post('/api/admin/approve', async (req, res) => {
    const { username } = req.body;
    try {
        const user = await User.findOneAndUpdate(
            { username },
            { isApproved: true },
            { new: true }
        );
        if (!user) {
            return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
        }
        res.json({ message: '사용자가 승인되었습니다.' });
    } catch (err) {
        res.status(500).json({ error: '오류가 발생했습니다.' });
    }
});

// Account Recovery
app.post('/api/find-username', async (req, res) => {
    const { securityQuestion, securityAnswer } = req.body;
    try {
        const users = await User.find({
            securityQuestion,
            securityAnswer: securityAnswer.toLowerCase().trim()
        });

        if (users.length === 0) {
            return res.status(404).json({ error: '일치하는 사용자를 찾을 수 없습니다.' });
        }

        res.json({
            usernames: users.map(u => u.username),
            message: '아이디를 찾았습니다.'
        });
    } catch (err) {
        res.status(500).json({ error: '오류가 발생했습니다.' });
    }
});

app.post('/api/reset-password', async (req, res) => {
    const { username, securityQuestion, securityAnswer, newPassword } = req.body;
    try {
        const user = await User.findOne({
            username,
            securityQuestion,
            securityAnswer: securityAnswer.toLowerCase().trim()
        });

        if (!user) {
            return res.status(404).json({ error: '사용자 정보가 일치하지 않습니다.' });
        }

        user.password = newPassword;
        await user.save();

        res.json({ message: '비밀번호가 성공적으로 변경되었습니다.' });
    } catch (err) {
        res.status(500).json({ error: '오류가 발생했습니다.' });
    }
});

app.delete('/api/user', async (req, res) => {
    const { username, password } = req.body;
    try {
        const result = await User.deleteOne({ username, password });
        if (result.deletedCount === 0) {
            return res.status(401).json({ error: '아이디 또는 비밀번호가 올바르지 않습니다.' });
        }
        res.json({ message: '회원탈퇴가 완료되었습니다.' });
    } catch (err) {
        res.status(500).json({ error: '오류가 발생했습니다.' });
    }
});

// Admin Authentication (Special Route)
app.post('/api/admin/login', async (req, res) => {
    const { username, password } = req.body;
    try { // Check database
        const user = await User.findOne({ username });

        // Logic: specific usernames OR admin role
        const isAdmin = user && (
            user.username === 'irene' ||
            user.username === 'xManager' ||
            user.role === 'admin'
        );

        if (!isAdmin) {
            return res.status(401).json({ error: '관리자 권한이 없는 계정입니다.' });
        }

        if (password === user.password) {
            res.json({
                username: user.username,
                message: '관리자 로그인 성공!'
            });
        } else {
            res.status(401).json({ error: '아이디 또는 비밀번호가 올바르지 않습니다.' });
        }
    } catch (err) {
        res.status(500).json({ error: '오류가 발생했습니다.' });
    }
});

// Update Avatar
app.put('/api/user/avatar', async (req, res) => {
    const { username, avatarSeed } = req.body;
    try {
        const user = await User.findOneAndUpdate(
            { username },
            { avatarSeed },
            { new: true }
        );
        if (!user) return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
        res.json({ message: '아바타가 변경되었습니다.', avatarSeed: user.avatarSeed });
    } catch (err) {
        res.status(500).json({ error: '오류가 발생했습니다.' });
    }
});


// Post Routes
app.get('/api/posts', async (req, res) => {
    try {
        const posts = await Post.find().sort({ date: -1 }).lean(); // Use lean() for performance and modification

        // Enrich posts with author avatars
        const enrichedPosts = await Promise.all(posts.map(async (post) => {
            // Fetch post author avatar
            const authorUser = await User.findOne({ username: post.author });
            const authorAvatar = authorUser ? (authorUser.avatarSeed || authorUser.username) : post.author;

            // Enrich comments with author avatars
            const enrichedComments = await Promise.all(post.comments.map(async (comment) => {
                const commentUser = await User.findOne({ username: comment.author });
                return {
                    ...comment,
                    authorAvatar: commentUser ? (commentUser.avatarSeed || commentUser.username) : comment.author
                };
            }));

            return {
                ...post,
                authorAvatar,
                comments: enrichedComments
            };
        }));

        res.json(enrichedPosts);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: '게시물을 불러오는데 실패했습니다.' });
    }
});

app.post('/api/posts', upload.single('image'), async (req, res) => {
    const { title, content, author } = req.body;
    const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

    try {
        const newPost = await Post.create({
            title,
            content,
            imagePath,
            author: author || '익명',
            comments: []
        });
        res.status(201).json(newPost);
    } catch (err) {
        res.status(500).json({ error: '게시물 작성 실패' });
    }
});

app.put('/api/posts/:id', upload.single('image'), async (req, res) => {
    const { id } = req.params;
    const { title, content, username } = req.body;

    try {
        const post = await Post.findById(id);
        if (!post) return res.status(404).json({ error: '게시물을 찾을 수 없습니다.' });

        if (post.author !== username) {
            return res.status(403).json({ error: '본인의 게시물만 수정할 수 있습니다.' });
        }

        post.title = title;
        post.content = content;

        if (req.file) {
            // Delete old image
            if (post.imagePath) {
                const oldPath = path.join(__dirname, post.imagePath);
                if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
            }
            post.imagePath = `/uploads/${req.file.filename}`;
        }

        await post.save();
        res.json(post);
    } catch (err) {
        res.status(500).json({ error: '오류가 발생했습니다.' });
    }
});

app.post('/api/posts/:id/comments', async (req, res) => {
    const { id } = req.params;
    const { username, content } = req.body;

    try {
        const post = await Post.findById(id);
        if (!post) return res.status(404).json({ error: '게시물을 찾을 수 없습니다.' });

        const newComment = {
            author: username || '익명',
            content,
            date: new Date()
        };
        post.comments.push(newComment);
        await post.save();
        res.status(201).json(post);
    } catch (err) {
        res.status(500).json({ error: '오류가 발생했습니다.' });
    }
});

app.delete('/api/posts/:id/comments/:commentId', async (req, res) => {
    const { id, commentId } = req.params;
    const { username } = req.body;

    try {
        const post = await Post.findById(id);
        if (!post) return res.status(404).json({ error: '게시물을 찾을 수 없습니다.' });

        // Find comment subdocument
        const comment = post.comments.id(commentId);
        if (!comment) return res.status(404).json({ error: '댓글을 찾을 수 없습니다.' });

        const user = await User.findOne({ username });
        const isAdmin = user && (user.role === 'admin' || user.username === 'xManager');

        if (comment.author !== username && !isAdmin) {
            return res.status(403).json({ error: '본인의 댓글만 삭제할 수 있습니다.' });
        }

        comment.deleteOne();
        await post.save();
        res.json(post);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: '오류가 발생했습니다.' });
    }
});

app.post('/api/posts/:id/vote', async (req, res) => {
    const { id } = req.params;
    const { username, optionIndex } = req.body;

    try {
        const post = await Post.findById(id);
        if (!post || !post.poll) return res.status(404).json({ error: '투표를 찾을 수 없습니다.' });

        let removed = false;
        post.poll.options.forEach((opt, idx) => {
            const userIndex = opt.votes.indexOf(username);
            if (userIndex !== -1) {
                opt.votes.splice(userIndex, 1);
                if (idx === optionIndex) removed = true;
            }
        });

        if (!removed) {
            post.poll.options[optionIndex].votes.push(username);
        }

        await post.save();
        res.json(post);
    } catch (err) {
        res.status(500).json({ error: '오류가 발생했습니다.' });
    }
});

app.delete('/api/posts/:id', async (req, res) => {
    const { id } = req.params;
    const { username } = req.body;

    try {
        const post = await Post.findById(id);
        if (!post) return res.status(404).json({ error: '게시물을 찾을 수 없습니다.' });

        const user = await User.findOne({ username });
        const isAdmin = user && (user.role === 'admin' || user.username === 'xManager');

        if (post.author !== username && !isAdmin) {
            return res.status(403).json({ error: '본인의 게시물만 삭제할 수 있습니다.' });
        }

        if (post.imagePath) {
            const fullPath = path.join(__dirname, post.imagePath);
            if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
        }

        await Post.deleteOne({ _id: id });
        res.json({ message: '게시물이 삭제되었습니다.' });
    } catch (err) {
        res.status(500).json({ error: '오류가 발생했습니다.' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
