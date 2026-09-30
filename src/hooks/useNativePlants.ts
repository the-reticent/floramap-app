import { useEffect, useCallback, useState } from 'react'
import { Platform } from 'react-native'
import * as Location from 'expo-location'
import { useAppStore } from '../store'
import { getNativePlants } from '../lib/supabase'

export function useNativePlants() {
  const {
    location, setLocation, setLocationError,
    nativePlants, vegTypeName, vegTypeCode, biome,
    plantsLoading, plantsError,
    setNativePlants, setPlantsLoading, setPlantsError,
  } = useAppStore()

  const [locating, setLocating] = useState(false)

  const fetchLocationWeb = useCallback(() => {
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      setLocation({ latitude: -33.36120688815378, longitude: 19.19803603639766 })
      setLocating(false)
      return
    }
    if (!navigator.geolocation) {
      setLocationError('Geolocation not supported in this browser')
      return
    }
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          latitude:  pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy:  pos.coords.accuracy ?? undefined,
        })
        setLocating(false)
      },
      (err) => {
        setLocationError(err.message || 'Could not get location')
        setLocating(false)
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  }, [setLocation, setLocationError])

  const fetchLocationNative = useCallback(async () => {
    setLocating(true)
    try {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== 'granted') {
        setLocationError('Location permission denied')
        setLocating(false)
        return
      }
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      })
      setLocation({
        latitude:  loc.coords.latitude,
        longitude: loc.coords.longitude,
        accuracy:  loc.coords.accuracy ?? undefined,
      })
    } catch (e) {
      setLocationError('Could not get location')
    } finally {
      setLocating(false)
    }
  }, [setLocation, setLocationError])

  const fetchLocation = useCallback(() => {
    if (Platform.OS === 'web') fetchLocationWeb()
    else fetchLocationNative()
  }, [fetchLocationWeb, fetchLocationNative])

  const fetchPlants = useCallback(async (lat: number, lon: number) => {
    setPlantsLoading(true)
    try {
      const plants = await getNativePlants(lat, lon)
      if (plants.length === 0) {
        setPlantsError('No native plant data for this location yet')
        setNativePlants([], '', '', '')
        return
      }
      setNativePlants(
        plants,
        plants[0].vegetation_type ?? '',
        plants[0].veg_type_code   ?? '',
        plants[0].biome           ?? '',
      )
    } catch (e) {
      setPlantsError('Failed to load plants — check connection')
    } finally {
      setPlantsLoading(false)
    }
  }, [setNativePlants, setPlantsLoading, setPlantsError])

  useEffect(() => { fetchLocation() }, [fetchLocation])

  useEffect(() => {
    if (location) fetchPlants(location.latitude, location.longitude)
  }, [location, fetchPlants])

  return {
    location, nativePlants, vegTypeName, vegTypeCode, biome,
    plantsLoading: plantsLoading || locating,
    plantsError,
    refresh: () => location && fetchPlants(location.latitude, location.longitude),
    relocate: fetchLocation,
  }
}
