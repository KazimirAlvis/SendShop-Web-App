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

  // Improved token management
  const setAuthTokens = async (user) => {
    try {
      const firebaseToken = await user.getIdToken();
      // Set Firebase token cookie
      document.cookie = `firebase_token=${firebaseToken}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
      
      // Don't try to set Printful token here - it will be set by OAuth callback
      setIsAuthenticated(true);
      checkPrintfulToken(); // Just check if it exists
    } catch (error) {
      console.error("Error setting auth tokens:", error);
      setIsAuthenticated(false);
    }
  };

  // Check for Printful token
  const checkPrintfulToken = () => {
    if (typeof window === 'undefined') return false;
    
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('printful_token='))
      ?.split('=')[1];

    const hasToken = Boolean(token);
    setHasPrintfulToken(hasToken);
    return hasToken;
  };

  // Authentication state listener
  useEffect(() => {
    const auth = getAuth(firebaseApp);
    let mounted = true;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!mounted) return;

      if (user) {
        console.log("User signed in:", user.email);
        await setAuthTokens(user);
        
        // Only redirect to dashboard from home page
        if (router.pathname === "/") {
          router.push("/dashboard");
        }
      } else {
        // Clear auth state and tokens
        document.cookie = "firebase_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
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