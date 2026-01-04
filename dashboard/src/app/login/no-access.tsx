import { ThemeProvider } from "@/components/theme-provider";
import { Analytics } from "@vercel/analytics/react";
import { motion } from "framer-motion";
import { TrendingUp, Lock, ArrowLeft, GraduationCap } from "lucide-react";
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
      <div className="relative flex min-h-screen flex-col overflow-hidden bg-background">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-background to-purple-50 dark:from-blue-950/20 dark:via-background dark:to-purple-950/20" />

        {/* Animated grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8882_1px,transparent_1px),linear-gradient(to_bottom,#8882_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_70%,transparent_100%)]" />

        {/* Floating orbs */}
        <motion.div
          className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-amber-500/10 dark:bg-amber-500/5 blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, -100, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-orange-500/10 dark:bg-orange-500/5 blur-3xl"
          animate={{
            x: [0, -100, 0],
            y: [0, 100, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Nav */}
        <motion.nav
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 flex items-center justify-between px-6 py-6 lg:px-12"
        >
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 p-2">
              <TrendingUp className="h-6 w-6 text-white" strokeWidth={2.5} />
            </div>
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-xl font-bold tracking-tight text-transparent dark:from-blue-400 dark:to-purple-400">
              Porta
            </span>
          </div>
          <a
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            href="https://www.domparsons.com"
          >
            domparsons.com
          </a>
        </motion.nav>

        {/* No Access Content */}
        <div className="relative z-10 flex flex-1 items-center justify-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl text-center"
          >
            {/* Lock Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mb-8 flex justify-center"
            >
              <div className="rounded-full bg-amber-500/10 p-6 dark:bg-amber-500/5">
                <Lock className="h-16 w-16 text-amber-600 dark:text-amber-400" />
              </div>
            </motion.div>

            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/50 bg-card/50 px-4 py-1.5 backdrop-blur-sm"
            >
              <GraduationCap className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <span className="text-sm font-medium text-foreground">
                University Project
              </span>
            </motion.div>

            {/* Main Message */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mb-4 text-4xl font-bold tracking-tight text-foreground lg:text-5xl"
            >
              Private Alpha Testing
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="mb-8 text-lg text-muted-foreground"
            >
              This application is currently in private alpha testing with
              limited access. Thank you for your interest in Porta.
            </motion.p>

            {/* Info Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="mb-8 rounded-2xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm"
            >
              <p className="text-sm text-muted-foreground">
                This is an educational project developed as part of university
                coursework. Access is currently restricted to authorized test
                users only.
              </p>
            </motion.div>

            {/* Action Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
            >
              <Button
                size="lg"
                onClick={handleLogout}
                variant="outline"
                className="group border-border/50 px-8 py-6 text-base font-semibold transition-all hover:border-border hover:bg-card/80"
              >
                <ArrowLeft className="mr-2 h-5 w-5 transition-transform group-hover:-translate-x-1" />
                Back to Login Page
              </Button>
            </motion.div>
          </motion.div>
        </div>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="relative z-10 border-t border-border/50 px-6 py-6 text-center lg:px-12"
        >
          <p className="text-xs text-muted-foreground/60">
            Powered by AI • Built for Learning • Designed for Investors
          </p>
        </motion.footer>
      </div>
      <Analytics />
    </ThemeProvider>
  );
}
