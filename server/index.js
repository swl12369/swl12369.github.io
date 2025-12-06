const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Ensure db.json exists
const dbPath = path.join(__dirname, 'db.json');
if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify([]));
}

// Ensure users.json exists
const usersPath = path.join(__dirname, 'users.json');
if (!fs.existsSync(usersPath)) {
    fs.writeFileSync(usersPath, JSON.stringify([]));
}

// Multer Setup
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

// Auth Routes
app.post('/api/register', (req, res) => {
    const { username, password, securityQuestion, securityAnswer } = req.body;

    if (!username || !password || !securityQuestion || !securityAnswer) {
        return res.status(400).json({ error: '모든 필드를 입력해주세요.' });
    }

    const users = JSON.parse(fs.readFileSync(usersPath));

    // Check if user already exists
    if (users.find(u => u.username === username)) {
        return res.status(400).json({ error: '이미 존재하는 아이디입니다.' });
    }

    const newUser = {
        id: Date.now(),
        username,
        password, // In production, this should be hashed
        securityQuestion,
        securityAnswer: securityAnswer.toLowerCase().trim(),
        role: 'user',
        isApproved: false // Default to unapproved
    };

    users.push(newUser);
    fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));

    res.status(201).json({
        id: newUser.id,
        username: newUser.username,
        message: '회원가입이 완료되었습니다. 관리자 승인 대기 중입니다.'
    });
});

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: '아이디와 비밀번호를 입력해주세요.' });
    }

    const users = JSON.parse(fs.readFileSync(usersPath));
    const user = users.find(u => u.username === username && u.password === password);

    if (!user) {
        return res.status(401).json({ error: '아이디 또는 비밀번호가 올바르지 않습니다.' });
    }

    res.json({
        id: user.id,
        username: user.username,
        role: user.role || 'user',
        isApproved: user.isApproved === true, // Ensure boolean
        message: '로그인 성공!'
    });
});

// Admin User Management Routes
app.get('/api/admin/users', (req, res) => {
    // In a real app, verify admin session/token here
    const users = JSON.parse(fs.readFileSync(usersPath));
    // Filter out already approved users or list all? Let's list pending ones primarily, or all for management
    // Listing all for now, frontend can filter
    res.json(users);
});

app.post('/api/admin/approve', (req, res) => {
    const { username } = req.body;
    const users = JSON.parse(fs.readFileSync(usersPath));
    const userIndex = users.findIndex(u => u.username === username);

    if (userIndex === -1) {
        return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
    }

    users[userIndex].isApproved = true;
    fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));

    res.json({ message: '사용자가 승인되었습니다.' });
});

// Account Recovery Routes
app.post('/api/find-username', (req, res) => {
    const { securityQuestion, securityAnswer } = req.body;

    if (!securityQuestion || !securityAnswer) {
        return res.status(400).json({ error: '보안 질문과 답변을 입력해주세요.' });
    }

    const users = JSON.parse(fs.readFileSync(usersPath));
    const matchingUsers = users.filter(u =>
        u.securityQuestion === securityQuestion &&
        u.securityAnswer === securityAnswer.toLowerCase().trim()
    );

    if (matchingUsers.length === 0) {
        return res.status(404).json({ error: '일치하는 사용자를 찾을 수 없습니다.' });
    }

    res.json({
        usernames: matchingUsers.map(u => u.username),
        message: '아이디를 찾았습니다.'
    });
});

app.post('/api/reset-password', (req, res) => {
    const { username, securityQuestion, securityAnswer, newPassword } = req.body;

    if (!username || !securityQuestion || !securityAnswer || !newPassword) {
        return res.status(400).json({ error: '모든 필드를 입력해주세요.' });
    }

    const users = JSON.parse(fs.readFileSync(usersPath));
    const userIndex = users.findIndex(u =>
        u.username === username &&
        u.securityQuestion === securityQuestion &&
        u.securityAnswer === securityAnswer.toLowerCase().trim()
    );

    if (userIndex === -1) {
        return res.status(404).json({ error: '사용자 정보가 일치하지 않습니다.' });
    }

    users[userIndex].password = newPassword;
    fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));

    res.json({ message: '비밀번호가 성공적으로 변경되었습니다.' });
});

