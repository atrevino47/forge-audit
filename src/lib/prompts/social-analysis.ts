// src/lib/prompts/social-analysis.ts
// Social media analysis — Sonnet (visual + content understanding required)

import type { SupportedLanguage } from '../../../contracts/constants';

export interface SocialData {
  url: string;
  industry: string;
  businessSize: string;
  platforms: {
    instagram?: {
      handle: string;
      bio: string | null;
      followerCount: number | null;
      postCount: number | null;
      hasProfilePic: boolean;
      hasCoverPhoto: boolean;
      hasContactInfo: boolean;
      hasWebsiteLink: boolean;
      recentPosts: {
        date: string;
        caption: string | null;
        likes: number | null;
        comments: number | null;
        type: 'image' | 'video' | 'reel' | 'carousel';
      }[];
    };
    facebook?: {
      url: string;
      pageName: string | null;
      hasProfilePic: boolean;
      hasCoverPhoto: boolean;
      hasAbout: boolean;
      hasContactInfo: boolean;
      followerCount: number | null;
      recentPosts: {
        date: string;
        content: string | null;
        reactions: number | null;
        comments: number | null;
        shares: number | null;
      }[];
    };
    tiktok?: {
      handle: string;
      bio: string | null;
      followerCount: number | null;
      videoCount: number | null;
      recentVideos: {
        date: string;
        description: string | null;
        views: number | null;
        likes: number | null;
      }[];
    };
    linkedin?: {
      url: string;
      companyName: string | null;
      hasLogo: boolean;
      hasBanner: boolean;
      hasDescription: boolean;
      followerCount: number | null;
      recentPosts: {
        date: string;
        content: string | null;
        reactions: number | null;
        comments: number | null;
      }[];
    };
  };
}

export const socialAnalysisPrompt = {
  system: (language: SupportedLanguage) =>
    `You are an expert social media strategist. Analyze the business's social media presence across all provided platforms. Assess profile completeness, content quality, posting consistency, and engagement. Always respond in ${language === 'es' ? 'Spanish' : 'English'}. Return ONLY valid JSON — no markdown fences, no commentary.`,

  user: (data: SocialData) => {
    const platformSections: string[] = [];

    if (data.platforms.instagram) {
      const ig = data.platforms.instagram;
      platformSections.push(`
INSTAGRAM (@${ig.handle}):
- Bio: ${ig.bio ?? 'Not set'}
- Followers: ${ig.followerCount ?? 'Unknown'}
- Posts: ${ig.postCount ?? 'Unknown'}
- Profile pic: ${ig.hasProfilePic}
- Contact info: ${ig.hasContactInfo}
- Website link: ${ig.hasWebsiteLink}
- Recent posts (last 30 days): ${JSON.stringify(ig.recentPosts.slice(0, 12), null, 2)}`);
    }

    if (data.platforms.facebook) {
      const fb = data.platforms.facebook;
      platformSections.push(`
FACEBOOK (${fb.pageName ?? fb.url}):
- Profile pic: ${fb.hasProfilePic}
- Cover photo: ${fb.hasCoverPhoto}
- About section: ${fb.hasAbout}
- Contact info: ${fb.hasContactInfo}
- Followers: ${fb.followerCount ?? 'Unknown'}
- Recent posts (last 30 days): ${JSON.stringify(fb.recentPosts.slice(0, 12), null, 2)}`);
    }

    if (data.platforms.tiktok) {
      const tt = data.platforms.tiktok;
      platformSections.push(`
TIKTOK (@${tt.handle}):
- Bio: ${tt.bio ?? 'Not set'}
- Followers: ${tt.followerCount ?? 'Unknown'}
- Videos: ${tt.videoCount ?? 'Unknown'}
- Recent videos: ${JSON.stringify(tt.recentVideos.slice(0, 10), null, 2)}`);
    }

    if (data.platforms.linkedin) {
      const li = data.platforms.linkedin;
      platformSections.push(`
LINKEDIN (${li.companyName ?? li.url}):
- Logo: ${li.hasLogo}
- Banner: ${li.hasBanner}
- Description: ${li.hasDescription}
- Followers: ${li.followerCount ?? 'Unknown'}
- Recent posts: ${JSON.stringify(li.recentPosts.slice(0, 10), null, 2)}`);
    }

    const activePlatforms = Object.keys(data.platforms).filter(
      (k) => data.platforms[k as keyof typeof data.platforms] !== undefined
    );

    return `Analyze this business's social media presence:

URL: ${data.url}
Industry: ${data.industry}
Business Size: ${data.businessSize}
Active platforms: ${activePlatforms.join(', ') || 'None provided'}
${platformSections.join('\n')}

${activePlatforms.length === 0 ? 'No social media accounts were provided. Score this category very low and recommend establishing presence on the most relevant platforms for their industry.' : ''}

Return JSON matching this schema:
{
  "subCategories": [
    {
      "name": "Profile Completeness",
      "score": 0-100,
      "items": [
        {
          "id": "ig_profile",
          "label": "Instagram Profile",
          "status": "pass" | "fail" | "warning",
          "detail": "Assessment of profile completeness"
        }
      ]
    },
    {
      "name": "Content Quality",
      "score": 0-100,
      "items": [...]
    },
    {
      "name": "Posting Frequency",
      "score": 0-100,
      "items": [...]
    },
    {
      "name": "Engagement",
      "score": 0-100,
      "items": [...]
    },
    {
      "name": "Platform Presence",
      "score": 0-100,
      "items": [...]
    }
  ],
  "recommendations": [
    {
      "title": "Short action title",
      "description": "Detailed, actionable explanation with platform-specific advice",
      "priority": "high" | "medium" | "low",
      "effort": "quick-win" | "moderate" | "major-project",
      "impact": "high" | "medium" | "low"
    }
  ]
}

Scoring guidelines:
- Profile completeness: bio, profile pic, cover/banner, contact info, website link — each missing element reduces score
- Content quality: visual consistency, caption quality, hashtag usage, mix of content types
- Posting frequency: ≥3/week = pass, 1-2/week = warning, <1/week or inactive >14 days = fail
- Engagement: >3% rate = pass, 1-3% = warning, <1% = fail (adjust by industry/platform)
- Platform presence: score based on how many relevant platforms are active vs. dormant

Provide at least 3-5 recommendations prioritized by impact.`;
  },
};
