/**
 * Created by intellicar-rinas on 5/9/17.
 */
import React, {Component} from 'react';
import './PlayGround.css';
import {eventNames} from '../../Constants/Constants';
import Car from '../Car/Car';
import {loadMap} from '../Map/Map';
import io from 'socket.io-client';

const mqttHost = 'http://13.228.24.181:3400';
const mqttEvents = {
    "STATE_UPDATE":0,
    "KEY_EVENT":1,
    "COLLISION":2,
};

class PlayGround extends Component{

    constructor(props){
        super(props);
        const {handler} = props;
        let cars = {};
        let bots = {};
        let webPlayers = {};
        let player = {};

        const keyDownHandler = (state, event) => {
            processKeyEvent(player, true, event.data.keyCode);
        };

        const keyUpHandler = (state, event) => {
            processKeyEvent(player, false, event.data.keyCode);
        };

        const processKeyEvent = (car, state, keyCode) => {
            controller(car, state, keyCode);
            if(this.state.game){
                sendEvent(car, state, keyCode)
            }
        };

        const controller = (car, state, keyCode) =>{
            if(keyCode === 37 && "LEFT" in car){
                car.LEFT(state);
            }else if(keyCode === 38 && "UP" in car){
                car.UP(state);
            }else if(keyCode === 39 && "RIGHT" in car){
                car.RIGHT(state);
            }else if(keyCode === 40 && "DOWN" in car){
                car.DOWN(state);
            }else if(keyCode === 87 && "W" in car){
                car.W(state);
            }
        };


        const sendEvent = (car, state, keyCode) => {
            if(this.socket){
                this.socket.emit("msg",{
                    u:this.state.auth.username,
                    s:state,
                    k:keyCode,
                    t:mqttEvents.KEY_EVENT,
                })
            }
        };


        const initBots = () => {
            // let keys = [37,38,39,40];
            let keys = [38,38,38,38,38,38,38,38,38,87];
            setInterval(()=>{
                let target = cars[Object.keys(cars)[0]];
                for(let idx in bots){
                    let keyId = parseInt(Math.random() * 10, 10);
                    for(let jdx in keys){
                        if(parseInt(jdx, 10) === keyId){
                            controller(bots[idx], true, keys[jdx]);
                            setTimeout(()=>{
                                controller(bots[idx], false, keys[jdx]);
                            }, 500)
                        }
                    }
                    if(target && cars[idx]){
                        let c = cars[idx].getCenter();
                        let d = target.getAngleDiff(c.x, c.y, cars[idx].getCarAngle());
                        if(d>10){
                            controller(bots[idx], true, 39);
                            setTimeout(()=>{
                                controller(bots[idx], false, 39);
                            }, 100)
                        }else if(d < -10){
                            controller(bots[idx], true, 37);
                            setTimeout(()=>{
                                controller(bots[idx], false, 37);
                            }, 100)
                        }
                    }
                }
            },200);
        };


        const onMqttMsg = (msg) => {
            if(msg.t===mqttEvents.STATE_UPDATE){
                webPlayers[msg.u].SET(msg.st);
            }else if(msg.t===mqttEvents.KEY_EVENT){
                controller(webPlayers[msg.u], msg.s, msg.k);
            }else if(msg.t===mqttEvents.COLLISION){
                if(webPlayers[msg.u])
                    webPlayers[msg.u].SET_CI(msg);
            }
        };


        const onMqttAuthSuccess = (userid) => {
            this.setState({auth:{username:userid}});
        };

        const onHostListUpdated = (msg) => {
            this.setState({hosts:msg});
        };

        const onGameStarted = () => {
            initBots();
            initSyncLoop();
            this.setState({game:true})
        };


        const initSyncLoop = () => {
            setInterval(()=>{
                player.GET(carState=>{
                    this.socket.emit("msg",{
                        u:this.state.auth.username,
                        t:mqttEvents.STATE_UPDATE,
                        st:carState
                    })
                },250);
            });
        };


        const initMQTT = () => {
            this.socket = io.connect(mqttHost);
            if(this.socket){
                this.socket.on('msg', onMqttMsg);
                this.socket.on('authSuccess', onMqttAuthSuccess);
                this.socket.on('hostlistupdated', onHostListUpdated);
                this.socket.on('gamestarted', onGameStarted);
            }
        };

        const init = () => {
            handler.subscribe(eventNames.KEYDOWN, keyDownHandler);
            handler.subscribe(eventNames.KEYUP, keyUpHandler);
            initMQTT();
            this.state = {
                auth:false,
                hosts:[]
            }
            // Engine(true);
        };

        init();

        /*
        *
        *   Public methods
        *
        * */

        this.loadMap = () => {
            return loadMap();
        };

        this.getCars = () => {
            return cars;
        };

        this.regCar = (car) => {
            cars[car.id] = car;
        };

        this.playerSync = (key, method) => {
            player[key] = method;
        };

        this.botSync = (key, method, id) => {
            if(!(id in bots)){
                bots[id] = {};
            }
            bots[id][key] = method;
        };


        this.webSync = (key, method, id) => {
            if(!(id in webPlayers)){
                webPlayers[id] = {};
            }
            webPlayers[id][key] = method;
        };


        this.login = () => {
            let username = this.refs.username.value;
            if(username && username.length > 3){
                if(this.socket){
                    this.socket.emit("auth", {
                        username:username,
                        meta:{}
                    });
                }
            }
        };

        this.startGame = () => {
            if(this.socket){
                this.socket.emit("startgame");
            }
        };

        this.onCollied = (crashInertia) => {
            this.socket.emit("msg",{
                t:mqttEvents.COLLISION,
                s:crashInertia.speed,
                a:crashInertia.angle,
                u:crashInertia.u
            })
        };

        this.loadPlayers = () => {
            return this.state.hosts.map((host, index) => {
                if(host === this.state.auth.username){
                    return <Car uid={host} key={index} sync={this.playerSync} getCars={this.getCars} reg={this.regCar} onCollied={this.onCollied} player={true}/>
                }else{
                    return <Car uid={host} key={index} sync={this.webSync} getCars={this.getCars}  onCollied={this.onCollied}  reg={this.regCar}/>
                }
            });
        }

    }

    render(){
        return(
            !this.state.auth && !this.state.game ? (
                <div className="AuthScreen">
                    <input ref="username" placeholder="Username"/>
                    <div className="as-button" onClick={this.login}>Join</div>
                </div>
            ):(
                <div>
                    {!this.state.game ? (
                        <div className="GameScreen">
                            {
                                this.state.hosts.map((host, index)=>{
                                    return <div className="host" key={index}>{host}</div>
                                })
                            }
                            {
                                this.state.hosts.length > 1 ? (
                                    <div className="as-button" onClick={this.startGame}>Start Game</div>
                                ) : null
                            }
                        </div>
                    ):(
                        <div className="PlayGround" id="playground">
                            {this.loadMap()}
                            {this.loadPlayers()}
                        </div>
                    )}
                </div>
            )
        )
    }

}

export default PlayGround;