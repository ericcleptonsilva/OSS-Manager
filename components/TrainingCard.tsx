import React, { memo } from 'react';
import { TrainingSession } from '../types';
import { IconClock, IconUsers, IconEdit, IconTrash } from './icons';

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
    <article
      className={`antigravity-card glass-specular group relative rounded-2xl overflow-hidden flex flex-col md:flex-row transition-all duration-300 border ${
        darkMode ? 'border-white/10 hover:border-jiu-primary/30' : 'border-slate-200/80 hover:border-jiu-primary/30'
      }`}
      style={coverMedia ? {
        backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.92), rgba(0,0,0,0.5)), url(${coverMedia.data})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      } : {}}
      aria-label={`Sessão de treino do dia ${trainingDate.toLocaleDateString('pt-BR')}`}
    >
      {/* Date & Media Badge Block - Responsive for mobile */}
      <div 
        className={`p-4 md:p-6 flex-shrink-0 flex flex-row md:flex-col items-center justify-between md:justify-center w-full md:w-28 relative z-10 border-b md:border-b-0 md:border-r ${
          coverMedia 
            ? 'text-white border-white/10' 
            : (darkMode ? 'bg-jiu-primary/10 text-jiu-primary border-white/5' : 'bg-blue-50/70 text-jiu-primary border-blue-100')
        }`}
      >
        <div className="flex md:flex-col items-center gap-2 md:gap-0">
          <span className="text-xs font-black uppercase tracking-widest opacity-80">
            {trainingDate.toLocaleString('pt-BR', { month: 'short' })}
          </span>
          <span className="font-athletic text-3xl md:text-4xl font-black tracking-tight leading-none my-0.5">
            {trainingDate.getDate()}
          </span>
          <span className="text-xs font-bold opacity-60">
            {trainingDate.getFullYear()}
          </span>
        </div>

        {mediaCount > 0 && (
          <div className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border shadow-sm backdrop-blur-md ${
            coverMedia 
              ? 'bg-white/15 border-white/25 text-white' 
              : 'bg-jiu-primary/15 border-jiu-primary/25 text-jiu-primary'
          }`}>
            {mediaCount} {mediaCount === 1 ? 'mídia' : 'mídias'}
          </div>
        )}
      </div>

      <div className="flex-1 p-5 md:p-6 relative z-10 flex flex-col justify-center">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1 min-w-0">
            <div className="mb-3">
              {/* Display techniques as tags */}
              {training.techniques && training.techniques.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {training.techniques.map((tech, idx) => (
                    <span 
                      key={idx} 
                      className={`text-[11px] font-bold tracking-wide px-2.5 py-1 rounded-lg border shadow-sm backdrop-blur-md ${
                        coverMedia 
                          ? 'bg-white/10 border-white/20 text-white' 
                          : (darkMode ? 'bg-slate-800/80 border-slate-700 text-slate-200' : 'bg-slate-100 border-slate-200 text-slate-700')
                      }`}
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              ) : (
                <span className={`text-[11px] font-bold tracking-wide px-2.5 py-1 rounded-lg border shadow-sm ${
                  coverMedia ? 'bg-white/10 border-white/20 text-white' : 'bg-slate-100 border-slate-200 text-slate-500'
                }`}>
                  Treino Geral
                </span>
              )}
            </div>
            
            <div className={`flex flex-wrap items-center text-xs gap-4 font-semibold ${coverMedia ? 'text-slate-300' : 'text-slate-500'}`}>
              <span className="flex items-center gap-1.5">
                <IconClock className="w-3.5 h-3.5 text-jiu-primary" /> {training.duration}
              </span>
              <span className="flex items-center gap-1.5">
                <IconUsers className="w-3.5 h-3.5 text-jiu-primary" /> {training.studentIds.length} Alunos
              </span>
            </div>
          </div>

          {/* Actions for Training - Mobile-first ergonomic touch targets */}
          {canEdit && (
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => onEdit(training)}
                className={`touch-target min-w-[44px] min-h-[44px] p-2.5 rounded-xl transition-all duration-200 active:scale-95 flex items-center justify-center ${
                  coverMedia 
                    ? 'bg-white/15 text-white hover:bg-white/25' 
                    : (darkMode ? 'bg-white/5 text-slate-300 hover:text-white hover:bg-white/10' : 'bg-slate-100 text-slate-600 hover:text-jiu-primary hover:bg-blue-50')
                }`}
                title="Editar Treino"
                aria-label={`Editar treino do dia ${trainingDate.toLocaleDateString('pt-BR')}`}
              >
                <IconEdit className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete(training.id)}
                className="touch-target min-w-[44px] min-h-[44px] p-2.5 rounded-xl transition-all duration-200 active:scale-95 flex items-center justify-center bg-red-500/10 text-red-500 hover:bg-red-500/20"
                title="Excluir Treino"
                aria-label={`Excluir treino do dia ${trainingDate.toLocaleDateString('pt-BR')}`}
              >
                <IconTrash className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {training.description && (
          <p className={`text-sm mt-4 p-3.5 rounded-xl border-l-4 leading-relaxed backdrop-blur-md ${coverMedia
            ? 'bg-black/60 border-jiu-primary text-slate-200'
            : (darkMode ? 'bg-slate-800/40 border-jiu-primary text-slate-300' : 'bg-slate-50 border-jiu-primary text-slate-600')
            }`}>
            {training.description}
          </p>
        )}
      </div>
    </article>
  );
});

export default TrainingCard;
