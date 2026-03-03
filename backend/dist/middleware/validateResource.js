const validate = (schema) => (req, res, next) => {
    try {
        schema.parse({
            body: req.body,
            query: req.query,
            params: req.params,
        });
        next();
    }
    catch (e) {
        // Retorna erro 400 com a mensagem específica do Zod
        return res.status(400).send(e.errors[0].message);
    }
};
export default validate;
