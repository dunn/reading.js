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
    var i = ref.numberOfElements;
    while ( --i > -1 ) {
        console.log(i);
        if ( this.oneOf("active", ref[i].classes) > -1 ) {
            console.log('found an active element: ' + ref[i].tag);
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
        var currentActive = this.activeIndex(bear);
        if ( currentActive ) {
            this.changeClass.remove(bear, currentActive, "active");
            this.clearActive(elements, bear, bear.numberOfElements);
        }

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

utils.clearActive = function(array, ref, i) {
    var index;
    while ( --i > -1 ) {
        index = this.oneOf("active", ref[i].classes);
        console.log(index);
        if ( index > -1 ) {
            //console.log('found active elements:');
            //console.log(ref[i].tag);
            //console.log("removing active state from:");
            //console.log(elements[i]);
            array[i].classList.remove("active");
            this.changeClass.remove(ref, i, "active");
        }
    }
};

utils.changeClass = {
    add: function(bear, i, classname) {
        if ( utils.oneOf(classname, bear[i].classes) < 0) {
            bear[i].classes.push(classname);
            //console.log(bear[i] + ' now has ' + bear[i].classes);
        }
    },
    remove: function(bear, i, classname) {
        var index = utils.oneOf(classname, bear[i].classes);
        if ( index > -1 ) {
            bear[i].classes.splice(index,1);
            //console.log(bear[i] + ' now has ' + bear[i].classes);
        }
    }
};

module.exports = utils;
