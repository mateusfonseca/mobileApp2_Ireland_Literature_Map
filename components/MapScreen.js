// This file defines the class responsible for rendering the map view of the application.

import { Screen } from "react-native-screens";
import { ActivityIndicator, Button, Dimensions, StyleSheet, Text, View } from "react-native";
import MapView, { Callout, Circle, enableLatestRenderer, Marker, Polyline } from "react-native-maps";
import SelectDropdown from "react-native-select-dropdown";
import { fetch } from "react-native/Libraries/Network/fetch";
import React from "react";
import Geolocation from "react-native-geolocation-service";
import { appStyles, PlaceTypeColor, requestLocationPermission } from "../App";
import { Slider } from "@miblanchard/react-native-slider";

enableLatestRenderer();

// Styles specific to the MapScreen
const mapStyles = StyleSheet.create({
  map: {
    ...StyleSheet.absoluteFillObject,
  }, dropdownButtonClosed: {
    borderBottomStartRadius: 24, borderBottomEndRadius: 24, elevation: 10,
  }, dropdownButtonOpened: {
    borderBottomStartRadius: 0, borderBottomEndRadius: 0, elevation: 10,
  }, dropdown: {
    borderBottomStartRadius: 24, borderBottomEndRadius: 24,
  }, dropdownRow: {
    padding: 5,
  }, loading: {
    flex: 1, alignSelf: "center",
  }, infoMenu: {
    backgroundColor: "#edf0f5",
    padding: 10,
    elevation: 5,
    marginBottom: 76,
    marginHorizontal: 25,
    width: Dimensions.get("window").width - 100,
  },
});

// MapScreen class
export default class MapScreen extends Screen {
  constructor(props) {
    super(props);
    console.log("MapScreen.js here!");

    // Class' state properties to keep track of runtime changes that need to be re-rendered
    this.state = {
      places: [],
      placeTypes: [],
      isPermissionLoading: true,
      isPlacesLoading: true,
      isTypesLoading: true,
      userLat: 0,
      userLong: 0,
      latitudeDelta: 7,
      longitudeDelta: 7,
      placesFiltered: [],
      newMarker: null,
      nearestPlace: null,
      circleRadius: 10,
      dropdownButtonState: mapStyles.dropdownButtonClosed,
    };
  }

  // Verifies if location permission has been granted and sets it to the map view
  async getPermission() {
    await requestLocationPermission().then(res => {
      if (res) {
        Geolocation.getCurrentPosition(p => {
          console.log("Here: " + p.coords.latitude + " and " + p.coords.longitude);
          this.setState({
            userLat: p.coords.latitude,
            userLong: p.coords.longitude,
            latitudeDelta: 0.5,
            longitudeDelta: 0.5,
            isPermissionLoading: false,
          });
        });
      } else {
        console.log("Defaulting to Ireland.");
        this.setState({
          userLat: 53.1424, userLong: -7.6921, latitudeDelta: 7, longitudeDelta: 7, isPermissionLoading: false,
        });
      }
    });
  }

  // Fetches json with all the places of interest
  async getPlaces() {
    try {
      const res = await fetch("https://gist.githubusercontent.com/saravanabalagi/541a511eb71c366e0bf3eecbee2dab0a/raw/bb1529d2e5b71fd06760cb030d6e15d6d56c34b3/places.json");
      const json = await res.json();
      this.setState({ places: json, placesFiltered: json });
    } catch (error) {
      console.log(error);
    } finally {
      this.setState({ isPlacesLoading: false });
    }
  }

  // Fetches json with all the place types of interest
  async getPlaceTypes() {
    try {
      const res = await fetch("https://gist.githubusercontent.com/saravanabalagi/541a511eb71c366e0bf3eecbee2dab0a/raw/bb1529d2e5b71fd06760cb030d6e15d6d56c34b3/place_types.json");
      const json = await res.json();
      this.setState({ placeTypes: [{ id: -1, name: "All" }, ...json] });
    } catch (error) {
      console.log(error);
    } finally {
      this.setState({ isTypesLoading: false });
    }
  }

  // Calls the asynchronous functions as soon as the component mounts
  componentDidMount() {
    this.getPermission().catch(console.error);
    this.getPlaces().catch(console.error);
    this.getPlaceTypes().catch(console.error);
  }

