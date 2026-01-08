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

// Debug Route
app.get('/api/debug/config', (req, res) => {
    res.json({
        CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME ? 'Set' : 'Missing',
        CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY ? 'Set' : 'Missing',
        CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET ? 'Set' : 'Missing',
        MONGO_URI: process.env.MONGO_URI ? 'Set' : 'Missing'
    });
});

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// MongoDB Connection
let MONGO_URI = process.env.MONGO_URI;

if (MONGO_URI) {
    // Sanitization: Remove hidden whitespace and quotes from copy-pasting
    MONGO_URI = MONGO_URI.trim().replace(/^["']|["']$/g, '');
}

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
    role: { type: String, default: 'user' }, // 'user' | 'admin'
    avatarSeed: String, // For customizable avatars
    avatarPath: String, // For uploaded images
    isApproved: { type: Boolean, default: false }, // Approval status
    createdAt: { type: Date, default: Date.now },
    points: { type: Number, default: 0 },
    lastLogin: { type: Date },
    lastAttendance: { type: Date },
    attendanceStreak: { type: Number, default: 0 },
    inventory: [{
        itemId: String,
        name: String,
        date: { type: Date, default: Date.now }
    }]
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
            votes: [String] // Array of usernames
        }]
    }
});

const messageSchema = new mongoose.Schema({
    from: { type: String, required: true },
    to: { type: String, required: true },
    content: { type: String, required: true },
    read: { type: Boolean, default: false },
    date: { type: Date, default: Date.now }
});

const groupChatSchema = new mongoose.Schema({
    name: { type: String, required: true },
    members: [{ type: String, required: true }],
    messages: [{
        from: { type: String, required: true },
        content: { type: String, required: true },
        date: { type: Date, default: Date.now }
    }],
    createdBy: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

// Configure schemas to include virtuals/id in JSON
userSchema.set('toJSON', { virtuals: true });
postSchema.set('toJSON', { virtuals: true });
messageSchema.set('toJSON', { virtuals: true });
groupChatSchema.set('toJSON', { virtuals: true });

const User = mongoose.model('User', userSchema);
const Post = mongoose.model('Post', postSchema);
const Message = mongoose.model('Message', messageSchema);
const GroupChat = mongoose.model('GroupChat', groupChatSchema);

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
            } else if (!adminExists.isApproved) {
                console.log('Auto-approving existing admin user...');
                adminExists.isApproved = true;
                await adminExists.save();
                console.log(`Admin user '${adminUsername}' approved.`);
            }
        } catch (error) {
            console.error('Error initializing admin:', error);
        }
    }

    // Also auto-approve xManager if exists
    try {
        const xManager = await User.findOne({ username: 'xManager' });
        if (xManager && !xManager.isApproved) {
            console.log('Auto-approving xManager...');
            xManager.isApproved = true;
            xManager.role = 'admin';
            await xManager.save();
            console.log('xManager approved and set as admin.');
        }
    } catch (error) {
        console.error('Error checking xManager:', error);
    }
};

// --- Cloudinary Setup ---
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

console.log('Cloudinary Config:', {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME ? 'Set' : 'Missing',
    api_key: process.env.CLOUDINARY_API_KEY ? 'Set' : 'Missing',
    api_secret: process.env.CLOUDINARY_API_SECRET ? 'Set' : 'Missing'
});

const cloudName = process.env.CLOUDINARY_CLOUD_NAME || '';
const apiKey = process.env.CLOUDINARY_API_KEY || '';
const apiSecret = process.env.CLOUDINARY_API_SECRET || '';

console.log('--- Cloudinary Config Debug ---');
console.log('Cloud Name:', cloudName ? `'${cloudName}' (Length: ${cloudName.length})` : 'Missing');
console.log('API Key:', apiKey ? `'${apiKey.substring(0, 4)}...' (Length: ${apiKey.length})` : 'Missing');
console.log('API Secret:', apiSecret ? `'${apiSecret.substring(0, 4)}...' (Length: ${apiSecret.length})` : 'Missing');
console.log('-------------------------------');

// Cloudinary Storage for Multer
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'family-board',
        resource_type: 'auto' // Automatically detect image or video
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});


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

