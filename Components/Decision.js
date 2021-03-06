import * as React from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';

const Stack = createStackNavigator();
const width = Dimensions.get('window').width

const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      marginHorizontal: 16,
    },
    title: {
      textAlign: 'center',
      marginVertical: 8,
    },
    fixToText: {
      justifyContent: 'space-between',
      display: 'flex'
    },
    btnContainerStyle: {
        backgroundColor: '#42A5F5',
        paddingVertical: 8,
        width: width / 1.1,
        height: 55,
        margin: 10,
        borderRadius: 14,
        fontWeight: '500',
      },
      btnTextStyle: {
        color: '#ffffff',
        fontSize: 25,
        textTransform: 'uppercase',
        textAlign: 'center',
        justifyContent: 'center',
      },
});


const Button = ({ text, onPress }) => {
    return (
      <TouchableOpacity onPress={onPress}>
        <View style={styles.btnContainerStyle}>
          <Text style={styles.btnTextStyle}> {text} </Text>
        </View>
      </TouchableOpacity>
    )
}

export default function Desicion({ navigation }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <View style={styles.fixToText}>
            <Button
                text="Login"
                onPress={() =>
                navigation.navigate('Login')}
            />
            <Button
                text="Sign Up"
                onPress={() =>
                navigation.navigate('WomanSignUp')}
            />
      </View>
    </View>
  );
}