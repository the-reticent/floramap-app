import React from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView
} from 'react-native'
import { colors, spacing, radius, typography, shadows } from '../../constants/theme'
import { GROWTH_FORM_ICONS } from '../../constants'
import { Species } from '../../types'
import { useAppStore } from '../../store'

interface CompanionPlantsProps {
  companions: string[]           // accepted_name strings from seed data
  onPress: (name: string) => void
}

export function CompanionPlants({ companions, onPress }: CompanionPlantsProps) {
  const { nativePlants } = useAppStore()

  // Match companion names to full species objects from the current location
  const matched = companions
    .map(name => nativePlants.find(p => p.accepted_name === name))
    .filter((p): p is Species => !!p)

  // Unmatched — show as name-only chips (species not in current veg type)
  const unmatched = companions.filter(
    name => !nativePlants.find(p => p.accepted_name === name)
  )

  if (companions.length === 0) return null

  return (
    <View style={styles.wrap}>
      {/* Matched companions — full cards */}
      {matched.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
        >
          {matched.map((sp) => {
            const icon = Object.entries(GROWTH_FORM_ICONS).find(([k]) =>
              sp.growth_form?.toLowerCase().includes(k.toLowerCase())
            )?.[1] ?? '🌱'
            return (
              <TouchableOpacity
                key={sp.accepted_name}
                style={styles.card}
                onPress={() => onPress(sp.accepted_name)}
                activeOpacity={0.85}
              >
                <View style={styles.cardIcon}>
                  <Text style={styles.cardIconText}>{icon}</Text>
                </View>
                <Text style={styles.cardCommon} numberOfLines={1}>
                  {sp.common_name_en}
                </Text>
                <Text style={styles.cardSci} numberOfLines={1}>
                  {sp.accepted_name}
                </Text>
                <Text style={styles.cardForm} numberOfLines={1}>
                  {sp.growth_form}
                </Text>
              </TouchableOpacity>
            )
          })}
        </ScrollView>
      )}

      {/* Unmatched — name-only pills */}
      {unmatched.length > 0 && (
        <View style={styles.pillWrap}>
          {unmatched.map((name) => (
            <View key={name} style={styles.pill}>
              <Text style={styles.pillText} numberOfLines={1}>{name}</Text>
            </View>
          ))}
        </View>
      )}

      <Text style={styles.hint}>
        {matched.length > 0
          ? 'Tap a companion to view its full profile'
          : 'These species grow naturally alongside this plant'}
      </Text>
    </View>
  )
}

const CARD_W = 130

const styles = StyleSheet.create({
  wrap:   { gap: spacing.sm },
  scroll: { gap: spacing.sm, paddingBottom: 4 },
  card: {
    width:           CARD_W,
    backgroundColor: colors.white,
    borderRadius:    radius.lg,
    padding:         spacing.sm,
    gap:             3,
    ...shadows.sm,
  },
  cardIcon: {
    width:           36,
    height:          36,
    borderRadius:    18,
    backgroundColor: colors.dew,
    alignItems:      'center',
    justifyContent:  'center',
    marginBottom:    2,
  },
  cardIconText: { fontSize: 18 },
  cardCommon: {
    ...typography.bodyMd,
    fontSize:   13,
    fontWeight: '600',
    color:      colors.forest,
  },
  cardSci: {
    ...typography.scientific,
    fontSize: 11,
    color:    colors.slate,
  },
  cardForm: {
    ...typography.labelSm,
    color: colors.ash,
  },
  pillWrap: {
    flexDirection: 'row',
    flexWrap:      'wrap',
    gap:           spacing.xs,
  },
  pill: {
    backgroundColor:  colors.parchment,
    borderRadius:     radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical:   3,
    borderWidth:       1,
    borderColor:       colors.cloud,
  },
  pillText: { ...typography.labelMd, color: colors.charcoal },
  hint:     { ...typography.labelMd, color: colors.ash, fontStyle: 'italic' },
})
