'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
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
        <button
          onClick={logout}
          className="w-full mt-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors text-sm font-medium"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
