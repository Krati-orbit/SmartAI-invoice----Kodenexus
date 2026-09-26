import { CatalogItem } from '@/data/catalog';

export interface InvoiceItem {
  id: string;
  service_id?: string;
  title: string;
  description: string;
  category?: string;
  quantity: number;
  unitPrice: number;
  isUnmatched: boolean;
  matchConfidence: number;
  originalRequestedTitle?: string;
}

export interface ClientInfo {
  name: string;
  email: string;
  company?: string;
  address?: string;
  phone?: string;
}

export interface SenderInfo {
  name: string;
  company: string;
  email: string;
  phone?: string;
  address: string;
  gstin?: string;
}

export interface InvoiceData {
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  currency: 'INR' | 'USD' | 'EUR' | 'GBP';
  currencySymbol: string;
  client: ClientInfo;
  sender: SenderInfo;
  items: InvoiceItem[];
  taxRate: number; // percentage, e.g. 18 for 18% GST
  taxLabel: string;
  discount: number; // flat discount amount in currency
  notes: string;
  terms: string;
}

export interface PresetScenario {
  id: string;
  title: string;
  tag: string;
  tagColor: string;
  clientName: string;
  summary: string;
  prompt: string;
}

export interface ExtractionResponse {
  success: boolean;
  invoice: InvoiceData;
  rawJson?: any;
  steps: string[];
  durationMs: number;
  unmatchedCount: number;
  matchedCount: number;
  error?: string;
}
