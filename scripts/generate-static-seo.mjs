import fs from 'node:fs/promises';
import path from 'node:path';

const rootDir = process.cwd();
const webDir = path.join(rootDir, 'web');
const seoConfigPath = path.join(rootDir, 'src', 'seo', 'seo.config.json');

const config = JSON.parse(await fs.readFile(seoConfigPath, 'utf8'));
const template = await fs.readFile(path.join(webDir, 'index.html'), 'utf8');
const clientOnlyRoutes = [
  '/login',
  '/register',
  '/auth/callback',
  '/app',
  '/app/agents',
  '/app/networks',
  '/app/tasks',
  '/app/arenas',
  '/app/templates',
  '/app/profile',
];

function normalizePath(routePath) {
  if (!routePath || routePath === '/') return '/';
  return routePath.replace(/\/+$/, '') || '/';
}

function absoluteUrl(routePath) {
  return new URL(normalizePath(routePath), config.site.url).toString();
}

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function renderFallback(route) {
  const docsLinks = config.routes
    .filter((item) => item.kind === 'docs')
    .map((item) => `<a href="${item.path}" class="seo-fallback-link">${escapeHtml(item.label)}</a>`)
    .join('');

  const points = route.fallbackPoints
    .map((point) => `<li>${escapeHtml(point)}</li>`)
    .join('');

  return `
<div id="seo-route-fallback">
  <main class="seo-fallback-shell">
    <div class="seo-fallback-frame">
      <p class="seo-fallback-eyebrow">${escapeHtml(route.eyebrow)}</p>
      <h1>${escapeHtml(route.fallbackHeading)}</h1>
      <p class="seo-fallback-lead">${escapeHtml(route.fallbackLead)}</p>
      <ul class="seo-fallback-points">${points}</ul>
      ${route.kind === 'docs' ? `<nav class="seo-fallback-links" aria-label="Documentation sections">${docsLinks}</nav>` : `<div class="seo-fallback-links"><a href="/docs" class="seo-fallback-link">Explore the docs</a><a href="/register" class="seo-fallback-link">Create an account</a></div>`}
    </div>
  </main>
</div>`;
}

function renderStructuredData(route) {
  const image = new URL(config.site.defaultImage, config.site.url).toString();
  const url = absoluteUrl(route.path);
  const docsIndexUrl = absoluteUrl('/docs');
  const docsCollectionId = `${docsIndexUrl}#collection`;
  const organization = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${config.site.url}#organization`,
    name: config.site.name,
    url: config.site.url,
    logo: image,
  };
  const website = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${config.site.url}#website`,
    name: config.site.name,
    url: config.site.url,
    description: config.site.defaultDescription,
    inLanguage: 'en',
    publisher: {
      '@id': `${config.site.url}#organization`,
    },
  };
  const topicEntities = route.fallbackPoints.map((point) => ({
    '@type': 'Thing',
    name: point.replace(/\.$/, ''),
  }));
  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    '@id': `${url}#breadcrumb`,
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: config.site.url },
      ...(route.path.startsWith('/docs')
        ? [{ '@type': 'ListItem', position: 2, name: 'Documentation', item: absoluteUrl('/docs') }]
        : []),
      ...(route.path !== '/' && route.path !== '/docs'
        ? [{ '@type': 'ListItem', position: route.path.startsWith('/docs') ? 3 : 2, name: route.label, item: url }]
        : []),
    ],
  };

  const webPage = {
    '@context': 'https://schema.org',
    '@type': route.path === '/docs' ? 'CollectionPage' : 'WebPage',
    '@id': `${url}#page`,
    name: route.title,
    description: route.description,
    url,
    isPartOf: {
      '@id': `${config.site.url}#website`,
    },
    about: topicEntities,
    breadcrumb: {
      '@id': `${url}#breadcrumb`,
    },
  };

  const schema = route.kind === 'landing'
    ? {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: config.site.name,
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web',
        description: route.description,
        url,
      }
    : {
        '@context': 'https://schema.org',
        '@type': route.kind === 'docs' ? 'TechArticle' : 'WebPage',
        '@id': route.kind === 'docs' ? `${url}#article` : `${url}#document`,
        headline: route.title,
        alternativeHeadline: route.fallbackHeading,
        name: route.title,
        description: route.description,
        url,
        keywords: [...config.site.keywords, route.label].join(', '),
        articleSection: route.kind === 'docs' ? route.label : undefined,
        about: route.kind === 'docs' ? topicEntities : undefined,
        isPartOf: route.kind === 'docs' ? { '@id': docsCollectionId } : undefined,
        hasPart: route.kind === 'docs'
          ? route.fallbackPoints.map((point, index) => ({
              '@type': 'WebPageElement',
              position: index + 1,
              name: point.replace(/\.$/, ''),
            }))
          : undefined,
        publisher: {
          '@id': `${config.site.url}#organization`,
        },
      };

  const docsCollection = route.path === '/docs'
    ? {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        '@id': docsCollectionId,
        name: route.title,
        description: route.description,
        url,
        hasPart: config.routes
          .filter((item) => item.kind === 'docs')
          .map((item, index) => ({
            '@type': 'TechArticle',
            position: index + 1,
            headline: item.title,
            url: absoluteUrl(item.path),
          })),
      }
    : null;

  return [organization, website, breadcrumb, webPage, schema, docsCollection]
    .filter(Boolean)
    .map((item) => `<script type="application/ld+json">${JSON.stringify(item)}</script>`)
    .join('');
}

