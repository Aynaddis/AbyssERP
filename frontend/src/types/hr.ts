export interface Employee {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    department: string;
    position: string | null;
    salary: number;
    hireDate: string;
    isActive: boolean;
}