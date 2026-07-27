export interface Employee {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    department: string;
    position: string | null;
    salary: number;
    hireDate: string;
    isActive: boolean;
    role: 'ADMIN' | 'MANAGER' | 'STAFF';
    userId: string | null;
}