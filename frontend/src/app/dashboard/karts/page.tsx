"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import { kartsApi } from "@/lib/api";
import { Kart } from "@/types";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Car, Pencil, Trash2 } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function KartsPage() {
    const { user } = useAuth();
    const [karts, setKarts] = useState<Kart[]>([]);
    const [loading, setLoading] = useState(true);

    // Edit State
    const [editingKart, setEditingKart] = useState<Kart | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState<Partial<Kart>>({});

    const fetchKarts = useCallback(async () => {
        setLoading(true);
        try {
            const response = await kartsApi.getKarts();
            setKarts(response.data);
        } catch (error) {
            console.error("Failed to fetch karts", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (user) {
            fetchKarts();
        }
    }, [user, fetchKarts]);

    const handleAddClick = () => {
        setEditingKart(null);
        setFormData({});
        setIsDialogOpen(true);
    };

    const handleEditClick = (kart: Kart) => {
        setEditingKart(kart);
        setFormData({ ...kart });
        setIsDialogOpen(true);
    };

    const handleDeleteClick = async (kart: Kart) => {
        if (!confirm(`Are you sure you want to delete ${kart.name || "this kart"}?`)) return;
        try {
            await kartsApi.deleteKart(kart.id);
            fetchKarts();
        } catch (error) {
            console.error(error);
            alert("Failed to delete kart");
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            // Ensure team_id is set (though backend handles it usually, api.ts passed data)
            const payload = { ...formData, team_id: user?.team_id };

            if (editingKart) {
                await kartsApi.updateKart(editingKart.id, payload);
            } else {
                await kartsApi.createKart(payload);
            }
            setIsDialogOpen(false);
            fetchKarts();
        } catch (error) {
            console.error(error);
            alert("Failed to save kart");
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
                        Karts
                    </h1>
                    <Button onClick={handleAddClick} className="bg-white text-black hover:bg-zinc-200">
                        <Plus className="mr-2 h-4 w-4" /> Add Kart
                    </Button>
                </div>
            </header>
            <main>
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="px-4 py-8 sm:px-0">
                        {loading ? (
                            <div className="flex justify-center py-12">
                                <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
                            </div>
                        ) : karts.length === 0 ? (
                            <div className="text-center py-12 bg-zinc-900 border border-zinc-800 rounded-lg shadow">
                                <p className="text-zinc-400">No karts found. Add one to get started.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {karts.map((kart) => (
                                    <div
                                        key={kart.id}
                                        className="bg-zinc-900 border border-zinc-800 shadow rounded-lg p-6 hover:shadow-md transition-shadow flex flex-col justify-between"
                                    >
                                        <div>
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h3 className="text-lg font-semibold text-white">{kart.name}</h3>
                                                    <div className="flex items-center text-sm text-zinc-400 mt-1">
                                                        <Car className="h-3 w-3 mr-1" />
                                                        #{kart.number || "?"}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-1 mb-4 text-sm text-zinc-400">
                                                <p>Chassis: <span className="text-zinc-200">{kart.chassis_make || "-"} {kart.chassis_model}</span></p>
                                                <p>Year: <span className="text-zinc-200">{kart.year || "-"}</span></p>
                                            </div>
                                        </div>

                                        <div className="flex justify-end gap-2 border-t border-zinc-800 pt-4 mt-2">
                                            <Button variant="ghost" size="sm" onClick={() => handleEditClick(kart)}>
                                                <Pencil className="h-4 w-4 text-zinc-400 hover:text-white" />
                                            </Button>
                                            <Button variant="ghost" size="sm" onClick={() => handleDeleteClick(kart)}>
                                                <Trash2 className="h-4 w-4 text-zinc-400 hover:text-red-400" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
                    <DialogHeader>
                        <DialogTitle>{editingKart ? "Edit Kart" : "Add Kart"}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label>Name (Nickname)</Label>
                            <Input
                                value={formData.name || ""}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="bg-zinc-950 border-zinc-700 text-white"
                                placeholder="My Race Kart"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Kart Number</Label>
                            <Input
                                value={formData.number || ""}
                                onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                                className="bg-zinc-950 border-zinc-700 text-white"
                                placeholder="12"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Chassis Make</Label>
                                <Input
                                    value={formData.chassis_make || ""}
                                    onChange={(e) => setFormData({ ...formData, chassis_make: e.target.value })}
                                    className="bg-zinc-950 border-zinc-700 text-white"
                                    placeholder="Tony Kart"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Chassis Model</Label>
                                <Input
                                    value={formData.chassis_model || ""}
                                    onChange={(e) => setFormData({ ...formData, chassis_model: e.target.value })}
                                    className="bg-zinc-950 border-zinc-700 text-white"
                                    placeholder="Racer 401"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Year</Label>
                            <Input
                                type="number"
                                value={formData.year || ""}
                                onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                                className="bg-zinc-950 border-zinc-700 text-white"
                                placeholder="2024"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="border-zinc-700 text-white hover:bg-zinc-800">
                            Cancel
                        </Button>
                        <Button onClick={handleSave} disabled={saving} className="bg-white text-black hover:bg-zinc-200">
                            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
