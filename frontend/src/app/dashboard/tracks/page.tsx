"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import { tracksApi } from "@/lib/api";
import { Track } from "@/types";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, MapPin, Ruler, Pencil, Trash2 } from "lucide-react";
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

export default function TracksPage() {
    const { user } = useAuth();
    const [tracks, setTracks] = useState<Track[]>([]);
    const [loading, setLoading] = useState(true);

    // Edit State
    const [editingTrack, setEditingTrack] = useState<Track | null>(null); // Null means creating new
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState<Partial<Track>>({});

    const fetchTracks = useCallback(async () => {
        setLoading(true);
        try {
            const response = await tracksApi.getTracks();
            setTracks(response.data);
        } catch (error) {
            console.error("Failed to fetch tracks", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (user) {
            fetchTracks();
        }
    }, [user, fetchTracks]);

    const handleAddClick = () => {
        setEditingTrack(null);
        setFormData({});
        setIsDialogOpen(true);
    };

    const handleEditClick = (track: Track) => {
        setEditingTrack(track);
        setFormData({ ...track });
        setIsDialogOpen(true);
    };

    const handleDeleteClick = async (track: Track) => {
        if (!confirm(`Are you sure you want to delete ${track.name}?`)) return;
        try {
            await tracksApi.deleteTrack(track.id);
            fetchTracks();
        } catch (error) {
            console.error(error);
            alert("Failed to delete track");
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            if (editingTrack) {
                await tracksApi.updateTrack(editingTrack.id, formData);
            } else {
                await tracksApi.createTrack(formData);
            }
            setIsDialogOpen(false);
            fetchTracks();
        } catch (error) {
            console.error(error);
            alert("Failed to save track");
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
                        Tracks
                    </h1>
                    <Button onClick={handleAddClick} className="bg-white text-black hover:bg-zinc-200">
                        <Plus className="mr-2 h-4 w-4" /> Add Track
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
                        ) : tracks.length === 0 ? (
                            <div className="text-center py-12 bg-zinc-900 border border-zinc-800 rounded-lg shadow">
                                <p className="text-zinc-400">No tracks found. Add one to get started.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {tracks.map((track) => (
                                    <div
                                        key={track.id}
                                        className="bg-zinc-900 border border-zinc-800 shadow rounded-lg p-6 hover:shadow-md transition-shadow flex flex-col justify-between"
                                    >
                                        <div>
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h3 className="text-lg font-semibold text-white">{track.name}</h3>
                                                    {track.location && (
                                                        <div className="flex items-center text-sm text-zinc-400 mt-1">
                                                            <MapPin className="h-3 w-3 mr-1" />
                                                            {track.location}, {track.country}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="space-y-2 mb-4">
                                                {track.length_meters && (
                                                    <div className="flex items-center text-sm text-zinc-300">
                                                        <Ruler className="h-4 w-4 mr-2 text-zinc-500" />
                                                        {track.length_meters}m
                                                    </div>
                                                )}
                                                {track.notes && (
                                                    <p className="text-sm text-zinc-500 line-clamp-2">{track.notes}</p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex justify-end gap-2 border-t border-zinc-800 pt-4 mt-2">
                                            <Button variant="ghost" size="sm" onClick={() => handleEditClick(track)}>
                                                <Pencil className="h-4 w-4 text-zinc-400 hover:text-white" />
                                            </Button>
                                            <Button variant="ghost" size="sm" onClick={() => handleDeleteClick(track)}>
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
                        <DialogTitle>{editingTrack ? "Edit Track" : "Add Track"}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label>Name</Label>
                            <Input
                                value={formData.name || ""}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="bg-zinc-950 border-zinc-700 text-white"
                                placeholder="Silverstone"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Location</Label>
                                <Input
                                    value={formData.location || ""}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    className="bg-zinc-950 border-zinc-700 text-white"
                                    placeholder="Towcester"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Country</Label>
                                <Input
                                    value={formData.country || ""}
                                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                    className="bg-zinc-950 border-zinc-700 text-white"
                                    placeholder="UK"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Length (meters)</Label>
                            <Input
                                type="number"
                                value={formData.length_meters || ""}
                                onChange={(e) => setFormData({ ...formData, length_meters: parseInt(e.target.value) })}
                                className="bg-zinc-950 border-zinc-700 text-white"
                                placeholder="5891"
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
                            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
