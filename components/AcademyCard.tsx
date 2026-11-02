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
      className="antigravity-card glass-card glass-specular animate-in rounded-2xl p-5 sm:p-6 cursor-pointer group relative overflow-hidden flex flex-col justify-between"
    >
      {/* Luz ambiente de profundidade */}
      <div className="absolute -top-16 -right-16 w-36 h-36 rounded-full bg-blue-500/10 blur-3xl pointer-events-none group-hover:bg-blue-500/20 transition-all duration-500" />

      <div>
        <div className="flex justify-between items-start mb-5 relative z-10">
          <div
            className={`w-18 h-18 sm:w-20 sm:h-20 rounded-2xl border flex items-center justify-center overflow-hidden transition-transform duration-500 group-hover:scale-105 shadow-xl backdrop-blur-xl relative ${
              darkMode ? 'bg-white/5 border-white/10 shadow-black/40' : 'bg-white border-slate-100 shadow-slate-200/50'
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-50"></div>
            {academy.logo ? (
              <img src={academy.logo} alt={academy.name} className="w-full h-full object-contain p-2 relative z-10" />
            ) : (
              <IconAcademy className="w-9 h-9 text-slate-400 group-hover:text-blue-500 transition-colors relative z-10" />
            )}
          </div>

          {isAuthenticated && (
            <span
              className={`text-[10px] font-athletic tracking-widest px-3 py-1.5 rounded-xl border backdrop-blur-md shadow-sm transition-all duration-300 ${
                darkMode
                  ? 'bg-white/5 text-slate-300 border-white/10 group-hover:border-blue-500/40'
                  : 'bg-white text-slate-700 border-slate-200 group-hover:border-blue-500/40'
              }`}
            >
              {studentCount} {studentCount === 1 ? 'Aluno' : 'Alunos'}
            </span>
          )}
        </div>

        <h3
          className={`font-athletic text-2xl sm:text-3xl mb-1 relative z-10 tracking-tight transition-colors group-hover:text-blue-500 ${
            darkMode ? 'text-white' : 'text-slate-900'
          }`}
        >
          {academy.name}
        </h3>

        <div className={`text-xs mb-5 relative z-10 flex items-center font-bold uppercase tracking-wider opacity-65 ${
          darkMode ? 'text-slate-400' : 'text-slate-500'
        }`}>
          <span className="w-2 h-2 rounded-full bg-blue-500 mr-2 animate-pulse shrink-0"></span>
          <span className="truncate">{academy.address}</span>
        </div>

        {/* Grade de Horários */}
        {academy.schedule && academy.schedule.length > 0 && (
          <div
            className={`p-4 rounded-xl mb-5 relative z-10 backdrop-blur-md shadow-inner border transition-all duration-300 ${
              darkMode ? 'bg-white/5 border-white/5 text-slate-300' : 'bg-slate-50/80 border-slate-100 text-slate-700'
            }`}
          >
            <p className="text-[10px] font-athletic tracking-widest mb-2.5 flex items-center opacity-70">
              <IconClock className="w-3.5 h-3.5 mr-1.5 text-blue-500" /> Próximos Treinos
            </p>
            <div className="space-y-1.5">
              {academy.schedule.slice(0, 3).map((s, idx) => (
                <div key={idx} className="flex justify-between items-center text-[11px]">
                  <span className="font-bold tracking-wider uppercase opacity-80">{s.day.split('-')[0]}</span>
                  <span className="font-medium opacity-90 bg-white/10 px-2 py-0.5 rounded-md border border-white/10">
                    {s.timeRanges.map(r => `${r.openTime}`).join(' • ')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer com Instrutor e Botão Acessar (Otimizado para toque) */}
      <div className={`flex items-center justify-between border-t pt-4 relative z-10 ${darkMode ? 'border-white/5' : 'border-slate-100'}`}>
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 mr-2.5 flex items-center justify-center text-xs text-white font-black shadow-md shadow-blue-500/20">
            {academy.instructorName?.charAt(0)}
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] font-black uppercase tracking-widest opacity-40 leading-none mb-0.5">Instrutor</span>
            <span className="truncate max-w-[120px] text-xs font-bold tracking-tight leading-none text-slate-800 dark:text-slate-200">
              {academy.instructorName}
            </span>
          </div>
        </div>

        {isAuthenticated && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClick(academy.id);
            }}
            className="touch-target px-5 py-2 rounded-xl text-xs font-athletic tracking-widest transition-all bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20 active:scale-95 flex items-center justify-center"
            aria-label={`Acessar ${academy.name}`}
          >
            Acessar
          </button>
        )}
      </div>
    </div>
  );
});

export default AcademyCard;
