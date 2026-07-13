import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createStackNavigator } from '@react-navigation/stack'
import { Text, View, StyleSheet } from 'react-native'
import { DiscoverScreen }      from '../screens/DiscoverScreen'
import { SpeciesDetailScreen } from '../screens/SpeciesDetailScreen'
import { FilterScreen }        from '../screens/FilterScreen'
import { SavedScreen }         from '../screens/SavedScreen'
import { VisualizerScreen }    from '../screens/VisualizerScreen'
import { colors, typography }  from '../constants/theme'
import { useAppStore }         from '../store'

const Tab   = createBottomTabNavigator()
const Stack = createStackNavigator()

function DiscoverStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DiscoverList"  component={DiscoverScreen} />
      <Stack.Screen name="SpeciesDetail" component={SpeciesDetailScreen} />
      <Stack.Screen name="Filter"        component={FilterScreen} />
    </Stack.Navigator>
  )
}

function SavedStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SavedList"     component={SavedScreen} />
      <Stack.Screen name="SpeciesDetail" component={SpeciesDetailScreen} />
    </Stack.Navigator>
  )
}

function TabIcon({ icon, label, focused }: { icon: string; label: string; focused: boolean }) {
  return (
    <View style={[tabStyles.wrap, focused && tabStyles.wrapActive]}>
      <Text style={tabStyles.icon}>{icon}</Text>
      <Text style={[tabStyles.label, focused && tabStyles.labelActive]}>{label}</Text>
    </View>
  )
}

const tabStyles = StyleSheet.create({
  wrap: {
    alignItems:        'center',
    gap:               2,
    paddingVertical:   6,
    paddingHorizontal: 12,
    borderRadius:      12,
  },
  wrapActive:  { backgroundColor: colors.dew },
  icon:        { fontSize: 22 },
  label:       { ...typography.labelSm, color: colors.ash },
  labelActive: { color: colors.canopy },
})

export function AppNavigator() {
  const { savedSpecies } = useAppStore()

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: colors.white,
            borderTopColor:  colors.cloud,
            borderTopWidth:  1,
            paddingBottom:   4,
            paddingTop:      4,
            height:          64,
          },
          tabBarShowLabel: false,
        }}
      >
        <Tab.Screen
          name="Discover"
          component={DiscoverStack}
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon icon="🌿" label="Discover" focused={focused} />
            ),
          }}
        />
        <Tab.Screen
          name="Visualizer"
          component={VisualizerScreen}
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon icon="📷" label="Visualize" focused={focused} />
            ),
          }}
        />
        <Tab.Screen
          name="Saved"
          component={SavedStack}
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon icon="♡" label="Saved" focused={focused} />
            ),
            tabBarBadge: savedSpecies.length > 0 ? savedSpecies.length : undefined,
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  )
}
