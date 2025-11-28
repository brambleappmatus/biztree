"use client";

import { useEffect, useState } from "react";
import { getCompanies, getCompanyStats, deleteCompany, createCompany, getTiersList, updateCompanyTier, extendSubscription } from "../actions";
import { MuiButton } from "@/components/ui/mui-button";
import { MuiInput } from "@/components/ui/mui-input";
import { Trash2, Plus, Building2, Calendar, Clock, Search, TrendingUp, Users, Crown, Zap, Download, ArrowUpDown, Filter } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";

interface Company {
    id: string;
    name: string;
    subdomain: string;
    createdAt: Date;
    subscriptionStatus?: string | null;
    subscriptionExpiresAt?: Date | null;
    user: {
        id: string;
        email: string;
        role: string;
    } | null;
    _count: {
        services: number;
        bookings: number;
    };
    tier: {
        id: string;
        name: string;
    } | null;
    subscriptions: {
        stripePriceId: string | null;
        currentPeriodEnd: Date | null;
        cancelAtPeriodEnd: boolean;
    }[];
}

interface Tier {
    id: string;
    name: string;
}

interface Stats {
    freeCount: number;
    proCount: number;
    businessCount: number;
    lifetimeCount: number;
    mrr: number;
}

export default function CompaniesPage() {
    const { showToast } = useToast();
    const [companies, setCompanies] = useState<Company[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [tiers, setTiers] = useState<Tier[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [createLoading, setCreateLoading] = useState(false);
    const [error, setError] = useState("");
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        subdomain: "",
        name: ""
    });
    const [deleteData, setDeleteData] = useState<{ id: string; name: string } | null>(null);
    const [tierModalData, setTierModalData] = useState<{ companyId: string; companyName: string; currentTierId: string | null } | null>(null);
    const [selectedTierId, setSelectedTierId] = useState<string>("");
    const [expirationDate, setExpirationDate] = useState<string>("");

    // Sorting and filtering state
    const [sortBy, setSortBy] = useState<string>("createdAt");
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>("desc");
    const [filterTier, setFilterTier] = useState<string>("");
    const [filterStatus, setFilterStatus] = useState<string>("");

    useEffect(() => {
        loadData();
    }, [currentPage, searchQuery, sortBy, sortOrder, filterTier, filterStatus]);

    const loadData = async () => {
        try {
            const [companiesData, statsData, tiersData] = await Promise.all([
                getCompanies({
                    page: currentPage,
                    limit: 20,
                    search: searchQuery,
                    sortBy,
                    sortOrder,
                    filterTier: filterTier || undefined,
                    filterStatus: filterStatus || undefined
                }),
                getCompanyStats(),
                getTiersList()
            ]);
            // Cast the response to match our interface since the action returns the raw Prisma type
            setCompanies(companiesData.companies as unknown as Company[]);
            setTotalPages(companiesData.pagination.totalPages);
            setTotal(companiesData.pagination.total);
            setStats(statsData);
            setTiers(tiersData);
        } catch (error) {
            console.error("Failed to load data:", error);
            showToast("Failed to load data", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (value: string) => {
        setSearchQuery(value);
        setCurrentPage(1); // Reset to first page on new search
    };

    const handleDeleteClick = (id: string, name: string) => {
        setDeleteData({ id, name });
    };

    const handleConfirmDelete = async () => {
        if (!deleteData) return;

        const { id } = deleteData;
        setDeleteData(null);

        try {
            await deleteCompany(id);
            await loadData();
            showToast("Company deleted", "success");
        } catch (error) {
            showToast("Failed to delete company", "error");
        }
    };

    const handleTierChange = async (companyId: string, companyName: string, currentTierId: string | null) => {
        setTierModalData({ companyId, companyName, currentTierId });
        setSelectedTierId(currentTierId || "");
        setExpirationDate("");
    };

    const handleConfirmTierChange = async () => {
        if (!tierModalData) return;

        try {
            const expiresAt = expirationDate ? new Date(expirationDate) : null;
            await updateCompanyTier(tierModalData.companyId, selectedTierId || null, expiresAt);
            await loadData();
            showToast("Tier updated successfully", "success");
            setTierModalData(null);
        } catch (error) {
            showToast("Failed to update tier", "error");
        }
    };

    const handleExtendSubscription = async (companyId: string, days: number) => {
        try {
            await extendSubscription(companyId, days);
            await loadData();
            showToast(`Subscription extended by ${days} days`, "success");
        } catch (error) {
            showToast("Failed to extend subscription", "error");
        }
    };

    const handleSort = (column: string) => {
        if (sortBy === column) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(column);
            setSortOrder('asc');
        }
    };

    const handleExportCSV = () => {
        // Prepare CSV data
        const headers = ['Company', 'Subdomain', 'Owner Email', 'Tier', 'Status', 'Expires', 'Created'];
        const rows = companies.map(company => [
            company.name,
            company.subdomain,
            company.user?.email || '-',
            company.tier?.name || 'Free',
            company.subscriptionStatus || '-',
            formatDate(company.subscriptionExpiresAt),
            formatDate(company.createdAt)
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        // Download CSV
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `companies_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        showToast("CSV exported successfully", "success");
    };

    const formatDate = (date: Date | null | undefined) => {
        if (!date) return "-";
        return new Date(date).toLocaleDateString();
    };

    const getDaysRemaining = (expiresAt: Date | null | undefined) => {
        if (!expiresAt) return null;
        const now = new Date();
        const expiry = new Date(expiresAt);
        const diff = expiry.getTime() - now.getTime();
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
        return days;
    };

    const getStatusBadge = (company: Company) => {
        const status = company.subscriptionStatus;
        const expiresAt = company.subscriptionExpiresAt;
        const tierName = company.tier?.name;
        const activeSub = company.subscriptions?.[0];
        const isCancelled = activeSub?.cancelAtPeriodEnd;

        const days = getDaysRemaining(expiresAt);

        if (status === "EXPIRED" || (days !== null && days < 0)) {
            return <span className="px-2 py-1 text-xs rounded-full bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400">Expired</span>;
        }

        // Show "Cancelled" if subscription is set to cancel at period end
        if (isCancelled && status === "ACTIVE") {
            return <span className="px-2 py-1 text-xs rounded-full bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400">Cancelled</span>;
        }

        if (status === "ACTIVE" && days !== null && days <= 7) {
            return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400">Expiring Soon</span>;
        }
        // Show "Lifetime" for paid tiers (Pro, Business) with no expiry date
        if (status === "ACTIVE" && !expiresAt && tierName && tierName !== "Free") {
            return <span className="px-2 py-1 text-xs rounded-full bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400">Lifetime</span>;
        }
        if (status === "ACTIVE") {
            return <span className="px-2 py-1 text-xs rounded-full bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400">Active</span>;
        }
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">-</span>;
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
                showToast(result.error, "error");
            } else {
                setShowCreateModal(false);
                setFormData({ email: "", password: "", subdomain: "", name: "" });
                await loadData();
                showToast("Company created", "success");
            }
        } catch (err) {
            setError("Failed to create company");
            showToast("Failed to create company", "error");
        } finally {
            setCreateLoading(false);
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            {/* Header with Stats */}
            <div className="mb-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Companies</h1>
                    <MuiButton onClick={() => setShowCreateModal(true)} startIcon={<Plus size={18} />}>
                        Create Company
                    </MuiButton>
                </div>

                {/* Stats Cards */}
                {stats && (
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium opacity-90">MRR</span>
                                <TrendingUp size={20} className="opacity-75" />
                            </div>
                            <div className="text-2xl font-bold">€{stats.mrr.toFixed(2)}</div>
                        </div>

                        <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Free</span>
                                <Users size={20} className="text-gray-400" />
                            </div>
                            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.freeCount}</div>
                        </div>

                        <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Pro</span>
                                <Crown size={20} className="text-yellow-500" />
                            </div>
                            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.proCount}</div>
                        </div>

                        <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Business</span>
                                <Building2 size={20} className="text-blue-500" />
                            </div>
                            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.businessCount}</div>
                        </div>

                        <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Lifetime</span>
                                <Zap size={20} className="text-purple-500" />
                            </div>
                            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.lifetimeCount}</div>
                        </div>
                    </div>
                )}

                {/* Search Bar */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search by name, subdomain, or email..."
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Filters and Export */}
                <div className="flex gap-3 items-center mt-4">
                    <div className="flex gap-2 items-center">
                        <Filter size={18} className="text-gray-400" />
                        <select
                            value={filterTier}
                            onChange={(e) => setFilterTier(e.target.value)}
                            className="px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">All Tiers</option>
                            {tiers.map(tier => (
                                <option key={tier.id} value={tier.id}>{tier.name}</option>
                            ))}
                        </select>

                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">All Statuses</option>
                            <option value="active">Active</option>
                            <option value="cancelled">Cancelled</option>
                            <option value="expired">Expired</option>
                            <option value="lifetime">Lifetime</option>
                        </select>
                    </div>

                    <div className="ml-auto">
                        <button
                            onClick={handleExportCSV}
                            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                        >
                            <Download size={16} />
                            Export CSV
                        </button>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
                        <tr>
                            <th className="p-4 font-medium text-gray-700 dark:text-gray-300">Company</th>
                            <th className="p-4 font-medium text-gray-700 dark:text-gray-300">Subdomain</th>
                            <th className="p-4 font-medium text-gray-700 dark:text-gray-300">Owner</th>
                            <th
                                className="p-4 font-medium text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                                onClick={() => handleSort('tierId')}
                            >
                                <div className="flex items-center gap-1">
                                    Tier
                                    <ArrowUpDown size={14} className={sortBy === 'tierId' ? 'text-blue-500' : 'text-gray-400'} />
                                </div>
                            </th>
                            <th className="p-4 font-medium text-gray-700 dark:text-gray-300">Status</th>
                            <th
                                className="p-4 font-medium text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                                onClick={() => handleSort('subscriptionExpiresAt')}
                            >
                                <div className="flex items-center gap-1">
                                    Expires
                                    <ArrowUpDown size={14} className={sortBy === 'subscriptionExpiresAt' ? 'text-blue-500' : 'text-gray-400'} />
                                </div>
                            </th>
                            <th className="p-4 font-medium text-gray-700 dark:text-gray-300">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {companies.map((company) => (
                            <tr key={company.id} className="border-b border-gray-50 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800">
                                <td className="p-4 font-medium text-gray-900 dark:text-gray-100">{company.name}</td>
                                <td className="p-4 text-gray-700 dark:text-gray-300">{company.subdomain}</td>
                                <td className="p-4 text-gray-700 dark:text-gray-300">{company.user?.email || "No owner"}</td>
                                <td className="p-4">
                                    <button
                                        onClick={() => handleTierChange(company.id, company.name, company.tier?.id || null)}
                                        className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
                                    >
                                        {company.tier?.name || "No Tier"}
                                    </button>
                                </td>
                                <td className="p-4">
                                    {getStatusBadge(company)}
                                </td>
                                <td className="p-4 text-gray-700 dark:text-gray-300">
                                    <div className="flex items-center gap-2">
                                        <span>{formatDate(company.subscriptionExpiresAt)}</span>
                                        {company.subscriptionExpiresAt && (
                                            <div className="flex gap-1">
                                                <button
                                                    onClick={() => handleExtendSubscription(company.id, 30)}
                                                    className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded hover:bg-blue-200 dark:hover:bg-blue-900/30"
                                                    title="Extend by 30 days"
                                                >
                                                    +30d
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td className="p-4">
                                    <button
                                        onClick={() => handleDeleteClick(company.id, company.name)}
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

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                        Showing {companies.length} of {total} companies
                    </div>
                    <div className="flex gap-2">
                        <MuiButton
                            variant="outlined"
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                        >
                            Previous
                        </MuiButton>
                        <div className="flex items-center gap-2 px-4">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                Page {currentPage} of {totalPages}
                            </span>
                        </div>
                        <MuiButton
                            variant="outlined"
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                        >
                            Next
                        </MuiButton>
                    </div>
                </div>
            )}

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

            {/* Tier Assignment Modal */}
            {tierModalData && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 max-w-md w-full">
                        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">Assign Tier</h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                            Assigning tier for: <strong>{tierModalData.companyName}</strong>
                        </p>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Tier
                                </label>
                                <select
                                    value={selectedTierId}
                                    onChange={(e) => setSelectedTierId(e.target.value)}
                                    className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                                >
                                    <option value="">No Tier</option>
                                    {tiers.map((tier) => (
                                        <option key={tier.id} value={tier.id}>
                                            {tier.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Expiration Date (Optional)
                                </label>
                                <input
                                    type="date"
                                    value={expirationDate}
                                    onChange={(e) => setExpirationDate(e.target.value)}
                                    className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                                />
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    Leave empty for no expiration
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-6">
                            <MuiButton
                                variant="outlined"
                                onClick={() => setTierModalData(null)}
                                className="flex-1"
                            >
                                Cancel
                            </MuiButton>
                            <MuiButton
                                onClick={handleConfirmTierChange}
                                className="flex-1"
                            >
                                Assign Tier
                            </MuiButton>
                        </div>
                    </div>
                </div>
            )}

            <ConfirmationModal
                isOpen={!!deleteData}
                onClose={() => setDeleteData(null)}
                onConfirm={handleConfirmDelete}
                title="Delete Company?"
                description={`Are you sure you want to delete "${deleteData?.name}"? This will delete all associated data. This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
                variant="danger"
            />
        </div>
    );
}
