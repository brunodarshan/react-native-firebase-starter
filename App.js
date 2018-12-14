import React from 'react';
import { StyleSheet, ActivityIndicator, FlatList, Text, TextInput, View, ScrollView, ToastAndroid, Button, Dimensions, Modal} from 'react-native';
import ActionButton, { ActionButtonItem } from 'react-native-action-button'
import {deepOrange} from './utils/Colors';
import moment from 'moment'

import firebase from 'react-native-firebase';

export default class App extends React.Component {
  state = {users: null, contentLoaded: false, newUser: {}, modalIsVisible: false}

  async componentDidMount() {
    await firebase.firestore().collection('users').get().then((snapshot) => {
      let users = []
      snapshot.forEach((doc) => {
        let user = { name, number, birthday, valid_until } = doc.data();
        user.reference = doc.reference;
        users.push(user);
      })
      this.setState({users, contentLoaded: true})
    })
  }

  RenderList(){
    return(<FlatList data={this.state.users} renderItem={({item}) => <ItemContent user={item} /> } />)
  }     
  
  async submit(){
    let { newUser } = this.state;
    await firebase.firestore().collection('users').add(newUser).then((docRef)=>{
      ToastAndroid.show(`$newUser.name adicionado com sucesso!`, ToastAndroid.SHORT)
      setTimeout(() => {
        this.setState({modalIsVisible: false})
      }, 500)
    }).catch((error)=> 
      ToastAndroid.show(`Falha ao salvar dados de usuário.`, ToastAndroid.SHORT)
    );
  }

  render() {
    return (
      <React.Fragment>
      <View style={styles.container}>
        { this.state.users ? this.RenderList() : <OnLoading /> }
      </View>
      <Modal visible={this.state.modalIsVisible} >
        <FormUser newUser={this.state.newUser} submit={this.submit.bind(this)} />
      </Modal>
      <ActionButton buttonColor={deepOrange} onPress={() => this.setState((prev) => ({modalIsVisible: !prev.modalIsVisible}))}/>
      </React.Fragment>
    );
  }
}

function OnLoading(){
  return (<ActivityIndicator size="large" color={deepOrange} />)
}

function ItemContent(props) {
  return(
      <View key={props.user.reference} style={{padding: 8, backgroundColor: "#fff", width: Dimensions.get('screen').width - 10 }}>
        <Text style={{fontWeight: 'bold', fontSize: 16}}>{props.user.name}</Text>
        <Text style={{fontSize: 10}}>{props.user.number}</Text>
      </View>
  )
}

class FormUser extends React.Component {
  constructor(props) {
    super(props)
    this.state = props.newUser
    this.state.isDateTimePickerVisible = false;
    this.state.currentDatePickerResource = null;
  }

  _handleDatePicked(data) {
    if (this.state.currentDatePickerResource === "birthday") {
      this.setState({birthday: data});
    } elseif (this.state.currentDatePickerResource === "valid_until") {
      this.setState({valid_until: date });
    }
  }
  

  render(){
    let dateOutput = (value && typeof(value) === Date) ? value : Date.format()
    return(<View style={{paddingHorizontal: 10, paddingVertical: 20}}>
        <TextInput onChange={(name) => this.setState({name})} accessibilityHint="Nome" value={this.state.name} />
        <TextInput onChange={(number) => this.setState({number})} accessibilityHint="Telefone" value={this.state.number} />
        <TouchableWithoutFeedback onPress={() => this.setState({currentDatePickerResource: "birthday", isDateTimePickerVisible: true })}>
          <View style={{padding: 4}}>
             <Text style={{fontWeight: '500'}}> `Nascido em: ${moment().format(dateOutput, 'dd/MM/yyyy')}`</Text>
          </View>
        </TouchableWithoutFeedback>
        <TouchableWithoutFeedback onPress={() => this.setState({currentDatePickerResource: "valid_until", isDateTimePickerVisible: true })}>
          <View style={{padding: 4}}>
             <Text style={{fontWeight: '500'}}> `Nascido em: ${moment().format(dateOutput, 'dd/MM/yyyy')}`</Text>
          </View>
        </TouchableWithoutFeedback>
        <DateTimePicker
          isVisible={this.state.isDateTimePickerVisible}
          onConfirm={this._handleDatePicked}
          onCancel={() => this.setState({isDateTimePickerVisible: false, currentDatePickerResource: null})}
        />
        <Button title="Salvar" onPress={() => {this.props.submit(); this.setState({isDateTimePickerVisible: false })} }/>
    </View>)
  }
}


const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
});
