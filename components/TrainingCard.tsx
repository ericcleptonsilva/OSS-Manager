
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
      className={`relative rounded-xl overflow-hidden shadow-sm border flex flex-col md:flex-row hover:shadow-md transition-shadow ${darkMode ? 'bg-jiu-surface border-gray-700' : 'bg-white border-gray-100'}`}
      style={coverMedia ? {
        backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.8), rgba(0,0,0,0.4)), url(${coverMedia.data})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      } : {}}
    >
      {/* Conditional Date Block (Darker if bg image) */}
      <div className={`p-6 flex-shrink-0 flex flex-col items-center justify-center w-full md:w-24 h-24 md:h-auto relative z-10 ${coverMedia ? 'text-white' : (darkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-50 text-blue-800')}`}>
        <span className="text-xs font-bold uppercase">{trainingDate.toLocaleString('pt-BR', { month: 'short' })}</span>
        <span className="text-2xl font-bold">{trainingDate.getDate()}</span>
        <span className="text-xs">{trainingDate.getFullYear()}</span>

        {mediaCount > 1 && (
          <div className="mt-2 px-2 py-0.5 bg-black/50 rounded-full text-[10px] font-bold border border-white/20 text-white">
            +{mediaCount - 1} fotos
          </div>
        )}
      </div>

      <div className="flex-1 p-6 relative z-10">
        <div className="flex justify-between items-start">
          <div>
            <h4 className={`font-bold text-lg ${coverMedia ? 'text-white' : (darkMode ? 'text-white' : 'text-gray-900')}`}>
              {/* Display techniques as tags */}
              {training.techniques && training.techniques.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {training.techniques.map((tech, idx) => (
                    <span key={idx} className={`text-xs px-2 py-1 rounded border ${coverMedia ? 'bg-white/20 border-white/30 text-white' : 'bg-jiu-primary/10 border-jiu-primary/20 text-jiu-primary'}`}>
                      {tech}
                    </span>
                  ))}
                </div>
              ) : (
                "Treino Geral"
              )}
            </h4>
            <div className={`flex items-center text-xs mt-2 space-x-3 ${coverMedia ? 'text-gray-300' : 'text-gray-500'}`}>
              <span className="flex items-center"><IconClock className="w-3 h-3 mr-1" /> {training.duration} de duração</span>
              <span className="flex items-center"><IconUsers className="w-3 h-3 mr-1" /> {training.studentIds.length} presentes</span>
            </div>
          </div>

          {/* Actions for Training */}
          {canEdit && (
            <div className="flex space-x-1">
              <button
                onClick={() => onEdit(training)}
                className={`p-2 rounded-full transition-colors ${coverMedia ? 'text-white hover:bg-white/20' : 'text-gray-400 hover:text-jiu-primary hover:bg-gray-100'}`}
                title="Editar Treino"
              >
                <IconEdit className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete(training.id)}
                className={`p-2 rounded-full transition-colors ${coverMedia ? 'text-white hover:bg-red-600/50' : 'text-gray-400 hover:text-red-600 hover:bg-red-50'}`}
                title="Excluir Treino"
              >
                <IconTrash className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {training.description && (
          <p className={`text-sm mt-3 p-3 rounded-lg border backdrop-blur-sm ${coverMedia
            ? 'bg-black/40 border-white/10 text-gray-200'
            : (darkMode ? 'bg-gray-800 border-gray-700 text-gray-300' : 'bg-gray-50 border-gray-100 text-gray-600')
            }`}>
            {training.description}
          </p>
        )}
      </div>
    </div>
  );
});

export default TrainingCard;
