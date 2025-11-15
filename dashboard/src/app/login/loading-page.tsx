import { ThemeProvider } from "@/components/theme-provider";
import { Analytics } from "@vercel/analytics/react";
import { motion } from "framer-motion";
import { Spinner } from "@/components/ui/spinner";

export default function LoadingPage() {
  return (
    <ThemeProvider>
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-r from-gray-900 to-gray-800 p-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl flex flex-col"
        >
          <div className="flex flex-row items-center space-x-4">
            <Spinner color={"white"} className={"size-5"} />
            <p className="text-xl text-gray-300 font-semibold tracking-wide">
              Loading<span className="animate-pulse">...</span>
            </p>
          </div>
          <p className="mt-4 text-sm text-gray-500">
            Please wait while we prepare everything for you.
          </p>
        </motion.div>
      </div>
      <Analytics />
    </ThemeProvider>
  );
}
