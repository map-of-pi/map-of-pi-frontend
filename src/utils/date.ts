// Function to format the date and time; accepts both string and Date.
export const resolveDate = (
  dateString?: string | Date, 
  locale: string = 'en-US'
): { date: string; time: string } => {
  
  if (!dateString) return { date: '', time: '' };

  // Normalize to Date
  const dateObj = dateString instanceof Date ? dateString : new Date(dateString);

  // Localized date formatting
  const formattedDate = new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  }).format(dateObj);

  // Localized time formatting
  const formattedTime = new Intl.DateTimeFormat(locale, {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true, // automatically adapts for locale
  }).format(dateObj);

  return { date: formattedDate, time: formattedTime };
};