  // Filters list of places based on type
  filterPlaces(places, typeId) {
    if (typeId === -1) {
      this.setState({ placesFiltered: places });
      return places;
    } else {
      this.setState({
        placesFiltered: places.filter(place => place.place_type_id === typeId),
      });
      return places.filter(place => place.place_type_id === typeId);
    }
  }

  // Calculates the distances of all places to the marker set by the user
  calculateDistances(places, marker) {
    if (places?.length) {
      return places.map(place => this.haversine_distance({
        lat: marker.latitude, lng: marker.longitude,
      }, { lat: place.latitude, lng: place.longitude }));
    } else {
      return null;
    }
  }

  // Determines which place is the nearest to the marker set by the user
  calculateNearest(places, marker) {
    let dists = this.calculateDistances(places, marker);
    if (!dists?.length) {
      return null;
    }
    let minDist = Math.min(...dists);
    let nearest = places[dists.indexOf(minDist)];
    return [nearest, this.formatMe(minDist)];
  }

  // Counts how many places are within radius from the marker set by the user
  numberOfPlacesWithinRadius(places, marker) {
    let dists = this.calculateDistances(places, marker);
    if (!dists?.length) {
      return 0;
    }
    let counter = 0;
    dists.forEach(el => {
      if (el <= this.state.circleRadius) {
        counter++;
      }
    });
    return counter;
  }

  // Determines the great-circle distance between two points on a sphere given their longitudes and latitudes using the haversine formula
  haversine_distance(coordA, coordB) {
    let latA = (coordA.lat * Math.PI) / 180;
    let lngA = (coordA.lng * Math.PI) / 180;
    let latB = (coordB.lat * Math.PI) / 180;
    let lngB = (coordB.lng * Math.PI) / 180;
    let r = 6371;
    return (2 * r * Math.asin(Math.sqrt(Math.pow(Math.sin((latB - latA) / 2), 2) + Math.cos(latA) * Math.cos(latB) * Math.pow(Math.sin((lngB - lngA) / 2), 2))));
  }

  // Formats the distance value
  formatMe(num) {
    num = Number(num);
    if (num < 1) {
      return "Less than 1";
    } else if (num < 100) {
      return Number(num.toFixed(1));
    } else {
      return new Intl.NumberFormat().format(num.toFixed(0));
    }
  }

