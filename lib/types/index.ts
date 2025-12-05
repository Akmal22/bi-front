// User types
export type UserRole = 'ADMIN' | 'MANAGER' | 'USER';

export interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  enabled: boolean;
  role: UserRole;
  password?: string;
}

export interface CreateUserRequest {
  username: string;
  password: string;
  email: string;
  role: UserRole;
  fullName?: string;
  enabled?: boolean;
}

// Authentication types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  status: 'SUCCESS' | 'FAIL';
  username: string;
  role: UserRole;
}

// Country types
export interface Country {
  countryCode: string;
  countryName: string;
  currencyCode: number;
  currencyName: string;
}

export interface CreateCountryRequest {
  countryName: string;
  countryCode: string;
  currencyName: string;
  currencyCode: number;
}

export interface UpdateCountryRequest {
  countryName: string;
  countryCode: string;
  currencyName: string;
  currencyCode: number;
}

export interface CountryListResponse {
  status: 'SUCCESS' | 'FAIL';
  countries: Country[];
}

// Incubator types
export type AverageEmployeePerResident = 
  | 'MORE_THAN_ONE_PER_ONE_RESIDENT'
  | 'ONE_PER_ONE_RESIDENT'
  | 'LESS_THAN_ONE_PER_ONE_RESIDENT';

export type ShareAmount = 
  | 'MONETARY_COST_BUT_NO_SHARES'
  | 'BETWEEN_1_AND_5_PERCENT'
  | 'BETWEEN_1_AND_10_PERCENT'
  | 'BETWEEN_1_AND_20_PERCENT'
  | 'BETWEEN_10_AND_20_PERCENT'
  | 'MORE_THAN_15_PERCENT'
  | 'FIXED';

export interface IncubatorCharacteristics {
  averageEmployeePerResident: AverageEmployeePerResident;
  shareAmount: ShareAmount;
  totalStaff?: number;
  expertsAndConsultants?: number;
  managers?: number;
  monitoringAndDataCollecting?: boolean;
  requirements?: string;
}

export interface IncubatorInfrastructure {
  sectorsCovered?: number;
  yearsInOperation?: number;
  programmeDuration?: number;
}

export interface IncubatorSpace {
  overallSpace?: number;
  avgResidentSpace?: number;
  communalSpace?: number;
  adminSpace?: number;
  communalSpaceRatio?: number;
}

export interface IncubatorResidents {
  year: number;
  incubatedCompanies?: number;
  failedCompanies?: number;
  graduatedCompanies?: number;
  receivedApplication?: number;
  acceptedApplication?: number;
  activeAfter3Months?: number;
  activeAfter6Months?: number;
  activeAfter1Year?: number;
  activeAfter3Years?: number;
  activeAfter5Years?: number;
  failedAfter3Months?: number;
  failedAfter6Months?: number;
  failedAfter1Year?: number;
  failedAfter3Years?: number;
  failedAfter5Years?: number;
}

export interface IncubatorService {
  offeredServices?: number;
  freeServices?: number;
  paidServices?: number;
  usedServices?: number;
  offeredFacilities?: number;
  freeFacilities?: number;
  paidFacilities?: number;
  usedFacilities?: number;
  offeredTrainings?: number;
  freeTrainings?: number;
  paidTrainings?: number;
  usedTrainings?: number;
}

export interface IncubatorIncome {
  year: number;
  initialCapital?: number;
  paidServicesIncome?: number;
  paidTrainingIncome?: number;
  paidFacilitiesIncome?: number;
  donors?: number;
  state?: number;
  loans?: number;
}

export interface IncubatorInvestment {
  year: number;
  seed?: number;
  state?: number;
  privates?: number;
  currentYearInvestment?: number;
  cumulativeInvestment?: number;
}

export interface IncubatorExpense {
  payroll?: number;
  equipment?: number;
  utilities?: number;
  tax?: number;
  rents?: number;
  bankRepayments?: number;
  material?: number;
  insurance?: number;
}

export interface IncubatorProjects {
  year: number;
  projectsCount?: number;
  fund?: number;
}

export interface SimpleIncubator {
  incubatorUuid: string;
  name: string;
  description: string;
  founded: string;
}

export interface IncubatorRequest {
  name: string;
  description: string;
  managerId?: number;
  countryCode: string;
  founded: string;
  incubatorCharacteristics: IncubatorCharacteristics;
  incubatorInfrastructure: IncubatorInfrastructure;
  incubatorSpace: IncubatorSpace;
  incubatorResidents: IncubatorResidents[];
  incubatorServices: IncubatorService;
  incubatorIncome: IncubatorIncome[];
  incubatorInvestment: IncubatorInvestment[];
  incubatorExpense: IncubatorExpense;
  incubatorProjects: IncubatorProjects[];
}

