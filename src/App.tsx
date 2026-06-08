/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Version: 3.0.0 - KM Gestor Financeiro (Full Reset)
// RESET_TOKEN: 8f8d672e-841d-40e1-a084-219ec2646dec
// Force disconnecting previous GitHub context...

import { AppLogo } from './components/AppLogo';
import { 
  Plus, 
  Trash2, 
  X,
  Calculator, 
  Calendar, 
  Users, 
  Receipt, 
  ChevronRight,
  TrendingUp,
  ArrowUpRight,
  FileText,
  Phone,
  Mail,
  Download,
  Edit2,
  Sun,
  Moon,
  BarChart3,
  TrendingDown,
  PieChart as PieChartIcon,
  Copy,
  Database,
  WifiOff,
  Wifi
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie,
  LineChart,
  Line,
  CartesianGrid
} from 'recharts';
import { EventData, Expense, AppSettings } from './types';
import { eventService } from './services/eventService';
import { settingsService } from './services/settingsService';
import { 
  formatCurrency, 
  formatDate, 
  calculateSummary, 
  maskCurrency, 
  parseCurrencyToNumber 
} from './utils/finance';

const FIXED_BUSINESS_INFO = `64.988.740 Maria Cecilia Costa Sena da Silva
Rua Maria Dolores de Pinho Seabra 60
Pau Amarelo
Paulista PE
53433-090`;

// --- Components ---

