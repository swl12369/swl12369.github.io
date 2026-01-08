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
import LadderGame from './components/LadderGame';
import Gallery from './components/Gallery';
import RockPaperScissors from './components/RockPaperScissors';
import Roulette from './components/Roulette';
import Shop from './components/Shop';
import Calendar from './components/Calendar';
import TodoList from './components/TodoList';
import BottomNav from './components/BottomNav';
import TopNav from './components/TopNav'; // Import TopNav
import { useAuth } from './context/AuthContext';
import AvatarSelector from './components/AvatarSelector';
import { API_URL } from './config';
import { getAvatarUrl } from './utils/avatar';

function App() {
  const [view, setView] = useState('home');
  // Custom History Stack
  const [history, setHistory] = useState(['home']);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [selectedPost, setSelectedPost] = useState(null);
  const [createPostProps, setCreatePostProps] = useState({});
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const { isLoggedIn, user, logout, checkAttendance } = useAuth();
  const [attendanceChecked, setAttendanceChecked] = useState(false);
  const [isV2Unlocked, setIsV2Unlocked] = useState(localStorage.getItem('isV2Unlocked') === 'true');
  const [unreadCount, setUnreadCount] = useState(0);

  // Navigation Helper with History
  const navigate = (newView) => {
    if (newView === view) return;

    // Discard future history if we navigate to a new page
    const newHistory = history.slice(0, currentIndex + 1);
    newHistory.push(newView);
    setHistory(newHistory);
    setCurrentIndex(newHistory.length - 1);
    setView(newView);
  };

  const goBack = () => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      setView(history[newIndex]);
    }
  };

  const goForward = () => {
    if (currentIndex < history.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      setView(history[newIndex]);
    }
  };

  const goHome = () => {
    // If Home is already in history, we could jump back, but simpler to just push new home
    navigate('home');
  };

  const enableV2 = () => {
    setIsV2Unlocked(true);
    localStorage.setItem('isV2Unlocked', 'true');
    alert('🎉 Version 2 업데이트 완료!\n새로운 기능이 추가되었습니다:\n- 포인트 시스템 💰\n- 출석체크 📅\n- 사다리 타기 게임 🎢');
  };

  // Auto Attendance Check (Only if V2 is unlocked)
  useEffect(() => {
    if (isLoggedIn && user && !attendanceChecked && isV2Unlocked) {
      const doCheck = async () => {
        const result = await checkAttendance(user.username);
        if (result && result.success) {
          alert(`📅 ${result.message}\n현재 포인트: ${result.points}P (연속 ${result.streak}일)`);
        }
        setAttendanceChecked(true);
      };
      doCheck();
    }
  }, [isLoggedIn, user, attendanceChecked, checkAttendance, isV2Unlocked]);

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
    navigate('home');
    setCreatePostProps({});
  };

  const handlePostClick = (post) => {
    setSelectedPost(post);
    navigate('detail');
  };

  const handleBackToList = () => {
    setSelectedPost(null);
    navigate('home');
  };

  const handleLoginSuccess = () => {
    setHistory(['home']); // Reset history on login
    setCurrentIndex(0);
    setView('home');
  };

  const handleRegisterSuccess = () => {
    navigate('home');
  };

  const handleCreateClick = () => {
    setCreatePostProps({});
    navigate('create');
  };

  const handleCreatePollClick = () => {
    setCreatePostProps({ isPollMode: true });
    navigate('create');
  };

  const handleEditClick = (post) => {
    setCreatePostProps({ post, isEditing: true });
    navigate('create');
  };

  const handleBottomNavNavigate = (navId) => {
    switch (navId) {
      case 'users':
        navigate('users');
        break;
      case 'createChat':
        navigate('users'); // Reuse users view for chat creation selection
        break;
      case 'chatList':
        navigate('groupchatlist');
        break;
      case 'search':
        alert('검색 기능 준비 중입니다!');
        break;
      case 'vote':
        handleCreatePollClick();
        break;
      case 'posts':
        handleCreateClick();
        break;
      case 'autoUpdate':
        navigate('update');
        break;
      case 'admin':
        navigate('admin');
        break;
      case 'more':
        navigate('profile');
        break;
      case 'gallery':
        navigate('gallery');
        break;
      case 'ladder-game': navigate('ladder-game'); break;
      case 'rock-paper-scissors': navigate('rock-paper-scissors'); break;
      case 'roulette': navigate('roulette'); break;
      case 'shop': navigate('shop'); break;
      case 'calendar': navigate('calendar'); break;
      case 'todo': navigate('todo'); break;
      default:
        navigate('home');
    }
  };

  const handleLogout = () => {
    logout();
    setHistory(['home']); // Reset history
    setCurrentIndex(0);
    setView('home');
  };

  // 1. If not logged in -> Only show Login/Register/Recovery
  if (!isLoggedIn) {
    if (view === 'register') return <Register onSuccess={handleRegisterSuccess} />;
    if (view === 'find-username') return <FindUsername onBack={() => setView('login')} />;
    if (view === 'reset-password') return <ResetPassword onBack={() => setView('login')} onSuccess={() => setView('login')} />;

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
      {/* Top Navigation for History Control */}
      <TopNav
        onBack={goBack}
        onForward={goForward}
        onHome={goHome}
        canGoBack={currentIndex > 0}
        canGoForward={currentIndex < history.length - 1}
      />

      <main>
        {view === 'home' ? (
          <PostList key={Date.now()} onPostClick={handlePostClick} />
        ) : view === 'detail' ? (
          <PostDetail
            post={selectedPost}
            onBack={handleBackToList}
            onPostUpdated={(updatedPost) => {
              setSelectedPost(updatedPost);
            }}
          />
        ) : view === 'create' ? (
          <CreatePost onPostCreated={handlePostCreated} {...createPostProps} />
        ) : view === 'users' ? (
          <UserList
            onSelectUser={(user) => {
              setSelectedUser(user);
              navigate('messages');
            }}
            onSelectGroup={(group) => {
              setSelectedGroup(group);
              navigate('groupchat');
            }}
          />
        ) : view === 'messages' ? (
          <Messages selectedUser={selectedUser} onBack={() => navigate('users')} />
        ) : view === 'groupchatlist' ? (
          <GroupChatList
            onSelectGroup={(group) => {
              setSelectedGroup(group);
              navigate('groupchat');
            }}
            onBack={() => navigate('home')}
          />
        ) : view === 'groupchat' ? (
          <GroupChat group={selectedGroup} onBack={() => navigate('groupchatlist')} isV2Unlocked={isV2Unlocked} />
        ) : view === 'admin' && user.username === 'xManager' ? (
          // Admin Dashboard might need its own back/nav, but for now it's a view
          <AdminDashboard />
        ) : view === 'delete-account' ? (
          <DeleteAccount onBack={() => navigate('home')} onSuccess={() => navigate('home')} />
        ) : view === 'reset-password' ? (
          <ResetPassword onBack={() => navigate('profile')} onSuccess={() => navigate('home')} />
        ) : view === 'profile' ? (
          <Profile
            onBack={() => navigate('home')}
            onNavigate={navigate} // Pass navigate instead of setView
            onShowAvatar={() => setShowAvatarSelector(true)}
            isV2Unlocked={isV2Unlocked}
          />
        ) : view === 'ladder-game' ? (
          <LadderGame onBack={() => navigate('profile')} />
        ) : view === 'gallery' ? (
          <Gallery onBack={() => navigate('home')} />
        ) : view === 'rock-paper-scissors' ? (
          <RockPaperScissors onBack={() => navigate('profile')} />
        ) : view === 'roulette' ? (
          <Roulette onBack={() => navigate('profile')} />
        ) : view === 'shop' ? (
          <Shop onBack={() => navigate('profile')} />
        ) : view === 'calendar' ? (
          <Calendar onBack={() => navigate('profile')} />
        ) : view === 'todo' ? (
          <TodoList onBack={() => navigate('profile')} />
        ) : view === 'update' ? (
          <UpdateChecker
            onBack={() => navigate('home')}
            onUpdateV2={enableV2}
            isV2Unlocked={isV2Unlocked}
          />
        ) : (
          <PostList onPostClick={handlePostClick} />
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
        <BottomNav currentView={view} onNavigate={handleBottomNavNavigate} isV2Unlocked={isV2Unlocked} />
      )}
    </div>
  );
}

export default App;
