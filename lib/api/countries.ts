import { apiClient } from './client';
import type { CountryListResponse, CreateCountryRequest, UpdateCountryRequest, Country } from '../types';

export const countriesApi = {
  getCountries: async (): Promise<CountryListResponse> => {
    return apiClient.get<CountryListResponse>('/countries');
  },

  getCountry: async (countryCode: string): Promise<{ status: string; country: Country }> => {
    return apiClient.get<{ status: string; country: Country }>(`/countries/${countryCode}`);
  },

  createCountry: async (country: CreateCountryRequest): Promise<void> => {
    await apiClient.post('/countries', country);
  },

  updateCountry: async (country: UpdateCountryRequest): Promise<void> => {
    await apiClient.put('/countries', country);
  },
};
