import ogs from 'open-graph-scraper';

export const fetchLinkPreview = async (content) => {
    // First check if it's a YouTube link
    const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/;
    const youtubeMatch = content.match(youtubeRegex);
    
    if (youtubeMatch && youtubeMatch[1]) {
        return {
            type: 'youtube',
            embedUrl: `https://www.youtube.com/embed/${youtubeMatch[1]}`,
            videoId: youtubeMatch[1]
        };
    }
    
    // If not YouTube, check for other links
    const urlRegex = /(https?:\/\/[^\s]+)/;
    const otherMatch = content.match(urlRegex);
    
    if (otherMatch && otherMatch[1]) {
        try {
            const { result } = await ogs({ url: otherMatch[1] });
            return {
                type: 'link',
                title: result.ogTitle || result.twitterTitle || '',
                description: result.ogDescription || result.twitterDescription || '',
                image: result.ogImage ? result.ogImage.url : '',
                siteName: result.ogSiteName || '',
                url: result.ogUrl || otherMatch[1],
            };
        } catch (e) {
            console.error('Error fetching link preview:', e);
            return {
                type: 'link',
                title: '',
                description: '',
                image: '',
                siteName: '',
                url: otherMatch[1],
            };
        }
    }
    
    return null;
};
