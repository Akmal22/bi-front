'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { countriesApi } from '@/lib/api/countries';
import type { Country, CreateCountryRequest, UpdateCountryRequest } from '@/lib/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Table } from '@/components/ui/Table';
import { Modal } from '@/components/ui/Modal';

export default function CountriesPage() {
  const { user } = useAuth();
  const [countries, setCountries] = useState<Country[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingCountryCode, setEditingCountryCode] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateCountryRequest>({
    countryName: '',
    countryCode: '',
    currencyName: '',
    currencyCode: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      loadCountries();
    }
  }, [user]);

  const loadCountries = async () => {
    try {
      const response = await countriesApi.getCountries();
      setCountries(response.countries);
    } catch (error) {
      console.error('Failed to load countries:', error);
    }
  };

  const handleCreate = () => {
    setFormData({
      countryName: '',
      countryCode: '',
      currencyName: '',
      currencyCode: 0,
    });
    setErrorMessage('');
    setIsEditing(false);
    setEditingCountryCode(null);
    setIsModalOpen(true);
  };

  const handleEdit = (country: Country) => {
    setFormData({
      countryName: country.countryName,
      countryCode: country.countryCode,
      currencyName: country.currencyName,
      currencyCode: country.currencyCode,
    });
    setErrorMessage('');
    setIsEditing(true);
    setEditingCountryCode(country.countryCode);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccessMessage('');
    setErrorMessage('');
    try {
      if (isEditing) {
        await countriesApi.updateCountry(formData as UpdateCountryRequest);
        setSuccessMessage('Country updated successfully!');
      } else {
        await countriesApi.createCountry(formData);
        setSuccessMessage('Country created successfully!');
      }
      setIsModalOpen(false);
      setIsEditing(false);
      setEditingCountryCode(null);
      loadCountries();
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error: any) {
      console.error(`Failed to ${isEditing ? 'update' : 'create'} country:`, error);
      // Only show error if it's a 4xx or 5xx status code
      if (error?.status && error.status >= 400 && error.status < 600) {
        // Check if response body has a message field
        if (error?.details && error.details.message) {
          setErrorMessage(error.details.message);
        } else {
          // Show default error message
          setErrorMessage(`Error while country ${isEditing ? 'update' : 'creation'}`);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (user?.role !== 'ADMIN') {
    return <div className="p-6">Access denied. Admin only.</div>;
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Country Management</h1>
        <Button onClick={handleCreate}>+ Add Country</Button>
      </div>

      {successMessage && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          <p className="font-semibold">{successMessage}</p>
        </div>
      )}

      {errorMessage && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p className="font-semibold">{errorMessage}</p>
        </div>
      )}

      <Card>
        <Table headers={['Country Code', 'Country Name', 'Currency Code', 'Currency Name', 'Actions']}>
          {countries.map((country) => (
            <tr key={country.countryCode} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{country.countryCode}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{country.countryName}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{country.currencyCode}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{country.currencyName}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <Button variant="outline" onClick={() => handleEdit(country)}>
                  Edit
                </Button>
              </td>
            </tr>
          ))}
        </Table>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setErrorMessage('');
          setIsEditing(false);
          setEditingCountryCode(null);
        }}
        title={isEditing ? 'Edit Country' : 'Add Country'}
        footer={
          <>
            <Button variant="outline" onClick={() => {
              setIsModalOpen(false);
              setErrorMessage('');
              setIsEditing(false);
              setEditingCountryCode(null);
            }}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update' : 'Create')}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMessage && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              <p className="font-semibold">{errorMessage}</p>
            </div>
          )}
          <Input
            label="Country Code"
            value={formData.countryCode}
            onChange={(e) => setFormData({ ...formData, countryCode: e.target.value.toUpperCase() })}
            required
            maxLength={2}
            placeholder="e.g., KZ"
            disabled={isEditing}
          />
          <Input
            label="Country Name"
            value={formData.countryName}
            onChange={(e) => setFormData({ ...formData, countryName: e.target.value })}
            required
            placeholder="e.g., Kazakhstan"
          />
          <Input
            label="Currency Code"
            type="number"
            value={formData.currencyCode}
            onChange={(e) => setFormData({ ...formData, currencyCode: parseInt(e.target.value) || 0 })}
            required
            placeholder="e.g., 398"
          />
          <Input
            label="Currency Name"
            value={formData.currencyName}
            onChange={(e) => setFormData({ ...formData, currencyName: e.target.value })}
            required
            placeholder="e.g., Tenge"
          />
        </form>
      </Modal>
    </div>
  );
}
