'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { incubatorsApi } from '@/lib/api/incubators';
import { countriesApi } from '@/lib/api/countries';
import { usersApi } from '@/lib/api/users';
import type { IncubatorRequest, Country, User } from '@/lib/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { DatePicker } from '@/components/ui/DatePicker';
import { formatNumber, parseNumber, parseInteger } from '@/lib/utils/numberFormat';

export default function AdminNewIncubatorPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [countries, setCountries] = useState<Country[]>([]);
  const [managers, setManagers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<IncubatorRequest>>({
    name: '',
    description: '',
    countryCode: '',
    founded: new Date().toISOString().split('T')[0],
    incubatorCharacteristics: {
      averageEmployeePerResident: 'ONE_PER_ONE_RESIDENT',
      shareAmount: 'BETWEEN_1_AND_5_PERCENT',
    },
    incubatorInfrastructure: {},
    incubatorSpace: {},
    incubatorServices: {},
    incubatorResidents: [{ year: new Date().getFullYear() }],
    incubatorIncome: [{ year: new Date().getFullYear() }],
    incubatorInvestment: [{ year: new Date().getFullYear() }],
    incubatorExpense: {},
    incubatorProjects: [{ year: new Date().getFullYear() }],
  });

  useEffect(() => {
    if (user?.role === 'ADMIN' || user?.role === 'MANAGER') {
      loadCountries();
      loadManagers();
    }
  }, [user]);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (isErrorModalOpen) {
          setIsErrorModalOpen(false);
          setErrorMessage('');
        }
        if (isSuccessModalOpen) {
          setIsSuccessModalOpen(false);
          setSuccessMessage('');
        }
      }
    };

    if (isErrorModalOpen || isSuccessModalOpen) {
      document.addEventListener('keydown', handleEsc);
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isErrorModalOpen, isSuccessModalOpen]);

  const loadCountries = async () => {
    try {
      const response = await countriesApi.getCountries();
      setCountries(response.countries);
    } catch (error) {
      console.error('Failed to load countries:', error);
    }
  };

  const loadManagers = async () => {
    try {
      const response = await usersApi.getUsers({ page: 0, size: 100 });
      setManagers(response.users.filter(u => u.role === 'MANAGER'));
    } catch (error) {
      console.error('Failed to load managers:', error);
    }
  };

  const validateForm = (): string | null => {
    // Required fields validation
    if (!formData.name || formData.name.trim() === '') {
      return 'Incubator name is required';
    }
    if (formData.name.length > 64) {
      return 'Incubator name must be 64 characters or less';
    }
    
    if (!formData.description || formData.description.trim() === '') {
      return 'Description is required';
    }
    if (formData.description.length > 256) {
      return 'Description must be 256 characters or less';
    }
    
    if (!formData.countryCode) {
      return 'Country is required';
    }
    
    if (!formData.founded) {
      return 'Founded date is required';
    }
    
    // Validate founded date is not in the future
    const foundedDate = new Date(formData.founded);
    if (foundedDate > new Date()) {
      return 'Founded date cannot be in the future';
    }
    
    // Characteristics validation - REQUIRED
    if (!formData.incubatorCharacteristics) {
      return 'Incubator Characteristics is required';
    }
    if (!formData.incubatorCharacteristics.averageEmployeePerResident) {
      return 'Average Employee Per Resident is required';
    }
    if (!formData.incubatorCharacteristics.shareAmount) {
      return 'Share Amount is required';
    }
    
    // Infrastructure validation - REQUIRED
    if (!formData.incubatorInfrastructure) {
      return 'Incubator Infrastructure is required';
    }
    
    // Space validation - REQUIRED
    if (!formData.incubatorSpace) {
      return 'Incubator Space is required';
    }
    
    // Services validation - REQUIRED
    if (!formData.incubatorServices) {
      return 'Incubator Services is required';
    }
    
    // Expense validation - REQUIRED
    if (!formData.incubatorExpense) {
      return 'Incubator Expense is required';
    }
    
    // Residents validation - REQUIRED array (must have at least one item)
    if (!formData.incubatorResidents || formData.incubatorResidents.length === 0) {
      return 'At least one Incubator Resident entry is required';
    }
    
    // Income validation - REQUIRED array (must have at least one item)
    if (!formData.incubatorIncome || formData.incubatorIncome.length === 0) {
      return 'At least one Incubator Income entry is required';
    }
    
    // Investment validation - REQUIRED array (must have at least one item)
    if (!formData.incubatorInvestment || formData.incubatorInvestment.length === 0) {
      return 'At least one Incubator Investment entry is required';
    }
    
    // Projects validation - REQUIRED array (must have at least one item)
    if (!formData.incubatorProjects || formData.incubatorProjects.length === 0) {
      return 'At least one Incubator Project entry is required';
    }
    
    // Number validations - must be positive if provided
    const validatePositiveNumber = (value: number | undefined, fieldName: string): string | null => {
      if (value !== undefined && value < 0) {
        return `${fieldName} must be a positive number`;
      }
      return null;
    };
    
    // Validate characteristics numbers
    if (formData.incubatorCharacteristics?.totalStaff !== undefined) {
      const err = validatePositiveNumber(formData.incubatorCharacteristics.totalStaff, 'Total Staff');
      if (err) return err;
    }
    if (formData.incubatorCharacteristics?.expertsAndConsultants !== undefined) {
      const err = validatePositiveNumber(formData.incubatorCharacteristics.expertsAndConsultants, 'Experts and Consultants');
      if (err) return err;
    }
    if (formData.incubatorCharacteristics?.managers !== undefined) {
      const err = validatePositiveNumber(formData.incubatorCharacteristics.managers, 'Managers');
      if (err) return err;
    }
    
    // Infrastructure validation
    if (formData.incubatorInfrastructure?.sectorsCovered !== undefined) {
      const err = validatePositiveNumber(formData.incubatorInfrastructure.sectorsCovered, 'Sectors Covered');
      if (err) return err;
    }
    if (formData.incubatorInfrastructure?.yearsInOperation !== undefined) {
      const err = validatePositiveNumber(formData.incubatorInfrastructure.yearsInOperation, 'Years in Operation');
      if (err) return err;
    }
    if (formData.incubatorInfrastructure?.programmeDuration !== undefined) {
      const err = validatePositiveNumber(formData.incubatorInfrastructure.programmeDuration, 'Programme Duration');
      if (err) return err;
    }
    
    // Space validation
    if (formData.incubatorSpace?.overallSpace !== undefined) {
      const err = validatePositiveNumber(formData.incubatorSpace.overallSpace, 'Overall Space');
      if (err) return err;
    }
    if (formData.incubatorSpace?.avgResidentSpace !== undefined) {
      const err = validatePositiveNumber(formData.incubatorSpace.avgResidentSpace, 'Average Resident Space');
      if (err) return err;
    }
    if (formData.incubatorSpace?.communalSpace !== undefined) {
      const err = validatePositiveNumber(formData.incubatorSpace.communalSpace, 'Communal Space');
      if (err) return err;
    }
    if (formData.incubatorSpace?.adminSpace !== undefined) {
      const err = validatePositiveNumber(formData.incubatorSpace.adminSpace, 'Admin Space');
      if (err) return err;
    }
    if (formData.incubatorSpace?.communalSpaceRatio !== undefined) {
      if (formData.incubatorSpace.communalSpaceRatio < 0 || formData.incubatorSpace.communalSpaceRatio > 100) {
        return 'Communal Space Ratio must be between 0 and 100';
      }
    }
    
    // Year validation for arrays
    const currentYear = new Date().getFullYear();
    const minYear = 1900;
    const maxYear = currentYear + 10; // Allow up to 10 years in the future for planning
    
    // Validate Residents
    if (formData.incubatorResidents) {
      for (const resident of formData.incubatorResidents) {
        if (resident.year < minYear || resident.year > maxYear) {
          return `Resident year must be between ${minYear} and ${maxYear}`;
        }
        if (resident.incubatedCompanies !== undefined && resident.incubatedCompanies < 0) {
          return 'Incubated Companies must be a positive number';
        }
        if (resident.failedCompanies !== undefined && resident.failedCompanies < 0) {
          return 'Failed Companies must be a positive number';
        }
        if (resident.graduatedCompanies !== undefined && resident.graduatedCompanies < 0) {
          return 'Graduated Companies must be a positive number';
        }
        if (resident.receivedApplication !== undefined && resident.receivedApplication < 0) {
          return 'Applications Received must be a positive number';
        }
        if (resident.acceptedApplication !== undefined && resident.acceptedApplication < 0) {
          return 'Applications Accepted must be a positive number';
        }
        if (resident.activeAfter3Months !== undefined && resident.activeAfter3Months < 0) {
          return 'Active After 3 Months must be a positive number';
        }
        if (resident.activeAfter6Months !== undefined && resident.activeAfter6Months < 0) {
          return 'Active After 6 Months must be a positive number';
        }
        if (resident.activeAfter1Year !== undefined && resident.activeAfter1Year < 0) {
          return 'Active After 1 Year must be a positive number';
        }
        if (resident.activeAfter3Years !== undefined && resident.activeAfter3Years < 0) {
          return 'Active After 3 Years must be a positive number';
        }
        if (resident.activeAfter5Years !== undefined && resident.activeAfter5Years < 0) {
          return 'Active After 5 Years must be a positive number';
        }
        if (resident.failedAfter3Months !== undefined && resident.failedAfter3Months < 0) {
          return 'Failed After 3 Months must be a positive number';
        }
        if (resident.failedAfter6Months !== undefined && resident.failedAfter6Months < 0) {
          return 'Failed After 6 Months must be a positive number';
        }
        if (resident.failedAfter1Year !== undefined && resident.failedAfter1Year < 0) {
          return 'Failed After 1 Year must be a positive number';
        }
        if (resident.failedAfter3Years !== undefined && resident.failedAfter3Years < 0) {
          return 'Failed After 3 Years must be a positive number';
        }
        if (resident.failedAfter5Years !== undefined && resident.failedAfter5Years < 0) {
          return 'Failed After 5 Years must be a positive number';
        }
      }
    }
    
    // Validate Income
    if (formData.incubatorIncome) {
      for (const income of formData.incubatorIncome) {
        if (income.year < minYear || income.year > maxYear) {
          return `Income year must be between ${minYear} and ${maxYear}`;
        }
        if (income.initialCapital !== undefined && income.initialCapital < 0) {
          return 'Initial Capital must be a positive number';
        }
        if (income.paidServicesIncome !== undefined && income.paidServicesIncome < 0) {
          return 'Paid Services Income must be a positive number';
        }
        if (income.paidTrainingIncome !== undefined && income.paidTrainingIncome < 0) {
          return 'Paid Training Income must be a positive number';
        }
        if (income.paidFacilitiesIncome !== undefined && income.paidFacilitiesIncome < 0) {
          return 'Paid Facilities Income must be a positive number';
        }
        if (income.donors !== undefined && income.donors < 0) {
          return 'Donors amount must be a positive number';
        }
        if (income.state !== undefined && income.state < 0) {
          return 'State amount must be a positive number';
        }
        if (income.loans !== undefined && income.loans < 0) {
          return 'Loans amount must be a positive number';
        }
      }
    }
    
    // Validate Investment
    if (formData.incubatorInvestment) {
      for (const investment of formData.incubatorInvestment) {
        if (investment.year < minYear || investment.year > maxYear) {
          return `Investment year must be between ${minYear} and ${maxYear}`;
        }
        if (investment.seed !== undefined && investment.seed < 0) {
          return 'Seed investment must be a positive number';
        }
        if (investment.state !== undefined && investment.state < 0) {
          return 'State investment must be a positive number';
        }
        if (investment.privates !== undefined && investment.privates < 0) {
          return 'Private investment must be a positive number';
        }
        if (investment.currentYearInvestment !== undefined && investment.currentYearInvestment < 0) {
          return 'Current Year Investment must be a positive number';
        }
        if (investment.cumulativeInvestment !== undefined && investment.cumulativeInvestment < 0) {
          return 'Cumulative Investment must be a positive number';
        }
      }
    }
    
    // Validate Projects
    if (formData.incubatorProjects) {
      for (const project of formData.incubatorProjects) {
        if (project.year < minYear || project.year > maxYear) {
          return `Project year must be between ${minYear} and ${maxYear}`;
        }
        if (project.projectsCount !== undefined && project.projectsCount < 0) {
          return 'Projects Count must be a positive number';
        }
        if (project.fund !== undefined && project.fund < 0) {
          return 'Fund must be a positive number';
        }
      }
    }
    
    // Validate Services - numbers must be positive
    if (formData.incubatorServices) {
      const serviceFields = [
        'offeredServices', 'freeServices', 'paidServices', 'usedServices',
        'offeredFacilities', 'freeFacilities', 'paidFacilities', 'usedFacilities',
        'offeredTrainings', 'freeTrainings', 'paidTrainings', 'usedTrainings'
      ];
      
      for (const field of serviceFields) {
        const value = (formData.incubatorServices as any)[field];
        if (value !== undefined && value < 0) {
          return `${field.replace(/([A-Z])/g, ' $1').trim()} must be a positive number`;
        }
      }
    }
    
    // Validate Expenses - numbers must be positive
    if (formData.incubatorExpense) {
      const expenseFields = [
        'payroll', 'equipment', 'utilities', 'tax', 'rents',
        'bankRepayments', 'material', 'insurance'
      ];
      
      for (const field of expenseFields) {
        const value = (formData.incubatorExpense as any)[field];
        if (value !== undefined && value < 0) {
          return `${field.charAt(0).toUpperCase() + field.slice(1)} must be a positive number`;
        }
      }
    }
    
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');
    
    // Validate form
    const validationError = validateForm();
    if (validationError) {
      setErrorMessage(validationError);
      setIsErrorModalOpen(true);
      return;
    }

    setIsLoading(true);
    try {
      // Convert date-only format to ISO string for backend
      const foundedDate = formData.founded!.includes('T') 
        ? formData.founded! 
        : new Date(formData.founded! + 'T00:00:00').toISOString();
      
      const request: IncubatorRequest = {
        name: formData.name!,
        description: formData.description!,
        countryCode: formData.countryCode!,
        founded: foundedDate,
        managerId: formData.managerId,
        incubatorCharacteristics: formData.incubatorCharacteristics!,
        incubatorInfrastructure: formData.incubatorInfrastructure!,
        incubatorSpace: formData.incubatorSpace!,
        incubatorResidents: formData.incubatorResidents!,
        incubatorServices: formData.incubatorServices!,
        incubatorIncome: formData.incubatorIncome!,
        incubatorInvestment: formData.incubatorInvestment!,
        incubatorExpense: formData.incubatorExpense!,
        incubatorProjects: formData.incubatorProjects!,
      };

      const response = await incubatorsApi.createIncubator(request);
      setSuccessMessage('Incubator created successfully!');
      setIsSuccessModalOpen(true);
      setTimeout(() => {
        router.push(`/admin/incubators/${response.incubatorUuid}`);
      }, 1500);
    } catch (error: any) {
      console.error('Failed to create incubator:', error);
      // Only show error if it's a 4xx or 5xx status code
      if (error?.status && error.status >= 400 && error.status < 600) {
        // Check if response body has a message field
        if (error?.details && error.details.message) {
          setErrorMessage(error.details.message);
        } else {
          setErrorMessage('Error while incubator creation');
        }
        setIsErrorModalOpen(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (user?.role !== 'ADMIN' && user?.role !== 'MANAGER') {
    return <div className="p-6">Access denied. Admin or Manager only.</div>;
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <Button variant="outline" onClick={() => router.back()}>← Back</Button>
        <h1 className="text-3xl font-bold text-gray-800 mt-4">Create New Incubator</h1>
      </div>

      {isErrorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4">
            <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">Validation Error</h2>
              <button
                onClick={() => {
                  setIsErrorModalOpen(false);
                  setErrorMessage('');
                }}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              >
                ×
              </button>
            </div>
            <div className="p-6">
              <div className="text-red-700">
                <p className="font-semibold">{errorMessage}</p>
              </div>
            </div>
            <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end">
              <Button onClick={() => {
                setIsErrorModalOpen(false);
                setErrorMessage('');
              }}>
                OK
              </Button>
            </div>
          </div>
        </div>
      )}

      {isSuccessModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4">
            <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">Success</h2>
              <button
                onClick={() => {
                  setIsSuccessModalOpen(false);
                  setSuccessMessage('');
                }}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              >
                ×
              </button>
            </div>
            <div className="p-6">
              <div className="text-green-700">
                <p className="font-semibold">{successMessage}</p>
              </div>
            </div>
            <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end">
              <Button onClick={() => {
                setIsSuccessModalOpen(false);
                setSuccessMessage('');
              }}>
                OK
              </Button>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <Card title="Basic Information">
            <div className="space-y-4">
              <Input
                label="Incubator Name *"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="e.g., TechHub Incubator"
              />
              <Input
                label="Description *"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                placeholder="Describe the incubator"
              />
              <Select
                label="Country *"
                value={formData.countryCode || ''}
                onChange={(e) => setFormData({ ...formData, countryCode: e.target.value })}
                options={[
                  { value: '', label: '-- Select Country --' },
                  ...countries.map((c) => ({
                    value: c.countryCode,
                    label: `${c.countryName} (${c.countryCode})`,
                  })),
                ]}
                required
              />
              <Select
                label="Manager"
                value={formData.managerId?.toString() || ''}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  managerId: e.target.value ? parseInt(e.target.value) : undefined 
                })}
                options={[
                  { value: '', label: '-- Select Manager (Optional) --' },
                  ...managers.map((m) => ({
                    value: m.id.toString(),
                    label: `${m.fullName || m.username} (${m.email})`,
                  })),
                ]}
              />
              <DatePicker
                label="Founded Date *"
                value={formData.founded ? (formData.founded.includes('T') ? formData.founded.split('T')[0] : formData.founded) : ''}
                onChange={(value) => setFormData({ ...formData, founded: value })}
                required
                maxDate={new Date()}
              />
            </div>
          </Card>

          <Card title="Characteristics">
            <div className="space-y-4">
              <Select
                label="Average Employee Per Resident *"
                value={formData.incubatorCharacteristics?.averageEmployeePerResident || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  incubatorCharacteristics: {
                    ...formData.incubatorCharacteristics!,
                    averageEmployeePerResident: e.target.value as any,
                  },
                })}
                options={[
                  { value: 'MORE_THAN_ONE_PER_ONE_RESIDENT', label: 'More than one per one resident' },
                  { value: 'ONE_PER_ONE_RESIDENT', label: 'One per one resident' },
                  { value: 'LESS_THAN_ONE_PER_ONE_RESIDENT', label: 'Less than one per one resident' },
                ]}
                required
              />
              <Select
                label="Share Amount *"
                value={formData.incubatorCharacteristics?.shareAmount || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  incubatorCharacteristics: {
                    ...formData.incubatorCharacteristics!,
                    shareAmount: e.target.value as any,
                  },
                })}
                options={[
                  { value: 'MONETARY_COST_BUT_NO_SHARES', label: 'Monetary cost but no shares' },
                  { value: 'BETWEEN_1_AND_5_PERCENT', label: 'Between 1 and 5%' },
                  { value: 'BETWEEN_1_AND_10_PERCENT', label: 'Between 1 and 10%' },
                  { value: 'BETWEEN_1_AND_20_PERCENT', label: 'Between 1 and 20%' },
                  { value: 'BETWEEN_10_AND_20_PERCENT', label: 'Between 10 and 20%' },
                  { value: 'MORE_THAN_15_PERCENT', label: 'More than 15%' },
                  { value: 'FIXED', label: 'Fixed' },
                ]}
                required
              />
              <Input
                label="Total Staff"
                type="text"
                value={formatNumber(formData.incubatorCharacteristics?.totalStaff)}
                onChange={(e) => setFormData({
                  ...formData,
                  incubatorCharacteristics: {
                    ...formData.incubatorCharacteristics!,
                    totalStaff: parseInteger(e.target.value),
                  },
                })}
              />
              <Input
                label="Experts and Consultants"
                type="text"
                value={formatNumber(formData.incubatorCharacteristics?.expertsAndConsultants)}
                onChange={(e) => setFormData({
                  ...formData,
                  incubatorCharacteristics: {
                    ...formData.incubatorCharacteristics!,
                    expertsAndConsultants: parseInteger(e.target.value),
                  },
                })}
              />
              <Input
                label="Managers"
                type="text"
                value={formatNumber(formData.incubatorCharacteristics?.managers)}
                onChange={(e) => setFormData({
                  ...formData,
                  incubatorCharacteristics: {
                    ...formData.incubatorCharacteristics!,
                    managers: parseInteger(e.target.value),
                  },
                })}
              />
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="monitoring"
                  checked={formData.incubatorCharacteristics?.monitoringAndDataCollecting || false}
                  onChange={(e) => setFormData({
                    ...formData,
                    incubatorCharacteristics: {
                      ...formData.incubatorCharacteristics!,
                      monitoringAndDataCollecting: e.target.checked,
                    },
                  })}
                  className="mr-2"
                />
                <label htmlFor="monitoring" className="text-sm font-medium text-gray-700">
                  Monitoring and Data Collecting
                </label>
              </div>
              <Input
                label="Requirements"
                value={formData.incubatorCharacteristics?.requirements || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  incubatorCharacteristics: {
                    ...formData.incubatorCharacteristics!,
                    requirements: e.target.value || undefined,
                  },
                })}
              />
            </div>
          </Card>

          <Card title="Infrastructure">
            <div className="space-y-4">
              <Input
                label="Sectors Covered"
                type="text"
                value={formatNumber(formData.incubatorInfrastructure?.sectorsCovered)}
                onChange={(e) => setFormData({
                  ...formData,
                  incubatorInfrastructure: {
                    ...formData.incubatorInfrastructure,
                    sectorsCovered: parseInteger(e.target.value),
                  },
                })}
              />
              <Input
                label="Years in Operation"
                type="text"
                value={formatNumber(formData.incubatorInfrastructure?.yearsInOperation)}
                onChange={(e) => setFormData({
                  ...formData,
                  incubatorInfrastructure: {
                    ...formData.incubatorInfrastructure,
                    yearsInOperation: parseInteger(e.target.value),
                  },
                })}
              />
              <Input
                label="Programme Duration (months)"
                type="text"
                value={formatNumber(formData.incubatorInfrastructure?.programmeDuration)}
                onChange={(e) => setFormData({
                  ...formData,
                  incubatorInfrastructure: {
                    ...formData.incubatorInfrastructure,
                    programmeDuration: parseInteger(e.target.value),
                  },
                })}
              />
            </div>
          </Card>

          <Card title="Space">
            <div className="space-y-4">
              <Input
                label="Overall Space (m²)"
                type="text"
                value={formatNumber(formData.incubatorSpace?.overallSpace)}
                onChange={(e) => setFormData({
                  ...formData,
                  incubatorSpace: {
                    ...formData.incubatorSpace,
                    overallSpace: parseNumber(e.target.value),
                  },
                })}
              />
              <Input
                label="Average Resident Space (m²)"
                type="text"
                value={formatNumber(formData.incubatorSpace?.avgResidentSpace)}
                onChange={(e) => setFormData({
                  ...formData,
                  incubatorSpace: {
                    ...formData.incubatorSpace,
                    avgResidentSpace: parseNumber(e.target.value),
                  },
                })}
              />
              <Input
                label="Communal Space (m²)"
                type="text"
                value={formatNumber(formData.incubatorSpace?.communalSpace)}
                onChange={(e) => setFormData({
                  ...formData,
                  incubatorSpace: {
                    ...formData.incubatorSpace,
                    communalSpace: parseNumber(e.target.value),
                  },
                })}
              />
              <Input
                label="Admin Space (m²)"
                type="text"
                value={formatNumber(formData.incubatorSpace?.adminSpace)}
                onChange={(e) => setFormData({
                  ...formData,
                  incubatorSpace: {
                    ...formData.incubatorSpace,
                    adminSpace: parseNumber(e.target.value),
                  },
                })}
              />
              <Input
                label="Communal Space Ratio (%)"
                type="text"
                value={formatNumber(formData.incubatorSpace?.communalSpaceRatio)}
                onChange={(e) => setFormData({
                  ...formData,
                  incubatorSpace: {
                    ...formData.incubatorSpace,
                    communalSpaceRatio: parseNumber(e.target.value),
                  },
                })}
              />
            </div>
          </Card>

          <Card title="Services">
            <div className="space-y-4">
              <h4 className="font-semibold">Services</h4>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Offered Services"
                  type="text"
                  value={formatNumber(formData.incubatorServices?.offeredServices)}
                  onChange={(e) => setFormData({
                    ...formData,
                    incubatorServices: {
                      ...formData.incubatorServices,
                      offeredServices: parseInteger(e.target.value),
                    },
                  })}
                />
                <Input
                  label="Free Services"
                  type="text"
                  value={formatNumber(formData.incubatorServices?.freeServices)}
                  onChange={(e) => setFormData({
                    ...formData,
                    incubatorServices: {
                      ...formData.incubatorServices,
                      freeServices: parseInteger(e.target.value),
                    },
                  })}
                />
                <Input
                  label="Paid Services"
                  type="text"
                  value={formatNumber(formData.incubatorServices?.paidServices)}
                  onChange={(e) => setFormData({
                    ...formData,
                    incubatorServices: {
                      ...formData.incubatorServices,
                      paidServices: parseInteger(e.target.value),
                    },
                  })}
                />
                <Input
                  label="Used Services"
                  type="text"
                  value={formatNumber(formData.incubatorServices?.usedServices)}
                  onChange={(e) => setFormData({
                    ...formData,
                    incubatorServices: {
                      ...formData.incubatorServices,
                      usedServices: parseInteger(e.target.value),
                    },
                  })}
                />
              </div>
              <h4 className="font-semibold mt-4">Facilities</h4>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Offered Facilities"
                  type="text"
                  value={formatNumber(formData.incubatorServices?.offeredFacilities)}
                  onChange={(e) => setFormData({
                    ...formData,
                    incubatorServices: {
                      ...formData.incubatorServices,
                      offeredFacilities: parseInteger(e.target.value),
                    },
                  })}
                />
                <Input
                  label="Free Facilities"
                  type="text"
                  value={formatNumber(formData.incubatorServices?.freeFacilities)}
                  onChange={(e) => setFormData({
                    ...formData,
                    incubatorServices: {
                      ...formData.incubatorServices,
                      freeFacilities: parseInteger(e.target.value),
                    },
                  })}
                />
                <Input
                  label="Paid Facilities"
                  type="text"
                  value={formatNumber(formData.incubatorServices?.paidFacilities)}
                  onChange={(e) => setFormData({
                    ...formData,
                    incubatorServices: {
                      ...formData.incubatorServices,
                      paidFacilities: parseInteger(e.target.value),
                    },
                  })}
                />
                <Input
                  label="Used Facilities"
                  type="text"
                  value={formatNumber(formData.incubatorServices?.usedFacilities)}
                  onChange={(e) => setFormData({
                    ...formData,
                    incubatorServices: {
                      ...formData.incubatorServices,
                      usedFacilities: parseInteger(e.target.value),
                    },
                  })}
                />
              </div>
              <h4 className="font-semibold mt-4">Trainings</h4>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Offered Trainings"
                  type="text"
                  value={formatNumber(formData.incubatorServices?.offeredTrainings)}
                  onChange={(e) => setFormData({
                    ...formData,
                    incubatorServices: {
                      ...formData.incubatorServices,
                      offeredTrainings: parseInteger(e.target.value),
                    },
                  })}
                />
                <Input
                  label="Free Trainings"
                  type="text"
                  value={formatNumber(formData.incubatorServices?.freeTrainings)}
                  onChange={(e) => setFormData({
                    ...formData,
                    incubatorServices: {
                      ...formData.incubatorServices,
                      freeTrainings: parseInteger(e.target.value),
                    },
                  })}
                />
                <Input
                  label="Paid Trainings"
                  type="text"
                  value={formatNumber(formData.incubatorServices?.paidTrainings)}
                  onChange={(e) => setFormData({
                    ...formData,
                    incubatorServices: {
                      ...formData.incubatorServices,
                      paidTrainings: parseInteger(e.target.value),
                    },
                  })}
                />
                <Input
                  label="Used Trainings"
                  type="text"
                  value={formatNumber(formData.incubatorServices?.usedTrainings)}
                  onChange={(e) => setFormData({
                    ...formData,
                    incubatorServices: {
                      ...formData.incubatorServices,
                      usedTrainings: parseInteger(e.target.value),
                    },
                  })}
                />
              </div>
            </div>
          </Card>

          <Card title="Expenses">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Payroll"
                type="text"
                value={formatNumber(formData.incubatorExpense?.payroll)}
                onChange={(e) => setFormData({
                  ...formData,
                  incubatorExpense: {
                    ...formData.incubatorExpense,
                    payroll: parseNumber(e.target.value),
                  },
                })}
              />
              <Input
                label="Equipment"
                type="text"
                value={formatNumber(formData.incubatorExpense?.equipment)}
                onChange={(e) => setFormData({
                  ...formData,
                  incubatorExpense: {
                    ...formData.incubatorExpense,
                    equipment: parseNumber(e.target.value),
                  },
                })}
              />
              <Input
                label="Utilities"
                type="text"
                value={formatNumber(formData.incubatorExpense?.utilities)}
                onChange={(e) => setFormData({
                  ...formData,
                  incubatorExpense: {
                    ...formData.incubatorExpense,
                    utilities: parseNumber(e.target.value),
                  },
                })}
              />
              <Input
                label="Tax"
                type="text"
                value={formatNumber(formData.incubatorExpense?.tax)}
                onChange={(e) => setFormData({
                  ...formData,
                  incubatorExpense: {
                    ...formData.incubatorExpense,
                    tax: parseNumber(e.target.value),
                  },
                })}
              />
              <Input
                label="Rents"
                type="text"
                value={formatNumber(formData.incubatorExpense?.rents)}
                onChange={(e) => setFormData({
                  ...formData,
                  incubatorExpense: {
                    ...formData.incubatorExpense,
                    rents: parseNumber(e.target.value),
                  },
                })}
              />
              <Input
                label="Bank Repayments"
                type="text"
                value={formatNumber(formData.incubatorExpense?.bankRepayments)}
                onChange={(e) => setFormData({
                  ...formData,
                  incubatorExpense: {
                    ...formData.incubatorExpense,
                    bankRepayments: parseNumber(e.target.value),
                  },
                })}
              />
              <Input
                label="Material"
                type="text"
                value={formatNumber(formData.incubatorExpense?.material)}
                onChange={(e) => setFormData({
                  ...formData,
                  incubatorExpense: {
                    ...formData.incubatorExpense,
                    material: parseNumber(e.target.value),
                  },
                })}
              />
              <Input
                label="Insurance"
                type="text"
                value={formatNumber(formData.incubatorExpense?.insurance)}
                onChange={(e) => setFormData({
                  ...formData,
                  incubatorExpense: {
                    ...formData.incubatorExpense,
                    insurance: parseNumber(e.target.value),
                  },
                })}
              />
            </div>
          </Card>

          <Card title="Residents">
            <div className="space-y-4">
              {(formData.incubatorResidents || []).map((resident, idx) => (
                <div key={idx} className="border p-4 rounded-lg space-y-2">
                  <div className="flex justify-between items-center mb-2">
                    <h5 className="font-semibold">Year {resident.year}</h5>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const newResidents = [...(formData.incubatorResidents || [])];
                        newResidents.splice(idx, 1);
                        setFormData({ ...formData, incubatorResidents: newResidents });
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Year"
                      type="number"
                      value={resident.year}
                      onChange={(e) => {
                        const newResidents = [...(formData.incubatorResidents || [])];
                        newResidents[idx] = { ...newResidents[idx], year: parseInt(e.target.value) };
                        setFormData({ ...formData, incubatorResidents: newResidents });
                      }}
                    />
                    <Input
                      label="Incubated Companies"
                      type="text"
                      value={formatNumber(resident.incubatedCompanies)}
                      onChange={(e) => {
                        const newResidents = [...(formData.incubatorResidents || [])];
                        newResidents[idx] = { ...newResidents[idx], incubatedCompanies: parseNumber(e.target.value) };
                        setFormData({ ...formData, incubatorResidents: newResidents });
                      }}
                    />
                    <Input
                      label="Failed Companies"
                      type="text"
                      value={formatNumber(resident.failedCompanies)}
                      onChange={(e) => {
                        const newResidents = [...(formData.incubatorResidents || [])];
                        newResidents[idx] = { ...newResidents[idx], failedCompanies: parseNumber(e.target.value) };
                        setFormData({ ...formData, incubatorResidents: newResidents });
                      }}
                    />
                    <Input
                      label="Graduated Companies"
                      type="text"
                      value={formatNumber(resident.graduatedCompanies)}
                      onChange={(e) => {
                        const newResidents = [...(formData.incubatorResidents || [])];
                        newResidents[idx] = { ...newResidents[idx], graduatedCompanies: parseNumber(e.target.value) };
                        setFormData({ ...formData, incubatorResidents: newResidents });
                      }}
                    />
                    <Input
                      label="Applications Received"
                      type="text"
                      value={formatNumber(resident.receivedApplication)}
                      onChange={(e) => {
                        const newResidents = [...(formData.incubatorResidents || [])];
                        newResidents[idx] = { ...newResidents[idx], receivedApplication: parseNumber(e.target.value) };
                        setFormData({ ...formData, incubatorResidents: newResidents });
                      }}
                    />
                    <Input
                      label="Applications Accepted"
                      type="text"
                      value={formatNumber(resident.acceptedApplication)}
                      onChange={(e) => {
                        const newResidents = [...(formData.incubatorResidents || [])];
                        newResidents[idx] = { ...newResidents[idx], acceptedApplication: parseNumber(e.target.value) };
                        setFormData({ ...formData, incubatorResidents: newResidents });
                      }}
                    />
                    <Input
                      label="Active After 3 Months"
                      type="text"
                      value={formatNumber(resident.activeAfter3Months)}
                      onChange={(e) => {
                        const newResidents = [...(formData.incubatorResidents || [])];
                        newResidents[idx] = { ...newResidents[idx], activeAfter3Months: parseNumber(e.target.value) };
                        setFormData({ ...formData, incubatorResidents: newResidents });
                      }}
                    />
                    <Input
                      label="Active After 6 Months"
                      type="text"
                      value={formatNumber(resident.activeAfter6Months)}
                      onChange={(e) => {
                        const newResidents = [...(formData.incubatorResidents || [])];
                        newResidents[idx] = { ...newResidents[idx], activeAfter6Months: parseNumber(e.target.value) };
                        setFormData({ ...formData, incubatorResidents: newResidents });
                      }}
                    />
                    <Input
                      label="Active After 1 Year"
                      type="text"
                      value={formatNumber(resident.activeAfter1Year)}
                      onChange={(e) => {
                        const newResidents = [...(formData.incubatorResidents || [])];
                        newResidents[idx] = { ...newResidents[idx], activeAfter1Year: parseNumber(e.target.value) };
                        setFormData({ ...formData, incubatorResidents: newResidents });
                      }}
                    />
                    <Input
                      label="Active After 3 Years"
                      type="text"
                      value={formatNumber(resident.activeAfter3Years)}
                      onChange={(e) => {
                        const newResidents = [...(formData.incubatorResidents || [])];
                        newResidents[idx] = { ...newResidents[idx], activeAfter3Years: parseNumber(e.target.value) };
                        setFormData({ ...formData, incubatorResidents: newResidents });
                      }}
                    />
                    <Input
                      label="Active After 5 Years"
                      type="text"
                      value={formatNumber(resident.activeAfter5Years)}
                      onChange={(e) => {
                        const newResidents = [...(formData.incubatorResidents || [])];
                        newResidents[idx] = { ...newResidents[idx], activeAfter5Years: parseNumber(e.target.value) };
                        setFormData({ ...formData, incubatorResidents: newResidents });
                      }}
                    />
                    <Input
                      label="Failed After 3 Months"
                      type="text"
                      value={formatNumber(resident.failedAfter3Months)}
                      onChange={(e) => {
                        const newResidents = [...(formData.incubatorResidents || [])];
                        newResidents[idx] = { ...newResidents[idx], failedAfter3Months: parseNumber(e.target.value) };
                        setFormData({ ...formData, incubatorResidents: newResidents });
                      }}
                    />
                    <Input
                      label="Failed After 6 Months"
                      type="text"
                      value={formatNumber(resident.failedAfter6Months)}
                      onChange={(e) => {
                        const newResidents = [...(formData.incubatorResidents || [])];
                        newResidents[idx] = { ...newResidents[idx], failedAfter6Months: parseNumber(e.target.value) };
                        setFormData({ ...formData, incubatorResidents: newResidents });
                      }}
                    />
                    <Input
                      label="Failed After 1 Year"
                      type="text"
                      value={formatNumber(resident.failedAfter1Year)}
                      onChange={(e) => {
                        const newResidents = [...(formData.incubatorResidents || [])];
                        newResidents[idx] = { ...newResidents[idx], failedAfter1Year: parseNumber(e.target.value) };
                        setFormData({ ...formData, incubatorResidents: newResidents });
                      }}
                    />
                    <Input
                      label="Failed After 3 Years"
                      type="text"
                      value={formatNumber(resident.failedAfter3Years)}
                      onChange={(e) => {
                        const newResidents = [...(formData.incubatorResidents || [])];
                        newResidents[idx] = { ...newResidents[idx], failedAfter3Years: parseNumber(e.target.value) };
                        setFormData({ ...formData, incubatorResidents: newResidents });
                      }}
                    />
                    <Input
                      label="Failed After 5 Years"
                      type="text"
                      value={formatNumber(resident.failedAfter5Years)}
                      onChange={(e) => {
                        const newResidents = [...(formData.incubatorResidents || [])];
                        newResidents[idx] = { ...newResidents[idx], failedAfter5Years: parseNumber(e.target.value) };
                        setFormData({ ...formData, incubatorResidents: newResidents });
                      }}
                    />
                  </div>
                </div>
              ))}
              <Button
                variant="outline"
                onClick={() => {
                  const newResidents = [...(formData.incubatorResidents || []), { year: new Date().getFullYear() }];
                  setFormData({ ...formData, incubatorResidents: newResidents });
                }}
              >
                + Add Resident Year
              </Button>
            </div>
          </Card>

          <Card title="Income">
            <div className="space-y-4">
              {(formData.incubatorIncome || []).map((income, idx) => (
                <div key={idx} className="border p-4 rounded-lg space-y-2">
                  <div className="flex justify-between items-center mb-2">
                    <h5 className="font-semibold">Year {income.year}</h5>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const newIncome = [...(formData.incubatorIncome || [])];
                        newIncome.splice(idx, 1);
                        setFormData({ ...formData, incubatorIncome: newIncome });
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Year"
                      type="number"
                      value={income.year}
                      onChange={(e) => {
                        const newIncome = [...(formData.incubatorIncome || [])];
                        newIncome[idx] = { ...newIncome[idx], year: parseInt(e.target.value) };
                        setFormData({ ...formData, incubatorIncome: newIncome });
                      }}
                    />
                    <Input
                      label="Initial Capital"
                      type="text"
                      value={formatNumber(income.initialCapital)}
                      onChange={(e) => {
                        const newIncome = [...(formData.incubatorIncome || [])];
                        newIncome[idx] = { ...newIncome[idx], initialCapital: parseNumber(e.target.value) };
                        setFormData({ ...formData, incubatorIncome: newIncome });
                      }}
                    />
                    <Input
                      label="Paid Services Income"
                      type="text"
                      value={formatNumber(income.paidServicesIncome)}
                      onChange={(e) => {
                        const newIncome = [...(formData.incubatorIncome || [])];
                        newIncome[idx] = { ...newIncome[idx], paidServicesIncome: parseNumber(e.target.value) };
                        setFormData({ ...formData, incubatorIncome: newIncome });
                      }}
                    />
                    <Input
                      label="Paid Training Income"
                      type="text"
                      value={formatNumber(income.paidTrainingIncome)}
                      onChange={(e) => {
                        const newIncome = [...(formData.incubatorIncome || [])];
                        newIncome[idx] = { ...newIncome[idx], paidTrainingIncome: parseNumber(e.target.value) };
                        setFormData({ ...formData, incubatorIncome: newIncome });
                      }}
                    />
                    <Input
                      label="Paid Facilities Income"
                      type="text"
                      value={formatNumber(income.paidFacilitiesIncome)}
                      onChange={(e) => {
                        const newIncome = [...(formData.incubatorIncome || [])];
                        newIncome[idx] = { ...newIncome[idx], paidFacilitiesIncome: parseNumber(e.target.value) };
                        setFormData({ ...formData, incubatorIncome: newIncome });
                      }}
                    />
                    <Input
                      label="Donors"
                      type="text"
                      value={formatNumber(income.donors)}
                      onChange={(e) => {
                        const newIncome = [...(formData.incubatorIncome || [])];
                        newIncome[idx] = { ...newIncome[idx], donors: parseNumber(e.target.value) };
                        setFormData({ ...formData, incubatorIncome: newIncome });
                      }}
                    />
                    <Input
                      label="State"
                      type="text"
                      value={formatNumber(income.state)}
                      onChange={(e) => {
                        const newIncome = [...(formData.incubatorIncome || [])];
                        newIncome[idx] = { ...newIncome[idx], state: parseNumber(e.target.value) };
                        setFormData({ ...formData, incubatorIncome: newIncome });
                      }}
                    />
                    <Input
                      label="Loans"
                      type="text"
                      value={formatNumber(income.loans)}
                      onChange={(e) => {
                        const newIncome = [...(formData.incubatorIncome || [])];
                        newIncome[idx] = { ...newIncome[idx], loans: parseNumber(e.target.value) };
                        setFormData({ ...formData, incubatorIncome: newIncome });
                      }}
                    />
                  </div>
                </div>
              ))}
              <Button
                variant="outline"
                onClick={() => {
                  const newIncome = [...(formData.incubatorIncome || []), { year: new Date().getFullYear() }];
                  setFormData({ ...formData, incubatorIncome: newIncome });
                }}
              >
                + Add Income Year
              </Button>
            </div>
          </Card>

          <Card title="Investment">
            <div className="space-y-4">
              {(formData.incubatorInvestment || []).map((investment, idx) => (
                <div key={idx} className="border p-4 rounded-lg space-y-2">
                  <div className="flex justify-between items-center mb-2">
                    <h5 className="font-semibold">Year {investment.year}</h5>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const newInvestment = [...(formData.incubatorInvestment || [])];
                        newInvestment.splice(idx, 1);
                        setFormData({ ...formData, incubatorInvestment: newInvestment });
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Year"
                      type="number"
                      value={investment.year}
                      onChange={(e) => {
                        const newInvestment = [...(formData.incubatorInvestment || [])];
                        newInvestment[idx] = { ...newInvestment[idx], year: parseInt(e.target.value) };
                        setFormData({ ...formData, incubatorInvestment: newInvestment });
                      }}
                    />
                    <Input
                      label="Seed"
                      type="text"
                      value={formatNumber(investment.seed)}
                      onChange={(e) => {
                        const newInvestment = [...(formData.incubatorInvestment || [])];
                        newInvestment[idx] = { ...newInvestment[idx], seed: parseNumber(e.target.value) };
                        setFormData({ ...formData, incubatorInvestment: newInvestment });
                      }}
                    />
                    <Input
                      label="State"
                      type="text"
                      value={formatNumber(investment.state)}
                      onChange={(e) => {
                        const newInvestment = [...(formData.incubatorInvestment || [])];
                        newInvestment[idx] = { ...newInvestment[idx], state: parseNumber(e.target.value) };
                        setFormData({ ...formData, incubatorInvestment: newInvestment });
                      }}
                    />
                    <Input
                      label="Privates"
                      type="text"
                      value={formatNumber(investment.privates)}
                      onChange={(e) => {
                        const newInvestment = [...(formData.incubatorInvestment || [])];
                        newInvestment[idx] = { ...newInvestment[idx], privates: parseNumber(e.target.value) };
                        setFormData({ ...formData, incubatorInvestment: newInvestment });
                      }}
                    />
                    <Input
                      label="Current Year Investment"
                      type="text"
                      value={formatNumber(investment.currentYearInvestment)}
                      onChange={(e) => {
                        const newInvestment = [...(formData.incubatorInvestment || [])];
                        newInvestment[idx] = { ...newInvestment[idx], currentYearInvestment: parseNumber(e.target.value) };
                        setFormData({ ...formData, incubatorInvestment: newInvestment });
                      }}
                    />
                    <Input
                      label="Cumulative Investment"
                      type="text"
                      value={formatNumber(investment.cumulativeInvestment)}
                      onChange={(e) => {
                        const newInvestment = [...(formData.incubatorInvestment || [])];
                        newInvestment[idx] = { ...newInvestment[idx], cumulativeInvestment: parseNumber(e.target.value) };
                        setFormData({ ...formData, incubatorInvestment: newInvestment });
                      }}
                    />
                  </div>
                </div>
              ))}
              <Button
                variant="outline"
                onClick={() => {
                  const newInvestment = [...(formData.incubatorInvestment || []), { year: new Date().getFullYear() }];
                  setFormData({ ...formData, incubatorInvestment: newInvestment });
                }}
              >
                + Add Investment Year
              </Button>
            </div>
          </Card>

          <Card title="Projects">
            <div className="space-y-4">
              {(formData.incubatorProjects || []).map((project, idx) => (
                <div key={idx} className="border p-4 rounded-lg space-y-2">
                  <div className="flex justify-between items-center mb-2">
                    <h5 className="font-semibold">Year {project.year}</h5>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const newProjects = [...(formData.incubatorProjects || [])];
                        newProjects.splice(idx, 1);
                        setFormData({ ...formData, incubatorProjects: newProjects });
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Year"
                      type="number"
                      value={project.year}
                      onChange={(e) => {
                        const newProjects = [...(formData.incubatorProjects || [])];
                        newProjects[idx] = { ...newProjects[idx], year: parseInt(e.target.value) };
                        setFormData({ ...formData, incubatorProjects: newProjects });
                      }}
                    />
                    <Input
                      label="Projects Count"
                      type="text"
                      value={formatNumber(project.projectsCount)}
                      onChange={(e) => {
                        const newProjects = [...(formData.incubatorProjects || [])];
                        newProjects[idx] = { ...newProjects[idx], projectsCount: parseInteger(e.target.value) };
                        setFormData({ ...formData, incubatorProjects: newProjects });
                      }}
                    />
                    <Input
                      label="Fund"
                      type="text"
                      value={formatNumber(project.fund)}
                      onChange={(e) => {
                        const newProjects = [...(formData.incubatorProjects || [])];
                        newProjects[idx] = { ...newProjects[idx], fund: parseNumber(e.target.value) };
                        setFormData({ ...formData, incubatorProjects: newProjects });
                      }}
                    />
                  </div>
                </div>
              ))}
              <Button
                variant="outline"
                onClick={() => {
                  const newProjects = [...(formData.incubatorProjects || []), { year: new Date().getFullYear() }];
                  setFormData({ ...formData, incubatorProjects: newProjects });
                }}
              >
                + Add Project Year
              </Button>
            </div>
          </Card>

          <div className="flex justify-end gap-3">
            <Button variant="outline" type="button" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Incubator'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
