import React from 'react';
import { ScientificCalculator, ScientificCalculatorProps } from './ScientificCalculator';

export interface CBTCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPauseTimer?: () => void;
  onResumeTimer?: () => void;
  isCalculationRelated?: boolean;
  subjectName?: string;
}

export const CBTCalculatorModal: React.FC<CBTCalculatorModalProps> = ({
  isOpen,
  onClose,
  onPauseTimer,
  onResumeTimer,
  isCalculationRelated = true,
  subjectName = 'Mathematics & Science'
}) => {
  if (!isOpen) return null;

  return (
    <ScientificCalculator
      isOpen={isOpen}
      onClose={onClose}
      mode="floating"
      onPauseTimer={onPauseTimer}
      onResumeTimer={onResumeTimer}
      isCalculationRelated={isCalculationRelated}
      subjectName={subjectName}
    />
  );
};
