import { ThemeProvider } from "@/components/theme-provider";
import { Analytics } from "@vercel/analytics/react";
import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";

export default function LoadingPage() {
  return (
    <ThemeProvider>
      <div className="flex min-h-screen items-center justify-center bg-background">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center gap-6"
        >
          {/* Logo */}
          <motion.div
            className="flex items-center gap-3"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 p-2.5">
              <TrendingUp className="h-7 w-7 text-white" strokeWidth={2.5} />
            </div>
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-2xl font-bold tracking-tight text-transparent dark:from-blue-400 dark:to-purple-400">
              Porta
            </span>
          </motion.div>

          {/* Loading indicator */}
          <div className="flex items-center gap-2">
            <motion.div
              className="h-2 w-2 rounded-full bg-blue-600"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [1, 0.5, 1],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <motion.div
              className="h-2 w-2 rounded-full bg-purple-600"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [1, 0.5, 1],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.2,
              }}
            />
            <motion.div
              className="h-2 w-2 rounded-full bg-blue-600"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [1, 0.5, 1],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.4,
              }}
            />
          </div>
        </motion.div>
      </div>
      <Analytics />
    </ThemeProvider>
  );
}
