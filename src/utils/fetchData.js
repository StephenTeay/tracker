export const exerciseOptions = {
  method: 'GET',
  headers: {
    'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com',
    'X-RapidAPI-Key': process.env.REACT_APP_RAPID_API_KEY,
  },
};

// YouTube Data API v3 options (no headers needed, key goes in URL)
export const youtubeOptions = {
  method: 'GET',
};

// YouTube Data API v3 search function
export const searchYouTubeVideos = async (query, maxResults = 6) => {
  const API_KEY = process.env.REACT_APP_YOUTUBE_API_KEY;
  const BASE_URL = 'https://www.googleapis.com/youtube/v3/search';
  
  const params = new URLSearchParams({
    part: 'snippet',
    maxResults: maxResults,
    q: `${query} exercise tutorial`,
    type: 'video',
    order: 'relevance',
    key: API_KEY
  });

  try {
    const response = await fetch(`${BASE_URL}?${params}`);
    
    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Transform data to match your existing structure
    return {
      contents: data.items.map(item => ({
        video: {
          videoId: item.id.videoId,
          title: item.snippet.title,
          channelName: item.snippet.channelTitle,
          publishedTimeText: item.snippet.publishedAt,
          thumbnails: [
            {
              url: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default.url,
              width: item.snippet.thumbnails.medium?.width || 320,
              height: item.snippet.thumbnails.medium?.height || 180
            }
          ]
        }
      }))
    };
  } catch (error) {
    console.error('YouTube API Error:', error);
    throw error;
  }
};

export const fetchData = async (url, options) => {
  try {
    const response = await fetch(url, options);

    if (response.status === 429) {
      // Rate limited - wait and retry once
      await new Promise((resolve) => {
        setTimeout(resolve, 2000);
      });
      const retryResponse = await fetch(url, options);
      if (!retryResponse.ok) {
        throw new Error(`HTTP error! status: ${retryResponse.status}`);
      }
      return await retryResponse.json();
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
};
