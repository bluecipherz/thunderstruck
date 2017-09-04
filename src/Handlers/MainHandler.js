/**
 * Created by intellicar-rinas on 5/9/17.
 */
import {eventNames} from '../Constants/Constants';


class MainHandler {

    constructor() {

        let listener = {};
        let state = {};

        /*
         *
         *   Public Methods
         *
         * */

        this.dispatch = (event) => {
            callListeners(event)
        };

        this.subscribe = (key, method) => {
            if (key in eventNames) {
                if (!(key in listener)) {
                    listener[key] = [];
                }

                listener[key].push(method);
            }
        };

        this.getState = () => {
            return state;
        };

        /*
         *
         *   Private Methods
         *
         * */

        const callListeners = (event) => {
            if(event.type in listener){
                for(let idx in listener[event.type]){
                    listener[event.type][idx](state, event);
                }
            }
        }
    }

}

const handler = new MainHandler();

export default handler;