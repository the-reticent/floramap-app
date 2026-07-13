import React from 'react'
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAppStore } from '../store'
import { PlantCard } from '../components/plant/PlantCard'
import { colors, spacing, typography } from '../constants/theme'

export function SavedScreen({ navigation }: any) {
  const { savedSpecies, nativePlants, biome } = useAppStore()

  const saved = nativePlants.filter((p) => savedSpecies.includes(p.accepted_name))

  if (saved.length === 0) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.topBar}>
          <Text style={styles.title}>Saved Plants</Text>
        </View>
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>♡</Text>
          <Text style={styles.emptyTitle}>No saved plants yet</Text>
          <Text style={styles.emptyBody}>
            Tap the heart on any plant in Discover to save it here.
          </Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.topBar}>
        <Text style={styles.title}>Saved Plants</Text>
        <Text style={styles.count}>{saved.length}</Text>
      </View>
      <FlatList
        data={saved}
        keyExtractor={(item) => item.accepted_name}
        renderItem={({ item }) => (
          <PlantCard
            species={item}
            onPress={(s) => navigation.navigate('SpeciesDetail', { species: s })}
            biome={biome ?? undefined}
          />
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.parchment },
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
  title: { ...typography.displaySm, color: colors.forest },
  count: {
    ...typography.labelLg,
    color:           colors.white,
    backgroundColor: colors.canopy,
    paddingHorizontal: spacing.sm,
    paddingVertical:   3,
    borderRadius:      99,
    overflow:          'hidden',
  },
  list:       { padding: spacing.md, paddingBottom: spacing.xxl },
  empty:      { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md, padding: spacing.xl },
  emptyEmoji: { fontSize: 56, color: colors.bloom },
  emptyTitle: { ...typography.displaySm, color: colors.forest },
  emptyBody:  { ...typography.bodyMd, color: colors.slate, textAlign: 'center' },
})
