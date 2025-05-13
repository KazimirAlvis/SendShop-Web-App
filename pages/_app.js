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

  // Check for Printful token
  const checkPrintfulToken = () => {
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('printful_token='))
      ?.split('=')[1];
    setHasPrintfulToken(!!token);
    return !!token;
  };

  // Authentication state listener
  useEffect(() => {
    const auth = getAuth(firebaseApp);
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        console.log("User signed in:", user.email);
        
        try {
          const firebaseToken = await user.getIdToken();
          // Set Firebase token with secure attributes
          document.cookie = `firebase_token=${firebaseToken}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax; secure=${process.env.NODE_ENV === 'production'}`;
          setIsAuthenticated(true);
          
          // Check Printful token after Firebase auth
          checkPrintfulToken();
        } catch (error) {
          console.error("Error setting Firebase token:", error);
          setIsAuthenticated(false);
        }
        
        if (router.pathname === "/") {
          router.push("/dashboard");
        }
      } else {
        console.log("User signed out");
        // Clear all auth tokens
        document.cookie = "firebase_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
        document.cookie = "printful_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
        document.cookie = "printful_store_id=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
        setIsAuthenticated(false);
        setHasPrintfulToken(false);
        
        if (isDashboard) {
          router.push("/");
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
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