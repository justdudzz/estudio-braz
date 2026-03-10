import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

/**
 * 🛡️ VALIDADAÇÃO DE PARAMS (Security #10)
 * Garante que IDs passados no URL são UUIDs válidos.
 */
export const validateIdParam = (paramName: string = 'id') => {
    return (req: Request, res: Response, next: NextFunction) => {
        const schema = z.string().uuid(`O parâmetro '${paramName}' deve ser um UUID válido.`);
        const result = schema.safeParse(req.params[paramName]);

        if (!result.success) {
            return res.status(400).json({ 
                message: 'ID malformado detetado pelo CEO Shield.',
                error: result.error.issues[0].message 
            });
        }
        next();
    };
};
