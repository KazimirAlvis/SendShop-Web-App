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
  const [loading, setLoading] = useState(true);
  const isDashboard = router.pathname.startsWith("/dashboard");

  // Authentication state listener
  useEffect(() => {
    const auth = getAuth(firebaseApp);
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        console.log("User signed in:", user.email);
        
        // Get and set Firebase token in cookie
        try {
          const firebaseToken = await user.getIdToken();
          document.cookie = `firebase_token=${firebaseToken}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
          setIsAuthenticated(true);
        } catch (error) {
          console.error("Error setting Firebase token:", error);
          setIsAuthenticated(false);
        }
        
        // Only redirect to dashboard if user is on home page
        if (router.pathname === "/") {
          router.push("/dashboard");
        }
      } else {
        console.log("User signed out");
        // Clear Firebase token cookie on sign out
        document.cookie = "firebase_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
        setIsAuthenticated(false);
        
        // Redirect to home if trying to access protected routes
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

  const content = <Component {...pageProps} isAuthenticated={isAuthenticated} />;

  return (
    <CartProvider>
      {isDashboard ? <Layout>{content}</Layout> : content}
    </CartProvider>
  );
}