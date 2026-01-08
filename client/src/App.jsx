import React, { useState, useEffect } from 'react';
import PostList from './components/PostList';
import CreatePost from './components/CreatePost';
import PostDetail from './components/PostDetail';
import Login from './components/Login';
import Register from './components/Register';
import FindUsername from './components/FindUsername';
import ResetPassword from './components/ResetPassword';
import AdminDashboard from './components/AdminDashboard';
import DeleteAccount from './components/DeleteAccount';
import UserList from './components/UserList';
import Messages from './components/Messages';
import GroupChat from './components/GroupChat';
import GroupChatList from './components/GroupChatList';
import Profile from './components/Profile';
import UpdateChecker from './components/UpdateChecker';
import BottomNav from './components/BottomNav';
import { useAuth } from './context/AuthContext';
import AvatarSelector from './components/AvatarSelector';
import { API_URL } from './config';
import { getAvatarUrl } from './utils/avatar';

function App() {
  const [view, setView] = useState('home'); // 'home', 'create', 'detail', 'login', 'register', 'find-username', 'reset-password', 'delete-account', 'admin', 'users', 'messages', 'groupchat', 'groupchatlist'
  const [selectedPost, setSelectedPost] = useState(null);
  const [createPostProps, setCreatePostProps] = useState({});
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const { isLoggedIn, user, logout } = useAuth();

  // Check for unread messages every 5 seconds
  useEffect(() => {
    if (isLoggedIn && user) {
      const checkUnread = async () => {
        try {
          const res = await fetch(`${API_URL}/api/messages/${user.username}`);
          const messages = await res.json();
          const unread = messages.filter(m => m.to === user.username && !m.read).length;
          setUnreadCount(unread);
        } catch (err) {
          console.error('Failed to check unread messages:', err);
        }
      };

      checkUnread();
      const interval = setInterval(checkUnread, 5000);
      return () => clearInterval(interval);
    }
  }, [isLoggedIn, user]);

  const handlePostCreated = () => {
    setView('home');
    setCreatePostProps({});
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
    setCreatePostProps({}); // Reset props
    setView('create');
  };

  const handleCreatePollClick = () => {
    setCreatePostProps({ isPollMode: true });
    setView('create');
  };

  const handleEditClick = (post) => {
    setCreatePostProps({ post, isEditing: true });
    setView('create');
  };

  const handleNavigate = (navId) => {
    switch (navId) {
      case 'users':
        setView('users');
        break;
      case 'createChat':
        setView('groupchatlist');
        break;
      case 'search':
        // TODO: Implement search
        alert('검색 기능 준비 중입니다!');
        break;
      case 'createPost':
        handleCreateClick();
        break;
      case 'posts':
        setView('home');
        break;
      case 'autoUpdate':
        setView('update');
        break;
      case 'admin':
        setView('admin');
        break;
      case 'more':
        setView('profile');
        break;
      default:
        setView('home');
    }
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
          <a href="#" className="nav-link" onClick={handleCreatePollClick} style={{ color: '#1A237E', fontWeight: 'bold' }}>
            🗳️ 투표 만들기
          </a>
          <a href="#" className="nav-link" onClick={handleCreateClick}>
            글쓰기
          </a>
          <a
            href="#"
            className="nav-link"
            onClick={() => setView('users')}
            style={{ color: '#4CAF50', position: 'relative', display: 'inline-block' }}
          >
            👥 회원보기
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-8px',
                right: '-10px',
                backgroundColor: '#FF9800',
                color: 'white',
                borderRadius: '50%',
                padding: '2px 6px',
                fontSize: '0.7rem',
                fontWeight: 'bold',
                minWidth: '18px',
                textAlign: 'center'
              }}>
                {unreadCount}
              </span>
            )}
          </a>
          <a
            href="#"
            className="nav-link"
            onClick={() => setView('groupchatlist')}
            style={{ color: '#667eea' }}
          >
            💬 채팅방
          </a>

          {user.username === 'xManager' && (
            <a href="#" className="nav-link admin-link" onClick={() => setView('admin')} style={{ color: '#ff4444' }}>
              👑 관리자
            </a>
          )}

          <span className="nav-link user-info" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <img
              src={getAvatarUrl(user)}
              alt="avatar"
              style={{ width: '24px', height: '24px', borderRadius: '50%', border: '1px solid #ccc', cursor: 'pointer' }}
              onClick={() => setShowAvatarSelector(true)}
              title="아바타 변경하기"
            />
            {user.username}님
          </span>
          <a href="#" className="nav-link" onClick={() => setShowAvatarSelector(true)} style={{ fontSize: '0.8rem', color: '#666' }}>
            (아바타 변경)
          </a>
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
          <PostDetail
            post={selectedPost}
            onBack={handleBackToList}
            onPostUpdated={(updatedPost) => {
              setSelectedPost(updatedPost); // Update current view
            }}
          />
        ) : view === 'create' ? (
          <CreatePost onPostCreated={handlePostCreated} {...createPostProps} />
        ) : view === 'users' ? (
          <UserList
            onSelectUser={(user) => {
              setSelectedUser(user);
              setView('messages');
            }}
            onSelectGroup={(group) => {
              setSelectedGroup(group);
              setView('groupchat');
            }}
          />
        ) : view === 'messages' ? (
          <Messages selectedUser={selectedUser} onBack={() => setView('users')} />
        ) : view === 'groupchatlist' ? (
          <GroupChatList
            onSelectGroup={(group) => {
              setSelectedGroup(group);
              setView('groupchat');
            }}
            onBack={() => setView('home')}
          />
        ) : view === 'groupchat' ? (
          <GroupChat group={selectedGroup} onBack={() => setView('groupchatlist')} />
        ) : view === 'admin' && user.username === 'xManager' ? (
          <AdminDashboard />
        ) : view === 'delete-account' ? (
          <DeleteAccount onBack={() => setView('home')} onSuccess={() => setView('home')} />
        ) : view === 'profile' ? (
          <Profile onBack={() => setView('home')} />
        ) : view === 'update' ? (
          <UpdateChecker onBack={() => setView('home')} />
        ) : (
          <PostList onPostClick={handlePostClick} /> // Fallback
        )}
      </main>

      {showAvatarSelector && (
        <AvatarSelector
          onCancel={() => setShowAvatarSelector(false)}
          onSave={(newSeed) => {
            setShowAvatarSelector(false);
            window.location.reload();
          }}
        />
      )}

      {/* Bottom Navigation */}
      {isLoggedIn && (
        <BottomNav currentView={view} onNavigate={handleNavigate} />
      )}
    </div>
  );
}

export default App;
