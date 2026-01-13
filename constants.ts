export const ASPECT_RATIO_SHORT = "Aspect ratio 9:16";
export const ASPECT_RATIO_LONG = "Aspect ratio 16:9";

export const DURATION_OPTIONS = [
  "Short (< 60 Seconds)",
  "Medium (1 - 3 Minutes)",
  "Long (3 - 5 Minutes)",
  "Extended (5 - 10 Minutes)"
];

// New Audio Styles for tone control
export const AUDIO_STYLES = [
  { id: 'suspenseful', label: 'Suspenseful', instruction: "Speak in a low, suspenseful tone with dramatic pauses. Build tension slowly. Moderate pace." },
  { id: 'creepy', label: 'Creepy/Eerie', instruction: "Whispered, eerie tone. Speak slowly with unsettling pauses. Sound slightly disturbed." },
  { id: 'narrator', label: 'Classic Narrator', instruction: "Clear, professional narrator voice. Moderate pace with good emphasis on key moments. Deep and resonant." },
  { id: 'urgent', label: 'Urgent/Panic', instruction: "Faster pace, slightly breathless. Sound anxious and nervous. Build urgency." },
  { id: 'calm', label: 'Calm/Ominous', instruction: "Calm but ominous tone. Slow, deliberate pacing. Sound detached and unsettling." }
];

// Gemini Voices
export const GEMINI_VOICES = [
  { id: 'Charon', label: 'Charon (Deep, Eerie)', description: 'Best for deep horror narration' },
  { id: 'Fenrir', label: 'Fenrir (Growling, Intense)', description: 'Good for aggressive or creature stories' },
  { id: 'Puck', label: 'Puck (Mischievous)', description: 'Good for psychological thrillers' },
  { id: 'Kore', label: 'Kore (Soft, Haunting)', description: 'Good for ghost stories' },
  { id: 'Zephyr', label: 'Zephyr (Calm)', description: 'Good for true crime style' },
];

// Puter.js / Standard Voices
export const PUTER_VOICES = [
  // OpenAI Voices (Best Quality)
  { id: 'onyx', label: 'Onyx (Deep Male) [HQ]', description: 'Deep, authoritative, perfect for horror', provider: 'openai' },
  { id: 'nova', label: 'Nova (Warm Female) [HQ]', description: 'Engaging, dynamic, great for storytelling', provider: 'openai' },
  { id: 'alloy', label: 'Alloy (Neutral) [HQ]', description: 'Versatile and clear', provider: 'openai' },
  { id: 'shimmer', label: 'Shimmer (Soft Female) [HQ]', description: 'Soft, gentle, unsettling if whispered', provider: 'openai' },
  { id: 'echo', label: 'Echo (Soft Male) [HQ]', description: 'Well-rounded standard male voice', provider: 'openai' },
  { id: 'fable', label: 'Fable (British Male) [HQ]', description: 'Slightly accent, good for old tales', provider: 'openai' },

  // AWS Polly (Standard)
  { id: 'Joanna', label: 'Joanna (Female, Warm)', description: 'Friendly, warm tone', provider: 'aws' },
  { id: 'Matthew', label: 'Matthew (Male, Deep)', description: 'Professional, authoritative', provider: 'aws' },
  { id: 'Joey', label: 'Joey (Male, Energetic)', description: 'Fast-paced, urgent', provider: 'aws' },
  { id: 'Amy', label: 'Amy (Female, Soft)', description: 'Gentle, storytelling', provider: 'aws' },
  { id: 'Salli', label: 'Salli (Female, Bright)', description: 'Clear, engaging', provider: 'aws' },
  { id: 'Ivy', label: 'Ivy (Child, Eerie)', description: 'Creepy child-like voice', provider: 'aws' },
  { id: 'Kevin', label: 'Kevin (Male, Young)', description: 'Casual, relatable', provider: 'aws' },
];

