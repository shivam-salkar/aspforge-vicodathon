'use client';

import { useEffect, useState } from 'react';

interface TypewriterTextProps {
  text: string;
  speed?: number; // ms per word
  onComplete?: () => void;
  className?: string;
}

export const TypewriterText = ({
  text,
  speed = 25,
  onComplete,
  className = '',
}: TypewriterTextProps) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    if (!text || typeof text !== 'string') {
      setDisplayedText('');
      setIsTyping(false);
      return;
    }

    // Filter empty words and ensure valid string elements
    const words = text.split(/\s+/).filter(Boolean);
    if (words.length === 0) {
      setDisplayedText('');
      setIsTyping(false);
      return;
    }

    let currentIndex = 0;
    setIsTyping(true);
    setDisplayedText('');

    const interval = setInterval(() => {
      if (currentIndex < words.length) {
        const word = words[currentIndex];
        if (word && word !== 'undefined') {
          setDisplayedText((prev) => (prev ? `${prev} ${word}` : word));
        }
        currentIndex++;
      } else {
        clearInterval(interval);
        setIsTyping(false);
        if (onComplete) onComplete();
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed]);

  return (
    <span className={className}>
      {displayedText}
      {isTyping && (
        <span className="animate-pulse ml-1 inline-block w-1.5 h-3.5 bg-blue-400 align-middle rounded-sm shadow-sm shadow-blue-400/50" />
      )}
    </span>
  );
};
