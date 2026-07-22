import { api } from './axios';
import type { DashboardKpis, DashboardCharts } from '@/types/dashboard';

export async function getDashboardKpis(): Promise<DashboardKpis> {
    const { data } = await api.get<{ kpis: DashboardKpis }>('/dashboard/kpis');
    return data.kpis;
}

export async function getDashboardCharts(): Promise<DashboardCharts> {
    const { data } = await api.get<DashboardCharts>('/dashboard/charts');
    return data;
}