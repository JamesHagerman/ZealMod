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
    this.state = {
      currentDevice: null,
      interfaceClaimed: false
    }
    this.allowUSBDevice = this.allowUSBDevice.bind(this)
    this.openDevice = this.openDevice.bind(this)
  }

  async openDevice() {
    let device = this.state.currentDevice
    console.log(`Trying to open ${device.manufacturerName.trim()} - ${device.productName.trim()}...`)
    
    try {
      await device.open()
      if (device.configuration === null) {
        await device.selectConfiguration(1)
      }
      console.log('Good, configuration selected...')

      await device.claimInterface(keyboardInterface)
      console.log('claim good')

      this.setState({ interfaceClaimed: true })

      await device.controlTransferOut({
        requestType: 'class',
        recipient: 'interface',
        request: 0x22,
        value: 0x01,
        index: keyboardInterface
      })

    }
    catch (err) {
      console.log('Oops:', err)
    }
  }

  allowUSBDevice() {
    // Build a filter to only select some of the currently connected USB devices:
    const filters = knownVendorIDs.map(vendorId => ({ vendorId }))

    // Tell the browser to ask the User for access to the available devices:
    navigator.usb.requestDevice({ filters })
      .then(device => {
        // Note: Device Objects returned from the WebUSB APIs do not play nice with JSON.stringify()
        console.log(`Newly allowed USB device:`, device)
        this.setState({ currentDevice: device })
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
        <p>
          Note: Because the OS often tries to grab the raw HID access on the keyboard, you will have to unbind the 
          correct device from the kernel driver. Do that using:
        </p>
        <pre>sudo su</pre>
        <pre>echo -n 2-1.2:1.1 | tee -a /sys/bus/usb/drivers/usbhid/unbind</pre>
        <p>
          Or something like that...
        </p>
        <button onClick={this.allowUSBDevice}>Connect to keyboard</button>
        <button onClick={this.openDevice}>Open Keyboard</button>
      </div>
    );
  }
}

export default App;
