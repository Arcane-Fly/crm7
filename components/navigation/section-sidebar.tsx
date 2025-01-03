import { cn } from "@/lib/utils";
import Link from "next/link";

export interface SidebarItem {
  label: string;
  href: string;
  icon?: React.ComponentType;
  items?: SidebarItem[];
}

interface SectionSidebarProps {
  items: SidebarItem[];
  className?: string;
}

export function SectionSidebar({ items, className }: SectionSidebarProps) {
  return (
    <aside className={cn("w-64 border-r bg-background", className)}>
      <nav className="space-y-1 p-4">
        {items.map((item) => (
          <div key={item.href} className="space-y-1">
            <Link
              href={item.href}
              className="block rounded-lg px-4 py-2 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground"
            >
              <span className="flex items-center gap-3">
                {item.icon && <item.icon className="h-4 w-4" />}
                {item.label}
              </span>
            </Link>
            {item.items?.map((subItem) => (
              <Link
                key={subItem.href}
                href={subItem.href}
                className="block rounded-lg pl-8 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              >
                <span className="flex items-center gap-3">
                  {subItem.icon && <subItem.icon className="h-4 w-4" />}
                  {subItem.label}
                </span>
              </Link>
            ))}
          </div>
        ))}
      </nav>
    </aside>
  );
}