#!/usr/bin/env node
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { VideoManagement } from './functions/videos.js';
// Environment variable validation
if (!process.env.YOUTUBE_API_KEY) {
    console.error('Error: YOUTUBE_API_KEY environment variable is not set.');
    process.exit(1);
}
// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;
// Initialize VideoManagement
const videoManager = new VideoManagement();
// Middleware
app.use(cors());
app.use(express.json());
// Root endpoint - API information
app.get('/', (req, res) => {
    res.json({
        name: 'Odysseus Content API',
        version: '1.0.0',
        description: 'API para integração de conteúdo do YouTube com o Projeto Odysseus',
        endpoints: {
            health: '/health',
            search: '/api/search?q=termo&maxResults=10',
            video: '/api/video/{videoId}'
        },
        status: 'running',
        timestamp: new Date().toISOString()
    });
});
// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// Simple search endpoint
app.get('/api/search', async (req, res) => {
    try {
        const { q, maxResults = 10 } = req.query;
        if (!q) {
            return res.status(400).json({ error: 'Query parameter q is required' });
        }
        const result = await videoManager.searchVideos({
            query: q,
            maxResults: Number(maxResults)
        });
        res.json({ success: true, data: result });
    }
    catch (error) {
        console.error('Error searching videos:', error);
        res.status(500).json({ error: error.message });
    }
});
// Simple video details endpoint
app.get('/api/video/:videoId', async (req, res) => {
    try {
        const { videoId } = req.params;
        const result = await videoManager.getVideo({
            videoId,
            parts: ['snippet', 'statistics']
        });
        res.json({ success: true, data: result });
    }
    catch (error) {
        console.error('Error getting video details:', error);
        res.status(500).json({ error: error.message });
    }
});
// Start server
app.listen(PORT, () => {
    console.log(`🚀 Odysseus Content API running on http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`🔍 Search videos: http://localhost:${PORT}/api/search?q=your_query`);
    console.log(`📹 Video details: http://localhost:${PORT}/api/video/VIDEO_ID`);
});
export default app;
