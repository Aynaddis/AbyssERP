import { api } from './axios';
import type { Employee } from '@/types/hr';

export interface EmployeeInput {
    name: string;
    email?: string;
    phone?: string;
    department: string;
    position?: string;
    salary: number;
}

export async function listEmployees(includeInactive = false): Promise<Employee[]> {
    const { data } = await api.get<{ employees: Employee[] }>('/employees', {
        params: includeInactive ? { includeInactive: true } : undefined,
    });
    return data.employees;
}

export async function createEmployee(input: EmployeeInput): Promise<Employee> {
    const { data } = await api.post<{ employee: Employee }>('/employees', input);
    return data.employee;
}

export async function updateEmployee(id: string, input: Partial<EmployeeInput>): Promise<Employee> {
    const { data } = await api.put<{ employee: Employee }>(`/employees/${id}`, input);
    return data.employee;
}

export async function deactivateEmployee(id: string): Promise<void> {
    await api.delete(`/employees/${id}`);
}

export async function reactivateEmployee(id: string): Promise<Employee> {
    const { data } = await api.post<{ employee: Employee }>(`/employees/${id}/reactivate`);
    return data.employee;
}