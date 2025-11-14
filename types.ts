
export enum LeadScore {
  A = 'A',
  B = 'B',
  C = 'C',
}

export enum Status {
  New = 'New',
  Contacted = 'Contacted',
  MeetingSet = 'Meeting Set',
  ProposalSent = 'Proposal Sent',
  PreQualified = 'Pre-Qualified',
  Won = 'Won',
  Lost = 'Lost',
}

export enum FinancingStatus {
    NotOffered = 'Not Offered',
    Pending = 'Pending',
    PreQualified = 'Pre-Qualified',
    Approved = 'Approved',
    Denied = 'Denied',
}

export enum FinancingPlan {
    TenYear = '10-Year Fixed',
    FifteenYear = '15-Year Fixed',
    TwentyYear = '20-Year Fixed',
}

export enum LeadSource {
    AI = 'AI Lookup',
    Manual = 'Manual Entry',
    Web = 'Web Form',
}

export enum ProjectPhaseStatus {
    Upcoming = 'Upcoming',
    InProgress = 'In Progress',
    Completed = 'Completed',
}

export enum FinancialTransactionType {
    Revenue = 'Revenue',
    Expense = 'Expense',
}

export enum SubscriptionTier {
    Free = 'Free',
    Pro = 'Pro',
    Enterprise = 'Enterprise',
}

export interface ServiceMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  timestamp: string;
  isRead: boolean;
}

export interface Lender {
    id: string;
    name: string;
    logo: string; // emoji or url
    minAPR: number;
    maxLoanAmount: number;
    commissionRate: number; // e.g., 0.01 for 1%
}

export interface FinancialTransaction {
    id: string;
    type: FinancialTransactionType;
    date: string;
    amount: number;
    description: string;
    category?: string;
    receiptImage?: string; // base64
}

export interface ProjectSuggestion {
  name: string;
  reason: string;
  estimatedCost: number;
  estimatedROI: number;
}

export interface Dossier {
  ownerName: string;
  estimatedValue: number;
  taxLiens: boolean;
  mortgageDetails: {
    originalLoanAmount: number;
    loanYear: number;
    lenderName: string;
    estimatedRate: number;
    estimatedMonthlyPayment: number;
    estimatedRemainingBalance?: number;
  };
  propertyDetails: {
    yearBuilt: number;
    sqFootage: number;
    bedrooms: number;
    bathrooms: number;
    lastSaleDate: string;
    lastSalePrice: number;
    lotSize?: string;
    yearRenovated?: number;
    hoaFees?: number;
    propertyType?: string;
    roofingMaterial?: string;
    exteriorFinish?: string;
    heatingSystem?: string;
    coolingSystem?: string;
  };
  demographics: {
    estHouseholdIncome: string;
    estOwnerAgeRange: string;
    lifeStageProfile: string;
    maritalStatus: string;
  };
  projectSuggestions?: ProjectSuggestion[];
  neighborhoodInfo?: {
      walkScore?: string;
      crimeRate?: string;
      vibe?: string;
  };
  schoolRatings?: string;
  recentPermits?: string;
  publicRecordLinks?: string[];
  ownerProfile?: {
      professionalTitle?: string;
      company?: string;
      linkedinSummary?: string;
      publicNotes?: string;
      hobbies?: string[];
      recentEvents?: string;
      email?: string;
      phone?: string;
  };
  solarPotential?: string;
  floodRisk?: string;
  fireRisk?: string;
}

export interface ActivityLogItem {
    id: string;
    timestamp: string;
    note: string;
}

export interface GroundingSource {
    uri?: string;
    title?: string;
}

export interface GroundingChunk {
    web?: GroundingSource;
    maps?: GroundingSource;
}

export interface QuoteLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface Quote {
  id: string;
  createdAt: string;
  contractorName?: string;
  lineItems: QuoteLineItem[];
  notes: string;
  total: number;
  materialCost?: number;
  laborCost?: number;
  expectedProfit?: number;
}

export interface ChangeOrder {
  id: string;
  createdAt: string;
  description: string;
  scopeOfWork: string;
  lineItems: QuoteLineItem[];
  total: number;
}

export interface ProjectPhase {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    status: ProjectPhaseStatus;
}

export interface ProjectSchedule {
    id: string;
    phases: ProjectPhase[];
    projectDuration?: string;
}

export interface Lead {
  id: string;
  address: string;
  dossier: Dossier;
  leadScore: LeadScore;
  leadScoreValue?: number;
  leadScoreUncertainty?: number;
  status: Status;
  financingStatus: FinancingStatus;
  estimatedEquity: number;
  coords: {
    lat: number;
    lng: number;
  };
  activityLog: ActivityLogItem[];
  groundingChunks?: GroundingChunk[];
  quote?: Quote;
  source: LeadSource;
  isArchived: boolean;
  finances?: FinancialTransaction[];
  propertyImage?: string;
  schedule?: ProjectSchedule;
  changeOrders?: ChangeOrder[];
  
  // For Platform Monetization
  selectedLenderId?: string;
  projectedPlatformCommission?: number;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  companyName?: string;
  industry?: string;
  subscriptionTier: SubscriptionTier;
  isDemo?: boolean;
  leads?: Lead[];
}

// New types for Data Monetization & Aggregation
export interface MarketTrend {
    category: string;
    averageValue: number;
    trendDirection: 'up' | 'down' | 'stable';
    dataPoints: number;
}

export interface AggregatedStats {
    avgPropertyValue: number;
    avgEquity: number;
    mostCommonProjects: { name: string; count: number; avgCost: number }[];
    totalPropertiesAnalyzed: number;
}

export interface AdminDataFilters {
    ageRanges: string[];
    maritalStatuses: string[];
    equityRanges: string[];
}