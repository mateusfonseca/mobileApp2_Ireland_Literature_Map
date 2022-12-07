# React Native App: Ireland Literature Map

**Dorset College Dublin**  
**BSc in Science in Computing & Multimedia**  
**Mobile Applications 2 - BSC30922**  
**Year 3, Semester 1**  
**Project**

**Lecturer name:** Saravanabalagi Ramachandran  
**Lecturer email:** saravanabalagi.ramachandran@dorset.ie

**Student Name:** Mateus Fonseca Campos  
**Student Number:** 24088  
**Student Email:** 24088@student.dorset-college.ie

**Submission date:** 16 December 2022

This repository contains an "Ireland Literature Map" React Native app developed for my Project at Dorset College BSc in Computing, Year 3, Semester 1.

## Part 1: Requirements Checklist

- [x] **1. Display markers on the map**
  - [x] 1.1. Load places and place types JSON data1
  - [x] 1.2. Display marker for all places using GPS coordinates
  - [x] 1.3. Use different colours, one for each place type
  - [x] 1.4. When marker is tapped, place name should be displayed on a pop-up info window
- [x] **2. Show extended information**
  - [x] 2.1. When the pop up info window is tapped, show in full screen all details of the place (id, name, Gaelic name, type, GPS coordinates)
  - [x] 2.2. Show the image of the place loaded from the internet2
  - [x] 2.3. [Bonus] Show relevant image using any free web service, or search engine
  - [x] 2.4. Show a back button, when pressed, go back to map view
- [x] **3. Allow filtering by Place Type**
  - [x] 3.1. Show dropdown for selecting Place Type, default value should be all
  - [x] 3.2. When a specific Place Type is selected, show only the places with this Place Type on the map
- [x] **4. Allow custom marker**
  - [x] 4.1. Long Press anywhere on map to show a draggable marker
  - [x] 4.2. Show distance3 to the nearest place (from the downloaded data), and on drag marker, update this info
  - [x] 4.3. Draw a semi-transparent blue circle around this marker with a radius of 10 km and show number of places within this radius
  - [x] 4.4. [Bonus] Create a slider to control the above radius in km (1-1000, default 10) and on change, update the circle on the map and update number of places within the radius info shown accordingly

## Part 2: Report

For this assessment I was tasked with developing a mobile app that marks, on a map, places of importance to Irish literature around the world (related to poets, patrons and publishers in Ireland, who lived in the 16th and 17th centuries).

Differently from the previous module in this course, this time I was allowed to choose what platforms and frameworks to use. Even though I had a great experience working with Android and Kotlin before, I decided to try something new for this one... Enter **React Native**.

Based on Meta's JavaScript library, React, React Native is a JS framework for developing natively rendered mobile applications for Android, iOS and more. It uses JavaScript on the backend and JSX (a mixture of JS with XML) on the frontend. The React Native Components are then, under the hood, converted to UI components native to the operating system of the device the app is running on and rendered accordingly.

There are mainly two approaches to writing components in React Native: Class Components or Function Components. The former is the classic (*no pun intended*) one, where each component is a class that extends the *React.Component* superclass and controls its state through properties and methods, ultimately returning the view to be rendered in the *render()* method. The latter was introduced in 2019 with version 16.8 of React and allows for the writing of components via JavaScript functions purely. These functions are passed one argument, *props*, that holds reference to the state of the component, which can be manipulated through React Hooks, built-in methods for accessing, updating, rendering and re-rendering components. In this project, I chose to work with the traditional class approach because of its OOP structure, which I am more familiar with.

Besides the always present learning curve of working with a new framework for the first time, I faced a few issues during the completion of this assignment:

**1. Google Maps markers limited color palette (req. 1.3):** when defining different colors for each place type, I tried to pick colors that were distant from each other to make the markers more easily identifiable on the map. To my surprise, Google Maps only seems to accept a handful of predefined colors, anything that strays from those will fall back to the nearest option on their list.

