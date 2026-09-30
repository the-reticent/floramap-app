import React, { useState, useCallback } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity, Image,
  ScrollView, ActivityIndicator, Alert, Dimensions
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import * as ImagePicker from 'expo-image-picker'
import { colors, spacing, radius, typography, shadows } from '../constants/theme'
import { BIOME_COLORS, GROWTH_FORM_ICONS } from '../constants'
import { useAppStore } from '../store'
import { visualizeGarden } from '../lib/replicate'
import { Species } from '../types'

const { width: SCREEN_W } = Dimensions.get('window')
const PREVIEW_H = Math.min(300, SCREEN_W * 0.65)

type Step = 'idle' | 'photo' | 'select' | 'generating' | 'result' | 'error'

export function VisualizerScreen() {
  const { nativePlants, vegTypeName, vegTypeCode, biome } = useAppStore()

  const [step,           setStep]           = useState<Step>('idle')
  const [photoUri,       setPhotoUri]       = useState<string | null>(null)
  const [selected,       setSelected]       = useState<Species[]>([])
  const [resultUrl,      setResultUrl]      = useState<string | null>(null)
  const [statusMsg,      setStatusMsg]      = useState('')
  const [strength,       setStrength]       = useState(0.6)
  const [showOriginal,   setShowOriginal]   = useState(false)
  const [errorMsg,       setErrorMsg]       = useState('')

  const biomeColor = biome ? BIOME_COLORS[biome] ?? colors.canopy : colors.canopy

  // ── Step 1: pick photo ────────────────────────────────────────────────────
  const pickPhoto = useCallback(async (fromCamera: boolean) => {
    const perm = fromCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync()

    if (perm.status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow access to continue.')
      return
    }

    const result = fromCamera
      ? await ImagePicker.launchCameraAsync({ quality: 0.85, allowsEditing: true, aspect: [4,3] })
      : await ImagePicker.launchImageLibraryAsync({ quality: 0.85, allowsEditing: true, aspect: [4,3] })

    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri)
      setSelected([])
      setResultUrl(null)
      setStep('select')
    }
  }, [])

  // ── Step 2: toggle species selection ─────────────────────────────────────
  const toggleSpecies = useCallback((sp: Species) => {
    setSelected(prev =>
      prev.find(s => s.accepted_name === sp.accepted_name)
        ? prev.filter(s => s.accepted_name !== sp.accepted_name)
        : prev.length < 10
          ? [...prev, sp]
          : prev
    )
  }, [])

  // ── Step 3: generate ──────────────────────────────────────────────────────
  const generate = useCallback(async () => {
    if (!photoUri || selected.length === 0) return
    setStep('generating')
    setStatusMsg('Starting…')
    try {
      const url = await visualizeGarden(
        photoUri,
        selected.map(s => s.accepted_name),
        vegTypeName ?? 'local fynbos',
        biome ?? 'Fynbos',
        strength,
        setStatusMsg
      )
      setResultUrl(url)
      setStep('result')
    } catch (e: any) {
      setErrorMsg(e.message ?? 'Something went wrong')
      setStep('error')
    }
  }, [photoUri, selected, vegTypeName, biome, strength])

  const reset = useCallback(() => {
    setStep('idle')
    setPhotoUri(null)
    setSelected([])
    setResultUrl(null)
    setErrorMsg('')
    setShowOriginal(false)
  }, [])

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Visualizer</Text>
        {step !== 'idle' && (
          <TouchableOpacity onPress={reset} style={styles.resetBtn}>
            <Text style={styles.resetText}>Start over</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ── IDLE ─────────────────────────────────────────────────── */}
        {step === 'idle' && (
          <IdleView
            vegTypeName={vegTypeName}
            biome={biome}
            biomeColor={biomeColor}
            plantsCount={nativePlants.length}
            onCamera={() => pickPhoto(true)}
            onGallery={() => pickPhoto(false)}
          />
        )}

        {/* ── SELECT + PHOTO PREVIEW ───────────────────────────────── */}
        {(step === 'select' || step === 'generating') && photoUri && (
          <>
            <Image source={{ uri: photoUri }} style={[styles.preview, { height: PREVIEW_H }]} resizeMode="cover" />

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                SELECT PLANTS{selected.length > 0 ? ` (${selected.length}/5)` : ''}
              </Text>
              <Text style={styles.sectionSub}>
                Choose up to 10 native plants to add to your garden
              </Text>
            </View>

            <View style={styles.speciesGrid}>
              {nativePlants.map(sp => {
                const isSelected = selected.find(s => s.accepted_name === sp.accepted_name)
                const icon = Object.entries(GROWTH_FORM_ICONS).find(([k]) =>
                  sp.growth_form?.toLowerCase().includes(k.toLowerCase())
                )?.[1] ?? '🌱'
                return (
                  <TouchableOpacity
                    key={sp.accepted_name}
                    style={[
                      styles.speciesChip,
                      isSelected && { backgroundColor: biomeColor, borderColor: biomeColor }
                    ]}
                    onPress={() => toggleSpecies(sp)}
                    disabled={step === 'generating'}
                  >
                    <Text style={styles.chipIcon}>{icon}</Text>
                    <View style={styles.chipText}>
                      <Text style={[styles.chipName, isSelected && { color: colors.white }]} numberOfLines={1}>
                        {sp.common_name_en || sp.accepted_name.split(' ')[0]}
                      </Text>
                      <Text style={[styles.chipSci, isSelected && { color: colors.mist }]} numberOfLines={1}>
                        {sp.accepted_name}
                      </Text>
                    </View>
                    {isSelected && <Text style={styles.chipCheck}>✓</Text>}
                  </TouchableOpacity>
                )
              })}
            </View>

            {/* Strength slider */}
            <View style={styles.strengthRow}>
              <Text style={styles.strengthLabel}>Style strength</Text>
              <View style={styles.strengthButtons}>
                {([0.4, 0.6, 0.8] as const).map(v => (
                  <TouchableOpacity
                    key={v}
                    style={[styles.strengthBtn, strength === v && styles.strengthBtnActive]}
                    onPress={() => setStrength(v)}
                    disabled={step === 'generating'}
                  >
                    <Text style={[styles.strengthBtnText, strength === v && { color: colors.white }]}>
                      {v === 0.4 ? 'Subtle' : v === 0.6 ? 'Balanced' : 'Bold'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {step === 'select' && (
              <TouchableOpacity
                style={[styles.generateBtn, selected.length === 0 && styles.generateBtnDisabled]}
                onPress={generate}
                disabled={selected.length === 0}
              >
                <Text style={styles.generateBtnText}>
                  {selected.length === 0 ? 'Select at least one plant' : `Visualise with ${selected.length} plant${selected.length > 1 ? 's' : ''}`}
                </Text>
              </TouchableOpacity>
            )}

            {/* Generating state */}
            {step === 'generating' && (
              <View style={styles.generatingCard}>
                <ActivityIndicator size="large" color={biomeColor} />
                <Text style={[styles.generatingTitle, { color: biomeColor }]}>
                  Creating your garden…
                </Text>
                <Text style={styles.generatingStatus}>{statusMsg}</Text>
                <Text style={styles.generatingNote}>
                  AI generation takes 20–40 seconds
                </Text>
              </View>
            )}
          </>
        )}

        {/* ── RESULT ───────────────────────────────────────────────── */}
        {step === 'result' && resultUrl && photoUri && (
          <>
            <View style={styles.resultToggle}>
              <TouchableOpacity
                style={[styles.toggleBtn, !showOriginal && styles.toggleBtnActive]}
                onPress={() => setShowOriginal(false)}
              >
                <Text style={[styles.toggleText, !showOriginal && { color: colors.white }]}>
                  With plants
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleBtn, showOriginal && styles.toggleBtnActive]}
                onPress={() => setShowOriginal(true)}
              >
                <Text style={[styles.toggleText, showOriginal && { color: colors.white }]}>
                  Original
                </Text>
              </TouchableOpacity>
            </View>

            <Image
              source={{ uri: showOriginal ? photoUri : resultUrl }}
              style={[styles.resultImage, { height: PREVIEW_H * 1.2 }]}
              resizeMode="cover"
            />

            {/* Selected species recap */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>PLANTS IN THIS GARDEN</Text>
              <View style={styles.selectedList}>
                {selected.map(sp => (
                  <View key={sp.accepted_name} style={styles.selectedItem}>
                    <Text style={styles.selectedIcon}>
                      {Object.entries(GROWTH_FORM_ICONS).find(([k]) =>
                        sp.growth_form?.toLowerCase().includes(k.toLowerCase())
                      )?.[1] ?? '🌱'}
                    </Text>
                    <View>
                      <Text style={styles.selectedName}>{sp.common_name_en}</Text>
                      <Text style={styles.selectedSci}>{sp.accepted_name}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>

            {/* Actions */}
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: biomeColor }]}
                onPress={generate}
              >
                <Text style={styles.actionBtnText}>Regenerate</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: colors.charcoal }]}
                onPress={() => { setPhotoUri(photoUri); setStep('select') }}
              >
                <Text style={styles.actionBtnText}>Change plants</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* ── ERROR ────────────────────────────────────────────────── */}
        {step === 'error' && (
          <View style={styles.errorCard}>
            <Text style={styles.errorEmoji}>⚠</Text>
            <Text style={styles.errorTitle}>Generation failed</Text>
            <Text style={styles.errorMsg}>{errorMsg}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={generate}>
              <Text style={styles.retryText}>Try again</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  )
}

// ── Idle view component ─────────────────────────────────────────────────────
function IdleView({
  vegTypeName, biome, biomeColor, plantsCount, onCamera, onGallery
}: {
  vegTypeName: string | null
  biome: string | null
  biomeColor: string
  plantsCount: number
  onCamera: () => void
  onGallery: () => void
}) {
  return (
    <View style={idle.wrap}>
      <View style={[idle.hero, { backgroundColor: biomeColor + '12' }]}>
        <Text style={idle.heroIcon}>📷</Text>
        <Text style={idle.heroTitle}>Garden Visualiser</Text>
        <Text style={idle.heroSub}>
          Take a photo of your garden and see it transformed with{' '}
          {plantsCount > 0 ? `${plantsCount} native plants` : 'local native plants'}
          {vegTypeName ? ` from ${vegTypeName}` : ''}.
        </Text>
      </View>

      <TouchableOpacity style={[idle.btn, { backgroundColor: biomeColor }]} onPress={onCamera}>
        <Text style={idle.btnIcon}>📷</Text>
        <View>
          <Text style={idle.btnTitle}>Take a photo</Text>
          <Text style={idle.btnSub}>Use your camera</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={idle.btn2} onPress={onGallery}>
        <Text style={idle.btnIcon}>🖼</Text>
        <View>
          <Text style={[idle.btnTitle, { color: colors.forest }]}>Choose from gallery</Text>
          <Text style={idle.btnSub}>Pick an existing photo</Text>
        </View>
      </TouchableOpacity>

      <View style={idle.tipCard}>
        <Text style={idle.tipTitle}>Tips for best results</Text>
        <Text style={idle.tip}>• Photograph your garden bed or outdoor area</Text>
        <Text style={idle.tip}>• Good natural light works best</Text>
        <Text style={idle.tip}>• Include soil, lawn or existing plants in the frame</Text>
        <Text style={idle.tip}>• Select plants realistic for your space size</Text>
      </View>
    </View>
  )
}

// ── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  screen:  { flex: 1, backgroundColor: colors.parchment },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.cloud,
  },
  title:    { ...typography.displaySm, color: colors.forest },
  resetBtn: { paddingVertical: 4, paddingHorizontal: spacing.sm },
  resetText:{ ...typography.bodyMd, color: colors.bloom },
  content:  { padding: spacing.md, gap: spacing.md },

  preview:  { width: '100%', borderRadius: radius.xl, overflow: 'hidden' },

  section:  { gap: 4 },
  sectionTitle: { ...typography.labelLg, color: colors.slate, letterSpacing: 1 },
  sectionSub:   { ...typography.bodySm, color: colors.ash },

  speciesGrid: { gap: spacing.xs },
  speciesChip: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    backgroundColor: colors.white, borderRadius: radius.lg,
    padding: spacing.sm, borderWidth: 1.5, borderColor: colors.cloud,
    ...shadows.sm,
  },
  chipIcon: { fontSize: 22 },
  chipText: { flex: 1 },
  chipName: { ...typography.bodyMd, fontWeight: '600', color: colors.forest },
  chipSci:  { ...typography.scientific, fontSize: 12, color: colors.slate },
  chipCheck:{ ...typography.bodyMd, color: colors.white, fontWeight: '700' },

  strengthRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    backgroundColor: colors.white, borderRadius: radius.lg,
    padding: spacing.md, ...shadows.sm,
  },
  strengthLabel:     { ...typography.labelLg, color: colors.slate, flex: 1 },
  strengthButtons:   { flexDirection: 'row', gap: spacing.xs },
  strengthBtn: {
    paddingHorizontal: spacing.sm, paddingVertical: 6,
    borderRadius: radius.full, borderWidth: 1, borderColor: colors.cloud,
  },
  strengthBtnActive: { backgroundColor: colors.canopy, borderColor: colors.canopy },
  strengthBtnText:   { ...typography.labelMd, color: colors.charcoal },

  generateBtn: {
    backgroundColor: colors.canopy, borderRadius: radius.full,
    padding: spacing.md, alignItems: 'center', ...shadows.md,
  },
  generateBtnDisabled: { backgroundColor: colors.ash },
  generateBtnText:     { ...typography.labelLg, color: colors.white, fontSize: 15 },

  generatingCard: {
    backgroundColor: colors.white, borderRadius: radius.xl,
    padding: spacing.xl, alignItems: 'center', gap: spacing.sm, ...shadows.md,
  },
  generatingTitle:  { ...typography.displaySm, fontSize: 18 },
  generatingStatus: { ...typography.bodyMd, color: colors.slate },
  generatingNote:   { ...typography.bodySm, color: colors.ash, fontStyle: 'italic' },

  resultToggle: {
    flexDirection: 'row', backgroundColor: colors.cloud,
    borderRadius: radius.full, padding: 3,
  },
  toggleBtn: {
    flex: 1, paddingVertical: spacing.xs,
    borderRadius: radius.full, alignItems: 'center',
  },
  toggleBtnActive: { backgroundColor: colors.canopy },
  toggleText:      { ...typography.labelLg, color: colors.charcoal },

  resultImage: { width: '100%', borderRadius: radius.xl },

  selectedList: { gap: spacing.xs },
  selectedItem: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    backgroundColor: colors.white, borderRadius: radius.lg,
    padding: spacing.sm, ...shadows.sm,
  },
  selectedIcon: { fontSize: 20 },
  selectedName: { ...typography.bodyMd, fontWeight: '600', color: colors.forest },
  selectedSci:  { ...typography.scientific, fontSize: 12, color: colors.slate },

  actionRow: { flexDirection: 'row', gap: spacing.sm },
  actionBtn: {
    flex: 1, borderRadius: radius.full,
    padding: spacing.md, alignItems: 'center',
  },
  actionBtnText: { ...typography.labelLg, color: colors.white },

  errorCard: {
    backgroundColor: colors.white, borderRadius: radius.xl,
    padding: spacing.xl, alignItems: 'center', gap: spacing.sm, ...shadows.md,
  },
  errorEmoji: { fontSize: 40 },
  errorTitle: { ...typography.displaySm, color: colors.danger },
  errorMsg:   { ...typography.bodyMd, color: colors.slate, textAlign: 'center' },
  retryBtn: {
    backgroundColor: colors.canopy, borderRadius: radius.full,
    paddingHorizontal: spacing.xl, paddingVertical: spacing.sm, marginTop: spacing.sm,
  },
  retryText: { ...typography.labelLg, color: colors.white },
})

