import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

type AdminPageProps = {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  width?: 'default' | 'wide' | 'narrow';
};

const WIDTH_CLASS: Record<NonNullable<AdminPageProps['width']>, string> = {
  narrow: 'max-w-5xl',
  default: 'max-w-7xl',
  wide: 'max-w-[110rem]',
};

export function AdminPage({
  title,
  description,
  actions,
  children,
  width = 'wide',
}: AdminPageProps) {
  return (
    <div className={`mx-auto w-full ${WIDTH_CLASS[width]} px-4 py-8 sm:px-6 xl:px-8`}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"
      >
        <div className="min-w-0">
          <h1 className="text-2xl font-display font-bold text-fg sm:text-3xl">{title}</h1>
          {description ? (
            <p className="mt-2 max-w-3xl text-sm leading-7 text-fg-muted">{description}</p>
          ) : null}
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-3">{actions}</div> : null}
      </motion.div>

      {children}
    </div>
  );
}
