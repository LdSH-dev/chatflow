'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getUsers } from '@/lib/auth';
import { User, UserStatus } from '@/types';
import { useSocket } from '@/hooks/useSocket';
import { requestPresence } from '@/lib/socket';
import { useIsMobile } from '@/hooks/useMediaQuery';
import AuthForm from '@/components/AuthForm';
import ChatWindow from '@/components/ChatWindow';
import MobileChat from '@/components/MobileChat';

export default function Home() {
  const { user, loading, isAuthenticated, logout, refresh } = useAuth();
  const isMobile = useIsMobile();
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userStatuses, setUserStatuses] = useState<Map<number, boolean>>(new Map());

  // Handle user status updates
  const handleUserStatus = (status: UserStatus) => {
    console.log('Received user status update:', status);
    setUserStatuses(prev => {
      const newMap = new Map(prev);
      newMap.set(status.userId, status.online);
      console.log('Updated user statuses:', Array.from(newMap.entries()));
      return newMap;
    });
  };

  // Handle presence status responses
  const handlePresenceStatus = (data: { requestId: string; userId: number; presence: any }) => {
    console.log('Received presence status response:', data);
    setUserStatuses(prev => {
      const newMap = new Map(prev);
      newMap.set(data.userId, data.presence.online);
      console.log('Updated user statuses from presence:', Array.from(newMap.entries()));
      return newMap;
    });
  };

  // Initialize socket for status updates
  useSocket({
    onUserStatus: handleUserStatus,
    onPresenceStatus: handlePresenceStatus
  });

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      setShowAuth(true);
    } else if (!loading && isAuthenticated) {
      setShowAuth(false);
    }
  }, [loading, isAuthenticated]);

  useEffect(() => {
    async function loadUsers() {
      if (isAuthenticated) {
        setLoadingUsers(true);
        const users = await getUsers();
        setAvailableUsers(users);
        
        // Request initial status for each user
        users.forEach(availableUser => {
          requestPresence(availableUser.id);
        });
        
        setLoadingUsers(false);
      }
    }

    loadUsers();
  }, [isAuthenticated]);

  const handleAuthSuccess = () => {
    setShowAuth(false);
    // Refresh authentication status
    refresh();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (showAuth || !isAuthenticated) {
    return <AuthForm onSuccess={handleAuthSuccess} />;
  }

  const selectedUser = availableUsers.find(u => u.id === selectedUserId);

  // Mobile layout
  if (isMobile) {
    return <MobileChat onLogout={logout} />;
  }

  // Desktop layout
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-semibold text-gray-900">ChatFlow</h1>
                <p className="text-sm text-gray-500">Hello, {user?.username}!</p>
              </div>
              <button
                onClick={logout}
                className="text-gray-400 hover:text-gray-600"
                title="Logout"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            <div className="p-4">
              <h2 className="text-sm font-medium text-gray-900 mb-3">Available Users</h2>
              {loadingUsers ? (
                <div className="flex justify-center py-4">
                  <div className="text-sm text-gray-500">Loading users...</div>
                </div>
              ) : availableUsers.length === 0 ? (
                <div className="text-center py-4">
                  <div className="text-sm text-gray-500">No users found</div>
                  <div className="text-xs text-gray-400 mt-1">Register more users to chat</div>
                </div>
              ) : (
                <div className="space-y-2">
                  {availableUsers.map((availableUser) => (
                    <button
                      key={availableUser.id}
                      onClick={() => setSelectedUserId(availableUser.id)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        selectedUserId === availableUser.id
                          ? 'bg-primary-50 border-primary-200 border'
                          : 'hover:bg-gray-50 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                            {availableUser.username.charAt(0).toUpperCase()}
                          </div>
                          <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                            userStatuses.get(availableUser.id) ? 'bg-green-500' : 'bg-gray-400'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-900">{availableUser.username}</p>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              userStatuses.get(availableUser.id) 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              {userStatuses.get(availableUser.id) ? 'Online' : 'Offline'}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500">{availableUser.email}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedUser ? (
            <ChatWindow
              receiverId={selectedUser.id}
              receiverName={selectedUser.username}
              receiverOnline={userStatuses.get(selectedUser.id) || false}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No conversation selected</h3>
                <p className="mt-1 text-sm text-gray-500">Select a user from the sidebar to start chatting.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}