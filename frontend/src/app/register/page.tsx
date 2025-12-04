"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import api from "@/lib/api";
import { User } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const registerSchema = z
    .object({
        full_name: z.string().min(2, "Full name is required"),
        email: z.string().email("Invalid email address"),
        team_name: z.string().min(2, "Team name is required"),
        country: z.string().optional(),
        password: z.string().min(6, "Password must be at least 6 characters"),
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"],
    });

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
    const router = useRouter();
    const { isAuthenticated, isLoading: authLoading } = useAuth();
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!authLoading && isAuthenticated) {
            router.push("/dashboard");
        }
    }, [authLoading, isAuthenticated, router]);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
    });

    const onSubmit = async (data: RegisterFormValues) => {
        setIsLoading(true);
        setError(null);
        try {
            // Remove confirmPassword before sending
            const { confirmPassword, ...payload } = data;
            await api.post<User>("/api/auth/register", payload);
            // Redirect to login on success
            router.push("/login?registered=true");
        } catch (err: any) {
            setError(err.response?.data?.detail || "Failed to register");
        } finally {
            setIsLoading(false);
        }
    };

    if (authLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <div className="text-xl text-foreground">Loading...</div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-background geometric-bg p-4">
            <Card className="w-full max-w-md glass-card">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                        Get Started
                    </CardTitle>
                    <CardDescription className="text-center text-muted-foreground">
                        Create your KarTune account and team
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="full_name">Full Name</Label>
                            <Input
                                id="full_name"
                                type="text"
                                placeholder="John Doe"
                                {...register("full_name")}
                                className="bg-muted/50 border-border"
                            />
                            {errors.full_name && (
                                <p className="text-sm text-destructive">{errors.full_name.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="you@example.com"
                                {...register("email")}
                                className="bg-muted/50 border-border"
                            />
                            {errors.email && (
                                <p className="text-sm text-destructive">{errors.email.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="team_name">Team Name</Label>
                            <Input
                                id="team_name"
                                type="text"
                                placeholder="Your Racing Team"
                                {...register("team_name")}
                                className="bg-muted/50 border-border"
                            />
                            {errors.team_name && (
                                <p className="text-sm text-destructive">{errors.team_name.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="country">Country (Optional)</Label>
                            <Input
                                id="country"
                                type="text"
                                placeholder="US"
                                {...register("country")}
                                className="bg-muted/50 border-border"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                {...register("password")}
                                className="bg-muted/50 border-border"
                            />
                            {errors.password && (
                                <p className="text-sm text-destructive">{errors.password.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                placeholder="••••••••"
                                {...register("confirmPassword")}
                                className="bg-muted/50 border-border"
                            />
                            {errors.confirmPassword && (
                                <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
                            )}
                        </div>

                        {error && (
                            <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3">
                                <p className="text-sm text-destructive">{error}</p>
                            </div>
                        )}

                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground glow-red"
                        >
                            {isLoading ? "Creating account..." : "Create account"}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex flex-col space-y-2">
                    <div className="text-sm text-center text-muted-foreground">
                        Already have an account?{" "}
                        <Link href="/login" className="text-secondary hover:text-secondary/80 font-medium">
                            Sign in
                        </Link>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}
