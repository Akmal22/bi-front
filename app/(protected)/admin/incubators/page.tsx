'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { incubatorsApi } from '@/lib/api/incubators';
import { countriesApi } from '@/lib/api/countries';
import { usersApi } from '@/lib/api/users';
import type { SimpleIncubator, Country, User } from '@/lib/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Table } from '@/components/ui/Table';
import Link from 'next/link';

export default function AdminIncubatorsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [incubators, setIncubators] = useState<SimpleIncubator[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (user?.role === 'ADMIN' || user?.role === 'MANAGER') {
      loadIncubators();
    } else {
      setIsLoading(false);
    }
  }, [page, user]);

  const loadIncubators = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await incubatorsApi.getIncubators({ page, size: 10 });
      setIncubators(response.incubators || []);
      setTotalPages(response.totalPages || 0);
    } catch (error: any) {
      console.error('Failed to load incubators:', error);
      setError(error?.message || 'Failed to load incubators');
      setIncubators([]);
      setTotalPages(0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = () => {
    router.push('/admin/incubators/new');
  };

  if (user?.role !== 'ADMIN' && user?.role !== 'MANAGER') {
    return <div className="p-6">Access denied. Admin or Manager only.</div>;
  }

  if (isLoading) {
    return <div className="p-6">Loading incubators...</div>;
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Incubator Management</h1>
        <Button onClick={handleCreate}>+ Add Incubator</Button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <Card>
        {incubators.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500 text-lg">No incubators found.</p>
            <Button onClick={handleCreate} className="mt-4">+ Add First Incubator</Button>
          </div>
        ) : (
          <>
            <Table headers={['Name', 'Description', 'Founded', 'Actions']}>
              {incubators.map((incubator) => (
                <tr key={incubator.incubatorUuid} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{incubator.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-md truncate">{incubator.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(incubator.founded).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <Link href={`/admin/incubators/${incubator.incubatorUuid}`}>
                      <Button size="sm" variant="outline">View/Edit</Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </Table>

            {totalPages > 1 && (
              <div className="mt-4 flex justify-between items-center">
                <p className="text-sm text-gray-600">
                  Page {page + 1} of {totalPages}
                </p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0}>
                    Previous
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setPage(Math.min(totalPages - 1, page + 1))} disabled={page >= totalPages - 1}>
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}
