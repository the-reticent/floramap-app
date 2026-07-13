import React from 'react'
import { View, Text, StyleSheet, ViewStyle } from 'react-native'
import { colors, typography, radius, spacing } from '../../constants/theme'

interface BadgeProps {
  label: string
  color?: string
  bg?: string
  size?: 'sm' | 'md'
  style?: ViewStyle
}

export function Badge({ label, color = colors.canopy, bg, size = 'md', style }: BadgeProps) {
  const bgColor = bg ?? color + '18'
  return (
    <View style={[styles.base, { backgroundColor: bgColor }, size === 'sm' && styles.sm, style]}>
      <Text style={[styles.text, { color }, size === 'sm' && styles.textSm]}>
        {label}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: spacing.sm,
    paddingVertical:   3,
    borderRadius:      radius.full,
    alignSelf:         'flex-start',
  },
  sm: {
    paddingHorizontal: 6,
    paddingVertical:   2,
  },
  text: {
    ...typography.labelMd,
    textTransform: 'uppercase',
  },
  textSm: {
    ...typography.labelSm,
  },
})
