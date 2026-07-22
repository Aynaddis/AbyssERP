import { Request, Response, NextFunction } from 'express';
import { getDashboardKpis, getDashboardCharts } from '../services/dashboard.service';

export async function getKpis(_req: Request, res: Response, next: NextFunction) {
    try {
        const kpis = await getDashboardKpis();
        res.status(200).json({ kpis });
    } catch (err) {
        next(err);
    }
}

export async function getCharts(_req: Request, res: Response, next: NextFunction) {
    try {
        const charts = await getDashboardCharts();
        res.status(200).json(charts);
    } catch (err) {
        next(err);
    }
}