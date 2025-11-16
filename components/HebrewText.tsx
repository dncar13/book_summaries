import { PropsWithChildren } from 'react';
import clsx from 'classnames';

interface HebrewTextProps {
  as?: keyof JSX.IntrinsicElements;
  className?: string;
}

export function HebrewText({ as: Tag = 'p', className, children }: PropsWithChildren<HebrewTextProps>) {
  return (
    <Tag dir="rtl" lang="he" className={clsx('font-heebo', className)}>
      {children}
    </Tag>
  );
}
