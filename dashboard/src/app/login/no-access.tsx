import { ThemeProvider } from "@/components/theme-provider";
import { Analytics } from "@vercel/analytics/react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useAuth0 } from "@auth0/auth0-react";

export default function NoAccess() {
  const { logout } = useAuth0();

  const handleLogout = () => {
    logout({
      logoutParams: {
        returnTo: window.location.origin,
      },
    });
  };

  return (
    <ThemeProvider>
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-r from-gray-900 to-gray-800 p-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl flex flex-col"
        >
          <h1 className="text-5xl font-extrabold text-white">
            Private Alpha Testing
          </h1>
          <p className="mt-2 text-xl text-gray-300 mb-10">
            University Project - Limited Access
          </p>
          <Button onClick={handleLogout} className={"mt-4 text-sm underline"}>
            Back to login page
          </Button>
          <a
            className="mt-4 text-sm text-gray-400 underline"
            href={"https://www.domparsons.com"}
          >
            ← Back to www.domparsons.com
          </a>
        </motion.div>
      </div>
      <Analytics />
    </ThemeProvider>
  );
}
