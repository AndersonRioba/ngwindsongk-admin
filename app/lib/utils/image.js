/**
 * Generates a full URL for an image path.
 * Handles both remote backend images and local public assets.
 * 
 * @param {string} path - The image path from API or local.
 * @param {string} fallback - Fallback image if path is missing.
 * @returns {string} - The full image URL.
 */
export function getImageUrl(path, fallback = "/logo.png") {
    if (!path) return fallback;

    // 1. Handle absolute URLs
    if (path.startsWith('http')) {
        return path;
    }

    // 2. Derive Base URL (strip /api if needed)
    // In admin, we use NEXT_PUBLIC_API_URL and strip /api
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
                    process.env.NEXT_PUBLIC_API_URL?.split('/api')[0] || 
                    '';

    // 3. If the path starts with a slash, it's relative to the frontend public folder
    if (path.startsWith('/')) {
        return path;
    }

    // 4. Otherwise, assume it's a relative path from the backend storage
    const cleanPath = path.startsWith('storage/') ? path.replace('storage/', '') : path;
    
    return `${baseUrl}/storage/${cleanPath}`;
}
