import React, { Component } from 'react';
import PlayGround from './GameScreen/PlayGround/PlayGround';
import MainHandler from './Handlers/MainHandler';
import KeyboardTrigger from './Triggers/KeyboardTrigger';

class App extends Component {
  render() {
    return (
        <div className="App">
            <PlayGround handler={MainHandler}/>
            <KeyboardTrigger handler={MainHandler}/>
        </div>
    )
  }
}

export default App;
