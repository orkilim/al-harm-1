
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


export default function Statistics({ route, navigation }) {
    const [data, setData] = useState({ avgTime: '', commonArea: '', day: ''})
    const [show, setShow] = useState(false)
    const switchShow = () => setShow(show => !show)

  useEffect(() => {
    const saveData = async () => {
      try {
        await fetch('https://al-harm.herokuapp.com/get', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        })
        .then(res => res.json())
        .then(response => {
          console.log(response)
          setData({
            avgTime: response.avgTime,
            commonArea: response.commonArea,
            day: response.day,
          })
        })
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
            <Text style={{ fontSize: 20, margin: 4, textAlign: 'center' }}>most cases occured in: {data.commonArea}</Text>
            <Text style={{ fontSize: 20, margin: 4, textAlign: 'center' }}>At: {data.day}</Text>
            <Text style={{ fontSize: 20, margin: 4, textAlign: 'center' }}>Between: {data.avgTime}</Text>
        </View>
      )
  }

  return show ? textToUser() : loder();
}
