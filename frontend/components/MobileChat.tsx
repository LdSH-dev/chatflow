'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getUsers } from '@/lib/auth';
import { User, UserStatus } from '@/types';
import { useSocket } from '@/hooks/useSocket';
import { requestPresence } from '@/lib/socket';
import { useKeyboard } from '@/hooks/useKeyboard';
import AuthForm from './AuthForm';
import ChatWindow from './ChatWindow';

type TabType = 'users' | 'chat';

interface MobileChatProps {
  onLogout: () => void;
}

export default function MobileChat({ onLogout }: MobileChatProps) {
  const { user } = useAuth();
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userStatuses, setUserStatuses] = useState<Map<number, boolean>>(new Map());
  const [activeTab, setActiveTab] = useState<TabType>('users');
  const { isKeyboardOpen } = useKeyboard();

  // Handle user status updates
  const handleUserStatus = (status: UserStatus) => {
    console.log('Received user status update:', status);
    setUserStatuses(prev => {
      const newMap = new Map(prev);
      newMap.set(status.userId, status.online);
      return newMap;
    });
  };

  // Handle presence status responses
  const handlePresenceStatus = (data: { requestId: string; userId: number; presence: any }) => {
    console.log('Received presence status response:', data);
    setUserStatuses(prev => {
      const newMap = new Map(prev);
      newMap.set(data.userId, data.presence.online);
      return newMap;
    });
  };

  // Initialize socket for status updates
  useSocket({
    onUserStatus: handleUserStatus,
    onPresenceStatus: handlePresenceStatus
  });

  useEffect(() => {
    async function loadUsers() {
      setLoadingUsers(true);
      const users = await getUsers();
      setAvailableUsers(users);
      
      // Request initial status for each user
      users.forEach(availableUser => {
        requestPresence(availableUser.id);
      });
      
      setLoadingUsers(false);
    }

    loadUsers();
  }, []);

  const handleUserSelect = (userId: number) => {
    setSelectedUserId(userId);
    setActiveTab('chat');
  };

  const handleBackToUsers = () => {
    setActiveTab('users');
  };

  const selectedUser = availableUsers.find(u => u.id === selectedUserId);

  return (
    <div className={`mobile-container bg-gray-100 ${isKeyboardOpen ? 'keyboard-open' : ''}`}>
      {/* Header - Hide when keyboard is open in chat mode */}
      {(!isKeyboardOpen || activeTab === 'users') && (
        <div className="bg-white border-b border-gray-200 px-4 py-3 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {activeTab === 'chat' && (
                <button
                  onClick={handleBackToUsers}
                  className="text-gray-600 hover:text-gray-800"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              )}
              <div>
                <h1 className="text-lg font-semibold text-gray-900">ChatFlow</h1>
                <p className="text-sm text-gray-500">Hello, {user?.username}!</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="text-gray-400 hover:text-gray-600 p-2"
              title="Logout"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="mobile-content">
        {activeTab === 'users' ? (
          <div className="h-full bg-white">
            <div className="p-4">
              <h2 className="text-sm font-medium text-gray-900 mb-4">Available Users</h2>
              {loadingUsers ? (
                <div className="flex justify-center py-8">
                  <div className="text-sm text-gray-500">Loading users...</div>
                </div>
              ) : availableUsers.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-sm text-gray-500">No users found</div>
                  <div className="text-xs text-gray-400 mt-1">Register more users to chat</div>
                </div>
              ) : (
                <div className="space-y-3">
                  {availableUsers.map((availableUser) => (
                    <button
                      key={availableUser.id}
                      onClick={() => handleUserSelect(availableUser.id)}
                      className="w-full text-left p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-200"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center text-white text-lg font-medium">
                            {availableUser.username.charAt(0).toUpperCase()}
                          </div>
                          <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                            userStatuses.get(availableUser.id) ? 'bg-green-500' : 'bg-gray-400'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-base font-medium text-gray-900">{availableUser.username}</p>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              userStatuses.get(availableUser.id) 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              {userStatuses.get(availableUser.id) ? 'Online' : 'Offline'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500">{availableUser.email}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col">
            {selectedUser ? (
              <div className="flex-1 flex flex-col">
                <ChatWindow
                  receiverId={selectedUser.id}
                  receiverName={selectedUser.username}
                  receiverOnline={userStatuses.get(selectedUser.id) || false}
                />
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No conversation selected</h3>
                  <p className="mt-1 text-sm text-gray-500">Select a user to start chatting.</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Navigation - Hide when keyboard is open */}
      {!isKeyboardOpen && (
        <div className="bg-white border-t border-gray-200 flex-shrink-0">
          <div className="flex">
            <button
              onClick={() => setActiveTab('users')}
              className={`flex-1 flex flex-col items-center py-3 px-4 ${
                activeTab === 'users' ? 'text-primary-600 bg-primary-50' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="text-xs font-medium">Users</span>
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex-1 flex flex-col items-center py-3 px-4 ${
                activeTab === 'chat' ? 'text-primary-600 bg-primary-50' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span className="text-xs font-medium">Chat</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 