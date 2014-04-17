"use strict";

var utils = {};

utils.isHeaderTag = function(tag) {
    var t = tag;
    return ( t === "H1" || t === "H2" || t === "H3" || t === "H4" || t === "H5" || t === "H6" );
};

utils.oneOf = function(thing, array) {
    for ( var i = 0; i < array.length; i++ ) {
        if ( thing === array[i] ) {
            return i;
        }
    }
    return -1;
};

// what is the last element that has `class="active"`?
utils.activeIndex = function(ref) {
//    console.log(ref);
    var i = ref.numberOfElements;
    while ( --i ) {
        if ( this.oneOf("active", ref[i].classes) > -1 ) {
            //console.log(ref[i].classes);
            //console.log('found an active element: ' + ref[i].tag);
            //console.log(elements[i]);
            return i;
        }
    }
};

utils.makeActive = function(elements, bear, me) {
    //console.log("makective running: ");
    //console.log(me);
    //console.log(bear.numberOfElements);
    var meep = this.elemNumber(elements, me, bear.numberOfElements);
    if ( me ) {
        this.clearActive(elements, bear, bear.numberOfElements);
        me.classList.add("active");
        this.changeClass.add(bear, meep, "active");
        var id = me.getAttribute("id");
        //console.log(id);
        if ( id !== null ) {
            var url = window.location.toString();
            var urlPound = url.indexOf("#");
            if ( urlPound > -1 ) {
                url = url.slice(0, urlPound);
            }
            window.location.replace(url + "#" + id);
        }
        me.scrollIntoView();
    }
};

module.exports = utils;
