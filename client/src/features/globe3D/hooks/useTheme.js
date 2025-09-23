'use client';

import { useEffect, useState } from 'react';

export function useTheme() {
  const [theme, setTheme] = useState(() => {
    if (typeof document !== 'undefined') {
      return document.documentElement.getAttribute('data-theme') || 'dark';
    }
    return 'dark';
  });

  useEffect(() => {
    const html = document.documentElement;
    const updateTheme = () => {
      const newTheme = html.getAttribute('data-theme');
      if (newTheme) {
        setTheme(newTheme);
      }
    };

    updateTheme(); // initial

    const observer = new MutationObserver(updateTheme);
    observer.observe(html, { attributes: true, attributeFilter: ['data-theme'] });

    return () => observer.disconnect();
  }, []);

  return theme;
}
