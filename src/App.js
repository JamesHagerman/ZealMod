import React, { Component } from 'react';
//import logo from './logo.svg';
//import './App.css';

// Known vendor IDs for ZealPC keyboards:
const knownVendorIDs = [0xfeed]
// Configure which USB interface and endpoint to use:
let keyboardInterface = 1
let keyboardEndpoint = 1

class App extends Component {
  constructor(props) {
    super(props)
    this.allowUSBDevice = this.allowUSBDevice.bind(this)
  }

  allowUSBDevice() {
    // Build a filter to only select some of the currently connected USB devices:
    const filters = knownVendorIDs.map(vendorId => ({ vendorId }))

    // Tell the browser to ask the User for access to the available devices:
    navigator.usb.requestDevice({ filters })
      .then(device => {
        // Note: Device Objects returned from the WebUSB APIs do not play nice with JSON.stringify()
        console.log(`Newly allowed USB device:`, device)
        //this.updateDeviceList()
      })
      .catch(err => {
        console.log(err)
      })
  }

  render() {
    return (
      <div className="App">
        <p className="App-intro">
          ZealMod is a web based configuration tool for the ZealPC mechanical keyboards. It is a work in progress...
        </p>
        <p>
          The goal of this project is to use WebUSB to send new keymaps to the keyboard via raw HID messages.
        </p>
        <button onClick={this.allowUSBDevice}>Connect to keyboard</button>
      </div>
    );
  }
}

export default App;