  // Renders the map view
  render() {
    const {
      places,
      placeTypes,
      isPermissionLoading,
      isPlacesLoading,
      isTypesLoading,
      userLat,
      userLong,
      latitudeDelta,
      longitudeDelta,
      placesFiltered,
      newMarker,
      nearestPlace,
      circleRadius,
      dropdownButtonState,
    } = this.state;

    // Awaits for the asynchronous functions to finish loading
    return isPermissionLoading || isPlacesLoading || isTypesLoading ? (
      // Displays spinner while waiting
      <ActivityIndicator size={"large"} style={mapStyles.loading} />) : (<View style={appStyles.container}>
      {/* Renders map */}
      <MapView
        style={mapStyles.map}
        initialRegion={{
          latitude: userLat, longitude: userLong, latitudeDelta: latitudeDelta, longitudeDelta: longitudeDelta,
        }}
        // Creates new marker on long pressing anywhere on the map
        onLongPress={e => {
          this.setState({
            newMarker: {
              latitude: e.nativeEvent.coordinate.latitude, longitude: e.nativeEvent.coordinate.longitude,
            },
          });
          // Calculates the nearest place to newly set marker
          this.setState({
            nearestPlace: this.calculateNearest(placesFiltered, e.nativeEvent.coordinate),
          });
        }}>
        {placesFiltered.map((place, index) => {
          // Renders all the markers for the filtered list of places
          return (<Marker
            key={index}
            onPress={e => e.nativeEvent}
            pinColor={PlaceTypeColor[place.place_type_id]}
            coordinate={{
              latitude: place.latitude, longitude: place.longitude,
            }}>
            {/* Displays callout bubble when marker is tapped */}
            <Callout
              // Navigates to DetailsScreen on tapping the callout
              onPress={() => {
                let typeName = placeTypes.find(type => type.id === place.place_type_id).name;
                this.props.navigation.navigate("Details", {
                  place, typeName,
                });
              }}>
              <Text style={appStyles.text}>{place.name}</Text>
            </Callout>
          </Marker>);
        })}
        {newMarker ? (<View>
          {/* Renders new marker set by the user */}
          <Marker
            coordinate={{
              latitude: newMarker.latitude, longitude: newMarker.longitude,
            }}
            draggable={true}
            // Changes the marker's coordinates when dragged
            onDragEnd={e => {
              this.setState({
                newMarker: {
                  latitude: e.nativeEvent.coordinate.latitude, longitude: e.nativeEvent.coordinate.longitude,
                },
              });
              // Recalculates the nearest place to the dragged marker
              this.setState({
                nearestPlace: this.calculateNearest(placesFiltered, e.nativeEvent.coordinate),
              });
            }}
          />
          {/* Renders circle around marker set by the user */}
          <Circle
            center={{
              latitude: newMarker.latitude, longitude: newMarker.longitude,
            }}
            radius={circleRadius * 1000}
            strokeColor={"#0000ff"}
            fillColor={"rgba(0,0,255,0.25)"}
          />
          {/* Draws dotted line to the nearest place to the marker set by the user */}
          {nearestPlace ? (<Polyline
            coordinates={[{
              latitude: newMarker.latitude, longitude: newMarker.longitude,
            }, {
              latitude: nearestPlace[0].latitude, longitude: nearestPlace[0].longitude,
            }]}
            strokeColor={"#ff0000"}
            strokeWidth={3}
            lineDashPattern={[1, 10]}
            geodesic={true}
          />) : null}
        </View>) : null}
      </MapView>
      {/* Renders dropdown selector */}
      <SelectDropdown
        buttonStyle={dropdownButtonState}
        dropdownStyle={mapStyles.dropdown}
        defaultButtonText={"Displaying: All"}
        // Each place type is an option
        data={placeTypes.map(type => type)}
        rowTextForSelection={type => type.name}
        buttonTextAfterSelection={type => "Displaying: " + type.name}
        renderCustomizedRowChild={type => {
          return (<View style={[appStyles.container, mapStyles.dropdownRow]}>
            <Text style={[appStyles.text, { fontWeight: "bold" }]}>
              {type.name}
            </Text>
            <View
              style={{
                width: 30,
                height: 12,
                borderRadius: 50,
                backgroundColor: PlaceTypeColor[type.id],
                borderColor: "#000000",
                borderWidth: 1,
              }}
            />
          </View>);
        }}
        onFocus={() => this.setState({ dropdownButtonState: mapStyles.dropdownButtonOpened })}
        onBlur={() => this.setState({ dropdownButtonState: mapStyles.dropdownButtonClosed })}
        onSelect={selectedItem => {
          {
            // Recalculates the nearest place to the marker if list has been filtered
            newMarker ? this.setState({
              nearestPlace: this.calculateNearest(this.filterPlaces(places, selectedItem.id), newMarker),
            }) : this.filterPlaces(places, selectedItem.id);
          }
        }}
      />
      {/* Renders windows with details related to the new marker */}
      {newMarker ? (<View style={mapStyles.infoMenu}>
        {/* Number of places within radius */}
        <Text style={[appStyles.text, { textAlign: "center" }]}>
          Number of places within radius:{" "}
          <Text
            style={{
              fontWeight: "bold", color: "#4287f5",
            }}>
            {this.numberOfPlacesWithinRadius(placesFiltered, newMarker)}
          </Text>
          .
          {/* Distance to the nearest place */}
        </Text>
        {nearestPlace ? (<Text style={[appStyles.text, { textAlign: "center" }]}>
          Distance to nearest place:{" "}
          <Text style={{ fontWeight: "bold", color: "#4287f5" }}>
            {nearestPlace[1]} km
          </Text>
          .
        </Text>) : null}
        {/* Currently defined radius */}
        <Text style={[appStyles.text, { textAlign: "center" }]}>
          Current radius:{" "}
          <Text style={{ fontWeight: "bold", color: "#4287f5" }}>
            {this.formatMe(circleRadius)} km
          </Text>
          .
        </Text>
        {/* Renders slider the allows for the adjusting of the radius */}
        <Slider
          minimumTrackTintColor={"#4287f5"}
          thumbTintColor={"#4287f5"}
          minimumValue={1}
          maximumValue={1000}
          value={circleRadius}
          trackClickable={true}
          onValueChange={value => this.setState({ circleRadius: value })}
        />
        <View
          style={{
            flexDirection: "row", flexWrap: "wrap", justifyContent: "center",
          }}>
          {/* Renders button the allows for the removing of the new marker */}
          <Button
            color={"#4287f5"}
            title={"Remove Marker"}
            onPress={() => this.setState({ newMarker: null })}
          />
        </View>
      </View>) : null}
    </View>);
  }
}
