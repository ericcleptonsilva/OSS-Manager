
import React, { memo } from 'react';
import { Academy } from '../types';
import { IconAcademy, IconClock } from './icons';

interface AcademyCardProps {
  academy: Academy;
  studentCount: number;
  darkMode: boolean;
  isAuthenticated: boolean;
  onClick: (id: string) => void;
}

const AcademyCard = memo(({
  academy,
  studentCount,
  darkMode,
  isAuthenticated,
  onClick
}: AcademyCardProps) => {
  return (
    <div
      onClick={() => onClick(academy.id)}
      className={`glass-card animate-in rounded-2xl p-6 cursor-pointer group relative overflow-hidden transition-all duration-300 hover:-translate-y-1`}
    >
      <div className="flex justify-between items-start mb-5 relative z-10">
        <div className={`w-18 h-18 rounded-2xl border-2 flex items-center justify-center overflow-hidden transition-all duration-500 group-hover:scale-110 shadow-lg
          ${darkMode ? 'bg-gray-800/50 border-gray-700/50 group-hover:border-jiu-primary' : 'bg-gray-50 border-gray-100 group-hover:border-jiu-primary'}
        `}>
          {academy.logo ? (
            <img src={academy.logo} alt={academy.name} className="w-full h-full object-cover" />
          ) : (
            <IconAcademy className="w-10 h-10 text-gray-400 group-hover:text-jiu-primary transition-colors" />
          )}
        </div>
        {isAuthenticated && (
          <span className={`text-xs font-bold px-3 py-1.5 rounded-full border shadow-sm backdrop-blur-md
            ${darkMode ? 'bg-jiu-primary/20 text-jiu-primary border-jiu-primary/30' : 'bg-blue-50 text-jiu-primary border-blue-100'}
          `}>
            {studentCount} {studentCount === 1 ? 'Aluno' : 'Alunos'}
          </span>
        )}
      </div>
      
      <h3 className={`text-2xl font-bold mb-1 relative z-10 tracking-tight ${darkMode ? 'text-white' : 'text-gray-900 group-hover:text-jiu-primary transition-colors'}`}>{academy.name}</h3>
      <p className={`text-sm mb-4 relative z-10 flex items-center opacity-80 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-jiu-primary mr-2"></span>
        {academy.address}
      </p>

      {/* Schedule on Card */}
      {academy.schedule && academy.schedule.length > 0 && (
        <div className={`p-4 rounded-xl mb-5 relative z-10 backdrop-blur-sm shadow-inner
          ${darkMode ? 'bg-black/20 text-gray-400' : 'bg-gray-50/50 text-gray-600'}
        `}>
          <p className="text-xs font-bold uppercase tracking-wider mb-2 flex items-center opacity-70">
            <IconClock className="w-3.5 h-3.5 mr-1.5" /> Próximos Treinos
          </p>
          <div className="space-y-1.5">
            {academy.schedule.map((s, idx) => (
              <div key={idx} className="flex justify-between items-center text-xs">
                <span className="font-semibold">{s.day.split('-')[0]}:</span>
                <span className="font-medium opacity-90">
                  {s.timeRanges.map(r => `${r.openTime}`).join(', ')}
                </span>
              </div>
            )).slice(0, 3)}
          </div>
        </div>
      )}

      <div className={`flex items-center justify-between text-sm border-t pt-5 relative z-10 ${darkMode ? 'text-gray-400 border-white/5' : 'text-gray-600 border-gray-100'}`}>
        <div className="flex items-center">
          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-jiu-primary to-blue-400 mr-2 flex items-center justify-center text-[10px] text-white font-bold">
            {academy.instructorName?.charAt(0)}
          </div>
          <span className="truncate max-w-[120px] font-medium">{academy.instructorName}</span>
        </div>

        {isAuthenticated && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClick(academy.id);
            }}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all glass-card border-none bg-gradient-to-r from-jiu-primary to-blue-600 text-white shadow-lg hover:shadow-blue-500/20 hover:scale-105 active:scale-95"
          >
            Acessar
          </button>
        )}
      </div>
    </div>
  );
});

export default AcademyCard;