I tried to solve this issue by creating custom markers that I could then color as I pleased. The problem this time was: React Native does not handle vector assets by default. I tried to work this one out with a few community libraries, such as [react-native-svg-transformer](https://www.npmjs.com/package/react-native-svg-transformer) and [react-native-svg](https://www.npmjs.com/package/react-native-svg), but unfortunately could not.

In the end, I just went back to using Google Maps’ default colors. One last issue: there does not seem to be an official list of colors anywhere in the documentation. I just went with [this suggestion](https://github.com/react-native-maps/react-native-maps/issues/887#issuecomment-324530282), and it seems to be working fine.

**2. Display image relevant to the place being detailed (req. 2.3):** initially, I tried using [Google Maps Street View Static API](https://developers.google.com/maps/documentation/streetview), passing the place’s coordinates as arguments. But the image I was getting was often not ideal, probably because those coordinates were being translated into street sections instead of building facades and such. I then changed to using [Google Maps Places API](#part-3-references) passing the place’s name as argument. Problem here was: different places might have the same name, and if you do not specify, Google will lead you to the one closest to you based on your IP (*I ended up with Portobello, Panama rendering a picture of Portobello, Dublin 2, not good!*). Gladly, the Places API also accepts coordinates as arguments in addition to a text query. *Problem solved!*

**3. Calculate the distance between two points based on their coordinates (req. 4.2):** at first, I wanted to use the *computeDistanceBetween* method from [Google Maps Geometry Library](https://developers.google.com/maps/documentation/javascript/reference/geometry) (*since I am already using Google services for almost everything else here, why not!?*). I, unfortunately, could not figure out how to bring the library into my React Native code though, I felt silly at first, but after insisting on it for a while, I decided that I did not have time to waste on this and just wrote the [haversine formula](#part-3-references) myself and placed inside a function in my code. *Case closed!*

**4. Update user’s marker details *onDrag* (req. 4.2):** the [react-native-maps](#part-3-references) library does offer an *onDrag* method for its Marker components, but I failed to get it to work as intended, that is, have the details displayed on screen update as the user drags the marker from one place to another across the screen, in real-time. In the end I just used another available method *onDragEnd*, which simply updates all the details at once, when the user drops the marker after finishing dragging it, to its new location.

#### ________________

In conclusion, completing this assignment was an interesting challenge and, even more so, because it gave me the opportunity to learn a hot new framework (*new to me!*) that is among the most popular ones in the industry. 

## Part 3: References

Conceptually, every line of code in this project was written based on official documentation:

- **[React Native](https://reactnative.dev/docs/getting-started)**
- **[Google Maps Platform](https://developers.google.com/maps/documentation)**
  - **[Places API](https://developers.google.com/maps/documentation/places/web-service)**
- **[MDN Web](https://developer.mozilla.org/)**

The following React Native packages were installed:

- **[react-native-maps](https://www.npmjs.com/package/react-native-maps)**
- **[@react-navigation/native](https://www.npmjs.com/package/@react-navigation/native)**
- **[@react-navigation/native-stack](https://www.npmjs.com/package/@react-navigation/native-stack)**
- **[react-native-screens](https://www.npmjs.com/package/react-native-screens)**
- **[react-native-safe-area-context](https://www.npmjs.com/package/react-native-safe-area-context)**
- **[react-native-config](https://www.npmjs.com/package/react-native-config)**

Clarifying code snippets from **[W3Schools](https://www.w3schools.com/)**.

Visits to our most beloved **[StackOverflow](https://stackoverflow.com/)** certainly happened, for insight and understanding.

This app fetches its data from this **[GitHub Gist](https://gist.github.com/saravanabalagi/541a511eb71c366e0bf3eecbee2dab0a)**, based on the **[MACMORRIS](https://macmorris.maynoothuniversity.ie/)** project.

Distance between points on Earth's surface is calculated using the **[Haversine Formula](https://www.doi.org/10.1088/1742-6596/1500/1/012104)**.

## Part 4: Copyright Disclaimer

This project may feature content that is copyright protected. Please, keep in mind that this is a student's project and has no commercial purpose whatsoever. Having said that, if you are the owner of any content featured here and would like for it to be removed, please, contact me and I will do so promptly.

Thank you very much,  
Mateus Campos.
