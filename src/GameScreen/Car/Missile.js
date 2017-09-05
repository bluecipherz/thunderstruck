/**
 * Created by intellicar-rinas on 5/9/17.
 */
import $ from 'jquery';
import _ from 'lodash';

const Missile = function (carState, playgroundID, getCars, carId) {
    let m = this;
    m.id = Math.random()+"_m";

    let speed = 0;
    let acceleration = 1;
    let maxSpeed = 30;
    let screenW = $(window).width()
    let screenH = $(window).height()
    let state = _.cloneDeep(carState);
    let cars = null;


    const createMissileDOM = () => {
        state.pos = getCars()[carId].getBounds()[0];
        m.dom = $('<div class="Missile">');
        $(playgroundID).append(m.dom);
    };

    const amIOut = () => {
        return !inside(state.pos,{l:0, t:0, r:screenW, b:screenH});
    };

    const inside = (m,t) => {
        return m.x > t.l && m.y > t.t && m.x < t.r && m.y < t.b
    };

    let coords;
    const insidePoly = (point, poly) => {
        coords = [];
        for(let idx in poly){
            coords.push([poly[idx].x, poly[idx].y]);
        }

        return isInside([point.x, point.y], coords);
    };

    function isInside(point, vs) {

        let x = point[0], y = point[1];

        let inside = false;
        for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
            let xi = vs[i][0], yi = vs[i][1];
            let xj = vs[j][0], yj = vs[j][1];

            let intersect = ((yi > y) !== (yj > y))
                && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
            if (intersect) inside = !inside;
        }

        return inside;
    };


    const amIHit = () => {
        if(getCars){
            cars = getCars();
            for(let idx in cars){
                if(cars[idx].id === carId)
                    continue;

                if(insidePoly(state.pos, cars[idx].getBounds())){
                    cars[idx].hit();
                    return true;
                }
            }
        }
    };

    const destroy = () => {
        m.dom.remove();
    };

    m.update = () => {

        if(speed < maxSpeed){
            speed+=acceleration;
        }

        state.pos.y -= speed * Math.cos(state.angle * (Math.PI / 180));
        state.pos.x += speed * Math.sin(state.angle * (Math.PI / 180));

        m.dom.css({
            left:state.pos.x,
            top:state.pos.y,
            transform:'rotate('+state.angle+'deg)'
        });

        if(amIOut() || amIHit()){
            destroy();
            return false;
        }

        return true;
    };

    m.init = () => {
        createMissileDOM();
    };

    m.init();
};

export default Missile;