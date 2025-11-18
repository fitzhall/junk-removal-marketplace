'use client'

import { useEffect } from 'react'
import Script from 'next/script'

interface ProviderPixelTrackingProps {
  fbPixelId?: string
  googleAnalyticsId?: string
  googleAdsId?: string
  companyId?: string
}

export function ProviderPixelTracking({
  fbPixelId,
  googleAnalyticsId,
  googleAdsId,
  companyId
}: ProviderPixelTrackingProps) {

  // Track quote form submission
  const trackQuoteSubmission = (quoteId: string, value: number) => {
    // Facebook Pixel
    if (fbPixelId && typeof window !== 'undefined' && (window as any).fbq) {
      (window as any).fbq('track', 'Lead', {
        content_name: 'Junk Removal Quote',
        content_category: 'Quote Request',
        value: value,
        currency: 'USD',
        content_id: quoteId
      })
    }

    // Google Analytics 4
    if (googleAnalyticsId && typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'generate_lead', {
        currency: 'USD',
        value: value,
        lead_id: quoteId
      })
    }

    // Google Ads Conversion
    if (googleAdsId && typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'conversion', {
        send_to: googleAdsId,
        value: value,
        currency: 'USD',
        transaction_id: quoteId
      })
    }
  }

  // Make tracking function available globally
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).trackProviderLead = trackQuoteSubmission
    }
  }, [fbPixelId, googleAnalyticsId, googleAdsId])

  if (!fbPixelId && !googleAnalyticsId && !googleAdsId) {
    return null
  }

  return (
    <>
      {/* Facebook Pixel */}
      {fbPixelId && (
        <>
          <Script
            id="fb-pixel"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                !function(f,b,e,v,n,t,s)
                {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)}(window, document,'script',
                'https://connect.facebook.net/en_US/fbevents.js');
                fbq('init', '${fbPixelId}');
                fbq('track', 'PageView');
              `,
            }}
          />
          <noscript>
            <img
              height="1"
              width="1"
              style={{ display: 'none' }}
              src={`https://www.facebook.com/tr?id=${fbPixelId}&ev=PageView&noscript=1`}
            />
          </noscript>
        </>
      )}

      {/* Google Analytics */}
      {googleAnalyticsId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`}
            strategy="afterInteractive"
          />
          <Script
            id="ga-script"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${googleAnalyticsId}', {
                  page_path: window.location.pathname,
                  ${companyId ? `custom_map: { dimension1: 'company_id' },
                  company_id: '${companyId}',` : ''}
                });
              `,
            }}
          />
        </>
      )}

      {/* Google Ads */}
      {googleAdsId && (
        <Script
          id="google-ads"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              gtag('config', '${googleAdsId}');
            `,
          }}
        />
      )}
    </>
  )
}