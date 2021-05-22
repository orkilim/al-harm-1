import React, { useState, useEffect } from 'react';
import { Button, View, Text, ActivityIndicator, TouchableOpacity, PermissionsAndroid, NativeModules, NativeEventEmitter, StyleSheet } from 'react-native';
import BleManager, { stopScan } from 'react-native-ble-manager';
import axios from 'axios'
import BackgroundTimer from 'react-native-background-timer';
import Geolocation from 'react-native-geolocation-service';
import Geocoder from 'react-native-geocoding';
import SoundRecorder from 'react-native-sound-recorder';
import PushNotification from 'react-native-push-notification';
import SoundPlayer from 'react-native-sound-player';
import fs from 'react-native-fs'

const BleManagerModule = NativeModules.BleManager
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule)
let connected = false
let scanInterval
let pathToRecording
//const recordingsArray = []
//const recordingCounter = 0
let recordingInterval

export default function EndSession({ route, navigation }) {
  const { contacts, woman, token } = route.params
  const [show, setShow] = useState(false)
  const [isScanning, setIsScanning] = useState(false)//are we scanning for al-harm ble devices
  const peripherals = new Map()
  const [list, setList] = useState([])
  const [connectionToUser, setConnection] = useState("not connected to a ble device")//will show whether we are connected to a user or not
  const [isRecording, setIsRecording] = useState("")//shows if we are recording or not
  const [stopRecordingButtonVisibility, setVisibility] = useState(false)
  const [playVisibility, setPlayVisibility] = useState(false)

  const switchShow = () => setShow(show => !show)

  //-----------useEffect-s section----------------

  useEffect(() => {
    const saveData = async () => {
      console.log('contacts: ', contacts)
      try {
        await fetch(`https://al-harm.herokuapp.com/woman/update`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phoneNumber: woman.phoneNumber,
            guards: contacts,
          }),
        })
          .then(res => res.json())
          .then(response => console.log(response))
      } catch (err) {
        console.log(`fetch: ${err}`);
      }
      switchShow()
    }
    saveData();
  }, [])



  useEffect(() => {

    //ask for permission to activate ble and gps
    askForPermission()

    //initiate ble
    BleManager.start({ showAlert: false });

    bleManagerEmitter.addListener('BleManagerDiscoverPeripheral', handleDiscoverPeripheral);
    bleManagerEmitter.addListener('BleManagerStopScan', handleStopScan);
    bleManagerEmitter.addListener('BleManagerDisconnectPeripheral', handleDisconnectedPeripheral);
    bleManagerEmitter.addListener('BleManagerDidUpdateValueForCharacteristic', handleUpdateValueForCharacteristic);

    scanAndConnect()
  }, [])


  useEffect(()=>{
    askStoragePermission()
    const path=fs.DocumentDirectoryPath+"/al_harm_recording.mp4"
    fs.exists(path)
    .then((fileExist)=>{
      if(fileExist)
      {
        setPlayVisibility(true)
      }
      
    })
    
    
  },[])


  //--------functions section----------

  //function to scan for ble al-harm devices and connect with them

  const askStoragePermission=async ()=>{
    try {
      const permissionStatus = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
          title: "permission for storage",
          message: "please grant access to storage",
          buttonPositive: "sure",
          buttonNegative: "nope"
        }
      )
      console.log("permission data is:\n" + permissionStatus)
      
        
    }
    catch (err) {
      console.log("problem with permission:\n" + err)
    }
  }

  const scanAndConnect = () => {
    BleManager.scan([], 10, false)
      .then((peripheral) => {
        BleManager.getDiscoveredPeripherals()
      })
      .catch((err) => {
        if (err)
          console.log("error in discovering peripherals: " + err)
      })
  }


  //function to receive permission to use GPS
  async function askForPermission() {
    console.log("inside")
    try {
      const permissionStatus = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: "BLE permission",
          message: "please grant access to BLE",
          buttonPositive: "sure",
          buttonNegative: "nope"
        }
      )
      console.log("permission data is:\n" + permissionStatus)
      if (permissionStatus)
        setFlag(true)
    }
    catch (err) {
      console.log("problem with permission:\n" + err)
    }
  }


  //handler for when the scan for ble devices is stopped
  const handleStopScan = () => {
    console.log('Scan is stopped');
    setIsScanning(false);
  }

  //handler for when the ble al-harm device is disconnecting from the system
  const handleDisconnectedPeripheral = (data) => {
    let peripheral = peripherals.get(data.peripheral);
    if (peripheral) {
      peripheral.connected = false;
      peripherals.set(peripheral.id, peripheral);
      setList(Array.from(peripherals.values()));
    }
    setConnection("you are not connected to an al-harm ble device")
    console.log('Disconnected from ' + data.peripheral);
  }


  const handleUpdateValueForCharacteristic = (data) => {
    console.log('Received data from ' + data.peripheral + ' characteristic ' + data.characteristic, data.value);
  }

  //handler for when the scan discovers a peripheralble device
  const handleDiscoverPeripheral = (peripheral) => {
    console.log('Got ble peripheral', peripheral);
    if (!peripheral.name) {
      peripheral.name = 'NO NAME';
    }

    if (peripheral.name === "Alharm") {
      peripherals.set(peripheral.id, peripheral);
      setList(Array.from(peripherals.values()));
      BleManager.stopScan()
      peripheralConnectedTo = peripheral.id
      scanInterval = BackgroundTimer.setInterval(() => {
        if (!connected) {
          console.log("connecting the user to the al-harm device")
          BleManager.connect(peripheral.id)
            .then(async () => {
              console.log("we are connected as a user")
              connected = true
              await BleManager.retrieveServices(peripheral.id)
                .then(async (peripheralInfo) => {
                  while (BleManager.isPeripheralConnected()) {
                    setConnection("you are connected to a user")
                    await BleManager.read(peripheral.id, "12345678-0000-1000-8000-12345678ABCD", "87654321-0000-1000-8000-DCBA87654321")
                      .then(async (data) => {
                        console.log("my data: " + data[0])
                        if (data[0] == 90) {

                          /**here we find the address and we send the SOS signal */

                          //----we need to add a call to the al-harm server to LOG the SOS sent----



                          Geolocation.getCurrentPosition(
                            (position) => {
                              /**we take the received coordinates and turn them to an address */
                              Geocoder.init("AIzaSyBm3MC9Zv5sYVb23j8zkJWnSM2p12VXlM0")//uses the google API key- we need to hide it
                              Geocoder.from({ lat: position.coords.latitude, lng: position.coords.longitude })
                                .then(json => {
                                  json.results[0]
                                  const addressComponent = json.results[0].formatted_address;
                                  console.log(addressComponent);
                                })
                                .catch(error => console.warn("error in geocoding from coordinates to address: " + error));

                            },
                            (error) => {
                              // See error code charts below.
                              console.log("error in finding coordinates: " + error.code, error.message);
                            },
                            { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
                          );

                          /**sending the SOS signal to the close friends/remote guardians*/
                          //const msg = data[0].toString()
                          twilio()

                          /**starting a new recording and a notification interval to remind that it is recording */

                          SoundRecorder.start(fs.DocumentDirectoryPath + "/al_harm_recording.mp4")
                            .then(function () {
                              console.log('started recording');
                              //recordingCounter++;
                              setIsRecording("recording...")
                              recordingInterval = BackgroundTimer.setInterval(() => {
                                PushNotification.localNotification({
                                  channelId: "1",
                                  title: "al-harm still recording...",
                                  message: "close the app completely or hit the STOP button in-app to stop recording"
                                })
                              }, 30000)
                              setVisibility(true)
                            });

                        }

                      })
                      .catch((error) => {
                        if (error)
                          console.log("my error: " + error)
                      })
                  }
                })
                .catch((innerErr) => {
                  if (innerErr)
                    console.log("innerErr: " + innerErr)
                })
            })
            .catch((err) => {
              if (err)
                console.log("a problem with connection to ble:\n" + err)
            })
        }
      }, 1000)
      BackgroundTimer.clearInterval()
    }
  }

  const loder = () => {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  //sends an SMS to the assigned contacts
  const twilio = async () => {
    try {
      await fetch(`https://al-harm.herokuapp.com/woman/sms?phoneNumber=${woman.phoneNumber}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })
        .then(res => res.json())
        .then(response => console.log(response))
    } catch (err) {
      console.log(`fetch: ${err}`);
    }
  }

  const stopRec = () => {
    SoundRecorder.stop()
      .then(function (result) {
        setIsRecording("stopped recording")
        console.log('stopped recording, audio file saved at: ' + result.path);
        BackgroundTimer.clearInterval(recordingInterval)
        pathToRecording = result.path
        setVisibility(false)
        setPlayVisibility(true)
      });
  }

  const playRec = () => {
    SoundPlayer.playUrl(fs.DocumentDirectoryPath+"/al_harm_recording.mp4")
  }

  //-------possible rendering options for the EndSession component-----
  /*const Button = ({ text, onPress }) => {
    return (
      <TouchableOpacity onPress={onPress}>
        <View style={styles.btnContainerStyle}>
          <Text style={styles.btnTextStyle}> {text} </Text>
        </View>
      </TouchableOpacity>
    )
  }*/

  /*<Button
            text="sms"
            onPress={() => twilio()}
          />*/

  const textToUser = () => {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: 40, marginTop: -20, textAlign: 'center' }}>Data Saved Successully!</Text>
        <View style={styles.fixToText}>
          <Button title="send sms to contacts" onPress={() => { twilio() }} ></Button>
          <Text>{connectionToUser}</Text>
          <View style={{ display: stopRecordingButtonVisibility ? "flex" : "none" }} >
            <Button title="stop recording" onPress={() => { stopRec() }}></Button>
          </View>
          <Text>{isRecording}</Text>
          <View style={{ display: playVisibility ? "flex" : "none" }} >
            <Button title="play recording" onPress={() => { playRec() }} ></Button>
          </View>
        </View>
      </View>
    )
  }

  return show ? textToUser() : loder();
}



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