export const formatDataFavorites = (data: any) => {
  const formatData = [];
  for (const item of data) {
    if ((item.itemType === 'track' || item.itemType === 'album') && item.item) {
      formatData.push({
        type: item.itemType,
        name: item.item.name,
        artists: item.item.artists.map((artist) => artist.name).join(', '),
      })
    } else if (item.itemType === 'playlist' && item.item) {
      formatData.push({
        type: item.itemType,
        name: item.item.name,
        description: item.item.description || '',
      })
    }
  }
  return formatData;
}

export const formatDataHistories = (data: any) => {
  const formatData = [];
  for (const item of data) {
    if (item.itemType === 'track' && item.item) {
      formatData.push({
        type: item.itemType,
        name: item.item.name,
        artists: item.item.artists.map(artist => artist.name).join(', '),
        playCount: item.playCount,
        durationListened: item.durationListened,
      })
    } else if (item.itemType === 'playlist' && item.item) {
      formatData.push({
        type: item.itemType,
        name: item.item.name,
        description: item.item.description || '',
        playCount: item.playCount,
      })
    } else if (item.itemType === 'artist' && item.item) {
      formatData.push({
        type: item.itemType,
        name: item.item.name,
        playCount: item.playCount,
      })
    } else if (item.itemType === 'album' && item.item) {
      formatData.push({
        type: item.itemType,
        name: item.item.name,
        artists: item.item.artists.map(artist => artist.name).join(', '),
        playCount: item.playCount,
      })
    }
  }
  return formatData;
}

export const formatDataFollowedArtists = (data: any) => {
  const formatData = [];
  for (const item of data) {
    if (item.artist) {
      formatData.push({
        name: item.artist.name,
        followedAt: item.createdAt,
      })
    }
  }
  return formatData;
}

export const formatDescription = (description: string) => {
  const maxLength = 100;
  if (description.length > maxLength) {
    return description.substring(0, maxLength - 3) + '...';
  }
  return description;
};