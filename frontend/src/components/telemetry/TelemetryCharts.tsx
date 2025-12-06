"use client";

import React, { useMemo } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    AreaChart,
    Area,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TelemetryDataPoint } from "@/types";

export interface TelemetrySeries {
    lapId: number;
    lapNumber: number;
    color: string;
    data: TelemetryDataPoint[];
}

interface TelemetryChartsProps {
    series: TelemetrySeries[];
}

// Helper to resample and merge data
const processData = (seriesList: TelemetrySeries[]) => {
    if (seriesList.length === 0) return [];

    // Find min and max distance
    // We'll resample to a fixed grid (e.g. every 5 meters) to ensure smooth comparison
    const maxDist = Math.max(...seriesList.map(s => s.data[s.data.length - 1]?.distance_m || 0));
    const step = 5; // meters
    const steps = Math.ceil(maxDist / step);

    const merged = [];
    for (let i = 0; i <= steps; i++) {
        const d = i * step;
        const point: any = { distance: d };

        seriesList.forEach(s => {
            // Simple nearest neighbor or interpolation. 
            // We'll assume data is sorted by distance.
            // Find closest point
            // For now, simple find (inefficient for large data, but optimized later)
            // Ideally we iterate through data.
            // Let's use simple lookup for now.
            const p = s.data.find(dp => dp.distance_m >= d);
            // This is O(N*M), bad. 
            // Better: Interpolate.
        });
        // merged.push(point);
    }

    // Improved Logic:
    // Just combine all points and sort? No, tooltips won't align.

    // Efficient Resampling:
    // Create cursors for each series.

    const result = [];
    for (let d = 0; d <= maxDist; d += step) {
        const row: any = { distance: d };
        seriesList.forEach(s => {
            // Find value at distance 'd'
            // Linear interpolation
            // Optimization: keep track of last index

            // For implementation speed/simplicity now, we might accept some jitter or use a library.
            // But let's write a simple linear interpolator.
            const val = interpolateValues(s.data, d);
            if (val) {
                row[`speed_${s.lapId}`] = val.speed_kmh;
                row[`rpm_${s.lapId}`] = val.rpm;
                row[`throttle_${s.lapId}`] = val.throttle_pct;
                row[`brake_${s.lapId}`] = val.brake_pct;
            }
        });
        result.push(row);
    }
    return result;
};

const interpolateValues = (data: TelemetryDataPoint[], targetDist: number) => {
    // Binary search or assumption of order
    // Assume sorted.
    if (!data.length) return null;
    if (targetDist <= data[0].distance_m) return data[0];
    if (targetDist >= data[data.length - 1].distance_m) return data[data.length - 1];

    // Find indices
    // Naive linear search from start (optimize later with binary)
    // Since we call this sequentially, we could cache index. But here stateless.
    const idx = data.findIndex(p => p.distance_m >= targetDist);
    if (idx === -1) return null;

    const p2 = data[idx];
    const p1 = data[idx - 1];

    const ratio = (targetDist - p1.distance_m) / (p2.distance_m - p1.distance_m);

    return {
        speed_kmh: p1.speed_kmh + (p2.speed_kmh - p1.speed_kmh) * ratio,
        rpm: p1.rpm + (p2.rpm - p1.rpm) * ratio,
        throttle_pct: p1.throttle_pct + (p2.throttle_pct - p1.throttle_pct) * ratio,
        brake_pct: p1.brake_pct + (p2.brake_pct - p1.brake_pct) * ratio,
    };
}


export function TelemetryCharts({ series }: TelemetryChartsProps) {
    const data = useMemo(() => processData(series), [series]);

    if (!series.length) return <div className="text-zinc-500">No telemetry data available</div>;

    return (
        <div className="space-y-6">
            <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                    <CardTitle className="text-white text-sm uppercase tracking-wider">Speed Trace</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data} syncId="telemetry">
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                            <XAxis dataKey="distance" type="number" stroke="#666" domain={['dataMin', 'dataMax']} unit="m" />
                            <YAxis stroke="#666" unit=" km/h" />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46' }}
                                itemStyle={{ color: '#fff' }}
                            />
                            <Legend />
                            {series.map(s => (
                                <Line
                                    key={s.lapId}
                                    type="monotone"
                                    dataKey={`speed_${s.lapId}`}
                                    stroke={s.color}
                                    name={`Lap ${s.lapNumber}`}
                                    dot={false}
                                    strokeWidth={2}
                                />
                            ))}
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                    <CardTitle className="text-white text-sm uppercase tracking-wider">RPM Trace</CardTitle>
                </CardHeader>
                <CardContent className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data} syncId="telemetry">
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                            <XAxis dataKey="distance" type="number" stroke="#666" unit="m" />
                            <YAxis stroke="#666" />
                            <Tooltip contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46' }} />
                            {series.map(s => (
                                <Line
                                    key={s.lapId}
                                    type="monotone"
                                    dataKey={`rpm_${s.lapId}`}
                                    stroke={s.color}
                                    name={`Lap ${s.lapNumber}`}
                                    dot={false}
                                />
                            ))}
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                    <CardTitle className="text-white text-sm uppercase tracking-wider">Inputs (Throttle/Brake)</CardTitle>
                </CardHeader>
                <CardContent className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data} syncId="telemetry">
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                            <XAxis dataKey="distance" type="number" stroke="#666" unit="m" />
                            <YAxis stroke="#666" domain={[0, 100]} />
                            <Tooltip contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46' }} />
                            {series.map(s => (
                                <React.Fragment key={s.lapId}>
                                    <Line
                                        type="monotone"
                                        dataKey={`throttle_${s.lapId}`}
                                        stroke={s.color}
                                        strokeDasharray="5 5"
                                        name={`Lap ${s.lapNumber} Throttle`}
                                        dot={false}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey={`brake_${s.lapId}`}
                                        stroke={s.color}
                                        strokeDasharray="2 2"
                                        name={`Lap ${s.lapNumber} Brake`}
                                        dot={false}
                                    />
                                </React.Fragment>
                            ))}
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    );
}
