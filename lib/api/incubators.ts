import { apiClient } from './client';
import type {
  GetIncubatorsRequest,
  GetIncubatorsResponse,
  IncubatorRequest,
  UpdateIncubatorRequest,
  IncubatorResponse,
  CreateUpdateIncubatorResponse,
} from '../types';

export const incubatorsApi = {
  getIncubators: async (request: GetIncubatorsRequest): Promise<GetIncubatorsResponse> => {
    return apiClient.post<GetIncubatorsResponse>('/incubators/list', request);
  },

  getIncubator: async (uuid: string): Promise<IncubatorResponse> => {
    return apiClient.get<IncubatorResponse>(`/incubators/${uuid}`);
  },

  createIncubator: async (incubator: IncubatorRequest): Promise<CreateUpdateIncubatorResponse> => {
    return apiClient.post<CreateUpdateIncubatorResponse>('/incubators', incubator);
  },

  updateIncubator: async (incubator: UpdateIncubatorRequest): Promise<CreateUpdateIncubatorResponse> => {
    return apiClient.put<CreateUpdateIncubatorResponse>('/incubators', incubator);
  },
};
