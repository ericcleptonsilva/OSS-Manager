
import React, { memo } from 'react';
import { Student, FinancialTransaction, BeltColor } from '../types';
import { BELT_STYLES } from '../constants';
import { IconAlert, IconTrash, IconCheck, IconEdit } from './icons';

interface StudentFinancialCardProps {
  student: Student;
  paidSum: number;
  overdueSum: number;
  pendingSum: number;
  monthlyAmount: number;
  transactions: FinancialTransaction[];
  darkMode: boolean;
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
    <div className={`rounded-xl border shadow-sm overflow-hidden flex flex-col ${darkMode ? 'bg-jiu-surface border-gray-700' : 'bg-white border-gray-200'}`}>
      {/* Card Header */}
      <div className="p-4 flex items-center space-x-3 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
        <div className="w-12 h-12 rounded-full overflow-hidden border-2 shadow-sm flex-shrink-0" style={{ borderColor: beltStyle.solid }}>
          {student.photo ? (
            <img src={student.photo} alt={student.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500 font-bold">
              {student.name.charAt(0)}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className={`font-bold truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>{student.name}</h4>
          <div className="flex items-center space-x-2">
            <span className="text-xs px-2 py-0.5 rounded text-white font-medium" style={{ backgroundColor: beltStyle.solid }}>{student.belt}</span>
            {isDefaulter && (
              <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-bold uppercase border border-red-200">Em Atraso</span>
            )}
          </div>
        </div>
        {/* Botão de Limpar Histórico do Aluno */}
        <button
          onClick={() => onClear(student.id)}
          className="p-2 bg-gray-100 hover:bg-red-100 text-gray-400 hover:text-red-500 rounded-full transition-colors ml-2"
          title="Limpar TODO histórico financeiro"
        >
          <IconTrash className="w-4 h-4" />
        </button>
      </div>

      {/* Card Body: Stats */}
      <div className="p-4 flex-1">
        <div className="mb-4">
          <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Mensalidade Estimada</p>
          <p className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            {monthlyAmount > 0 ? `R$ ${monthlyAmount.toFixed(2)}` : 'Não definida'}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-1 md:gap-2 text-center mb-4">
          <div className="bg-green-50 dark:bg-green-900/20 p-1.5 md:p-2 rounded-lg border border-green-100 dark:border-green-900/30 overflow-hidden">
            <p className="text-[9px] md:text-[10px] text-green-600 dark:text-green-400 font-bold uppercase truncate">Pago</p>
            <p className="text-xs md:text-sm font-bold text-green-700 dark:text-green-300 truncate">R${paidSum.toFixed(0)}</p>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 p-1.5 md:p-2 rounded-lg border border-red-100 dark:border-red-900/30 overflow-hidden">
            <p className="text-[9px] md:text-[10px] text-red-600 dark:text-red-400 font-bold uppercase truncate">Falta</p>
            <p className="text-xs md:text-sm font-bold text-red-700 dark:text-red-300 truncate">R${overdueSum.toFixed(0)}</p>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-1.5 md:p-2 rounded-lg border border-yellow-100 dark:border-yellow-900/30 overflow-hidden">
            <p className="text-[9px] md:text-[10px] text-yellow-600 dark:text-yellow-400 font-bold uppercase truncate">Futuro</p>
            <p className="text-xs md:text-sm font-bold text-yellow-700 dark:text-yellow-300 truncate">R${pendingSum.toFixed(0)}</p>
          </div>
        </div>

        {/* Vencimentos / Pendências — TODOS exibidos com scroll */}
        <div className="space-y-2">
          <p className="text-xs text-gray-400 font-medium uppercase border-b border-gray-100 dark:border-gray-700 pb-1">Vencimentos / Pendências</p>
          <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
            {transactions.filter(t => !t.paidDate).length === 0 ? (
              <p className="text-xs text-gray-500 italic py-2 text-center">Tudo em dia! 🎉</p>
            ) : (
              transactions
                .filter(t => !t.paidDate)
                .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
                .map(tx => {
                  const isLate = isOverdue(tx);
                  return (
                    <div key={tx.id} className={`flex justify-between items-center text-sm p-1.5 rounded transition-colors ${isLate ? 'bg-red-50 dark:bg-red-900/10' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                      <div className="flex flex-col">
                        <span className={`text-xs font-bold flex items-center gap-1 ${isLate ? 'text-red-500' : (darkMode ? 'text-gray-300' : 'text-gray-700')}`}>
                          {isLate && <IconAlert className="w-3 h-3" />}
                          {new Date(tx.dueDate + 'T12:00:00').toLocaleDateString('pt-BR')}
                        </span>
                        <span className="text-[10px] text-gray-500 truncate max-w-[120px]">{tx.description || tx.type}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className={`font-mono text-xs mr-1 ${isLate ? 'text-red-600 font-bold' : 'text-gray-600 dark:text-gray-400'}`}>
                          R${tx.amount.toFixed(0)}
                        </span>
                        <button
                          onClick={() => onMarkAsPaid(tx.id)}
                          className="text-green-500 hover:text-green-700 dark:hover:text-green-400 p-1 bg-green-50 dark:bg-green-900/30 rounded"
                          title="Confirmar pagamento"
                        >
                          <IconCheck className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => onEdit(tx)}
                          className="text-blue-400 hover:text-blue-600 p-1"
                          title="Editar"
                        >
                          <IconEdit className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => onDelete(tx.id)}
                          className="text-gray-400 hover:text-red-600 p-1"
                          title="Excluir"
                        >
                          <IconTrash className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </div>

        {/* Histórico Pago — colapsável com datas de criação/alteração */}
        {transactions.filter(t => t.paidDate).length > 0 && (
          <details className="mt-3">
            <summary className="text-xs text-gray-400 font-medium uppercase cursor-pointer select-none hover:text-gray-600 transition-colors flex items-center gap-1">
              <span>✅ Histórico Pago ({transactions.filter(t => t.paidDate).length})</span>
            </summary>
            <div className="mt-2 max-h-48 overflow-y-auto space-y-1.5 pr-1">
              {transactions
                .filter(t => t.paidDate)
                .sort((a, b) => (b.paidDate || '').localeCompare(a.paidDate || ''))
                .map(tx => {
                  const fmtDate = (iso?: string | null) =>
                    iso ? new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' }) : '—';
                  const fmtDateTime = (iso?: string | null) =>
                    iso ? new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' }) : '—';
                  return (
                    <div key={tx.id} className="flex flex-col p-2 rounded-lg bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/30 gap-1">
                      {/* Linha principal */}
                      <div className="flex justify-between items-center">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-green-700 dark:text-green-400">
                            ✓ Pago em {fmtDate(tx.paidDate ? tx.paidDate + 'T12:00:00' : null)}
                          </span>
                          <span className="text-[10px] text-gray-500 truncate max-w-[130px]">
                            {tx.description || tx.type} — Venc: {fmtDate(tx.dueDate + 'T12:00:00')}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="font-mono text-xs font-bold text-green-700 dark:text-green-400">R${tx.amount.toFixed(0)}</span>
                          <button
                            onClick={() => onUndoPayment(tx.id)}
                            className="text-yellow-500 hover:text-yellow-700 p-1 bg-yellow-50 dark:bg-yellow-900/30 rounded text-sm"
                            title="Desfazer pagamento (voltar para pendente)"
                          >
                            ↩
                          </button>
                          <button
                            onClick={() => onEdit(tx)}
                            className="text-blue-400 hover:text-blue-600 p-1"
                            title="Editar"
                          >
                            <IconEdit className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => onDelete(tx.id)}
                            className="text-gray-400 hover:text-red-600 p-1"
                            title="Excluir"
                          >
                            <IconTrash className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      {/* Linha de datas de auditoria */}
                      <div className="flex gap-3 text-[9px] text-gray-400 border-t border-green-100 dark:border-green-900/30 pt-1">
                        {tx.createdAt && (
                          <span title="Data de criação do lançamento">
                            🕐 Criado: {fmtDateTime(tx.createdAt)}
                          </span>
                        )}
                        {tx.updatedAt && tx.updatedAt !== tx.createdAt && (
                          <span title="Última alteração" className="text-orange-400">
                            ✏️ Alterado: {fmtDateTime(tx.updatedAt)}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              }
            </div>
          </details>
        )}
      </div>
    </div>
  );
});

export default StudentFinancialCard;
