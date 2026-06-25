import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle: string;
  user?: any;
  actions?: React.ReactNode;
}

export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <header className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl sm:text-[28px] font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
          {title}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-1">
          {subtitle}
        </p>
      </div>
      {actions && (
        <div className="flex items-center gap-3 w-full sm:w-auto shrink-0">
          {actions}
        </div>
      )}
    </header>
  );
}
