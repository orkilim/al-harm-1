import React, { useState, useEffect } from 'react';
import { StyleSheet, Button, Text, View, PermissionsAndroid, NativeEventEmitter, NativeModules } from 'react-native';
import BleManager from 'react-native-ble-manager';
import axios from 'axios'

const BleManagerModule = NativeModules.BleManager
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule)


export default function GuardianMode () {

    const [isScanning, setIsScanning] = useState(false)
    const peripherals = new Map()
    const [list, setList] = useState([])
    const [connectionToUser,setConnection]=useState("not connected to a user")
    const [SOSreceived,setSOS]=useState("")

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
        if (peripheral.name === "ButtonLED") {
          peripherals.set(peripheral.id, peripheral);
          setList(Array.from(peripherals.values()));
    
    
          BleManager.connect(peripheral.id)
            .then(async () => {
              await BleManager.retrieveServices(peripheral.id)
                .then(async (peripheralInfo) => {
                  while (BleManager.isPeripheralConnected()) {
                    setConnection("you are connected to a user")
                    await BleManager.read(peripheral.id, "12345678-0000-1000-8000-12345678ABCD", "87654321-0000-1000-8000-DCBA87654321")
                      .then( async (data) => {
                        console.log("my data: " + data[0])
                        if (data[0] == 90) {
                          const msg=data[0].toString()
                          axios.post('https://07lzvzo1sk.execute-api.eu-west-1.amazonaws.com/deploy_1', { "msg": msg })
                            .then((awsData) => {
                                setSOS("SOS received from: ")//add address!!!!!
                              console.log("this is the status from aws: " + awsData.status)
                              console.log("this is the status text from aws: " + awsData.statusText)
                              if (data[0] != 90)
                                return;
                            })
                            .catch((awsErr) => {
                              if (awsErr)
                                console.log("this is aws error: " + awsErr)
                            })
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
    
    
    
    
    
          /*BleManager.retrieveServices(peripheral.id)
            .then(async (info) => {
              while(guardianMode)
              {
                await BleManager.read(peripheral.id, "12345678-0000-1000-8000-12345678ABCD", "87654321-0000-1000-8000-DCBA87654321")
                      .then((data) => {
                        console.log("my data: " + data[0])
                      })
                      .catch((err)=>{
                        if(err)
                        console.log("blah blah salsa dancing:\n"+err)
                      })
              }
            })*/
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
    
        scanAndConnect()
    
    
      }, [])


      return(
          <View style={styles.container}>
              <Text>You Are in Guardian mode</Text>
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