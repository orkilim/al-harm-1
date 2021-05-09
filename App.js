import * as React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import Navigation from './Navigation'


const Stack = createStackNavigator();

export default function App() {
  return (
    <Navigation />
  );
}