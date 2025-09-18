import React, { createContext, useState, ReactNode } from 'react';

type SettingsContextType = {
  musicLanguages: string[];
  setMusicLanguages: (languages: string[]) => void;
  streamingQuality: string;
  setStreamingQuality: (quality: string) => void;
  downloadQuality: string;
  setDownloadQuality: (quality: string) => void;
};

export const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [musicLanguages, setMusicLanguages] = useState<string[]>(['International', 'Tamil']);
  const [streamingQuality, setStreamingQuality] = useState<string>('HD');
  const [downloadQuality, setDownloadQuality] = useState<string>('HD');

  return (
    <SettingsContext.Provider
      value={{
        musicLanguages,
        setMusicLanguages,
        streamingQuality,
        setStreamingQuality,
        downloadQuality,
        setDownloadQuality,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};
