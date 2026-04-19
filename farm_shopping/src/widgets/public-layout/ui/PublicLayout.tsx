import { Outlet } from 'react-router-dom';
import { AppHeader } from '@/src/widgets/header/ui/AppHeader';
import { AppFooter } from '@/src/widgets/footer/ui/AppFooter';

export function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <AppHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <AppFooter />
    </div>
  );
}
