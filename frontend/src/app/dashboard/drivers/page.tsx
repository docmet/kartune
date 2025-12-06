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
import { Separator } from "@/components/ui/separator";
import { Pencil, Loader2 } from "lucide-react";

interface BioMetricsData {
    resting_hr?: number;
    max_hr?: number;
    vo2_max?: number;
    blood_type?: string;
    allergies?: string;
    dominant_hand?: string;
    neck_circumference_cm?: number;
}

export default function DriversPage() {
    const { user } = useAuth();
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [saving, setSaving] = useState(false);

    // Form state
    const [formData, setFormData] = useState<Partial<Driver>>({});
    const [bioMetrics, setBioMetrics] = useState<BioMetricsData>({});

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

        // Parse bio metrics or default to empty
        const bm = driver.bio_metrics || {};
        setBioMetrics({
            resting_hr: bm.resting_hr,
            max_hr: bm.max_hr,
            vo2_max: bm.vo2_max,
            blood_type: bm.blood_type,
            allergies: bm.allergies,
            dominant_hand: bm.dominant_hand,
            neck_circumference_cm: bm.neck_circumference_cm,
        });

        setIsDialogOpen(true);
    };

    const handleSave = async () => {
        if (!editingDriver) return;

        setSaving(true);
        try {
            const updateData = {
                ...formData,
                bio_metrics: bioMetrics,
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

    const calculateAge = (dobString?: string) => {
        if (!dobString) return "-";
        const today = new Date();
        const birthDate = new Date(dobString);
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

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
                                            <TableHead className="text-zinc-400">Age</TableHead>
                                            <TableHead className="text-zinc-400">Gender</TableHead>
                                            <TableHead className="text-zinc-400">Physical (H/W)</TableHead>
                                            <TableHead className="text-zinc-400">Strength</TableHead>
                                            <TableHead className="text-right text-zinc-400">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {drivers.map((driver) => {
                                            return (
                                                <TableRow key={driver.id} className="border-zinc-800 hover:bg-zinc-800/50">
                                                    <TableCell className="font-medium text-white">{driver.name}</TableCell>
                                                    <TableCell className="text-zinc-300">
                                                        {calculateAge(driver.date_of_birth)}
                                                    </TableCell>
                                                    <TableCell className="text-zinc-300">
                                                        {driver.gender || "-"}
                                                    </TableCell>
                                                    <TableCell className="text-zinc-300">
                                                        {driver.height_cm ? `${driver.height_cm}cm` : "?"} / {driver.weight_kg ? `${driver.weight_kg}kg` : "?"}
                                                    </TableCell>
                                                    <TableCell className="text-zinc-300">
                                                        {driver.physical_strength !== undefined && driver.physical_strength !== null
                                                            ? driver.physical_strength
                                                            : "-"}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <Button variant="ghost" size="sm" onClick={() => handleEditClick(driver)}>
                                                            <Pencil className="h-4 w-4 text-zinc-400 hover:text-white" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="bg-zinc-900 border-zinc-800 text-white sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-xl">Edit Driver Profile</DialogTitle>
                    </DialogHeader>

                    <div className="grid gap-6 py-4">
                        {/* Personal Details Section */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Personal Details</h3>
                            <div className="grid gap-4">
                                <div className="space-y-2">
                                    <Label>Full Name</Label>
                                    <Input
                                        value={formData.name || ""}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="bg-zinc-950 border-zinc-700 text-white"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Date of Birth</Label>
                                        <Input
                                            type="date"
                                            value={formData.date_of_birth ? String(formData.date_of_birth).split('T')[0] : ""}
                                            onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                                            className="bg-zinc-950 border-zinc-700 text-white"
                                        />
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
                            </div>
                        </div>

                        <Separator className="bg-zinc-800" />

                        {/* Bio Metrics Section */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Bio Metrics & Health</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Resting Heart Rate (bpm)</Label>
                                    <Input
                                        type="number"
                                        value={bioMetrics.resting_hr || ""}
                                        onChange={(e) => setBioMetrics({ ...bioMetrics, resting_hr: parseInt(e.target.value) || undefined })}
                                        className="bg-zinc-950 border-zinc-700 text-white"
                                        placeholder="e.g. 60"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Max Heart Rate (bpm)</Label>
                                    <Input
                                        type="number"
                                        value={bioMetrics.max_hr || ""}
                                        onChange={(e) => setBioMetrics({ ...bioMetrics, max_hr: parseInt(e.target.value) || undefined })}
                                        className="bg-zinc-950 border-zinc-700 text-white"
                                        placeholder="e.g. 190"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>VO2 Max (ml/kg/min)</Label>
                                    <Input
                                        type="number"
                                        value={bioMetrics.vo2_max || ""}
                                        onChange={(e) => setBioMetrics({ ...bioMetrics, vo2_max: parseFloat(e.target.value) || undefined })}
                                        className="bg-zinc-950 border-zinc-700 text-white"
                                        placeholder="e.g. 55.5"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Physical Strength Score (0-100)</Label>
                                    <Input
                                        type="number"
                                        value={formData.physical_strength || ""}
                                        onChange={(e) => setFormData({ ...formData, physical_strength: parseInt(e.target.value) || undefined })}
                                        className="bg-zinc-950 border-zinc-700 text-white"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Blood Type</Label>
                                    <Select
                                        value={bioMetrics.blood_type || ""}
                                        onValueChange={(val: string) => setBioMetrics({ ...bioMetrics, blood_type: val })}
                                    >
                                        <SelectTrigger className="bg-zinc-950 border-zinc-700 text-white">
                                            <SelectValue placeholder="Select Type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(type => (
                                                <SelectItem key={type} value={type}>{type}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Neck Circumference (cm)</Label>
                                    <Input
                                        type="number"
                                        step="0.1"
                                        value={bioMetrics.neck_circumference_cm || ""}
                                        onChange={(e) => setBioMetrics({ ...bioMetrics, neck_circumference_cm: parseFloat(e.target.value) || undefined })}
                                        className="bg-zinc-950 border-zinc-700 text-white"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Allergies / Medical Notes</Label>
                                <Input
                                    value={bioMetrics.allergies || ""}
                                    onChange={(e) => setBioMetrics({ ...bioMetrics, allergies: e.target.value })}
                                    className="bg-zinc-950 border-zinc-700 text-white"
                                    placeholder="e.g. Peanuts, Penicillin"
                                />
                            </div>
                        </div>

                        <Separator className="bg-zinc-800" />

                        {/* Notes Section */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Additional Information</h3>
                            <div className="space-y-2">
                                <Label>General Notes</Label>
                                <Textarea
                                    value={formData.notes || ""}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    className="bg-zinc-950 border-zinc-700 text-white h-24"
                                />
                            </div>
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
