import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, UserX, UserCheck, Search } from 'lucide-react';
import { listEmployees, deactivateEmployee, reactivateEmployee } from '@/api/employees';
import { useAuthStore } from '@/store/authStore';
import { EmployeeFormModal } from '@/components/EmployeeFormModal';
import { toast, toastErrorMessage } from '@/store/toastStore';
import type { Employee } from '@/types/hr';

export default function HRPage() {
    const queryClient = useQueryClient();
    const hasRole = useAuthStore((s) => s.hasRole);
    const canDeactivate = hasRole('ADMIN');

    const [editingEmployee, setEditingEmployee] = useState<Employee | null | undefined>(undefined);
    const [showInactive, setShowInactive] = useState(false);
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [page, setPage] = useState(1);

    useEffect(() => {
        const timeout = setTimeout(() => setDebouncedSearch(search), 300);
        return () => clearTimeout(timeout);
    }, [search]);

    useEffect(() => setPage(1), [debouncedSearch, showInactive]);

    const { data: result, isLoading } = useQuery({
        queryKey: ['employees', { search: debouncedSearch, showInactive: canDeactivate && showInactive, page }],
        queryFn: () =>
            listEmployees({
                search: debouncedSearch || undefined,
                includeInactive: canDeactivate && showInactive,
                page,
                limit: 10,
            }),
    });

    const employees = result?.items;

    const deactivateMutation = useMutation({
        mutationFn: deactivateEmployee,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['employees'] });
            toast.success('Employee deactivated');
        },
        onError: (err) => toast.error(toastErrorMessage(err, 'Failed to deactivate employee')),
    });

    const reactivateMutation = useMutation({
        mutationFn: reactivateEmployee,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['employees'] });
            toast.success('Employee reactivated');
        },
        onError: (err) => toast.error(toastErrorMessage(err, 'Failed to reactivate employee')),
    });

    function handleDeactivate(employee: Employee) {
        if (confirm(`Deactivate "${employee.name}"? They'll be hidden from active employee lists.`)) {
            deactivateMutation.mutate(employee.id);
        }
    }

    function handleReactivate(employee: Employee) {
        reactivateMutation.mutate(employee.id);
    }

    const activeCount = employees?.filter((e) => e.isActive).length ?? 0;

    return (
        <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <div>
                    <h1 className="text-xl font-bold">HR</h1>
                    <p className="text-sm text-[var(--color-muted)]">{activeCount} active employees</p>
                </div>
                <button
                    onClick={() => setEditingEmployee(null)}
                    className="flex items-center gap-2 rounded-lg bg-[var(--color-accent)] text-black text-sm font-semibold px-4 py-2.5 hover:opacity-90 transition-opacity"
                >
                    <Plus size={16} />
                    Add Employee
                </button>
            </div>

            <div className="flex flex-wrap items-center gap-3 mb-4">
                <div className="relative flex-1 min-w-[200px]">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by name..."
                        className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-panel)] pl-9 pr-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
                    />
                </div>
                {canDeactivate && (
                    <label className="flex items-center gap-2 text-sm cursor-pointer w-fit shrink-0">
                        <input
                            type="checkbox"
                            checked={showInactive}
                            onChange={(e) => setShowInactive(e.target.checked)}
                            className="accent-[var(--color-accent)]"
                        />
                        <span className="text-[var(--color-muted)]">Show deactivated</span>
                    </label>
                )}
            </div>

            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-[var(--color-border)] text-left text-xs text-[var(--color-muted)]">
                                <th className="px-4 py-3 font-medium">Name</th>
                                <th className="px-4 py-3 font-medium">Role</th>
                                <th className="px-4 py-3 font-medium">Department</th>
                                <th className="px-4 py-3 font-medium">Position</th>
                                <th className="px-4 py-3 font-medium">Salary</th>
                                <th className="px-4 py-3 font-medium">Hired</th>
                                {canDeactivate && showInactive && <th className="px-4 py-3 font-medium">Status</th>}
                                <th className="px-4 py-3 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading && (
                                <tr>
                                    <td colSpan={8} className="px-4 py-8 text-center text-[var(--color-muted)]">
                                        Loading...
                                    </td>
                                </tr>
                            )}
                            {!isLoading && employees?.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="px-4 py-8 text-center text-[var(--color-muted)]">
                                        No employees found.
                                    </td>
                                </tr>
                            )}
                            {employees?.map((emp) => (
                                <tr
                                    key={emp.id}
                                    className={`border-b border-[var(--color-border)] last:border-0 ${!emp.isActive ? 'opacity-60' : ''
                                        }`}
                                >
                                    <td className="px-4 py-3 font-medium">{emp.name}</td>
                                    <td className="px-4 py-3 text-[var(--color-muted)]">{emp.role}</td>
                                    <td className="px-4 py-3 text-[var(--color-muted)]">{emp.department}</td>
                                    <td className="px-4 py-3 text-[var(--color-muted)]">{emp.position ?? '—'}</td>
                                    <td className="px-4 py-3">${emp.salary.toLocaleString()}</td>
                                    <td className="px-4 py-3 text-[var(--color-muted)]">
                                        {new Date(emp.hireDate).toLocaleDateString()}
                                    </td>
                                    {canDeactivate && showInactive && (
                                        <td className="px-4 py-3">
                                            <span
                                                className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${emp.isActive
                                                        ? 'bg-green-500/10 text-green-500'
                                                        : 'bg-[var(--color-panel-2)] text-[var(--color-muted)]'
                                                    }`}
                                            >
                                                {emp.isActive ? 'Active' : 'Deactivated'}
                                            </span>
                                        </td>
                                    )}
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-end gap-2">
                                            {emp.isActive ? (
                                                <>
                                                    <button
                                                        onClick={() => setEditingEmployee(emp)}
                                                        aria-label="Edit employee"
                                                        className="text-[var(--color-muted)] hover:text-[var(--color-accent)] transition-colors"
                                                    >
                                                        <Pencil size={15} />
                                                    </button>
                                                    {canDeactivate && (
                                                        <button
                                                            onClick={() => handleDeactivate(emp)}
                                                            aria-label="Deactivate employee"
                                                            className="text-[var(--color-muted)] hover:text-red-500 transition-colors"
                                                        >
                                                            <UserX size={15} />
                                                        </button>
                                                    )}
                                                </>
                                            ) : (
                                                canDeactivate && (
                                                    <button
                                                        onClick={() => handleReactivate(emp)}
                                                        aria-label="Reactivate employee"
                                                        className="flex items-center gap-1 text-xs font-semibold text-green-500 hover:opacity-80"
                                                    >
                                                        <UserCheck size={14} />
                                                        Reactivate
                                                    </button>
                                                )
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {result && result.pagination.totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--color-border)] text-xs text-[var(--color-muted)]">
                        <span>
                            Page {result.pagination.page} of {result.pagination.totalPages}
                        </span>
                        <div className="flex gap-2">
                            <button
                                disabled={page <= 1}
                                onClick={() => setPage((p) => p - 1)}
                                className="rounded-lg border border-[var(--color-border)] px-3 py-1.5 disabled:opacity-40 hover:bg-[var(--color-panel-2)] transition-colors"
                            >
                                Previous
                            </button>
                            <button
                                disabled={page >= result.pagination.totalPages}
                                onClick={() => setPage((p) => p + 1)}
                                className="rounded-lg border border-[var(--color-border)] px-3 py-1.5 disabled:opacity-40 hover:bg-[var(--color-panel-2)] transition-colors"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {editingEmployee !== undefined && (
                <EmployeeFormModal employee={editingEmployee} onClose={() => setEditingEmployee(undefined)} />
            )}
        </div>
    );
}