import React, { Component } from 'react';
//import logo from './logo.svg';
//import './App.css';

class App extends Component {
  render() {
    return (
      <div className="App">
        <p className="App-intro">
          ZealMod is a web based configuration tool for the ZealPC mechanical keyboards. It is a work in progress...
        </p>
        <p>
          The goal of this project is to use WebUSB to send new keymaps to the keyboard via raw HID messages.
        </p>
      </div>
    );
  }
}

export default App;
