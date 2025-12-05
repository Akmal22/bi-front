'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { incubatorsApi } from '@/lib/api/incubators';
import { countriesApi } from '@/lib/api/countries';
import { usersApi } from '@/lib/api/users';
import { Card } from '@/components/ui/Card';

export default function DashboardPage() {
  const { user } = useAuth();
  const [incubatorsCount, setIncubatorsCount] = useState<number | null>(null);
  const [countriesCount, setCountriesCount] = useState<number | null>(null);
  const [usersCount, setUsersCount] = useState<number | null>(null);

  useEffect(() => {
    // Only fetch incubators count for admin and manager roles
    if (user?.role === 'ADMIN' || user?.role === 'MANAGER') {
      loadIncubatorsCount();
    }
    // Fetch countries count for all authenticated users
    if (user) {
      loadCountriesCount();
    }
    // Only fetch users count for admin role
    if (user?.role === 'ADMIN') {
      loadUsersCount();
    }
  }, [user]);

  const loadIncubatorsCount = async () => {
    try {
      const response = await incubatorsApi.getIncubators({ page: 0, size: 1 });
      setIncubatorsCount(response.totalElements);
    } catch (error: any) {
      console.error('Failed to load incubators count:', error);
      // Silently handle error - don't show modal, just set count to 0
      setIncubatorsCount(0);
    }
  };

  const loadCountriesCount = async () => {
    try {
      const response = await countriesApi.getCountries();
      setCountriesCount(response.countries?.length || 0);
    } catch (error: any) {
      console.error('Failed to load countries count:', error);
      // Silently handle error - don't show modal, just set count to 0
      setCountriesCount(0);
    }
  };

  const loadUsersCount = async () => {
    try {
      const response = await usersApi.getUsers({ page: 0, size: 1 });
      setUsersCount(response.totalElements);
    } catch (error: any) {
      console.error('Failed to load users count:', error);
      // Silently handle error - don't show modal, just set count to 0
      setUsersCount(0);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome back, {user?.username}!</h1>
        <p className="text-gray-600">Here's an overview of your business incubator analytics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
          <div className="text-4xl mb-2">🏢</div>
          <h3 className="text-lg font-semibold mb-1">Incubators</h3>
          <p className="text-3xl font-bold">
            {user?.role === 'ADMIN' || user?.role === 'MANAGER' 
              ? (incubatorsCount !== null ? incubatorsCount : '-')
              : '-'}
          </p>
          <p className="text-blue-100 text-sm mt-2">Total managed</p>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
          <div className="text-4xl mb-2">📈</div>
          <h3 className="text-lg font-semibold mb-1">Reports</h3>
          <p className="text-3xl font-bold">
            {user?.role === 'ADMIN' || user?.role === 'MANAGER' 
              ? (incubatorsCount !== null ? incubatorsCount : '-')
              : '-'}
          </p>
          <p className="text-green-100 text-sm mt-2">Available reports</p>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
          <div className="text-4xl mb-2">🌍</div>
          <h3 className="text-lg font-semibold mb-1">Countries</h3>
          <p className="text-3xl font-bold">
            {countriesCount !== null ? countriesCount : '-'}
          </p>
          <p className="text-purple-100 text-sm mt-2">Active regions</p>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
          <div className="text-4xl mb-2">👥</div>
          <h3 className="text-lg font-semibold mb-1">Users</h3>
          <p className="text-3xl font-bold">
            {user?.role === 'ADMIN' 
              ? (usersCount !== null ? usersCount : '-')
              : '-'}
          </p>
          <p className="text-orange-100 text-sm mt-2">System users</p>
        </Card>
      </div>

      <Card title="Quick Actions">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/reports" className="p-4 border-2 border-blue-200 rounded-lg hover:bg-blue-50 transition-colors text-left block">
            <div className="text-2xl mb-2">📊</div>
            <h4 className="font-semibold text-gray-800">Generate Report</h4>
            <p className="text-sm text-gray-600">Create analytics report</p>
          </Link>
          {user?.role === 'ADMIN' && (
            <>
              <Link href="/admin/incubators" className="p-4 border-2 border-green-200 rounded-lg hover:bg-green-50 transition-colors text-left block">
                <div className="text-2xl mb-2">🏢</div>
                <h4 className="font-semibold text-gray-800">Manage Incubators</h4>
                <p className="text-sm text-gray-600">Add or edit incubators</p>
              </Link>
              <Link href="/admin/users" className="p-4 border-2 border-purple-200 rounded-lg hover:bg-purple-50 transition-colors text-left block">
                <div className="text-2xl mb-2">👥</div>
                <h4 className="font-semibold text-gray-800">Manage Users</h4>
                <p className="text-sm text-gray-600">User administration</p>
              </Link>
            </>
          )}
          {(user?.role === 'ADMIN' || user?.role === 'MANAGER') && (
            <Link href="/admin/incubators" className="p-4 border-2 border-green-200 rounded-lg hover:bg-green-50 transition-colors text-left block">
              <div className="text-2xl mb-2">🏢</div>
              <h4 className="font-semibold text-gray-800">Manage Incubators</h4>
              <p className="text-sm text-gray-600">Add or edit incubators</p>
            </Link>
          )}
        </div>
      </Card>
    </div>
  );
}
