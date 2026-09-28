export const formatEmbedUrl = (url) => {
    if (!url) return '';
    
    // Google Drive direct file (view/edit/preview)
    if (url.includes('drive.google.com/file/d/')) {
        const fileId = url.split('/file/d/')[1]?.split('/')[0]?.split('?')[0];
        if (fileId) return `https://drive.google.com/file/d/${fileId}/preview`;
    }

    // Google Drive open?id=FILE_ID
    if (url.includes('drive.google.com/open?id=')) {
        const fileId = url.split('id=')[1]?.split('&')[0];
        if (fileId) return `https://drive.google.com/file/d/${fileId}/preview`;
    }

    // Google Drive uc?id=FILE_ID
    if (url.includes('drive.google.com/uc?')) {
        const urlParams = new URLSearchParams(url.split('?')[1]);
        const fileId = urlParams.get('id');
        if (fileId) return `https://drive.google.com/file/d/${fileId}/preview`;
    }

    // Google Drive Folder
    if (url.includes('drive.google.com/drive/folders/')) {
        const folderId = url.split('/folders/')[1]?.split('?')[0];
        if (folderId) return `https://drive.google.com/embeddedfolderview?id=${folderId}#grid`;
    }

    // Google Slides Presentation
    if (url.includes('docs.google.com/presentation/d/')) {
        const presentationId = url.split('/d/')[1]?.split('/')[0];
        if (presentationId) return `https://docs.google.com/presentation/d/${presentationId}/embed?start=false&loop=false&delayms=3000`;
    }

    // YouTube Video
    if (url.includes('youtube.com/watch?v=')) {
        const videoId = url.split('v=')[1]?.split('&')[0];
        if (videoId) return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes('youtu.be/')) {
        const videoId = url.split('youtu.be/')[1]?.split('?')[0];
        if (videoId) return `https://www.youtube.com/embed/${videoId}`;
    }

    return url;
};

export const isVideoFile = (url) => {
    if (!url) return false;
    const cleanUrl = url.toLowerCase().split('?')[0];
    return cleanUrl.endsWith('.mp4') || cleanUrl.endsWith('.webm') || cleanUrl.endsWith('.mkv') || cleanUrl.endsWith('.ogg');
};
