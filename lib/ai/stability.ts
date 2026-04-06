/**
 * Stability AI Provider
 * Image generation with Stable Diffusion
 */

export interface StabilityConfig {
  apiKey: string;
  engineId?: string;
}

export interface ImageGenerationOptions {
  prompt: string;
  negativePrompt?: string;
  width?: number;
  height?: number;
  samples?: number;
  steps?: number;
  cfgScale?: number;
  seed?: number;
  stylePreset?: string;
}

export class StabilityProvider {
  private apiKey: string;
  private baseURL = 'https://api.stability.ai/v1';

  constructor(config: StabilityConfig) {
    this.apiKey = config.apiKey;
  }

  /**
   * Generate image with Stable Diffusion
   */
  async generateImage(options: ImageGenerationOptions): Promise<{
    imageBuffer: Buffer;
    seed: number;
    finishReason: string;
  }> {
    const response = await fetch(`${this.baseURL}/generation/stable-diffusion-xl-1024-v1-0/text-to-image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        text_prompts: [{ text: options.prompt }],
        cfg_scale: options.cfgScale || 7,
        height: options.height || 1024,
        width: options.width || 1024,
        samples: options.samples || 1,
        steps: options.steps || 30,
        seed: options.seed,
        negative_prompt: options.negativePrompt,
        style_preset: options.stylePreset,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Stability AI error: ${error}`);
    }

    const result = await response.json();
    const image = result.artifacts[0];
    
    return {
      imageBuffer: Buffer.from(image.base64, 'base64'),
      seed: image.seed,
      finishReason: image.finishReason,
    };
  }

  /**
   * Image to image (variation)
   */
  async imageToImage(options: ImageGenerationOptions & {
    initImage: Buffer;
    initImageStrength?: number;
  }): Promise<{
    imageBuffer: Buffer;
    seed: number;
  }> {
    const formData = new FormData();
    formData.append('init_image', new Blob([options.initImage]));
    formData.append('init_image_mode', 'IMAGE_STRENGTH');
    formData.append('image_strength', (options.initImageStrength || 0.35).toString());
    formData.append('text_prompts[0][text]', options.prompt);
    formData.append('cfg_scale', (options.cfgScale || 7).toString());
    formData.append('steps', (options.steps || 30).toString());

    if (options.seed) {
      formData.append('seed', options.seed.toString());
    }

    const response = await fetch(
      `${this.baseURL}/generation/stable-diffusion-xl-1024-v1-0/image-to-image`,
      {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: formData,
      }
    );

    const result = await response.json();
    const image = result.artifacts[0];

    return {
      imageBuffer: Buffer.from(image.base64, 'base64'),
      seed: image.seed,
    };
  }
}
