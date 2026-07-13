import React from 'react'
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Switch
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAppStore } from '../store'
import { colors, spacing, typography, radius, shadows } from '../constants/theme'

const GROWTH_FORMS = ['Tree', 'Large shrub', 'Medium shrub', 'Small shrub', 'Groundcover', 'Succulent', 'Geophyte', 'Reed', 'Annual']
const WATER_OPTIONS = ['Extremely low', 'Very low', 'Low', 'Moderate']
const SUN_OPTIONS   = ['Full sun', 'Part shade', 'Full sun to part shade']

export function FilterScreen({ navigation }: any) {
  const { filters, setFilters, resetFilters } = useAppStore()

  function toggle(key: 'growth_forms' | 'water_use' | 'sun_exposure', val: string) {
    const arr = filters[key] as string[]
    setFilters({
      [key]: arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val]
    })
  }

  const activeCount =
    filters.growth_forms.length +
    filters.water_use.length +
    filters.sun_exposure.length +
    (filters.edible_only ? 1 : 0) +
    (filters.medicinal_only ? 1 : 0) +
    (filters.fire_adapted_only ? 1 : 0)

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Filter Plants</Text>
        <TouchableOpacity onPress={resetFilters}>
          <Text style={styles.reset}>Reset{activeCount > 0 ? ` (${activeCount})` : ''}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Section title="Growth form">
          <PillGroup options={GROWTH_FORMS} selected={filters.growth_forms}
            onToggle={v => toggle('growth_forms', v)} />
        </Section>

        <Section title="Water use">
          <PillGroup options={WATER_OPTIONS} selected={filters.water_use}
            onToggle={v => toggle('water_use', v)} />
        </Section>

        <Section title="Sun exposure">
          <PillGroup options={SUN_OPTIONS} selected={filters.sun_exposure}
            onToggle={v => toggle('sun_exposure', v)} />
        </Section>

        <Section title="Special">
          <ToggleRow label="Edible plants only" emoji="🌿"
            value={filters.edible_only}
            onToggle={v => setFilters({ edible_only: v })} />
          <ToggleRow label="Medicinal plants only" emoji="⚕"
            value={filters.medicinal_only}
            onToggle={v => setFilters({ medicinal_only: v })} />
          <ToggleRow label="Fire-adapted only" emoji="🔥"
            value={filters.fire_adapted_only}
            onToggle={v => setFilters({ fire_adapted_only: v })} />
        </Section>

        <TouchableOpacity
          style={styles.applyBtn}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.applyText}>
            {activeCount > 0 ? `Apply ${activeCount} filter${activeCount > 1 ? 's' : ''}` : 'Apply'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={sectionStyles.wrap}>
      <Text style={sectionStyles.title}>{title.toUpperCase()}</Text>
      <View style={sectionStyles.body}>{children}</View>
    </View>
  )
}

function PillGroup({ options, selected, onToggle }: {
  options: string[]; selected: string[]; onToggle: (v: string) => void
}) {
  return (
    <View style={pillStyles.row}>
      {options.map(opt => {
        const active = selected.includes(opt)
        return (
          <TouchableOpacity
            key={opt}
            style={[pillStyles.pill, active && pillStyles.pillActive]}
            onPress={() => onToggle(opt)}
          >
            <Text style={[pillStyles.text, active && pillStyles.textActive]}>
              {opt}
            </Text>
          </TouchableOpacity>
        )
      })}
    </View>
  )
}

function ToggleRow({ label, emoji, value, onToggle }: {
  label: string; emoji: string; value: boolean; onToggle: (v: boolean) => void
}) {
  return (
    <View style={toggleStyles.row}>
      <Text style={toggleStyles.emoji}>{emoji}</Text>
      <Text style={toggleStyles.label}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: colors.cloud, true: colors.mist }}
        thumbColor={value ? colors.canopy : colors.ash}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  screen:   { flex: 1, backgroundColor: colors.parchment },
  header: {
    flexDirection:     'row',
    alignItems:        'center',
    justifyContent:    'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical:   spacing.md,
    backgroundColor:   colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.cloud,
  },
  back:    { ...typography.bodyMd, color: colors.canopy },
  title:   { ...typography.displaySm, fontSize: 17, color: colors.forest },
  reset:   { ...typography.bodyMd, color: colors.bloom },
  content: { padding: spacing.md, gap: spacing.lg, paddingBottom: spacing.xxl },
  applyBtn: {
    backgroundColor: colors.canopy,
    borderRadius:    radius.full,
    padding:         spacing.md,
    alignItems:      'center',
    marginTop:       spacing.sm,
    ...shadows.md,
  },
  applyText: { ...typography.labelLg, color: colors.white, fontSize: 15 },
})

const sectionStyles = StyleSheet.create({
  wrap:  { gap: spacing.sm },
  title: { ...typography.labelLg, color: colors.slate, letterSpacing: 1 },
  body: {
    backgroundColor: colors.white,
    borderRadius:    radius.lg,
    padding:         spacing.md,
    ...shadows.sm,
  },
})

const pillStyles = StyleSheet.create({
  row:        { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  pill: {
    paddingHorizontal: spacing.md,
    paddingVertical:   spacing.xs,
    borderRadius:      radius.full,
    borderWidth:       1,
    borderColor:       colors.cloud,
    backgroundColor:   colors.parchment,
  },
  pillActive: { backgroundColor: colors.canopy, borderColor: colors.canopy },
  text:       { ...typography.bodyMd, color: colors.charcoal },
  textActive: { color: colors.white },
})

const toggleStyles = StyleSheet.create({
  row: {
    flexDirection:  'row',
    alignItems:     'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.cloud,
    gap:            spacing.sm,
  },
  emoji: { fontSize: 18 },
  label: { ...typography.bodyMd, color: colors.ink, flex: 1 },
})
