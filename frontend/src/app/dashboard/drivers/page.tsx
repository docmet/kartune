"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import api from "@/lib/api";
import { Driver } from "@/types";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Pencil, Loader2 } from "lucide-react";

export default function DriversPage() {
    const { user } = useAuth();
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [saving, setSaving] = useState(false);

    // Form state
    const [formData, setFormData] = useState<Partial<Driver>>({});
    const [bioMetricsJson, setBioMetricsJson] = useState("");

    useEffect(() => {
        if (user) {
            fetchDrivers();
        }
    }, [user]);

    const fetchDrivers = async () => {
        setLoading(true);
        try {
            const response = await api.get<Driver[]>("/api/drivers");
            setDrivers(response.data);
        } catch (error) {
            console.error("Failed to fetch drivers", error);
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = (driver: Driver) => {
        setEditingDriver(driver);
        setFormData({
            name: driver.name,
            date_of_birth: driver.date_of_birth,
            weight_kg: driver.weight_kg,
            height_cm: driver.height_cm,
            gender: driver.gender,
            physical_strength: driver.physical_strength,
            notes: driver.notes,
        });
        setBioMetricsJson(JSON.stringify(driver.bio_metrics || {}, null, 2));
        setIsDialogOpen(true);
    };

    const handleSave = async () => {
        if (!editingDriver) return;

        setSaving(true);
        try {
            let parsedBioMetrics = {};
            try {
                parsedBioMetrics = JSON.parse(bioMetricsJson);
            } catch (e) {
                alert("Invalid JSON for Bio Metrics");
                setSaving(false);
                return;
            }

            const updateData = {
                ...formData,
                bio_metrics: parsedBioMetrics,
            };

            await api.put<Driver>(`/api/drivers/${editingDriver.id}`, updateData);

            setIsDialogOpen(false);
            fetchDrivers();
        } catch (error) {
            console.error("Failed to update driver", error);
            alert("Failed to update driver");
        } finally {
            setSaving(false);
        }
    };

    if (!user) return null;

    return (
        <div className="py-10">
            <header>
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                    <h1 className="text-3xl font-bold leading-tight tracking-tight text-white">
                        Drivers Management
                    </h1>
                </div>
            </header>
            <main>
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="px-4 py-8 sm:px-0">
                        {loading ? (
                            <div className="flex justify-center py-12">
                                <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
                            </div>
                        ) : (
                            <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="border-zinc-800 hover:bg-zinc-900/50">
                                            <TableHead className="text-zinc-400">Name</TableHead>
                                            <TableHead className="text-zinc-400">Strength (1-100)</TableHead>
                                            <TableHead className="text-zinc-400">Bio Metrics</TableHead>
                                            <TableHead className="text-zinc-400">Notes</TableHead>
                                            <TableHead className="text-right text-zinc-400">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {drivers.map((driver) => (
                                            <TableRow key={driver.id} className="border-zinc-800 hover:bg-zinc-800/50">
                                                <TableCell className="font-medium text-white">{driver.name}</TableCell>
                                                <TableCell className="text-zinc-300">
                                                    {driver.physical_strength !== undefined && driver.physical_strength !== null
                                                        ? driver.physical_strength
                                                        : "-"}
                                                </TableCell>
                                                <TableCell className="text-zinc-300 font-mono text-xs max-w-xs truncate">
                                                    {driver.bio_metrics ? JSON.stringify(driver.bio_metrics) : "-"}
                                                </TableCell>
                                                <TableCell className="text-zinc-300 max-w-xs truncate">{driver.notes || "-"}</TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="ghost" size="sm" onClick={() => handleEditClick(driver)}>
                                                        <Pencil className="h-4 w-4 text-zinc-400 hover:text-white" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
                    <DialogHeader>
                        <DialogTitle>Edit Driver: {editingDriver?.name}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4 max-h-[600px] overflow-y-auto">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Name</Label>
                                <Input
                                    value={formData.name || ""}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="bg-zinc-950 border-zinc-700 text-white"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Date of Birth</Label>
                                <Input
                                    type="date"
                                    value={formData.date_of_birth ? String(formData.date_of_birth).split('T')[0] : ""}
                                    onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                                    className="bg-zinc-950 border-zinc-700 text-white"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Weight (kg)</Label>
                                <Input
                                    type="number"
                                    step="0.1"
                                    value={formData.weight_kg || ""}
                                    onChange={(e) => setFormData({ ...formData, weight_kg: parseFloat(e.target.value) || undefined })}
                                    className="bg-zinc-950 border-zinc-700 text-white"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Height (cm)</Label>
                                <Input
                                    type="number"
                                    value={formData.height_cm || ""}
                                    onChange={(e) => setFormData({ ...formData, height_cm: parseFloat(e.target.value) || undefined })}
                                    className="bg-zinc-950 border-zinc-700 text-white"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Gender</Label>
                            <Select
                                value={formData.gender || ""}
                                onValueChange={(val: string) => setFormData({ ...formData, gender: val })}
                            >
                                <SelectTrigger className="bg-zinc-950 border-zinc-700 text-white">
                                    <SelectValue placeholder="Select Gender" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="M">Male</SelectItem>
                                    <SelectItem value="F">Female</SelectItem>
                                    <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Physical Strength (0-100)</Label>
                            <Input
                                type="number"
                                value={formData.physical_strength || ""}
                                onChange={(e) => setFormData({ ...formData, physical_strength: parseInt(e.target.value) || undefined })}
                                className="bg-zinc-950 border-zinc-700 text-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Bio Metrics (JSON)</Label>
                            <Textarea
                                value={bioMetricsJson}
                                onChange={(e) => setBioMetricsJson(e.target.value)}
                                className="bg-zinc-950 border-zinc-700 text-white font-mono h-32"
                                placeholder='{"resting_hr": 60, "vo2_max": 55}'
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Notes</Label>
                            <Textarea
                                value={formData.notes || ""}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                className="bg-zinc-950 border-zinc-700 text-white"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="border-zinc-700 text-white hover:bg-zinc-800">
                            Cancel
                        </Button>
                        <Button onClick={handleSave} disabled={saving} className="bg-white text-black hover:bg-zinc-200">
                            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
