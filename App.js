import React, { Component } from 'react';
import { SafeAreaView, View, Text, StatusBar, TextInput, TouchableOpacity, FlatList, Platform, ScrollView } from 'react-native'
import Styles from './Styles'
import AsyncStorage from '@react-native-community/async-storage';
import ViewPager from '@react-native-community/viewpager';
import Snackbar from 'react-native-snackbar';
import { hasNotch } from 'react-native-device-info';

const MyStatusBar = () => {
  if(Platform.OS == 'ios')
    return(
      <View style={{ height: hasNotch() ? 44 : 20, backgroundColor:'white'}}>
        <StatusBar barStyle="dark-content" backgroundColor={'white'}/>
      </View>
    )
  else 
    return <StatusBar barStyle="dark-content" backgroundColor={'white'}/>
}

let Tasks = {
  convertToArrayOfObject(tasks, callback) {
    // console.log("callback",callback,tasks.split("||").map((task, i) => ({ key: i, text: task })))
    return callback(
      tasks ? tasks.split("||").map((task, i) => ({ key: i, text: task })) : []
    );
  },
  convertToStringWithSeparators(tasks) {
    return tasks.map(task => task.text).join("||");
  },
  all(callback) {
    return AsyncStorage.getItem("TASKS", (err, tasks) =>
      this.convertToArrayOfObject(tasks, callback)
    );
  },
  save(tasks) {
    AsyncStorage.setItem("TASKS", this.convertToStringWithSeparators(tasks));
  }
};

class App extends Component {
  constructor(props){
    super(props);
    this.state = {
      username: '',
      message: '',
      tasks: [],
      text:'',
      activeIndex: 0
    }
  }

  onChangeText = text => {
    this.setState({ text });
  };

  addTask = () => {
    let notEmpty = this.state.message.trim().length > 0 && this.state.username.trim().length > 0;

    if (notEmpty) {
      this.setState(
        prevState => {
          let { tasks, text, username, message } = prevState;
          return {
            tasks: tasks.concat({ key: tasks.length, text: `${username} ^ ${message}` }),
            text: "",
            message: "",
            username: ""
          };
        },
        () => Tasks.save(this.state.tasks)
      );
      Snackbar.show({
        text: 'Data Saved',
        duration: Snackbar.LENGTH_SHORT
      })
    }
  };

  deleteTask = i => {
    this.setState(
      prevState => {
        let tasks = prevState.tasks.slice();

        tasks.splice(i, 1);

        return { tasks: tasks };
      },
      () => Tasks.save(this.state.tasks)
    );
    Snackbar.show({
      text: 'Entry Deleted',
      duration: Snackbar.LENGTH_SHORT
    })
  };

  UNSAFE_componentWillMount() {
    Tasks.all(tasks => this.setState({ tasks: tasks || [] }));
  }

  onSegmentButtonSelected(index,shouldNavigate){
    this.setState({ activeIndex: index });
    if(shouldNavigate)
        this.refs.viewPager.setPage(index)
  }

  render(){
    let { containerStyle, sectionTitle } = Styles, 
      disabled = (this.state.username && this.state.message) ? false: true,
      index = this.state.activeIndex;

    return (
      <View style={{ flex: 1}}>
        <MyStatusBar/>
        <SafeAreaView style={{flex: 1 }}>
          <View style={{ flexDirection:'row', alignItems:'center', paddingTop: 10, width:'100%', justifyContent:'center' }}>
            <TouchableOpacity style={{ width: 100, padding: 10, borderColor: 'powderblue', borderWidth: 1, borderRightWidth: 0, backgroundColor: index == 0 ? 'powderblue' : 'white', alignItems:'center' }} onPress={() => this.onSegmentButtonSelected(0, true)}>
                <Text style={{ color:'black' }}>Form</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ width: 100, padding: 10, borderColor: 'powderblue', borderWidth: 1, backgroundColor: index == 1 ? 'powderblue' : 'white', alignItems:'center' }} onPress={() => this.onSegmentButtonSelected(1, true)}>
                <Text style={{ color: 'black' }}>Data</Text>
            </TouchableOpacity>
          </View>
          <ViewPager style={{ flex: 1 }} initialPage={0} ref={'viewPager'} onPageSelected={event => this.onSegmentButtonSelected(event.nativeEvent.position)}>
            <View key="1" style={{ paddingHorizontal: 15}}>
              <Text style={{ alignSelf:'center', fontSize: 24, marginTop: 30 }}>Hi, Welcome to my Dream World</Text>
              <Text style={{ marginTop: 20, alignSelf:'center', fontSize: 18, fontWeight: '800' }}>What did you dream last night?</Text>

              <TextInput
                style={{ borderWidth: 1, padding: 10, marginTop: 20 }}
                ref="uname"
                placeholder={'First Name'}
                placeholderTextColor={'black'}
                value={this.state.username}
                onChangeText={username => this.setState({ username }) }
              />
              <TextInput
                style={{ borderWidth: 1, padding: 10, marginTop: 20, height: 150 }}
                ref="msg"
                placeholder={'Type your message here...'}
                placeholderTextColor={'black'}
                multiline={true}
                numberOfLines={10}
                value={this.state.message}
                onChangeText={message => this.setState({ message }) }
                // onChangeText={() => this.onChangeText}
              />
              <TouchableOpacity 
                style={{ backgroundColor:disabled ? 'grey':'#383a4d', padding: 10, alignSelf:'flex-end', width: 100, alignItems:'center', justifyContent:'center', marginTop: 20 }} 
                onPress={() => this.addTask()}
                // disabled={disabled}
              >
                <Text style={{ color:'white', fontSize: 16 }}>Submit</Text>
              </TouchableOpacity>
            </View>
            <View key="2" style={{ paddingHorizontal: 15, paddingVertical: 10}}>
              <FlatList
                style={{ flex: 1 }}
                // contentContainerStyle={{  }}
                data={this.state.tasks}
                keyExtractor={(item,index) => index.toString()}
                renderItem={({item,index}) => {
                  let split = item.text.split(' ^ ')
                  return(
                    <View style={{ flex: 1, flexDirection:'row', borderWidth: 1, justifyContent:'space-between', alignItems:'center'}}>
                      <Text style={{ width:'50%', margin: 7}}>{split[1]}</Text>
                      <View style={{width: 1, backgroundColor:'black', height:'100%'}}/>

                      <Text style={{ width:'30%', textAlign:'center', margin: 7}}>{split[0]}</Text>
                      <View style={{width: 1, backgroundColor:'black', height:'100%'}}/>

                      <TouchableOpacity onPress={() => this.deleteTask(index)}>
                        <Text style={{color:'red'}}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                  )
                }}
              />
            </View>
          </ViewPager>
        </SafeAreaView>
      </View>
    );
  }
};



export default App;
