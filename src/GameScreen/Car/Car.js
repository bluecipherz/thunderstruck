/**
 * Created by intellicar-rinas on 5/9/17.
 */
import React, {Component} from 'react';
import './Car.css';
import {FPS} from '../../Constants/Constants';
import _ from 'lodash';
import $ from 'jquery';
import Missile from './Missile';

class Car extends Component{


    constructor(props){
        super(props);
        const {sync} = props;
        this.id = Math.random() + "_car";
        let left = false;
        let right = false;
        let up = false;
        let down = false;
        let tempState = null;
        let speed = 0;
        let state = {
            w1:{r:0},
            w2:{r:0},
            pos:{x:props.x || 500,y: props.y || 500},
            angle:props.angle || 1,
            health:100,
        };
        let missiles = {};
        let playgroundID = '#playground';
        let missileTimer = false;

        let carW = 25;
        let carH = 50;

        /*
        *   Conf
        * */

        let steering = 5;
        let maxSteerRot = 38;
        let automaticSteerReset = true;
        let acceleration = 0.5;
        let maxSpeed = 10;
        let deceleration = 0.1;

        const Left = (state) => {
            left = state;
        };

        const Right = (state) => {
            right = state;
        };

        const Up = (state) => {
            up = state;
        };

        const Down = (state) => {
            down = state;
        };

        const keyW = () => {
            fireMissile();
        };

        const init = () => {
            if(sync){
                sync("LEFT", Left, this.id);
                sync("RIGHT", Right, this.id);
                sync("UP", Up, this.id);
                sync("DOWN", Down, this.id);
                sync("W", keyW, this.id);
            }

            if(props.reg){
                props.reg(this);
            }

            Engine(true);
        };

        const fireMissile = () => {
            if(!missileTimer){
                missileTimer = true;
                let m = new Missile(state, playgroundID, props.getCars, this.id);
                missiles[m.id] = m;
                setTimeout(()=>{
                    missileTimer = false;
                }, 500)
            }
        };


        const updateMissiles = () => {
            for(let idx in missiles){
                if(!missiles[idx].update()){
                    delete missiles[idx];
                }
            }
        };


        const Engine = (action) => {

            /*Start*/
            if(action && !this.engine){
                this.engine = setInterval(()=>{
                    run();
                }, 1000 / FPS)

                /*Stop*/
            }else if(!action && this.engine){
                clearTimeout(this.engine);
            }

            /*
             *   Loop
             * */

            const run = () => {

                if(left){
                    if(state.w1.r > -maxSteerRot){
                        state.w1.r -= steering;
                        state.w2.r -= steering;
                    }

                }else if(right){
                    if(state.w1.r < maxSteerRot){
                        state.w1.r += steering;
                        state.w2.r += steering;
                    }

                }else if(state.w1.r !== 0 && automaticSteerReset){
                    if(state.w1.r > 0){
                        state.w1.r -= steering/15 * speed;
                        state.w2.r -= steering/15 * speed;
                    }else{
                        state.w1.r += steering/15 * speed;
                        state.w2.r += steering/15 * speed;
                    }

                    if(Math.abs(state.w1.r) < steering){
                        state.w1.r = 0;
                        state.w2.r = 0;
                    }
                }

                if(up){
                    if(speed < maxSpeed){
                        speed += acceleration
                    }
                }else if(down){
                    if(speed > -(maxSpeed/2)){
                        if(speed > 0){
                            speed -= acceleration;
                        }else {
                            speed -= acceleration
                        }
                    }
                }else{
                    if(speed > 0){
                        speed -= deceleration;
                    }else{
                        speed += deceleration;
                    }

                    if(Math.abs(speed) <= deceleration){
                        speed = 0;
                    }
                }

                state.angle += (Math.min(speed, 10) * state.w1.r / 40);
                state.pos.y -= speed * Math.cos(state.angle * (Math.PI / 180));
                state.pos.x += speed * Math.sin(state.angle * (Math.PI / 180));


                if(propsChanged()){
                    tempState = _.cloneDeep(state);

                    $(this.refs.w1).css({transform:'rotate('+state.w1.r+'deg)'});
                    $(this.refs.w2).css({transform:'rotate('+state.w2.r+'deg)'});
                    $(this.refs.car).css({
                        left:state.pos.x,
                        top:state.pos.y,
                    });
                    $(this.refs.car).find(".Car").css({transform:'rotate('+state.angle+'deg)'});
                    $(this.refs.health).css({width:state.health+'%'});

                }
                updateMissiles();
            }
        };

        const propsChanged = () => {
            if (!tempState)
                return true;

            if(tempState.w1.r !== state.w1.r || tempState.w2.r !== state.w2.r ||
                tempState.pos.x !== state.pos.x || tempState.pos.y !== state.pos.y ||
                tempState.angle !== state.angle || tempState.health !== state.health)
                return true;

        };

        init();

        this.getPosition = () => {
            return {
                l:state.pos.x,
                t:state.pos.y,
                r:state.pos.x+carW,
                b:state.pos.y+carH,
            }
        };

        this.hit = () => {
          state.health -= 30;
        }

    }


    render(){
        return(
            <div className="CarOuter" ref="car">
                <div className="carHealth">
                    <div className="ch-bar" ref="health"></div>
                </div>
                <div className="Car">
                    <div className="wheel wheel1" ref="w1"></div>
                    <div className="wheel wheel2" ref="w2"></div>
                    <div className="wheel wheel3"></div>
                    <div className="wheel wheel4"></div>
                </div>
            </div>
        )
    }

}

export default Car;