// This page should never be reached because middleware redirects /admin 
// to either /admin/system (superadmin) or /dashboard (regular admin)
export default function AdminIndexPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Redirecting...</h1>
      <p>You should not see this page. Please check your authentication.</p>
    </div>
  );
} 