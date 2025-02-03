import { type ReactElement, type ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbProps {
  children: ReactNode;
}

interface BreadcrumbItemProps {
  href?: string;
  children: ReactNode;
}

export function Breadcrumb({ children }: BreadcrumbProps): ReactElement {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        {React.Children.map(children, (child, index) => (
          <li key={index} className="flex items-center">
            {child}
            {index < React.Children.count(children) - 1 && (
              <ChevronRight className="h-4 w-4" />
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function BreadcrumbItem({ href, children }: BreadcrumbItemProps): ReactElement {
  if (href) {
    return (
      <a href={href} className="text-sm font-medium text-gray-500 hover:text-gray-700">
        {children}
      </a>
    );
  }

  return (
    <span className="text-sm font-medium text-gray-900">
      {children}
    </span>
  );
}
