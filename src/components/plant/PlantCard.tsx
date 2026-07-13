import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native'
import { Species } from '../../types'
import { colors, spacing, radius, typography, shadows } from '../../constants/theme'
import { BIOME_COLORS, GROWTH_FORM_ICONS, WATER_USE_COLORS, CONSERVATION_COLORS } from '../../constants'
import { Badge } from '../ui/Badge'
import { useAppStore } from '../../store'

interface PlantCardProps {
  species:   Species
  onPress:   (s: Species) => void
  biome?:    string
}

export function PlantCard({ species, onPress, biome }: PlantCardProps) {
  const { isSaved, toggleSaved } = useAppStore()
  const saved = isSaved(species.accepted_name)

  const growthIcon  = Object.entries(GROWTH_FORM_ICONS).find(([k]) =>
    species.growth_form?.toLowerCase().includes(k.toLowerCase())
  )?.[1] ?? '🌱'
  const waterColor  = WATER_USE_COLORS[species.water_use] ?? colors.leaf
  const consColor   = CONSERVATION_COLORS[species.conservation_status] ?? colors.leaf
  const biomeColor  = biome ? BIOME_COLORS[biome] ?? colors.canopy : colors.canopy

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(species)}
      activeOpacity={0.92}
    >
      {/* Top accent bar — biome colour */}
      <View style={[styles.accentBar, { backgroundColor: biomeColor }]} />

      <View style={styles.body}>
        {/* Header row */}
        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <Text style={styles.growthIcon}>{growthIcon}</Text>
          </View>
          <View style={styles.nameBlock}>
            <Text style={styles.commonName} numberOfLines={1}>
              {species.common_name_en}
            </Text>
            <Text style={styles.sciName} numberOfLines={1}>
              {species.accepted_name}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => toggleSaved(species.accepted_name)}
            hitSlop={{ top: 12, right: 12, bottom: 12, left: 12 }}
          >
            <Text style={styles.heart}>{saved ? '♥' : '♡'}</Text>
          </TouchableOpacity>
        </View>

        {/* Trait row */}
        <View style={styles.traits}>
          <View style={styles.traitPill}>
            <View style={[styles.traitDot, { backgroundColor: waterColor }]} />
            <Text style={styles.traitText}>
              {species.water_use?.replace('Extremely ', 'Ext. ') ?? '—'}
            </Text>
          </View>
          <View style={styles.traitPill}>
            <Text style={styles.traitText}>
              {species.sun_exposure?.replace(' to ', '/') ?? '—'}
            </Text>
          </View>
          {species.mature_height_cm && (
            <View style={styles.traitPill}>
              <Text style={styles.traitText}>
                {species.mature_height_cm >= 100
                  ? `${(species.mature_height_cm / 100).toFixed(1)}m`
                  : `${species.mature_height_cm}cm`}
              </Text>
            </View>
          )}
        </View>

        {/* Bottom badges */}
        <View style={styles.badges}>
          {species.fire_adapted && (
            <Badge label="🔥 Fire-adapted" color={colors.pollen} size="sm" />
          )}
          {species.edible && (
            <Badge label="🌿 Edible" color={colors.canopy} size="sm" />
          )}
          {species.medicinal && (
            <Badge label="⚕ Medicinal" color={colors.sky} size="sm" />
          )}
          <Badge
            label={species.conservation_status ?? '—'}
            color={consColor}
            size="sm"
            style={styles.consBadge}
          />
        </View>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius:    radius.lg,
    overflow:        'hidden',
    marginBottom:    spacing.sm,
    ...shadows.md,
  },
  accentBar: {
    height: 4,
    width:  '100%',
  },
  body: {
    padding: spacing.md,
    gap:     spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           spacing.sm,
  },
  iconCircle: {
    width:           42,
    height:          42,
    borderRadius:    21,
    backgroundColor: colors.dew,
    alignItems:      'center',
    justifyContent:  'center',
  },
  growthIcon: { fontSize: 20 },
  nameBlock:  { flex: 1 },
  commonName: {
    ...typography.displaySm,
    fontSize:   17,
    color:      colors.forest,
    lineHeight: 22,
  },
  sciName: {
    ...typography.scientific,
    fontSize: 13,
    color:    colors.slate,
  },
  heart: {
    fontSize: 22,
    color:    colors.bloom,
  },
  traits: {
    flexDirection:  'row',
    flexWrap:       'wrap',
    gap:            spacing.xs,
  },
  traitPill: {
    flexDirection:   'row',
    alignItems:      'center',
    gap:             4,
    backgroundColor: colors.parchment,
    borderRadius:    radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical:   3,
  },
  traitDot: {
    width:        6,
    height:       6,
    borderRadius: 3,
  },
  traitText: {
    ...typography.labelMd,
    color: colors.charcoal,
  },
  badges: {
    flexDirection: 'row',
    flexWrap:      'wrap',
    gap:           spacing.xs,
    marginTop:     2,
  },
  consBadge: { marginLeft: 'auto' },
})
