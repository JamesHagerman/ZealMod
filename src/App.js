import React, { Component } from 'react';
//import logo from './logo.svg';
//import './App.css';

// Known vendor IDs for ZealPC keyboards:
const knownVendorIDs = [0xfeed]
// Configure which USB interface and endpoint to use:
let keyboardInterface = 1
let keyboardInEndpoint = 3
let keyboardOutEndpoint = 4

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      currentDevice: null,
      interfaceClaimed: false
    }
    this.allowUSBDevice = this.allowUSBDevice.bind(this)
    this.openDevice = this.openDevice.bind(this)
    this.sendCommand = this.sendCommand.bind(this)
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

      // Control transfer left over from my other WebUSB work...
      //await device.controlTransferOut({
      //  requestType: 'class',
      //  recipient: 'interface',
      //  request: 0x22,
      //  value: 0x01,
      //  index: keyboardInterface
      //})

    }
    catch (err) {
      console.log('Oops:', err)
    }
  }


  async sendCommand() {
    // At some point, send some useful data. The following list of values is from the file keyboards/zeal60/zeal_rpc.h
    // from Zeal's branch of the QMK firmware. These command values are sent as the first byte in the payload to the 
    // USB endpoint for the keyboard.
    //
    // It would be great if the API values were returned by the id_protocol_version "rpc"...
    //
    // enum
    // {
    // 	id_protocol_version = 0x01, // always 0x01
    // 	id_keymap_keycode_load,
    // 	id_keymap_keycode_save,
    // 	id_keymap_default_save,
    // 	id_backlight_config_set_values,
    // 	id_backlight_config_set_alphas_mods,
    // 	id_backlight_set_key_color,
    // 	id_system_get_state,
    // 	id_system_set_state,
    // 	id_unhandled = 0xFF,
    // };
    let device = this.state.currentDevice
    
    // create an ArrayBuffer with a size in bytes
    let buffer = new ArrayBuffer(32) // 32 is the size of RAW_HID_BUFFER_SIZE in zeal60/config.h
    
    // Create a couple of views
    let view1 = new DataView(buffer);
    //let view2 = new DataView(buffer,12,4); //from byte 12 for the next 4 bytes
    view1.setInt8(0, 0x01) // put command into first location of the Buffer
    //console.log(view2.getInt8(0));

    try {
      console.log('Trying to get the keyboards current protocol version via the OUT endpoint...')
      let outResponse = await device.transferOut(keyboardOutEndpoint, buffer)
      console.log('Request sent, WebUSB API said:', outResponse)

      console.log('Requesting the actual ptotocol version which should be ready on the IN endpoint...')
      let inResponse = await device.transferIn(keyboardInEndpoint, 32)
      console.log('Request sent, WebUSB API said:', inResponse)

      // Now parse the version out of the response:
      console.log('Protocol version:', inResponse.data.getInt8(1)) // get the second byte! (0th is command!)

    }
    catch (err) {
      console.error('sendCommand: Failed:', err)
    }

  }

  render() {
    return (
      <div className="App">
        <p className="App-intro">
          ZealMod is a web based configuration tool for the ZealPC mechanical keyboards. It is a work in progress.
          Currently, this site should be able to grab the current Protocol Version from the Zeal60 Keyboard using
          Chrome 65 under Linux.
        </p>
        <p>
          The code and manual unbind instructions can be found here:
          <a href="https://github.com/JamesHagerman/ZealMod">https://github.com/JamesHagerman/ZealMod</a>
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
        <button onClick={this.sendCommand}>Send Command</button>
      </div>
    );
  }
}

export default App;
