import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Training & Development - CRM7",
  description: "Training and development management system",
};

interface SidebarItem {
  label: string;
  href: string;
  items?: SidebarItem[];
}

const sidebarItems: SidebarItem[] = [
  {
    label: "Overview",
    href: "/training",
  },
  {
    label: "Courses",
    href: "/training/courses",
    items: [
      { label: "Catalog", href: "/training/courses/catalog" },
      { label: "Management", href: "/training/courses/management" },
    ],
  },
  {
    label: "Certifications",
    href: "/training/certifications",
    items: [
      { label: "Active", href: "/training/certifications/active" },
      { label: "Expired", href: "/training/certifications/expired" },
    ],
  },
  {
    label: "Skills Matrix",
    href: "/training/skills",
  },
  {
    label: "Assessment",
    href: "/training/assessment",
  },
];

export default function TrainingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 border-r bg-background">
        <nav className="space-y-1 p-4">
          {sidebarItems.map((item) => (
            <div key={item.href} className="space-y-1">
              <a
                href={item.href}
                className="block rounded-lg px-4 py-2 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground"
              >
                {item.label}
              </a>
              {item.items?.map((subItem) => (
                <a
                  key={subItem.href}
                  href={subItem.href}
                  className="block rounded-lg pl-8 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                >
                  {subItem.label}
                </a>
              ))}
            </div>
          ))}
        </nav>
      </aside>
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}