function buildPage(route) {
  const url = absoluteUrl(route.path);
  const image = new URL(config.site.defaultImage, config.site.url).toString();
  const headTags = `
    <title>${escapeHtml(route.title)}</title>
    <meta name="description" content="${escapeHtml(route.description)}" />
    <meta name="keywords" content="${escapeHtml([...config.site.keywords, route.label].join(', '))}" />
    <meta name="robots" content="index,follow,max-image-preview:large" />
    <link rel="canonical" href="${url}" />
    <meta property="og:locale" content="${config.site.locale}" />
    <meta property="og:site_name" content="${escapeHtml(config.site.name)}" />
    <meta property="og:type" content="${escapeHtml(route.type)}" />
    <meta property="og:title" content="${escapeHtml(route.title)}" />
    <meta property="og:description" content="${escapeHtml(route.description)}" />
    <meta property="og:url" content="${url}" />
    <meta property="og:image" content="${image}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(route.title)}" />
    <meta name="twitter:description" content="${escapeHtml(route.description)}" />
    <meta name="twitter:image" content="${image}" />
    ${renderStructuredData(route)}
  `;

  return template
    .replace(/<title>[\s\S]*?<\/title>/, headTags)
    .replace(/<meta name="description" content="[^"]*" \/>/, '')
    .replace('<body class="bg-surface-0 text-fg antialiased">', '<body class="bg-surface-0 text-fg antialiased">' + renderFallback(route));
}

for (const route of config.routes.filter((item) => item.index)) {
  const pageHtml = buildPage(route);
  const routeDir = route.path === '/' ? webDir : path.join(webDir, route.path.replace(/^\//, ''));
  await fs.mkdir(routeDir, { recursive: true });
  await fs.writeFile(path.join(routeDir, 'index.html'), pageHtml, 'utf8');
}

const appShellHtml = template
  .replace(/<title>[\s\S]*?<\/title>/, '<title>SickAgent</title>')
  .replace(
    /<meta name="description" content="[^"]*" \/>/,
    '<meta name="description" content="SickAgent application shell." /><meta name="robots" content="noindex,nofollow" />',
  );

for (const routePath of clientOnlyRoutes) {
  const routeDir = path.join(webDir, routePath.replace(/^\//, ''));
  await fs.mkdir(routeDir, { recursive: true });
  await fs.writeFile(path.join(routeDir, 'index.html'), appShellHtml, 'utf8');
}

await fs.writeFile(path.join(webDir, '404.html'), buildPage(config.routes.find((route) => route.path === '/')), 'utf8');

const today = new Date().toISOString().slice(0, 10);
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${config.routes
  .filter((route) => route.index)
  .map(
    (route) => `  <url>\n    <loc>${absoluteUrl(route.path)}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${route.changefreq}</changefreq>\n    <priority>${route.priority.toFixed(1)}</priority>\n  </url>`,
  )
  .join('\n')}
</urlset>
`;

await fs.writeFile(path.join(webDir, 'sitemap.xml'), sitemap, 'utf8');

const robots = `User-agent: *
Allow: /
Allow: /docs
Allow: /docs/
Disallow: /app/
Disallow: /login
Disallow: /register
Disallow: /auth/

Sitemap: ${config.site.url}/sitemap.xml
`;

await fs.writeFile(path.join(webDir, 'robots.txt'), robots, 'utf8');

// SPA fallback configs for common static hosts.
const apacheHtaccess = `<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /

  # Serve existing files/directories directly.
  RewriteCond %{REQUEST_FILENAME} -f [OR]
  RewriteCond %{REQUEST_FILENAME} -d
  RewriteRule ^ - [L]

  # Everything else goes to React app shell.
  RewriteRule . /index.html [L]
</IfModule>
`;
await fs.writeFile(path.join(webDir, '.htaccess'), apacheHtaccess, 'utf8');

const netlifyRedirects = `/* /index.html 200
`;
await fs.writeFile(path.join(webDir, '_redirects'), netlifyRedirects, 'utf8');
