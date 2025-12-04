"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function Navigation() {
    const { user, logout } = useAuth();
    const pathname = usePathname();

    if (!user) return null;

    const navItems = [
        { name: "Dashboard", href: "/dashboard" },
        { name: "Sessions", href: "/sessions" },
    ];

    return (
        <nav className="bg-white shadow dark:bg-gray-800">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 justify-between">
                    <div className="flex">
                        <div className="flex flex-shrink-0 items-center">
                            <Link href="/dashboard" className="text-xl font-bold text-gray-800 dark:text-white">
                                KarTune
                            </Link>
                        </div>
                        <div className="ml-6 flex space-x-4 items-center">
                            {navItems.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive
                                                ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                                                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                            }`}
                                    >
                                        {item.name}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                            {user.full_name || user.email}
                        </span>
                        <button
                            onClick={logout}
                            className="rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-500 transition-colors"
                        >
                            Sign out
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}
