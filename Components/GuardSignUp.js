import React, { useState } from 'react';
import { View, Button, TextInput, StyleSheet } from 'react-native'

export default function GuardSignUp() {
    const INITIAL_Guard_STATE = { username: '', password: '', email: '', phone_number: '' };
    const [guard, setGuard] = useState(INITIAL_Guard_STATE)

    const signUp = () => {
        console.log(guard)
    }
 
    return (
      <View style={styles.container}>
        <TextInput
          style={styles.input}
          placeholder='Username'
          autoCapitalize="none"
          placeholderTextColor='white'
          onChangeText={val => setGuard({ ...guard, username: val})}
        />
        <TextInput
          style={styles.input}
          placeholder='Password'
          secureTextEntry={true}
          autoCapitalize="none"
          placeholderTextColor='white'
          onChangeText={val => setGuard({ ...guard, password: val})}
        />
        <TextInput
          style={styles.input}
          placeholder='Email'
          autoCapitalize="none"
          placeholderTextColor='white'
          onChangeText={val => setGuard({ ...guard, email: val})}
        />
        <TextInput
          style={styles.input}
          placeholder='Phone Number'
          autoCapitalize="none"
          placeholderTextColor='white'
          onChangeText={val => setGuard({ ...guard, phone_number: val})}
        />
        <Button
          title='Sign Up'
          onPress={signUp}
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