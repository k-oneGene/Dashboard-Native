import React, { Component } from 'react';
import { Text, View, TouchableOpacity, Alert } from 'react-native';
import { connect } from 'react-redux';
import { countdownTimerTick, countdownTimerStop, countdownTimerStart, countdownTimerFinished, countdownTimerReset } from "../../actions/action_CountdownTimer"
import { createRecordAndRefreshPomoCount } from "../../actions/action_Record";

import { Icon } from "react-native-elements";

import BlinkView from 'react-native-blink-view'
import moment from "moment";
import {Button} from "../common";

// const PomodoroClock = ({ onPress }) => {
//   const { buttonStyle, textStyle } = styles;
//
//   return (
//     <TouchableOpacity onPress={onPress} style={buttonStyle}>
//       <Text style={textStyle}>
//         25 : 00
//       </Text>
//     </TouchableOpacity>
//   )
// };
//
// export  { PomodoroClock };
//
const circleSize = 250;

const styles = {
  textStyle: {
    // alignSelf: 'center',
    // justifyContent: 'center',
    color: '#2C2727',
    fontSize: 40,
    // fontWeight: '200',
    // paddingTop: 10,
    // paddingBottom: 10,
  },
  buttonStyle: {
    backgroundColor: '#716F77',

    justifyContent: 'center',
    alignItems: 'center',

    width: circleSize,
    height: circleSize,
    borderRadius: circleSize/2,

    borderWidth: 5,
    borderColor: '#E37979',
    // marginLeft: 5,
    // marginRight: 5,
    marginTop: 10,
  },
  finishButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  finishButtonStyle: {
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#7f80f8',
  },
};


const intervalLength = 10; // in milliseconds

class PomodoroClock extends Component {

  constructor(props) {
    super(props);
    // this.state = {
    //   secondsRemaining : 0
    // }

    // this.tick = this.tick.bind(this);
    this.startTimer = this.startTimer.bind(this);
    // this.cancelTimer = this.cancelTimer.bind(this);
    this.onButtonTimerPress= this.onButtonTimerPress.bind(this);
    this.renderTime = this.renderTime.bind(this);
  }

  startTimer() {
    this.props.countdownTimerStart();
    this.timer = setInterval(this.tick.bind(this), intervalLength);
    // console.log("timer started")
  }

  tick() {
    this.props.countdownTimerTick();
    // console.log(this.props.countdownTimer);

    if (this.props.countdownTimer.seconds <= 0) {
      // console.log("this below 0 now finished!")
      clearInterval(this.timer);
      this.props.countdownTimerFinished();
    } else if (this.props.countdownTimer.status === 'ready') {
      clearInterval(this.timer);
    }
  }

  uploadPomodoro() {
    const { start_time, end_time } = this.props.countdownTimer;
    const current_task = this.props.tasks.filter((task) => {

      if (parseInt(task.id)==parseInt(this.props.selectedTask)) {
        return task.name
      }
    });

    const task_name = current_task[0].name;

    console.log(current_task)
    console.log(task_name)

    let data = {
      start_time: start_time,
      end_time : moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
      task: parseInt(this.props.selectedTask),
      task_name: task_name,
      type: "Pomodoro",
      // comment: state_data.comment,
    };
    console.log(data)

    this.props.createRecordAndRefreshPomoCount(data)
  }

  onButtonTimerUploadPress() {
    // Upload and reset timer
    this.props.countdownTimerReset();
    this.uploadPomodoro();
  }

  onButtonTimerDiscardPress() {
    Alert.alert(
      'Discard Pomodoro',
      'Are you sure you want to discard pomodoro?',
      [
        // {text: 'Ask me later', onPress: () => console.log('Ask me later pressed')},
        {text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
        {text: 'OK', onPress: () => this.props.countdownTimerReset()},
      ],
      { cancelable: false }
    )
  }

  onButtonTimerPress() {

    const { status } = this.props.countdownTimer;
    // console.log("on_press()")
    // console.log(this.props.selectedTask)
    // console.log(this.props.tasks)
    console.log('status: before button')
    console.log(status)

    if (status === 'running') {
      Alert.alert(
        'Reset timer?',
        'Are you sure you want to reset the timer?',
        [
          // {text: 'Ask me later', onPress: () => console.log('Ask me later pressed')},
          {text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
          {text: 'OK', onPress: () => this.props.countdownTimerReset()},
        ],
        { cancelable: false }
      )
    } else if (status === 'ready') {
      this.startTimer()
    }

    else if (status === 'finished') {
      // Now handled by seperate button.

      // Upload and reset timer
      // this.props.countdownTimerReset();
      // this.uploadPomodoro();
    }
  }

  // Adds 0 to start. Fixes time that looks like 25:0 instead of 25:00.
  pad(num) {
    return ("0"+num).slice(-2);
  }

  hhmmss(secs) {
    let minutes = Math.floor(secs / 60);
    secs = secs%60;
    let hours = Math.floor(minutes/60);
    minutes = minutes%60;
    return `${this.pad(minutes)}:${this.pad(secs.toFixed(0))}`;
    // return `${minutes}:${secs.toFixed(0)}`;
    // return `${hours}:${minutes}:${secs}`;
  }

  renderTime() {
    const { finishButtonContainer, textStyle, finishButtonStyle } = styles;

    if (this.props.countdownTimer.status === 'finished') {
      return (
        <View>
          {/*<BlinkView blinking={false} delay={300}>*/}
            {/*<Text style={textStyle}>Upload</Text>*/}
          {/*</BlinkView>*/}
          <View>
            <Text style={textStyle} >Upload</Text>
          </View>
          <View style={finishButtonContainer}>
            <TouchableOpacity onPress={this.onButtonTimerUploadPress.bind(this)} style={finishButtonStyle}>
              <Icon
                name='check'
                type='material-community'
                color='#3ace3a'
                size={50}
              />
            </TouchableOpacity>

            <TouchableOpacity onPress={this.onButtonTimerDiscardPress.bind(this)} style={finishButtonStyle}>
              <Icon
                name='trash-can'
                type='material-community'
                color='#ff6961'
                size={50}
              />
            </TouchableOpacity>
          </View>
        </View>
      )
    }
    return <Text style={textStyle}>{this.hhmmss(this.props.countdownTimer.seconds)}</Text>
  }

  render() {
    const { buttonStyle, textStyle } = styles;

    return (
      <TouchableOpacity onPress={this.onButtonTimerPress} style={buttonStyle}>
        {this.renderTime()}
      </TouchableOpacity>
    )
  }
}

function mapDispatchToProps(dispatch) {
  return {
    // fetchPomodoroCount: (start, finish) => dispatch(fetchPomodoroCount(start, finish)),
    countdownTimerTick: () => dispatch(countdownTimerTick()),
    countdownTimerStop: () => dispatch(countdownTimerStop()),
    countdownTimerStart: () => dispatch(countdownTimerStart()),
    countdownTimerFinished: () => dispatch(countdownTimerFinished()),
    countdownTimerReset: () => dispatch(countdownTimerReset()),
    createRecordAndRefreshPomoCount: (data) => dispatch(createRecordAndRefreshPomoCount(data)),
  };
}

function mapStateToProps(state) {
  return {
    countdownTimer: state.countdownTimer,
    selectedTask: state.pomodoroPickerForm.selectedTask,
    tasks: state.taskList.tasks,
  };
}
export default connect(mapStateToProps, mapDispatchToProps)(PomodoroClock);