
import React, { memo } from 'react';
import { TrainingSession } from '../types';
import { IconClock, IconUsers, IconEdit, IconTrash, IconCalendar } from './icons';

interface TrainingCardProps {
  training: TrainingSession;
  darkMode: boolean;
  canEdit?: boolean;
  onEdit: (training: TrainingSession) => void;
  onDelete: (id: string) => void;
}

const TrainingCard = memo(({
  training,
  darkMode,
  canEdit = false,
  onEdit,
  onDelete
}: TrainingCardProps) => {
  const coverMedia = training.media && training.media.length > 0 ? training.media[0] : null;
  const mediaCount = training.media?.length || 0;
  const trainingDate = new Date(training.date + 'T12:00:00');

  return (
    <div
      className={`glass-card animate-in relative rounded-2xl overflow-hidden flex flex-col md:flex-row transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${darkMode ? 'border-white/5' : 'border-gray-100'}`}
      style={coverMedia ? {
        backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.9), rgba(0,0,0,0.4)), url(${coverMedia.data})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      } : {}}
    >
      {/* Conditional Date Block (Darker if bg image) */}
      <div className={`p-6 flex-shrink-0 flex flex-col items-center justify-center w-full md:w-28 h-28 md:h-auto relative z-10 ${coverMedia ? 'text-white border-white/10' : (darkMode ? 'bg-jiu-primary/20 text-jiu-primary border-white/5' : 'bg-blue-50 text-jiu-primary border-blue-100')} border-r`}>
        <span className="text-xs font-black uppercase tracking-widest opacity-70">{trainingDate.toLocaleString('pt-BR', { month: 'short' })}</span>
        <span className="text-4xl font-black tracking-tighter my-1">{trainingDate.getDate()}</span>
        <span className="text-xs font-bold opacity-50">{trainingDate.getFullYear()}</span>

        {mediaCount > 0 && (
          <div className={`mt-3 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border shadow-sm backdrop-blur-md ${coverMedia ? 'bg-white/10 border-white/20 text-white' : 'bg-jiu-primary/10 border-jiu-primary/20 text-jiu-primary'}`}>
            {mediaCount} {mediaCount === 1 ? 'mídia' : 'mídias'}
          </div>
        )}
      </div>

      <div className="flex-1 p-6 relative z-10 flex flex-col justify-center">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            <div className="mb-3">
              {/* Display techniques as tags */}
              {training.techniques && training.techniques.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {training.techniques.map((tech, idx) => (
                    <span key={idx} className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border shadow-sm backdrop-blur-md ${coverMedia ? 'bg-white/10 border-white/20 text-white' : 'bg-jiu-primary/5 border-jiu-primary/10 text-jiu-primary'}`}>
                      {tech}
                    </span>
                  ))}
                </div>
              ) : (
                <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border shadow-sm ${coverMedia ? 'bg-white/10 border-white/20 text-white' : 'bg-gray-100 border-gray-200 text-gray-500'}`}>
                  Treino Geral
                </span>
              )}
            </div>
            
            <div className={`flex items-center text-xs space-x-4 font-bold ${coverMedia ? 'text-gray-300' : 'text-gray-500'}`}>
              <span className="flex items-center gap-1.5"><IconClock className="w-3.5 h-3.5 text-jiu-primary" /> {training.duration}</span>
              <span className="flex items-center gap-1.5"><IconUsers className="w-3.5 h-3.5 text-jiu-primary" /> {training.studentIds.length} Alunos</span>
            </div>
          </div>

          {/* Actions for Training */}
          {canEdit && (
            <div className="flex gap-1">
              <button
                onClick={() => onEdit(training)}
                className={`p-2 rounded-xl transition-all hover:scale-110 ${coverMedia ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-gray-100 text-gray-400 hover:text-jiu-primary hover:bg-jiu-primary/10'}`}
                title="Editar Treino"
              >
                <IconEdit className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete(training.id)}
                className={`p-2 rounded-xl transition-all hover:scale-110 ${coverMedia ? 'bg-red-500/20 text-red-500 hover:bg-red-500/40' : 'bg-red-50 text-red-400 hover:text-red-600 hover:bg-red-100'}`}
                title="Excluir Treino"
              >
                <IconTrash className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {training.description && (
          <p className={`text-sm mt-4 p-4 rounded-2xl border-l-4 leading-relaxed backdrop-blur-md ${coverMedia
            ? 'bg-black/60 border-jiu-primary text-gray-200'
            : (darkMode ? 'bg-gray-800/50 border-jiu-primary text-gray-300' : 'bg-gray-50 border-jiu-primary text-gray-600')
            }`}>
            {training.description}
          </p>
        )}
      </div>
    </div>
  );
});

export default TrainingCard;
