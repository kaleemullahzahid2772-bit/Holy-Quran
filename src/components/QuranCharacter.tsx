import React from 'react';
import { QuranCharacterData } from '../types/quran';

interface QuranCharacterProps {
  charData: QuranCharacterData;
}

export const QuranCharacter: React.FC<QuranCharacterProps> = React.memo(({ charData }) => {
  return (
    <span
      style={{ color: charData.color }}
      title={charData.rules && charData.rules.length > 0 ? charData.rules.join(', ') : undefined}
      className="inline-block transition-colors duration-150"
    >
      {charData.char}
    </span>
  );
});

QuranCharacter.displayName = 'QuranCharacter';
