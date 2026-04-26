import Navbar from '../components/Navbar';
import { Outlet, useLocation } from 'react-router-dom';

export default function MainLayout() {
  const location = useLocation();
  const hideNavbar = location.pathname === '/linux';

  return (
    <>
      {!hideNavbar && <Navbar />}
      <main className={hideNavbar ? 'pt-0' : 'pt-20'}>
        <Outlet />
      </main>
    </>
  );
}
