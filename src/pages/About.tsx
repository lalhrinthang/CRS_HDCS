import { Shield, MapPin, BarChart3, Bell, Users, Lock, Eye, Heart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Layout from "@/components/layout/Layout";

const About = () => {
  const principles = [
    {
      icon: Eye,
      title: "Transparency",
      description:
        "All report data and analytics are publicly accessible. We believe in open information for community empowerment.",
    },
    {
      icon: Lock,
      title: "Privacy",
      description:
        "Reports are anonymized. We do not collect personal information from reporters to protect community members.",
    },
    {
      icon: Users,
      title: "Community-Driven",
      description:
        "This platform is built by and for the community. Every report contributes to making Yangon safer.",
    },
    {
      icon: Heart,
      title: "Accessibility",
      description:
        "Designed to be accessible on any device. Whether you're on a phone or computer, you can report and view reports.",
    },
  ];

  const features = [
    {
      icon: MapPin,
      title: "Interactive Map",
      description:
        "View all reported hazards on an interactive map of Yangon. Filter by category, time period, and status to find relevant reports.",
    },
    {
      icon: BarChart3,
      title: "Public Dashboard",
      description:
        "Access transparent analytics including category distribution, township hotspots, and monthly trends.",
    },
    {
      icon: Bell,
      title: "Proximity Alerts",
      description:
        "Enable location-based alerts to get notified when you're near reported hazards. Customize your alert radius and notification preferences.",
    },
    {
      icon: Shield,
      title: "Trusted Reporting",
      description:
        "Verified community members can submit reports through the admin panel, ensuring data quality and reliability.",
    },
  ];

  return (
    <Layout>
      <div className="container py-6 space-y-12 mb-16 md:mb-0">
        {/* Hero */}
        <div className="text-center max-w-2xl mx-auto">
          <Shield className="h-12 w-12 mx-auto mb-4 text-primary" />
          <h1 className="text-3xl font-bold mb-4">
            About Community Safety Reporting
          </h1>
          <p className="text-lg text-muted-foreground">
            A transparent, community-driven platform for reporting and tracking
            safety across Yangon's townships. Our mission is to empower
            communities with information to create safer neighborhoods.
          </p>
        </div>

        {/* Principles */}
        <div>
          <h2 className="text-2xl font-bold text-center mb-6">Our Principles</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {principles.map((p) => (
              <Card key={p.title}>
                <CardContent className="pt-6 text-center">
                  <p.icon className="h-8 w-8 mx-auto mb-3 text-primary" />
                  <h3 className="font-semibold mb-2">{p.title}</h3>
                  <p className="text-sm text-muted-foreground">{p.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Features */}
        <div>
          <h2 className="text-2xl font-bold text-center mb-6">Features</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {features.map((f) => (
              <Card key={f.title}>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <f.icon className="h-5 w-5 text-primary" />
                    {f.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{f.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Report Categories */}
        <div>
          <h2 className="text-2xl font-bold text-center mb-6">
            Report Categories
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { name: "Dangers", desc: "Conscription, explosions, gunfire" },
              { name: "Warnings", desc: "Potential risks or threats, Protest, Restricted Areas" },
              { name: "Checkpoints & Patrols", desc: "Military checkpoints, patrol routes, Traffic Police Presence" },
              { name: "Traffic Issue", desc: "Traffic accidents, Blocked roads" },
              { name: "Other", desc: "General community concerns" },
            ].map((cat) => (
              <Card key={cat.name}>
                <CardContent className="pt-6">
                  <p className="font-medium">{cat.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">{cat.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* How to Use */}
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-6">How to Use</h2>
          <div className="space-y-4">
            {[
              {
                step: "1",
                title: "Browse the Map",
                desc: "Visit the interactive map to see all reported dangers in Yangon. ",
              },
              {
                step: "2",
                title: "Check the Dashboard",
                desc: "View analytics and trends on the public dashboard. See which townships have the most reports and track monthly changes.",
              },
              {
                step: "3",
                title: "Set Up Alerts",
                desc: "Enable proximity alerts to get notified when you're near reported dangers. Customize your alert radius from 200m to 5km.",
              },
              {
                step: "4",
                title: "Report Dangers (Admin)",
                desc: "Trusted community members can log in to submit new reports with photos, locations, and detailed descriptions.",
              },
            ].map((item) => (
              <div key={item.step} className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                  {item.step}
                </div>
                <div>
                  <p className="font-medium">{item.title}</p>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer note */}
        <div className="text-center text-sm text-muted-foreground border-t pt-6">
          <p>
            This is a demonstration platform. In production, it would connect to
            a real-time location-based service alert system with proper authentication.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default About;