
import React, { memo } from 'react';
import { Student, FinancialTransaction, BeltColor } from '../types';
import { BELT_STYLES } from '../constants';
import { IconAlert, IconTrash, IconCheck, IconEdit, IconWallet, IconPlus, IconBack } from './icons';

interface StudentFinancialCardProps {
  student: Student;
  paidSum: number;
  overdueSum: number;
  pendingSum: number;
  monthlyAmount: number;
  transactions: FinancialTransaction[];
  darkMode: boolean;
  canEdit?: boolean;
  isOverdue: (tx: FinancialTransaction) => boolean;
  onMarkAsPaid: (id: string) => void;
  onUndoPayment: (id: string) => void;
  onEdit: (tx: FinancialTransaction) => void;
  onDelete: (id: string) => void;
  onClear: (studentId: string) => void;
}

const StudentFinancialCard = memo(({
  student,
  paidSum,
  overdueSum,
  pendingSum,
  monthlyAmount,
  transactions,
  darkMode,
  canEdit = false,
  isOverdue,
  onMarkAsPaid,
  onUndoPayment,
  onEdit,
  onDelete,
  onClear
}: StudentFinancialCardProps) => {
  const beltStyle = BELT_STYLES[student.belt] || BELT_STYLES[BeltColor.WHITE];
  const isDefaulter = overdueSum > 0;

  return (
    <div className={`rounded-3xl border overflow-hidden flex flex-col glass-card premium-shadow animate-in transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/10 ${darkMode ? 'border-white/5' : 'border-white/20'}`}>
      {/* Card Header (Liquid Glass Header) */}
      <div className="p-6 flex items-center space-x-5 border-b border-white/10 bg-gradient-to-br from-white/10 to-transparent dark:from-white/5 dark:to-transparent">
        <div className="relative group">
          <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 shadow-2xl flex-shrink-0 relative z-10 transition-transform duration-300 group-hover:scale-110" style={{ borderColor: beltStyle.solid }}>
            {student.photo ? (
              <img src={student.photo} alt={student.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 text-slate-500 font-black text-2xl">
                {student.name.charAt(0)}
              </div>
            )}
          </div>
          <div className="absolute -inset-2 rounded-2xl blur-xl opacity-40 group-hover:opacity-70 transition-opacity duration-300" style={{ backgroundColor: beltStyle.solid }}></div>
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className={`font-black tracking-tight leading-tight text-xl mb-1 ${darkMode ? 'text-white' : 'text-slate-900'}`}>{student.name}</h4>
          <div className="flex flex-wrap gap-2">
            <span className="text-[9px] px-3 py-1 rounded-full text-white font-black uppercase tracking-[0.1em] shadow-lg" style={{ backgroundColor: beltStyle.solid }}>
              {student.belt}
            </span>
            {isDefaulter && (
              <span className="text-[9px] bg-red-500 text-white px-3 py-1 rounded-full font-black uppercase tracking-[0.1em] shadow-lg shadow-red-500/40 animate-pulse">
                INADIMPLENTE
              </span>
            )}
          </div>
        </div>

        {canEdit && (
          <button
            onClick={() => onClear(student.id)}
            className="p-3 bg-white/5 dark:bg-white/5 hover:bg-red-500 text-slate-400 hover:text-white rounded-2xl transition-all duration-300 ml-2 border border-white/10 hover:border-red-500 shadow-sm"
            title="Limpar TODO histórico financeiro"
          >
            <IconTrash className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Card Body: Stats (Bento-style Tiles) */}
      <div className="p-6 flex-1 space-y-6">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-black tracking-[0.2em]">Cota Mensal</p>
            <div className="flex items-baseline gap-2">
              <span className="text-sm font-bold text-slate-400">R$</span>
              <span className={`text-4xl font-black tracking-tighter ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                {monthlyAmount > 0 ? monthlyAmount.toFixed(0) : '—'}
              </span>
            </div>
          </div>
          <div className={`p-4 rounded-2xl shadow-inner ${isDefaulter ? 'bg-red-500/10 text-red-500 ring-1 ring-red-500/20' : 'bg-blue-500/10 text-blue-500 ring-1 ring-blue-500/20'}`}>
            <IconWallet className="w-6 h-6" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-emerald-500/5 dark:bg-emerald-500/10 p-4 rounded-3xl border border-emerald-500/10 backdrop-blur-sm transition-all hover:bg-emerald-500/20 active:scale-95">
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-black uppercase tracking-tighter mb-1 text-center">PAGO</p>
            <p className="text-lg font-black text-emerald-700 dark:text-emerald-300 text-center">R${paidSum.toFixed(0)}</p>
          </div>
          <div className="bg-rose-500/5 dark:bg-rose-500/10 p-4 rounded-3xl border border-rose-500/10 backdrop-blur-sm transition-all hover:bg-rose-500/20 active:scale-95">
            <p className="text-[10px] text-rose-600 dark:text-rose-400 font-black uppercase tracking-tighter mb-1 text-center">FALTA</p>
            <p className="text-lg font-black text-rose-700 dark:text-rose-300 text-center">R${overdueSum.toFixed(0)}</p>
          </div>
          <div className="bg-amber-500/5 dark:bg-amber-500/10 p-4 rounded-3xl border border-amber-500/10 backdrop-blur-sm transition-all hover:bg-amber-500/20 active:scale-95">
            <p className="text-[10px] text-amber-600 dark:text-amber-400 font-black uppercase tracking-tighter mb-1 text-center">FUTURO</p>
            <p className="text-lg font-black text-amber-700 dark:text-amber-300 text-center">R${pendingSum.toFixed(0)}</p>
          </div>
        </div>

        {/* Vencimentos / Pendências (The "Liquid" Ledger) */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between px-1">
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em]">PRÓXIMOS LANÇAMENTOS</p>
            <div className="flex-1 h-[2px] bg-gradient-to-r from-slate-100 to-transparent dark:from-slate-800 dark:to-transparent ml-4" />
          </div>
          
          <div className="max-h-64 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
            {transactions.filter(t => !t.paidDate).length === 0 ? (
              <div className="flex flex-col items-center py-10 bg-white/5 dark:bg-white/5 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center mb-3">
                  <IconCheck className="w-6 h-6 text-emerald-500" />
                </div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Tudo em dia! ✨</p>
              </div>
            ) : (
              transactions
                .filter(t => !t.paidDate)
                .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
                .map(tx => {
                  const isLate = isOverdue(tx);
                  return (
                    <div key={tx.id} className={`group relative p-4 rounded-3xl transition-all border ${
                      isLate 
                        ? 'bg-rose-500/10 border-rose-500/20 hover:bg-rose-500/20' 
                        : 'bg-white/20 dark:bg-slate-800/40 border-white/20 dark:border-white/5 hover:border-blue-500/30'
                    }`}>
                      <div className="flex justify-between items-center relative z-10">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${isLate ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`}>
                            <p className="text-[10px] font-black leading-none text-center">
                              {new Date(tx.dueDate + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit' })}<br/>
                              <span className="opacity-70">{new Date(tx.dueDate + 'T12:00:00').toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase()}</span>
                            </p>
                          </div>
                          <div className="flex flex-col">
                            <span className={`text-[13px] font-black tracking-tight ${isLate ? 'text-rose-600 dark:text-rose-400' : 'text-slate-800 dark:text-slate-200'}`}>
                              {tx.description || tx.type}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-tighter">
                              Vencimento pendente
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-base font-black ${isLate ? 'text-rose-600' : 'text-slate-900 dark:text-white'}`}>
                            R${tx.amount.toFixed(0)}
                          </span>
                          {canEdit && (
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => onMarkAsPaid(tx.id)}
                                className="bg-emerald-500 text-white p-2 rounded-xl shadow-lg shadow-emerald-500/30 hover:scale-110 active:scale-95 transition-all"
                                title="Pagar"
                              >
                                <IconCheck className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => onEdit(tx)}
                                className="bg-blue-500 text-white p-2 rounded-xl shadow-lg shadow-blue-500/30 hover:scale-110 active:scale-95 transition-all"
                                title="Editar"
                              >
                                <IconEdit className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </div>

        {/* Histórico Pago (Glass Sub-Panel) */}
        {transactions.filter(t => t.paidDate).length > 0 && (
          <div className="mt-4 border-t border-white/10 pt-4">
            <details className="group">
              <summary className="list-none cursor-pointer flex items-center justify-between text-[10px] font-black text-slate-400 tracking-[0.2em] hover:text-blue-500 transition-colors">
                <span>HISTÓRICO PAGO ({transactions.filter(t => t.paidDate).length})</span>
                <span className="w-8 h-8 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center transition-transform group-open:rotate-180">
                  <IconPlus className="w-3 h-3 group-open:rotate-45 transition-transform" />
                </span>
              </summary>
              <div className="mt-4 space-y-2 max-h-52 overflow-y-auto pr-2 custom-scrollbar">
                {transactions
                  .filter(t => t.paidDate)
                  .sort((a, b) => (b.paidDate || '').localeCompare(a.paidDate || ''))
                  .map(tx => (
                    <div key={tx.id} className="flex justify-between items-center p-3 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                      <div className="flex items-center gap-3">
                        <div className="w-1.5 h-6 bg-emerald-500/30 rounded-full" />
                        <div className="flex flex-col">
                          <span className="text-[11px] font-black text-emerald-600 dark:text-emerald-400">
                            {new Date(tx.paidDate + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold uppercase truncate max-w-[120px]">
                            {tx.description}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-black text-emerald-700 dark:text-emerald-300">R${tx.amount.toFixed(0)}</span>
                        {canEdit && (
                          <button
                            onClick={() => onUndoPayment(tx.id)}
                            className="p-1.5 bg-amber-500/10 hover:bg-amber-500 text-amber-500 hover:text-white rounded-lg transition-all"
                            title="Estornar"
                          >
                            <IconBack className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </details>
          </div>
        )}
      </div>
    </div>
  );
});

export default StudentFinancialCard;
