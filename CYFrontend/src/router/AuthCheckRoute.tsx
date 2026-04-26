import React, { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { selectIsAuthenticated, selectLoading } from '../redux/slices/userSlice';

interface AuthCheckRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

const AuthCheckRoute: React.FC<AuthCheckRouteProps> = ({
  children,
  redirectTo = '/login'
}) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const loading = useSelector(selectLoading);
  const location = useLocation();
  const hasNotified = useRef(false);

  useEffect(() => {
    if (!loading && !isAuthenticated && !hasNotified.current) {
      toast.error('يجب تسجيل الدخول أولاً للوصول إلى هذا المحتوى', {
        icon: '🔒',
      });
      hasNotified.current = true;
    }
  }, [isAuthenticated, loading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    const returnUrl = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`${redirectTo}?returnUrl=${returnUrl}`} replace />;
  }

  return <>{children}</>;
};

export default AuthCheckRoute;