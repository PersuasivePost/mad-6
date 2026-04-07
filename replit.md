# Lab - Expo React Native App

## Overview

This is an Expo/React Native application (located in the `lab/` directory) that runs as a web app in the Replit environment. It's a student event management app with RSVP functionality.

## Project Structure

```
lab/                    - Main Expo/React Native app
  App.tsx               - Root component with Redux Provider + NavigationContainer
  index.ts              - Entry point (registerRootComponent)
  app.json              - Expo configuration
  package.json          - Dependencies
  src/
    components/         - Shared components (EventCard)
    context/            - React context (Phase 1, currently commented out)
    navigation/         - Navigation setup (bottom tabs)
    redux/              - Redux store, slices, and hooks
    screens/            - App screens (Home, EventDetails, Profile, Settings)
mini-project/           - Documentation/notes (figma, topic, wireshark notes)
```

## Tech Stack

- **Framework**: Expo (~55.0.2) with React Native (0.83.2)
- **Language**: TypeScript
- **State Management**: Redux Toolkit + React Redux
- **Navigation**: React Navigation (bottom tabs + native stack)
- **Web**: react-native-web for browser rendering

## Running the App

The app is configured as a workflow ("Start application") running:
```
cd lab && npx expo start --web --port 5000
```

It runs on port 5000 and is accessible via the Replit web preview.

## Deployment

Configured as a static deployment:
- **Build**: `cd lab && npx expo export --platform web`
- **Public Dir**: `lab/dist`
