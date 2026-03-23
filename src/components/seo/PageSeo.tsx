import { Helmet } from 'react-helmet-async';
import { docsRoutes, getAbsoluteUrl, getSeoRoute, siteConfig } from '@/seo/site';

type PageSeoProps = {
  routePath: string;
};

export function PageSeo({ routePath }: PageSeoProps) {
  const route = getSeoRoute(routePath);

  if (!route) {
    return null;
  }

  const url = getAbsoluteUrl(route.path);
  const image = new URL(siteConfig.defaultImage, siteConfig.url).toString();
  const robots = route.index ? 'index,follow,max-image-preview:large' : 'noindex,nofollow';
  const keywords = [...siteConfig.keywords, route.label, route.kind === 'docs' ? 'documentation' : ''].filter(Boolean);
  const docsIndexUrl = getAbsoluteUrl('/docs');
  const docsCollectionId = `${docsIndexUrl}#collection`;
  const pageId = `${url}#page`;

  const breadcrumbItems = [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: siteConfig.url,
    },
    ...(route.path.startsWith('/docs')
      ? [
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Documentation',
            item: getAbsoluteUrl('/docs'),
          },
        ]
      : []),
    ...(route.path !== '/' && route.path !== '/docs'
      ? [
          {
            '@type': 'ListItem',
            position: route.path.startsWith('/docs') ? 3 : 2,
            name: route.label,
            item: url,
          },
        ]
      : []),
  ];

  const topicEntities = route.fallbackPoints.map((point) => ({
    '@type': 'Thing',
    name: point.replace(/\.$/, ''),
  }));

  const schemas: Array<Record<string, unknown>> = [
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      '@id': `${siteConfig.url}#organization`,
      name: siteConfig.name,
      url: siteConfig.url,
      logo: image,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      '@id': `${siteConfig.url}#website`,
      name: siteConfig.name,
      url: siteConfig.url,
      description: siteConfig.defaultDescription,
      inLanguage: 'en',
      publisher: {
        '@id': `${siteConfig.url}#organization`,
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbItems,
    },
    {
      '@context': 'https://schema.org',
      '@type': route.path === '/docs' ? 'CollectionPage' : 'WebPage',
      '@id': pageId,
      name: route.title,
      description: route.description,
      url,
      isPartOf: {
        '@id': `${siteConfig.url}#website`,
      },
      about: topicEntities,
      breadcrumb: {
        '@id': `${url}#breadcrumb`,
      },
    },
  ];

  schemas[1] = {
    ...schemas[1],
    '@id': `${siteConfig.url}#website`,
  };

  schemas[2] = {
    ...schemas[2],
    '@id': `${url}#breadcrumb`,
  };

  if (route.kind === 'landing') {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: siteConfig.name,
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      description: route.description,
      url,
    });
  }

  if (route.kind === 'docs') {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'TechArticle',
      '@id': `${url}#article`,
      headline: route.title,
      alternativeHeadline: route.fallbackHeading,
      description: route.description,
      url,
      keywords: keywords.join(', '),
      articleSection: route.label,
      about: topicEntities,
      isPartOf: {
        '@id': docsCollectionId,
      },
      hasPart: route.fallbackPoints.map((point, index) => ({
        '@type': 'WebPageElement',
        position: index + 1,
        name: point.replace(/\.$/, ''),
      })),
      author: {
        '@type': 'Organization',
        name: siteConfig.name,
      },
      publisher: {
        '@id': `${siteConfig.url}#organization`,
      },
      mainEntityOfPage: url,
    });
  }

  if (route.path === '/docs') {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      '@id': docsCollectionId,
      name: route.title,
      description: route.description,
      url,
      hasPart: docsRoutes.map((docsRoute, index) => ({
        '@type': 'TechArticle',
        position: index + 1,
        headline: docsRoute.title,
        url: getAbsoluteUrl(docsRoute.path),
      })),
    });
  }

  return (
    <Helmet prioritizeSeoTags>
      <html lang="en" />
      <title>{route.title}</title>
      <meta name="description" content={route.description} />
      <meta name="keywords" content={keywords.join(', ')} />
      <meta name="robots" content={robots} />
      <link rel="canonical" href={url} />

      <meta property="og:locale" content={siteConfig.locale} />
      <meta property="og:site_name" content={siteConfig.name} />
      <meta property="og:type" content={route.type} />
      <meta property="og:title" content={route.title} />
      <meta property="og:description" content={route.description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={route.title} />
      <meta name="twitter:description" content={route.description} />
      <meta name="twitter:image" content={image} />

      {schemas.map((schema, index) => (
        <script key={`${route.path}-schema-${index}`} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
}
