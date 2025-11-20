"use client";

import { useEffect, useState } from "react";
import { getAllCompanies, deleteCompany, createCompany } from "../actions";
import { MuiButton } from "@/components/ui/mui-button";
import { MuiInput } from "@/components/ui/mui-input";
import { Trash2, Plus, Building2 } from "lucide-react";

interface Company {
    id: string;
    name: string;
    subdomain: string;
    createdAt: Date;
    user: {
        id: string;
        email: string;
        role: string;
    } | null;
    _count: {
        services: number;
        bookings: number;
    };
}

export default function CompaniesPage() {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [createLoading, setCreateLoading] = useState(false);
    const [error, setError] = useState("");
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        subdomain: "",
        name: ""
    });

    useEffect(() => {
        loadCompanies();
    }, []);

    const loadCompanies = async () => {
        try {
            const data = await getAllCompanies();
            setCompanies(data);
        } catch (error) {
            console.error("Failed to load companies:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to delete "${name}"? This will delete all associated data.`)) {
            return;
        }

        try {
            await deleteCompany(id);
            await loadCompanies();
        } catch (error) {
            alert("Failed to delete company");
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreateLoading(true);
        setError("");

        // Validate: if email is provided, password must also be provided
        if (formData.email && !formData.password) {
            setError("Password is required when email is provided");
            setCreateLoading(false);
            return;
        }

        if (!formData.email && formData.password) {
            setError("Email is required when password is provided");
            setCreateLoading(false);
            return;
        }

        try {
            const result = await createCompany(formData);
            if (result.error) {
                setError(result.error);
            } else {
                setShowCreateModal(false);
                setFormData({ email: "", password: "", subdomain: "", name: "" });
                await loadCompanies();
            }
        } catch (err) {
            setError("Failed to create company");
        } finally {
            setCreateLoading(false);
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Companies</h1>
                <MuiButton onClick={() => setShowCreateModal(true)} startIcon={<Plus size={18} />}>
                    Create Company
                </MuiButton>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
                        <tr>
                            <th className="p-4 font-medium text-gray-700 dark:text-gray-300">Company</th>
                            <th className="p-4 font-medium text-gray-700 dark:text-gray-300">Subdomain</th>
                            <th className="p-4 font-medium text-gray-700 dark:text-gray-300">Owner</th>
                            <th className="p-4 font-medium text-gray-700 dark:text-gray-300">Services</th>
                            <th className="p-4 font-medium text-gray-700 dark:text-gray-300">Bookings</th>
                            <th className="p-4 font-medium text-gray-700 dark:text-gray-300">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {companies.map((company) => (
                            <tr key={company.id} className="border-b border-gray-50 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800">
                                <td className="p-4 font-medium text-gray-900 dark:text-gray-100">{company.name}</td>
                                <td className="p-4 text-gray-700 dark:text-gray-300">{company.subdomain}</td>
                                <td className="p-4 text-gray-700 dark:text-gray-300">{company.user?.email || "No owner"}</td>
                                <td className="p-4 text-gray-700 dark:text-gray-300">{company._count.services}</td>
                                <td className="p-4 text-gray-700 dark:text-gray-300">{company._count.bookings}</td>
                                <td className="p-4">
                                    <button
                                        onClick={() => handleDelete(company.id, company.name)}
                                        className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 max-w-md w-full">
                        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">Create Company</h2>

                        {error && (
                            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleCreate} className="space-y-4">
                            <MuiInput
                                label="Company Name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                            <MuiInput
                                label="Subdomain"
                                value={formData.subdomain}
                                onChange={(e) => setFormData({ ...formData, subdomain: e.target.value.toLowerCase() })}
                                required
                            />
                            <MuiInput
                                label="Owner Email (Optional)"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="Leave empty to create company without owner"
                            />
                            <MuiInput
                                label="Password (Optional)"
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                placeholder="Required only if email is provided"
                            />

                            <div className="flex gap-3 pt-4">
                                <MuiButton
                                    type="button"
                                    variant="outlined"
                                    onClick={() => {
                                        setShowCreateModal(false);
                                        setError("");
                                        setFormData({ email: "", password: "", subdomain: "", name: "" });
                                    }}
                                    className="flex-1"
                                >
                                    Cancel
                                </MuiButton>
                                <MuiButton
                                    type="submit"
                                    loading={createLoading}
                                    disabled={createLoading}
                                    className="flex-1"
                                >
                                    Create
                                </MuiButton>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