app.delete('/api/admin/users/:username', async (req, res) => {
    const { username } = req.params;
    try {
        const result = await User.deleteOne({ username });
        if (result.deletedCount === 0) {
            return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
        }
        res.json({ message: '사용자가 삭제되었습니다.' });
    } catch (err) {
        res.status(500).json({ error: '오류가 발생했습니다.' });
    }
});

// Avatar Upload
app.post('/api/users/:username/avatar', upload.single('avatar'), async (req, res) => {
    console.log(`[POST /avatar] User: ${req.params.username}`);
    console.log(`[POST /avatar] File:`, req.file);
    const { username } = req.params;
    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
        }

        // Delete old avatar file if exists
        // Delete old avatar file if exists and is local
        if (user.avatarPath && !user.avatarPath.startsWith('http')) {
            const oldPath = path.join(__dirname, user.avatarPath);
            if (fs.existsSync(oldPath)) {
                fs.unlinkSync(oldPath);
            }
        }

        // Save new avatar path
        if (!req.file) {
            console.error('[POST /avatar] No file uploaded');
            return res.status(400).json({ error: '파일이 업로드되지 않았습니다.' });
        }
        user.avatarPath = req.file.path; // Cloudinary URL
        user.avatarSeed = null; // Clear seed when using custom image
        await user.save();

        res.json({ avatarPath: user.avatarPath });
    } catch (err) {
        console.error(err);
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
            { avatarSeed, avatarPath: null }, // Clear avatarPath when using random avatar
            { new: true }
        );
        if (!user) return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
        res.json({ message: '아바타가 변경되었습니다.', avatarSeed: user.avatarSeed });
    } catch (err) {
        res.status(500).json({ error: '오류가 발생했습니다.' });
    }
});

