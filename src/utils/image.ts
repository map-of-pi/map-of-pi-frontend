export const getImageSrc = (image?: string | null, fallback?: string | null): string => {
  if (!image) return fallback || ''; // Use fallback if provided, else empty string

  // Regex to detect absolute URLs (http, https, or protocol-relative)
  const isAbsoluteUrl = /^(https?:)?\/\//.test(image);
  if (isAbsoluteUrl) return image;

  return `${process.env.NEXT_PUBLIC_BASE_URL}/${image}`;
};