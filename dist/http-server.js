#!/usr/bin/env node
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { VideoManagement } from './functions/videos.js';
// Environment variable validation
if (!process.env.YOUTUBE_API_KEY) {
    console.error('Error: YOUTUBE_API_KEY environment variable is not set.');
    process.exit(1);
}
// Default subtitle language setting
const defaultTranscriptLang = process.env.YOUTUBE_TRANSCRIPT_LANG || 'pt';
// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;
// Initialize VideoManagement
const videoManager = new VideoManagement();
// Middleware
app.use(cors());
app.use(express.json());
// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);
// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// Search videos endpoint
app.post('/api/mcp/searchVideos', async (req, res) => {
    try {
        const { params } = req.body;
        const { query, maxResults = 10 } = params;
        if (!query) {
            return res.status(400).json({ error: 'Query parameter is required' });
        }
        const result = await videoManager.searchVideos({ query, maxResults });
        res.json({ result });
    }
    catch (error) {
        console.error('Error searching videos:', error);
        res.status(500).json({ error: 'Failed to search videos' });
    }
});
// Get video details endpoint
app.post('/api/mcp/getVideoDetails', async (req, res) => {
    try {
        const { params } = req.body;
        const { videoId, parts } = params;
        if (!videoId) {
            return res.status(400).json({ error: 'videoId parameter is required' });
        }
        const result = await videoManager.getVideo({ videoId, parts });
        res.json({ result });
    }
    catch (error) {
        console.error('Error getting video details:', error);
        res.status(500).json({ error: 'Failed to get video details' });
    }
});
// Get transcripts endpoint
app.post('/api/mcp/getTranscripts', async (req, res) => {
    try {
        const { params } = req.body;
        const { videoId, lang = defaultTranscriptLang } = params;
        if (!videoId) {
            return res.status(400).json({ error: 'videoId parameter is required' });
        }
        const result = await videoManager.getTranscript(videoId, lang);
        res.json({ result });
    }
    catch (error) {
        console.error('Error getting transcripts:', error);
        res.status(500).json({ error: 'Failed to get transcripts' });
    }
});
// Get related videos endpoint
app.post('/api/mcp/getRelatedVideos', async (req, res) => {
    try {
        const { params } = req.body;
        const { videoId, maxResults = 10 } = params;
        if (!videoId) {
            return res.status(400).json({ error: 'videoId parameter is required' });
        }
        const result = await videoManager.getRelatedVideos(videoId, maxResults);
        res.json({ result });
    }
    catch (error) {
        console.error('Error getting related videos:', error);
        res.status(500).json({ error: 'Failed to get related videos' });
    }
});
// Get channel statistics endpoint
app.post('/api/mcp/getChannelStatistics', async (req, res) => {
    try {
        const { params } = req.body;
        const { channelId } = params;
        if (!channelId) {
            return res.status(400).json({ error: 'channelId parameter is required' });
        }
        const result = await videoManager.getChannelStatistics(channelId);
        res.json({ result });
    }
    catch (error) {
        console.error('Error getting channel statistics:', error);
        res.status(500).json({ error: 'Failed to get channel statistics' });
    }
});
// Get channel top videos endpoint
app.post('/api/mcp/getChannelTopVideos', async (req, res) => {
    try {
        const { params } = req.body;
        const { channelId, maxResults = 10 } = params;
        if (!channelId) {
            return res.status(400).json({ error: 'channelId parameter is required' });
        }
        const result = await videoManager.getChannelTopVideos({
            channelId: channelId,
            maxResults: maxResults
        });
        res.json({ result });
    }
    catch (error) {
        console.error('Error getting channel top videos:', error);
        res.status(500).json({ error: 'Failed to get channel top videos' });
    }
});
// Get video engagement ratio endpoint
app.post('/api/mcp/getVideoEngagementRatio', async (req, res) => {
    try {
        const { params } = req.body;
        const { videoId } = params;
        if (!videoId) {
            return res.status(400).json({ error: 'videoId parameter is required' });
        }
        const result = await videoManager.getVideoEngagementRatio(videoId);
        res.json({ result });
    }
    catch (error) {
        console.error('Error getting video engagement ratio:', error);
        res.status(500).json({ error: 'Failed to get video engagement ratio' });
    }
});
// Get trending videos endpoint
app.post('/api/mcp/getTrendingVideos', async (req, res) => {
    try {
        const { params } = req.body;
        const { regionCode = 'BR', categoryId, maxResults = 10 } = params;
        const result = await videoManager.getTrendingVideos({
            regionCode: regionCode,
            categoryId: categoryId,
            maxResults: maxResults
        });
        res.json({ result });
    }
    catch (error) {
        console.error('Error getting trending videos:', error);
        res.status(500).json({ error: 'Failed to get trending videos' });
    }
});
// Compare videos endpoint
app.post('/api/mcp/compareVideos', async (req, res) => {
    try {
        const { params } = req.body;
        const { videoIds } = params;
        if (!videoIds || !Array.isArray(videoIds)) {
            return res.status(400).json({ error: 'videoIds array is required' });
        }
        const result = await videoManager.compareVideos({ videoIds: videoIds });
        res.json({ result });
    }
    catch (error) {
        console.error('Error comparing videos:', error);
        res.status(500).json({ error: 'Failed to compare videos' });
    }
});
// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Unhandled error:', error);
    res.status(500).json({ error: 'Internal server error' });
});
// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});
// Start server
app.listen(PORT, () => {
    console.log(`🚀 Odysseus Content API server running on http://localhost:${PORT}`);
    console.log(`📚 Health check: http://localhost:${PORT}/health`);
    console.log(`🎥 YouTube API ready with language: ${defaultTranscriptLang}`);
});
export default app;