// Attendance Check
app.post('/api/user/attendance', async (req, res) => {
    const { username } = req.body;
    try {
        const user = await User.findOne({ username });
        if (!user) return res.status(404).json({ error: 'User not found' });

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const lastAttendance = user.lastAttendance ? new Date(user.lastAttendance) : null;
        if (lastAttendance) lastAttendance.setHours(0, 0, 0, 0);

        // Check if already attended today
        if (lastAttendance && lastAttendance.getTime() === today.getTime()) {
            return res.status(400).json({ message: '이미 오늘은 출석했습니다.', points: user.points });
        }

        // Check streak (consecutive days)
        let newStreak = 1;
        if (lastAttendance) {
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            if (lastAttendance.getTime() === yesterday.getTime()) {
                newStreak = (user.attendanceStreak || 0) + 1;
            }
        }

        // Calculate points (Base 100 + Streak bonus)
        let basePoints = 100;
        if (username === 'xManager') {
            basePoints = 500000;
        }
        const streakBonus = Math.min(newStreak, 7) * 10; // Max 70 bonus
        const addedPoints = basePoints + streakBonus;

        user.points = (user.points || 0) + addedPoints;
        user.lastAttendance = new Date();
        user.attendanceStreak = newStreak;

        await user.save();

        res.json({
            success: true,
            message: `출석체크 완료! +${addedPoints}P`,
            points: user.points,
            streak: newStreak,
            addedPoints
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server Error' });
    }
});


// Shop Buy Endpoint
app.post('/api/shop/buy', async (req, res) => {
    console.log(`[POST /shop/buy] User: ${req.body?.username} Item: ${req.body?.itemId}`);
    const { username, itemId, cost, itemName } = req.body;
    try {
        const user = await User.findOne({ username });
        if (!user) return res.status(404).json({ error: 'User not found' });

        const currentPoints = user.points || 0;
        if (currentPoints < cost) return res.status(400).json({ error: '포인트가 부족합니다.' });

        // Check duplicate items
        const hasItem = user.inventory && user.inventory.some(i => i.itemId === itemId);
        if (hasItem) return res.status(400).json({ error: '이미 보유한 아이템입니다.' });

        user.points = currentPoints - cost;
        if (!user.inventory) user.inventory = [];
        user.inventory.push({ itemId, name: itemName });
        await user.save();

        res.json({ success: true, points: user.points, inventory: user.inventory });
    } catch (err) {
        console.error('[Shop Buy Error]', err);
        res.status(500).json({ error: '구매 실패' });
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
    console.log('[POST /posts] Body:', req.body);
    console.log('[POST /posts] File:', req.file);
    const { title, content, author, pollOption1, pollOption2 } = req.body;
    const imagePath = req.file ? req.file.path : null; // Cloudinary URL

    try {
        const postData = {
            title,
            content,
            imagePath,
            author: author || '익명',
            comments: []
        };

        // Handle Poll Creation
        if (pollOption1 && pollOption2) {
            postData.poll = {
                options: [
                    { text: pollOption1, votes: [] },
                    { text: pollOption2, votes: [] }
                ]
            };
        }

        const newPost = await Post.create(postData);
        res.status(201).json(newPost);
    } catch (err) {
        console.error(err);
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
            // Delete old image only if it's a local file
            if (post.imagePath && !post.imagePath.startsWith('http')) {
                const oldPath = path.join(__dirname, post.imagePath);
                if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
            }
            post.imagePath = req.file.path; // Cloudinary URL
        }

        await post.save();
        res.json(post);
    } catch (err) {
        res.status(500).json({ error: '오류가 발생했습니다.' });
    }
});

// ... (Post Routes)

app.post('/api/posts/:id/comments', async (req, res) => {
    console.log(`[POST /comments] Req: ${req.params.id}, User: ${req.body.username}`); // Log
    const { id } = req.params;
    const { username, content } = req.body;

    try {
        const post = await Post.findById(id);
        if (!post) {
            console.error('[POST /comments] Post not found');
            return res.status(404).json({ error: '게시물을 찾을 수 없습니다.' });
        }

        const newComment = {
            author: username || '익명',
            content,
            date: new Date()
        };
        post.comments.push(newComment);
        await post.save();
        console.log(`[POST /comments] Success`);
        res.status(201).json(post);
    } catch (err) {
        console.error('[POST /comments] Error:', err);
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

// ... (Delete Comment skipped for brevity, adding similar logs to Vote/Delete Post)

app.post('/api/posts/:id/vote', async (req, res) => {
    console.log(`[POST /vote] Req: ${req.params.id}, User: ${req.body.username}`); // Log
    const { id } = req.params;
    const { username, optionIndex } = req.body;

    try {
        const post = await Post.findById(id);
        if (!post || !post.poll) {
            console.error('[POST /vote] Post or Poll not found');
            return res.status(404).json({ error: '투표를 찾을 수 없습니다.' });
        }

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
        console.log(`[POST /vote] Success. New Counts: ${post.poll.options.map(o => o.votes.length)}`);
        res.json(post);
    } catch (err) {
        console.error('[POST /vote] Error:', err);
        res.status(500).json({ error: '오류가 발생했습니다.' });
    }
});

app.delete('/api/posts/:id', async (req, res) => {
    console.log(`[DELETE /posts] Req: ${req.params.id}, User: ${req.body.username}`); // Log
    const { id } = req.params;
    const { username } = req.body;

    try {
        const post = await Post.findById(id);
        if (!post) return res.status(404).json({ error: '게시물을 찾을 수 없습니다.' });

        const user = await User.findOne({ username });
        const isAdmin = user && (user.role === 'admin' || user.username === 'xManager');

        if (post.author !== username && !isAdmin) {
            console.error(`[DELETE /posts] Forbidden. Author: ${post.author}, Requester: ${username}`);
            return res.status(403).json({ error: '본인의 게시물만 삭제할 수 있습니다.' });
        }

        if (post.imagePath && !post.imagePath.startsWith('http')) {
            const fullPath = path.join(__dirname, post.imagePath);
            if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
        }

        await Post.deleteOne({ _id: id });
        console.log(`[DELETE /posts] Success`);
        res.json({ message: '게시물이 삭제되었습니다.' });
    } catch (err) {
        console.error('[DELETE /posts] Error:', err);
        res.status(500).json({ error: '오류가 발생했습니다.' });
    }
});

// Message Routes
app.get('/api/messages/:username', async (req, res) => {
    const { username } = req.params;
    try {
        const messages = await Message.find({
            $or: [{ from: username }, { to: username }]
        }).sort({ date: -1 });
        res.json(messages);
    } catch (err) {
        res.status(500).json({ error: '메시지를 불러오는데 실패했습니다.' });
    }
});

app.post('/api/messages', async (req, res) => {
    const { from, to, content } = req.body;
    try {
        const newMessage = await Message.create({ from, to, content });
        res.status(201).json(newMessage);
    } catch (err) {
        res.status(500).json({ error: '메시지 전송에 실패했습니다.' });
    }
});

app.put('/api/messages/:id/read', async (req, res) => {
    const { id } = req.params;
    try {
        const message = await Message.findByIdAndUpdate(
            id,
            { read: true },
            { new: true }
        );
        res.json(message);
    } catch (err) {
        res.status(500).json({ error: '오류가 발생했습니다.' });
    }
});

app.delete('/api/messages/:id', async (req, res) => {
    const { id } = req.params;
    const { username } = req.body;
    try {
        const message = await Message.findById(id);
        if (!message) {
            return res.status(404).json({ error: '메시지를 찾을 수 없습니다.' });
        }

        // Only allow deletion of own messages
        if (message.from !== username) {
            return res.status(403).json({ error: '본인이 보낸 메시지만 삭제할 수 있습니다.' });
        }

        await Message.deleteOne({ _id: id });
        res.json({ message: '메시지가 삭제되었습니다.' });
    } catch (err) {
        res.status(500).json({ error: '오류가 발생했습니다.' });
    }
});

// Group Chat Routes
app.post('/api/groupchats', async (req, res) => {
    const { name, members, createdBy } = req.body;
    try {
        const groupChat = await GroupChat.create({
            name,
            members,
            createdBy,
            messages: []
        });
        res.status(201).json(groupChat);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: '그룹 채팅 생성에 실패했습니다.' });
    }
});

app.get('/api/groupchats/:username', async (req, res) => {
    const { username } = req.params;
    try {
        const groupChats = await GroupChat.find({ members: username });
        res.json(groupChats);
    } catch (err) {
        res.status(500).json({ error: '그룹 채팅을 불러오는데 실패했습니다.' });
    }
});

app.post('/api/groupchats/:id/messages', async (req, res) => {
    const { id } = req.params;
    const { from, content } = req.body;
    try {
        const groupChat = await GroupChat.findById(id);
        if (!groupChat) {
            return res.status(404).json({ error: '그룹 채팅을 찾을 수 없습니다.' });
        }

        groupChat.messages.push({ from, content, date: new Date() });
        await groupChat.save();
        res.json(groupChat);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: '메시지 전송에 실패했습니다.' });
    }
});

app.post('/api/groupchats/:id/leave', async (req, res) => {
    const { id } = req.params;
    const { username } = req.body;
    try {
        const groupChat = await GroupChat.findById(id);
        if (!groupChat) {
            return res.status(404).json({ error: '그룹 채팅을 찾을 수 없습니다.' });
        }

        // Remove user from members
        groupChat.members = groupChat.members.filter(member => member !== username);

        // If no members left, delete the group
        if (groupChat.members.length === 0) {
            await GroupChat.deleteOne({ _id: id });
        } else {
            await groupChat.save();
        }

        res.json({ message: '채팅방을 나갔습니다.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: '오류가 발생했습니다.' });
    }
});

app.delete('/api/groupchats/:id', async (req, res) => {
    const { id } = req.params;
    const { username } = req.body;
    try {
        const groupChat = await GroupChat.findById(id);
        if (!groupChat) {
            return res.status(404).json({ error: '그룹 채팅을 찾을 수 없습니다.' });
        }

        // Only creator can delete
        if (groupChat.createdBy !== username) {
            return res.status(403).json({ error: '채팅방을 만든 사람만 삭제할 수 있습니다.' });
        }

        await GroupChat.deleteOne({ _id: id });
        res.json({ message: '채팅방이 삭제되었습니다.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: '오류가 발생했습니다.' });
    }
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('Unhandled Error:', err);
    if (err instanceof multer.MulterError) {
        return res.status(400).json({ error: `파일 업로드 오류: ${err.message}` });
    }
    res.status(500).json({ error: '서버 내부 오류가 발생했습니다.' });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
