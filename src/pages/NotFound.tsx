import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

export function NotFound() {
  return (
    <>
      <Helmet>
        <title>404 - Page Not Found | SickAgent</title>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>
      <main className="min-h-[70vh] px-6 py-20">
        <div className="mx-auto max-w-2xl rounded-2xl border border-border/60 bg-surface-1 p-8 text-center shadow-glow-soft">
          <p className="text-xs uppercase tracking-[0.24em] text-fg-muted">Error</p>
          <h1 className="mt-4 text-4xl font-display font-bold text-fg-secondary">404</h1>
          <p className="mt-4 text-base text-fg-muted">
            The page you are looking for does not exist or has been moved.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/"
              className="inline-flex items-center rounded-xl bg-gradient-to-r from-sick-500 to-violet-500 px-4 py-2 text-sm font-semibold text-black transition hover:brightness-110"
            >
              Go to Home
            </Link>
            <Link
              to="/docs"
              className="inline-flex items-center rounded-xl border border-border/70 bg-surface-2 px-4 py-2 text-sm font-semibold text-fg-secondary transition hover:bg-surface-3"
            >
              Open Docs
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
