import React, { useState, useEffect, useForm } from 'react';
import { View, Button, TextInput, StyleSheet } from 'react-native'

export default function WomanSignUp({ navigation }) {
  const INITIAL_Woman_STATE = { username: '', phoneNumber: '', password: '' };
  const [woman, setWoman] = useState(INITIAL_Woman_STATE)
  const [token, setToken] = useState(null);

  const onSubmit = async () => {
    console.log('woman: ', woman)
        try {
            await fetch(`https://al-harm.herokuapp.com/woman/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify ({
                    "username": woman.username,
                    "phoneNumber": woman.phoneNumber,
                    "password": woman.password,
                }),
            })
            .then(res => res.json())
            .then(response => {
              console.log(response.token)
              setToken(response.token);
              if (response.token) {
                console.log("i have a token")
                return navigation.navigate('ContactsPage', {
                  woman: { ...woman },
                  token: token,
                  from: 'Login',
                });
              }
              return alert(response.msg)
            })
            
        } catch(err){
            console.log(`fetch: ${err}`);
        }
    }

    return (
      <View style={styles.container}>
        <TextInput
          style={styles.input}
          placeholder='username'
          autoCapitalize="none"
          placeholderTextColor='white'
          onChangeText={val => setWoman({ ...woman, username: val })}
        />
        <TextInput
          style={styles.input}
          placeholder='phoneNumber'
          autoCapitalize="none"
          placeholderTextColor='white'
          onChangeText={val => setWoman({ ...woman, phoneNumber: val })}
        />
        <TextInput
          style={styles.input}
          placeholder='password'
          autoCapitalize="none"
          placeholderTextColor='white'
          onChangeText={val => setWoman({ ...woman, password: val })}
        />
        <Button
          title='Next'
          onPress={() => onSubmit()}
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