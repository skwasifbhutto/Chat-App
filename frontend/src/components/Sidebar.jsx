import React, { useEffect } from 'react';
import { useChatStore } from '../store/useChatStore';

import SidebarSkeleton from './skeletons/SidebarSkeleton';
import { Users } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

function Sidebar() {
  const {
    getUsers,
    users,
    selectedUser,
    setSelectedUser,
    isUserLoading,
  } = useChatStore();
 const {onlineUsers}=useAuthStore();

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  if (isUserLoading) return <SidebarSkeleton />;

  return (
    <aside className="h-full w-20 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200">
      {/* Header */}
      <div className="border-b border-base-300 w-full p-5">
        <div className="flex items-center gap-2">
          <Users className="w-6 h-6" />
          <span className="font-medium hidden lg:block">Contacts</span>
        </div>
      </div>

      {/* Users List */}
      <div className="overflow-y-auto w-full py-3 flex-1">
        {users.map((user) => (
          <button
            key={user._id}
            onClick={() => setSelectedUser(user)}
            className={`w-full p-3 flex items-center gap-3 hover:bg-base-300 transition-colors ${
              selectedUser?._id === user._id ? 'bg-base-300 ring-1 ring-base-300' : ''
            }`}
          >
            {/* Profile Picture */}
            <div className="relative mx-auto lg:mx-0">
              <img
                src={user.profilePic||"/avatar.png"}
                alt={`${user.name}'s profile`}
                className="rounded-full w-12 h-12 object-cover"
              />
              {onlineUsers.includes(user._id)&&(
                <span className='absolute bottom-0 right-0 size-3 bg-green-500 rounded-full ring-2 ring-zinc-900'/>
              )

              }
            </div>

            {/* User Info */}
            <div className="hidden lg:block">
              <h2 className="font-medium">{user.fullName}</h2>
              <p className="text-sm text-base-content/50">{user.email}</p>
            </div>
          </button>
        ))}
      </div>
    </aside>
  );
}

export default Sidebar;
