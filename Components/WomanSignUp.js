import React, { useState, useEffect } from 'react';
import { View, Button, TextInput, StyleSheet } from 'react-native'

export default function WomanSignUp({ navigation }) {
    const INITIAL_Woman_STATE = { username: '', password: '', phoneNumber: '', address: '' };
    const [woman, setWoman] = useState(INITIAL_Woman_STATE)
    const [token, setToken] = useState(null);


    const onSubmit = async () => {
      console.log('woman: ', woman)
          try {
              await fetch(`https://al-harm.herokuapp.com/woman/signup`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify ({
                      "username": woman.username,
                      "password": woman.password,
                      "phoneNumber": woman.phoneNumber,
                      "address": woman.address,
                  }),
              })
              .then(res => res.json())
              .then(response => {
                console.log(response)
                setToken(response.token);
                if (response.token) {
                  return navigation.navigate('ContactsPage', {
                    woman: { ...woman },
                    token: token,
                    from: 'Woman',
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
          placeholder='Allina Baker'
          autoCapitalize="none"
          placeholderTextColor='white'
          onChangeText={val => setWoman({ ...woman, username: val })}
        />
        <TextInput
          style={styles.input}
          placeholder='********'
          autoCapitalize="none"
          placeholderTextColor='white'
          onChangeText={val => setWoman({ ...woman, password: val })}
        />
        <TextInput
          style={styles.input}
          placeholder='+972526777829'
          autoCapitalize="none"
          placeholderTextColor='white'
          onChangeText={val => setWoman({ ...woman, phoneNumber: val })}
        />
        <TextInput
          style={styles.input}
          placeholder='Has 1 apt.7 Ramat Gan'
          autoCapitalize="none"
          placeholderTextColor='white'
          onChangeText={val => setWoman({ ...woman, address: val })}
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
