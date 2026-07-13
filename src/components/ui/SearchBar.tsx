import React from 'react'
import { View, TextInput, StyleSheet, TouchableOpacity, Text } from 'react-native'
import { colors, spacing, radius, typography } from '../../constants/theme'
import { useAppStore } from '../../store'

export function SearchBar() {
  const { filters, setFilters } = useAppStore()

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>🔍</Text>
      <TextInput
        style={styles.input}
        placeholder="Search plants by name…"
        placeholderTextColor={colors.ash}
        value={filters.search_query}
        onChangeText={(text) => setFilters({ search_query: text })}
        autoCorrect={false}
        autoCapitalize="none"
        returnKeyType="search"
      />
      {filters.search_query.length > 0 && (
        <TouchableOpacity onPress={() => setFilters({ search_query: '' })}>
          <Text style={styles.clear}>✕</Text>
        </TouchableOpacity>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection:   'row',
    alignItems:      'center',
    backgroundColor: colors.white,
    borderRadius:    radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical:   10,
    borderWidth:     1,
    borderColor:     colors.cloud,
    gap:             spacing.sm,
  },
  icon:  { fontSize: 16 },
  input: {
    flex:           1,
    ...typography.bodyMd,
    color:          colors.ink,
    padding:        0,
  },
  clear: {
    ...typography.bodySm,
    color:          colors.ash,
    paddingLeft:    spacing.xs,
  },
})
