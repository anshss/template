// monitor/index.js
const express = require('express');
const os = require('os');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const app = express();
app.use(express.json());

// Basic authentication middleware
const authMiddleware = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    if (apiKey !== process.env.MONITOR_API_KEY) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
};

// Function to get system metrics
function getSystemMetrics() {
    const cpus = os.cpus();
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    
    return {
        hostname: os.hostname(),
        platform: os.platform(),
        cpuCount: cpus.length,
        memoryUsage: {
            total: totalMemory,
            free: freeMemory,
            used: totalMemory - freeMemory,
            percentage: ((totalMemory - freeMemory) / totalMemory * 100).toFixed(2)
        },
        uptime: os.uptime(),
        loadAverage: os.loadavg(),
        timestamp: new Date()
    };
}

// Function to get process metrics
function getProcessMetrics() {
    const usage = process.memoryUsage();
    
    return {
        pid: process.pid,
        memory: {
            heapTotal: usage.heapTotal,
            heapUsed: usage.heapUsed,
            rss: usage.rss,
            external: usage.external
        },
        uptime: process.uptime(),
        timestamp: new Date()
    };
}

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date() });
});

// Metrics endpoint with authentication
app.get('/metrics', authMiddleware, async (req, res) => {
    try {
        const metrics = {
            system: getSystemMetrics(),
            process: getProcessMetrics()
        };
        
        // Send metrics to external monitoring service if configured
        if (process.env.MONITOR_WEBHOOK_URL) {
            try {
                await fetch(process.env.MONITOR_WEBHOOK_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-api-key': process.env.MONITOR_API_KEY
                    },
                    body: JSON.stringify({
                        instanceId: process.env.INSTANCE_ID || os.hostname(),
                        metrics
                    })
                });
            } catch (error) {
                console.error('Failed to send metrics to monitoring service:', error);
            }
        }

        res.json(metrics);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.MONITOR_PORT || 9100;
app.listen(PORT, () => {
    console.log(`Monitoring service running on port ${PORT}`);
});