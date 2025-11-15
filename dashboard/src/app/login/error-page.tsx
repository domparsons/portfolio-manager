import { ThemeProvider } from "@/components/theme-provider";
import { Analytics } from "@vercel/analytics/react";
import { motion } from "framer-motion";
import { IconError404 } from "@tabler/icons-react";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Button } from "@/components/ui/button";
import { useAuth0 } from "@auth0/auth0-react";

export default function ErrorPage() {
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
          <div>
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <IconError404 />
                </EmptyMedia>
                <EmptyTitle className={"text-white"}>
                  An Error Occurred
                </EmptyTitle>
                <EmptyDescription>
                  Something went wrong on our end. Try logging out and logging
                  back in to resolve the issue.
                </EmptyDescription>
              </EmptyHeader>
              <Button
                onClick={handleLogout}
                className={"text-sm"}
                variant={"outline"}
              >
                Back to login page
              </Button>
            </Empty>
          </div>
        </motion.div>
      </div>
      <Analytics />
    </ThemeProvider>
  );
}
