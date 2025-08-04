import { youtube_v3 } from 'googleapis';
export interface VideoOptions {
    videoId: string;
    parts?: string[];
}
export interface SearchOptions {
    query: string;
    maxResults?: number;
}
export interface ChannelOptions {
    channelId: string;
    maxResults?: number;
}
export interface TrendingOptions {
    regionCode?: string;
    categoryId?: string;
    maxResults?: number;
}
export interface CompareVideosOptions {
    videoIds: string[];
}
export declare class VideoManagement {
    private youtube;
    private readonly MAX_RESULTS_PER_PAGE;
    private readonly ABSOLUTE_MAX_RESULTS;
    constructor();
    getVideo({ videoId, parts }: VideoOptions): Promise<youtube_v3.Schema$Video>;
    searchVideos({ query, maxResults }: SearchOptions): Promise<youtube_v3.Schema$SearchResult[]>;
    getTranscript(videoId: string, lang?: string): Promise<import("youtube-captions-scraper").SubtitleItem[]>;
    getRelatedVideos(videoId: string, maxResults?: number): Promise<youtube_v3.Schema$SearchResult[]>;
    getChannelStatistics(channelId: string): Promise<{
        title: string | null | undefined;
        subscriberCount: string | null | undefined;
        viewCount: string | null | undefined;
        videoCount: string | null | undefined;
    }>;
    getChannelTopVideos({ channelId, maxResults }: ChannelOptions): Promise<{
        id: string | null | undefined;
        title: string | null | undefined;
        publishedAt: string | null | undefined;
        viewCount: string | null | undefined;
        likeCount: string | null | undefined;
        commentCount: string | null | undefined;
    }[]>;
    getVideoEngagementRatio(videoId: string): Promise<{
        viewCount: number;
        likeCount: number;
        commentCount: number;
        engagementRatio: string;
    }>;
    getTrendingVideos({ regionCode, categoryId, maxResults }: TrendingOptions): Promise<{
        id: string | null | undefined;
        title: string | null | undefined;
        channelTitle: string | null | undefined;
        publishedAt: string | null | undefined;
        viewCount: string | null | undefined;
        likeCount: string | null | undefined;
    }[]>;
    compareVideos({ videoIds }: CompareVideosOptions): Promise<{
        id: string | null | undefined;
        title: string | null | undefined;
        viewCount: string | null | undefined;
        likeCount: string | null | undefined;
        commentCount: string | null | undefined;
        publishedAt: string | null | undefined;
    }[]>;
}
