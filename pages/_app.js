import "@/styles/globals.css";
import { useEffect, useState } from "react";
import { CartProvider } from "@/components/CartContext";
import Layout from "@/components/Layout";
import { useRouter } from "next/router";
import firebaseApp from "@/lib/firebaseClient";
import { getAuth, onAuthStateChanged } from "firebase/auth";

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasPrintfulToken, setHasPrintfulToken] = useState(false);
  const [loading, setLoading] = useState(true);
  const isDashboard = router.pathname.startsWith("/dashboard");

  useEffect(() => {
    const auth = getAuth(firebaseApp);
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        console.log("User signed in:", user.email);
        // ONLY set Firebase token here
        const token = await user.getIdToken();
        document.cookie = `firebase_token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // ONLY check Printful token - don't set it
  const checkPrintfulToken = () => {
    if (typeof window === 'undefined') return false;
    
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('token=')) // Look for 'token=' not 'printful_token='
      ?.split('=')[1];

    setHasPrintfulToken(Boolean(token));
    return Boolean(token);
  };

  // Authentication state listener
  useEffect(() => {
    const auth = getAuth(firebaseApp);
    let mounted = true;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!mounted) return;

      if (user) {
        console.log("User signed in:", user.email);
        await setFirebaseToken(user); // Only set Firebase token
        checkPrintfulToken(); // Just check if Printful token exists
        
        if (router.pathname === "/") {
          router.push("/dashboard");
        }
      } else {
        setIsAuthenticated(false);
        setHasPrintfulToken(false);
        
        if (isDashboard) {
          router.push("/");
        }
      }
      
      setLoading(false);
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [router.pathname]);

  // Show loading state
  if (loading) {
    return <div>Loading...</div>;
  }

  // Protect dashboard routes
  if (isDashboard && !isAuthenticated) {
    router.push("/");
    return <div>Redirecting...</div>;
  }

  // Pass both auth states to components
  const content = (
    <Component 
      {...pageProps} 
      isAuthenticated={isAuthenticated}
      hasPrintfulToken={hasPrintfulToken}
    />
  );

  return (
    <CartProvider>
      {isDashboard ? <Layout>{content}</Layout> : content}
    </CartProvider>
  );
}