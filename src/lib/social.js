/**
 * Utility functions for robust formatting and display of Facebook and Instagram URLs
 */

export function formatInstagramUrl(val) {
  if (!val || typeof val !== 'string') return '';
  let clean = val.trim().replace(/^['"<]+|['">]+$/g, '');
  if (!clean) return '';

  // Filter out numeric Facebook Page IDs (e.g. 100064095272954, 61573358669963)
  // Instagram handles can NEVER be just long numbers
  if (/^\d{6,}$/.test(clean)) return '';

  // Strip mobile deep-link prefix `_u/`
  clean = clean.replace(/instagram\.com\/_u\//i, 'instagram.com/');

  // If already starts with http/https
  if (/^https?:\/\//i.test(clean)) {
    // Verify it is an Instagram domain
    if (!clean.includes('instagram.com')) return '';
    clean = clean.split('?')[0].split('#')[0];
    return clean.endsWith('/') ? clean : `${clean}/`;
  }

  // If starts with (www.)instagram.com
  if (/^(www\.)?instagram\.com/i.test(clean)) {
    clean = clean.split('?')[0].split('#')[0];
    const full = `https://${clean.replace(/^\/+/, '')}`;
    return full.endsWith('/') ? full : `${full}/`;
  }

  // Handle bare handle: @username, username, or username/
  const handle = clean
    .replace(/^@/, '')
    .replace(/^\/+|\/+$/g, '')
    .split('?')[0]
    .split('#')[0];

  // Instagram handle validation: 1-30 chars, alphanumeric + dots/underscores, not purely numeric, no spaces
  if (!handle || handle.includes(' ') || handle.includes('/') || /^\d+$/.test(handle)) {
    return '';
  }

  return `https://www.instagram.com/${handle}/`;
}

export function formatFacebookUrl(val) {
  if (!val || typeof val !== 'string') return '';
  let clean = val.trim().replace(/^['"<]+|['">]+$/g, '');
  if (!clean) return '';

  // If this is actually an Instagram URL, don't format as Facebook
  if (clean.includes('instagram.com')) return '';

  // Already http/https
  if (/^https?:\/\//i.test(clean)) {
    return clean;
  }

  // Starts with (www.)facebook.com
  if (/^(www\.)?facebook\.com/i.test(clean)) {
    return `https://${clean.replace(/^\/+/, '')}`;
  }

  const handle = clean.replace(/^@/, '').replace(/^\/+|\/+$/g, '');
  if (!handle || handle.includes(' ')) return '';
  return `https://www.facebook.com/${handle}`;
}

export function getCleanHandle(url, type = 'instagram') {
  if (!url || typeof url !== 'string') return '';
  let clean = url.trim().replace(/^['"<]+|['">]+$/g, '');

  if (type === 'instagram') {
    clean = clean.replace(/^https?:\/\/(www\.)?instagram\.com\/(_u\/)?/i, '');
    clean = clean.replace(/^\/+|\/+$/g, '').replace(/^@/, '');
    return clean || 'Instagram';
  }

  // Facebook
  clean = clean.replace(/^https?:\/\/(www\.)?facebook\.com\/?/i, '');
  clean = clean.replace(/^\/+|\/+$/g, '').replace(/^@/, '');
  return clean || 'Page';
}

export function resolveSocialUrls(lead) {
  let fb = lead?.facebookUrl || lead?.pageUrl || '';
  let ig = lead?.instagramUrl || '';

  // If facebookUrl is actually an Instagram profile URL, re-route it
  if (fb && fb.includes('instagram.com') && !ig) {
    ig = fb;
    fb = '';
  }

  const resolvedFb = formatFacebookUrl(fb);
  const resolvedIg = formatInstagramUrl(ig);

  return {
    facebookUrl: resolvedFb,
    instagramUrl: resolvedIg,
    facebookHandle: resolvedFb ? getCleanHandle(resolvedFb, 'facebook') : '',
    instagramHandle: resolvedIg ? getCleanHandle(resolvedIg, 'instagram') : '',
  };
}

/**
 * Extract clean handle or page ID from Facebook URL
 */
export function getFacebookIdOrHandle(url) {
  if (!url || typeof url !== 'string') return '';
  const clean = url.trim().replace(/^['"<]+|['">]+$/g, '');

  // match /pages/.../61585003011686
  const pageMatch = clean.match(/facebook\.com\/pages\/[^/]+\/(\d+)/i);
  if (pageMatch) return pageMatch[1];

  // match profile.php?id=100064095272954
  const profileMatch = clean.match(/facebook\.com\/profile\.php\?id=(\d+)/i);
  if (profileMatch) return profileMatch[1];

  // match facebook.com/100070889464847 or facebook.com/sunzanasreen/
  const handleMatch = clean.match(/facebook\.com\/([a-zA-Z0-9._-]+)\/?/i);
  if (handleMatch) {
    const handle = handleMatch[1];
    if (!['pages', 'groups', 'events', 'watch', 'marketplace', 'ads', 'sharer'].includes(handle.toLowerCase())) {
      return handle;
    }
  }

  return '';
}

/**
 * Determine genuine external website vs Facebook fallback
 */
export function getDisplayWebsite(lead) {
  if (!lead) return { url: '', display: '', isWebsite: false, isFacebook: false, isInstagram: false };

  const rawWeb = String(lead.websiteUrl || '').trim();
  const isSocial =
    !rawWeb ||
    /\b(facebook|instagram|fb|messenger|tiktok|wa\.me|whatsapp)\.com\b/i.test(rawWeb) ||
    rawWeb.includes('m.me');

  // If lead has a genuine external website (not a social media link)
  if (!isSocial && rawWeb) {
    const cleanUrl = rawWeb.startsWith('http') ? rawWeb : `https://${rawWeb}`;
    const display = cleanUrl.replace(/^https?:\/\/(www\.)?/, '').replace(/\/+$/, '');
    return {
      url: cleanUrl,
      display,
      isWebsite: true,
      isFacebook: false,
      isInstagram: false,
    };
  }

  // Fallback to Facebook Page URL
  const fbUrl = lead.facebookUrl || lead.pageUrl || '';
  if (fbUrl) {
    const cleanUrl = fbUrl.trim().startsWith('http') ? fbUrl.trim() : `https://${fbUrl.trim()}`;
    const display = cleanUrl.replace(/^https?:\/\/(www\.)?/, '').replace(/\/+$/, '');
    return {
      url: cleanUrl,
      display,
      isWebsite: false,
      isFacebook: true,
      isInstagram: false,
    };
  }

  // Fallback to Instagram Profile URL
  const igUrl = lead.instagramUrl || '';
  if (igUrl) {
    const cleanUrl = igUrl.trim().startsWith('http') ? igUrl.trim() : `https://${igUrl.trim()}`;
    const display = cleanUrl.replace(/^https?:\/\/(www\.)?/, '').replace(/\/+$/, '');
    return {
      url: cleanUrl,
      display,
      isWebsite: false,
      isFacebook: false,
      isInstagram: true,
    };
  }

  return {
    url: '',
    display: '',
    isWebsite: false,
    isFacebook: false,
    isInstagram: false,
  };
}

/**
 * Determine direct messaging link (Messenger, WhatsApp, or Instagram Direct)
 */
export function getDirectMessageInfo(lead) {
  if (!lead) return null;

  const cta = String(lead.ctaText || '').toLowerCase();
  const phones = Array.isArray(lead.phones) ? lead.phones : [];

  // 1. WhatsApp Priority if CTA mentions WhatsApp or whatsappUrl exists
  if (cta.includes('whatsapp') || lead.whatsappUrl) {
    const waUrl = lead.whatsappUrl || (phones[0] ? `https://wa.me/${phones[0].replace(/[^0-9]/g, '')}` : '');
    if (waUrl) {
      return {
        url: waUrl,
        type: 'WhatsApp',
        label: 'Message',
      };
    }
  }

  // 2. Facebook Messenger via m.me
  const fbUrl = lead.facebookUrl || lead.pageUrl || '';
  const fbId = getFacebookIdOrHandle(fbUrl);
  if (fbId) {
    return {
      url: `https://m.me/${fbId}`,
      type: 'Messenger',
      label: 'Message',
    };
  }

  // 3. Instagram Direct via ig.me
  const igUrl = lead.instagramUrl || '';
  if (igUrl) {
    const igHandle = igUrl.replace(/^https?:\/\/(www\.)?instagram\.com\/(_u\/)?/i, '').replace(/^\/+|\/+$/g, '');
    if (igHandle && !/^\d+$/.test(igHandle)) {
      return {
        url: `https://ig.me/m/${igHandle}`,
        type: 'Instagram',
        label: 'Message',
      };
    }
  }

  // 4. WhatsApp fallback if phone exists
  if (phones.length > 0) {
    const cleanPhone = phones[0].replace(/[^0-9]/g, '');
    if (cleanPhone.length >= 8) {
      return {
        url: `https://wa.me/${cleanPhone}`,
        type: 'WhatsApp',
        label: 'Message',
      };
    }
  }

  // 5. Fallback to Facebook page directly
  if (fbUrl) {
    return {
      url: fbUrl,
      type: 'Facebook',
      label: 'Message',
    };
  }

  return null;
}
