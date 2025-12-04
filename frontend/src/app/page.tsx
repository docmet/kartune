"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BarChart3, Settings, TrendingUp } from "lucide-react";
import Link from "next/link";

export default function Home() {
    const router = useRouter();
    const { isAuthenticated, isLoading } = useAuth();

    useEffect(() => {
        if (!isLoading && isAuthenticated) {
            router.push("/dashboard");
        }
    }, [isLoading, isAuthenticated, router]);

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <div className="text-xl text-foreground">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center justify-center overflow-hidden geometric-bg">
                {/* Background Image with Overlay */}
                <div
                    className="absolute inset-0 z-0"
                    style={{
                        backgroundImage: 'url(/images/hero-telemetry.png)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                    }}
                >
                    <div className="absolute inset-0 bg-gradient-to-b from-background/95 via-background/90 to-background" />
                </div>

                {/* Content */}
                <div className="relative z-10 container mx-auto px-4 py-20 text-center">
                    {/* Logo/Brand */}
                    <div className="mb-8">
                        <h1 className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-foreground via-foreground to-muted-foreground bg-clip-text text-transparent">
                            KarTune
                        </h1>
                    </div>

                    {/* Tagline */}
                    <h2 className="text-2xl md:text-4xl font-semibold text-foreground mb-4">
                        AI-Powered Kart Racing Analytics
                    </h2>

                    {/* Subtitle */}
                    <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12">
                        Optimize your setup. Analyze your performance. Dominate the track.
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <Link href="/register">
                            <Button
                                size="lg"
                                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg glow-red transition-smooth"
                            >
                                Get Started
                            </Button>
                        </Link>
                        <Link href="/login">
                            <Button
                                size="lg"
                                variant="outline"
                                className="border-secondary text-secondary hover:bg-secondary/10 px-8 py-6 text-lg transition-smooth"
                            >
                                Sign In
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Scroll Indicator */}
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10 animate-bounce">
                    <div className="w-6 h-10 border-2 border-muted-foreground rounded-full flex items-start justify-center p-2">
                        <div className="w-1 h-3 bg-muted-foreground rounded-full" />
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 px-4 bg-background">
                <div className="container mx-auto">
                    <h3 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-16">
                        Everything You Need to Win
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <Card className="glass-card p-8 hover:border-primary/50 transition-smooth group">
                            <div className="mb-4">
                                <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-smooth">
                                    <BarChart3 className="w-8 h-8 text-primary" />
                                </div>
                            </div>
                            <h4 className="text-2xl font-semibold text-foreground mb-3">
                                Telemetry Analysis
                            </h4>
                            <p className="text-muted-foreground">
                                Upload and analyze lap data instantly. Get detailed insights into your performance with AI-powered analytics.
                            </p>
                        </Card>

                        {/* Feature 2 */}
                        <Card className="glass-card p-8 hover:border-secondary/50 transition-smooth group">
                            <div className="mb-4">
                                <div className="w-16 h-16 bg-secondary/10 rounded-lg flex items-center justify-center group-hover:bg-secondary/20 transition-smooth">
                                    <Settings className="w-8 h-8 text-secondary" />
                                </div>
                            </div>
                            <h4 className="text-2xl font-semibold text-foreground mb-3">
                                Setup Optimization
                            </h4>
                            <p className="text-muted-foreground">
                                AI-powered recommendations for kart setup based on track conditions, weather, and your driving style.
                            </p>
                        </Card>

                        {/* Feature 3 */}
                        <Card className="glass-card p-8 hover:border-accent/50 transition-smooth group">
                            <div className="mb-4">
                                <div className="w-16 h-16 bg-accent/10 rounded-lg flex items-center justify-center group-hover:bg-accent/20 transition-smooth">
                                    <TrendingUp className="w-8 h-8 text-accent" />
                                </div>
                            </div>
                            <h4 className="text-2xl font-semibold text-foreground mb-3">
                                Performance Tracking
                            </h4>
                            <p className="text-muted-foreground">
                                Track your progress across sessions. Identify trends, measure improvements, and set new personal bests.
                            </p>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-8 px-4 border-t border-border bg-card">
                <div className="container mx-auto text-center text-muted-foreground">
                    <p>&copy; 2024 KarTune. Built for racers, by racers.</p>
                </div>
            </footer>
        </div>
    );
}
