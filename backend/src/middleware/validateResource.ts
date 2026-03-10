import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

const validate = (schema: z.ZodType<any>) => (req: Request, res: Response, next: NextFunction) => {
  try {
    schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    next();
  } catch (e: any) {
    // Log do erro completo para diagnóstico interno
    console.error('❌ Erro de Validação:', e);

    // Se for erro do Zod, enviamos a primeira mensagem
    if (e.errors && Array.isArray(e.errors) && e.errors.length > 0) {
      return res.status(400).send(e.errors[0].message);
    }
    
    // Fallback amigável
    return res.status(400).send(e.message || 'Erro de validação nos dados enviados.');
  }
};

export default validate;