'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';

interface UploadedLap {
    id: number;
    driver_name: string;
    track_name: string;
    car_name: string;
    lap_time_ms: number;
    lap_number: number;
    valid: boolean;
    weather?: string;
    sector1_ms?: number;
    sector2_ms?: number;
    sector3_ms?: number;
}

interface UploadResponse {
    uploaded: number;
    laps: UploadedLap[];
    errors: string[];
    created_drivers: string[];
    created_tracks: string[];
    created_karts: string[];
}

interface TelemetryUploaderProps {
    onUploadComplete?: (response: UploadResponse) => void;
}

export default function TelemetryUploader({ onUploadComplete }: TelemetryUploaderProps) {
    const [files, setFiles] = useState<File[]>([]);
    const [uploading, setUploading] = useState(false);
    const [uploadResult, setUploadResult] = useState<UploadResponse | null>(null);
    const [error, setError] = useState<string | null>(null);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        setFiles(prev => [...prev, ...acceptedFiles]);
        setUploadResult(null);
        setError(null);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'text/csv': ['.csv'],
        },
        multiple: true,
    });

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const clearAll = () => {
        setFiles([]);
        setUploadResult(null);
        setError(null);
    };

    const formatLapTime = (ms: number) => {
        const minutes = Math.floor(ms / 60000);
        const seconds = Math.floor((ms % 60000) / 1000);
        const milliseconds = ms % 1000;
        if (minutes > 0) {
            return `${minutes}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
        }
        return `${seconds}.${milliseconds.toString().padStart(3, '0')}`;
    };

    const uploadFiles = async () => {
        if (files.length === 0) return;

        setUploading(true);
        setError(null);

        const formData = new FormData();
        files.forEach((file) => {
            formData.append('files', file);
        });

        try {
            const response = await api.post<UploadResponse>('/api/laps/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            setUploadResult(response.data);
            setFiles([]);
            onUploadComplete?.(response.data);
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Upload failed. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="space-y-4">
            {/* Dropzone */}
            <div
                {...getRootProps()}
                className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all
          ${isDragActive
                        ? 'border-red-500 bg-red-500/10'
                        : 'border-zinc-700 hover:border-zinc-500 bg-zinc-900/50'
                    }
        `}
            >
                <input {...getInputProps()} />
                <Upload className={`mx-auto h-12 w-12 mb-4 ${isDragActive ? 'text-red-500' : 'text-zinc-500'}`} />
                {isDragActive ? (
                    <p className="text-red-400 font-medium">Drop the telemetry files here...</p>
                ) : (
                    <>
                        <p className="text-zinc-300 font-medium">Drag & drop telemetry files here</p>
                        <p className="text-zinc-500 text-sm mt-1">or click to select files</p>
                        <p className="text-zinc-600 text-xs mt-2">Supports: rF2 Telemetry Tool CSV</p>
                    </>
                )}
            </div>

            {/* File list */}
            {files.length > 0 && (
                <div className="bg-zinc-900 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="font-medium text-zinc-200">Files to upload ({files.length})</h3>
                        <Button variant="ghost" size="sm" onClick={clearAll} className="text-zinc-400 hover:text-zinc-200">
                            Clear all
                        </Button>
                    </div>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                        {files.map((file, index) => (
                            <div key={index} className="flex items-center justify-between bg-zinc-800 rounded px-3 py-2">
                                <div className="flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-zinc-500" />
                                    <span className="text-sm text-zinc-300 truncate max-w-xs">{file.name}</span>
                                    <span className="text-xs text-zinc-500">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                                </div>
                                <button
                                    onClick={() => removeFile(index)}
                                    className="text-zinc-500 hover:text-red-400"
                                >
                                    <XCircle className="h-4 w-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                    <Button
                        onClick={uploadFiles}
                        disabled={uploading}
                        className="mt-4 w-full bg-red-600 hover:bg-red-700"
                    >
                        {uploading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Uploading...
                            </>
                        ) : (
                            <>
                                <Upload className="mr-2 h-4 w-4" />
                                Upload {files.length} file{files.length > 1 ? 's' : ''}
                            </>
                        )}
                    </Button>
                </div>
            )}

            {/* Error message */}
            {error && (
                <div className="bg-red-900/30 border border-red-700 rounded-lg p-4">
                    <p className="text-red-400">{error}</p>
                </div>
            )}

            {/* Upload result */}
            {uploadResult && (
                <div className="bg-zinc-900 rounded-lg p-4 space-y-4">
                    <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span className="font-medium text-zinc-200">
                            Successfully uploaded {uploadResult.uploaded} lap{uploadResult.uploaded !== 1 ? 's' : ''}
                        </span>
                    </div>

                    {/* Created entities */}
                    {(uploadResult.created_drivers.length > 0 || uploadResult.created_tracks.length > 0 || uploadResult.created_karts.length > 0) && (
                        <div className="text-sm space-y-1">
                            {uploadResult.created_drivers.length > 0 && (
                                <p className="text-zinc-400">
                                    <span className="text-green-400">New driver:</span> {uploadResult.created_drivers.join(', ')}
                                </p>
                            )}
                            {uploadResult.created_tracks.length > 0 && (
                                <p className="text-zinc-400">
                                    <span className="text-green-400">New track:</span> {uploadResult.created_tracks.join(', ')}
                                </p>
                            )}
                            {uploadResult.created_karts.length > 0 && (
                                <p className="text-zinc-400">
                                    <span className="text-green-400">New kart:</span> {uploadResult.created_karts.join(', ')}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Uploaded laps summary */}
                    <div className="space-y-2">
                        <h4 className="text-sm font-medium text-zinc-300">Imported Laps</h4>
                        <div className="space-y-1 max-h-48 overflow-y-auto">
                            {uploadResult.laps.map((lap) => (
                                <div key={lap.id} className="flex items-center justify-between bg-zinc-800 rounded px-3 py-2 text-sm">
                                    <div className="flex items-center gap-3">
                                        <span className={`font-mono ${lap.valid ? 'text-green-400' : 'text-zinc-500'}`}>
                                            {formatLapTime(lap.lap_time_ms)}
                                        </span>
                                        <span className="text-zinc-400">Lap {lap.lap_number}</span>
                                        {lap.weather && <span className="text-zinc-500 text-xs">{lap.weather}</span>}
                                    </div>
                                    {!lap.valid && <span className="text-xs text-yellow-500">Invalid</span>}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Errors */}
                    {uploadResult.errors.length > 0 && (
                        <div className="space-y-1">
                            <h4 className="text-sm font-medium text-red-400">Errors</h4>
                            {uploadResult.errors.map((err, i) => (
                                <p key={i} className="text-sm text-red-300">{err}</p>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
