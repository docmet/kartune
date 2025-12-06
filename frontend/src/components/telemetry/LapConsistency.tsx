"use client";

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lap } from "@/types";

interface LapConsistencyProps {
    laps: Lap[];
    selectedLapIds: number[];
    onLapToggle: (id: number) => void;
}

export function LapConsistency({ laps, selectedLapIds, onLapToggle }: LapConsistencyProps) {
    const data = laps
        .filter(l => l.valid && l.lap_time_ms > 0)
        .map(l => ({
            id: l.id,
            lapNumber: l.lap_number,
            time: l.lap_time_ms / 1000,
            selected: selectedLapIds.includes(l.id),
        }));

    // Find min/max for Y axis domain to zoom in on consistency
    const times = data.map(d => d.time);
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);
    const domain = [minTime * 0.98, maxTime * 1.02]; // Tight zoom

    return (
        <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
                <CardTitle className="text-white text-sm uppercase tracking-wider">Lap Consistency</CardTitle>
            </CardHeader>
            <CardContent className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                        <XAxis dataKey="lapNumber" stroke="#666" />
                        <YAxis domain={domain} stroke="#666" hide />
                        <Tooltip
                            cursor={{ fill: '#3f3f46', opacity: 0.4 }}
                            contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', color: '#fff' }}
                            itemStyle={{ color: '#fff' }}
                            labelStyle={{ color: '#a1a1aa' }}
                            formatter={(val: number) => [val.toFixed(3) + 's', "Lap Time"]}
                            labelFormatter={(label) => `Lap ${label}`}
                        />
                        <Bar dataKey="time" onClick={(d) => onLapToggle(d.id)} cursor="pointer">
                            {data.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={entry.selected ? "#3b82f6" : "#71717a"}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
