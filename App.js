// This file defines the main class of the application.

import React, { Component } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MapScreen from "./components/MapScreen";
import DetailsScreen from "./components/DetailsScreen";
import { PermissionsAndroid, StyleSheet } from "react-native";

const Stack = createNativeStackNavigator();

// Immutable object that holds color names associated with place type ids
export const PlaceTypeColor = Object.freeze({
  1: "tomato",
  2: "orange",
  3: "yellow",
  4: "aqua",
  5: "wheat",
  6: "blue",
  7: "linen",
  8: "green",
  9: "tan",
  10: "gold",
  11: "violet",
  12: "indigo",
  13: "navy",
  14: "plum",
  15: "teal",
});

// Function that requests permission to access the user's location
export const requestLocationPermission = async () => {
  try {
    const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION, {
      title: "Geolocation Permission",
      message: "Can we access your location?",
      buttonNeutral: "Ask Me Later",
      buttonNegative: "Cancel",
      buttonPositive: "OK",
    });
    console.log("granted", granted);
    if (granted === "granted") {
      console.log("You can use Geolocation");
      return true;
    } else {
      console.log("You cannot use Geolocation");
      return false;
    }
  } catch (err) {
    return false;
  }
};

// Styles used repeatedly throughout the app
export const appStyles = StyleSheet.create({
  container: {
    flex: 1, alignItems: "center", flexDirection: "column", justifyContent: "space-between",
  }, text: {
    fontSize: 16, paddingVertical: 2, paddingHorizontal: 5,
  },
});

// Main class App
export default class App extends Component {
  constructor(props) {
    super(props);
    console.log("App.js here!");
  }

  // Builds the navigation stack with its two screens
  render() {
    return (<NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Map"
          component={MapScreen}
          options={{ title: "Welcome" }}
        />
        <Stack.Screen name="Details" component={DetailsScreen} />
      </Stack.Navigator>
    </NavigationContainer>);
  }
}
