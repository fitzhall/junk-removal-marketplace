import Script from 'next/script'

export function StructuredData() {
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Junk Removal AI',
    url: 'https://junkremovalai.com',
    logo: 'https://junkremovalai.com/logo.png',
    description: 'AI-powered instant junk removal quotes and booking platform',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'US'
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      availableLanguage: 'en'
    },
    sameAs: [
      'https://facebook.com/junkremovalai',
      'https://twitter.com/junkremovalai',
      'https://linkedin.com/company/junkremovalai'
    ]
  }

  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: 'Junk Removal',
    provider: {
      '@type': 'Organization',
      name: 'Junk Removal AI'
    },
    areaServed: {
      '@type': 'Country',
      name: 'United States'
    },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Junk Removal Services',
      itemListElement: [
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Furniture Removal',
            description: 'Professional furniture removal and disposal services'
          }
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Appliance Removal',
            description: 'Safe appliance removal and eco-friendly disposal'
          }
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'General Junk Removal',
            description: 'Comprehensive junk removal for homes and businesses'
          }
        }
      ]
    }
  }

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Junk Removal AI',
    url: 'https://junkremovalai.com',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://junkremovalai.com/?q={search_term_string}'
      },
      'query-input': 'required name=search_term_string'
    }
  }

  const localBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': 'https://junkremovalai.com',
    name: 'Junk Removal AI',
    image: 'https://junkremovalai.com/logo.png',
    url: 'https://junkremovalai.com',
    telephone: '+1-800-JUNK-AI',
    priceRange: '$$',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'US'
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 37.7749,
      longitude: -122.4194
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: [
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday',
          'Sunday'
        ],
        opens: '00:00',
        closes: '23:59'
      }
    ],
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      reviewCount: '500',
      bestRating: '5',
      worstRating: '1'
    }
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://junkremovalai.com'
      }
    ]
  }

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'How fast can I get a junk removal quote?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'You can get an instant quote in as little as 60 seconds by uploading a photo of your junk items. Our AI analyzes the image and provides accurate pricing immediately.'
        }
      },
      {
        '@type': 'Question',
        name: 'Is the junk removal quote free?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, getting a quote is completely free. You only pay if you decide to book the junk removal service.'
        }
      },
      {
        '@type': 'Question',
        name: 'Do you offer same-day junk removal?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, we offer same-day junk removal service in many areas. After receiving your quote, you can schedule a pickup at your convenience, including same-day options when available.'
        }
      },
      {
        '@type': 'Question',
        name: 'Are the junk removal providers licensed and insured?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, all providers in our network are licensed, insured professionals who meet our quality standards.'
        }
      },
      {
        '@type': 'Question',
        name: 'What items can you remove?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'We can remove most items including furniture, appliances, electronics, construction debris, yard waste, and general household junk. Hazardous materials may have restrictions.'
        }
      }
    ]
  }

  return (
    <>
      <Script
        id="organization-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema)
        }}
      />
      <Script
        id="service-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(serviceSchema)
        }}
      />
      <Script
        id="website-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteSchema)
        }}
      />
      <Script
        id="local-business-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(localBusinessSchema)
        }}
      />
      <Script
        id="breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema)
        }}
      />
      <Script
        id="faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchema)
        }}
      />
    </>
  )
}
