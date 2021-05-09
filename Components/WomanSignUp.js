import React, { useState } from 'react';
import { View, Button, TextInput, StyleSheet } from 'react-native'

export default function WomanSignUp({ navigation }) {
    const INITIAL_Woman_STATE = { address: '', floor: '', apartmentNumber: '', phone_number: '' };
    const [woman, setWoman] = useState(INITIAL_Woman_STATE)

    const signUp = () => {
        console.log(woman)
    }

    
    return (
      <View style={styles.container}>
        <TextInput
          style={styles.input}
          placeholder='address'
          autoCapitalize="none"
          placeholderTextColor='white'
          onChangeText={val => setWoman({ ...woman, address: val })}
        />
        <TextInput
          style={styles.input}
          placeholder='floor'
          autoCapitalize="none"
          placeholderTextColor='white'
          onChangeText={val => setWoman({ ...woman, floor: val })}
        />
        <TextInput
          style={styles.input}
          placeholder='apartmentNumber'
          autoCapitalize="none"
          placeholderTextColor='white'
          onChangeText={val => setWoman({ ...woman, apartmentNumber: val })}
        />
        <TextInput
          style={styles.input}
          placeholder='Phone Number'
          autoCapitalize="none"
          placeholderTextColor='white'
          onChangeText={val => setWoman({ ...woman, phone_number: val })}
        />
        <Button
          title='Next'
        onPress={() => {
          /* 1. Navigate to the Details route with params */
          navigation.navigate('ContactsPage', { ...woman });
        }}
          // onPress={()=> navigation.navigate('ContactsPage')}
        />
      </View>
    )
}

const styles = StyleSheet.create({
  input: {
    width: 350,
    height: 55,
    backgroundColor: '#42A5F5',
    margin: 10,
    padding: 8,
    color: 'white',
    borderRadius: 14,
    fontSize: 18,
    fontWeight: '500',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  }
})