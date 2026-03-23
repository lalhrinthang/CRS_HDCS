import { ReactNode } from "react";
import Header from "./Header";
import MobileNav from "./MobileNav";

interface LayoutProps {
    children: ReactNode;          // The page content
    isAuthenticated?: boolean;
    onLogout?: () => void;
    hideNav?: boolean;            // For fullscreen pages
}

const Layout = ({
    children,
    isAuthenticated = false,
    onLogout,
    hideNav = false,
}: LayoutProps) => {
    return (
        <div className="min-h-screen flex flex-col">
            {/* Header at top (unless hidden) */}
            {!hideNav && (
                <Header isAuthenticated={isAuthenticated} onLogout={onLogout} />
            )}

            {/* Page content fills remaining space */}
            {children}

            {/* Mobile bottom nav (unless hidden) */}
            {!hideNav && <MobileNav />}
        </div>
    );
};

export default Layout;
