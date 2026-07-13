import React, { useEffect, useState, useCallback } from 'react'
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Linking, ActivityIndicator
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Species } from '../types'
import { colors, spacing, radius, typography, shadows } from '../constants/theme'
import { BIOME_COLORS, WATER_USE_COLORS, CONSERVATION_COLORS, GROWTH_FORM_ICONS } from '../constants'
import { Badge } from '../components/ui/Badge'
import { BloomCalendar } from '../components/ui/BloomCalendar'
import { HeroImage } from '../components/plant/HeroImage'
import { CompanionPlants } from '../components/plant/CompanionPlants'
import { useAppStore } from '../store'
import { getSpeciesDetail } from '../lib/supabase'

export function SpeciesDetailScreen({ route, navigation }: any) {
  const { species: initial } = route.params as { species: Species }
  const [species, setSpecies]   = useState<Species>(initial)
  const [loading, setLoading]   = useState(false)
  const { isSaved, toggleSaved, biome, nativePlants } = useAppStore()
  const saved = isSaved(species.accepted_name)

  const biomeColor = biome ? BIOME_COLORS[biome] ?? colors.canopy : colors.canopy
  const waterColor = WATER_USE_COLORS[species.water_use] ?? colors.leaf
  const consColor  = CONSERVATION_COLORS[species.conservation_status] ?? colors.leaf
  const growthIcon = Object.entries(GROWTH_FORM_ICONS).find(([k]) =>
    species.growth_form?.toLowerCase().includes(k.toLowerCase())
  )?.[1] ?? '🌱'

  // Companions stored in seed data as array of accepted_name strings
  const companions: string[] = (species as any).companions ?? []

  useEffect(() => {
    setLoading(true)
    getSpeciesDetail(species.accepted_name)
      .then((full) => { if (full) setSpecies(s => ({ ...s, ...full })) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [species.accepted_name])

  // Navigate to a companion species by name
  const handleCompanionPress = useCallback((name: string) => {
    const sp = nativePlants.find(p => p.accepted_name === name)
    if (sp) navigation.push('SpeciesDetail', { species: sp })
  }, [nativePlants, navigation])

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: biomeColor + '30' }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {species.common_name_en}
          </Text>
          <Text style={styles.headerSci} numberOfLines={1}>
            {species.accepted_name}
          </Text>
        </View>
        <TouchableOpacity onPress={() => toggleSaved(species.accepted_name)} style={styles.saveBtn}>
          <Text style={styles.heartIcon}>{saved ? '♥' : '♡'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero image — iNaturalist photos */}
        <HeroImage
          acceptedName={species.accepted_name}
          gbifTaxonKey={species.gbif_taxon_key}
          fallbackIcon={growthIcon}
          biomeColor={biomeColor}
        />

        {/* Name + badges */}
        <View style={styles.nameBlock}>
          <Text style={styles.commonName}>{species.common_name_en}</Text>
          <Text style={styles.sciName}>{species.accepted_name}</Text>
          {species.common_name_af && (
            <Text style={styles.afName}>
              Afrikaans: {species.common_name_af}
            </Text>
          )}
          <View style={styles.badgeRow}>
            <Badge label={species.family} color={biomeColor} />
            <Badge
              label={species.conservation_status}
              color={consColor}
            />
            {species.fire_adapted && (
              <Badge label="Fire-adapted" color={colors.pollen} />
            )}
            {species.edible && (
              <Badge label="Edible" color={colors.canopy} />
            )}
            {species.medicinal && (
              <Badge label="Medicinal" color={colors.sky} />
            )}
          </View>
        </View>

        {/* Nativeness in your veg type */}
        {species.nativeness && (
          <View style={[styles.nativenessCard, { borderLeftColor: biomeColor }]}>
            <Text style={styles.nativenessLabel}>IN YOUR VEGETATION TYPE</Text>
            <Text style={styles.nativenessText}>{species.nativeness}</Text>
          </View>
        )}

        {/* Quick trait grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AT A GLANCE</Text>
          <View style={styles.traitGrid}>
            <TraitCell emoji="💧" label="Water" value={species.water_use?.replace(' to ', '/')} color={waterColor} />
            <TraitCell emoji="☀️" label="Sun" value={species.sun_exposure?.replace(' to ', '/')} />
            <TraitCell emoji="↕" label="Height"
              value={species.mature_height_cm >= 100
                ? `${(species.mature_height_cm / 100).toFixed(1)} m`
                : `${species.mature_height_cm} cm`}
            />
            <TraitCell emoji="↔" label="Spread"
              value={species.mature_spread_cm >= 100
                ? `${(species.mature_spread_cm / 100).toFixed(1)} m`
                : `${species.mature_spread_cm} cm`}
            />
            <TraitCell emoji="🍃" label="Leaves" value={species.deciduous_evergreen} />
            <TraitCell emoji="🌱" label="Form" value={species.growth_form} />
          </View>
        </View>

        {/* Bloom calendar — upgraded */}
        {species.bloom_months?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>SEASONAL CALENDAR</Text>
            <View style={styles.card}>
              <BloomCalendar
                bloomMonths={species.bloom_months}
                fruitMonths={species.fruit_months ?? []}
              />
            </View>
          </View>
        )}

        {/* Companion plants */}
        {companions.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>GROWS WELL WITH</Text>
            <CompanionPlants
              companions={companions}
              onPress={handleCompanionPress}
            />
          </View>
        )}

        {/* Soil & growing */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SOIL & GROWING</Text>
          <View style={styles.card}>
            <InfoRow label="Soil" value={species.soil_texture} />
            <InfoRow label="pH" value={species.soil_ph_range} />
            <InfoRow label="Sun" value={species.sun_exposure} />
            <InfoRow label="Water" value={species.water_use} />
          </View>
        </View>

        {/* Pollinators */}
        {(species.pollinators as any)?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>POLLINATORS</Text>
            <View style={styles.pillWrap}>
              {((species.pollinators as any) as Array<{ pollinator_type: string } | string>).map((p, i) => (
                <Badge
                  key={i}
                  label={typeof p === 'string' ? p : p.pollinator_type}
                  color={colors.canopy}
                  size="sm"
                />
              ))}
            </View>
          </View>
        )}

        {/* Uses */}
        {(species.edible || species.medicinal) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>USES</Text>
            <View style={styles.card}>
              {species.edible && species.edible_notes && (
                <InfoRow label="Edible" value={species.edible_notes} />
              )}
              {species.medicinal && species.medicinal_notes && (
                <InfoRow label="Medicinal" value={species.medicinal_notes} />
              )}
            </View>
          </View>
        )}

        {/* Field notes */}
        {species.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>FIELD NOTES</Text>
            <View style={styles.card}>
              <Text style={styles.notesText}>{species.notes}</Text>
            </View>
          </View>
        )}

        {/* References */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>REFERENCES</Text>
          <View style={styles.linksRow}>
            {species.sanbi_pza_url && (
              <TouchableOpacity
                style={[styles.linkBtn, { backgroundColor: biomeColor }]}
                onPress={() => Linking.openURL(species.sanbi_pza_url)}
              >
                <Text style={styles.linkText}>PlantZAfrica ↗</Text>
              </TouchableOpacity>
            )}
            {species.gbif_taxon_key && (
              <TouchableOpacity
                style={[styles.linkBtn, { backgroundColor: colors.charcoal }]}
                onPress={() => Linking.openURL(
                  `https://www.gbif.org/species/${species.gbif_taxon_key}`
                )}
              >
                <Text style={styles.linkText}>GBIF ↗</Text>
              </TouchableOpacity>
            )}
            {species.accepted_name && (
              <TouchableOpacity
                style={[styles.linkBtn, { backgroundColor: colors.sky }]}
                onPress={() => Linking.openURL(
                  `https://www.inaturalist.org/taxa/search?q=${encodeURIComponent(species.accepted_name)}`
                )}
              >
                <Text style={styles.linkText}>iNaturalist ↗</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  )
}

function TraitCell({ emoji, label, value, color }: {
  emoji: string; label: string; value?: string | number | null; color?: string
}) {
  return (
    <View style={traitStyles.cell}>
      <Text style={traitStyles.emoji}>{emoji}</Text>
      <Text style={traitStyles.label}>{label}</Text>
      <Text
        style={[traitStyles.value, color ? { color } : null]}
        numberOfLines={2}
      >
        {value ?? '—'}
      </Text>
    </View>
  )
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <View style={infoStyles.row}>
      <Text style={infoStyles.label}>{label}</Text>
      <Text style={infoStyles.value} numberOfLines={3}>{value ?? '—'}</Text>
    </View>
  )
}

