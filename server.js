const express = require('express');
const path = require('path');

const app = express();

app.use(express.json());

/* Servir frontend estático */
app.use(express.static(__dirname));

/* Proxy API */
app.use('/api', async (req, res) => {

    const query = req.url || '';

    const target =
        `https://convocatoriasback.free.nf/api.php${query}`;

    try {

        const response = await fetch(target, {
            method: req.method,
            headers: {
                'Content-Type': 'application/json'
            },
            body:
                req.method !== 'GET'
                    ? JSON.stringify(req.body)
                    : undefined
        });

        const data = await response.text();

        res.send(data);

    } catch (err) {

        console.error(err);

        res.status(500).json({
            error: 'Error proxying request'
        });
    }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
});