
import React from 'react';
import { BeltColor } from '../types';
import { BELT_STYLES } from '../constants';

interface BeltBadgeProps {
  belt: BeltColor;
}

export const BeltBadge: React.FC<BeltBadgeProps> = ({ belt }) => {
  const style = BELT_STYLES[belt] || BELT_STYLES[BeltColor.WHITE];
  
  return (
    <span 
      className="inline-block px-3 py-1 rounded text-xs font-bold uppercase tracking-wide shadow-sm border"
      style={{ 
        background: style.background,
        color: style.color,
        borderColor: style.borderColor || 'rgba(0,0,0,0.1)'
      }}
    >
      {belt}
    </span>
  );
};
