
import React, { memo } from 'react';
import { Student, BeltColor } from '../types';
import { BELT_STYLES } from '../constants';
import { IconEdit, IconTrash, IconAlert } from './icons';

interface StudentCardProps {
  student: Student;
  absences: number;
  hasOverdue: boolean;
  onOpenProfile: (id: string) => void;
  onEdit: (student: Student) => void;
  onDelete: (id: string) => void;
  onUpdateDegree: (id: string, degree: number) => void;
}

const StudentCard = memo(({
  student,
  absences,
  hasOverdue,
  onOpenProfile,
  onEdit,
  onDelete,
  onUpdateDegree
}: StudentCardProps) => {
  const style = BELT_STYLES[student.belt] || BELT_STYLES[BeltColor.WHITE];

  return (
    <div onClick={() => onOpenProfile(student.id)} className="flex rounded-xl overflow-hidden shadow-md hover:shadow-xl hover:scale-[1.02] transition-all duration-200 h-32 cursor-pointer group">
      {/* Left: Photo/Belt (30%) */}
      <div
        className="w-[30%] flex items-center justify-center p-3 relative"
        style={{
          background: style.background,
          color: style.color,
        }}
      >
        {student.photo ? (
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-2 border-white shadow-md z-10 relative">
            <img src={student.photo} alt={student.name} className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-black/10 flex items-center justify-center z-10 border-2 border-white/50">
            <span className="text-3xl md:text-4xl font-bold opacity-50">{student.name.charAt(0)}</span>
          </div>
        )}
      </div>

      {/* Middle: Info (60%) */}
      <div className="w-[60%] bg-neutral-900 text-white p-3 flex flex-col justify-between relative">
        <div>
          <div className="flex justify-between items-start">
            <h4 className="font-bold text-base truncate group-hover:text-jiu-primary transition-colors pr-2" title={student.name}>{student.name}</h4>
            <div className="flex space-x-1">
              <button
                onClick={(e) => { e.stopPropagation(); onEdit(student); }}
                className="text-gray-500 hover:text-white transition-colors p-1 rounded-full"
                title="Editar Aluno"
              >
                <IconEdit className="w-3 h-3" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(student.id); }}
                className="text-gray-500 hover:text-red-500 transition-colors p-1 rounded-full"
                title="Excluir Aluno"
              >
                <IconTrash className="w-3 h-3" />
              </button>
            </div>
          </div>
          <p className="text-xs font-semibold mt-0.5" style={{ color: style.solid }}>{student.belt}</p>

          <p className="text-[10px] text-gray-400 truncate mt-0.5">{student.phone}</p>

          <div className="flex items-center gap-2 mt-1">
            <p className="text-[10px] text-gray-400">Faltas: <span className="text-red-400 font-bold">{absences}</span></p>
            {hasOverdue && (
              <span className="text-[10px] bg-red-600 text-white px-1.5 py-0.5 rounded flex items-center">
                <IconAlert className="w-3 h-3 mr-0.5" /> Financeiro
              </span>
            )}
          </div>
        </div>

        <div>
          <p className="text-[10px] text-gray-500 uppercase tracking-wider">Desde</p>
          <p className="text-xs font-medium text-gray-300">
            {new Date(student.startDate).toLocaleDateString('pt-BR')}
          </p>
        </div>
      </div>

      {/* Right: Rank Bar (Black Bar for Stripes) (10%) */}
      <div className="w-[10%] bg-black border-l border-gray-800 flex flex-col-reverse items-center justify-evenly py-2" onClick={(e) => e.stopPropagation()}>
        {[1, 2, 3, 4].map(degree => (
          <div
            key={degree}
            onClick={() => onUpdateDegree(student.id, degree)}
            className={`w-6 h-1.5 cursor-pointer transition-all duration-200 border border-white/30 ${student.degrees && student.degrees >= degree ? 'bg-white shadow-[0_0_5px_rgba(255,255,255,0.8)]' : 'bg-transparent hover:bg-white/20'}`}
            title={`Grau ${degree}`}
          />
        ))}
      </div>
    </div>
  );
});

export default StudentCard;
