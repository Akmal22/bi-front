'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { authApi } from '@/lib/api/auth';
import { Modal } from '@/components/ui/Modal';
import type { UserRole } from '@/lib/types';

interface NavItem {
  label: string;
  href: string;
  icon: string;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: '📊', roles: ['ADMIN', 'MANAGER'] },
  { label: 'Users', href: '/admin/users', icon: '👥', roles: ['ADMIN'] },
  { label: 'Countries', href: '/admin/countries', icon: '🌍', roles: ['ADMIN'] },
  { label: 'Incubators', href: '/admin/incubators', icon: '🏢', roles: ['ADMIN', 'MANAGER'] },
  { label: 'Reports', href: '/reports', icon: '📈', roles: ['ADMIN', 'MANAGER', 'USER'] },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [changePasswordError, setChangePasswordError] = useState('');
  const [changePasswordSuccess, setChangePasswordSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangePasswordError('');
    setChangePasswordSuccess(false);
    setIsSubmitting(true);
    try {
      await authApi.changePassword(currentPassword, newPassword);
      setChangePasswordSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setTimeout(() => {
        handleCloseModal();
        logout();
      }, 1000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to change password';
      setChangePasswordError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setShowChangePassword(false);
    setCurrentPassword('');
    setNewPassword('');
    setChangePasswordError('');
    setChangePasswordSuccess(false);
  };

  const filteredNavItems = navItems.filter((item) =>
    user?.role && item.roles.includes(user.role)
  );

  return (
    <div className="w-64 bg-gradient-to-b from-blue-900 to-indigo-900 text-white min-h-screen flex flex-col">
      <div className="p-6 border-b border-blue-800">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <span className="text-3xl">🌱</span>
          <span>BizNest</span>
        </h1>
        <p className="text-blue-200 text-sm mt-1">Business Incubator Analyzer</p>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {filteredNavItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? 'bg-blue-700 shadow-lg'
                      : 'hover:bg-blue-800'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-blue-800">
        <div className="px-4 py-2 text-sm">
          <p className="font-semibold">{user?.username}</p>
          <p className="text-blue-200 text-xs">{user?.role}</p>
        </div>
        {user && (
          <button
            onClick={() => setShowChangePassword(true)}
            className="w-full mt-2 px-4 py-2 bg-blue-700 hover:bg-blue-600 rounded-lg transition-colors text-sm font-medium"
          >
            Change Password
          </button>
        )}
        <button
          onClick={logout}
          className="w-full mt-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors text-sm font-medium"
        >
          Logout
        </button>
      </div>

      <Modal isOpen={showChangePassword} onClose={handleCloseModal} title="Change Password">
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
          {changePasswordError && (
            <p className="text-red-600 text-sm">{changePasswordError}</p>
          )}
          {changePasswordSuccess && (
            <p className="text-green-600 text-sm">Password changed successfully.</p>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleCloseModal}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg transition-colors"
            >
              {isSubmitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
