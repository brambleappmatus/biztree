"use client";

import { useEffect, useState } from "react";
import { getAllUsers, deleteUser, assignUserToCompany, getAllCompanies, updateUserRole, changeUserCompany } from "../actions";
import { MuiButton } from "@/components/ui/mui-button";
import { MuiSelect } from "@/components/ui/mui-select";
import { Trash2, Link as LinkIcon, Edit } from "lucide-react";

interface User {
    id: string;
    email: string;
    role: string;
    createdAt: Date;
    profile: {
        id: string;
        name: string;
        subdomain: string;
    } | null;
}

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [companies, setCompanies] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [selectedCompany, setSelectedCompany] = useState("");
    const [selectedRole, setSelectedRole] = useState("");

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [usersData, companiesData] = await Promise.all([
                getAllUsers(),
                getAllCompanies()
            ]);
            setUsers(usersData);
            setCompanies(companiesData);
        } catch (error) {
            console.error("Failed to load data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string, email: string) => {
        if (!confirm(`Are you sure you want to delete user "${email}"?`)) {
            return;
        }

        try {
            await deleteUser(id);
            await loadData();
        } catch (error) {
            alert("Failed to delete user");
        }
    };

    const handleAssign = async () => {
        if (!selectedUser || !selectedCompany) return;

        try {
            const result = await assignUserToCompany(selectedUser.id, selectedCompany);
            if (result.error) {
                alert(result.error);
            } else {
                setShowAssignModal(false);
                setSelectedUser(null);
                setSelectedCompany("");
                await loadData();
            }
        } catch (error) {
            alert("Failed to assign user");
        }
    };

    const handleEdit = async () => {
        if (!selectedUser) return;

        try {
            // Update role if changed
            if (selectedRole && selectedRole !== selectedUser.role) {
                const roleResult = await updateUserRole(selectedUser.id, selectedRole);
                if (roleResult.error) {
                    alert(roleResult.error);
                    return;
                }
            }

            // Update company if changed
            if (selectedCompany && selectedCompany !== selectedUser.profile?.id) {
                const companyResult = await changeUserCompany(selectedUser.id, selectedCompany);
                if (companyResult.error) {
                    alert(companyResult.error);
                    return;
                }
            }

            setShowEditModal(false);
            setSelectedUser(null);
            setSelectedRole("");
            setSelectedCompany("");
            await loadData();
        } catch (error) {
            alert("Failed to update user");
        }
    };

    const openEditModal = (user: User) => {
        setSelectedUser(user);
        setSelectedRole(user.role);
        setSelectedCompany(user.profile?.id || "");
        setShowEditModal(true);
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">Users</h1>

            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
                        <tr>
                            <th className="p-4 font-medium text-gray-700 dark:text-gray-300">Email</th>
                            <th className="p-4 font-medium text-gray-700 dark:text-gray-300">Role</th>
                            <th className="p-4 font-medium text-gray-700 dark:text-gray-300">Company</th>
                            <th className="p-4 font-medium text-gray-700 dark:text-gray-300">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id} className="border-b border-gray-50 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800">
                                <td className="p-4 font-medium text-gray-900 dark:text-gray-100">{user.email}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.role === "SUPERADMIN"
                                            ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400"
                                            : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                                        }`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="p-4 text-gray-700 dark:text-gray-300">
                                    {user.profile ? user.profile.name : "No company"}
                                </td>
                                <td className="p-4">
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => openEditModal(user)}
                                            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                                            title="Edit user"
                                        >
                                            <Edit size={18} />
                                        </button>
                                        {!user.profile && user.role !== "SUPERADMIN" && (
                                            <button
                                                onClick={() => {
                                                    setSelectedUser(user);
                                                    setShowAssignModal(true);
                                                }}
                                                className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300"
                                                title="Assign to company"
                                            >
                                                <LinkIcon size={18} />
                                            </button>
                                        )}
                                        {user.role !== "SUPERADMIN" && (
                                            <button
                                                onClick={() => handleDelete(user.id, user.email)}
                                                className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Edit Modal */}
            {showEditModal && selectedUser && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 max-w-md w-full">
                        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">Edit User</h2>

                        <p className="mb-4 text-gray-600 dark:text-gray-400">
                            Editing <strong>{selectedUser.email}</strong>
                        </p>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Role
                                </label>
                                <select
                                    value={selectedRole}
                                    onChange={(e) => setSelectedRole(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                >
                                    <option value="USER">USER</option>
                                    <option value="ADMIN">ADMIN</option>
                                    <option value="SUPERADMIN">SUPERADMIN</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Company
                                </label>
                                <select
                                    value={selectedCompany}
                                    onChange={(e) => setSelectedCompany(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                >
                                    <option value="">No company</option>
                                    {companies.map((company) => (
                                        <option key={company.id} value={company.id}>
                                            {company.name} ({company.subdomain})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-6">
                            <MuiButton
                                type="button"
                                variant="outlined"
                                onClick={() => {
                                    setShowEditModal(false);
                                    setSelectedUser(null);
                                    setSelectedRole("");
                                    setSelectedCompany("");
                                }}
                                className="flex-1"
                            >
                                Cancel
                            </MuiButton>
                            <MuiButton
                                onClick={handleEdit}
                                className="flex-1"
                            >
                                Save Changes
                            </MuiButton>
                        </div>
                    </div>
                </div>
            )}

            {/* Assign Modal */}
            {showAssignModal && selectedUser && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 max-w-md w-full">
                        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">Assign User to Company</h2>

                        <p className="mb-4 text-gray-600 dark:text-gray-400">
                            Assign <strong>{selectedUser.email}</strong> to a company:
                        </p>

                        <select
                            value={selectedCompany}
                            onChange={(e) => setSelectedCompany(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 mb-4"
                        >
                            <option value="">Select a company</option>
                            {companies.map((company) => (
                                <option key={company.id} value={company.id}>
                                    {company.name} ({company.subdomain})
                                </option>
                            ))}
                        </select>

                        <div className="flex gap-3 pt-2">
                            <MuiButton
                                type="button"
                                variant="outlined"
                                onClick={() => {
                                    setShowAssignModal(false);
                                    setSelectedUser(null);
                                    setSelectedCompany("");
                                }}
                                className="flex-1"
                            >
                                Cancel
                            </MuiButton>
                            <MuiButton
                                onClick={handleAssign}
                                disabled={!selectedCompany}
                                className="flex-1"
                            >
                                Assign
                            </MuiButton>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
