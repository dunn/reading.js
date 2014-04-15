"use strict";

var utils = {};

utils.elemNumber = function(elements, element, i) {
    while ( --i ) {
        if (elements[i] === element) {
            return i;
        }
    }
    return undefined;
};

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

// this function finds the active header, then returns the next header
// that's at the same level or higher (i.e., if the active header is
// h3, it will return the next h3, h2, or h1---whichever comes first):
utils.compareHeaders = function(bear, start, headerNum) {
//        var compStart = new Date();
    var compEnd;

    while ( start++ < bear.numberOfElements ) {
        // look at each header after the targetHeader; stop and return
        // that header if it's the same size or bigger than the
        // targetHeader.  Using '<' not '>' because smaller is bigger
        // (h1 < h6):
        if ( bear[start] &&
             this.isHeaderTag(bear[start].tag) &&
             (bear[start].tag.slice(1) <= headerNum) ) {
            // return the match number
            return start;
        }
    }
    // if we reach this point it means we've hit the end of the document
    return bear.numberOfElements;

    // end `compareHeaders` definition
};

utils.toggleCollapse = function(where) {
    where.classList.toggle("collapsed");
};

utils.changeClass = {
    add: function(bear, i, classname) {
        if ( utils.oneOf(classname, bear[i].classes) < 0) {
            bear[i].classes.push(classname);
            //                console.log(bear[i] + ' now has ' + bear[i].classes);
        }
    },
    remove: function(bear, i, classname) {
        var index = utils.oneOf(classname, bear[i].classes);
        if ( index > -1 ) {
            bear[i].classes.splice(index,1);
//                console.log(bear[i] + ' now has ' + bear[i].classes);
        }
    }
};


// what is the last element that has `class="active"`?
utils.activeIndex = function(ref) {
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

/////////////////////////////
// ACTIVE/SCROLL FUNCTIONS //
/////////////////////////////

utils.indexRelativeToActive = {
    scrollSkip: [ "DIV", "HEADER", "HR" ],
    down: function(bear, num) {
        var i = utils.activeIndex(bear);
            i = i + num;
            while ( bear[i] &&
                    ( (utils.oneOf(bear[i].tag, this.scrollSkip) > -1) ||
                      (utils.oneOf("hidden", bear[i].classes) > -1) ) ) {
                i++;
            }
            return ( (i < bear.numberOfElements) ? i : utils.activeIndex(bear));
        },
    up: function(bear, num) {
        var i = utils.activeIndex(bear);
        i = i - num;
        while ( bear[i] &&
                ( (utils.oneOf(bear[i].tag, this.scrollSkip) > -1) ||
                  (utils.oneOf("hidden", bear[i].classes) > -1) ) ) {
            i--;
        }
        // i > 0 so we can't go up beyond the first header:
        return ( i > 0 ? i : utils.activeIndex(bear));
    }
};

utils.headerOneLevelUp = function(bear, direction) {
    var down = direction === "down";
    var k = this.activeIndex(bear);
    for ( var v = (down ? (k+1) : (k-1)); (down ? v < bear.numberOfElements: v >= 0); (down ? v++ : v--) ) {
        if ( this.isHeaderTag(bear[v].tag) ) {
            if ( (bear[k].tag.slice(1) > bear[v].tag.slice(1)) ||
                 !this.isHeaderTag(bear[k].tag) ) {
                return v;
            }
        }
        break;
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

utils.clearActive = function(array, ref, i) {
    var index;
    while ( --i ) {
        index = this.oneOf("active", ref[i].classes);
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

module.exports = utils;
