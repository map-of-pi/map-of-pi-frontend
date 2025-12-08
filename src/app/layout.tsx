import './global.css';
import { ReactNode } from 'react';
import '../../sentry.client.config.mjs';

export const dynamic = 'force-dynamic';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <title>Map of Pi</title>
        <base href="/" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
        <meta
          property="og:title"
          content="Map of Pi, Searchable places accepting Pi on a map"
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://mapofpi.concretecode.ch" />
        <meta
          property="og:image"
          content="https://mapofpi.concretecode.ch/assets/images/logo.svg"
        />
        <meta
          name="description"
          content="Map of Pi is a mobile application developed to help Pi community members easily locate local businesses that accept Pi as payment"
        />
        <meta name="keywords" content="map, pi, business, app" />
        <meta name="author" content="Map of Pi Team" />
        <meta
          httpEquiv="Content-Security-Policy"
          content="font-src 'self' https://cdnjs.cloudflare.com/ajax/libs/font-awesome/https://fonts.gstatic.com/;"
        />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link
          href="https://fonts.googleapis.com/icon?family=Material+Icons"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet-routing-machine@latest/dist/leaflet-routing-machine.css"
        />
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.2.0/dist/leaflet.css"
        />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />

        {/* Google tag (gtag.js) */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-SVNC88Q13K"></script>
        <script dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-SVNC88Q13K');
          `,
        }} />
      </head>
      <body className={`bg-background text-black`}>
        {children}
      </body>
    </html>
  );
}
