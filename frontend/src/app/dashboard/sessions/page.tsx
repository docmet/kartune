"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import api from "@/lib/api";
import { Session, Driver, Track, Kart, TelemetryAnalysis } from "@/types";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, X, Pencil, Loader2 } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function SessionsPage() {
    const { user } = useAuth();
    const [sessions, setSessions] = useState<Session[]>([]);
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [tracks, setTracks] = useState<Track[]>([]);
    const [karts, setKarts] = useState<Kart[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploadingFile, setUploadingFile] = useState<number | null>(null);
    const [analysis, setAnalysis] = useState<Record<number, TelemetryAnalysis>>({});

    // Filters
    const [selectedDriver, setSelectedDriver] = useState<string>("all");
    const [selectedTrack, setSelectedTrack] = useState<string>("all");
    const [selectedKart, setSelectedKart] = useState<string>("all");

    // Edit State
    const [editingSession, setEditingSession] = useState<Session | null>(null);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editFormData, setEditFormData] = useState<Partial<Session>>({});

    const fetchSessions = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (selectedDriver !== "all") params.append("driver_id", selectedDriver);
            if (selectedTrack !== "all") params.append("track_id", selectedTrack);
            if (selectedKart !== "all") params.append("kart_id", selectedKart);

            const response = await api.get<Session[]>(`/api/sessions/?${params.toString()}`);
            setSessions(response.data);
        } catch (error) {
            console.error("Failed to fetch sessions", error);
        } finally {
            setLoading(false);
        }
    }, [selectedDriver, selectedTrack, selectedKart]);

    const loadMetadata = async () => {
        try {
            const [driversRes, tracksRes, kartsRes] = await Promise.all([
                api.get<Driver[]>("/api/drivers"),
                api.get<Track[]>("/api/tracks"),
                api.get<Kart[]>("/api/equipment/karts"),
            ]);
            setDrivers(driversRes.data);
            setTracks(tracksRes.data);
            setKarts(kartsRes.data);
        } catch (error) {
            console.error("Failed to load metadata", error);
        }
    };

    useEffect(() => {
        if (user) {
            loadMetadata();
        }
    }, [user]);

    useEffect(() => {
        if (user) {
            fetchSessions();
        }
    }, [user, fetchSessions]);

    const handleEditClick = (session: Session) => {
        setEditingSession(session);
        setEditFormData({
            driver_id: session.driver_id,
            track_id: session.track_id,
            kart_id: session.kart_id,
            session_date: session.session_date,
            session_type: session.session_type,
            weather_condition: session.weather_condition,
            engineer_notes: session.engineer_notes,
        });
        setIsEditOpen(true);
    };

    const handleSaveSession = async () => {
        if (!editingSession) return;
        setSaving(true);
        try {
            await api.put(`/api/sessions/${editingSession.id}`, editFormData);
            setIsEditOpen(false);
            fetchSessions();
        } catch (error) {
            console.error("Failed to update session", error);
            alert("Failed to update session");
        } finally {
            setSaving(false);
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

            fetchSessions();
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
        return drivers.find((d) => d.id === driverId)?.name || "Unknown Driver";
    };

    const getTrackName = (trackId: number) => {
        return tracks.find((t) => t.id === trackId)?.name || "Unknown Track";
    };

    const getKartName = (kartId?: number) => {
        if (!kartId) return "";
        const kart = karts.find((k) => k.id === kartId);
        return kart ? `${kart.chassis_make} ${kart.chassis_model}` : "Unknown Kart";
    };

    const clearFilters = () => {
        setSelectedDriver("all");
        setSelectedTrack("all");
        setSelectedKart("all");
    };

    if (!user) return null;

    return (
        <div className="py-10">
            <header>
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                    <h1 className="text-3xl font-bold leading-tight tracking-tight text-white">
                        Racing Sessions
                    </h1>
                </div>
            </header>
            <main>
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="px-4 py-8 sm:px-0">
                        {/* Filters */}
                        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-lg shadow mb-6 flex flex-wrap gap-4 items-end">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-300">Driver</label>
                                <Select value={selectedDriver} onValueChange={setSelectedDriver}>
                                    <SelectTrigger className="w-[200px] bg-zinc-950 border-zinc-700 text-white">
                                        <SelectValue placeholder="All Drivers" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Drivers</SelectItem>
                                        {drivers.map((d) => (
                                            <SelectItem key={d.id} value={d.id.toString()}>{d.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-300">Track</label>
                                <Select value={selectedTrack} onValueChange={setSelectedTrack}>
                                    <SelectTrigger className="w-[200px] bg-zinc-950 border-zinc-700 text-white">
                                        <SelectValue placeholder="All Tracks" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Tracks</SelectItem>
                                        {tracks.map((t) => (
                                            <SelectItem key={t.id} value={t.id.toString()}>{t.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-300">Kart</label>
                                <Select value={selectedKart} onValueChange={setSelectedKart}>
                                    <SelectTrigger className="w-[200px] bg-zinc-950 border-zinc-700 text-white">
                                        <SelectValue placeholder="All Karts" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Karts</SelectItem>
                                        {karts.map((k) => (
                                            <SelectItem key={k.id} value={k.id.toString()}>{k.chassis_make} {k.chassis_model}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" onClick={clearFilters} className="border-zinc-700 text-white hover:bg-zinc-800">
                                    <X className="h-4 w-4 mr-2" />
                                    Clear
                                </Button>
                                <Button onClick={() => fetchSessions()} disabled={loading} className="bg-white text-black hover:bg-zinc-200">
                                    <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                                    Refresh
                                </Button>
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex justify-center py-12">
                                <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
                            </div>
                        ) : sessions.length === 0 ? (
                            <div className="text-center py-12 bg-zinc-900 border border-zinc-800 rounded-lg shadow">
                                <p className="text-zinc-400">
                                    No sessions found matching your filters.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {sessions.map((session) => (
                                    <div
                                        key={session.id}
                                        className="bg-zinc-900 border border-zinc-800 shadow rounded-lg p-6 hover:shadow-md transition-shadow"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="flex items-center gap-3 mb-1">
                                                    <h3 className="text-lg font-semibold text-white">
                                                        {getTrackName(session.track_id)}
                                                    </h3>
                                                    {session.data_source === "telemetry_import" && (
                                                        <Badge variant="secondary" className="bg-blue-900/50 text-blue-200 border-blue-800">
                                                            Auto-created
                                                        </Badge>
                                                    )}
                                                </div>
                                                <div className="text-sm text-zinc-400 space-y-1">
                                                    <p>Driver: <span className="text-zinc-200">{getDriverName(session.driver_id)}</span></p>
                                                    <p>Kart: <span className="text-zinc-200">{getKartName(session.kart_id)}</span></p>
                                                    <p>{new Date(session.session_date).toLocaleDateString()} • {session.session_type || "Practice"}</p>
                                                </div>
                                            </div>
                                            <div className="text-right flex flex-col items-end gap-2">
                                                <Button variant="ghost" size="sm" onClick={() => handleEditClick(session)}>
                                                    <Pencil className="h-4 w-4 text-zinc-400 hover:text-white" />
                                                </Button>
                                                {session.best_lap_time_ms && (
                                                    <div>
                                                        <p className="text-sm text-zinc-400">Best Lap</p>
                                                        <p className="text-2xl font-bold text-blue-400 font-mono">
                                                            {formatLapTime(session.best_lap_time_ms)}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {session.best_lap_time_ms && session.average_lap_time_ms && (
                                            <div className="mt-4 grid grid-cols-3 gap-4 border-t border-zinc-800 pt-4">
                                                <div>
                                                    <p className="text-xs text-zinc-400">Average Lap</p>
                                                    <p className="text-lg font-semibold text-white font-mono">
                                                        {formatLapTime(session.average_lap_time_ms)}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-zinc-400">Total Laps</p>
                                                    <p className="text-lg font-semibold text-white">
                                                        {session.total_laps}
                                                    </p>
                                                </div>
                                                {session.weather_condition && (
                                                    <div>
                                                        <p className="text-xs text-zinc-400">Weather</p>
                                                        <p className="text-lg font-semibold text-white capitalize">
                                                            {session.weather_condition}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit Session</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label>Driver</Label>
                            <Select
                                value={editFormData.driver_id?.toString()}
                                onValueChange={(val) => setEditFormData({ ...editFormData, driver_id: parseInt(val) })}
                            >
                                <SelectTrigger className="bg-zinc-950 border-zinc-700 text-white">
                                    <SelectValue placeholder="Select Driver" />
                                </SelectTrigger>
                                <SelectContent>
                                    {drivers.map(d => (
                                        <SelectItem key={d.id} value={d.id.toString()}>{d.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Track</Label>
                            <Select
                                value={editFormData.track_id?.toString()}
                                onValueChange={(val) => setEditFormData({ ...editFormData, track_id: parseInt(val) })}
                            >
                                <SelectTrigger className="bg-zinc-950 border-zinc-700 text-white">
                                    <SelectValue placeholder="Select Track" />
                                </SelectTrigger>
                                <SelectContent>
                                    {tracks.map(t => (
                                        <SelectItem key={t.id} value={t.id.toString()}>{t.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Kart</Label>
                            <Select
                                value={editFormData.kart_id?.toString() || "none"}
                                onValueChange={(val) => setEditFormData({ ...editFormData, kart_id: val === "none" ? undefined : parseInt(val) })}
                            >
                                <SelectTrigger className="bg-zinc-950 border-zinc-700 text-white">
                                    <SelectValue placeholder="Select Kart" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">None</SelectItem>
                                    {karts.map(k => (
                                        <SelectItem key={k.id} value={k.id.toString()}>{k.chassis_make} {k.chassis_model}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Session Type</Label>
                            <Select
                                value={editFormData.session_type || "Practice"}
                                onValueChange={(val) => setEditFormData({ ...editFormData, session_type: val })}
                            >
                                <SelectTrigger className="bg-zinc-950 border-zinc-700 text-white">
                                    <SelectValue placeholder="Select Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Practice">Practice</SelectItem>
                                    <SelectItem value="Qualifying">Qualifying</SelectItem>
                                    <SelectItem value="Race">Race</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Date</Label>
                            <Input
                                type="datetime-local"
                                value={editFormData.session_date ? String(editFormData.session_date).slice(0, 16) : ""}
                                onChange={(e) => setEditFormData({ ...editFormData, session_date: e.target.value })}
                                className="bg-zinc-950 border-zinc-700 text-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Weather</Label>
                            <Input
                                value={editFormData.weather_condition || ""}
                                onChange={(e) => setEditFormData({ ...editFormData, weather_condition: e.target.value })}
                                className="bg-zinc-950 border-zinc-700 text-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Notes</Label>
                            <Textarea
                                value={editFormData.engineer_notes || ""}
                                onChange={(e) => setEditFormData({ ...editFormData, engineer_notes: e.target.value })}
                                className="bg-zinc-950 border-zinc-700 text-white"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditOpen(false)} className="border-zinc-700 text-white hover:bg-zinc-800">Cancel</Button>
                        <Button onClick={handleSaveSession} disabled={saving} className="bg-white text-black hover:bg-zinc-200">
                            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
