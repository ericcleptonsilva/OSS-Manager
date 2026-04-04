
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
    <div onClick={() => onOpenProfile(student.id)} className="flex glass-card animate-in rounded-2xl overflow-hidden group h-32 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
      {/* Left: Photo/Belt (30%) */}
      <div
        className="w-[32%] flex items-center justify-center p-4 relative overflow-hidden shrink-0"
        style={{
          background: `linear-gradient(135deg, ${style.background}, ${style.solid}11)`,
        }}
      >
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
        {student.photo ? (
          <div className="w-20 w-20 md:w-22 md:h-22 rounded-2xl overflow-hidden border border-white/40 shadow-2xl z-10 relative transition-all duration-700 group-hover:scale-105 group-hover:-rotate-2">
            <img src={student.photo} alt={student.name} className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="w-20 h-20 md:w-22 md:h-22 rounded-2xl bg-white/10 backdrop-blur-xl flex items-center justify-center z-10 border border-white/20 shadow-2xl transition-all duration-700 group-hover:scale-105 group-hover:rotate-3">
            <span className="text-4xl font-black text-white drop-shadow-2xl italic tracking-tighter">{student.name.charAt(0)}</span>
          </div>
        )}
        
        {/* Belt Indicator Blur */}
        <div className="absolute -bottom-4 -left-4 w-12 h-12 rounded-full blur-2xl opacity-40 animate-pulse" style={{ backgroundColor: style.solid }}></div>
      </div>

      {/* Middle: Info (58%) */}
      <div className={`w-[58%] p-4 flex flex-col justify-between relative ${darkMode ? 'bg-jiu-surface' : 'bg-white'}`}>
        <div>
          <div className="flex justify-between items-start">
            <h4 className={`font-bold text-base truncate transition-colors pr-2 tracking-tight ${darkMode ? 'text-white group-hover:text-jiu-primary' : 'text-gray-900 group-hover:text-jiu-primary'}`} title={student.name}>{student.name}</h4>
            {canEdit && (
              <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => { e.stopPropagation(); onEdit(student); }}
                  className="text-gray-400 hover:text-jiu-primary transition-colors p-1.5 rounded-lg hover:bg-jiu-primary/10"
                  title="Editar Aluno"
                >
                  <IconEdit className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[9px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded-lg border backdrop-blur-md shadow-sm transition-all" style={{ color: style.solid, borderColor: `${style.solid}33`, backgroundColor: `${style.solid}08` }}>
              {student.belt}
            </span>
            {hasOverdue && (
              <span className="animate-pulse bg-red-500/10 text-red-500 border border-red-500/20 text-[8px] font-black px-2 py-0.5 rounded-lg flex items-center shadow-lg shadow-red-500/10 tracking-widest uppercase">
                <IconAlert className="w-2.5 h-2.5 mr-1" /> DÉBITO
              </span>
            )}
          </div>

          <div className="flex items-center gap-4 mt-3 opacity-60">
            <div className="flex flex-col">
              <span className="text-[8px] font-black uppercase tracking-widest opacity-50">Faltas</span>
              <span className={`text-xs font-bold ${absences > 3 ? "text-red-500" : ""}`}>{absences}</span>
            </div>
            <div className="w-px h-4 bg-gray-200 dark:bg-white/10"></div>
            <div className="flex flex-col">
              <span className="text-[8px] font-black uppercase tracking-widest opacity-50">Status</span>
              <span className="text-xs font-bold text-green-500">Ativo</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-gray-100 dark:border-white/5 pt-3">
           <div className="flex flex-col">
            <span className="text-[8px] text-gray-400 uppercase font-black tracking-widest opacity-40 leading-none mb-1">Ingresso</span>
            <span className="text-[11px] font-black tracking-tighter opacity-80 leading-none">
              {new Date(student.startDate).toLocaleDateString('pt-BR')}
            </span>
           </div>
           {canEdit && (
             <button
                onClick={(e) => { e.stopPropagation(); onDelete(student.id); }}
                className="text-slate-300 hover:text-red-500 transition-all p-2 hover:bg-red-500/10 rounded-xl"
                title="Excluir Aluno"
              >
                <IconTrash className="w-3.5 h-3.5" />
              </button>
           )}
        </div>
      </div>

      {/* Right: Rank Bar (Black Bar for Stripes) (10%) */}
      <div className="w-[10%] bg-zinc-950 flex flex-col-reverse items-center justify-center gap-1.5 py-3 shadow-inner" onClick={(e) => e.stopPropagation()}>
        {[1, 2, 3, 4].map(degree => (
          <div
            key={degree}
            onClick={() => canEdit && onUpdateDegree(student.id, degree)}
            className={`w-5 h-1.5 rounded-full transition-all duration-300 border border-white/20 ${student.degrees && student.degrees >= degree ? 'bg-white shadow-[0_0_8px_rgba(255,255,255,1)]' : 'bg-white/5 hover:bg-white/20'} ${canEdit ? 'cursor-pointer hover:scale-125' : 'cursor-default'}`}
            title={canEdit ? `Grau ${degree}` : ''}
          />
        ))}
      </div>
    </div>
  );
});

export default StudentCard;