app.delete('/api/user', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: '아이디와 비밀번호를 입력해주세요.' });
    }

    const users = JSON.parse(fs.readFileSync(usersPath));
    const userIndex = users.findIndex(u => u.username === username && u.password === password);

    if (userIndex === -1) {
        return res.status(401).json({ error: '아이디 또는 비밀번호가 올바르지 않습니다.' });
    }

    // Remove user
    users.splice(userIndex, 1);
    fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));

    res.json({ message: '회원탈퇴가 완료되었습니다.' });
});

// Admin Authentication Routes
app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;
    console.log('Login attempt:', { username, password });

    if (!username || !password) {
        return res.status(400).json({ error: '아이디와 비밀번호를 입력해주세요.' });
    }

    const users = JSON.parse(fs.readFileSync(usersPath));
    const admin = users.find(u => u.username === 'irene');
    console.log('Found admin:', admin);

    if (!admin) {
        return res.status(401).json({ error: '관리자 계정이 설정되지 않았습니다.' });
    }

    if (username === admin.username && password === admin.password) {
        console.log('Login success');
        res.json({
            username: admin.username,
            message: '관리자 로그인 성공!'
        });
    } else {
        console.log('Login failed: password mismatch');
        res.status(401).json({ error: '아이디 또는 비밀번호가 올바르지 않습니다.' });
    }
});

app.get('/api/admin/security-question', (req, res) => {
    const users = JSON.parse(fs.readFileSync(usersPath));
    const admin = users.find(u => u.username === 'irene');

    if (!admin) {
        return res.status(404).json({ error: '관리자 계정을 찾을 수 없습니다.' });
    }

    res.json({ securityQuestion: admin.securityQuestion });
});

app.post('/api/admin/verify-security', (req, res) => {
    const { securityAnswer } = req.body;

    if (!securityAnswer) {
        return res.status(400).json({ error: '보안 질문 답변을 입력해주세요.' });
    }

    const users = JSON.parse(fs.readFileSync(usersPath));
    const admin = users.find(u => u.username === 'irene');

    if (!admin) {
        return res.status(404).json({ error: '관리자 계정을 찾을 수 없습니다.' });
    }

    if (admin.securityAnswer === securityAnswer.trim()) {
        res.json({
            username: admin.username,
            password: admin.password,
            message: '인증 성공!'
        });
    } else {
        res.status(401).json({ error: '보안 질문 답변이 올바르지 않습니다.' });
    }
});

// Post Routes
app.get('/api/posts', (req, res) => {
    const posts = JSON.parse(fs.readFileSync(dbPath));
    res.json(posts);
});

app.post('/api/posts', upload.single('image'), (req, res) => {
    const { title, content, author } = req.body;
    const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

    const newPost = {
        id: Date.now(),
        title,
        content,
        imagePath,
        author: author || '익명',
        date: new Date().toISOString()
    };

    const posts = JSON.parse(fs.readFileSync(dbPath));
    posts.unshift(newPost); // Add to beginning
    fs.writeFileSync(dbPath, JSON.stringify(posts, null, 2));

    res.status(201).json(newPost);
});

app.delete('/api/posts/:id', (req, res) => {
    const { id } = req.params;
    const { username } = req.body; // In a real app, get this from session/token

    const posts = JSON.parse(fs.readFileSync(dbPath));
    const postIndex = posts.findIndex(p => p.id === parseInt(id));

    if (postIndex === -1) {
        return res.status(404).json({ error: '게시물을 찾을 수 없습니다.' });
    }

    const post = posts[postIndex];

    // Check ownership or admin role
    const users = JSON.parse(fs.readFileSync(usersPath));
    const user = users.find(u => u.username === username);
    const isAdmin = user && (user.role === 'admin' || user.username === 'xManager');

    if (post.author !== username && !isAdmin) {
        return res.status(403).json({ error: '본인의 게시물만 삭제할 수 있습니다.' });
    }

    // Delete image if exists
    if (post.imagePath) {
        const fullPath = path.join(__dirname, post.imagePath);
        if (fs.existsSync(fullPath)) {
            try {
                fs.unlinkSync(fullPath);
            } catch (e) {
                console.error("Error deleting image:", e);
            }
        }
    }

    posts.splice(postIndex, 1);
    fs.writeFileSync(dbPath, JSON.stringify(posts, null, 2));

    res.json({ message: '게시물이 삭제되었습니다.' });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

