export default function ComplianceLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <div className='flex min-h-screen'>
      <main className='flex-1 px-4 py-8'>{children}</main>
    </div>
  );
}
