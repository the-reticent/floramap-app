import React, { useEffect, useState } from 'react'
import {
  View, Text, StyleSheet, Image,
  TouchableOpacity, ActivityIndicator, Dimensions
} from 'react-native'
import { colors, spacing, radius, typography } from '../../constants/theme'
import { fetchSpeciesImages, PlantImage } from '../../lib/images'

interface HeroImageProps {
  acceptedName: string
  gbifTaxonKey?: string
  fallbackIcon: string
  biomeColor: string
}

const { width: SCREEN_W } = Dimensions.get('window')
const HERO_H = Math.min(280, SCREEN_W * 0.6)

export function HeroImage({ acceptedName, gbifTaxonKey, fallbackIcon, biomeColor }: HeroImageProps) {
  const [images, setImages]   = useState<PlantImage[]>([])
  const [current, setCurrent] = useState(0)
  const [loading, setLoading] = useState(true)
  const [imgError, setImgError] = useState(false)

  useEffect(() => {
    setLoading(true)
    setImages([])
    setCurrent(0)
    setImgError(false)
    fetchSpeciesImages(acceptedName, gbifTaxonKey, 6)
      .then(setImages)
      .finally(() => setLoading(false))
  }, [acceptedName, gbifTaxonKey])

  const photo = images[current]

  if (loading) {
    return (
      <View style={[styles.placeholder, { backgroundColor: biomeColor + '18', height: HERO_H }]}>
        <ActivityIndicator color={biomeColor} />
        <Text style={[styles.loadingText, { color: biomeColor }]}>Loading photos…</Text>
      </View>
    )
  }

  if (!photo || imgError) {
    return (
      <View style={[styles.placeholder, { backgroundColor: biomeColor + '18', height: HERO_H }]}>
        <Text style={styles.fallbackIcon}>{fallbackIcon}</Text>
        <Text style={[styles.noPhotoText, { color: biomeColor }]}>No photo available</Text>
      </View>
    )
  }

  return (
    <View style={[styles.wrap, { height: HERO_H }]}>
      <Image
        source={{ uri: photo.url }}
        style={styles.image}
        resizeMode="cover"
        onError={() => setImgError(true)}
      />

      {/* Gradient overlay at bottom */}
      <View style={styles.overlay} />

      {/* Attribution */}
      <View style={styles.attribution}>
        <Text style={styles.attributionText} numberOfLines={1}>
          📷 {photo.photographer}
        </Text>
        <Text style={styles.licenseText}>{photo.license}</Text>
      </View>

      {/* Photo counter + navigation */}
      {images.length > 1 && (
        <View style={styles.navRow}>
          <TouchableOpacity
            style={[styles.navBtn, current === 0 && styles.navBtnDisabled]}
            onPress={() => { setCurrent(c => c - 1); setImgError(false) }}
            disabled={current === 0}
          >
            <Text style={styles.navText}>‹</Text>
          </TouchableOpacity>

          {/* Dots */}
          <View style={styles.dots}>
            {images.map((_, i) => (
              <TouchableOpacity key={i} onPress={() => { setCurrent(i); setImgError(false) }}>
                <View style={[styles.dot, i === current && styles.dotActive]} />
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.navBtn, current === images.length - 1 && styles.navBtnDisabled]}
            onPress={() => { setCurrent(c => c + 1); setImgError(false) }}
            disabled={current === images.length - 1}
          >
            <Text style={styles.navText}>›</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    width:        '100%',
    borderRadius: radius.xl,
    overflow:     'hidden',
    position:     'relative',
  },
  image: {
    width:  '100%',
    height: '100%',
  },
  overlay: {
    position:        'absolute',
    bottom:          0,
    left:            0,
    right:           0,
    height:          80,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  attribution: {
    position: 'absolute',
    bottom:   36,
    left:     spacing.md,
    right:    spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems:     'center',
  },
  attributionText: {
    ...typography.labelMd,
    color:   'rgba(255,255,255,0.9)',
    flex:    1,
  },
  licenseText: {
    ...typography.labelSm,
    color: 'rgba(255,255,255,0.6)',
  },
  navRow: {
    position:       'absolute',
    bottom:         8,
    left:           0,
    right:          0,
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'center',
    gap:            spacing.sm,
  },
  navBtn: {
    width:           28,
    height:          28,
    borderRadius:    14,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems:      'center',
    justifyContent:  'center',
  },
  navBtnDisabled: { opacity: 0.3 },
  navText: {
    color:     'white',
    fontSize:  20,
    lineHeight: 24,
  },
  dots: {
    flexDirection: 'row',
    gap:           5,
    alignItems:    'center',
  },
  dot: {
    width:        6,
    height:       6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  dotActive: { backgroundColor: 'white', width: 8, height: 8, borderRadius: 4 },
  placeholder: {
    width:          '100%',
    borderRadius:   radius.xl,
    alignItems:     'center',
    justifyContent: 'center',
    gap:            spacing.sm,
  },
  fallbackIcon:  { fontSize: 52 },
  noPhotoText:   { ...typography.bodyMd },
  loadingText:   { ...typography.bodySm },
})
