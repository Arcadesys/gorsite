// Admin layout - most admin routes should redirect via middleware
// Only /admin/login and /admin/system should use this layout
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div>{children}</div>;
}