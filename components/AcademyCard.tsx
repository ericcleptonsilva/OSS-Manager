
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
      <div className="flex justify-between items-start mb-6 relative z-10">
        <div className={`w-20 h-20 rounded-2xl border flex items-center justify-center overflow-hidden transition-all duration-700 group-hover:scale-105 group-hover:rotate-2 shadow-2xl backdrop-blur-xl relative
          ${darkMode ? 'bg-white/5 border-white/10 shadow-black/40' : 'bg-white border-slate-100 shadow-slate-200/50'}
        `}>
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-50"></div>
          {academy.logo ? (
            <img src={academy.logo} alt={academy.name} className="w-full h-full object-contain p-2 relative z-10" />
          ) : (
            <IconAcademy className="w-10 h-10 text-slate-400 group-hover:text-jiu-primary transition-colors relative z-10" />
          )}
        </div>
        {isAuthenticated && (
          <div className="flex flex-col items-end gap-2">
            <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-xl border backdrop-blur-2xl shadow-xl transition-all duration-300 group-hover:bg-jiu-primary group-hover:text-white group-hover:border-jiu-primary
              ${darkMode ? 'bg-white/5 text-slate-400 border-white/10' : 'bg-white text-slate-500 border-slate-100'}
            `}>
              {studentCount} {studentCount === 1 ? 'Aluno' : 'Alunos'}
            </span>
          </div>
        )}
      </div>
      
      <h3 className={`text-2xl font-black mb-1 relative z-10 tracking-tighter uppercase italic transition-all duration-300 group-hover:translate-x-1 ${darkMode ? 'text-white' : 'text-slate-900'}`}>{academy.name}</h3>
      <div className={`text-xs mb-6 relative z-10 flex items-center font-bold uppercase tracking-widest opacity-60 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
        <span className="w-2 h-2 rounded-full bg-jiu-primary mr-2 animate-pulse"></span>
        {academy.address}
      </div>

      {/* Schedule on Card */}
      {academy.schedule && academy.schedule.length > 0 && (
        <div className={`p-5 rounded-2xl mb-6 relative z-10 backdrop-blur-xl shadow-inner border transition-all duration-300 group-hover:bg-jiu-primary/5
          ${darkMode ? 'bg-white/5 border-white/5 text-slate-400' : 'bg-slate-50 border-slate-100 text-slate-600'}
        `}>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-3 flex items-center opacity-60">
            <IconClock className="w-4 h-4 mr-2 text-jiu-primary" /> Próximos Treinos
          </p>
          <div className="space-y-2">
            {academy.schedule.map((s, idx) => (
              <div key={idx} className="flex justify-between items-center text-[11px]">
                <span className="font-black uppercase tracking-wider">{s.day.split('-')[0]}</span>
                <span className="font-bold opacity-80 bg-white/10 px-2 py-0.5 rounded-lg border border-white/10">
                  {s.timeRanges.map(r => `${r.openTime}`).join(' • ')}
                </span>
              </div>
            )).slice(0, 3)}
          </div>
        </div>
      )}

      <div className={`flex items-center justify-between border-t pt-6 relative z-10 ${darkMode ? 'border-white/5' : 'border-slate-100'}`}>
        <div className="flex items-center group/instructor">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-jiu-primary to-blue-400 mr-3 flex items-center justify-center text-xs text-white font-black shadow-lg shadow-blue-500/20 transform transition-transform group-hover/instructor:scale-110">
            {academy.instructorName?.charAt(0)}
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-widest opacity-40 leading-none mb-1">Mestre</span>
            <span className="truncate max-w-[100px] text-xs font-bold tracking-tight leading-none">{academy.instructorName}</span>
          </div>
        </div>

        {isAuthenticated && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClick(academy.id);
            }}
            className="group/btn relative overflow-hidden px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] transition-all bg-jiu-primary text-white shadow-xl shadow-blue-500/20 hover:shadow-blue-500/40 hover:-translate-y-0.5 active:translate-y-0 active:scale-95"
          >
            <span className="relative z-10">Acessar</span>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-transparent opacity-0 group-hover/btn:opacity-20 transition-opacity"></div>
          </button>
        )}
      </div>
    </div>
  );
});

export default AcademyCard;
