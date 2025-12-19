"use client";

import React, { useState } from "react";
import { MuiCard } from "@/components/ui/mui-card";
import { MuiButton } from "@/components/ui/mui-button";
import { MuiInput } from "@/components/ui/mui-input";
import { MuiTextArea } from "@/components/ui/mui-textarea";
import { MuiSwitch } from "@/components/ui/mui-switch";
import { Plus, Trash2, Edit2, GripVertical, Package, X, Upload } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { createProduct, updateProduct, deleteProduct, reorderProducts } from "@/app/actions/products";
import { getPlanLimits } from "@/lib/subscription-limits";
import { PremiumModal } from "@/components/ui/premium-modal";

// Local interface to avoid dependency on Prisma types during build
interface ProductType {
    id: string;
    name: string;
    description: string | null;
    price: number;
    currency: string;
    imageUrl: string | null;
    isAvailable: boolean;
    order: number;
    profileId: string;
    createdAt: Date;
    updatedAt: Date;
}

interface ProductsManagerProps {
    profileId: string;
    products: ProductType[];
    tierName?: string;
}

export default function ProductsManager({ profileId, products: initialProducts, tierName }: ProductsManagerProps) {
    const { showToast } = useToast();
    const [products, setProducts] = useState(initialProducts);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<ProductType | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [showPremiumModal, setShowPremiumModal] = useState(false);
    const [uploading, setUploading] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        name: "",
        price: "",
        description: "",
        imageUrl: "",
        isAvailable: true
    });

    const limits = getPlanLimits(tierName);
    const canAddMore = products.length < limits.maxProducts;

    const resetForm = () => {
        setFormData({
            name: "",
            price: "",
            description: "",
            imageUrl: "",
            isAvailable: true
        });
        setEditingProduct(null);
        setIsFormOpen(false);
    };

    const handleEdit = (product: ProductType) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            price: product.price.toString(),
            description: product.description || "",
            imageUrl: product.imageUrl || "",
            isAvailable: product.isAvailable
        });
        setIsFormOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.price) {
            showToast("Názov a cena sú povinné", "error");
            return;
        }

        setSaving(true);
        try {
            if (editingProduct) {
                await updateProduct(editingProduct.id, {
                    name: formData.name,
                    price: parseFloat(formData.price),
                    description: formData.description || undefined,
                    imageUrl: formData.imageUrl || undefined,
                    isAvailable: formData.isAvailable
                });
                setProducts(products.map(p =>
                    p.id === editingProduct.id
                        ? { ...p, ...formData, price: parseFloat(formData.price) }
                        : p
                ));
                showToast("Produkt upravený", "success");
            } else {
                const newProduct = await createProduct(profileId, {
                    name: formData.name,
                    price: parseFloat(formData.price),
                    description: formData.description || undefined,
                    imageUrl: formData.imageUrl || undefined,
                    isAvailable: formData.isAvailable
                });
                setProducts([...products, { ...newProduct, price: Number(newProduct.price) }]);
                showToast("Produkt pridaný", "success");
            }
            resetForm();
        } catch (error: any) {
            console.error("Error saving product:", error);
            if (error.message?.includes("limit")) {
                setShowPremiumModal(true);
            } else {
                showToast("Chyba pri ukladaní", "error");
            }
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            await deleteProduct(deleteId);
            setProducts(products.filter(p => p.id !== deleteId));
            showToast("Produkt vymazaný", "success");
        } catch (error) {
            console.error("Error deleting product:", error);
            showToast("Chyba pri mazaní", "error");
        } finally {
            setDeleteId(null);
        }
    };

    const handleDragEnd = async (result: DropResult) => {
        if (!result.destination) return;

        const items = Array.from(products);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        const updatedItems = items.map((item, index) => ({
            ...item,
            order: index
        }));

        setProducts(updatedItems);

        try {
            await reorderProducts(updatedItems.map(item => ({ id: item.id, order: item.order })));
            showToast("Poradie uložené", "success");
        } catch (error) {
            console.error("Error reordering products:", error);
            showToast("Chyba pri ukladaní poradia", "error");
            setProducts(initialProducts);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            showToast("Prosím vyberte obrázok", "error");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            showToast("Obrázok je príliš veľký (max 5MB)", "error");
            return;
        }

        setUploading(true);
        try {
            const formDataUpload = new FormData();
            formDataUpload.append("file", file);
            formDataUpload.append("profileId", profileId);

            const res = await fetch("/api/upload", {
                method: "POST",
                body: formDataUpload
            });

            if (!res.ok) throw new Error("Upload failed");

            const { url } = await res.json();
            setFormData({ ...formData, imageUrl: url });
            showToast("Obrázok nahraný", "success");
        } catch (error) {
            console.error("Error uploading image:", error);
            showToast("Chyba pri nahrávaní", "error");
        } finally {
            setUploading(false);
        }
    };

    return (
        <>
            <MuiCard
                title="Produkty"
                subtitle={`Pridajte produkty do vášho katalógu (${products.length}/${limits.maxProducts})`}
                action={
                    <button
                        onClick={() => {
                            if (!canAddMore) {
                                setShowPremiumModal(true);
                                return;
                            }
                            resetForm();
                            setIsFormOpen(true);
                        }}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${!canAddMore ? "bg-blue-600/50 text-white/50 hover:bg-blue-600/60" : "bg-blue-600 text-white hover:bg-blue-700"}`}
                    >
                        <Plus className="w-4 h-4" />
                        Pridať produkt
                    </button>
                }
            >
                {/* Add/Edit Form */}
                {isFormOpen && (
                    <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl space-y-4">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="font-medium text-gray-900 dark:text-gray-100">
                                {editingProduct ? "Upraviť produkt" : "Nový produkt"}
                            </h3>
                            <button
                                type="button"
                                onClick={resetForm}
                                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <MuiInput
                                label="Názov produktu *"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="napr. Káva Latte"
                                required
                            />
                            <MuiInput
                                label="Cena (€) *"
                                type="number"
                                step="0.01"
                                min="0"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                placeholder="3.50"
                                required
                            />
                        </div>

                        <MuiTextArea
                            label="Popis"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Krátky popis produktu..."
                            rows={2}
                        />

                        {/* Image Upload */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Obrázok produktu
                            </label>
                            <div className="flex items-center gap-4">
                                {formData.imageUrl ? (
                                    <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-200">
                                        <img
                                            src={formData.imageUrl}
                                            alt="Product preview"
                                            className="w-full h-full object-cover"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, imageUrl: "" })}
                                            className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ) : (
                                    <label className="flex flex-col items-center justify-center w-20 h-20 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-gray-400 transition-colors">
                                        <Upload className="w-6 h-6 text-gray-400" />
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            className="hidden"
                                            disabled={uploading}
                                        />
                                    </label>
                                )}
                                {uploading && (
                                    <span className="text-sm text-gray-500">Nahrávam...</span>
                                )}
                            </div>
                        </div>

                        {/* Availability Toggle */}
                        <MuiSwitch
                            checked={formData.isAvailable}
                            onChange={(checked) => setFormData({ ...formData, isAvailable: checked })}
                            label={formData.isAvailable ? "Dostupný" : "Nedostupný"}
                        />

                        <div className="flex justify-end gap-2 pt-2">
                            <MuiButton type="button" variant="outlined" onClick={resetForm}>
                                Zrušiť
                            </MuiButton>
                            <MuiButton type="submit" disabled={saving}>
                                {saving ? "Ukladám..." : editingProduct ? "Uložiť" : "Pridať"}
                            </MuiButton>
                        </div>
                    </form>
                )}

                {/* Products List with Drag & Drop */}
                {products.length > 0 ? (
                    <DragDropContext onDragEnd={handleDragEnd}>
                        <Droppable droppableId="products">
                            {(provided) => (
                                <div
                                    {...provided.droppableProps}
                                    ref={provided.innerRef}
                                    className="space-y-2"
                                >
                                    {products.map((product, index) => (
                                        <Draggable key={product.id} draggableId={product.id} index={index}>
                                            {(provided, snapshot) => (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    className={`flex items-center gap-3 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl transition-shadow ${snapshot.isDragging ? "shadow-lg" : ""
                                                        }`}
                                                >
                                                    {/* Drag Handle */}
                                                    <div
                                                        {...provided.dragHandleProps}
                                                        className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
                                                    >
                                                        <GripVertical className="w-5 h-5" />
                                                    </div>

                                                    {/* Product Image or Icon */}
                                                    <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                                                        {product.imageUrl ? (
                                                            <img
                                                                src={product.imageUrl}
                                                                alt={product.name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <Package className="w-6 h-6 text-gray-400" />
                                                        )}
                                                    </div>

                                                    {/* Product Info */}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <h4 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                                                                {product.name}
                                                            </h4>
                                                            {!product.isAvailable && (
                                                                <span className="px-2 py-0.5 text-xs bg-red-100 text-red-600 rounded-full">
                                                                    Nedostupné
                                                                </span>
                                                            )}
                                                        </div>
                                                        {product.description && (
                                                            <p className="text-sm text-gray-500 truncate">
                                                                {product.description}
                                                            </p>
                                                        )}
                                                    </div>

                                                    {/* Price */}
                                                    <div className="text-lg font-semibold text-gray-900 dark:text-gray-100 whitespace-nowrap">
                                                        {product.price.toFixed(2)} €
                                                    </div>

                                                    {/* Actions */}
                                                    <div className="flex items-center gap-1">
                                                        <button
                                                            onClick={() => handleEdit(product)}
                                                            className="p-2 text-gray-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                                        >
                                                            <Edit2 className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => setDeleteId(product.id)}
                                                            className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </DragDropContext>
                ) : (
                    <div className="text-center py-12 text-gray-500">
                        <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>Zatiaľ nemáte žiadne produkty</p>
                        <p className="text-sm mt-1">Pridajte svoj prvý produkt kliknutím na tlačidlo vyššie</p>
                    </div>
                )}
            </MuiCard>

            {/* Delete Confirmation */}
            <ConfirmationModal
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={handleDelete}
                title="Vymazať produkt?"
                description="Táto akcia je nevratná. Produkt bude natrvalo odstránený."
                confirmText="Vymazať"
                variant="danger"
            />

            {/* Premium Modal */}
            <PremiumModal
                isOpen={showPremiumModal}
                onClose={() => setShowPremiumModal(false)}
                featureName="produkty"
            />
        </>
    );
}