const Button = ({ children, onClick, className = '', variant = 'primary', ...props }: any) => {
  const variants: any = {
    primary: 'bg-obsidian dark:bg-gold text-white dark:text-obsidian hover:bg-slate-800 dark:hover:bg-gold-dark',
    secondary: 'bg-white dark:bg-[#18181a] border border-slate-200 dark:border-[#2a2a2c] text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#1a1a1c]',
    success: 'bg-emerald-600 dark:bg-emerald-500 text-white hover:bg-emerald-700 dark:hover:bg-emerald-600',
    danger: 'bg-rose-500 dark:bg-rose-600 text-white hover:bg-rose-600 dark:hover:bg-rose-700',
    gold: 'bg-gold text-obsidian hover:bg-gold-dark font-bold',
    ghost: 'bg-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#18181a]',
  };

  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-xl font-medium transition-all active:scale-95 flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

const Input = ({ label, icon: Icon, prefix, isCurrency, value, onChange, className = '', ...props }: any) => {
  const [displayValue, setDisplayValue] = useState('');

  useEffect(() => {
    if (isCurrency) {
      const numericValue = Number(value) || 0;
      if (numericValue === 0 && displayValue === '') {
        setDisplayValue('');
      } else {
        // Only update if the numeric representation has changed significantly
        // to avoid cursor jumping issues
        const currentNumeric = parseCurrencyToNumber(displayValue);
        if (currentNumeric !== numericValue) {
           setDisplayValue(maskCurrency((numericValue * 100).toFixed(0)));
        }
      }
    } else {
      setDisplayValue(value);
    }
  }, [value, isCurrency]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    if (isCurrency) {
      if (val === '') {
        setDisplayValue('');
        onChange({ target: { value: 0 } });
        return;
      }
      const masked = maskCurrency(val);
      setDisplayValue(masked);
      const numericValue = parseCurrencyToNumber(masked);
      onChange({ target: { value: numericValue } });
    } else {
      setDisplayValue(val);
      onChange(e);
    }
  };

  return (
    <div className="space-y-1.5">
      {label && <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">{label}</label>}
      <div className="relative group">
        {Icon && <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-gold transition-colors z-10" />}
        {prefix && (
          <span className={`absolute ${Icon ? 'left-11' : 'left-4'} top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 font-bold text-xs z-10 transition-colors group-focus-within:text-gold`}>
            {prefix}
          </span>
        )}
        <input
          className={`fintech-input ${Icon ? 'pl-11' : ''} ${prefix ? (Icon ? '!pl-18' : '!pl-11') : ''} ${className}`}
          value={displayValue}
          onChange={handleChange}
          {...(isCurrency ? { inputMode: 'numeric' } : {})}
          {...props}
        />
      </div>
    </div>
  );
};

// --- Modals ---

const EventModal = ({ isOpen, onClose, onSave, editingEvent }: any) => {
  const [formData, setFormData] = useState<Partial<EventData>>({
    name: '',
    revenue: 0,
    divider: 2,
    date: new Date().toISOString().split('T')[0],
    time: '',
    invoiceTaxPercentage: 6,
    expenses: [],
    observations: FIXED_BUSINESS_INFO
  });

  const [newExpense, setNewExpense] = useState<Partial<Expense>>({ label: '', value: 0 });

  useEffect(() => {
    if (editingEvent) {
      setFormData(editingEvent);
    } else {
      setFormData({
        name: '',
        revenue: 0,
        divider: 2,
        date: new Date().toISOString().split('T')[0],
        time: '',
        invoiceTaxPercentage: 6,
        expenses: [],
        observations: FIXED_BUSINESS_INFO
      });
    }
  }, [editingEvent, isOpen]);

  const addExpense = () => {
    if (!newExpense.label || !newExpense.value) return;
    setFormData(prev => ({
      ...prev,
      expenses: [...(prev.expenses || []), { ...newExpense, id: crypto.randomUUID() } as Expense]
    }));
    setNewExpense({ label: '', value: 0 });
  };

  const removeExpense = (id: string) => {
    setFormData(prev => ({
      ...prev,
      expenses: prev.expenses?.filter(e => e.id !== id)
    }));
  };

  const toggleReimbursement = (id: string, type: 'paidKM' | 'paidMS') => {
    setFormData(prev => ({
      ...prev,
      expenses: prev.expenses?.map(e => e.id === id ? { ...e, [type]: !e[type] } : e)
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white dark:bg-[#0a0a0a] rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-transparent dark:border-slate-800"
      >
        <div className="p-6 border-b dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-[#111111]/50">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{editingEvent ? 'Editar Evento' : 'Novo Evento'}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Preencha os detalhes financeiros para o fechamento.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 dark:bg-[#0a0a0a]">
          {/* Informações Básicas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input 
              label="Nome do Evento" 
              placeholder="Ex: Nome do Evento" 
              icon={FileText}
              value={formData.name || ''}
              onChange={(e: any) => setFormData({...formData, name: e.target.value})}
            />
            <Input 
              label="VALOR DO EVENTO (R$)" 
              isCurrency
              prefix="R$"
              placeholder="0,00" 
              icon={TrendingUp}
              value={formData.revenue}
              onChange={(e: any) => setFormData({...formData, revenue: Number(e.target.value)})}
            />
            <Input 
              label="Data" 
              type="date" 
              icon={Calendar}
              value={formData.date || ''}
              onChange={(e: any) => setFormData({...formData, date: e.target.value})}
            />
            <div className="grid grid-cols-2 gap-2">
               <Input 
                label="Hora" 
                type="time" 
                value={formData.time || ''}
                onChange={(e: any) => setFormData({...formData, time: e.target.value})}
              />
              <Input 
                label="Pessoas" 
                type="number" 
                icon={Users}
                value={formData.divider ?? 2}
                onChange={(e: any) => setFormData({...formData, divider: Number(e.target.value)})}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
               <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Despesas e Gastos</h3>
               <span className="text-xs text-slate-400">{formData.expenses?.length || 0} itens lançados</span>
            </div>
            
            <div className="flex gap-2 p-3 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
               <input 
                placeholder="Ex: Diversos, Ajudante..." 
                className="flex-1 bg-transparent border-none text-sm focus:ring-0 px-2"
                value={newExpense.label || ''}
                onChange={(e) => setNewExpense({...newExpense, label: e.target.value})}
                onKeyPress={(e) => e.key === 'Enter' && addExpense()}
               />
               <input 
                placeholder="R$ 0,00" 
                className="w-24 bg-transparent border-none text-sm text-right focus:ring-0 font-medium"
                value={newExpense.value === 0 ? '' : maskCurrency((newExpense.value * 100).toFixed(0))}
                onChange={(e) => {
                  const masked = maskCurrency(e.target.value);
                  setNewExpense({...newExpense, value: parseCurrencyToNumber(masked)});
                }}
                onKeyPress={(e) => e.key === 'Enter' && addExpense()}
               />
               <button onClick={addExpense} className="p-2 bg-slate-900 text-white rounded-xl hover:bg-slate-700">
                 <Plus className="w-4 h-4" />
               </button>
            </div>

            <div className="space-y-2">
              {formData.expenses?.map((exp) => (
                <div key={exp.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors group">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-700">{exp.label}</p>
                    <p className="text-xs text-slate-400 font-mono">{formatCurrency(exp.value)}</p>
                  </div>
                  <div className="flex items-center gap-2 mt-2 sm:mt-0">
                    <button 
                      onClick={() => toggleReimbursement(exp.id, 'paidKM')}
                      className={`text-[10px] font-bold px-2 py-1 rounded-md transition-colors ${exp.paidKM ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-400'}`}
                    >
                      KM
                    </button>
                    <button 
                      onClick={() => toggleReimbursement(exp.id, 'paidMS')}
                      className={`text-[10px] font-bold px-2 py-1 rounded-md transition-colors ${exp.paidMS ? 'bg-gold/10 text-gold-dark' : 'bg-slate-100 text-slate-400'}`}
                    >
                      MS
                    </button>
                    <button onClick={() => removeExpense(exp.id)} className="p-1.5 opacity-0 group-hover:opacity-100 text-rose-500 hover:bg-rose-50 rounded-lg transition-all">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <Input 
                label="Imposto de Nota (%)" 
                type="number" 
                placeholder="0" 
                icon={Receipt}
                value={formData.invoiceTaxPercentage ?? 0}
                onChange={(e: any) => setFormData({...formData, invoiceTaxPercentage: Number(e.target.value)})}
              />
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Empresa Responsável</label>
                  <textarea 
                    className="fintech-input h-11 resize-none overflow-hidden hover:h-24 transition-all focus:h-24"
                    placeholder="Digite a empresa responsável..."
                    value={formData.observations || ''}
                    onChange={(e) => setFormData({...formData, observations: e.target.value})}
                  />
                </div>
          </div>
        </div>

        <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t dark:border-slate-800 flex gap-3">
          <Button variant="secondary" onClick={onClose} className="flex-1">Cancelar</Button>
          <Button 
            variant="primary" 
            className="flex-[2]" 
            onClick={() => onSave(formData)}
            disabled={!formData.name || !formData.revenue}
          >
            {editingEvent ? 'Atualizar Evento' : 'Salvar Evento'}
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

const SummaryModal = ({ event, isOpen, onClose, onEdit, onDelete, isAdminAuthenticated, setIsPinModalOpen, setPinAction }: any) => {
  const [whatsappTo, setWhatsappTo] = useState('');
  const [emailTo, setEmailTo] = useState('');

  if (!event || !isOpen) return null;

  const { totalExpenses, taxAmount, finalProfit, baseProfit, reimbursementTotals, shares } = calculateSummary(event);

  const generateSummaryText = (format: 'txt' | 'whatsapp' | 'email') => {
    const isWA = format === 'whatsapp';
    const bold = (txt: string) => isWA ? `*${txt}*` : txt;
    
    let text = `${bold('RESUMO SOM GESTOR EPP')}\n`;
    text += `==============================\n`;
    text += `${bold('EVENTO:')} ${event.name}\n`;
    text += `${bold('DATA:')} ${formatDate(event.date)} ${event.time ? ` às ${event.time}` : ''}\n`;
    text += `==============================\n\n`;

    text += `${bold('VALORES TOTAIS:')}\n`;
    text += `------------------------------\n`;
    text += `RECEITA BRUTA: ${formatCurrency(event.revenue)}\n`;
    text += `TOTAL DESPESAS: ${formatCurrency(totalExpenses)}\n`;
    if (taxAmount > 0) text += `IMPOSTO (${event.invoiceTaxPercentage}%): ${formatCurrency(taxAmount)}\n`;
    text += `${bold('LUCRO LÍQUIDO:')} ${formatCurrency(finalProfit)}\n\n`;
    if (taxAmount > 0) text += `${bold('OBS:')} O valor do Imposto (${event.invoiceTaxPercentage}%) no valor de ${formatCurrency(taxAmount)} é creditado integralmente para (CNPJ 64.988.740 Maria Cecilia Costa Sena da Silva).\n\n`;

    if (event.divider >= 1) {
      text += `${bold('DISTRIBUIÇÃO DE LUCRO:')}\n`;
      text += `------------------------------\n`;
      
      Object.values(shares).forEach((person: any) => {
        text += `${person.name}: ${formatCurrency(person.value)}\n`;
      });

      if (reimbursementTotals.km > 0) {
        text += `\n${bold('PG KM ADICIONAL:')}\n`;
        reimbursementTotals.kmList.forEach((i: any) => text += `  + ${i.label}: ${formatCurrency(i.value)}\n`);
      }

      if (reimbursementTotals.ms > 0) {
        text += `\n${bold('PG MS ADICIONAL:')}\n`;
        reimbursementTotals.msList.forEach((i: any) => text += `  + ${i.label}: ${formatCurrency(i.value)}\n`);
      }
      text += `\n`;
    }

    text += `${bold('DETALHAMENTO DE GASTOS E IMPOSTOS:')}\n`;
    text += `------------------------------\n`;
    if (event.expenses.length === 0 && taxAmount === 0) {
      text += `Nenhuma despesa ou imposto registrado.\n`;
    } else {
      event.expenses.forEach((e: any) => {
        let payer = 'CAIXA';
        if (e.paidKM) payer = 'PAGO POR: KM';
        if (e.paidMS) payer = 'PAGO POR: MS';
        text += `- ${e.label.toUpperCase()}: ${formatCurrency(e.value)} (${payer})\n`;
      });
      if (taxAmount > 0) {
        text += `- IMPOSTO NF (${event.invoiceTaxPercentage}%): ${formatCurrency(taxAmount)} (CNPJ 64.988.740 Maria Cecilia Costa Sena da Silva)\n`;
      }
    }

    if (event.observations) {
      text += `\n${bold('Empresa Responsável:')}\n`;
      text += `------------------------------\n`;
      text += `${event.observations}\n`;
    }

    text += `\nGerado em: ${new Date().toLocaleString('pt-BR')}\n`;
    return text;
  };

  const handleDownload = () => {
    const text = generateSummaryText('txt');
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Resumo_${event.name.replace(/\s+/g, '_')}.txt`;
    link.click();
  };

  const handleSendWhatsApp = () => {
    let p = whatsappTo.replace(/\D/g, '');
    if (p.length === 11) p = '55' + p;
    const fullText = generateSummaryText('whatsapp');
    const msg = encodeURIComponent(fullText);
    window.open(`https://wa.me/${p}?text=${msg}`, '_blank');
  };

  const handleSendEmail = () => {
    const fullText = generateSummaryText('email');
    const subject = encodeURIComponent(`Resumo KM SOM: ${event.name}`);
    const body = encodeURIComponent(fullText);
    window.location.href = `mailto:${emailTo}?subject=${subject}&body=${body}`;
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white dark:bg-[#0a0a0a] rounded-3xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-transparent dark:border-slate-800"
      >
        <div className="p-6 border-b dark:border-slate-800 flex justify-between items-center bg-slate-900 dark:bg-[#111111] text-white">
          <div>
            <h2 className="text-xl font-bold">Resumo Financeiro</h2>
            <p className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-widest">{event.name}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 dark:hover:bg-slate-700 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 dark:bg-[#030303]">
          <div className="grid grid-cols-1 gap-3">
             <div className="grid grid-cols-2 gap-2">
               <div className="p-4 bg-slate-50 dark:bg-[#111111] rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center text-center">
                 <p className="text-[9px] uppercase font-bold text-slate-400 dark:text-slate-500">VALOR DO EVENTO (NF)</p>
                 <p className="text-lg font-black text-slate-900 dark:text-white leading-tight">{formatCurrency(event.revenue || 0)}</p>
               </div>
               <div className="p-4 bg-slate-50 dark:bg-[#111111] rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center text-center">
                 <p className="text-[9px] uppercase font-bold text-slate-400 dark:text-slate-500">Total Despesas</p>
                 <p className="text-lg font-black text-rose-500 dark:text-rose-600 leading-tight">{formatCurrency(totalExpenses)}</p>
               </div>
             </div>

             <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 rounded-2xl border border-emerald-100 dark:border-emerald-900/10 flex justify-between items-center">
               <p className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-500">Resultado Líquido Final</p>
               <p className="text-2xl font-black text-emerald-700 dark:text-emerald-400">{formatCurrency(finalProfit)}</p>
             </div>

             {/* Modern Distribution Chart */}
             <div className="h-64 w-full bg-slate-50 dark:bg-[#111111] rounded-2xl border border-slate-100 dark:border-slate-800 p-4 relative overflow-hidden group">
               <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 absolute top-4 left-4 z-10">Visão Geral da Receita</p>
               <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                   <Pie
                     data={[
                       ...Object.values(shares || {}).map((person: any, idx: number) => ({
                         name: person.name,
                         value: person.value,
                         color: idx === 0 ? '#DAA520' : idx === 1 ? '#FFD700' : '#FBBF24'
                       })),
                       { name: 'Despesas', value: totalExpenses, color: '#f43f5e' },
                       { name: 'Imposto', value: taxAmount, color: '#10b981' }
                     ].filter(d => d.value > 0)}
                     cx="50%"
                     cy="55%"
                     innerRadius={60}
                     outerRadius={80}
                     paddingAngle={5}
                     dataKey="value"
                     stroke="none"
                   >
                     {[
                       ...Object.values(shares || {}).map((person: any, idx: number) => ({
                         value: person.value,
                         color: idx === 0 ? '#DAA520' : idx === 1 ? '#FFD700' : '#FBBF24'
                       })),
                       { value: totalExpenses, color: '#f43f5e' },
                       { value: taxAmount, color: '#10b981' }
                     ].filter(d => d.value > 0).map((entry, index) => (
                       <Cell key={`cell-${index}`} fill={entry.color} />
                     ))}
                   </Pie>
                   <Tooltip 
                     content={({ active, payload }) => {
                       if (active && payload && payload.length) {
                         const data = payload[0].payload;
                         return (
                           <div className="bg-white dark:bg-slate-900 p-3 rounded-xl shadow-xl border border-slate-100 dark:border-slate-800">
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{data.name}</p>
                             <p className="text-sm font-black text-slate-900 dark:text-white">{formatCurrency(data.value)}</p>
                           </div>
                         );
                       }
                       return null;
                     }}
                   />
                 </PieChart>
               </ResponsiveContainer>
               <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                 <div className="text-center">
                   <p className="text-[8px] uppercase font-bold text-slate-400 dark:text-slate-500">Total NF</p>
                   <p className="text-xs font-black text-slate-900 dark:text-white leading-tight">{formatCurrency(event.revenue || 0)}</p>
                 </div>
               </div>
             </div>
             
             <div className="space-y-2">
                <p className="text-[10px] uppercase font-bold text-slate-400 ml-1 tracking-widest text-center">Distribuição</p>
                <div className="grid grid-cols-1 gap-2">
                   <div className="p-4 bg-gold/10 dark:bg-gold/5 rounded-2xl border border-gold/20 dark:border-gold/10 flex justify-between items-center mb-1">
                      <div className="flex flex-col">
                         <p className="text-xs font-bold text-gold-dark dark:text-gold uppercase tracking-tighter">VALOR DO EVENTO (Total)</p>
                         <span className="text-[9px] text-slate-400 font-bold uppercase">Entrada Bruta</span>
                      </div>
                      <p className="text-sm font-black text-gold-dark dark:text-gold">{formatCurrency(event.revenue || 0)}</p>
                   </div>
                   {taxAmount > 0 && (
                     <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 flex justify-between items-center mb-1">
                        <div className="flex flex-col">
                           <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-tighter">Imposto Retido ({event.invoiceTaxPercentage}%)</p>
                           <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Crédito p/ Kleber (CNPJ)</span>
                        </div>
                        <p className="text-sm font-black text-emerald-700 dark:text-emerald-400">{formatCurrency(taxAmount)}</p>
                     </div>
                   )}
                   {Object.values(shares || {}).map((person: any) => (
                      <div key={person.name} className="p-4 bg-slate-50 dark:bg-[#111111] rounded-2xl border border-slate-100 dark:border-slate-700 flex justify-between items-center">
                         <div className="flex flex-col">
                            <p className="text-xs font-bold text-slate-600 dark:text-slate-300">{person.name}</p>
                            {person.name === 'Kleber Marcio' && taxAmount > 0 && (
                              <span className="text-[9px] text-gold font-bold uppercase tracking-tighter">Inclui Crédito Imposto ({event.invoiceTaxPercentage}%) - CNPJ 64.988.740</span>
                            )}
                         </div>
                         <p className="text-sm font-black text-slate-900 dark:text-white">{formatCurrency(person.value)}</p>
                      </div>
                   ))}
                </div>
             </div>
          </div>

          <div className="space-y-4">
             <div className="space-y-2">
                 <p className="text-[10px] uppercase font-bold text-slate-400 ml-1">WhatsApp: Digite para onde vai</p>
                 <div className="flex gap-2">
                    <input 
                      type="tel" 
                      placeholder="Ex: 81999999999" 
                      className="flex-1 fintech-input"
                      value={whatsappTo || ''}
                      onChange={(e) => setWhatsappTo(e.target.value)}
                    />
                    <Button onClick={handleSendWhatsApp} className="aspect-square p-3 bg-emerald-600 text-white">
                      <Phone className="w-4 h-4" />
                    </Button>
                 </div>
             </div>
             <div className="space-y-2">
                 <p className="text-[10px] uppercase font-bold text-slate-400 ml-1">E-mail: Digite para onde vai</p>
                 <div className="flex gap-2">
                    <input 
                      type="email" 
                      placeholder="email@exemplo.com" 
                      className="flex-1 fintech-input"
                      value={emailTo || ''}
                      onChange={(e) => setEmailTo(e.target.value)}
                    />
                    <Button onClick={handleSendEmail} className="aspect-square p-3 bg-gold text-obsidian">
                      <Mail className="w-4 h-4" />
                    </Button>
                 </div>
             </div>
          </div>

          <div className="space-y-3">
            <p className="text-[10px] uppercase font-bold text-slate-400 ml-1 tracking-widest">Resumo de Reembolsos</p>
            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-100 dark:border-amber-900/30 italic">
                <p className="text-[9px] font-bold text-amber-600 dark:text-amber-500 uppercase">Total KM</p>
                <p className="text-sm font-black text-amber-700 dark:text-amber-400">{formatCurrency(reimbursementTotals.km)}</p>
              </div>
              <div className="p-3 bg-gold/10 dark:bg-gold/5 rounded-xl border border-gold/20 dark:border-gold/10 italic">
                <p className="text-[9px] font-bold text-gold-dark dark:text-gold uppercase">Total MS</p>
                <p className="text-sm font-black text-gold-dark dark:text-gold">{formatCurrency(reimbursementTotals.ms)}</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-[10px] uppercase font-bold text-slate-400 ml-1 tracking-widest">Detalhamento de Gastos e Impostos</p>
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 divide-y divide-slate-200/50 dark:divide-slate-700/50">
              {event.expenses.map((e: any) => (
                <div key={e.id} className="p-3 flex justify-between items-center text-xs">
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-700 dark:text-slate-300 uppercase">{e.label}</span>
                    <span className="text-[9px] text-slate-400 dark:text-slate-500 font-black">
                      {e.paidKM ? 'PAGO POR: KM' : e.paidMS ? 'PAGO POR: MS' : 'SAIU DO CAIXA'}
                    </span>
                  </div>
                  <span className="font-mono font-bold text-slate-600 dark:text-slate-400">{formatCurrency(e.value)}</span>
                </div>
              ))}
              {taxAmount > 0 && (
                <div className="p-3 flex justify-between items-center text-xs bg-gold/5 dark:bg-gold/5">
                  <div className="flex flex-col">
                    <span className="font-bold text-gold-dark dark:text-gold uppercase">Imposto de Nota Fiscal ({event.invoiceTaxPercentage}%)</span>
                    <span className="text-[9px] text-gold-dark dark:text-gold font-black">CNPJ 64.988.740 Maria Cecilia Costa Sena da Silva</span>
                  </div>
                  <span className="font-mono font-bold text-gold-dark dark:text-gold">{formatCurrency(taxAmount)}</span>
                </div>
              )}
              {event.expenses.length === 0 && taxAmount === 0 && (
                <div className="p-4 text-center text-xs text-slate-400 dark:text-slate-600 italic">Sem despesas registradas</div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-[10px] uppercase font-bold text-slate-400 ml-1">Relatório Completo</p>
            <Button onClick={handleDownload} variant="secondary" className="w-full py-4 text-xs tracking-widest uppercase font-black">
              <Download className="w-4 h-4" /> Baixar Documento (.txt)
            </Button>
          </div>
        </div>

        <div className="p-6 bg-slate-50 dark:bg-[#0a0a0a] border-t dark:border-slate-800 flex gap-3">
          <Button 
            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-black uppercase text-[10px] tracking-widest py-4 shadow-lg shadow-orange-100 flex items-center justify-center gap-2"
            onClick={() => { 
              const action = () => {
                onClose(); 
                onEdit(event); 
              };
              
              if (isAdminAuthenticated) {
                action();
              } else {
                setPinAction(() => action);
                setIsPinModalOpen(true);
              }
            }}
          >
            <Edit2 className="w-4 h-4" /> Editar
          </Button>
          <Button 
            variant="outline"
            className="flex-1 border-rose-200 dark:border-rose-900/30 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/10 font-black uppercase text-[10px] tracking-widest py-4 flex items-center justify-center gap-2"
            onClick={() => onDelete(event.id)}
          >
            <Trash2 className="w-4 h-4" /> Excluir
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

const PinModal = ({ isOpen, onClose, onSuccess }: { isOpen: boolean; onClose: () => void; onSuccess: () => void }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPin('');
      setError(false);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPin = pin.trim().toUpperCase();
    if (cleanPin === 'EVENTOS 2026' || pin === '563600km') {
      onClose();
      // Delay for modal close animation before triggering action (prevents UI blocking by confirm())
      setTimeout(() => {
        onSuccess();
      }, 150);
    } else {
      setError(true);
      setPin('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-[#0a0a0a] rounded-3xl w-full max-w-sm overflow-hidden flex flex-col shadow-2xl border border-transparent dark:border-slate-800"
      >
        <div className="p-6 text-center space-y-4">
          <div className="w-16 h-16 bg-gold/10 dark:bg-gold/10 rounded-full flex items-center justify-center mx-auto">
            <Calculator className="w-8 h-8 text-gold" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Acesso Restrito</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Digite a senha do administrador</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <input 
              type="password"
              autoFocus
              className={`w-full fintech-input text-center text-2xl tracking-[0.5em] font-black ${error ? 'border-rose-500 bg-rose-50 dark:bg-rose-900/10' : ''}`}
              value={pin || ''}
              onChange={(e) => {
                setPin(e.target.value);
                setError(false);
              }}
              placeholder="••••••"
            />
            {error && <p className="text-xs font-bold text-rose-500">Senha incorreta!</p>}
            
            <div className="flex gap-2">
              <Button type="button" variant="secondary" onClick={onClose} className="flex-1">Voltar</Button>
              <Button type="submit" variant="primary" className="flex-[2]">Entrar</Button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

const StatsView = ({ events }: { events: EventData[] }) => {
  const stats = useMemo(() => {
    const totals = {
      Kleber: { total: 0, profit: 0, tax: 0, reimbursements: 0, interest: 0 },
      Marcone: { total: 0, profit: 0, tax: 0, reimbursements: 0, interest: 0 },
      Marcelo: { total: 0, profit: 0, tax: 0, reimbursements: 0, interest: 0 },
      Revenue: 0,
      Expenses: 0,
      Taxes: 0
    };

    (events || []).forEach(ev => {
      if (!ev) return;
      const summary = calculateSummary(ev);
      totals.Revenue += Number(ev.revenue) || 0;
      totals.Expenses += summary.totalExpenses;
      totals.Taxes += summary.taxAmount;

      if (summary.shares['kleber']) {
        totals.Kleber.total += summary.shares['kleber'].value;
        totals.Kleber.profit += summary.shares['kleber'].profitOnly;
        totals.Kleber.tax += summary.shares['kleber'].taxCredit;
        totals.Kleber.reimbursements += summary.shares['kleber'].reimbursements;
        totals.Kleber.interest += summary.shares['kleber'].interestRecap || 0;
      }
      if (summary.shares['marcone']) {
        totals.Marcone.total += summary.shares['marcone'].value;
        totals.Marcone.profit += summary.shares['marcone'].profitOnly;
        totals.Marcone.tax += summary.shares['marcone'].taxCredit;
        totals.Marcone.reimbursements += summary.shares['marcone'].reimbursements;
      }
      if (summary.shares['marcelo']) {
        totals.Marcelo.total += summary.shares['marcelo'].value;
        totals.Marcelo.profit += summary.shares['marcelo'].profitOnly;
        totals.Marcelo.tax += summary.shares['marcelo'].taxCredit;
        totals.Marcelo.reimbursements += summary.shares['marcelo'].reimbursements || 0;
      }
    });

    return totals;
  }, [events]);

  const chartData = [
    { name: 'Kleber', value: stats.Kleber.total, color: '#D4AF37' },
    { name: 'Marcone', value: stats.Marcone.total, color: '#B8962E' },
    { name: 'Marcelo', value: stats.Marcelo.total, color: '#F1E4BC' },
    { name: 'Impostos', value: stats.Taxes, color: '#10b981' },
  ].filter(p => p.value > 0);

  const peopleDetails = [
    { 
      name: 'Kleber Marcio', 
      total: stats.Kleber.total, 
      profit: stats.Kleber.profit, 
      tax: stats.Kleber.tax, 
      reimb: stats.Kleber.reimbursements,
      interest: stats.Kleber.interest,
      color: '#D4AF37'
    },
    { 
      name: 'Marcone Souza', 
      total: stats.Marcone.total, 
      profit: stats.Marcone.profit, 
      tax: stats.Marcone.tax, 
      reimb: stats.Marcone.reimbursements,
      color: '#B8962E'
    },
    { 
      name: 'Marcelo Lavra', 
      total: stats.Marcelo.total, 
      profit: stats.Marcelo.profit, 
      tax: stats.Marcelo.tax, 
      reimb: stats.Marcelo.reimbursements,
      color: '#F1E4BC'
    },
    {
      name: 'Impostos (6%)',
      total: stats.Taxes,
      profit: 0,
      tax: stats.Taxes,
      reimb: 0,
      color: '#10b981',
      isTax: true
    }
  ].filter(p => p.total > 0);

  const timelineData = useMemo(() => {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const currentYear = new Date().getFullYear();
    
    // Initialize data for all months
    const monthlyStats = months.map(m => ({ name: m, value: 0 }));

    (events || []).forEach(ev => {
      // Use T12:00:00 to avoid timezone shift issues with date-only strings
      const dateStr = ev.date && /^\d{4}-\d{2}-\d{2}$/.test(ev.date) ? `${ev.date}T12:00:00` : ev.date;
      const date = new Date(dateStr);
      if (date.getFullYear() === currentYear) {
        const monthIndex = date.getMonth();
        monthlyStats[monthIndex].value += Number(ev.revenue) || 0;
      }
    });

    return monthlyStats;
  }, [events]);

  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-8 bg-slate-50 dark:bg-[#080808] rounded-3xl border border-slate-100 dark:border-slate-900 shadow-sm relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 relative z-10">Valor Total em Eventos</p>
          <p className="text-3xl font-black text-slate-900 dark:text-slate-100 relative z-10">{formatCurrency(stats.Revenue)}</p>
        </div>
        <div className="p-8 bg-slate-50 dark:bg-[#080808] rounded-3xl border border-slate-100 dark:border-slate-900 shadow-sm relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 relative z-10">Despesas e Impostos</p>
          <p className="text-3xl font-black text-rose-500 relative z-10">{formatCurrency(stats.Expenses + stats.Taxes)}</p>
        </div>
        <div className="p-8 bg-gold/10 dark:bg-gold/5 rounded-3xl border border-gold/20 dark:border-gold/10 shadow-sm relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-gold/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <p className="text-[10px] font-black text-gold-dark dark:text-gold uppercase tracking-widest mb-2 relative z-10">Lucro Líquido Real</p>
          <p className="text-3xl font-black text-gold-dark dark:text-gold relative z-10">{formatCurrency(stats.Revenue - stats.Expenses - stats.Taxes)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="bg-white dark:bg-[#050505] p-8 rounded-4xl border border-slate-100 dark:border-slate-900 shadow-2xl shadow-slate-200/50 dark:shadow-none space-y-8">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <PieChartIcon className="w-4 h-4 text-gold" /> Distribuição de Lucro
            </h3>
            <span className="text-[8px] font-black bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded-full text-slate-500 uppercase tracking-tighter">Total por Gestor</span>
          </div>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }} barGap={20}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#33415510" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900 }} dy={10} />
                <YAxis hide domain={[0, 'dataMax + 1000']} />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ backgroundColor: '#111112', border: 'none', borderRadius: '24px', padding: '16px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}
                  itemStyle={{ color: '#F1E4BC', fontSize: '12px', fontWeight: '900' }}
                  labelStyle={{ color: '#94a3b8', fontSize: '10px', marginBottom: '8px', fontWeight: '900', textTransform: 'uppercase' }}
                  formatter={(value: number) => [formatCurrency(value), '']}
                />
                <Bar dataKey="value" radius={[100, 100, 100, 100]} barSize={40}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.8} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-[#050505] p-8 rounded-4xl border border-slate-100 dark:border-slate-900 shadow-2xl shadow-slate-200/50 dark:shadow-none space-y-8">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-sky-500" /> Vendas Anuais
            </h3>
            <span className="text-[8px] font-black bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded-full text-slate-500 uppercase tracking-tighter">Faturamento {new Date().getFullYear()}</span>
          </div>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={timelineData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 0" vertical={false} stroke="#33415510" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 11, fontWeight: 700 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 500 }}
                  tickFormatter={(val) => val >= 1000 ? `${(val/1000).toFixed(0)}k` : val}
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(56, 189, 248, 0.05)' }}
                  contentStyle={{ backgroundColor: '#111112', border: 'none', borderRadius: '24px', padding: '16px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}
                  labelStyle={{ color: '#94a3b8', fontSize: '10px', marginBottom: '8px', fontWeight: '900', textTransform: 'uppercase' }}
                  itemStyle={{ color: '#38bdf8', fontSize: '12px', fontWeight: '900' }}
                  formatter={(value: number) => [formatCurrency(value), 'Faturamento']}
                />
                <Bar 
                  dataKey="value" 
                  fill="#4285F4" 
                  radius={[4, 4, 0, 0]} 
                  barSize={32}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="space-y-8 animate-in slide-in-from-bottom-2 duration-700">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
          <Users className="w-4 h-4" /> Detalhamento por Gestor
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {peopleDetails.map((person) => (
            <div key={person.name} className="bg-white dark:bg-[#050505] p-8 rounded-3xl border border-slate-100 dark:border-slate-900 shadow-sm flex flex-col justify-between space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: person.color }} />
                <span className="font-black text-slate-900 dark:text-slate-100 uppercase text-xs tracking-widest">{person.name}</span>
              </div>
              
              <div className="space-y-4">
                {(person as any).isTax ? (
                  <div className="flex justify-between items-center bg-emerald-50 dark:bg-emerald-950/20 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-900/30">
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Total Impostos Retidos</span>
                    <span className="text-sm font-black text-emerald-700 dark:text-emerald-400">{formatCurrency(person.total)}</span>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Distribuição Normal</span>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{formatCurrency(person.profit)}</span>
                    </div>
                    {person.tax > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-gold dark:text-gold-light uppercase tracking-widest">Nota Fiscal (Crédito)</span>
                        <span className="text-xs font-bold text-gold dark:text-gold-light">{formatCurrency(person.tax)}</span>
                      </div>
                    )}
                    {(person as any).interest > 0 && (
                      <div className="flex justify-between items-center p-3 bg-gold/5 rounded-xl border border-gold/10">
                        <span className="text-[10px] font-bold text-gold-dark uppercase tracking-widest">Juros / Maquininha</span>
                        <span className="text-xs font-black text-gold-dark">{formatCurrency((person as any).interest)}</span>
                      </div>
                    )}
                    {person.reimb > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Reembolsos</span>
                        <span className="text-xs font-bold text-orange-500">{formatCurrency(person.reimb)}</span>
                      </div>
                    )}
                    <div className="pt-4 border-t dark:border-slate-900 flex justify-between items-center">
                      <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-[0.2em]">Total Acumulado</span>
                      <span className="text-xl font-black text-slate-900 dark:text-white">{formatCurrency(person.total)}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const SettingsView = ({ onRefresh, initialSettings }: { onRefresh: () => void, initialSettings: AppSettings }) => {
  const [settings, setSettings] = useState<AppSettings>(initialSettings);

  const handleSave = async () => {
    const oldUrl = initialSettings.supabaseUrl;
    const oldKey = initialSettings.supabaseKey;
    
    await settingsService.saveSettings(settings);
    
    if (settings.supabaseUrl !== oldUrl || settings.supabaseKey !== oldKey) {
      alert('Configurações salvas localmente! A página será recarregada para aplicar as novas chaves do Supabase.');
      window.location.reload();
    } else {
      alert('Configurações da EPP salvas com sucesso!');
      onRefresh();
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white dark:bg-[#050505] rounded-3xl border border-slate-100 dark:border-slate-900 shadow-sm overflow-hidden animate-in zoom-in-95 duration-500">
      <div className="p-8 border-b dark:border-slate-900 bg-slate-50/50 dark:bg-[#0a0a0a]">
        <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 uppercase tracking-[0.2em] flex items-center gap-3">
          <Calculator className="w-5 h-5 text-gold" /> Parâmetros de Gestão EPP
        </h3>
      </div>
      
      <div className="p-8 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Imposto NF Padrão (%)</label>
            <input 
              type="number"
              className="fintech-input text-lg font-black"
              value={settings.defaultTaxPercentage === 0 ? '' : settings.defaultTaxPercentage}
              onChange={(e) => setSettings({...settings, defaultTaxPercentage: Number(e.target.value)})}
            />
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Divisor Padrão (Pessoas)</label>
            <input 
              type="number"
              className="fintech-input text-lg font-black"
              value={settings.defaultDivider || ''}
              onChange={(e) => setSettings({...settings, defaultDivider: Number(e.target.value)})}
            />
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Nome Fantasia / Razão Social</label>
          <input 
            className="fintech-input text-lg font-black"
            value={settings.businessName || ''}
            onChange={(e) => setSettings({...settings, businessName: e.target.value})}
          />
        </div>

        <div className="pt-8 border-t dark:border-slate-900 space-y-8">
          <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <Database className="w-4 h-4" /> Configuração Supabase
          </h4>
          
          <div className="grid grid-cols-1 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Supabase URL</label>
              <input 
                type="text"
                placeholder="https://xyz.supabase.co"
                className="fintech-input text-lg font-black"
                value={settings.supabaseUrl || ''}
                onChange={(e) => setSettings({...settings, supabaseUrl: e.target.value})}
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Supabase Anon Key</label>
              <input 
                type="password"
                placeholder="sua_chave_anon_aqui"
                className="fintech-input text-lg font-black"
                value={settings.supabaseKey || ''}
                onChange={(e) => setSettings({...settings, supabaseKey: e.target.value})}
              />
              <p className="text-[10px] text-slate-500 dark:text-slate-400 italic">
                *Você também pode configurar as variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no painel de Settings do AI Studio.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t dark:border-slate-900">
          <Button onClick={handleSave} className="w-full py-5 text-xs font-black uppercase tracking-[0.3em] bg-gold text-obsidian shadow-2xl shadow-gold/10 dark:shadow-none">
            Atualizar Dados da Gestão
          </Button>
        </div>
      </div>
    </div>
  );
};

const ExpenseItem = ({ label, expense, onToggle, onUpdate }: any) => {
  return (
    <div className="space-y-2">
      <label className="flex items-center gap-3 cursor-pointer group">
        <input 
          type="checkbox" 
          className="w-5 h-5 rounded border-slate-200 dark:border-slate-800 text-gold focus:ring-gold dark:bg-slate-800 dark:checked:bg-gold"
          checked={!!expense}
          onChange={onToggle}
        />
        <span className="text-sm font-medium text-slate-500 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200 transition-colors uppercase tracking-tight">{label}</span>
      </label>
      
      {expense && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="ml-8 flex items-center gap-2 pb-2"
        >
          <div className="flex gap-1">
            <button 
              onClick={() => onUpdate(expense.id, 'paidKM', !expense.paidKM)}
              className={`text-[9px] font-black w-7 h-7 flex items-center justify-center rounded-lg transition-all ${expense.paidKM ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 ring-2 ring-amber-200 dark:ring-amber-900/50' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
            >
              KM
            </button>
            <button 
              onClick={() => onUpdate(expense.id, 'paidMS', !expense.paidMS)}
              className={`text-[9px] font-black w-7 h-7 flex items-center justify-center rounded-lg transition-all ${expense.paidMS ? 'bg-gold/10 dark:bg-gold/20 text-gold-dark dark:text-gold ring-2 ring-gold/20 dark:ring-gold/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
            >
              MS
            </button>
          </div>
          
          <div className="relative flex-1 max-w-[120px]">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-[10px] font-bold">R$</span>
            <input 
              type="number"
              placeholder="0.00"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-lg py-1.5 pl-8 pr-3 text-xs font-bold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-gold/20 outline-none"
              value={expense.value || ''}
              onChange={(e) => onUpdate(expense.id, 'value', Number(e.target.value))}
            />
          </div>
        </motion.div>
      )}
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<AppSettings>({
    defaultTaxPercentage: 6,
    defaultDivider: 2,
    businessName: 'SOM GESTOR EPP'
  });
  const [activeTab, setActiveTab] = useState<'new' | 'history' | 'stats' | 'settings'>('new');
  const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [pinAction, setPinAction] = useState<(() => void) | null>(null);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [isAppAuthenticated, setIsAppAuthenticated] = useState(() => sessionStorage.getItem('app_auth') === 'true');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState(false);
  const [supabaseError, setSupabaseError] = useState<string | null>(null);

  const [isOfflineMode, setIsOfflineMode] = useState(() => localStorage.getItem('km_offline_mode') === 'true');

  const [localSupabaseUrl, setLocalSupabaseUrl] = useState(() => {
    try {
      const stored = localStorage.getItem('km_som_settings');
      if (stored) return JSON.parse(stored).supabaseUrl || '';
    } catch {}
    return '';
  });

  const [localSupabaseKey, setLocalSupabaseKey] = useState(() => {
    try {
      const stored = localStorage.getItem('km_som_settings');
      if (stored) return JSON.parse(stored).supabaseKey || '';
    } catch {}
    return '';
  });

  const isSupabaseConfigured = useMemo(() => {
    if (isOfflineMode) return true; // Pretend it is configured when running locally

    // Check environment variables first
    const envUrl = import.meta.env.VITE_SUPABASE_URL;
    const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (envUrl && envKey && envUrl.startsWith('http') && !envUrl.includes('your_supabase_url')) {
      return true;
    }

    // Check LocalStorage fallbacks
    try {
      const stored = localStorage.getItem('km_som_settings');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.supabaseUrl && parsed.supabaseKey && parsed.supabaseUrl.startsWith('http')) {
          return true;
        }
      }
    } catch (e) {}

    return false;
  }, [isOfflineMode]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPassword = loginPassword.trim().toUpperCase();
    if (cleanPassword === 'EVENTOS 2026') {
      setIsAppAuthenticated(true);
      sessionStorage.setItem('app_auth', 'true');
    } else {
      setLoginError(true);
      setLoginPassword('');
    }
  };

  const handleAdminTabAccess = (tab: 'stats' | 'settings') => {
    if (isAdminAuthenticated) {
      setActiveTab(tab);
    } else {
      setPinAction(() => () => {
        setIsAdminAuthenticated(true);
        setActiveTab(tab);
      });
      setIsPinModalOpen(true);
    }
  };

  useEffect(() => {
    localStorage.setItem('darkMode', String(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Form State
  const [formData, setFormData] = useState<EventData>({
    name: '',
    revenue: 0,
    divider: 2,
    date: '',
    time: '',
    invoiceTaxPercentage: 6,
    expenses: [],
    observations: FIXED_BUSINESS_INFO,
    createdAt: Date.now()
  });

  const loadEvents = useCallback(async () => {
    setLoading(true);
    setSupabaseError(null);
    try {
      const data = await eventService.getEvents();
      setEvents(data);
    } catch (err: any) {
      console.error('loadEvents error:', err);
      setSupabaseError(err?.message || String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const loadAllData = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setSupabaseError(null);
    try {
      const [eventsData, settingsData] = await Promise.all([
        eventService.getEvents(),
        settingsService.getSettings()
      ]);
      setEvents(eventsData);
      setSettings(settingsData);
      
      // Also update initial form state with default settings if not already set
      setFormData(prev => ({
        ...prev,
        divider: prev.id ? prev.divider : settingsData.defaultDivider,
        invoiceTaxPercentage: prev.id ? prev.invoiceTaxPercentage : settingsData.defaultTaxPercentage
      }));
    } catch (err: any) {
      console.error('Error loading data', err);
      setSupabaseError(err?.message || String(err));
    } finally {
      setLoading(false);
    }
  }, [isSupabaseConfigured]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  const resetForm = useCallback(() => {
    setFormData({
      name: '',
      revenue: 0,
      divider: settings.defaultDivider,
      date: '',
      time: '',
      invoiceTaxPercentage: settings.defaultTaxPercentage,
      expenses: [],
      observations: FIXED_BUSINESS_INFO,
      createdAt: Date.now()
    });
  }, [settings]);

  const predefinedExpenses = {
    operacionais: [
      'Ajudante', 'Almoço', 'Café da manhã', 'Comb. Kleber', 'Comb. Tony',
      'Jantar', 'Lanche', 'Pilhas', 'Transporte'
    ],
    outros: [
      'Cabos', 'Fogos Indoor', 'Ilum. Extra', 'Live', 'Painel de LED', 
      'Reparos', 'Som Extra', 'Trio Elétrico', 'Extra (Descrever)'
    ]
  };

  const toggleExpense = (label: string) => {
    const exists = formData.expenses.find(e => e.label === label);
    if (exists) {
      setFormData(prev => ({
        ...prev,
        expenses: prev.expenses.filter(e => e.label !== label)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        expenses: [...prev.expenses, { id: crypto.randomUUID(), label, value: 0, paidKM: false, paidMS: false }]
      }));
    }
  };

  const updateExpense = (id: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      expenses: prev.expenses.map(e => e.id === id ? { ...e, [field]: value } : e)
    }));
  };

  const handleDuplicate = (ev: EventData) => {
    const duplicated: any = {
      ...ev,
      id: undefined,
      name: `${ev.name} (Copia)`,
      date: new Date().toISOString().split('T')[0],
      time: '',
      createdAt: undefined
    };
    setFormData(duplicated);
    setActiveTab('new');
  };

  const handleSave = async () => {
    if (!formData.name || !formData.revenue) {
      alert('Preencha pelo menos o nome e a receita!');
      return;
    }
    try {
      await eventService.saveEvent(formData as any);
      alert('Evento salvo no Supabase com sucesso!');
      resetForm();
      loadEvents();
      setActiveTab('history');
    } catch (err: any) {
      console.error('Save failed', err);
      const errorMsg = err?.message || err?.details || 'Erro desconhecido';
      alert(`Erro ao salvar no Supabase: ${errorMsg}\n\nVerifique se o SQL foi executado e se as chaves URL/Anon Key estão corretas.`);
    }
  };

  const executeDelete = async (id: string) => {
    try {
      await eventService.deleteEvent(id);
      // Atualização otimista: remove do estado local na hora
      setEvents(prev => prev.filter(ev => ev.id !== id));
      alert('Evento excluído com sucesso!');
      setIsSummaryOpen(false);
      setSelectedEvent(null);
    } catch (err) {
      console.error('Delete failed', err);
      alert('Erro ao excluir do Supabase. Verifique sua conexão.');
      loadEvents(); // Recarrega se falhar
    }
  };

  const handleDelete = (id: string, skipConfirm = false) => {
    if (!id) {
      alert('ID do evento inválido.');
      return;
    }

    // Se vier do PIN, skipConfirm será true para apagar imediatamente
    const action = () => executeDelete(id);

    if (isAdminAuthenticated || skipConfirm) {
      if (skipConfirm) {
        action();
      } else if (confirm('Deseja excluir este evento definitivamente do banco de dados?')) {
        action();
      }
    } else {
      // Guarda a ação para ser executada após o PIN com skipConfirm
      setPinAction(() => () => executeDelete(id));
      setIsPinModalOpen(true);
    }
  };

  const totals = calculateSummary(formData);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa] dark:bg-obsidian transition-colors duration-300">
        <div className="flex flex-col items-center gap-6 animate-pulse">
          <div className="w-16 h-16 bg-obsidian dark:bg-gold rounded-3xl flex items-center justify-center shadow-2xl shadow-obsidian/10 dark:shadow-none">
            <Calculator className="w-8 h-8 text-white" />
          </div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-black tracking-widest italic">{settings.businessName}</p>
        </div>
      </div>
    );
  }

  if (!isSupabaseConfigured || supabaseError) {
    const handleSaveConnection = (e: React.FormEvent) => {
      e.preventDefault();
      localStorage.setItem('km_som_settings', JSON.stringify({
        supabaseUrl: localSupabaseUrl.trim(),
        supabaseKey: localSupabaseKey.trim()
      }));
      localStorage.removeItem('km_offline_mode');
      window.location.reload();
    };

    const handleEnableOffline = () => {
      localStorage.setItem('km_offline_mode', 'true');
      window.location.reload();
    };

    return (
      <div className="min-h-screen bg-slate-50 dark:bg-obsidian flex items-center justify-center p-4 sm:p-8 transition-colors duration-300">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-2xl bg-white dark:bg-[#0a0a0a] rounded-[2.5rem] p-6 sm:p-10 shadow-2xl border border-rose-500/20 text-center space-y-6 overflow-hidden my-4"
        >
          <div className="w-16 h-16 bg-rose-500/10 rounded-2xl flex items-center justify-center mx-auto ring-4 ring-rose-500/5">
            <Database className="w-8 h-8 text-rose-500" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
              {!isSupabaseConfigured ? 'Configuração do Supabase' : 'Erro de Conexão (Supabase)'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium max-w-md mx-auto">
              {!isSupabaseConfigured 
                ? 'As credenciais de acesso ao banco de dados não foram localizadas. Insira-as abaixo para conectar.' 
                : 'O navegador não conseguiu se conectar ao Supabase (Failed to fetch).'}
            </p>
          </div>

          {/* Erro real */}
          {supabaseError && (
            <div className="bg-rose-50 dark:bg-rose-950/20 p-4 sm:p-5 rounded-2xl text-left border border-rose-500/20">
              <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                <WifiOff className="w-3.5 h-3.5" /> Detalhes Técnicos do Erro:
              </p>
              <pre className="text-[11px] text-rose-600 dark:text-rose-400 font-mono overflow-auto max-h-24 whitespace-pre-wrap leading-relaxed">
                {supabaseError}
              </pre>
            </div>
          )}

          {/* Form para credenciais */}
          <form onSubmit={handleSaveConnection} className="bg-slate-50 dark:bg-white/5 p-5 sm:p-8 rounded-[2rem] text-left space-y-4 border border-slate-100 dark:border-white/5">
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-center mb-2">Credenciais Alternativas (LocalStorage)</p>
            
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Supabase URL</label>
              <input 
                type="text" 
                className="w-full fintech-input text-xs" 
                placeholder="Ex e: https://xyz.supabase.co"
                value={localSupabaseUrl || ''} 
                onChange={e => setLocalSupabaseUrl(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1 font-mono">Supabase Anon key</label>
              <textarea 
                className="w-full fintech-input text-xs font-mono h-16 resize-none py-2" 
                placeholder="Insira a sua chave anônima (service anon key)"
                value={localSupabaseKey || ''} 
                onChange={e => setLocalSupabaseKey(e.target.value)}
                required
              />
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <Button 
                type="submit" 
                className="w-full text-xs font-black uppercase tracking-widest py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl"
              >
                Salvar & Tentar Conectar
              </Button>
              <Button 
                type="button"
                variant="secondary"
                className="w-full sm:w-auto text-xs font-black uppercase tracking-widest py-3 border border-slate-300 dark:border-white/10"
                onClick={() => window.location.reload()}
              >
                Recarregar
              </Button>
            </div>
          </form>

          {/* Opção modo Offline */}
          <div className="bg-slate-50 dark:bg-white/5 p-5 sm:p-8 rounded-[2rem] text-left space-y-4 border border-slate-100 dark:border-white/5">
            <div className="space-y-1">
              <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Modo Offline (Dispositivo)</p>
              <h3 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-white">Deseja usar o sistema de forma local?</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                Ative o Modo Local e todos os seus eventos serão armazenados temporariamente na memória local do seu navegador. Você poderá usar o aplicativo com todas as funções normalmente, sem depender da internet, e reconfigurar o Supabase depois!
              </p>
            </div>
            <Button 
              type="button" 
              className="w-full text-xs font-black uppercase tracking-widest py-3.5 bg-gold hover:bg-gold-light text-obsidian rounded-xl"
              onClick={handleEnableOffline}
            >
              Ativar Modo Local (Offline)
            </Button>
          </div>

          {/* Dicas adicionais de diagnóstico */}
          <div className="text-left text-xs text-slate-400 dark:text-slate-500 space-y-2 border-t border-slate-100 dark:border-white/5 pt-4 font-medium px-2">
            <p className="font-extrabold uppercase tracking-wider text-[9px] text-slate-500 dark:text-slate-400">Por que acontece o erro "Failed to fetch"?</p>
            <ul className="list-disc pl-4 space-y-1 leading-relaxed text-[11px]">
              <li><strong>Bloqueio por Adblocker:</strong> Extensões de navegador (como uBlock Origin, AdBlock, etc) podem erroneamente bloquear conexões aos domínios <code className="bg-slate-100 dark:bg-white/5 px-1 py-0.5 rounded font-mono">*.supabase.co</code>. Desative temporariamente no AI Studio.</li>
              <li><strong>Banco de dados Pausado:</strong> Projetos do plano gratuito do Supabase são suspensos por inatividade. Acesse o seu painel do Supabase online para readequar a atividade do banco.</li>
              <li><strong>Erro de digitação:</strong> Verifique se a URL não possui barras extras no final ou espaços invisíveis recortados ao copiar.</li>
            </ul>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!isAppAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-obsidian flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white dark:bg-[#0a0a0a] rounded-[3rem] p-8 sm:p-12 shadow-2xl border border-slate-100 dark:border-slate-800 space-y-8 text-center"
        >
          <div className="flex flex-col items-center justify-center">
            <AppLogo className="w-64 h-auto drop-shadow-xl" />
          </div>

          <div className="space-y-2">
            <h1 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-widest">Acesso ao Sistema</h1>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-bold">GESTÃO FINANCEIRA EPP</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2 text-left">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Senha de Acesso</label>
              <input 
                type="password"
                autoFocus
                className={`w-full fintech-input text-center text-xl tracking-[0.3em] font-black py-4 ${loginError ? 'border-rose-500 bg-rose-50 dark:bg-rose-900/10 focus:ring-rose-500/10' : ''}`}
                value={loginPassword || ''}
                onChange={(e) => {
                  setLoginPassword(e.target.value);
                  setLoginError(false);
                }}
                placeholder="••••••••"
              />
              {loginError && (
                <motion.p 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-[10px] font-black text-rose-500 text-center uppercase mt-2"
                >
                  Senha Incorreta. Tente novamente.
                </motion.p>
              )}
            </div>

            <Button type="submit" className="w-full py-5 text-xs font-black uppercase tracking-[0.3em] bg-gold text-obsidian shadow-2xl shadow-gold/20 dark:shadow-none active:scale-95 transition-all">
              Entrar no Sistema
            </Button>
          </form>

          <p className="text-[8px] text-slate-300 dark:text-slate-700 font-black uppercase tracking-[0.2em] pt-4">
            &copy; 2026 {settings.businessName}
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-[#f8f9fa] dark:bg-obsidian font-sans pb-12 transition-colors duration-500 text-slate-900 dark:text-slate-300 relative overflow-hidden`}>
      {/* Ambient background art */}
      <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] pointer-events-none transition-all duration-1000 ${darkMode ? 'opacity-0' : 'opacity-10'}`}>
        <div className={`absolute inset-0 bg-gradient-to-b blur-3xl transition-colors duration-1000 ${darkMode ? 'from-transparent to-transparent' : 'from-gold/5 to-transparent'}`} />
      </div>

      {/* Header */}
      <header className="py-6 text-center space-y-4 relative">
        <div className="absolute right-4 top-4 flex items-center gap-2 z-50">
          {isOfflineMode && (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 sm:py-2 bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-500 rounded-xl text-[9px] font-black uppercase tracking-wider">
              <WifiOff className="w-3.5 h-3.5 animate-pulse" />
              <span className="hidden sm:inline">OFFLINE</span>
              <button 
                onClick={() => {
                  localStorage.removeItem('km_offline_mode');
                  window.location.reload();
                }}
                className="ml-1 bg-amber-500 text-slate-900 px-1.5 py-0.5 rounded font-black text-[8px] tracking-tight hover:bg-amber-400 active:scale-95 transition-all"
                title="Desativar modo offline e tentar reconectar com o banco de dados Supabase"
              >
                CONECTAR
              </button>
            </div>
          )}
          <button 
            onClick={() => handleAdminTabAccess('stats')}
            className="p-1.5 sm:p-2 rounded-xl bg-white dark:bg-[#111112] shadow-md border border-slate-200 dark:border-[#2a2a2c] text-slate-600 dark:text-slate-400 hover:text-gold transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5 overflow-hidden"
            title="Estatísticas do Administrador"
          >
            <BarChart3 className="w-3.5 h-3.5 text-gold" />
            <span className="text-[8px] font-black uppercase tracking-tighter hidden sm:inline">Painel</span>
          </button>

          <button 
            onClick={() => {
              const next = !darkMode;
              setDarkMode(next);
            }}
            className="p-1.5 sm:p-2 rounded-xl bg-white dark:bg-[#111112] shadow-md border border-slate-200 dark:border-[#2a2a2c] text-slate-600 dark:text-slate-400 hover:text-gold transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5 overflow-hidden"
            title={darkMode ? "Ativar Modo Dia" : "Ativar Modo Noite"}
          >
            <motion.div
              key={darkMode ? 'dark' : 'light'}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -10, opacity: 0 }}
              className="flex items-center gap-1.5"
            >
              {darkMode ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                  <span className="text-[8px] font-black uppercase tracking-tighter hidden sm:inline">DIA</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="text-[8px] font-black uppercase tracking-tighter hidden sm:inline">NOITE</span>
                </>
              )}
            </motion.div>
          </button>
        </div>

        <div className="flex flex-col items-center justify-center pt-4 relative overflow-visible h-48 sm:h-64">
          <motion.div 
            initial={{ y: 0, opacity: 0 }}
            animate={{ y: 0, opacity: isSummaryOpen ? 0 : 1 }}
            className={`z-[100] touch-none select-none transition-opacity duration-300 ${isSummaryOpen ? 'pointer-events-none' : ''}`}
          >
            <AppLogo className="w-48 h-auto sm:w-64 drop-shadow-2xl" />
          </motion.div>
        </div>
        
        <div className="flex flex-wrap justify-center gap-4 px-4">
          <button 
            onClick={() => setActiveTab('new')}
            className={`px-4 sm:px-8 py-3 rounded-xl font-black text-[10px] sm:text-xs tracking-[0.2em] transition-all shadow-sm ${activeTab === 'new' ? 'bg-gold text-obsidian shadow-gold/20 dark:shadow-none ring-2 ring-gold/40 dark:ring-gold/30' : 'bg-white dark:bg-[#0b0b0c] text-slate-400 dark:text-slate-700 hover:text-slate-600 dark:hover:text-slate-500 border border-slate-100 dark:border-[#1a1a1c]'}`}
          >
            NOVO EVENTO
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`px-4 sm:px-8 py-3 rounded-xl font-black text-[10px] sm:text-xs tracking-[0.2em] transition-all shadow-sm ${activeTab === 'history' ? 'bg-gold text-obsidian shadow-gold/20 dark:shadow-none ring-2 ring-gold/40 dark:ring-gold/30' : 'bg-white dark:bg-[#0b0b0c] text-slate-400 dark:text-slate-700 hover:text-slate-600 dark:hover:text-slate-500 border border-slate-100 dark:border-[#1a1a1c]'}`}
          >
            HISTÓRICO
          </button>
          <button 
            onClick={() => handleAdminTabAccess('stats')}
            className={`px-4 sm:px-8 py-3 rounded-xl font-black text-[10px] sm:text-xs tracking-[0.2em] transition-all shadow-sm ${activeTab === 'stats' ? 'bg-gold text-obsidian shadow-gold/20 dark:shadow-none ring-2 ring-gold/40 dark:ring-gold/30' : 'bg-white dark:bg-[#0b0b0c] text-slate-400 dark:text-slate-700 hover:text-slate-600 dark:hover:text-slate-500 border border-slate-100 dark:border-[#1a1a1c]'}`}
          >
            ESTATÍSTICAS
          </button>
          <button 
            onClick={() => handleAdminTabAccess('settings')}
            className={`px-4 sm:px-8 py-3 rounded-xl font-black text-[10px] sm:text-xs tracking-[0.2em] transition-all shadow-sm ${activeTab === 'settings' ? 'bg-gold text-obsidian shadow-gold/20 dark:shadow-none ring-2 ring-gold/40 dark:ring-gold/30' : 'bg-white dark:bg-[#0b0b0c] text-slate-400 dark:text-slate-700 hover:text-slate-600 dark:hover:text-slate-500 border border-slate-100 dark:border-[#1a1a1c]'}`}
          >
            GESTÃO EPP
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-20">
        {activeTab === 'new' && (
          <>
            <div className="lg:col-span-8 space-y-8">
              <div className="bg-white dark:bg-[#0b0b0c] rounded-xl shadow-sm border-l-4 border-gold overflow-hidden border border-slate-100 dark:border-[#1a1a1c]">
                <div className="p-6 border-b dark:border-[#1a1a1c] flex items-center gap-3 bg-slate-50/50 dark:bg-[#0b0b0c]">
                  <Edit2 className="w-5 h-5 text-gold" />
                  <h2 className="font-bold text-slate-800 dark:text-slate-300 uppercase tracking-tight">Novo Evento</h2>
                </div>
                
                <div className="p-8 space-y-6">
                  <Input 
                    label="Nome do Evento" 
                    placeholder="Ex: Nome do Evento" 
                    value={formData.name || ''}
                    onChange={(e: any) => setFormData({...formData, name: e.target.value})}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <Input 
                      label="VALOR DO EVENTO (R$)" 
                      isCurrency
                      prefix="R$"
                      placeholder="0,00"
                      value={formData.revenue}
                      onChange={(e: any) => setFormData({...formData, revenue: Number(e.target.value)})}
                    />
                    <Input 
                      label="Imposto de Nota (%)" 
                      type="number" 
                      placeholder="0"
                      value={formData.invoiceTaxPercentage === 0 ? '' : formData.invoiceTaxPercentage}
                      onChange={(e: any) => setFormData({...formData, invoiceTaxPercentage: Number(e.target.value)})}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Input 
                      label="Data do Evento" 
                      type="date"
                      value={formData.date || ''}
                      onChange={(e: any) => setFormData({...formData, date: e.target.value})}
                    />
                    <Input 
                      label="Horário" 
                      type="time"
                      value={formData.time || ''}
                      onChange={(e: any) => setFormData({...formData, time: e.target.value})}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Empresa Responsável</label>
                    <textarea 
                      className="w-full rounded-xl border-slate-100 dark:border-[#1a1a1c] bg-slate-50 dark:bg-[#18181a] px-4 py-3 text-sm focus:ring-2 focus:ring-gold/20 min-h-[120px] outline-none text-slate-900 dark:text-slate-100"
                      placeholder="Digite a empresa responsável..."
                      value={formData.observations || ''}
                      onChange={(e) => setFormData({...formData, observations: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              {/* Expenses Grid */}
              <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm p-8 grid grid-cols-1 md:grid-cols-2 gap-12 border border-slate-100 dark:border-slate-800">
                <div className="space-y-4">
                  <h3 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest border-b dark:border-slate-800 pb-2">Despesas Operacionais</h3>
                  <div className="space-y-4">
                    {predefinedExpenses.operacionais.map(item => (
                      <ExpenseItem 
                        key={item} 
                        label={item}
                        expense={formData.expenses.find(e => e.label === item)}
                        onToggle={() => toggleExpense(item)}
                        onUpdate={updateExpense}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest border-b dark:border-slate-800 pb-2">Outras Despesas</h3>
                  <div className="space-y-4">
                    {predefinedExpenses.outros.map(item => (
                      <ExpenseItem 
                        key={item} 
                        label={item}
                        expense={formData.expenses.find(e => e.label === item)}
                        onToggle={() => toggleExpense(item)}
                        onUpdate={updateExpense}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Sticky Summary Column */}
            <div className="lg:col-span-4 lg:sticky lg:top-8 gap-6 space-y-6">
              <div className="bg-white dark:bg-[#0a0a0a] rounded-3xl shadow-xl shadow-slate-100 dark:shadow-none overflow-hidden border border-slate-100 dark:border-slate-800">
                <div className="p-8 space-y-8">
                  <div className="space-y-4">
                    <div className="bg-slate-50 dark:bg-[#030303] p-4 rounded-2xl text-center border-b-2 border-slate-100 dark:border-slate-950">
                        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest mb-1">VALOR DO EVENTO (NF)</p>
                        <p className="text-2xl font-black text-slate-900 dark:text-white leading-none">{formatCurrency(totals.totalRevenue || 0)}</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-[#030303] p-4 rounded-2xl text-center border-b-2 border-slate-100 dark:border-slate-950">
                        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest mb-1">Total Despesas</p>
                        <p className="text-2xl font-black text-rose-500 dark:text-rose-600 leading-none">{formatCurrency(totals.totalExpenses)}</p>
                    </div>
                    {totals.taxAmount > 0 && (
                      <div className="bg-slate-50 dark:bg-[#030303] p-4 rounded-2xl text-center border-b-2 border-slate-100 dark:border-slate-950">
                          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest mb-1">Imposto NF ({formData.invoiceTaxPercentage}%)</p>
                          <p className="text-2xl font-black text-gold leading-none">{formatCurrency(totals.taxAmount)}</p>
                      </div>
                    )}
                    <div className="bg-emerald-50 dark:bg-emerald-950/20 p-6 rounded-2xl text-center border-b-2 border-emerald-100 dark:border-emerald-950/10">
                        <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-500 uppercase tracking-widest mb-1">Resultado Líquido Final</p>
                        <p className="text-4xl font-black text-emerald-700 dark:text-emerald-400 leading-none">{formatCurrency(totals.finalProfit)}</p>
                    </div>
                  </div>

                  {/* Divider Selector */}
                  <div className="space-y-4">
                    <p className="text-center text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Dividir lucro por:</p>
                    <div className="flex gap-2">
                       {[1, 2, 3].map(val => (
                         <button 
                          key={val}
                          onClick={() => setFormData({...formData, divider: val})}
                          className={`flex-1 py-3 rounded-xl font-bold transition-all ${formData.divider === val ? 'bg-white dark:bg-[#111111] shadow-lg shadow-gold/10 dark:shadow-none ring-1 ring-gold/20 dark:ring-gold text-gold' : 'bg-slate-100 dark:bg-[#1a1a1c] text-slate-400 dark:text-slate-600 hover:bg-slate-200 dark:hover:bg-[#2a2a2c]'}`}
                         >
                           {val === 1 ? '+1' : `÷${val}`}
                         </button>
                       ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-3">
                    <button 
                      onClick={handleSave}
                      className="w-full bg-gold hover:bg-gold-dark text-obsidian font-bold py-5 rounded-2xl shadow-lg shadow-gold/10 dark:shadow-none active:scale-95 transition-all uppercase tracking-widest text-xs"
                    >
                      Salvar no Histórico
                    </button>
                    <button 
                      onClick={() => { setSelectedEvent(formData as any); setIsSummaryOpen(true); }}
                      className="w-full bg-slate-100 dark:bg-[#111111] text-slate-500 dark:text-slate-400 font-bold py-5 rounded-2xl active:scale-95 transition-all uppercase tracking-widest text-xs"
                    >
                      Ver Resumo
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'history' && (
          <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4 duration-500">
            {events.map((ev) => (
              <motion.div 
                key={ev.id} 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-[#0b0b0c] p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-[#1a1a1c] hover:shadow-xl hover:border-gold/20 cursor-pointer transition-all group lg:min-h-[220px] flex flex-col justify-between"
                onClick={() => { setSelectedEvent(ev); setIsSummaryOpen(true); }}
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                     <div className="flex gap-2">
                        <div className="bg-gold/10 dark:bg-gold/20 p-3 rounded-xl text-gold dark:text-gold transition-colors group-hover:bg-gold group-hover:text-obsidian"><Calendar className="w-5 h-5" /></div>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleDuplicate(ev); }} 
                          className="p-2 text-slate-300 dark:text-slate-700 hover:text-gold hover:bg-gold/10 dark:hover:bg-gold/20 rounded-full transition-all"
                          title="Duplicar Evento"
                        >
                          <Copy className="w-5 h-5" />
                        </button>
                     </div>
                    <button 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        handleDelete(ev.id!);
                      }} 
                      className="p-2 text-slate-300 dark:text-slate-500 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-full transition-all"
                      title="Excluir Evento"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  <h4 className="font-black text-slate-900 dark:text-slate-100 text-lg group-hover:text-gold transition-colors">{ev.name}</h4>
                  <p className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest mt-1">{formatDate(ev.date)}</p>
                </div>
                
                <div className="mt-6 pt-6 border-t dark:border-slate-900 flex justify-between items-end">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter">VALOR DO EVENTO</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-slate-300">{formatCurrency(ev.revenue || 0)}</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-500 uppercase tracking-tighter">Resultado Líquido</span>
                    <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">{formatCurrency(calculateSummary(ev).finalProfit)}</span>
                  </div>
                </div>
              </motion.div>
            ))}
            {events.length === 0 && (
              <div className="col-span-full py-20 text-center space-y-4">
                <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-full w-20 h-20 flex items-center justify-center mx-auto">
                   <FileText className="w-10 h-10 text-slate-200 dark:text-slate-800" />
                </div>
                <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">Seu histórico está vazio.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="lg:col-span-12 space-y-12 animate-in fade-in duration-700">
             <StatsView events={events} />
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="lg:col-span-12 animate-in fade-in duration-700">
             <SettingsView 
                onRefresh={loadAllData} 
                initialSettings={settings}
              />
          </div>
        )}
      </main>

      {/* Summary Modal (Reuse existing) */}
      <SummaryModal 
        isOpen={isSummaryOpen}
        event={selectedEvent}
        onClose={() => { setIsSummaryOpen(false); setSelectedEvent(null); }}
        onEdit={(e: EventData) => {
          setIsSummaryOpen(false);
          setFormData(e);
          setActiveTab('new');
        }}
        isAdminAuthenticated={isAdminAuthenticated}
        setIsPinModalOpen={setIsPinModalOpen}
        setPinAction={setPinAction}
        onDelete={handleDelete}
      />

      <PinModal 
        isOpen={isPinModalOpen}
        onClose={() => {
          setIsPinModalOpen(false);
          setPinAction(null);
        }}
        onSuccess={() => {
          setIsAdminAuthenticated(true);
          if (pinAction) pinAction();
          setPinAction(null);
        }}
      />
    </div>
  );
}
