import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import WomanSignUp from './Components/WomanSignUp'
import HomePage from './Components/HomePage'
import GuardSignUp from './Components/GuardSignUp'
import ContactsPage from './Components/Contacts'
import EndSession from './Components/EndSession'
import Decision from './Components/Decision'
import Login from './Components/Login'
import Statistics from './Components/Statistics'

const Stack = createStackNavigator();


export default function Navigation() {
    return (
        <NavigationContainer>
          <Stack.Navigator initialRouteName="HomePage">
              <Stack.Screen name="HomePage" component={HomePage} />
              <Stack.Screen name="Decision" component={Decision} />
              <Stack.Screen name="Login" component={Login} />
              <Stack.Screen name="WomanSignUp" component={WomanSignUp} />
              <Stack.Screen name="GuardSignUp" component={GuardSignUp} />
              <Stack.Screen name="ContactsPage" component={ContactsPage} />
              <Stack.Screen name="EndSession" component={EndSession} />
              <Stack.Screen name="Statistics" component={Statistics} />
          </Stack.Navigator>
        </NavigationContainer>
      );
}
