// This file defines the class responsible for rendering the details view of the application.

import { Screen } from "react-native-screens";
import { ActivityIndicator, Image, Linking, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import React from "react";
import { appStyles } from "../App";
import { fetch } from "react-native/Libraries/Network/fetch";
import Config from "react-native-config";

// Styles specific to the DetailsScreen
const detailsStyles = StyleSheet.create({
  scroll: {
    flex: 1,
  }, loading: {
    margin: 50,
  }, image_block: {
    width: "100%", alignItems: "center",
  }, image: {
    width: "100%", aspectRatio: 2,
  }, link: {
    marginVertical: 5, marginBottom: 15, color: "blue",
  }, details: {
    justifyContent: "center", flexDirection: "row", alignItems: "center", marginBottom: 25,
  }, colOdd: {
    fontWeight: "bold",
  }, rowOdd: {
    backgroundColor: "#8ab4ff",
  },
});

// DetailsScreen class
export default class DetailsScreen extends Screen {
  constructor(props) {
    super(props);
    console.log("DetailsScreen.js here!");

    // Class' state properties to keep track of runtime changes that need to be re-rendered
    this.state = {
      place: this.props.route.params.place, photoRef: null, contrib: null, contributor: null, isLoading: true,
    };
  }

  // Fetches json with photo data from Google Places API related to the place being detailed
  async getPhotoRef(place) {
    try {
      const response = await fetch(`https://maps.googleapis.com/maps/api/place/findplacefromtext/json?fields=photos&input=${place.name}&inputtype=textquery&key=${Config.GOOGLE_MAPS_API_KEY}`);
      const json = await response.json();
      if (json.candidates.length) {
        let attr = await json.candidates[0].photos[0].html_attributions[0];
        if (attr) {
          this.setState({
            photoRef: json.candidates[0].photos[0].photo_reference,
            contrib: attr.substring(attr.indexOf("http"), attr.indexOf("\">")),
            contributor: attr.substring(attr.indexOf("\">") + 2, attr.indexOf("</a")),
          });
        } else {
          this.setState({
            photoRef: json.candidates[0].photos[0].photo_reference,
          });
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      this.setState({ isLoading: false });
    }
  }

  // Calls the asynchronous function as soon as the component mounts
  componentDidMount() {
    this.getPhotoRef(this.state.place).catch(console.error);
  }

  // Renders the details view
  render() {
    const { place, photoRef, contrib, contributor, isLoading } = this.state;

    return (<SafeAreaView style={appStyles.container}>
      <ScrollView style={detailsStyles.scroll}>
        {/* Displays spinner while waiting for the photo */}
        {isLoading ? (<ActivityIndicator style={detailsStyles.loading} />) : (<View style={detailsStyles.image_block}>
          {photoRef ? (<Image
            style={detailsStyles.image}
            source={{
              uri: `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${photoRef}&key=${Config.GOOGLE_MAPS_API_KEY}`,
            }}
          />) : (<Text style={[appStyles.text, { marginVertical: 50 }]}>
            No picture found for this location!
          </Text>)}
          {/* Displays the username of the person the took the picture, if available, as a link to the Google Maps contribution page */}
          {contrib ? (<Text
            style={[appStyles.text, detailsStyles.link]}
            onPress={() => Linking.openURL(contrib)}>
            Picture by {contributor}.
          </Text>) : null}
        </View>)}
        <View style={detailsStyles.details}>
          <View>
            <Text
              style={[detailsStyles.colOdd, detailsStyles.rowOdd, appStyles.text]}>
              ID:
            </Text>
            <Text style={[detailsStyles.colOdd, appStyles.text]}>
              Location:
            </Text>
            <Text
              style={[detailsStyles.colOdd, detailsStyles.rowOdd, appStyles.text]}>
              Name:
            </Text>
            <Text style={[detailsStyles.colOdd, appStyles.text]}>
              Gaelic Name:
            </Text>
            <Text
              style={[detailsStyles.colOdd, detailsStyles.rowOdd, appStyles.text]}>
              Place Type ID:
            </Text>
            <Text style={[detailsStyles.colOdd, appStyles.text]}>
              Latitude:
            </Text>
            <Text
              style={[detailsStyles.colOdd, detailsStyles.rowOdd, appStyles.text]}>
              Longitude:
            </Text>
          </View>
          <View>
            <Text style={[detailsStyles.rowOdd, appStyles.text]}>
              {place.id}
            </Text>
            <Text style={appStyles.text}>{place.location}</Text>
            <Text style={[detailsStyles.rowOdd, appStyles.text]}>
              {place.name}
            </Text>
            <Text style={appStyles.text}>{place.gaelic_name}</Text>
            <Text style={[detailsStyles.rowOdd, appStyles.text]}>
              {place.place_type_id}
            </Text>
            <Text style={appStyles.text}>{place.latitude}</Text>
            <Text style={[detailsStyles.rowOdd, appStyles.text]}>
              {place.longitude}
            </Text>
          </View>
        </View>
        <View style={appStyles.container}>
          <Text style={[appStyles.text, { textAlign: "center" }]}>
            Data taken from{" "}
            {/* Link to the GitHub Gist from where the jsons used in this app were fetched */}
            <Text
              style={[appStyles.text, detailsStyles.link]}
              onPress={() => Linking.openURL("https://gist.github.com/saravanabalagi/541a511eb71c366e0bf3eecbee2dab0a")}>
              GitHub Gist
            </Text>
            , courtesy of{" "}
            {/* Link to the MACMORRIS project website */}
            <Text
              style={[appStyles.text, detailsStyles.link]}
              onPress={() => Linking.openURL("https://macmorris.maynoothuniversity.ie/")}>
              MACMORRIS
            </Text>
            .
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>);
  }
}
