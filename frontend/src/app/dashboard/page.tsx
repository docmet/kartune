"use client";

import { useAuth } from "@/lib/auth-context";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Navigation from "@/components/Navigation";

export default function DashboardPage() {
    const { user, logout, isLoading, isAuthenticated } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push("/login");
        }
    }, [isLoading, isAuthenticated, router]);

    if (isLoading || !user) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-xl">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
            <Navigation />

            <div className="py-10">
                <header>
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900 dark:text-white">
                            Dashboard
                        </h1>
                    </div>
                </header>
                <main>
                    <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                        <div className="px-4 py-8 sm:px-0">
                            <div className="h-96 rounded-lg border-4 border-dashed border-gray-200 dark:border-gray-700 p-4">
                                <p className="text-gray-500 dark:text-gray-400">
                                    Welcome to your team dashboard. Select an option from the menu to get started.
                                </p>
                                <div className="mt-4">
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Your Details:</h3>
                                    <ul className="mt-2 list-disc pl-5 text-gray-500 dark:text-gray-400">
                                        <li>Email: {user.email}</li>
                                        <li>Role: {user.role}</li>
                                        <li>Team ID: {user.team_id}</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
