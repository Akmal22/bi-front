'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { incubatorsApi } from '@/lib/api/incubators';
import { reportsApi } from '@/lib/api/reports';
import type { SimpleIncubator, ShortReportResponse, FullReportResponse, DemographicData, ApplicantKpiData, Country } from '@/lib/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

// Helper function to format currency based on country's currencyCode
const formatCurrency = (value: number, country?: Country): string => {
  if (!country?.currencyCode) {
    // Fallback to currency name if available, otherwise use generic format
    if (country?.currencyName) {
      return `${country.currencyName} ${value.toLocaleString()}`;
    }
    return `${value.toLocaleString()}`;
  }
  
  try {
    // Map common ISO 4217 numeric codes to currency string codes
    const currencyCodeMap: { [key: number]: string } = {
      840: 'USD', // US Dollar
      978: 'EUR', // Euro
      398: 'KZT', // Kazakhstani Tenge
      643: 'RUB', // Russian Ruble
      810: 'RUB', // Russian Ruble (RUR - old code, mapped to RUB)
      156: 'CNY', // Chinese Yuan
      826: 'GBP', // British Pound
      392: 'JPY', // Japanese Yen
    };
    
    const currencyString = currencyCodeMap[country.currencyCode];
    
    // If we have a mapped currency code, use Intl.NumberFormat
    if (currencyString) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currencyString,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value);
    }
    
    // If currency code is not mapped, try using currencyName as currency code
    if (country.currencyName) {
      try {
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: country.currencyName.toUpperCase(),
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(value);
      } catch {
        // If currencyName is not a valid ISO 4217 code, use it as a symbol
        return `${country.currencyName} ${value.toLocaleString()}`;
      }
    }
    
    // Last resort: format without currency symbol
    return `${value.toLocaleString()}`;
  } catch (error) {
    // Fallback to currency name if available
    if (country?.currencyName) {
      return `${country.currencyName} ${value.toLocaleString()}`;
    }
    // Last resort: format without currency symbol
    return `${value.toLocaleString()}`;
  }
};

