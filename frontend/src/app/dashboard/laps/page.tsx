'use client';

import { useEffect, useState } from 'react';
import { Timer, Upload, ChevronDown, ChevronUp, Filter, RefreshCw } from 'lucide-react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import TelemetryUploader from '@/components/TelemetryUploader';

interface Lap {
    id: number;
    driver_name: string;
    track_name: string;
    car_name: string;
    lap_time_ms: number;
    lap_number: number;
    sector1_ms?: number;
    sector2_ms?: number;
    sector3_ms?: number;
    valid: boolean;
    weather?: string;
    track_temp_c?: number;
    air_temp_c?: number;
    tire_compound?: string;
    event_type?: string;
    recorded_at?: string;
    imported_at: string;
}

export default function LapsPage() {
    const [laps, setLaps] = useState<Lap[]>([]);
    const [loading, setLoading] = useState(true);
    const [showUploader, setShowUploader] = useState(false);
    const [validOnly, setValidOnly] = useState(false);
    const [sortBy, setSortBy] = useState<'time' | 'date'>('date');
    const [sortAsc, setSortAsc] = useState(false);

    const fetchLaps = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (validOnly) params.append('valid_only', 'true');

            const response = await api.get<Lap[]>(`/api/laps/?${params.toString()}`);
            setLaps(response.data);
        } catch (error) {
            console.error('Failed to fetch laps:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLaps();
    }, [validOnly]);

    const formatLapTime = (ms: number) => {
        const minutes = Math.floor(ms / 60000);
        const seconds = Math.floor((ms % 60000) / 1000);
        const milliseconds = ms % 1000;
        if (minutes > 0) {
            return `${minutes}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
        }
        return `${seconds}.${milliseconds.toString().padStart(3, '0')}`;
    };

    const formatSectorTime = (ms?: number) => {
        if (!ms) return '-';
        const seconds = Math.floor(ms / 1000);
        const milliseconds = ms % 1000;
        return `${seconds}.${milliseconds.toString().padStart(3, '0')}`;
    };

    const sortedLaps = [...laps].sort((a, b) => {
        if (sortBy === 'time') {
            return sortAsc ? a.lap_time_ms - b.lap_time_ms : b.lap_time_ms - a.lap_time_ms;
        }
        const dateA = new Date(a.recorded_at || a.imported_at).getTime();
        const dateB = new Date(b.recorded_at || b.imported_at).getTime();
        return sortAsc ? dateA - dateB : dateB - dateA;
    });

    const bestLap = laps.filter(l => l.valid).reduce((best, lap) =>
        !best || lap.lap_time_ms < best.lap_time_ms ? lap : best, null as Lap | null
    );

    return (
        <div className="min-h-screen bg-zinc-950 text-white p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold">Lap Times</h1>
                        <p className="text-zinc-400">
                            {laps.length} lap{laps.length !== 1 ? 's' : ''} imported
                            {bestLap && (
                                <span className="ml-2 text-green-400">
                                    Best: {formatLapTime(bestLap.lap_time_ms)}
                                </span>
                            )}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={fetchLaps} disabled={loading}>
                            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                        <Button
                            onClick={() => setShowUploader(!showUploader)}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            <Upload className="h-4 w-4 mr-2" />
                            Import Telemetry
                        </Button>
                    </div>
                </div>

                {/* Uploader */}
                {showUploader && (
                    <div className="mb-6 bg-zinc-900/50 rounded-lg p-6 border border-zinc-800">
                        <h2 className="text-lg font-semibold mb-4">Import Telemetry Files</h2>
                        <TelemetryUploader onUploadComplete={() => {
                            fetchLaps();
                            setShowUploader(false);
                        }} />
                    </div>
                )}

                {/* Filters */}
                <div className="flex gap-4 mb-4">
                    <Button
                        variant={validOnly ? "default" : "outline"}
                        size="sm"
                        onClick={() => setValidOnly(!validOnly)}
                    >
                        <Filter className="h-4 w-4 mr-2" />
                        Valid laps only
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            if (sortBy === 'time') setSortAsc(!sortAsc);
                            else setSortBy('time');
                        }}
                    >
                        Sort by time
                        {sortBy === 'time' && (sortAsc ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />)}
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            if (sortBy === 'date') setSortAsc(!sortAsc);
                            else setSortBy('date');
                        }}
                    >
                        Sort by date
                        {sortBy === 'date' && (sortAsc ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />)}
                    </Button>
                </div>

                {/* Laps table */}
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <RefreshCw className="h-8 w-8 animate-spin text-zinc-500" />
                    </div>
                ) : laps.length === 0 ? (
                    <div className="text-center py-12 bg-zinc-900/50 rounded-lg border border-zinc-800">
                        <Timer className="h-12 w-12 mx-auto text-zinc-600 mb-4" />
                        <h3 className="text-lg font-medium text-zinc-300">No laps imported yet</h3>
                        <p className="text-zinc-500 mt-1">Upload telemetry files to see your lap times</p>
                        <Button
                            onClick={() => setShowUploader(true)}
                            className="mt-4 bg-red-600 hover:bg-red-700"
                        >
                            <Upload className="h-4 w-4 mr-2" />
                            Import Telemetry
                        </Button>
                    </div>
                ) : (
                    <div className="bg-zinc-900/50 rounded-lg border border-zinc-800 overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-zinc-800/50">
                                <tr className="text-left text-sm text-zinc-400">
                                    <th className="px-4 py-3 font-medium">Lap Time</th>
                                    <th className="px-4 py-3 font-medium">S1</th>
                                    <th className="px-4 py-3 font-medium">S2</th>
                                    <th className="px-4 py-3 font-medium">S3</th>
                                    <th className="px-4 py-3 font-medium">Driver</th>
                                    <th className="px-4 py-3 font-medium">Track</th>
                                    <th className="px-4 py-3 font-medium">Conditions</th>
                                    <th className="px-4 py-3 font-medium">Event</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800">
                                {sortedLaps.map((lap) => (
                                    <tr
                                        key={lap.id}
                                        className={`hover:bg-zinc-800/30 transition-colors ${!lap.valid ? 'opacity-50' : ''}`}
                                    >
                                        <td className="px-4 py-3">
                                            <span className={`font-mono text-lg ${lap.id === bestLap?.id ? 'text-green-400' : 'text-white'}`}>
                                                {formatLapTime(lap.lap_time_ms)}
                                            </span>
                                            {lap.id === bestLap?.id && (
                                                <span className="ml-2 text-xs bg-green-600/20 text-green-400 px-2 py-0.5 rounded">BEST</span>
                                            )}
                                            {!lap.valid && (
                                                <span className="ml-2 text-xs bg-yellow-600/20 text-yellow-400 px-2 py-0.5 rounded">INVALID</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 font-mono text-sm text-zinc-400">{formatSectorTime(lap.sector1_ms)}</td>
                                        <td className="px-4 py-3 font-mono text-sm text-zinc-400">{formatSectorTime(lap.sector2_ms)}</td>
                                        <td className="px-4 py-3 font-mono text-sm text-zinc-400">{formatSectorTime(lap.sector3_ms)}</td>
                                        <td className="px-4 py-3 text-zinc-300">{lap.driver_name}</td>
                                        <td className="px-4 py-3 text-zinc-300 max-w-xs truncate" title={lap.track_name}>{lap.track_name}</td>
                                        <td className="px-4 py-3 text-sm text-zinc-400">
                                            {lap.weather && <span>{lap.weather}</span>}
                                            {lap.track_temp_c && <span className="ml-2">Track: {lap.track_temp_c.toFixed(0)}°C</span>}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-zinc-500">{lap.event_type}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