export const CATEGORIES = [
  { id: 'popular', name: 'Popular', icon: '⭐' },
  { id: 'cartoon', name: 'Cartoon', icon: '🎨' },
  { id: 'realistic', name: 'Realistic', icon: '📷' },
  { id: 'historical', name: 'Historical', icon: '🏛️' },
  { id: 'studio', name: 'Animation Studios', icon: '🎬' },
  { id: 'game', name: 'Game Styles', icon: '🎮' },
  { id: 'anime', name: 'Anime', icon: '🇯🇵' }
];

export const ART_STYLES = [
  // Popular/Most Used
  {
    id: 'dark-cartoon-v1',
    name: 'Dark Cartoon v1',
    category: 'popular',
    description: 'Bold, stylized cartoon art with dramatic shadows and creepy atmosphere',
    prompt: 'dark cartoon style, bold black outlines, dramatic high contrast shadows, creepy unsettling atmosphere, stylized simplified characters, dark muted color palette, horror cartoon aesthetic, flat shading',
    isPremium: false
  },
  {
    id: 'dark-cartoon-v2',
    name: 'Dark Cartoon v2',
    category: 'popular',
    description: 'Enhanced dark cartoon style with refined details and atmospheric lighting',
    prompt: 'enhanced dark cartoon, refined clean linework, atmospheric moody lighting, deep shadows with subtle gradients, detailed character features, moody desaturated colors, eerie ambiance, smooth shading',
    isPremium: false
  },
  
  // Cartoon Styles
  {
    id: 'creepy-normal-cartoon-v1',
    name: 'Creepy Normal Cartoon v1',
    category: 'cartoon',
    description: 'Brighter version of Dark Cartoon v1 with increased colour variety',
    prompt: 'creepy cartoon style, bright vibrant colors, varied color palette, unsettling atmosphere, simple cartoon characters, clear outlines, slightly off-putting expressions, flat cel shading',
    isPremium: false
  },
  {
    id: 'creepy-normal-cartoon-v2',
    name: 'Creepy Normal Cartoon v2',
    category: 'cartoon',
    description: 'Brighter version of Dark Cartoon v2 with increased colour variety',
    prompt: 'creepy colorful cartoon, vibrant varied palette, slightly unsettling mood, smooth cartoon art style, clean character design, subtle gradient shading, cheerful but eerie aesthetic',
    isBeta: true,
    isPremium: false
  },
  {
    id: 'polished-cartoon',
    name: 'Polished Cartoon',
    category: 'cartoon',
    description: 'Polished Cartoon style with thick black outlines and flat cel shading',
    prompt: 'polished clean cartoon, thick bold black outlines, flat cel shading, smooth clean lines, bright solid colors, animated tv series style, simple character shapes, professional animation look',
    isPremium: false
  },
  {
    id: 'adult-cartoon',
    name: 'Adult Cartoon',
    category: 'cartoon',
    description: 'Basic dark cartoon style with bold outlines and exaggerated features',
    prompt: 'adult cartoon style, bold thick outlines, exaggerated character proportions, mature edgy themes, dark humor aesthetic, simplified shapes, flat colors with minimal shading, crude but intentional art',
    isPremium: false
  },
  
  // Realistic/Comic Styles
  {
    id: 'comic-realism',
    name: 'Comic Realism',
    category: 'realistic',
    description: 'Realistic comic style blending detailed art with comic aesthetics',
    prompt: 'comic book realism, detailed semi-realistic art, dramatic comic lighting, strong ink outlines, comic book aesthetics, hatching and cross-hatching details, painted style coloring, graphic novel quality',
    isPremium: false
  },
  {
    id: 'dark-comic',
    name: 'Dark Comic',
    category: 'realistic',
    description: 'Moody comic style with rich shadows and dramatic contrasts',
    prompt: 'dark gritty comic book style, rich deep shadows, high contrast dramatic lighting, noir atmosphere, heavy black inks, textured gritty details, moody limited color palette, graphic novel realism',
    isPremium: false
  },
  {
    id: 'cinematic',
    name: 'Cinematic',
    category: 'realistic',
    description: 'Film-quality visuals with depth, lighting, and professional composition',
    prompt: 'cinematic film quality, realistic depth of field, professional movie lighting, dramatic composition, shallow focus background blur, film grain texture, color graded like cinema, photorealistic but stylized',
    isPremium: false
  },
  
  // Historical/Period Styles
  {
    id: '18th-century-historical',
    name: '18th Century Historical',
    category: 'historical',
    description: 'Historical painting style from the 18th century era',
    prompt: '18th century classical painting, oil painting texture, historical period accurate, renaissance art style, rich detailed brushwork, warm classical colors, traditional portrait composition, museum quality art',
    isPremium: false
  },
  {
    id: 'satirical-2d',
    name: 'Satirical 2D',
    category: 'historical',
    description: 'Whiteboard and black marker art style only',
    prompt: 'whiteboard marker drawing, simple black line art, hand-drawn sketch aesthetic, minimal clean lines, no colors just black and white, quick sketch style, educational diagram look, stick figure simplicity',
    isPremium: false
  },
  
  // Animation Studio Styles
  {
    id: 'pixar',
    name: 'Pixar',
    category: 'studio',
    description: 'Pixar animation style with 3D rendered characters',
    prompt: '3d pixar animation style, smooth rendered characters, warm soft lighting, expressive cartoon faces, rounded character proportions, vibrant saturated colors, high quality 3d render, family-friendly animation aesthetic',
    isPremium: false
  },
  {
    id: '90s-disney',
    name: '90s Disney',
    category: 'studio',
    description: 'Classic 90s Disney animation style',
    prompt: '1990s disney hand-drawn animation, classic cel animation style, smooth flowing lines, vibrant nostalgic colors, traditional 2d animation aesthetic, clean character design, disney renaissance era quality',
    isPremium: false
  },
  {
    id: 'studio-ghibli',
    name: 'Studio Ghibli',
    category: 'studio',
    description: 'Studio Ghibli style with soft watercolor and hand-painted details',
    prompt: 'studio ghibli anime style, soft watercolor backgrounds, hand-painted details, whimsical peaceful atmosphere, gentle pastel colors, detailed natural elements, dreamy quality, japanese animation aesthetic',
    isPremium: false
  },
  {
    id: 'simpsons',
    name: 'Simpsons',
    category: 'studio',
    description: 'Simpsons style',
    prompt: 'simpsons cartoon style, yellow skin characters, thick black outlines, flat bright colors, simplified character shapes, iconic sitcom animation aesthetic, bold simple designs, overbite character feature',
    isPremium: false
  },
  
  // Game/Pop Culture Styles
  {
    id: 'lego',
    name: 'Lego',
    category: 'game',
    description: 'Lego style!',
    prompt: 'lego brick style, plastic toy texture, brick-built characters, blocky geometric shapes, shiny plastic material, construction toy aesthetic, bright solid colors, minifigure proportions',
    isPremium: false
  },
  {
    id: 'minecraft',
    name: 'Minecraft',
    category: 'game',
    description: 'Minecraft style!',
    prompt: 'minecraft voxel style, blocky cubic shapes, pixelated low-resolution textures, 16-bit aesthetic, geometric block-based world, sandbox game look, simple flat colors, retro pixel art style',
    isPremium: false
  },
  
  // Anime Styles
  {
    id: 'cute-anime',
    name: 'Cute Anime',
    category: 'anime',
    description: 'Charming anime-inspired art with expressive characters and soft colors',
    prompt: 'cute kawaii anime style, large expressive eyes, soft pastel colors, chibi proportions, manga-inspired line art, adorable character design, gentle shading, japanese animation aesthetic, innocent charm',
    isPremium: false
  }
];

export const DEFAULT_CONFIG = {
  format: "YouTube Short (Vertical 9:16)" as any,
  selectedIdea: null,
  duration: DURATION_OPTIONS[0],
  voice: 'onyx', // Default to High Quality OpenAI voice
  audioProvider: 'puter' as const, 
  audioEngine: 'neural' as const,
  audioStyle: 'suspenseful', // Default style
  characterDescription: 'A pale young man with messy black hair, wearing a torn grey hoodie and jeans.',
  artStyleId: 'dark-cartoon-v1' // Default style
};