/**
 * Created by intellicar-rinas on 5/9/17.
 */
import React, {Component} from 'react';
import './PlayGround.css';
import {eventNames, FPS} from '../../Constants/Constants';
import Car from '../Car/Car';

class PlayGround extends Component{

    constructor(props){
        super(props);
        const {handler} = props;
        let cars = {};
        let bots = {};
        let player = {};

        const keyDownHandler = (state, event) => {
            controller(player, true, event.data.keyCode);
        };

        const keyUpHandler = (state, event) => {
            controller(player, false, event.data.keyCode);
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

        const initBots = () => {
            // let keys = [37,38,39,40];
            let keys = [38,38,38,38,87];
            setInterval(()=>{
                let target = cars[Object.keys(cars)[0]];
                for(let idx in bots){
                    let keyId = parseInt(Math.random() * 5, 10);
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

        const init = () => {
            handler.subscribe(eventNames.KEYDOWN, keyDownHandler);
            handler.subscribe(eventNames.KEYUP, keyUpHandler);
            initBots();
            // Engine(true);
        };


        /*
        *   Engine
        * */

        const Engine = (action) => {

            /*Start*/
            if(action && !this.engine){
                this.engine = setInterval(()=>{
                    run();
                }, 200 / FPS)

            /*Stop*/
            }else if(!action && this.engine){
                clearTimeout(this.engine);
            }

            /*
            *   Loop
            * */

            const run = () => {

            }
        };

        init();

        /*
        *
        *   Public methods
        *
        * */

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
        }
    }

    render(){
        return(
            <div className="PlayGround" id="playground">
                <Car sync={this.playerSync} getCars={this.getCars} reg={this.regCar} player={true}/>
                <Car sync={this.botSync} getCars={this.getCars}  reg={this.regCar} x={500} y={200} angle={180}/>
                <Car sync={this.botSync} getCars={this.getCars}  reg={this.regCar} x={300} y={400} angle={180}/>
                <Car sync={this.botSync} getCars={this.getCars}  reg={this.regCar} x={800} y={300} angle={180}/>
            </div>
        )
    }

}

export default PlayGround;