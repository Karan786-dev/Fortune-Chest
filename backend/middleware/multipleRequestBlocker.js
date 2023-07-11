const tokens = new Set()

const multipleRequestBlocker =
    (req, res, next) => {
        try {
            const tokeninHeader = req.header('auth-token');
            if (tokeninHeader) {
                if (tokens.has(tokeninHeader)) {
                    return res.status(300).send({ message: 'Please wait for your previous request to complete' });
                }
                tokens.add(tokeninHeader)
                res.once('finish', () => {
                    console.log('Request ended')
                    tokens.delete(tokeninHeader);
                })
            }

            next();
        } catch (error) {
            console.error(error);
            res.status(500).send({ message: 'Internal server error' });
        }
    }

module.exports = multipleRequestBlocker