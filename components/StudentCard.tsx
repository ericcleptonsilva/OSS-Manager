import React, { memo } from 'react';
import { Student, BeltColor } from '../types';
import { BELT_STYLES } from '../constants';
import { IconEdit, IconTrash, IconAlert } from './icons';

interface StudentCardProps {
  student: Student;
  absences: number;
  hasOverdue: boolean;
  darkMode: boolean;
  canEdit?: boolean;
  onOpenProfile: (id: string) => void;
  onEdit: (student: Student) => void;
  onDelete: (id: string) => void;
  onUpdateDegree: (id: string, degree: number) => void;
}

const StudentCard = memo(({
  student,
  absences,
  hasOverdue,
  darkMode,
  canEdit = false,
  onOpenProfile,
  onEdit,
  onDelete,
  onUpdateDegree
}: StudentCardProps) => {
  // Normalizar a busca da faixa para ser insensível a maiúsculas/minúsculas
  const beltKey = Object.keys(BELT_STYLES).find(
    key => key.toLowerCase() === student.belt?.toLowerCase()
  ) as BeltColor || BeltColor.WHITE;

  const style = BELT_STYLES[beltKey];

  return (
    <div
      onClick={() => onOpenProfile(student.id)}
      className="flex antigravity-card glass-card glass-specular animate-in rounded-2xl overflow-hidden group min-h-[136px] h-auto sm:h-34 cursor-pointer relative"
    >
      {/* Halo de Cor da Faixa (Ambient Belt Glow no fundo do card) */}
      <div
        className="absolute -right-12 -top-12 w-32 h-32 rounded-full blur-3xl opacity-15 pointer-events-none transition-opacity duration-500 group-hover:opacity-30"
        style={{ backgroundColor: style.solid }}
      />

      {/* Left: Photo / Belt Banner (28%–32%) */}
      <div
        className="w-[30%] sm:w-[28%] flex items-center justify-center p-3 sm:p-4 relative overflow-hidden shrink-0"
        style={{
          background: `linear-gradient(135deg, ${style.background}, ${style.solid}22)`,
        }}
      >
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
        {student.photo ? (
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-white/60 shadow-xl z-10 relative transition-transform duration-500 group-hover:scale-105">
            <img src={student.photo} alt={student.name} className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center z-10 border-2 border-white/30 shadow-xl transition-transform duration-500 group-hover:scale-105">
            <span className="text-3xl sm:text-4xl font-athletic text-white drop-shadow-md tracking-tighter">
              {student.name.charAt(0)}
            </span>
          </div>
        )}

        {/* Ambient Blur Indicator */}
        <div
          className="absolute -bottom-4 -left-4 w-14 h-14 rounded-full blur-xl opacity-40 animate-pulse pointer-events-none"
          style={{ backgroundColor: style.solid }}
        />
      </div>

      {/* Middle: Info Content */}
      <div className={`flex-1 p-3.5 sm:p-4 flex flex-col justify-between relative ${darkMode ? 'bg-slate-900/40' : 'bg-white/80'}`}>
        <div>
          <div className="flex justify-between items-start gap-1">
            <h4
              className={`font-athletic text-base sm:text-lg truncate pr-1 tracking-tight transition-colors ${
                darkMode ? 'text-white group-hover:text-blue-400' : 'text-slate-900 group-hover:text-blue-600'
              }`}
              title={student.name}
            >
              {student.name}
            </h4>
            {canEdit && (
              <div className="flex items-center space-x-1 opacity-90 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(student);
                  }}
                  className="text-slate-400 hover:text-blue-500 transition-colors p-2 rounded-xl hover:bg-blue-500/10 active:scale-95 touch-target flex items-center justify-center"
                  title="Editar Aluno"
                  aria-label="Editar Aluno"
                >
                  <IconEdit className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Badges de Faixa e Débito */}
          <div className="flex flex-wrap items-center gap-1.5 mt-1">
            <span
              className="text-[10px] sm:text-[11px] font-athletic px-2.5 py-0.5 rounded-lg border backdrop-blur-md shadow-sm transition-all"
              style={{
                color: style.solid,
                borderColor: `${style.solid}40`,
                backgroundColor: `${style.solid}15`
              }}
            >
              {student.belt}
            </span>
            {hasOverdue && (
              <span className="animate-pulse bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30 text-[9px] font-athletic px-2 py-0.5 rounded-lg flex items-center shadow-sm">
                <IconAlert className="w-3 h-3 mr-1" /> DÉBITO
              </span>
            )}
          </div>

          {/* Métricas Compactas */}
          <div className="flex items-center gap-3 sm:gap-4 mt-2.5 text-slate-500 dark:text-slate-400 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-black uppercase tracking-wider opacity-60">Faltas:</span>
              <span className={`font-bold ${absences > 3 ? 'text-red-500 font-extrabold' : ''}`}>{absences}</span>
            </div>
            <div className="w-px h-3 bg-slate-300 dark:bg-white/10"></div>
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-black uppercase tracking-wider opacity-60">Status:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">Ativo</span>
            </div>
          </div>
        </div>

        {/* Rodapé do Card */}
        <div className="flex items-center justify-between border-t border-slate-100 dark:border-white/5 pt-2 mt-2">
          <div className="flex flex-col">
            <span className="text-[9px] text-slate-400 uppercase font-black tracking-widest opacity-60 leading-none mb-0.5">
              Matrícula
            </span>
            <span className="text-xs font-bold tracking-tight opacity-90 leading-none text-slate-700 dark:text-slate-300">
              {new Date(student.startDate).toLocaleDateString('pt-BR')}
            </span>
          </div>
          {canEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(student.id);
              }}
              className="text-slate-400 hover:text-red-500 transition-colors p-2 rounded-xl hover:bg-red-500/10 active:scale-95 touch-target flex items-center justify-center opacity-90 md:opacity-0 md:group-hover:opacity-100"
              title="Excluir Aluno"
              aria-label="Excluir Aluno"
            >
              <IconTrash className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Right: Ponteira de Graus (Black Bar for Stripes - Acessível ao toque no Mobile) */}
      <div
        className="w-11 sm:w-12 bg-zinc-950 flex flex-col-reverse items-center justify-around py-2.5 shrink-0 select-none border-l border-white/5"
        onClick={(e) => e.stopPropagation()}
      >
        {[1, 2, 3, 4].map(degree => (
          <button
            key={degree}
            onClick={() => canEdit && onUpdateDegree(student.id, degree)}
            disabled={!canEdit}
            className={`w-6 h-2 rounded-full transition-all duration-200 border border-white/20 touch-target flex items-center justify-center ${
              student.degrees && student.degrees >= degree
                ? 'bg-white shadow-[0_0_10px_rgba(255,255,255,0.9)] scale-105'
                : 'bg-white/10 hover:bg-white/25'
            } ${canEdit ? 'cursor-pointer active:scale-125' : 'cursor-default'}`}
            title={canEdit ? `Alternar Grau ${degree}` : `Grau ${degree}`}
            aria-label={`Grau ${degree}`}
          />
        ))}
      </div>
    </div>
  );
});

export default StudentCard;
