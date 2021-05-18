import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity, StyleSheet } from 'react-native';

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


export default function EndSession({ route, navigation }) {
    const { contacts, woman, token } = route.params
    const [show, setShow] = useState(false)
    const switchShow = () => setShow(show => !show)

  useEffect(() => {
    const saveData = async () => {
      console.log('contacts: ', contacts)
      try {
        await fetch(`https://al-harm.herokuapp.com/woman/update`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify ({
                phoneNumber: woman.phoneNumber,
                guards: contacts,
            }),
        })
        .then(res => res.json())
        .then(response => console.log(response))
      } catch(err){
          console.log(`fetch: ${err}`);
      }
      switchShow()
    }
    saveData();
  }, [])

  const loder = () => {
      return (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator size="large" />
          </View>
      )
  }

  const twilio = async () => {
    try {
      await fetch(`https://al-harm.herokuapp.com/woman/sms?phoneNumber=${woman.phoneNumber}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
      })
      .then(res => res.json())
      .then(response => console.log(response))
    } catch(err){
        console.log(`fetch: ${err}`);
    }
  }

  const Button = ({ text, onPress }) => {
    return (
      <TouchableOpacity onPress={onPress}>
        <View style={styles.btnContainerStyle}>
          <Text style={styles.btnTextStyle}> {text} </Text>
        </View>
      </TouchableOpacity>
    )
}

  const textToUser = () => {
    return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 40, marginTop: -20, textAlign: 'center' }}>Data Saved Successully!</Text>
            <View style={styles.fixToText}>
            <Button
                text="sms"
                onPress={() => twilio()}
            />
            </View>
        </View>
      )
  }

  return show ? textToUser() : loder();
}