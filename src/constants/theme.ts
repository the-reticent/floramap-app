// FloraMap design system
// Aesthetic: Refined field-guide meets modern app
// Palette: Deep forest greens, warm earthy tans, clean whites
// Typography: Serif display + clean sans body

export const colors = {
  // Primary greens
  forest:      '#1A3C2B',
  canopy:      '#2D6A4F',
  leaf:        '#52B69A',
  moss:        '#74C69D',
  mist:        '#B7E4C7',
  dew:         '#D8F3DC',

  // Warm earths
  soil:        '#5C3D2E',
  clay:        '#8B6347',
  sand:        '#C9A87A',
  stone:       '#E8DCC8',
  parchment:   '#F5F0E8',

  // Neutrals
  ink:         '#1A1A18',
  charcoal:    '#3D3D3A',
  slate:       '#73726C',
  ash:         '#ADABA3',
  cloud:       '#E8E6E0',
  white:       '#FAFAF7',

  // Accents
  bloom:       '#D4516A',  // protea pink
  pollen:      '#E8A838',  // yellow
  sky:         '#4A90D9',  // clear sky blue

  // Semantic
  success:     '#52B69A',
  warning:     '#E8A838',
  danger:      '#D4516A',
  info:        '#4A90D9',
}

export const spacing = {
  xs:  4,
  sm:  8,
  md:  16,
  lg:  24,
  xl:  32,
  xxl: 48,
}

export const radius = {
  sm:  6,
  md:  12,
  lg:  20,
  xl:  32,
  full: 999,
}

export const typography = {
  // Display — for hero text, species names
  displayLg:  { fontFamily: 'serif', fontSize: 36, lineHeight: 42, fontWeight: '700' as const },
  displayMd:  { fontFamily: 'serif', fontSize: 28, lineHeight: 34, fontWeight: '700' as const },
  displaySm:  { fontFamily: 'serif', fontSize: 22, lineHeight: 28, fontWeight: '600' as const },

  // Body — clean sans
  bodyLg:     { fontSize: 17, lineHeight: 26 },
  bodyMd:     { fontSize: 15, lineHeight: 22 },
  bodySm:     { fontSize: 13, lineHeight: 19 },

  // Labels
  labelLg:    { fontSize: 13, lineHeight: 16, fontWeight: '600' as const, letterSpacing: 0.8 },
  labelMd:    { fontSize: 11, lineHeight: 14, fontWeight: '600' as const, letterSpacing: 0.6 },
  labelSm:    { fontSize: 10, lineHeight: 13, fontWeight: '700' as const, letterSpacing: 1.0 },

  // Scientific names — italic serif
  scientific: { fontFamily: 'serif', fontSize: 15, fontStyle: 'italic' as const, lineHeight: 22 },
}

export const shadows = {
  sm: {
    shadowColor: '#1A3C2B',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#1A3C2B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  lg: {
    shadowColor: '#1A3C2B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 24,
    elevation: 12,
  },
}
