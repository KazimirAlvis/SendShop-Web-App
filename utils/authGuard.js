//sendshop-clean/utils/authGuard.js
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export function withAuth(WrappedComponent) {
  return function WithAuthComponent({ isAuthenticated, ...props }) {
    const router = useRouter();

    useEffect(() => {
      if (!isAuthenticated) {
        router.push('/');
      }
    }, [isAuthenticated]);

    if (!isAuthenticated) {
      return <div>Redirecting to home...</div>;
    }

    return <WrappedComponent {...props} />;
  };
}