export default function ReportsPage() {
  const { user } = useAuth();
  const [incubators, setIncubators] = useState<SimpleIncubator[]>([]);
  const [selectedIncubator, setSelectedIncubator] = useState<string>('');
  const [shortReport, setShortReport] = useState<ShortReportResponse | null>(null);
  const [fullReport, setFullReport] = useState<FullReportResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [reportType, setReportType] = useState<'short' | 'full'>('short');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    loadIncubators();
  }, []);

  const loadIncubators = async () => {
    try {
      const response = await incubatorsApi.getIncubators({ page: 0, size: 100 });
      setIncubators(response.incubators);
    } catch (error) {
      console.error('Failed to load incubators:', error);
    }
  };

  const handleGenerateReport = async () => {
    if (!selectedIncubator) {
      setErrorMessage('Please select an incubator');
      return;
    }

    setSuccessMessage('');
    setErrorMessage('');
    setIsLoading(true);
    try {
      if (reportType === 'short') {
        const response = await reportsApi.getShortReport(selectedIncubator);
        setShortReport(response);
        setFullReport(null);
      } else {
        const response = await reportsApi.getFullReport(selectedIncubator);
        setFullReport(response);
        setShortReport(null);
        // Don't show success message for full report as per user request
      }
    } catch (error: any) {
      console.error('Failed to generate report:', error);
      // Only show error if it's a 4xx or 5xx status code
      if (error?.status && error.status >= 400 && error.status < 600) {
        // Check if response body has a message field
        if (error?.details && error.details.message) {
          setErrorMessage(error.details.message);
        } else {
          setErrorMessage('Error while report generation');
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Generate Reports</h1>
        <p className="text-gray-600 mt-2">Select an incubator and generate analytics reports</p>
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

      <Card title="Report Configuration">
        <div className="space-y-4">
          <Select
            label="Report Type"
            value={reportType}
            onChange={(e) => {
              setReportType(e.target.value as 'short' | 'full');
              setShortReport(null);
              setFullReport(null);
              setErrorMessage('');
            }}
            options={[
              { value: 'short', label: 'Short Report' },
              { value: 'full', label: 'Full Report' },
            ]}
          />

          <Select
            label="Select Incubator"
            value={selectedIncubator}
            onChange={(e) => {
              setSelectedIncubator(e.target.value);
              setShortReport(null);
              setFullReport(null);
              setErrorMessage('');
            }}
            options={[
              { value: '', label: '-- Select an incubator --' },
              ...incubators.map((inc) => ({
                value: inc.incubatorUuid,
                label: `${inc.name} (${new Date(inc.founded).getFullYear()})`,
              })),
            ]}
          />

          <Button onClick={handleGenerateReport} disabled={isLoading || !selectedIncubator}>
            {isLoading ? 'Generating...' : 'Generate Report'}
          </Button>
        </div>
      </Card>

      {shortReport && reportType === 'short' && (
        <div className="mt-6 space-y-6">
          {/* Additional Info: Country and Manager */}
          {(shortReport.country?.countryName || shortReport.managerInfo?.fullName || shortReport.managerInfo?.email) && (
            <Card title="Additional Information">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {shortReport.country?.countryName && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Country</p>
                    <p className="text-lg font-semibold text-gray-800">{shortReport.country.countryName}</p>
                  </div>
                )}
                {(shortReport.managerInfo?.fullName || shortReport.managerInfo?.email) && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Manager</p>
                    {shortReport.managerInfo.fullName && (
                      <p className="text-lg font-semibold text-gray-800">{shortReport.managerInfo.fullName}</p>
                    )}
                    {shortReport.managerInfo.email && (
                      <p className="text-sm text-gray-600">{shortReport.managerInfo.email}</p>
                    )}
                  </div>
                )}
              </div>
            </Card>
          )}

          {shortReport.incubatorProjectInfos && shortReport.incubatorProjectInfos.length > 0 && (
            <Card title="Projects Growth">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={shortReport.incubatorProjectInfos.map(p => ({ year: p.year, count: p.projectsCount }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} name="Projects Count" />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          )}

          {shortReport.incubatorIncomeInfo && shortReport.incubatorIncomeInfo.length > 0 && (
            <Card title="Income Growth">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={shortReport.incubatorIncomeInfo.map(i => ({ year: i.year, income: i.income }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis tickFormatter={(value: number) => formatCurrency(value, shortReport.country)} />
                  <Tooltip formatter={(value: number) => formatCurrency(value, shortReport.country)} />
                  <Legend />
                  <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} name={`Income (${shortReport.country?.currencyName || 'Currency'})`} />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          )}

          {shortReport.incubatorFundInfo && shortReport.incubatorFundInfo.length > 0 && (
            <Card title="Fund Growth">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={shortReport.incubatorFundInfo.map(f => ({ year: f.year, amount: f.amount }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis tickFormatter={(value: number) => formatCurrency(value, shortReport.country)} />
                  <Tooltip formatter={(value: number) => formatCurrency(value, shortReport.country)} />
                  <Legend />
                  <Line type="monotone" dataKey="amount" stroke="#8b5cf6" strokeWidth={2} name={`Fund Amount (${shortReport.country?.currencyName || 'Currency'})`} />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          )}

          {shortReport.applications && shortReport.applications.length > 0 && (
            <Card title="Applications Growth">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={shortReport.applications.map(a => ({ year: a.year, count: a.applicationCount }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="count" stroke="#f59e0b" strokeWidth={2} name="Application Count" />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          )}
        </div>
      )}

      {fullReport && reportType === 'full' && fullReport.status === 'SUCCESS' && (
        <div className="mt-6 space-y-8">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white shadow-lg">
            <h2 className="text-3xl font-bold mb-2">Full Report</h2>
            <p className="text-blue-100 mt-2">Comprehensive analysis and statistics</p>
          </div>

          {/* Additional Info: Country and Manager */}
          {(fullReport.country?.countryName || fullReport.managerInfo?.fullName || fullReport.managerInfo?.email) && (
            <Card title="Additional Information">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {fullReport.country?.countryName && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Country</p>
                    <p className="text-lg font-semibold text-gray-800">{fullReport.country.countryName}</p>
                  </div>
                )}
                {(fullReport.managerInfo?.fullName || fullReport.managerInfo?.email) && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Manager</p>
                    {fullReport.managerInfo.fullName && (
                      <p className="text-lg font-semibold text-gray-800">{fullReport.managerInfo.fullName}</p>
                    )}
                    {fullReport.managerInfo.email && (
                      <p className="text-sm text-gray-600">{fullReport.managerInfo.email}</p>
                    )}
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Key Metrics Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {fullReport.incubatorProjectInfos && fullReport.incubatorProjectInfos.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-5 border-l-4 border-blue-500">
                <p className="text-sm text-gray-600 mb-1">Total Projects</p>
                <p className="text-3xl font-bold text-gray-800">
                  {fullReport.incubatorProjectInfos.reduce((sum, p) => sum + (p.projectsCount || 0), 0)}
                </p>
                <p className="text-xs text-gray-500 mt-2">Across {fullReport.incubatorProjectInfos.length} years</p>
              </div>
            )}
            {fullReport.incubatorFundInfo && fullReport.incubatorFundInfo.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-5 border-l-4 border-purple-500">
                <p className="text-sm text-gray-600 mb-1">Total Fund</p>
                <p className="text-3xl font-bold text-gray-800">
                  {formatCurrency(fullReport.incubatorFundInfo.reduce((sum, f) => sum + (f.amount || 0), 0), fullReport.country)}
                </p>
                <p className="text-xs text-gray-500 mt-2">Cumulative fund</p>
              </div>
            )}
            {fullReport.incubatorIncomeInfo && fullReport.incubatorIncomeInfo.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-5 border-l-4 border-green-500">
                <p className="text-sm text-gray-600 mb-1">Total Income</p>
                <p className="text-3xl font-bold text-gray-800">
                  {formatCurrency(fullReport.incubatorIncomeInfo.reduce((sum, i) => sum + (i.income || 0), 0), fullReport.country)}
                </p>
                <p className="text-xs text-gray-500 mt-2">Cumulative income</p>
              </div>
            )}
            {fullReport.applications && fullReport.applications.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-5 border-l-4 border-orange-500">
                <p className="text-sm text-gray-600 mb-1">Total Applications</p>
                <p className="text-3xl font-bold text-gray-800">
                  {fullReport.applications.reduce((sum, a) => sum + (a.applicationCount || 0), 0)}
                </p>
                <p className="text-xs text-gray-500 mt-2">Total received</p>
              </div>
            )}
          </div>

          {/* Simple Charts Section - Similar to Short Report */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Projects Growth */}
            {fullReport.incubatorProjectInfos && fullReport.incubatorProjectInfos.length > 0 && (
              <Card title="Projects Growth">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={fullReport.incubatorProjectInfos.map(p => ({ year: p.year, count: p.projectsCount || 0 }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} name="Projects Count" />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            )}

            {/* Fund Growth */}
            {fullReport.incubatorFundInfo && fullReport.incubatorFundInfo.length > 0 && (
              <Card title="Fund Growth">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart 
                    data={fullReport.incubatorFundInfo.map(f => ({ year: f.year, amount: f.amount || 0 }))}
                    margin={{ top: 5, right: 30, left: 50, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis 
                      tickFormatter={(value: number) => formatCurrency(value, fullReport.country)}
                      width={80}
                    />
                    <Tooltip 
                      formatter={(value: number) => [formatCurrency(value, fullReport.country), 'Fund Amount']}
                      contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="amount" stroke="#8b5cf6" strokeWidth={2} name={`Fund Amount (${fullReport.country?.currencyName || 'Currency'})`} />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            )}

            {/* Income Growth */}
            {fullReport.incubatorIncomeInfo && fullReport.incubatorIncomeInfo.length > 0 && (
              <Card title="Income Growth">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart 
                    data={fullReport.incubatorIncomeInfo.map(i => ({ year: i.year, income: i.income || 0 }))}
                    margin={{ top: 5, right: 30, left: 50, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis 
                      tickFormatter={(value: number) => formatCurrency(value, fullReport.country)}
                      width={80}
                    />
                    <Tooltip 
                      formatter={(value: number) => [formatCurrency(value, fullReport.country), 'Income']}
                      contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} name={`Income (${fullReport.country?.currencyName || 'Currency'})`} />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            )}

            {/* Applications Growth */}
            {fullReport.applications && fullReport.applications.length > 0 && (
              <Card title="Applications Growth">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={fullReport.applications.map(a => ({ year: a.year, count: a.applicationCount || 0 }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="count" stroke="#f59e0b" strokeWidth={2} name="Application Count" />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            )}
          </div>

          {/* Demographic Data */}
          {fullReport.demographicData && (
            <Card title="📊 Demographic Data & KPIs">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Service Metrics */}
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <h3 className="text-lg font-semibold text-blue-800 mb-3">Service Metrics</h3>
                  <div className="space-y-2 text-sm">
                    {fullReport.demographicData.avgServiceCost !== undefined && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Avg Cost:</span>
                        <span className="font-bold">{formatCurrency(fullReport.demographicData.avgServiceCost, fullReport.country)}</span>
                      </div>
                    )}
                    {fullReport.demographicData.serviceCostVariance !== undefined && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Cost Variance:</span>
                        <span className="font-bold">{formatCurrency(fullReport.demographicData.serviceCostVariance, fullReport.country)}</span>
                      </div>
                    )}
                    {fullReport.demographicData.serviceCostIndex !== undefined && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Cost Index:</span>
                        <span className="font-bold">{formatCurrency(fullReport.demographicData.serviceCostIndex, fullReport.country)}</span>
                      </div>
                    )}
                    {fullReport.demographicData.serviceAdoptionIndex !== undefined && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Adoption Index:</span>
                        <span className="font-bold">{(fullReport.demographicData.serviceAdoptionIndex * 100).toFixed(1)}%</span>
                      </div>
                    )}
                    {fullReport.demographicData.freeToPaidServicesRatio !== undefined && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Free/Paid Ratio:</span>
                        <span className="font-bold">{fullReport.demographicData.freeToPaidServicesRatio.toFixed(2)}%</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Facility Metrics */}
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <h3 className="text-lg font-semibold text-green-800 mb-3">Facility Metrics</h3>
                  <div className="space-y-2 text-sm">
                    {fullReport.demographicData.avgFacilityCost !== undefined && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Avg Cost:</span>
                        <span className="font-bold">{formatCurrency(fullReport.demographicData.avgFacilityCost, fullReport.country)}</span>
                      </div>
                    )}
                    {fullReport.demographicData.facilityCostVariance !== undefined && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Cost Variance:</span>
                        <span className="font-bold">{formatCurrency(fullReport.demographicData.facilityCostVariance, fullReport.country)}</span>
                      </div>
                    )}
                    {fullReport.demographicData.facilityCostIndex !== undefined && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Cost Index:</span>
                        <span className="font-bold">{formatCurrency(fullReport.demographicData.facilityCostIndex, fullReport.country)}</span>
                      </div>
                    )}
                    {fullReport.demographicData.facilityAdoptionIndex !== undefined && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Adoption Index:</span>
                        <span className="font-bold">{(fullReport.demographicData.facilityAdoptionIndex * 100).toFixed(1)}%</span>
                      </div>
                    )}
                    {fullReport.demographicData.freeToPaidFacilitiesRatio !== undefined && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Free/Paid Ratio:</span>
                        <span className="font-bold">{fullReport.demographicData.freeToPaidFacilitiesRatio.toFixed(2)}%</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Training Metrics */}
                <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                  <h3 className="text-lg font-semibold text-purple-800 mb-3">Training Metrics</h3>
                  <div className="space-y-2 text-sm">
                    {fullReport.demographicData.avgTrainingCost !== undefined && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Avg Cost:</span>
                        <span className="font-bold">{formatCurrency(fullReport.demographicData.avgTrainingCost, fullReport.country)}</span>
                      </div>
                    )}
                    {fullReport.demographicData.trainingCostVariance !== undefined && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Cost Variance:</span>
                        <span className="font-bold">{formatCurrency(fullReport.demographicData.trainingCostVariance, fullReport.country)}</span>
                      </div>
                    )}
                    {fullReport.demographicData.trainingCostIndex !== undefined && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Cost Index:</span>
                        <span className="font-bold">{formatCurrency(fullReport.demographicData.trainingCostIndex, fullReport.country)}</span>
                      </div>
                    )}
                    {fullReport.demographicData.trainingAdoptionIndex !== undefined && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Adoption Index:</span>
                        <span className="font-bold">{(fullReport.demographicData.trainingAdoptionIndex * 100).toFixed(1)}%</span>
                      </div>
                    )}
                    {fullReport.demographicData.freeToPaidTrainingsRatio !== undefined && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Free/Paid Ratio:</span>
                        <span className="font-bold">{fullReport.demographicData.freeToPaidTrainingsRatio.toFixed(2)}%</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Applicant KPI Data */}
          {fullReport.applicantKpiData && (
            <Card title="📈 Applicant KPI Metrics">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {fullReport.applicantKpiData.acceptanceRatio !== undefined && (
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <p className="text-xs font-medium text-blue-600 uppercase tracking-wide mb-1">Acceptance Ratio</p>
                    <p className="text-2xl font-bold text-blue-700">{fullReport.applicantKpiData.acceptanceRatio.toFixed(2)}%</p>
                  </div>
                )}
                {fullReport.applicantKpiData.companiesFailureIndex !== undefined && (
                  <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                    <p className="text-xs font-medium text-red-600 uppercase tracking-wide mb-1">Failure Index</p>
                    <p className="text-2xl font-bold text-red-700">{fullReport.applicantKpiData.companiesFailureIndex.toFixed(2)}%</p>
                  </div>
                )}
                {fullReport.applicantKpiData.companiesGraduationIndex !== undefined && (
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <p className="text-xs font-medium text-green-600 uppercase tracking-wide mb-1">Graduation Index</p>
                    <p className="text-2xl font-bold text-green-700">{fullReport.applicantKpiData.companiesGraduationIndex.toFixed(2)}%</p>
                  </div>
                )}
                {fullReport.applicantKpiData.graduatedCompaniesSurvivalRate !== undefined && (
                  <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                    <p className="text-xs font-medium text-purple-600 uppercase tracking-wide mb-1">Survival Rate</p>
                    <p className="text-2xl font-bold text-purple-700">{fullReport.applicantKpiData.graduatedCompaniesSurvivalRate.toFixed(2)}%</p>
                  </div>
                )}
                {fullReport.applicantKpiData.moralityRateAfter1Year !== undefined && (
                  <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                    <p className="text-xs font-medium text-orange-600 uppercase tracking-wide mb-1">Morality Rate (1 Year)</p>
                    <p className="text-2xl font-bold text-orange-700">{fullReport.applicantKpiData.moralityRateAfter1Year.toFixed(2)}%</p>
                  </div>
                )}
                {fullReport.applicantKpiData.moralityRateAfter3Years !== undefined && (
                  <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                    <p className="text-xs font-medium text-amber-600 uppercase tracking-wide mb-1">Morality Rate (3 Years)</p>
                    <p className="text-2xl font-bold text-amber-700">{fullReport.applicantKpiData.moralityRateAfter3Years.toFixed(2)}%</p>
                  </div>
                )}
                {fullReport.applicantKpiData.moralityRateAfter5Years !== undefined && (
                  <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                    <p className="text-xs font-medium text-yellow-600 uppercase tracking-wide mb-1">Morality Rate (5 Years)</p>
                    <p className="text-2xl font-bold text-yellow-700">{fullReport.applicantKpiData.moralityRateAfter5Years.toFixed(2)}%</p>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
