
import { useEffect } from 'react';
import { HashRouter } from 'react-router-dom';
import { useDispatch } from 'react-redux';
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
    </HashRouter>
  );
}
