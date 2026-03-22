import { Link, useLocation } from "react-router-dom";
import { MapPin, BarChart3, Bell, Home } from "lucide-react";
import { cn } from "@/lib/utils";

const MobileNav = () => {
    const location = useLocation();
    const isActive = (path: string) => location.pathname === path;

    const links = [
        { href: "/", label: "Home", icon: Home },
        { href: "/map", label: "Map", icon: MapPin },
        { href: "/dashboard", label: "Stats", icon: BarChart3 },
        { href: "/alerts", label: "Alerts", icon: Bell },
    ];

    return (
        // Fixed bottom bar — only visible on mobile
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t bg-background">
            <div className="flex items-center justify-around py-2">
                {links.map((link) => (
                    <Link
                        key={link.href}
                        to={link.href}
                        className={cn(
                            "flex flex-col items-center gap-1 text-xs",
                            isActive(link.href)
                                ? "text-primary"
                                : "text-muted-foreground"
                        )}
                    >
                        <link.icon className="h-5 w-5" />
                        {link.label}
                    </Link>
                ))}
            </div>
        </nav>
    );
};

export default MobileNav;
