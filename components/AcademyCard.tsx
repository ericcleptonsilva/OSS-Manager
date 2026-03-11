
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
      className={`rounded-xl shadow-sm hover:shadow-xl border p-6 cursor-pointer transition-all duration-200 group relative overflow-hidden 
        ${darkMode ? 'bg-jiu-surface border-gray-700' : 'bg-white border-gray-100'}
      `}
    >
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className={`w-16 h-16 rounded-lg border flex items-center justify-center overflow-hidden group-hover:border-jiu-primary transition-colors
          ${darkMode ? 'bg-gray-800 border-gray-600' : 'bg-gray-50 border-gray-200'}
        `}>
          {academy.logo ? (
            <img src={academy.logo} alt={academy.name} className="w-full h-full object-cover" />
          ) : (
            <IconAcademy className="w-8 h-8 text-gray-400" />
          )}
        </div>
        {isAuthenticated && (
          <span className={`text-xs font-semibold px-2 py-1 rounded ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
            {studentCount} {studentCount === 1 ? 'Aluno' : 'Alunos'}
          </span>
        )}
      </div>
      <h3 className={`text-xl font-bold mb-1 relative z-10 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{academy.name}</h3>
      <p className={`text-sm mb-2 relative z-10 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{academy.address}</p>

      {/* Schedule on Card */}
      {academy.schedule && academy.schedule.length > 0 && (
        <div className={`text-xs mb-4 relative z-10 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          <p className="font-semibold mb-1 flex items-center"><IconClock className="w-3 h-3 mr-1" /> Horários:</p>
          {academy.schedule.map((s, idx) => (
            <div key={idx} className="flex justify-between max-w-[200px]">
              <span className="font-medium">{s.day.substring(0, 3)}:</span>
              <span>
                {s.timeRanges.map(r => `${r.openTime}-${r.closeTime}`).join(', ')}
              </span>
            </div>
          )).slice(0, 3)}
          {academy.schedule.length > 3 && <span className="italic opacity-70">...e mais</span>}
        </div>
      )}

      <div className={`flex items-center justify-between text-sm border-t pt-4 relative z-10 ${darkMode ? 'text-gray-300 border-gray-700' : 'text-gray-700 border-gray-100'}`}>
        <div>
          <span className="font-medium mr-1">Instrutor:</span>
          <span className="truncate max-w-[120px] inline-block align-bottom">{academy.instructorName}</span>
        </div>

        {isAuthenticated && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClick(academy.id);
            }}
            className={`ml-2 px-4 py-1.5 rounded-lg text-xs font-bold shadow-sm transition-all transform hover:scale-105 bg-jiu-primary text-white hover:bg-blue-800`}
          >
            Acessar
          </button>
        )}
      </div>
    </div>
  );
});

export default AcademyCard;
