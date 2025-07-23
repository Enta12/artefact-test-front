interface RGB {
  r: number;
  g: number;
  b: number;
}

interface HSL {
  h: number;
  s: number;
  l: number;
}

interface ColorConfig {
  minContrast?: number;
  maxColorValue?: number;
  saturation?: number;
  lightness?: number;
}

const DEFAULT_CONFIG: ColorConfig = {
  minContrast: 4.5,
  maxColorValue: 200,
  saturation: 65,
  lightness: 45
};

export const getLuminance = ({ r, g, b }: RGB): number => {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
};

export const WHITE_LUMINANCE = getLuminance({ r: 255, g: 255, b: 255 });

export const getContrast = (l1: number, l2: number): number => {
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
};

const hslToRgb = ({ h, s, l }: HSL): RGB => {
  s /= 100;
  l /= 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = l - c / 2;

  let r = 0, g = 0, b = 0;

  if (0 <= h && h < 60) {
    [r, g, b] = [c, x, 0];
  } else if (60 <= h && h < 120) {
    [r, g, b] = [x, c, 0];
  } else if (120 <= h && h < 180) {
    [r, g, b] = [0, c, x];
  } else if (180 <= h && h < 240) {
    [r, g, b] = [0, x, c];
  } else if (240 <= h && h < 300) {
    [r, g, b] = [x, 0, c];
  } else if (300 <= h && h < 360) {
    [r, g, b] = [c, 0, x];
  }

  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255)
  };
};

export const rgbToHex = ({ r, g, b }: RGB): string => {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
};

export const generateAccessibleColor = (config: ColorConfig = DEFAULT_CONFIG): string => {
  const { saturation = 65, lightness = 45 } = config;
    const hue = Math.floor(Math.random() * 360);
    const hsl: HSL = {
    h: hue,
    s: saturation,
    l: lightness
  };

  const rgb = hslToRgb(hsl);
  return rgbToHex(rgb);
}; 