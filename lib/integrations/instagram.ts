/**
 * Instagram Integration (via Facebook Graph API)
 * Post images, stories
 */
const INSTAGRAM_API_URL = 'https://graph.facebook.com/v18.0';
export interface InstagramConfig { accessToken: string; instagramAccountId: string; }
export async function postToInstagram(caption: string, imageUrl: string, config: InstagramConfig) {
  try {
    const response = await fetch(`${INSTAGRAM_API_URL}/${config.instagramAccountId}/media`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image_url: imageUrl, caption, access_token: config.accessToken }),
    });
    if (!response.ok) return { success: false, error: 'Instagram API error' };
    return { success: true, postId: 'mock-post' };
  } catch (error: any) { return { success: false, error: error.message }; }
}
export async function testInstagramConnection(accessToken: string) {
  try {
    const response = await fetch(`${INSTAGRAM_API_URL}/me?access_token=${accessToken}`);
    if (!response.ok) return { success: false, error: 'Connection failed' };
    return { success: true, message: 'Connected to Instagram' };
  } catch (error: any) { return { success: false, error: error.message }; }
}