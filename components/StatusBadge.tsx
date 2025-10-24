import React from 'react';

// Fix: The `Hadith` type does not have a `status` property, causing a type error on the original line 5.
// Since the API doesn't provide a status and this component is unused,
// `HadithStatus` is defined as a standalone type to resolve the error without modifying the core `Hadith` interface.
type HadithStatus = 'sahih' | 'hasan' | 'daif' | 'maudhu';

interface StatusBadgeProps {
  status: HadithStatus;
}

const statusStyles: Record<HadithStatus, string> = {
  sahih: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300',
  hasan: 'bg-sky-100 text-sky-800 dark:bg-sky-900/50 dark:text-sky-300',
  daif: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300',
  maudhu: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-400',
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  return (
    <span className={`inline-block text-xs font-semibold mr-2 px-2.5 py-1 rounded-full ${statusStyles[status]}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};
