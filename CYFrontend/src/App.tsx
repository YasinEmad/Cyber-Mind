
import { useEffect } from 'react';
import { HashRouter } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import axios from '@/api/axios';
import AnimatedRoutes from './router/routes';
import { setUser, clearUser } from './redux/slices/userSlice';

export default function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await axios.get('/users/me');
        if (data.success) {
          dispatch(setUser(data.data));
        } else {
          dispatch(clearUser());
        }
      } catch (error) {
        dispatch(clearUser());
      }
    };

    fetchUser();
  }, [dispatch]);

  return (
    <HashRouter>
      <AnimatedRoutes />
      <Toaster 
        position="top-right" 
        toastOptions={{ 
          duration: 4000,
          style: {
            background: '#000000',
            color: '#fff',
            border: '1px solid #dc2626'
          },
          success: {
            style: {
              background: '#000000',
              color: '#fff',
              border: '1px solid #22c55e'
            }
          },
          error: {
            style: {
              background: '#000000',
              color: '#fff',
              border: '1px solid #dc2626'
            }
          }
        }} 
      />
    </HashRouter>
  );
}
