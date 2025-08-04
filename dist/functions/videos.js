import { google } from 'googleapis';
import { getSubtitles } from 'youtube-captions-scraper';
export class VideoManagement {
    youtube;
    MAX_RESULTS_PER_PAGE = 50;
    ABSOLUTE_MAX_RESULTS = 500;
    constructor() {
        this.youtube = google.youtube({
            version: 'v3',
            auth: process.env.YOUTUBE_API_KEY
        });
    }
    async getVideo({ videoId, parts = ['snippet'] }) {
        try {
            const response = await this.youtube.videos.list({
                part: parts,
                id: [videoId]
            });
            if (!response.data.items?.length) {
                throw new Error('Video not found.');
            }
            return response.data.items[0];
        }
        catch (error) {
            throw new Error(`Failed to retrieve video information: ${error.message}`);
        }
    }
    async searchVideos({ query, maxResults = 10 }) {
        try {
            const results = [];
            let nextPageToken = undefined;
            const targetResults = Math.min(maxResults, this.ABSOLUTE_MAX_RESULTS);
            while (results.length < targetResults) {
                const response = (await this.youtube.search.list({
                    part: ['snippet'],
                    q: query,
                    maxResults: Math.min(this.MAX_RESULTS_PER_PAGE, targetResults - results.length),
                    type: ['video'],
                    pageToken: nextPageToken
                })).data;
                if (!response.items?.length) {
                    break;
                }
                results.push(...response.items);
                nextPageToken = response.nextPageToken || undefined;
                if (!nextPageToken) {
                    break;
                }
            }
            return results.slice(0, targetResults);
        }
        catch (error) {
            throw new Error(`Failed to search videos: ${error.message}`);
        }
    }
    async getTranscript(videoId, lang) {
        try {
            const transcript = await getSubtitles({
                videoID: videoId,
                lang: lang || process.env.YOUTUBE_TRANSCRIPT_LANG || 'en'
            });
            return transcript;
        }
        catch (error) {
            throw new Error(`Failed to retrieve transcript: ${error.message}`);
        }
    }
    async getRelatedVideos(videoId, maxResults = 10) {
        try {
            const response = await this.youtube.search.list({
                part: ['snippet'],
                type: ['video'],
                maxResults,
                relatedToVideoId: videoId
            });
            return response.data.items || [];
        }
        catch (error) {
            throw new Error(`Failed to retrieve related videos: ${error.message}`);
        }
    }
    async getChannelStatistics(channelId) {
        try {
            const response = await this.youtube.channels.list({
                part: ['snippet', 'statistics'],
                id: [channelId]
            });
            if (!response.data.items?.length) {
                throw new Error('Channel not found.');
            }
            const channel = response.data.items[0];
            return {
                title: channel.snippet?.title,
                subscriberCount: channel.statistics?.subscriberCount,
                viewCount: channel.statistics?.viewCount,
                videoCount: channel.statistics?.videoCount
            };
        }
        catch (error) {
            throw new Error(`Failed to retrieve channel statistics: ${error.message}`);
        }
    }
    async getChannelTopVideos({ channelId, maxResults = 10 }) {
        try {
            const searchResults = [];
            let nextPageToken = undefined;
            const targetResults = Math.min(maxResults, this.ABSOLUTE_MAX_RESULTS);
            while (searchResults.length < targetResults) {
                const searchResponse = (await this.youtube.search.list({
                    part: ['id'],
                    channelId: channelId,
                    maxResults: Math.min(this.MAX_RESULTS_PER_PAGE, targetResults - searchResults.length),
                    order: 'viewCount',
                    type: ['video'],
                    pageToken: nextPageToken
                })).data;
                if (!searchResponse.items?.length) {
                    break;
                }
                searchResults.push(...searchResponse.items);
                nextPageToken = searchResponse.nextPageToken || undefined;
                if (!nextPageToken) {
                    break;
                }
            }
            if (!searchResults.length) {
                throw new Error('No videos found.');
            }
            const videoIds = searchResults
                .map(item => item.id?.videoId)
                .filter((id) => id !== undefined);
            // Retrieve video details in batches of 50
            const videoDetails = [];
            for (let i = 0; i < videoIds.length; i += this.MAX_RESULTS_PER_PAGE) {
                const batch = videoIds.slice(i, i + this.MAX_RESULTS_PER_PAGE);
                const videosResponse = await this.youtube.videos.list({
                    part: ['snippet', 'statistics'],
                    id: batch
                });
                if (videosResponse.data.items) {
                    videoDetails.push(...videosResponse.data.items);
                }
            }
            return videoDetails.slice(0, targetResults).map(video => ({
                id: video.id,
                title: video.snippet?.title,
                publishedAt: video.snippet?.publishedAt,
                viewCount: video.statistics?.viewCount,
                likeCount: video.statistics?.likeCount,
                commentCount: video.statistics?.commentCount
            }));
        }
        catch (error) {
            throw new Error(`Failed to retrieve channel's top videos: ${error.message}`);
        }
    }
    async getVideoEngagementRatio(videoId) {
        try {
            const response = await this.youtube.videos.list({
                part: ['statistics'],
                id: [videoId]
            });
            if (!response.data.items?.length) {
                throw new Error('Video not found.');
            }
            const stats = response.data.items[0].statistics;
            const viewCount = parseInt(stats?.viewCount || '0');
            const likeCount = parseInt(stats?.likeCount || '0');
            const commentCount = parseInt(stats?.commentCount || '0');
            const engagementRatio = viewCount > 0
                ? ((likeCount + commentCount) / viewCount * 100).toFixed(2)
                : '0';
            return {
                viewCount,
                likeCount,
                commentCount,
                engagementRatio: `${engagementRatio}%`
            };
        }
        catch (error) {
            throw new Error(`Failed to calculate video engagement ratio: ${error.message}`);
        }
    }
    async getTrendingVideos({ regionCode = 'US', categoryId, maxResults = 10 }) {
        try {
            const params = {
                part: ['snippet', 'statistics'],
                chart: 'mostPopular',
                regionCode: regionCode,
                maxResults: maxResults
            };
            if (categoryId) {
                params.videoCategoryId = categoryId;
            }
            const response = await this.youtube.videos.list(params);
            return response.data.items?.map(video => ({
                id: video.id,
                title: video.snippet?.title,
                channelTitle: video.snippet?.channelTitle,
                publishedAt: video.snippet?.publishedAt,
                viewCount: video.statistics?.viewCount,
                likeCount: video.statistics?.likeCount
            })) || [];
        }
        catch (error) {
            throw new Error(`Failed to retrieve trending videos: ${error.message}`);
        }
    }
    async compareVideos({ videoIds }) {
        try {
            const response = await this.youtube.videos.list({
                part: ['snippet', 'statistics'],
                id: videoIds
            });
            if (!response.data.items?.length) {
                throw new Error('No videos found.');
            }
            return response.data.items.map(video => ({
                id: video.id,
                title: video.snippet?.title,
                viewCount: video.statistics?.viewCount,
                likeCount: video.statistics?.likeCount,
                commentCount: video.statistics?.commentCount,
                publishedAt: video.snippet?.publishedAt
            }));
        }
        catch (error) {
            throw new Error(`Failed to compare videos: ${error.message}`);
        }
    }
}
