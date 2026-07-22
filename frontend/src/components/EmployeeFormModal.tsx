import { useState, type FormEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X } from 'lucide-react';
import { createEmployee, updateEmployee, type EmployeeInput } from '@/api/employees';
import { toast } from '@/store/toastStore';
import type { Employee } from '@/types/hr';

interface EmployeeFormModalProps {
    employee: Employee | null;
    onClose: () => void;
}

export function EmployeeFormModal({ employee, onClose }: EmployeeFormModalProps) {
    const queryClient = useQueryClient();
    const isEdit = Boolean(employee);

    const [form, setForm] = useState<EmployeeInput>({
        name: employee?.name ?? '',
        email: employee?.email ?? '',
        phone: employee?.phone ?? '',
        department: employee?.department ?? '',
        position: employee?.position ?? '',
        salary: employee?.salary ?? 0,
    });

    const mutation = useMutation({
        mutationFn: () => (isEdit ? updateEmployee(employee!.id, form) : createEmployee(form)),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['employees'] });
            toast.success(isEdit ? 'Employee updated' : 'Employee created');
            onClose();
        },
    });

    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        mutation.mutate();
    }

    const errorMessage = (mutation.error as any)?.response?.data?.error ?? mutation.error?.message;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-xl bg-[var(--color-panel)] border border-[var(--color-border)] max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)]">
                    <h2 className="font-bold text-sm">{isEdit ? 'Edit Employee' : 'Add Employee'}</h2>
                    <button onClick={onClose} aria-label="Close">
                        <X size={18} className="text-[var(--color-muted)] hover:text-[var(--color-text)]" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-5 space-y-3">
                    {errorMessage && (
                        <div className="text-sm text-red-500 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
                            {errorMessage}
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-medium text-[var(--color-muted)] mb-1">Name</label>
                        <input
                            required
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-panel-2)] px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-[var(--color-muted)] mb-1">Department</label>
                            <input
                                required
                                value={form.department}
                                onChange={(e) => setForm({ ...form, department: e.target.value })}
                                className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-panel-2)] px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-[var(--color-muted)] mb-1">Position</label>
                            <input
                                value={form.position}
                                onChange={(e) => setForm({ ...form, position: e.target.value })}
                                className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-panel-2)] px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-[var(--color-muted)] mb-1">Salary</label>
                        <input
                            required
                            type="number"
                            min="0"
                            step="0.01"
                            value={form.salary}
                            onChange={(e) => setForm({ ...form, salary: Number(e.target.value) })}
                            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-panel-2)] px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-[var(--color-muted)] mb-1">Email</label>
                        <input
                            type="email"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-panel-2)] px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-[var(--color-muted)] mb-1">Phone</label>
                        <input
                            value={form.phone}
                            onChange={(e) => setForm({ ...form, phone: e.target.value })}
                            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-panel-2)] px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
                        />
                    </div>

                    <div className="flex gap-2 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 rounded-lg border border-[var(--color-border)] text-sm font-semibold py-2.5 hover:bg-[var(--color-panel-2)] transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={mutation.isPending}
                            className="flex-1 rounded-lg bg-[var(--color-accent)] text-black text-sm font-semibold py-2.5 hover:opacity-90 transition-opacity disabled:opacity-50"
                        >
                            {mutation.isPending ? 'Saving...' : isEdit ? 'Save changes' : 'Add employee'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}