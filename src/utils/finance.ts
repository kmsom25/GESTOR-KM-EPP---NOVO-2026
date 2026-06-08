/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export const maskCurrency = (value: string): string => {
  let v = value.replace(/\D/g, "");
  v = (Number(v) / 100).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
  });
  return v;
};

export const parseCurrencyToNumber = (value: string): number => {
  if (!value) return 0;
  const cleanValue = value.replace(/\./g, '').replace(',', '.');
  return Number(cleanValue) || 0;
};

export const formatDate = (date: string): string => {
  if (!date) return 'S/D';
  // If date is in YYYY-MM-DD format (typical for input type="date"),
  // parsing it with new Date() treats it as UTC, which causes a shift in many timezones.
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    const [year, month, day] = date.split('-');
    return `${day}/${month}/${year}`;
  }
  return new Date(date).toLocaleDateString('pt-BR');
};

export const calculateSummary = (event: any) => {
  if (!event) return {
    totalExpenses: 0,
    taxAmount: 0,
    finalProfit: 0,
    baseProfit: 0,
    shares: {},
    reimbursementTotals: { km: 0, ms: 0, kmList: [], msList: [] }
  };

  const revenue = Number(event.revenue) || 0;
  const taxPercentage = Number(event.invoiceTaxPercentage) || 0;
  const expenses = event.expenses || [];

  const totalExpenses = expenses.reduce((acc: number, curr: any) => acc + (Number(curr.value) || 0), 0);
  
  // Identify interest/machine fees
  const interestExpenses = expenses.filter((e: any) => 
    e.label.toLowerCase().includes('juros') || 
    e.label.toLowerCase().includes('maquininha') ||
    e.label.toLowerCase().includes('taxa')
  );
  const interestAmount = interestExpenses.reduce((acc: number, curr: any) => acc + (Number(curr.value) || 0), 0);
  
  const taxAmount = (revenue * taxPercentage) / 100;
  
  // The "shared" profit logic: 
  // Normally interest reduces profit for everyone. 
  // User wants it removed from distribution and assigned to Kleber.
  // So we calculate profit AS IF those interest expenses didn't reduce the shared pool, 
  // then we subtract them specifically from Kleber or show them as his technical return.
  const sharedProfit = revenue - (totalExpenses - interestAmount) - taxAmount;
  
  const divValue = Number(event.divider) || 1;
  const baseProfit = sharedProfit / divValue;

  const reimbursementTotals: any = {
    km: 0,
    ms: 0,
    kmList: [],
    msList: []
  };

  expenses.forEach((e: any) => {
    // Only non-interest expenses should be treated as normal reimbursements if they were paid out of pocket
    const isInterest = interestExpenses.some((ie: any) => ie.id === e.id);
    if (!isInterest) {
      if (e.paidKM) {
        const val = Number(e.value) || 0;
        reimbursementTotals.km += val;
        reimbursementTotals.kmList.push({ label: e.label, value: val });
      }
      if (e.paidMS) {
        const val = Number(e.value) || 0;
        reimbursementTotals.ms += val;
        reimbursementTotals.msList.push({ label: e.label, value: val });
      }
    }
  });

  const shares: any = {
    kleber: { 
      name: 'Kleber Marcio', 
      value: baseProfit + taxAmount + reimbursementTotals.km + interestAmount,
      profitOnly: baseProfit,
      taxCredit: taxAmount,
      reimbursements: reimbursementTotals.km,
      interestRecap: interestAmount
    }
  };

  if (divValue === 2) {
    shares.marcone = { 
      name: 'Marcone Souza', 
      value: baseProfit + reimbursementTotals.ms,
      profitOnly: baseProfit,
      taxCredit: 0,
      reimbursements: reimbursementTotals.ms
    };
  } else if (divValue === 3) {
    shares.marcone = { 
      name: 'Marcone Souza', 
      value: baseProfit + reimbursementTotals.ms,
      profitOnly: baseProfit,
      taxCredit: 0,
      reimbursements: reimbursementTotals.ms
    };
    shares.marcelo = { 
      name: 'Marcelo Lavra', 
      value: baseProfit,
      profitOnly: baseProfit,
      taxCredit: 0,
      reimbursements: 0
    };
  }

  return {
    totalRevenue: revenue,
    totalExpenses,
    taxAmount,
    interestAmount,
    finalProfit: revenue - totalExpenses - taxAmount,
    baseProfit,
    shares,
    reimbursementTotals
  };
};
