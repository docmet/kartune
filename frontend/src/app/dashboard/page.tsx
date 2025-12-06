"use client";

import { useAuth } from "@/lib/auth-context";

export default function DashboardPage() {
    const { user } = useAuth();

    if (!user) return null;

    return (
        <div className="py-10">
            <header>
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <h1 className="text-3xl font-bold leading-tight tracking-tight text-white">
                        Dashboard
                    </h1>
                </div>
            </header>
            <main>
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="px-4 py-8 sm:px-0">
                        <div className="h-96 rounded-lg border-4 border-dashed border-zinc-700 p-4">
                            <p className="text-zinc-400">
                                Welcome to your team dashboard. Select an option from the menu to get started.
                            </p>
                            <div className="mt-4">
                                <h3 className="text-lg font-medium text-white">Your Details:</h3>
                                <ul className="mt-2 list-disc pl-5 text-zinc-400">
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
    );
}
