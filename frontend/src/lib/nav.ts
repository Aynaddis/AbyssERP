import type { UserRole } from '@/store/authStore';
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Receipt,
    Users,
    Wallet,
    ScrollText,
    type LucideIcon,
} from 'lucide-react';

export interface NavItem {
    label: string;
    path: string;
    icon: LucideIcon;
    allowedRoles?: UserRole[];
}

export const navItems: NavItem[] = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Inventory', path: '/inventory', icon: Package },
    { label: 'Purchasing', path: '/purchasing', icon: ShoppingCart, allowedRoles: ['ADMIN', 'MANAGER'] },
    { label: 'Sales', path: '/sales', icon: Receipt },
    { label: 'HR', path: '/hr', icon: Users, allowedRoles: ['ADMIN', 'MANAGER'] },
    { label: 'Finance', path: '/finance', icon: Wallet, allowedRoles: ['ADMIN', 'MANAGER'] },
    { label: 'Audit Log', path: '/audit-log', icon: ScrollText, allowedRoles: ['ADMIN'] },
];