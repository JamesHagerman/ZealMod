// @flow
import React, { Component } from 'react';
import HID from 'node-hid';
import Home from '../components/Home';

const devices = HID.devices();

export default class HomePage extends Component {

  constructor(props) {
    super(props);

    this.state = {
      usbConnected: false,
      hidConnected: false
    };

    this.connectToUSB = this.connectToUSB.bind(this);
    this.connectToHID = this.connectToHID.bind(this);

    console.warn('wow, devices:', devices);
  }

  connectToUSB() {
    console.log('USB connecting...');
    this.setState({
      usbConnected: true
    });
  }

  connectToHID() {
    console.log('HID connecting...');
    this.setState({
      hidConnected: true
    });
  }

  render() {
    return (
      <div>
        <Home />
        <div>USB State: {this.state.usbConnected ? 'Connected!' : 'Disconnected'} </div>
        <div>HID State: {this.state.hidConnected ? 'Connected!' : 'Disconnected'} </div>
        <button onClick={this.connectToUSB}>Connect To USB</button>
        <button onClick={this.connectToHID}>Connect To HID</button>
      </div>
    );
  }
}
