'use client'

import Script from 'next/script'

interface GoogleAnalyticsProps {
  gaId?: string
  gtagId?: string
  conversionId?: string
}

export default function GoogleAnalytics({
  gaId = 'G-XXXXXXXXXX', // Replace with your GA4 ID
  gtagId = 'GTM-XXXXXXX', // Replace with your GTM ID
  conversionId = 'AW-XXXXXXXXX' // Replace with your Google Ads conversion ID
}: GoogleAnalyticsProps) {
  return (
    <>
      {/* Google Tag Manager */}
      <Script
        id="google-tag-manager"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${gtagId}');
          `,
        }}
      />

      {/* Google Analytics 4 + Google Ads */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="afterInteractive"
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            // Google Analytics 4
            gtag('config', '${gaId}', {
              page_path: window.location.pathname,
              send_page_view: true
            });

            // Google Ads Conversion Tracking
            gtag('config', '${conversionId}', {
              allow_ad_personalization_signals: true,
              allow_google_signals: true
            });

            // Enhanced Conversions Setup
            gtag('set', 'user_data', {
              'email': undefined, // Will be set when user provides email
              'phone_number': undefined // Will be set when user provides phone
            });
          `,
        }}
      />

      {/* Google Tag Manager (noscript) */}
      <noscript>
        <iframe
          src={`https://www.googletagmanager.com/ns.html?id=${gtagId}`}
          height="0"
          width="0"
          style={{ display: 'none', visibility: 'hidden' }}
        />
      </noscript>
    </>
  )
}