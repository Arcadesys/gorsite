import { redirect } from 'next/navigation';

export default function AdminDashboardPage() {
  // This should not exist - middleware redirects /admin to /dashboard for non-superadmins
  // and /admin/system for superadmins
  redirect('/dashboard');
}