const traitStyles = StyleSheet.create({
  cell: {
    width:           '31%',
    backgroundColor: colors.parchment,
    borderRadius:    radius.md,
    padding:         spacing.sm,
    alignItems:      'center',
    gap:             2,
  },
  emoji: { fontSize: 18 },
  label: { ...typography.labelSm, color: colors.slate, textAlign: 'center' },
  value: {
    ...typography.labelMd,
    color:      colors.ink,
    textAlign:  'center',
    fontWeight: '600',
    fontSize:   11,
  },
})

const infoStyles = StyleSheet.create({
  row: {
    flexDirection:     'row',
    justifyContent:    'space-between',
    paddingVertical:   spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.cloud,
    gap:               spacing.sm,
  },
  label: { ...typography.bodyMd, color: colors.slate, minWidth: 70 },
  value: { ...typography.bodyMd, color: colors.ink, flex: 1, textAlign: 'right' },
})

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.parchment },
  header: {
    flexDirection:     'row',
    alignItems:        'center',
    paddingHorizontal: spacing.md,
    paddingVertical:   spacing.sm,
    backgroundColor:   colors.white,
    borderBottomWidth: 1,
    gap:               spacing.sm,
  },
  backBtn:      { padding: spacing.xs },
  backIcon:     { fontSize: 22, color: colors.canopy },
  headerCenter: { flex: 1 },
  headerTitle:  { ...typography.displaySm, fontSize: 16, color: colors.forest, lineHeight: 20 },
  headerSci:    { ...typography.scientific, fontSize: 12, color: colors.slate },
  saveBtn:      { padding: spacing.xs },
  heartIcon:    { fontSize: 24, color: colors.bloom },

  scroll:        { flex: 1 },
  scrollContent: { padding: spacing.md, gap: spacing.lg, paddingBottom: spacing.xxl },

  nameBlock: { gap: 4 },
  commonName: { ...typography.displayMd, color: colors.forest },
  sciName:    { ...typography.scientific, fontSize: 16, color: colors.slate },
  afName:     { ...typography.bodySm, color: colors.slate },
  badgeRow:   { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginTop: spacing.xs },

  nativenessCard: {
    borderLeftWidth:  3,
    borderRadius:     radius.md,
    backgroundColor:  colors.white,
    padding:          spacing.md,
    gap:              4,
    ...shadows.sm,
  },
  nativenessLabel: { ...typography.labelMd, color: colors.slate, letterSpacing: 0.8 },
  nativenessText:  { ...typography.bodyMd, color: colors.forest, fontStyle: 'italic' },

  section:      { gap: spacing.sm },
  sectionTitle: { ...typography.labelLg, color: colors.slate, letterSpacing: 1.2 },
  card: {
    backgroundColor: colors.white,
    borderRadius:    radius.lg,
    padding:         spacing.md,
    gap:             2,
    ...shadows.sm,
  },
  traitGrid: {
    flexDirection: 'row',
    flexWrap:      'wrap',
    gap:           spacing.xs,
  },
  pillWrap: {
    flexDirection: 'row',
    flexWrap:      'wrap',
    gap:           spacing.xs,
  },
  notesText: { ...typography.bodyMd, color: colors.charcoal, lineHeight: 24 },
  linksRow: {
    flexDirection: 'row',
    flexWrap:      'wrap',
    gap:           spacing.sm,
  },
  linkBtn: {
    paddingHorizontal: spacing.lg,
    paddingVertical:   spacing.sm,
    borderRadius:      radius.full,
  },
  linkText: { ...typography.labelLg, color: colors.white },
})
