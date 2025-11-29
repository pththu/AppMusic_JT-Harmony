const formatDuration = (ms: number) => {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

const formatArtists = (artists) => artists.map(a => a.name).join(", ").slice(0, 30);

export { 
  formatDuration, 
  formatArtists 
};