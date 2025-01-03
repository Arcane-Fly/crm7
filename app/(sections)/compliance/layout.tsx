import { SectionSidebar } from "@/components/navigation/section-sidebar";

const sidebarItems = [
  {
    label: "Overview",
    href: "",
  },
  {
    label: "Audits",
    href: "/audits",
  },
  {
    label: "Certifications",
    href: "/certifications",
  },
  {
    label: "Policies",
    href: "/policies",
  },
  {
    label: "Risk Assessment",
    href: "/risk-assessment",
  },
  {
    label: "Reports",
    href: "/reports",
  },
  {
    label: "Training Records",
    href: "/training-records",
  },
  {
    label: "Incidents",
    href: "/incidents",
  },
];

export default function ComplianceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <aside className="hidden w-[200px] flex-col md:flex">
        <SectionSidebar items={sidebarItems} />
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}