import { Request, Response, NextFunction } from 'express';
import { createEmployeeSchema, updateEmployeeSchema } from '../utils/validation/employee.schema';
import {
    listEmployees,
    getEmployeeById,
    createEmployee,
    updateEmployee,
    deactivateEmployee,
    reactivateEmployee,
} from '../services/employee.service';
import { logAudit } from '../services/audit.service';
import { notify } from '../services/notification.service';
import { AppError } from '../middleware/errorHandler';

export async function getEmployees(req: Request, res: Response, next: NextFunction) {
    try {
        const includeInactive = req.query.includeInactive === 'true';
        const employees = await listEmployees(includeInactive);
        res.status(200).json({ employees });
    } catch (err) {
        next(err);
    }
}

export async function getEmployee(req: Request, res: Response, next: NextFunction) {
    try {
        const employee = await getEmployeeById(String(req.params.id));
        res.status(200).json({ employee });
    } catch (err) {
        next(err);
    }
}

export async function postEmployee(req: Request, res: Response, next: NextFunction) {
    try {
        const parsed = createEmployeeSchema.safeParse(req.body);
        if (!parsed.success) {
            throw new AppError(parsed.error.issues[0].message, 400);
        }

        const employee = await createEmployee(parsed.data);
        await logAudit({
          userId: req.user?.userId,
          action: 'CREATE',
          entityType: 'Employee',
          entityId: employee.id,
          description: `Added employee "${employee.name}" to ${employee.department}`,
        });

        await notify({
          type: 'EMPLOYEE_ADDED',
          message: `New employee "${employee.name}" added to ${employee.department}`,
          visibleToRoles: ['ADMIN'],
          entityType: 'Employee',
          entityId: employee.id,
        });

        res.status(201).json({ employee });
    } catch (err) {
        next(err);
    }
}

export async function putEmployee(req: Request, res: Response, next: NextFunction) {
    try {
        const parsed = updateEmployeeSchema.safeParse(req.body);
        if (!parsed.success) {
            throw new AppError(parsed.error.issues[0].message, 400);
        }

        const employee = await updateEmployee(String(req.params.id), parsed.data);
        res.status(200).json({ employee });
    } catch (err) {
        next(err);
    }
}

export async function removeEmployee(req: Request, res: Response, next: NextFunction) {
    try {
        const id = String(req.params.id);
        const employee = await getEmployeeById(id);
        await deactivateEmployee(id);

        await logAudit({
          userId: req.user?.userId,
          action: 'DEACTIVATE',
          entityType: 'Employee',
          entityId: id,
          description: `Deactivated employee "${employee.name}"`,
        });

        res.status(200).json({ message: 'Employee deactivated' });
    } catch (err) {
        next(err);
    }
}

export async function postReactivateEmployee(req: Request, res: Response, next: NextFunction) {
    try {
        const employee = await reactivateEmployee(String(req.params.id));
        await logAudit({
          userId: req.user?.userId,
          action: 'REACTIVATE',
          entityType: 'Employee',
          entityId: employee.id,
          description: `Reactivated employee "${employee.name}"`,
        });
        res.status(200).json({ employee });
    } catch (err) {
        next(err);
    }
}