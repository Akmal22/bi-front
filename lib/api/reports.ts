import { apiClient } from './client';
import type { ShortReportResponse, FullReportResponse } from '../types';

export const reportsApi = {
  getShortReport: async (incubatorUuid: string, startYear: number, endYear: number): Promise<ShortReportResponse> => {
    return apiClient.get<ShortReportResponse>(`/report/short/${incubatorUuid}?start=${startYear}&end=${endYear}`);
  },

  getFullReport: async (incubatorUuid: string): Promise<FullReportResponse> => {
    // Endpoint: /bi/report/full/{incubatorUuid}
    // Base URL is http://localhost:8080/bi, endpoint /report/full/{uuid} results in /bi/report/full/{uuid}
    return apiClient.get<FullReportResponse>(`/report/full/${incubatorUuid}`);
  },
};
