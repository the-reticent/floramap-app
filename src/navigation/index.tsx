import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createStackNavigator } from '@react-navigation/stack'
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { DiscoverScreen }      from '../screens/DiscoverScreen'
import { SpeciesDetailScreen } from '../screens/SpeciesDetailScreen'
import { FilterScreen }        from '../screens/FilterScreen'
import { SavedScreen }         from '../screens/SavedScreen'
import { VisualizerScreen }    from '../screens/VisualizerScreen'
import { colors, typography }  from '../constants/theme'
import { useAppStore }         from '../store'
import { useNavigationState, useNavigation } from '@react-navigation/native'

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

export function AppNavigator() {
  const { savedSpecies } = useAppStore()
  const insets = useSafeAreaInsets()

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor:  colors.white,
            borderTopColor:   colors.cloud,
            borderTopWidth:   1,
            height:           60,
            paddingTop:       8,
            paddingBottom:    8,
            elevation:        20,
            marginBottom:     48,
          },
          tabBarActiveTintColor:   colors.canopy,
          tabBarInactiveTintColor: colors.ash,
          tabBarLabelStyle: {
            fontSize:   11,
            fontWeight: '600',
            marginTop:  2,
          },
          tabBarShowLabel: true,
          tabBarHideOnKeyboard: true,
        }}
      >
        <Tab.Screen
          name="Discover"
          component={DiscoverStack}
          options={{
            tabBarLabel: 'Discover',
            tabBarIcon: ({ focused, color }) => (
              <Text style={{ fontSize: 22, color }}>🌿</Text>
            ),
          }}
        />
        <Tab.Screen
          name="Visualizer"
          component={VisualizerScreen}
          options={{
            tabBarLabel: 'Visualize',
            tabBarIcon: ({ focused, color }) => (
              <Text style={{ fontSize: 22, color }}>📷</Text>
            ),
          }}
        />
        <Tab.Screen
          name="Saved"
          component={SavedStack}
          options={{
            tabBarLabel: 'Saved',
            tabBarIcon: ({ focused, color }) => (
              <Text style={{ fontSize: 22, color }}>♡</Text>
            ),
            tabBarBadge: savedSpecies.length > 0 ? savedSpecies.length : undefined,
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  )
}
