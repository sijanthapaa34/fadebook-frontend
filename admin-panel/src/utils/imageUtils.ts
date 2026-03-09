// src/utils/imageUtils.ts

export const getDisplayableUrl = (url: string | null | undefined): string | null => {
  if (!url) return null;

  // 1. Handle Google Drive Links
  if (url.includes('drive.google.com')) {
    let id = null;

    // Pattern A: /d/{id}/
    if (url.includes('/d/')) {
      id = url.split('/d/')[1]?.split('/')[0];
    }
    // Pattern B: open?id={id}
    else if (url.includes('open?id=')) {
      id = url.split('open?id=')[1]?.split('&')[0];
    }
    // Pattern C: uc?id={id}
    else if (url.includes('uc?id=')) {
      id = url.split('uc?id=')[1]?.split('&')[0];
    }

    // If we found an ID, use the THUMBNAIL endpoint. 
    // This is much friendlier to web browsers than /uc
    if (id) {
      return `https://drive.google.com/thumbnail?id=${id}&sz=w500`;
    }
  }

  // 2. Return original URL if not Google Drive
  return url;
};