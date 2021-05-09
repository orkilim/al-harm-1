import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text } from 'react-native'
const AWS = require('aws-sdk')

const awsConfig = {
  region: 'eu-west-1',
  accessKeyId: 'AKIAUGHYJEB4Y6KBN4EK', 
  secretAccessKey: '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'
}
AWS.config.update(awsConfig)

const params = {
  TableName: 'woman',
  Item:{
      "id": 3,
      "name": "ororororor",
      "guards": [
        {
          "name": "ororororor",
          "phone": "1234",
        },
        {
          "name": "ororororor",
          "phone": "1234",
        },
        {
          "name": "ororororor",
          "phone": "1234",
      },
  ]
  }
};


const styles = StyleSheet.create({
  container:{
    flexDirection: 'row',
    alignItems: 'center',
  },
  textArea: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize : 40,
  },
  item: {
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
  },
});


export default function fetch({ route, navigation }) {
    const [data, setData] = useState([]);
    const { constacts, womanAddress } = route.params

    useEffect(() => {
      async function fetchData() {
      const docClient = new AWS.DynamoDB.DocumentClient()

      console.log("Adding a new item...");
      docClient.put(params, function(err, data) {
          if (err) {
              console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
          } else {
              console.log("Added item:", JSON.stringify(data, null, 2));
          }
      });
      }
      fetchData();
  }, [])

  
    return (
        <View>
        <Text>jghhjkghjhjkghjgjkghhj</Text>
        </View>
      )
}