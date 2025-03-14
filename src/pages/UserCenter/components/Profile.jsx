import React, { useState } from 'react';
import { User, Camera, Mail, Phone, MapPin, Calendar, Briefcase } from 'lucide-react';

const Profile = ({ userInfo, onUpdateProfile }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    username: userInfo?.username || '',
    email: userInfo?.email || '',
    phone: userInfo?.phone || '',
    location: userInfo?.location || '',
    birthday: userInfo?.birthday || '',
    occupation: userInfo?.occupation || '',
    bio: userInfo?.bio || ''
  });

  const handleEditSubmit = (e) => {
    e.preventDefault();
    onUpdateProfile(editForm);
    setIsEditing(false);
  };

  const handleAvatarChange = (e) => {
    // 处理头像上传逻辑
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditForm({...editForm, avatar: reader.result});
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
        <div className="relative group">
          <img 
            src={editForm.avatar || userInfo.avatar} 
            alt="用户头像" 
            className="w-28 h-28 rounded-full object-cover border-4 border-blue-500/30"
          />
          {isEditing && (
            <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full cursor-pointer group-hover:opacity-100 transition-opacity">
              <Camera className="h-8 w-8 text-white" />
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleAvatarChange}
              />
            </label>
          )}
        </div>
        <div className="flex-1">
          <h3 className="text-2xl font-bold text-white">{userInfo.username}</h3>
          <p className="text-gray-400 flex items-center gap-2 mt-1">
            <Mail className="h-4 w-4" /> {userInfo.email}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm">
              游戏玩家
            </span>
            <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm">
              收藏家
            </span>
          </div>
        </div>
      </div>

      <form onSubmit={handleEditSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-300 mb-1 flex items-center gap-2">
            <User className="h-4 w-4" /> 用户名
          </label>
          <input
            type="text"
            value={editForm.username}
            onChange={(e) => setEditForm({...editForm, username: e.target.value})}
            disabled={!isEditing}
            className="w-full px-4 py-2 bg-[#2a475e]/50 border border-gray-600 
              rounded-lg text-white focus:outline-none focus:border-blue-500
              disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-300 mb-1 flex items-center gap-2">
            <Mail className="h-4 w-4" /> 邮箱
          </label>
          <input
            type="email"
            value={editForm.email}
            onChange={(e) => setEditForm({...editForm, email: e.target.value})}
            disabled={!isEditing}
            className="w-full px-4 py-2 bg-[#2a475e]/50 border border-gray-600 
              rounded-lg text-white focus:outline-none focus:border-blue-500
              disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-300 mb-1 flex items-center gap-2">
            <Phone className="h-4 w-4" /> 手机号码
          </label>
          <input
            type="tel"
            value={editForm.phone}
            onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
            disabled={!isEditing}
            className="w-full px-4 py-2 bg-[#2a475e]/50 border border-gray-600 
              rounded-lg text-white focus:outline-none focus:border-blue-500
              disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-300 mb-1 flex items-center gap-2">
            <MapPin className="h-4 w-4" /> 所在地区
          </label>
          <input
            type="text"
            value={editForm.location}
            onChange={(e) => setEditForm({...editForm, location: e.target.value})}
            disabled={!isEditing}
            className="w-full px-4 py-2 bg-[#2a475e]/50 border border-gray-600 
              rounded-lg text-white focus:outline-none focus:border-blue-500
              disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-300 mb-1 flex items-center gap-2">
            <Calendar className="h-4 w-4" /> 生日
          </label>
          <input
            type="date"
            value={editForm.birthday}
            onChange={(e) => setEditForm({...editForm, birthday: e.target.value})}
            disabled={!isEditing}
            className="w-full px-4 py-2 bg-[#2a475e]/50 border border-gray-600 
              rounded-lg text-white focus:outline-none focus:border-blue-500
              disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-300 mb-1 flex items-center gap-2">
            <Briefcase className="h-4 w-4" /> 职业
          </label>
          <input
            type="text"
            value={editForm.occupation}
            onChange={(e) => setEditForm({...editForm, occupation: e.target.value})}
            disabled={!isEditing}
            className="w-full px-4 py-2 bg-[#2a475e]/50 border border-gray-600 
              rounded-lg text-white focus:outline-none focus:border-blue-500
              disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>
        <div className="md:col-span-2">
          <label className="text-sm font-medium text-gray-300 mb-1 block">
            个人简介
          </label>
          <textarea
            value={editForm.bio}
            onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
            disabled={!isEditing}
            rows={4}
            className="w-full px-4 py-2 bg-[#2a475e]/50 border border-gray-600 
              rounded-lg text-white focus:outline-none focus:border-blue-500
              disabled:opacity-50 disabled:cursor-not-allowed resize-none"
          />
        </div>
        <div className="md:col-span-2 flex space-x-4">
          {isEditing ? (
            <>
              <button
                type="submit"
                className="flex-1 py-2 bg-gradient-to-r from-blue-500 to-purple-500 
                  rounded-lg text-white font-medium hover:from-blue-600 hover:to-purple-600
                  transition-all duration-300 transform hover:scale-105"
              >
                保存修改
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setEditForm({
                    username: userInfo.username,
                    email: userInfo.email,
                    phone: userInfo.phone || '',
                    location: userInfo.location || '',
                    birthday: userInfo.birthday || '',
                    occupation: userInfo.occupation || '',
                    bio: userInfo.bio || ''
                  });
                }}
                className="flex-1 py-2 bg-gray-600 hover:bg-gray-700 
                  rounded-lg text-white font-medium transition-all duration-300"
              >
                取消
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="w-full py-2 bg-gradient-to-r from-blue-500 to-purple-500 
                rounded-lg text-white font-medium hover:from-blue-600 hover:to-purple-600
                transition-all duration-300 transform hover:scale-105"
            >
              编辑信息
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default Profile; 