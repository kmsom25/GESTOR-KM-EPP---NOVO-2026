/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Expense {
  id: string;
  label: string;
  value: number;
  paidKM?: boolean;
  paidMS?: boolean; // Normalized to match App.tsx usage (Marcone Silva)
}

export interface AppSettings {
  defaultTaxPercentage: number;
  defaultDivider: number;
  businessName: string;
  supabaseUrl?: string;
  supabaseKey?: string;
}

export interface EventData {
  id?: string;
  name: string;
  date: string;
  time: string;
  revenue: number;
  divider: number;
  expenses: Expense[];
  invoiceTaxPercentage: number;
  observations: string;
  createdAt: number;
}

export interface ReimbursementSummary {
  km: number;
  tn: number;
  kmList: { label: string; value: number }[];
  tnList: { label: string; value: number }[];
}
