import { Link } from "react-router-dom";
import { Shield, MapPin, BarChart3, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/layout/Layout";

interface LandingProps {
  isAuthenticated?: boolean;
  onLogout?: () => void;
}

const Landing = ({ isAuthenticated, onLogout }: LandingProps) => {
  return (
    <Layout isAuthenticated={isAuthenticated} onLogout={onLogout}>
      <section className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden px-4">
        {/* Animated background elements */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-primary/8 blur-3xl" />
          <div className="absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 rounded-full bg-primary/3 blur-3xl" />
        </div>

        <div className="relative z-10 mx-auto max-w-3xl text-center">
          {/* Badge */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm text-muted-foreground shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Community-powered safety platform
          </div>

          {/* Shield icon */}
          <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/25">
            <Shield className="h-10 w-10 text-primary-foreground" />
          </div>

          {/* Title */}
          <h1 className="mb-6 text-4xl font-bold tracking-tight text-foreground md:text-6xl lg:text-7xl">
            Community Safety &{" "}
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Hazard Reporting
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mx-auto mb-10 max-w-xl text-lg leading-relaxed text-muted-foreground md:text-xl">
            A transparent platform for viewing and understanding safety
            information in the Yangon metropolitan area. Empowering communities
            with accessible, location-based safety data.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link to="/map">
              <Button size="lg" className="gap-2 px-8 text-base shadow-lg shadow-primary/20">
                <MapPin className="h-5 w-5" />
                Explore Map
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button size="lg" variant="outline" className="gap-2 px-8 text-base">
                <BarChart3 className="h-5 w-5" />
                View Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Landing;