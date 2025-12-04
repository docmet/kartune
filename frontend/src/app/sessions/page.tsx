"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { Session, Driver, Track, TelemetryAnalysis } from "@/types";
import Navigation from "@/components/Navigation";

export default function SessionsPage() {
    const { user, isLoading, isAuthenticated } = useAuth();
    const router = useRouter();
    const [sessions, setSessions] = useState<Session[]>([]);
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [tracks, setTracks] = useState<Track[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploadingFile, setUploadingFile] = useState<number | null>(null);
    const [analysis, setAnalysis] = useState<Record<number, TelemetryAnalysis>>({});

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push("/login");
        }
    }, [isLoading, isAuthenticated, router]);

    useEffect(() => {
        if (isAuthenticated) {
            loadData();
        }
    }, [isAuthenticated]);

    const loadData = async () => {
        try {
            const [sessionsRes, driversRes, tracksRes] = await Promise.all([
                api.get<Session[]>("/api/sessions"),
                api.get<Driver[]>("/api/drivers"),
                api.get<Track[]>("/api/tracks"),
            ]);
            setSessions(sessionsRes.data);
            setDrivers(driversRes.data);
            setTracks(tracksRes.data);
        } catch (error) {
            console.error("Failed to load data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (sessionId: number, file: File) => {
        setUploadingFile(sessionId);
        try {
            const formData = new FormData();
            formData.append("file", file);

            const response = await api.post<TelemetryAnalysis>(
                `/api/sessions/${sessionId}/upload-telemetry`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            setAnalysis((prev) => ({
                ...prev,
                [sessionId]: response.data,
            }));

            // Reload sessions to get updated data
            const sessionsRes = await api.get<Session[]>("/api/sessions");
            setSessions(sessionsRes.data);

            alert("Telemetry uploaded and analyzed successfully!");
        } catch (error: any) {
            alert("Failed to upload telemetry: " + (error.response?.data?.detail || error.message));
        } finally {
            setUploadingFile(null);
        }
    };

    const formatLapTime = (ms: number) => {
        const minutes = Math.floor(ms / 60000);
        const seconds = Math.floor((ms % 60000) / 1000);
        const millis = ms % 1000;
        return `${minutes}:${seconds.toString().padStart(2, "0")}.${millis.toString().padStart(3, "0")}`;
    };

    const getDriverName = (driverId: number) => {
        return drivers.find((d) => d.id === driverId)?.name || "Unknown";
    };

    const getTrackName = (trackId: number) => {
        return tracks.find((t) => t.id === trackId)?.name || "Unknown";
    };

    if (isLoading || loading || !user) {
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
                            Racing Sessions
                        </h1>
                    </div>
                </header>
                <main>
                    <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                        <div className="px-4 py-8 sm:px-0">
                            {sessions.length === 0 ? (
                                <div className="text-center py-12">
                                    <p className="text-gray-500 dark:text-gray-400">
                                        No sessions yet. Create your first session to start tracking your performance!
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {sessions.map((session) => (
                                        <div
                                            key={session.id}
                                            className="bg-white dark:bg-gray-800 shadow rounded-lg p-6"
                                        >
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                        {getTrackName(session.track_id)} - {getDriverName(session.driver_id)}
                                                    </h3>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        {new Date(session.session_date).toLocaleDateString()} - {session.session_type || "Practice"}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    {session.best_lap_time_ms && (
                                                        <div>
                                                            <p className="text-sm text-gray-500 dark:text-gray-400">Best Lap</p>
                                                            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                                                {formatLapTime(session.best_lap_time_ms)}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {session.best_lap_time_ms && session.average_lap_time_ms && (
                                                <div className="mt-4 grid grid-cols-3 gap-4">
                                                    <div>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">Average Lap</p>
                                                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                                            {formatLapTime(session.average_lap_time_ms)}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">Total Laps</p>
                                                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                                            {session.total_laps}
                                                        </p>
                                                    </div>
                                                    {analysis[session.id] && (
                                                        <div>
                                                            <p className="text-xs text-gray-500 dark:text-gray-400">Consistency</p>
                                                            <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                                                {analysis[session.id].consistency_score.toFixed(1)}%
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {!session.telemetry_file_path && (
                                                <div className="mt-4">
                                                    <label className="block">
                                                        <span className="sr-only">Choose telemetry file</span>
                                                        <input
                                                            type="file"
                                                            accept=".csv,.json"
                                                            onChange={(e) => {
                                                                const file = e.target.files?.[0];
                                                                if (file) {
                                                                    handleFileUpload(session.id, file);
                                                                }
                                                            }}
                                                            disabled={uploadingFile === session.id}
                                                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900 dark:file:text-blue-200"
                                                        />
                                                    </label>
                                                    {uploadingFile === session.id && (
                                                        <p className="mt-2 text-sm text-blue-600 dark:text-blue-400">
                                                            Uploading and analyzing...
                                                        </p>
                                                    )}
                                                </div>
                                            )}

                                            {analysis[session.id] && (
                                                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
                                                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                                                        Analysis Results
                                                    </h4>
                                                    <p className="text-sm text-gray-700 dark:text-gray-300">
                                                        Trend: <span className="font-semibold capitalize">{analysis[session.id].improvement_trend.replace("_", " ")}</span>
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
