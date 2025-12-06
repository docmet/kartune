"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { lapsApi, sessionsApi } from "@/lib/api";
import { Lap, Session, TelemetryDataPoint } from "@/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { TelemetryCharts, TelemetrySeries } from "@/components/telemetry/TelemetryCharts";
import { LapConsistency } from "@/components/telemetry/LapConsistency";

const CHART_COLORS = [
    "#3b82f6", // Blue
    "#ef4444", // Red
    "#22c55e", // Green
    "#eab308", // Yellow
    "#a855f7", // Purple
];

function AnalysisContent() {
    const searchParams = useSearchParams();
    const initialSessionId = searchParams.get("session_id");

    const [sessions, setSessions] = useState<Session[]>([]);
    const [selectedSessionId, setSelectedSessionId] = useState<string>("");

    const [laps, setLaps] = useState<Lap[]>([]);
    const [selectedLapIds, setSelectedLapIds] = useState<number[]>([]);

    // Cache telemetry data: lapId -> data[]
    const [telemetryCache, setTelemetryCache] = useState<Record<number, TelemetryDataPoint[]>>({});

    const [loading, setLoading] = useState(true);
    const [loadingTelemetry, setLoadingTelemetry] = useState(false);

    // Fetch sessions on mount
    useEffect(() => {
        sessionsApi.getSessions().then(res => {
            setSessions(res.data);
            if (res.data.length > 0) {
                if (initialSessionId) {
                    // Start with specific session regardless of list order
                    setSelectedSessionId(initialSessionId);
                } else {
                    // Default to latest session
                    const latest = res.data[0];
                    setSelectedSessionId(latest.id.toString());
                }
            }
            setLoading(false);
        }).catch(err => {
            console.error(err);
            setLoading(false);
        });
    }, [initialSessionId]);

    // Fetch laps when session changes
    useEffect(() => {
        if (!selectedSessionId) return;

        setLoading(true);
        lapsApi.getLaps({ session_id: selectedSessionId, valid_only: true })
            .then(res => {
                const sorted = res.data.sort((a, b) => a.lap_number - b.lap_number);
                setLaps(sorted);
                // Default select fastest lap
                const best = sorted.reduce((prev, curr) => (prev.lap_time_ms < curr.lap_time_ms ? prev : curr), sorted[0]);
                if (best) {
                    setSelectedLapIds([best.id]);
                } else {
                    setSelectedLapIds([]);
                }
                setLoading(false);
            })
            .catch(console.error);
    }, [selectedSessionId]);

    // Fetch telemetry for selected laps
    useEffect(() => {
        const fetchMissing = async () => {
            const missingIds = selectedLapIds.filter(id => !telemetryCache[id]);
            if (missingIds.length === 0) return;

            setLoadingTelemetry(true);
            try {
                // Fetch in parallel
                const promises = missingIds.map(id =>
                    lapsApi.getLapTelemetry(id)
                        .then(res => ({ id, data: res.data }))
                        .catch(err => ({ id, data: [] }))
                );

                const results = await Promise.all(promises);

                setTelemetryCache(prev => {
                    const next = { ...prev };
                    results.forEach(r => {
                        // @ts-ignore
                        next[r.id] = r.data;
                    });
                    return next;
                });
            } finally {
                setLoadingTelemetry(false);
            }
        };

        fetchMissing();
    }, [selectedLapIds, telemetryCache]);

    const handleLapToggle = (id: number) => {
        setSelectedLapIds(prev => {
            if (prev.includes(id)) {
                return prev.filter(lid => lid !== id);
            }
            // Limit to 5 laps
            if (prev.length >= 5) return prev;
            return [...prev, id];
        });
    };

    // Prepare series for charts
    const series: TelemetrySeries[] = selectedLapIds.map((id, index) => {
        const lap = laps.find(l => l.id === id);
        return {
            lapId: id,
            lapNumber: lap?.lap_number || 0,
            color: CHART_COLORS[index % CHART_COLORS.length],
            data: telemetryCache[id] || [],
        };
    }).filter(s => s.data.length > 0);

    return (
        <div className="py-10">
            <header>
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                    <h1 className="text-3xl font-bold leading-tight tracking-tight text-white">
                        Analysis
                    </h1>
                    <div className="w-[300px]">
                        <Select value={selectedSessionId} onValueChange={setSelectedSessionId}>
                            <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                                <SelectValue placeholder="Select Session" />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-800 border-zinc-700 text-white">
                                {sessions.map((s) => (
                                    <SelectItem key={s.id} value={s.id.toString()}>
                                        {new Date(s.session_date).toLocaleDateString()} - {s.track ? s.track.name : "Session " + s.id}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </header>
            <main>
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="px-4 py-8 sm:px-0 space-y-6">
                        {/* Lap Consistency */}
                        <div className="grid grid-cols-1 gap-6">
                            <LapConsistency
                                laps={laps}
                                selectedLapIds={selectedLapIds}
                                onLapToggle={handleLapToggle}
                            />
                        </div>

                        {/* Charts */}
                        {loadingTelemetry && (
                            <div className="flex justify-center text-zinc-500 py-2">
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                Loading telemetry...
                            </div>
                        )}

                        <TelemetryCharts series={series} />
                    </div>
                </div>
            </main>
        </div>
    );
}

export default function AnalysisPage() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center text-white"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
            <AnalysisContent />
        </Suspense>
    );
}
