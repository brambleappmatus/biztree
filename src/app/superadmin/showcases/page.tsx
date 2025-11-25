"use client";

import React, { useState, useEffect } from "react";
import { MuiCard } from "@/components/ui/mui-card";
import { MuiButton } from "@/components/ui/mui-button";
import { MuiInput } from "@/components/ui/mui-input";
import { Plus, Trash2, Eye, EyeOff, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";

interface ShowcaseLayer {
    id?: string;
    imageUrl: string;
    depth: number;
    order: number;
}

interface Showcase {
    id: string;
    name: string;
    imageUrl: string;
    profileUrl: string;
    order: number;
    isActive: boolean;
    layers?: ShowcaseLayer[];
}

export default function ShowcasesPage() {
    const { showToast } = useToast();
    const [showcases, setShowcases] = useState<Showcase[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [formData, setFormData] = useState<{
        name: string;
        imageUrl: string;
        profileUrl: string;
        layers: ShowcaseLayer[];
    }>({
        name: "",
        imageUrl: "",
        profileUrl: "",
        layers: [],
    });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>("");
    const [layerFiles, setLayerFiles] = useState<Map<number, File>>(new Map());
    const [layerPreviews, setLayerPreviews] = useState<Map<number, string>>(new Map());
    const [editingId, setEditingId] = useState<string | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    useEffect(() => {
        fetchShowcases();
    }, []);

    const fetchShowcases = async () => {
        try {
            const res = await fetch("/api/superadmin/showcases");
            const data = await res.json();
            setShowcases(data);
        } catch (error) {
            console.error("Failed to fetch showcases:", error);
            showToast("Failed to fetch showcases", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            showToast("Image is too large. Maximum size is 5MB.", "error");
            return;
        }

        if (!file.type.startsWith("image/")) {
            showToast("Please upload an image file.", "error");
            return;
        }

        setImageFile(file);

        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleLayerImageChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            showToast("Layer image is too large. Maximum size is 5MB.", "error");
            return;
        }

        setLayerFiles(prev => new Map(prev).set(index, file));

        const reader = new FileReader();
        reader.onloadend = () => {
            setLayerPreviews(prev => new Map(prev).set(index, reader.result as string));
        };
        reader.readAsDataURL(file);
    };

    const addLayer = () => {
        setFormData(prev => ({
            ...prev,
            layers: [
                ...prev.layers,
                { imageUrl: "", depth: 20, order: prev.layers.length }
            ]
        }));
    };

    const removeLayer = (index: number) => {
        setFormData(prev => ({
            ...prev,
            layers: prev.layers.filter((_, i) => i !== index)
        }));
        setLayerFiles(prev => {
            const newMap = new Map(prev);
            newMap.delete(index);
            return newMap;
        });
        setLayerPreviews(prev => {
            const newMap = new Map(prev);
            newMap.delete(index);
            return newMap;
        });
    };

    const updateLayer = (index: number, field: keyof ShowcaseLayer, value: any) => {
        setFormData(prev => ({
            ...prev,
            layers: prev.layers.map((layer, i) =>
                i === index ? { ...layer, [field]: value } : layer
            )
        }));
    };

    const uploadImage = async (file: File): Promise<string> => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("bucket", "showcases");

        const res = await fetch("/api/upload", {
            method: "POST",
            body: formData,
        });

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({ error: "Unknown error" }));
            console.error("Upload failed:", errorData);
            throw new Error(errorData.error || "Failed to upload image");
        }

        const data = await res.json();
        return data.url;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            let imageUrl = formData.imageUrl;

            // Upload image if a new file was selected
            if (imageFile) {
                setUploading(true);
                imageUrl = await uploadImage(imageFile);
            }

            // Upload layer images
            const processedLayers = await Promise.all(formData.layers.map(async (layer, index) => {
                const file = layerFiles.get(index);
                let layerImageUrl = layer.imageUrl;

                if (file) {
                    setUploading(true);
                    layerImageUrl = await uploadImage(file);
                }

                return {
                    ...layer,
                    imageUrl: layerImageUrl
                };
            }));

            setUploading(false);

            const url = editingId
                ? `/api/superadmin/showcases/${editingId}`
                : "/api/superadmin/showcases";
            const method = editingId ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    imageUrl,
                    layers: processedLayers,
                }),
            });

            if (res.ok) {
                setFormData({ name: "", imageUrl: "", profileUrl: "", layers: [] });
                setImageFile(null);
                setImagePreview("");
                setLayerFiles(new Map());
                setLayerPreviews(new Map());
                setEditingId(null);
                fetchShowcases();
                showToast(editingId ? "Showcase updated" : "Showcase created", "success");
            } else {
                throw new Error("Failed to save");
            }
        } catch (error) {
            console.error("Failed to save showcase:", error);
            showToast("Failed to save showcase. Please try again.", "error");
        } finally {
            setLoading(false);
            setUploading(false);
        }
    };

    const handleDeleteClick = (id: string) => {
        setDeleteId(id);
    };

    const handleConfirmDelete = async () => {
        if (!deleteId) return;

        const id = deleteId;
        setDeleteId(null);

        try {
            await fetch(`/api/superadmin/showcases/${id}`, { method: "DELETE" });
            fetchShowcases();
            showToast("Showcase deleted", "success");
        } catch (error) {
            console.error("Failed to delete showcase:", error);
            showToast("Failed to delete showcase", "error");
        }
    };

    const handleToggleActive = async (id: string, isActive: boolean) => {
        try {
            await fetch(`/api/superadmin/showcases/${id}/toggle`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isActive: !isActive }),
            });
            fetchShowcases();
            showToast("Status updated", "success");
        } catch (error) {
            console.error("Failed to toggle showcase:", error);
            showToast("Failed to update status", "error");
        }
    };

    const handleEdit = (showcase: Showcase) => {
        setFormData({
            name: showcase.name,
            imageUrl: showcase.imageUrl,
            profileUrl: showcase.profileUrl,
            layers: showcase.layers || [],
        });
        setImagePreview(showcase.imageUrl);

        // Initialize layer previews
        const newLayerPreviews = new Map();
        showcase.layers?.forEach((layer, index) => {
            newLayerPreviews.set(index, layer.imageUrl);
        });
        setLayerPreviews(newLayerPreviews);
        setLayerFiles(new Map());
        setEditingId(showcase.id);
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Manage Showcases</h1>
                <p className="text-gray-500">Manage homepage demo profiles</p>
            </div>

            {/* Add/Edit Form */}
            <MuiCard title={editingId ? "Edit Showcase" : "Add New Showcase"}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <MuiInput
                        label="Name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                    />

                    {/* Image Upload */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Screenshot Image
                        </label>
                        <div className="space-y-3">
                            {imagePreview && (
                                <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        className="w-full h-full object-contain"
                                    />
                                </div>
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                required={!editingId && !imagePreview}
                            />
                            <p className="text-xs text-gray-500">
                                Upload a screenshot of the profile (max 5MB)
                            </p>
                        </div>
                    </div>

                    <MuiInput
                        label="Profile URL"
                        value={formData.profileUrl}
                        onChange={(e) => setFormData({ ...formData, profileUrl: e.target.value })}
                        placeholder="https://demo.biztree.bio"
                        required
                    />

                    {/* Layers Section */}
                    <div className="border-t pt-4 mt-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium">Parallax Layers</h3>
                            <MuiButton
                                type="button"
                                variant="outlined"
                                className="!px-3 !py-1 !text-xs"
                                onClick={addLayer}
                                startIcon={<Plus size={16} />}
                            >
                                Add Layer
                            </MuiButton>
                        </div>

                        <div className="space-y-4">
                            {formData.layers.map((layer, index) => (
                                <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200 relative">
                                    <button
                                        type="button"
                                        onClick={() => removeLayer(index)}
                                        className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                                    >
                                        <Trash2 size={18} />
                                    </button>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Layer Image
                                            </label>
                                            {layerPreviews.get(index) && (
                                                <div className="relative w-full h-32 bg-gray-100 rounded-lg overflow-hidden mb-2">
                                                    <img
                                                        src={layerPreviews.get(index)}
                                                        alt={`Layer ${index + 1}`}
                                                        className="w-full h-full object-contain"
                                                    />
                                                </div>
                                            )}
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => handleLayerImageChange(index, e)}
                                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                            />
                                        </div>

                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Depth (0-100)
                                                </label>
                                                <input
                                                    type="number"
                                                    value={layer.depth}
                                                    onChange={(e) => updateLayer(index, 'depth', parseInt(e.target.value))}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Order
                                                </label>
                                                <input
                                                    type="number"
                                                    value={layer.order}
                                                    onChange={(e) => updateLayer(index, 'order', parseInt(e.target.value))}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <MuiButton
                            type="submit"
                            loading={loading || uploading}
                            startIcon={<Plus size={18} />}
                            disabled={uploading}
                        >
                            {uploading ? "Uploading..." : editingId ? "Update" : "Add"} Showcase
                        </MuiButton>
                        {editingId && (
                            <MuiButton
                                type="button"
                                variant="outlined"
                                onClick={() => {
                                    setEditingId(null);
                                    setFormData({ name: "", imageUrl: "", profileUrl: "", layers: [] });
                                    setImageFile(null);
                                    setImagePreview("");
                                    setLayerFiles(new Map());
                                    setLayerPreviews(new Map());
                                }}
                            >
                                Cancel
                            </MuiButton>
                        )}
                    </div>
                </form>
            </MuiCard>

            {/* Showcases List */}
            <MuiCard title="Current Showcases">
                {loading ? (
                    <div className="text-center py-8 text-gray-500">Loading...</div>
                ) : showcases.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        No showcases yet. Add one above!
                    </div>
                ) : (
                    <div className="space-y-2">
                        {showcases.map((showcase) => (
                            <div
                                key={showcase.id}
                                className={cn(
                                    "flex items-center gap-4 p-4 rounded-lg border transition-colors",
                                    showcase.isActive
                                        ? "bg-white border-gray-200"
                                        : "bg-gray-50 border-gray-200 opacity-60"
                                )}
                            >
                                <GripVertical className="text-gray-400 cursor-move" size={20} />
                                <div className="flex-1">
                                    <div className="font-medium">{showcase.name}</div>
                                    <div className="text-sm text-gray-500 truncate">
                                        {showcase.profileUrl}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleToggleActive(showcase.id, showcase.isActive)}
                                        className={cn(
                                            "p-2 rounded-lg transition-colors",
                                            showcase.isActive
                                                ? "bg-green-100 text-green-600 hover:bg-green-200"
                                                : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                                        )}
                                        title={showcase.isActive ? "Active" : "Inactive"}
                                    >
                                        {showcase.isActive ? <Eye size={18} /> : <EyeOff size={18} />}
                                    </button>
                                    <button
                                        onClick={() => handleEdit(showcase)}
                                        className="px-3 py-2 text-sm bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDeleteClick(showcase.id)}
                                        className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </MuiCard>

            <ConfirmationModal
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={handleConfirmDelete}
                title="Delete Showcase?"
                description="Are you sure you want to delete this showcase? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                variant="danger"
            />
        </div>
    );
}
