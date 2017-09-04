/**
 * Created by intellicar-rinas on 5/9/17.
 */
import {Component} from 'react';
import {eventNames} from '../Constants/Constants';

class KeyboardTrigger extends Component{

    constructor(props){
        super(props);

        const {handler} = props;

        document.addEventListener('keydown', (e)=>{
            handler.dispatch({
                type:eventNames.KEYDOWN,
                data:e
            })
        });

        document.addEventListener('keyup', (e)=>{
            handler.dispatch({
                type:eventNames.KEYUP,
                data:e
            })
        });

    }

    render(){
        return null;
    }

}

export default KeyboardTrigger;