export interface UpdateIncubatorRequest {
  uuid: string;
  description: string;
  founded: string;
  incubatorCharacteristics?: IncubatorCharacteristics;
  incubatorInfrastructure?: IncubatorInfrastructure;
  incubatorSpace?: IncubatorSpace;
  incubatorResidents?: IncubatorResidents[];
  incubatorServices?: IncubatorService;
  incubatorIncome?: IncubatorIncome[];
  incubatorInvestment?: IncubatorInvestment[];
  incubatorExpense?: IncubatorExpense;
  incubatorProjects?: IncubatorProjects[];
}

export interface GetIncubatorsRequest {
  page: number;
  size: number;
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface GetIncubatorsResponse {
  status: 'SUCCESS' | 'FAIL';
  incubators: SimpleIncubator[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface ManagerInfo {
  id: number;
  username: string;
  email: string;
  fullName: string;
}

export interface CountryInfo {
  countryCode: string;
  countryName: string;
}

export interface Incubator {
  name: string;
  description: string;
  manager?: ManagerInfo;
  country: CountryInfo;
  founded: string;
  incubatorCharacteristics: IncubatorCharacteristics;
  incubatorInfrastructure?: IncubatorInfrastructure;
  incubatorSpace?: IncubatorSpace;
  incubatorResidents?: IncubatorResidents[];
  incubatorServices?: IncubatorService;
  incubatorIncome?: IncubatorIncome[];
  incubatorInvestment?: IncubatorInvestment[];
  incubatorExpense?: IncubatorExpense;
  incubatorProjects?: IncubatorProjects[];
}

export interface IncubatorResponse {
  status: 'SUCCESS' | 'FAIL';
  incubator: Incubator;
}

export interface CreateUpdateIncubatorResponse {
  status: 'SUCCESS' | 'FAIL';
  incubatorUuid: string;
}

// Report types
// Based on Swagger documentation: http://localhost:8080/bi/v3/api-docs

export interface IncubatorProjectsInfo {
  year: number;
  projectsCount: number;
}

export interface IncubatorIncomeInfo {
  year: number;
  income: number;
}

export interface IncubatorFundInfo {
  year: number;
  amount: number;
}

export interface IncubatorApplicationsInfo {
  year: number;
  applicationCount: number;
}

// ShortReportResponse - response from GET /bi/report/short/{incubatorUuid}
// Based on Swagger documentation: http://localhost:8080/bi/v3/api-docs
export interface ShortReportResponse {
  status: 'SUCCESS' | 'FAIL';
  country?: Country;
  managerInfo?: ManagerInfo;
  incubatorProjectInfos?: IncubatorProjectsInfo[];
  incubatorIncomeInfo?: IncubatorIncomeInfo[];
  incubatorFundInfo?: IncubatorFundInfo[];
  applications?: IncubatorApplicationsInfo[];
}

// DemographicData - demographic data from full report
export interface DemographicData {
  avgServiceCost?: number;
  serviceCostVariance?: number;
  serviceAdoptionIndex?: number;
  serviceCostIndex?: number;
  avgFacilityCost?: number;
  facilityCostVariance?: number;
  facilityAdoptionIndex?: number;
  facilityCostIndex?: number;
  avgTrainingCost?: number;
  trainingCostVariance?: number;
  trainingAdoptionIndex?: number;
  trainingCostIndex?: number;
  freeToPaidServicesRatio?: number;
  freeToPaidFacilitiesRatio?: number;
  freeToPaidTrainingsRatio?: number;
}

// ApplicantKpiData - applicant KPI data from full report
export interface ApplicantKpiData {
  acceptanceRatio?: number;
  companiesFailureIndex?: number;
  companiesGraduationIndex?: number;
  graduatedCompaniesSurvivalRate?: number;
  moralityRateAfter1Year?: number;
  moralityRateAfter3Years?: number;
  moralityRateAfter5Years?: number;
}

// FullReportResponse - response from GET /bi/report/full/{incubatorUuid}
// Based on Swagger documentation: http://localhost:8080/bi/v3/api-docs
export interface FullReportResponse {
  status: 'SUCCESS' | 'FAIL';
  country?: Country;
  managerInfo?: ManagerInfo;
  incubatorProjectInfos?: IncubatorProjectsInfo[];
  incubatorIncomeInfo?: IncubatorIncomeInfo[];
  incubatorFundInfo?: IncubatorFundInfo[];
  applications?: IncubatorApplicationsInfo[];
  demographicData?: DemographicData;
  applicantKpiData?: ApplicantKpiData;
}

// Pagination types
export interface GetUsersRequest {
  page: number;
  size: number;
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface GetUsersResponse {
  status: 'SUCCESS' | 'FAIL';
  users: User[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}
