import { api } from './axios';
import type { PaginatedResult } from '@/types/inventory';
import type { Employee } from '@/types/hr';

export interface EmployeeInput {
    name: string;
    email: string;
    phone?: string;
    department: string;
    position?: string;
    salary: number;
    role: 'MANAGER' | 'STAFF';
}

export interface CreateEmployeeResult {
    employee: Employee;
    credentialsEmailSent: boolean;
}

export interface ListEmployeesParams {
    search?: string;
    includeInactive?: boolean;
    page?: number;
    limit?: number;
}

export async function listEmployees(params: ListEmployeesParams = {}): Promise<PaginatedResult<Employee>> {
    const { data } = await api.get<PaginatedResult<Employee>>('/employees', { params });
    return data;
}

export async function createEmployee(input: EmployeeInput): Promise<CreateEmployeeResult> {
    const { data } = await api.post<CreateEmployeeResult>('/employees', input);
    return data;
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