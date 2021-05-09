import React, { useEffect, useState, useLayoutEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, Button  } from 'react-native'
import { Searchbar } from 'react-native-paper';
import Contacts from 'react-native-contacts';

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


export default function ContactsPage({ route, navigation }) {
  const [contacts, setContacts ] = useState([])
  const [filteredDataSource, setFilteredDataSource] = useState([])
  const [closeFriends, setCloseFriends ] = useState([])
  const [searchQuery, setSearchQuery] = React.useState('')
  const onChangeSearch = query => setSearchQuery(query)
  const [show, setShow] = useState(false)

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Button 
        onPress={() => {
          navigation.navigate('fetch', {
            contacts: { ...closeFriends },
            womanAddress: route.params
          });
        }}
          title="Finish"
          disabled={closeFriends.length > 0 ? false : true}
        />
      ),
    });
  }, [navigation, closeFriends])


  // useEffect(() => {
  //   (async () => {
  //     const { status } = await Contacts.requestPermissionsAsync();
  //     if (status === 'granted') {
  //       const { data } = await Contacts.getContactsAsync({
  //         fields: [Contacts.Fields.PhoneNumbers],
  //       });

  //       if (data.length > 0) {
  //         const result = data.filter((item) => item.name !== undefined)
  //         setContacts(result)
  //         setFilteredDataSource(result)
  //       }
  //     }
  //   })();
  // }, []);

  useEffect(() => {
    Contacts.getAll().then(contacts => {
      const data = contacts.map((curr) => ({
        id: curr.rawContactId,
        name: curr.givenName ? curr.givenName : null,
        phone: curr.phoneNumbers && curr.phoneNumbers[0] && curr.phoneNumbers[0].number ? curr.phoneNumbers[0].number : null,
      })).filter((bla) => bla.phone !== null)
      console.log(JSON.stringify(data, null, 4))
      setContacts(data)
      setFilteredDataSource(data)
    })
  })

  
  const updateSearch = (txt) => {
    onChangeSearch(txt)
    setFilteredDataSource(contacts.filter((obj) => obj.name.indexOf(txt) > -1))
    setShow(true)
  }

  const handlePress = (item) => {
    console.log('blaallaal')
    setCloseFriends(closeFriends.some(bla => bla.name === item.name) ? closeFriends.filter((it) => it.name !== item.name) : [ ...closeFriends, { name: item.name, phoneNumber: item.phoneNumbers[0].number }])
  }
  

  const Item = ({ item, onPress, backgroundColor, textColor }) => (
    <TouchableOpacity 
        onPress={onPress}
        style={[styles.item, backgroundColor]}>
      <Text style={[styles.title, textColor]}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderItem = ({ item }) => {
    const backgroundColor = closeFriends.some(bla => bla.name === item.name) ? "#6e3b6e" : "#f9c2ff";
    const color = closeFriends.some(bla => bla.name === item.name) ? 'white' : 'black';

    return (
      <Item
        item={item}
        onPress={() => handlePress(item)}
        backgroundColor={{ backgroundColor }}
        textColor={{ color }}
      />
    );
  };

    return (
        <View>
            <Searchbar
                placeholder="Type Here..."
                onChangeText={updateSearch}
                value={searchQuery}
                onClear={() => setShow(false)}
            />
            <FlatList
            data={show ? filteredDataSource : contacts}
            numColumns={1}
            renderItem={renderItem}
            ItemSeparatorComponent={()=> <View style={{height: 2, width: "100%", backgroundColor: "rgba(0,0,0,0.5)", }} />}
            keyExtractor={(item, index) => item.id}
        />
        </View>
      )
}