const idle = StyleSheet.create({
  wrap:    { gap: spacing.md },
  hero: {
    borderRadius: radius.xl, padding: spacing.xl,
    alignItems: 'center', gap: spacing.sm,
  },
  heroIcon:  { fontSize: 48 },
  heroTitle: { ...typography.displayMd, color: colors.forest, textAlign: 'center' },
  heroSub:   { ...typography.bodyMd, color: colors.slate, textAlign: 'center', lineHeight: 24 },
  btn: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    borderRadius: radius.xl, padding: spacing.lg, ...shadows.md,
  },
  btn2: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    borderRadius: radius.xl, padding: spacing.lg,
    backgroundColor: colors.white, borderWidth: 1.5, borderColor: colors.cloud,
    ...shadows.sm,
  },
  btnIcon:  { fontSize: 28 },
  btnTitle: { ...typography.displaySm, fontSize: 17, color: colors.white },
  btnSub:   { ...typography.bodySm, color: 'rgba(255,255,255,0.7)' },
  tipCard: {
    backgroundColor: colors.white, borderRadius: radius.xl,
    padding: spacing.lg, gap: spacing.xs, ...shadows.sm,
  },
  tipTitle: { ...typography.labelLg, color: colors.charcoal, marginBottom: 4 },
  tip:      { ...typography.bodySm, color: colors.slate, lineHeight: 20 },
})
