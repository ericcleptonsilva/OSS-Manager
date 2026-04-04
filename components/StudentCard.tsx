
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
  const style = BELT_STYLES[student.belt] || BELT_STYLES[BeltColor.WHITE];

  return (
    <div onClick={() => onOpenProfile(student.id)} className="flex glass-card animate-in rounded-2xl overflow-hidden group h-32 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
      {/* Left: Photo/Belt (30%) */}
      <div
        className="w-[32%] flex items-center justify-center p-3 relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${style.background}, ${style.solid}22)`,
        }}
      >
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
        {student.photo ? (
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-2 border-white/80 shadow-2xl z-10 relative transition-transform duration-500 group-hover:scale-105">
            <img src={student.photo} alt={student.name} className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center z-10 border-2 border-white/50 shadow-xl transition-transform duration-500 group-hover:scale-105">
            <span className="text-3xl md:text-4xl font-black text-white drop-shadow-md">{student.name.charAt(0)}</span>
          </div>
        )}
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
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-[10px] font-black uppercase tracking-tighter px-1.5 py-0.5 rounded-md border" style={{ color: style.solid, borderColor: `${style.solid}44`, backgroundColor: `${style.solid}11` }}>{student.belt}</p>
            {hasOverdue && (
              <span className="animate-pulse bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center shadow-lg shadow-red-500/20">
                <IconAlert className="w-2.5 h-2.5 mr-0.5" /> DÉBITO
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 mt-2 opacity-70">
            <p className="text-[10px] font-medium uppercase tracking-widest"><span className="opacity-50">Faltas:</span> <span className={absences > 3 ? "text-red-500 font-bold" : ""}>{absences}</span></p>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-gray-100 dark:border-white/5 pt-2">
           <div>
            <p className="text-[9px] text-gray-400 uppercase font-bold tracking-widest opacity-50">Ingresso</p>
            <p className="text-[11px] font-bold opacity-80">
              {new Date(student.startDate).toLocaleDateString('pt-BR')}
            </p>
           </div>
           {canEdit && (
             <button
                onClick={(e) => { e.stopPropagation(); onDelete(student.id); }}
                className="text-gray-300 hover:text-red-500 transition-colors p-1"
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
