import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async () => {
  // You must return at least thes
  return {
    locale: 'en', // default locale
    messages: (await import(`../messages/en.json`)).default
  };
});
