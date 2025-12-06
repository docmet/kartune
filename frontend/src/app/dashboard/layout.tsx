"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Navigation from "@/components/Navigation";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, isLoading, isAuthenticated } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push("/login");
        }
    }, [isLoading, isAuthenticated, router]);

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-xl">Loading...</div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return null; // Will redirect in useEffect
    }

    return (
        <div className="min-h-screen bg-zinc-950">
            <Navigation />
            <main>{children}</main>
        </div>
    );
}
