import React, { useCallback } from 'react'
import {
  View, Text, StyleSheet, FlatList,
  ActivityIndicator, RefreshControl, TouchableOpacity
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNativePlants } from '../hooks/useNativePlants'
import { useFilteredPlants } from '../hooks/useFilteredPlants'
import { PlantCard } from '../components/plant/PlantCard'
import { SearchBar } from '../components/ui/SearchBar'
import { Badge } from '../components/ui/Badge'
import { colors, spacing, typography, radius, shadows } from '../constants/theme'
import { BIOME_COLORS, BIOME_LIGHT } from '../constants'
import { Species } from '../types'
import { useAppStore } from '../store'

export function DiscoverScreen({ navigation }: any) {
  const { nativePlants, vegTypeName, biome, plantsLoading, plantsError, refresh, relocate } = useNativePlants()
  const filtered = useFilteredPlants(nativePlants)
  const { location } = useAppStore()

  const biomeColor = biome ? BIOME_COLORS[biome] ?? colors.canopy : colors.canopy
  const biomeBg    = biome ? BIOME_LIGHT[biome]  ?? colors.dew    : colors.dew

  const handlePress = useCallback((species: Species) => {
    navigation.navigate('SpeciesDetail', { species })
  }, [navigation])

  const renderHeader = () => (
    <View style={styles.listHeader}>
      {/* Location context banner */}
      <View style={[styles.contextBanner, { backgroundColor: biomeBg, borderColor: biomeColor + '40' }]}>
        <View style={styles.contextLeft}>
          <Text style={styles.contextEmoji}>📍</Text>
          <View>
            <Text style={[styles.vegTypeName, { color: biomeColor }]} numberOfLines={2}>
              {vegTypeName ?? 'Detecting location…'}
            </Text>
            {biome && (
              <Badge label={biome} color={biomeColor} size="sm" style={styles.biomeBadge} />
            )}
          </View>
        </View>
        <TouchableOpacity onPress={relocate} style={styles.relocateBtn}>
          <Text style={styles.relocateText}>↺</Text>
        </TouchableOpacity>
      </View>

      {/* Stats row */}
      {nativePlants.length > 0 && (
        <View style={styles.statsRow}>
          <Text style={styles.statsText}>
            {filtered.length} native plant{filtered.length !== 1 ? 's' : ''}
            {filtered.length !== nativePlants.length && ` of ${nativePlants.length}`}
          </Text>
          <Text style={styles.statsCoords}>
            {location ? `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}` : ''}
          </Text>
        </View>
      )}

      {/* Search */}
      <SearchBar />
    </View>
  )

  if (plantsLoading && nativePlants.length === 0) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.canopy} />
          <Text style={styles.loadingText}>Finding your native plants…</Text>
        </View>
      </SafeAreaView>
    )
  }

  if (plantsError && nativePlants.length === 0) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.centered}>
          <Text style={styles.errorEmoji}>🌿</Text>
          <Text style={styles.errorTitle}>No data yet</Text>
          <Text style={styles.errorBody}>{plantsError}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={relocate}>
            <Text style={styles.retryText}>Try again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.topBar}>
        <Text style={styles.appName}>FloraMap</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('Filter')}
          style={styles.filterBtn}
        >
          <Text style={styles.filterIcon}>⚙</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.accepted_name}
        renderItem={({ item }) => (
          <PlantCard species={item} onPress={handlePress} biome={biome ?? undefined} />
        )}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={plantsLoading}
            onRefresh={refresh}
            tintColor={colors.canopy}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🔍</Text>
            <Text style={styles.emptyText}>No plants match your filters</Text>
          </View>
        }
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  screen:      { flex: 1, backgroundColor: colors.parchment },
  topBar: {
    flexDirection:   'row',
    alignItems:      'center',
    justifyContent:  'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical:   spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.cloud,
  },
  appName: {
    ...typography.displaySm,
    color: colors.forest,
  },
  filterBtn: {
    width:           40,
    height:          40,
    borderRadius:    20,
    backgroundColor: colors.dew,
    alignItems:      'center',
    justifyContent:  'center',
  },
  filterIcon: { fontSize: 18 },

  listContent: { padding: spacing.md, paddingBottom: spacing.xxl },
  listHeader:  { gap: spacing.md, marginBottom: spacing.md },

  contextBanner: {
    flexDirection:   'row',
    alignItems:      'center',
    justifyContent:  'space-between',
    borderRadius:    radius.lg,
    padding:         spacing.md,
    borderWidth:     1,
  },
  contextLeft: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           spacing.sm,
    flex:          1,
  },
  contextEmoji: { fontSize: 24 },
  vegTypeName: {
    ...typography.bodyMd,
    fontWeight: '600',
    marginBottom: 4,
    flexShrink: 1,
  },
  biomeBadge: { marginTop: 2 },
  relocateBtn: {
    width:           36,
    height:          36,
    borderRadius:    18,
    backgroundColor: colors.white,
    alignItems:      'center',
    justifyContent:  'center',
    ...shadows.sm,
  },
  relocateText: { fontSize: 18, color: colors.canopy },

  statsRow: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
    paddingHorizontal: 2,
  },
  statsText:   { ...typography.labelLg, color: colors.charcoal },
  statsCoords: { ...typography.labelSm, color: colors.ash },

  centered:    { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md, padding: spacing.xl },
  loadingText: { ...typography.bodyMd, color: colors.slate },
  errorEmoji:  { fontSize: 48 },
  errorTitle:  { ...typography.displaySm, color: colors.forest },
  errorBody:   { ...typography.bodyMd, color: colors.slate, textAlign: 'center' },
  retryBtn: {
    backgroundColor: colors.canopy,
    paddingHorizontal: spacing.xl,
    paddingVertical:   spacing.sm,
    borderRadius:      radius.full,
    marginTop:         spacing.sm,
  },
  retryText:   { ...typography.labelLg, color: colors.white },

  emptyState: { alignItems: 'center', gap: spacing.sm, paddingTop: spacing.xl },
  emptyEmoji:  { fontSize: 36 },
  emptyText:   { ...typography.bodyMd, color: colors.slate },
})
