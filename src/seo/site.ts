import seoConfig from './seo.config.json';

type RouteType = 'website' | 'article';
type RouteKind = 'landing' | 'docs' | 'legal';

type SeoRouteRecord = {
  path: string;
  title: string;
  description: string;
  type: RouteType;
  priority: number;
  changefreq: string;
  index: boolean;
  kind: RouteKind;
  label: string;
  eyebrow: string;
  fallbackHeading: string;
  fallbackLead: string;
  fallbackPoints: string[];
};

type SiteRecord = {
  name: string;
  url: string;
  defaultTitle: string;
  defaultDescription: string;
  defaultImage: string;
  locale: string;
  keywords: string[];
};

const rawConfig = seoConfig as {
  site: SiteRecord;
  routes: SeoRouteRecord[];
};

export const siteConfig = rawConfig.site;
export const seoRoutes = rawConfig.routes.map((route) => ({
  ...route,
  path: normalizePath(route.path),
}));

export type SeoRoute = (typeof seoRoutes)[number];

export function normalizePath(path: string) {
  if (!path) return '/';
  if (path === '/') return '/';
  return path.replace(/\/+$/, '') || '/';
}

export function getSeoRoute(path: string) {
  const normalized = normalizePath(path);
  return seoRoutes.find((route) => route.path === normalized);
}

export function getAbsoluteUrl(path: string) {
  return new URL(normalizePath(path), siteConfig.url).toString();
}

export const docsRoutes = seoRoutes.filter((route) => route.kind === 'docs');
