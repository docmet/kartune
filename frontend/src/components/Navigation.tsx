"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export default function Navigation() {
    const { user, logout } = useAuth();
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    if (!user) return null;

    const navItems = [
        { name: "Dashboard", href: "/dashboard" },
        { name: "Laps", href: "/dashboard/laps" },
        { name: "Sessions", href: "/sessions" },
    ];

    const NavLinks = () => (
        <>
            {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-smooth ${isActive
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
                            }`}
                    >
                        {item.name}
                    </Link>
                );
            })}
        </>
    );

    return (
        <nav className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    {/* Logo */}
                    <div className="flex items-center">
                        <Link
                            href="/dashboard"
                            className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent hover:opacity-80 transition-smooth"
                        >
                            KarTune
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-2">
                        <NavLinks />
                    </div>

                    {/* Desktop User Menu */}
                    <div className="hidden md:flex items-center space-x-4">
                        <span className="text-sm text-muted-foreground">
                            {user.full_name || user.email}
                        </span>
                        <Button
                            onClick={logout}
                            variant="outline"
                            size="sm"
                            className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground transition-smooth"
                        >
                            Sign out
                        </Button>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden">
                        <Sheet open={isOpen} onOpenChange={setIsOpen}>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <Menu className="h-6 w-6" />
                                    <span className="sr-only">Open menu</span>
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                                <SheetHeader>
                                    <SheetTitle className="text-left">
                                        <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                                            KarTune
                                        </span>
                                    </SheetTitle>
                                </SheetHeader>
                                <div className="mt-8 flex flex-col space-y-4">
                                    {/* Mobile Nav Links */}
                                    <div className="flex flex-col space-y-2">
                                        <NavLinks />
                                    </div>

                                    {/* Mobile User Info */}
                                    <div className="pt-4 border-t border-border">
                                        <p className="text-sm text-muted-foreground mb-4">
                                            Signed in as <span className="text-foreground font-medium">{user.full_name || user.email}</span>
                                        </p>
                                        <Button
                                            onClick={() => {
                                                logout();
                                                setIsOpen(false);
                                            }}
                                            variant="outline"
                                            className="w-full border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                                        >
                                            Sign out
                                        </Button>
                                    </div>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </div>
        </nav>
    );
}
