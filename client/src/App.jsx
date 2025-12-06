import React, { useState } from 'react';
import PostList from './components/PostList';
import CreatePost from './components/CreatePost';
import PostDetail from './components/PostDetail';
import Login from './components/Login';
import Register from './components/Register';
import FindUsername from './components/FindUsername';
import ResetPassword from './components/ResetPassword';
import AdminDashboard from './components/AdminDashboard';
import DeleteAccount from './components/DeleteAccount';
import { useAuth } from './context/AuthContext';

function App() {
  const [view, setView] = useState('home'); // 'home', 'create', 'detail', 'login', 'register', 'find-username', 'reset-password', 'delete-account', 'admin'
  const [selectedPost, setSelectedPost] = useState(null);
  const { isLoggedIn, user, logout } = useAuth();

  const handlePostCreated = () => {
    setView('home');
  };

  const handlePostClick = (post) => {
    setSelectedPost(post);
    setView('detail');
  };

  const handleBackToList = () => {
    setSelectedPost(null);
    setView('home');
  };

  const handleLoginSuccess = () => {
    setView('home');
  };

  const handleRegisterSuccess = () => {
    setView('home');
  };

  const handleCreateClick = () => {
    setView('create');
  };

  const handleLogout = () => {
    logout();
    setView('home');
  };

  // 1. If not logged in -> Only show Login/Register/Recovery
  if (!isLoggedIn) {
    if (view === 'register') return <Register onSuccess={handleRegisterSuccess} />;
    if (view === 'find-username') return <FindUsername onBack={() => setView('login')} />;
    if (view === 'reset-password') return <ResetPassword onBack={() => setView('login')} onSuccess={() => setView('login')} />;

    // Default to Login view if not in specific auth view
    return <Login
      onSuccess={handleLoginSuccess}
      onFindUsername={() => setView('find-username')}
      onResetPassword={() => setView('reset-password')}
      onRegisterClick={() => setView('register')}
    />;
  }

  // 2. If logged in but NOT approved -> Show Pending Screen
  if (isLoggedIn && !user.isApproved) {
    return (
      <div className="container" style={{ textAlign: 'center', marginTop: '50px' }}>
        <h2>⏳ 승인 대기 중</h2>
        <p>관리자(xManager)의 승인이 필요합니다.</p>
        <p>승인이 완료될 때까지 기다려주세요.</p>
        <button onClick={handleLogout} className="btn btn-secondary">로그아웃</button>
      </div>
    );
  }

  // 3. Approved User / Admin Access
  return (
    <div className="container">
      <header className="header">
        <a href="#" className="logo" onClick={() => { setView('home'); setSelectedPost(null); }}>
          Family Board
        </a>
        <nav>
          <a href="#" className="nav-link" onClick={() => { setView('home'); setSelectedPost(null); }}>
            홈
          </a>
          <a href="#" className="nav-link" onClick={handleCreateClick}>
            글쓰기
          </a>

          {user.username === 'xManager' && (
            <a href="#" className="nav-link admin-link" onClick={() => setView('admin')} style={{ color: '#ff4444' }}>
              👑 관리자
            </a>
          )}

          <span className="nav-link user-info">{user.username}님</span>
          <a href="#" className="nav-link" onClick={() => setView('delete-account')}>
            회원탈퇴
          </a>
          <a href="#" className="nav-link" onClick={handleLogout}>
            로그아웃
          </a>
        </nav>
      </header>

      <main>
        {view === 'home' ? (
          <PostList key={Date.now()} onPostClick={handlePostClick} />
        ) : view === 'detail' ? (
          <PostDetail post={selectedPost} onBack={handleBackToList} />
        ) : view === 'create' ? (
          <CreatePost onPostCreated={handlePostCreated} />
        ) : view === 'admin' && user.username === 'xManager' ? (
          <AdminDashboard />
        ) : view === 'delete-account' ? (
          <DeleteAccount onBack={() => setView('home')} onSuccess={() => setView('home')} />
        ) : (
          <PostList onPostClick={handlePostClick} /> // Fallback
        )}
      </main>
    </div>
  );
}


export default App;
