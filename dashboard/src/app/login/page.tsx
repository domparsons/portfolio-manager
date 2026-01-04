import { ThemeProvider } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { useAuth0 } from "@auth0/auth0-react";
import { Analytics } from "@vercel/analytics/react";
import { motion } from "framer-motion";
import { TrendingUp, Brain, GraduationCap, BarChart3, ArrowRight, Sparkles } from "lucide-react";

const features = [
  {
    icon: BarChart3,
    title: "Advanced Backtesting",
    description: "Test investment strategies across historical data with precision and compare performance metrics side-by-side",
  },
  {
    icon: Brain,
    title: "LLM-Powered Analysis",
    description: "Describe strategies in natural language and let AI handle the configuration and optimization",
  },
  {
    icon: GraduationCap,
    title: "Educational Insights",
    description: "Build financial intuition through hands-on strategy comparison and real-world data analysis",
  },
];

const stats = [
  { value: "10+", label: "Backtesting Strategies" },
  { value: "AI", label: "Powered Analysis" },
  { value: "Real", label: "Historical Data" },
];

export default function LandingPage() {
  const { loginWithRedirect } = useAuth0();

  const handleLogin = () => {
    loginWithRedirect().then((r) => console.log(r));
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
          className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-blue-500/10 dark:bg-blue-500/5 blur-3xl"
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
          className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-purple-500/10 dark:bg-purple-500/5 blur-3xl"
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
            <motion.div
              className="rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 p-2"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <TrendingUp className="h-6 w-6 text-white" strokeWidth={2.5} />
            </motion.div>
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-xl font-bold tracking-tight text-transparent dark:from-blue-400 dark:to-purple-400">
              Portfolio Manager
            </span>
          </div>
          <a
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            href="https://www.domparsons.com"
          >
            domparsons.com
          </a>
        </motion.nav>

        {/* Hero Section */}
        <div className="relative z-10 mx-auto flex max-w-7xl flex-1 flex-col items-center justify-center px-6 py-12 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/50 bg-card/50 px-4 py-1.5 backdrop-blur-sm"
            >
              <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              <span className="text-sm font-medium text-foreground">
                AI-Powered Investment Analysis
              </span>
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mb-6 text-5xl font-bold tracking-tight text-foreground lg:text-7xl"
            >
              Backtest Smarter.
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-purple-400">
                Invest with Confidence.
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground lg:text-xl"
            >
              Test investment strategies across historical data, leverage AI to
              configure backtests in natural language, and build financial
              intuition through real-world analysis.
            </motion.p>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="mb-16"
            >
              <Button
                size="lg"
                onClick={handleLogin}
                className="group relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6 text-base font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:shadow-purple-500/25"
              >
                Get Started
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
              <p className="mt-4 text-sm text-muted-foreground">
                Securely powered by Auth0
              </p>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="mb-20 flex flex-wrap items-center justify-center gap-8 lg:gap-16"
            >
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="mb-1 text-3xl font-bold text-foreground lg:text-4xl">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {stat.label}
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Feature Cards */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="grid w-full max-w-5xl gap-6 lg:grid-cols-3"
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 + index * 0.1, duration: 0.6 }}
                whileHover={{ y: -5 }}
                className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card/50 p-8 backdrop-blur-sm transition-all hover:border-border hover:bg-card/80 hover:shadow-lg"
              >
                <div className="mb-5 flex items-center justify-center">
                  <div className="rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 p-4 transition-transform group-hover:scale-110">
                    <feature.icon className="h-7 w-7 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <h3 className="mb-3 text-lg font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.2 }}
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
