// src/utils/imageUtils.ts

export const getDisplayableUrl = (url: string | null | undefined): string | null => {
  if (!url) return null;

  // Extract ID from any Google Drive URL format
  let id: string | null = null;

  if (url.includes('/d/')) {
    id = url.split('/d/')[1]?.split('/')[0];
  } else if (url.includes('uc?id=')) {
    id = url.split('uc?id=')[1]?.split('&')[0];
  } else if (url.includes('open?id=')) {
    id = url.split('open?id=')[1]?.split('&')[0];
  } else if (url.includes('thumbnail?id=')) {
    id = url.split('thumbnail?id=')[1]?.split('&')[0];
  }

  // If ID found, use the THUMBNAIL endpoint.
  // This works for Images AND PDFs.
  if (id) {
    return `https://drive.google.com/thumbnail?id=${id}&sz=w1000`;
  }

  return url;
};