import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { colors, spacing, radius, typography } from '../../constants/theme'

interface BloomCalendarProps {
  bloomMonths: string[]
  fruitMonths?: string[]
}

const MONTHS = [
  { key: 'Jan', label: 'J', season: 'summer' },
  { key: 'Feb', label: 'F', season: 'summer' },
  { key: 'Mar', label: 'M', season: 'autumn' },
  { key: 'Apr', label: 'A', season: 'autumn' },
  { key: 'May', label: 'M', season: 'autumn' },
  { key: 'Jun', label: 'J', season: 'winter' },
  { key: 'Jul', label: 'J', season: 'winter' },
  { key: 'Aug', label: 'A', season: 'winter' },
  { key: 'Sep', label: 'S', season: 'spring' },
  { key: 'Oct', label: 'O', season: 'spring' },
  { key: 'Nov', label: 'N', season: 'spring' },
  { key: 'Dec', label: 'D', season: 'summer' },
]

const SEASON_COLORS: Record<string, string> = {
  summer: '#E8A838',
  autumn: '#D4693A',
  winter: '#4A90D9',
  spring: '#52B69A',
}

const SEASON_LABELS: Record<string, string> = {
  summer: 'Summer',
  autumn: 'Autumn',
  winter: 'Winter',
  spring: 'Spring',
}

export function BloomCalendar({ bloomMonths, fruitMonths = [] }: BloomCalendarProps) {
  // Find the main bloom season label
  const bloomSeasons = [...new Set(
    MONTHS.filter(m => bloomMonths.includes(m.key)).map(m => m.season)
  )]
  const primarySeason = bloomSeasons[0]

  return (
    <View style={styles.wrap}>
      {/* Month bars */}
      <View style={styles.grid}>
        {MONTHS.map((m) => {
          const isBloom = bloomMonths.includes(m.key)
          const isFruit = fruitMonths.includes(m.key)
          const seasonColor = SEASON_COLORS[m.season]
          return (
            <View key={m.key} style={styles.col}>
              {/* Bar */}
              <View style={styles.barWrap}>
                {isBloom && (
                  <View style={[styles.bar, styles.barBloom, { backgroundColor: colors.bloom }]} />
                )}
                {isFruit && !isBloom && (
                  <View style={[styles.bar, styles.barFruit, { backgroundColor: colors.pollen }]} />
                )}
                {isFruit && isBloom && (
                  <View style={[styles.bar, styles.barBoth]} />
                )}
                {!isBloom && !isFruit && (
                  <View style={[styles.bar, styles.barEmpty]} />
                )}
              </View>
              {/* Season colour dot */}
              <View style={[styles.seasonDot, { backgroundColor: seasonColor + '60' }]} />
              {/* Month label */}
              <Text style={styles.monthLabel}>{m.label}</Text>
            </View>
          )
        })}
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.bloom }]} />
          <Text style={styles.legendText}>Bloom</Text>
        </View>
        {fruitMonths.length > 0 && (
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.pollen }]} />
            <Text style={styles.legendText}>Fruit</Text>
          </View>
        )}
        <View style={styles.legendSpacer} />
        {/* Season chips */}
        {['winter','spring','summer','autumn'].map(s => (
          <View key={s} style={[styles.seasonChip, { backgroundColor: SEASON_COLORS[s] + '25' }]}>
            <View style={[styles.seasonChipDot, { backgroundColor: SEASON_COLORS[s] }]} />
            <Text style={[styles.seasonChipText, { color: SEASON_COLORS[s] }]}>
              {SEASON_LABELS[s]}
            </Text>
          </View>
        ))}
      </View>

      {/* Summary sentence */}
      {bloomMonths.length > 0 && (
        <View style={styles.summaryRow}>
          <Text style={styles.summaryText}>
            {bloomMonths.length === 1
              ? `Blooms in ${bloomMonths[0]}`
              : bloomMonths.length >= 10
              ? 'Blooms almost year-round'
              : `Blooms ${bloomMonths[0]} – ${bloomMonths[bloomMonths.length - 1]}`}
            {fruitMonths.length > 0 && fruitMonths[0]
              ? ` · fruit ${fruitMonths[0]}–${fruitMonths[fruitMonths.length - 1]}`
              : ''}
          </Text>
        </View>
      )}
    </View>
  )
}

const BAR_H = 32
const DOT_SIZE = 6

const styles = StyleSheet.create({
  wrap:    { gap: spacing.sm },
  grid: {
    flexDirection: 'row',
    gap:           2,
    alignItems:    'flex-end',
  },
  col: {
    flex:       1,
    alignItems: 'center',
    gap:        3,
  },
  barWrap: {
    width:  '100%',
    height: BAR_H,
    justifyContent: 'flex-end',
  },
  bar: {
    width:        '100%',
    borderRadius: radius.sm,
  },
  barBloom: { height: BAR_H },
  barFruit: { height: BAR_H * 0.6 },
  barBoth: {
    height:          BAR_H,
    backgroundColor: colors.bloom,
    borderBottomWidth: 3,
    borderBottomColor: colors.pollen,
  },
  barEmpty: {
    height:          6,
    backgroundColor: colors.cloud,
  },
  seasonDot: {
    width:        DOT_SIZE,
    height:       DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
  },
  monthLabel: {
    ...typography.labelSm,
    fontSize: 9,
    color:    colors.slate,
  },
  legend: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           spacing.xs,
    flexWrap:      'wrap',
    marginTop:     spacing.xs,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           4,
  },
  legendDot: {
    width:        8,
    height:       8,
    borderRadius: 4,
  },
  legendText:    { ...typography.labelMd, color: colors.slate },
  legendSpacer:  { flex: 1 },
  seasonChip: {
    flexDirection:   'row',
    alignItems:      'center',
    gap:             3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius:    radius.full,
  },
  seasonChipDot: {
    width:        5,
    height:       5,
    borderRadius: 3,
  },
  seasonChipText: { ...typography.labelSm, fontSize: 9 },
  summaryRow: {
    backgroundColor: colors.parchment,
    borderRadius:    radius.md,
    padding:         spacing.sm,
  },
  summaryText: { ...typography.bodySm, color: colors.charcoal, fontStyle: 'italic' },
})
