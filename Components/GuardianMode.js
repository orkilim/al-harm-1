import React, { useState, useEffect } from 'react';
import { StyleSheet, Button, Text, View, PermissionsAndroid, NativeEventEmitter, NativeModules, Switch } from 'react-native';
import BleManager, { stopScan } from 'react-native-ble-manager';
import axios from 'axios'
import Geolocation from 'react-native-geolocation-service';
import Geocoder from 'react-native-geocoding';
import PushNotification from "react-native-push-notification";
import BackgroundTimer from 'react-native-background-timer';

const BleManagerModule = NativeModules.BleManager
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule)

let scanInterval;
let peripheralConnectedTo=""//the id of the peripheral BLE i am connected to

export default function GuardianMode() {

  const [isScanning, setIsScanning] = useState(false)
  const peripherals = new Map()
  const [list, setList] = useState([])
  const [connectionToUser, setConnection] = useState("not connected to a user")
  const [guardian, setGuardian] = useState(false)
  const [SOSreceived, setSOS] = useState("")
  const [guardianLabel, setGuardianLabel] = useState("Guardian Mode Disabled")

  const scanAndConnect = () => {
    if (guardian) {
      BleManager.scan([], 300, false)
        .then((peripheral) => {
          BleManager.getDiscoveredPeripherals()
        })
        .catch((err) => {
          if (err)
            console.log("error in discovering peripherals: " + err)
        })
    }
  }


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

  const handleStopScan = () => {
    console.log('Scan is stopped');
    setIsScanning(false);
  }


  const handleDisconnectedPeripheral = (data) => {
    let peripheral = peripherals.get(data.peripheral);
    if (peripheral) {
      peripheral.connected = false;
      peripherals.set(peripheral.id, peripheral);
      setList(Array.from(peripherals.values()));
    }
    setConnection("you are not connected to a user")
    console.log('Disconnected from ' + data.peripheral);
  }

  const handleUpdateValueForCharacteristic = (data) => {
    console.log('Received data from ' + data.peripheral + ' characteristic ' + data.characteristic, data.value);
  }


  const handleDiscoverPeripheral = (peripheral) => {
    console.log('Got ble peripheral', peripheral);
    if (!peripheral.name) {
      peripheral.name = 'NO NAME';
    }

    if (peripheral.name === "Alharm") {
      peripherals.set(peripheral.id, peripheral);
      setList(Array.from(peripherals.values()));
      BleManager.stopScan()
      peripheralConnectedTo=peripheral.id
      BleManager.connect(peripheral.id)
        .then(async () => {
          await BleManager.retrieveServices(peripheral.id)
            .then(async (peripheralInfo) => {
              while (BleManager.isPeripheralConnected()) {
                setConnection("you are connected to a user")
                await BleManager.read(peripheral.id, "12345678-0000-1000-8000-12345678ABCD", "87654321-0000-1000-8000-DCBA87654321")
                  .then(async (data) => {
                    console.log("my data: " + data[0])
                    if (data[0] == 90) {

                      /**here we find the address and we send the SOS signal */

                      Geolocation.getCurrentPosition(
                        (position) => {
                          /**we take the received coordinates and turn them to an address */
                          Geocoder.init("AIzaSyBm3MC9Zv5sYVb23j8zkJWnSM2p12VXlM0")//uses the google API key- we need to hide it
                          Geocoder.from({ lat: position.coords.latitude, lng: position.coords.longitude })
                            .then(json => {
                              json.results[0]
                              const addressComponent = json.results[0].formatted_address;
                              console.log(addressComponent);
                              setSOS("SOS from address:\n" + addressComponent)
                              PushNotification.localNotification({
                                /* Android Only Properties */
                                channelId: "1", 
                                title: "al-harm triggered in your vicinity",
                                message: `address: ${addressComponent}`
                              })
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
                      const msg = data[0].toString()
                      


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
  }


  useEffect(() => {

    //ask for permission to activate ble and gps
    askForPermission()


    //initiate ble
    BleManager.start({ showAlert: false });

    bleManagerEmitter.addListener('BleManagerDiscoverPeripheral', handleDiscoverPeripheral);
    bleManagerEmitter.addListener('BleManagerStopScan', handleStopScan);
    bleManagerEmitter.addListener('BleManagerDisconnectPeripheral', handleDisconnectedPeripheral);
    bleManagerEmitter.addListener('BleManagerDidUpdateValueForCharacteristic', handleUpdateValueForCharacteristic);

    //scanAndConnect()


  }, [])


  useEffect(() => {
    if (guardian) {
      scanInterval=BackgroundTimer.setInterval(() => {
        // this will be executed every 5 minutes
        // even when app is the the background
        PushNotification.localNotification({
          channelId:"1",
          title:"Scanning for al-harm",
          message:"Scanning for al-harm ble devices"
        })
    }, 300000);
    
      scanAndConnect()
    }
    else{
      BleManager.stopScan()
      BleManager.disconnect(peripheralConnectedTo)
      setConnection("not connected to user")
      setSOS("")
      BackgroundTimer.clearInterval(scanInterval);
    }
  }, [guardian])


  


  return (
    <View style={styles.container}>
      <Switch value={guardian} onValueChange={() => {
        setGuardian(guardian ? false : true)
        setGuardianLabel(guardian ? "Guardian Mode Disabled" : "Guardian Mode Active")
      }} ></Switch>
      <Text>{guardianLabel}</Text>
      <Text>{connectionToUser}</Text>
      <Text>{SOSreceived}</Text>
    </View>
  )

}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});



/*axios.post('https://07lzvzo1sk.execute-api.eu-west-1.amazonaws.com/deploy_1', { "msg": address })
                        .then((awsData) => {
                          console.log("this is the status from aws: " + awsData.status)
                          console.log("this is the status text from aws: " + awsData.statusText)
                          if (data[0] != 90)
                            return;
                        })
                        .catch((awsErr) => {
                          if (awsErr)
                            console.log("this is aws error: " + awsErr)
                        })*/