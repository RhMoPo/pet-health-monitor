const express = require('express');

const app = express();
const port = 3000;

app.use(express.json());  // Use the built-in middleware to parse JSON
app.use(express.urlencoded({ extended: true }));  // Use the built-in middleware to parse URL-encoded data

const todos = [];
let idCounter = 1;

// Prometheus setup
const client = require('prom-client');
const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics();

const httpRequestDurationMicroseconds = new client.Histogram({
    name: 'http_request_duration_ms',
    help: 'Duration of HTTP requests in ms',
    labelNames: ['method', 'route', 'code'],
    buckets: [50, 100, 200, 300, 400, 500, 1000]
});

const httpRequestCounter = new client.Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'code']
});

const httpErrorCounter = new client.Counter({
    name: 'http_errors_total',
    help: 'Total number of HTTP errors',
    labelNames: ['method', 'route', 'code']
});

app.use((req, res, next) => {
    const end = httpRequestDurationMicroseconds.startTimer();
    res.on('finish', () => {
        const labels = { method: req.method, route: req.route ? req.route.path : '', code: res.statusCode };
        httpRequestCounter.inc(labels);
        if (res.statusCode >= 400) {
            httpErrorCounter.inc(labels);
        }
        end(labels);
    });
    next();
});

app.get('/metrics', async (req, res) => {
    res.set('Content-Type', client.register.contentType);
    res.end(await client.register.metrics());
});

// Todo API endpoints
app.get('/todos', (req, res) => {
    res.json(todos);
});

app.post('/todos', (req, res) => {
    const todo = { id: idCounter++, text: req.body.text };
    todos.push(todo);
    res.status(201).json(todo);
});

app.get('/todos/:id', (req, res) => {
    const todo = todos.find(t => t.id === parseInt(req.params.id));
    if (!todo) return res.status(404).send('Todo not found');
    res.json(todo);
});

app.put('/todos/:id', (req, res) => {
    const todo = todos.find(t => t.id === parseInt(req.params.id));
    if (!todo) return res.status(404).send('Todo not found');

    todo.text = req.body.text;
    res.json(todo);
});

app.delete('/todos/:id', (req, res) => {
    const index = todos.findIndex(t => t.id === parseInt(req.params.id));
    if (index === -1) return res.status(404).send('Todo not found');

    todos.splice(index, 1);
    res.status(204).send();
});

app.listen(port, () => {
    console.log(`Todo API listening at http://localhost:${port}`);
});
