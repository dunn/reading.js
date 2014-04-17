"use strict";

var utils = require('./utils.js');

utils.elemNumber = function(elements, element, i) {
    while ( --i ) {
        if (elements[i] === element) {
            return i;
        }
    }
    return undefined;
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

var toggle = {
    // toggleHandler checks what's being toggled, and in turn calls
    // toggleMe or toggleSame:
    handler: function (elements, bear, event) {
        //console.log("toggleHandler commencing");
        //var handlerStart = new Date();

        utils.clearActive(elements, bear, bear.numberOfElements);

        var targetIndex;
        var toggleMode = "single";

        // if toggleHandler was called by a keypress, then whatever
        // function that called toggleHandler has already passed the
        // correct element(s) to the function, so we just extract the
        // index:
        if ( !event.target ) {
            targetIndex = utils.elemNumber(elements, event, bear.numberOfElements);
            //console.log('keypress detected');
        }
        // if something was clicked, we need to figure out what:
        else {
            // if it was the header that was clicked, just return that
            // element:
            if ( utils.isHeaderTag(event.target.tagName) ) {
                //console.log('header clicked');
                targetIndex = utils.elemNumber(elements, event.target, bear.numberOfElements);
            }
            // otherwise, see if it it was the "all" button:
            else {
                //console.log('button clicked');
                targetIndex = utils.elemNumber(elements, event.target.parentElement, bear.numberOfElements);
                if ( event.target.classList.contains("all") ) {
                    //console.log('all button');
                    toggleMode = "batch";
                }
            }
        }
        elements[targetIndex].classList.add("active");
        utils.changeClass.add(bear, targetIndex, "active");

        if ( toggleMode !== "batch" ) {
            //console.log('beginning non-batch mode');
            this.me(elements, bear, targetIndex);
        }
        else {
            //console.log('beginning batch mode');
            this.same(elements, bear, targetIndex);
        }

        // make sure we're scrolled to the active element:

        var theActive = utils.activeIndex(bear);
        //console.log(theActive);
        utils.makeActive(elements, bear, elements[theActive]);

        // end toggleHandler definition

  //      var handlerEnd = new Date();
        //console.log("toggleHandler ending");
        //console.log("toggleHandler time: " + (handlerEnd - handlerStart));
    },

    same: function (elements, bear, b) {
        //console.log("toggleSame commencing");
//        var sameStart = new Date();

        var activeHeaderName = bear[b].tag;
        var activeIsCollapsed = utils.oneOf("collapsed", bear[b].classes) > -1;
        //console.log(activeIsCollapsed);
        var activeNum = activeHeaderName.slice(1);

        // if ( activeIsCollapsed ) {
        //     utils.changeClass.remove(bear, b, "collapsed");
        // }
        // else {
        //     utils.changeClass.add(bear, b, "collapsed");
        // }
        this.me(elements, bear, b);

        // first walk up, toggling all at the same level
        var c = b - 1;
        while ( c &&
                (!utils.isHeaderTag(bear[c].tag) ||
                 (bear[c].tag.slice(1) >= activeNum)) ) {
            var curNum = bear[c].tag.slice(1);
            if ( utils.isHeaderTag(bear[c].tag) && curNum === activeNum ) {
                // following says: if (a) we clicked a header to
                // expand it and the header we've reached in our walk
                // is collapsed; or (b) we clicked a header to
                // collapse and the header we've reached is not
                // collapsed, THEN toggle
                if ( (activeIsCollapsed && (utils.oneOf("collapsed", bear[c].classes) > -1)) ||
                     (!activeIsCollapsed && (utils.oneOf("collapsed", bear[c].classes) < 0)) ) {
                    this.me(elements, bear, c);
                }
            }
            c--;
        }
        // now walk down, toggling all at the same level
        var d = b + 1;
        while ( bear[d] &&
                (!utils.isHeaderTag(bear[d].tag) ||
                 (bear[d].tag.slice(1) >= activeNum)) ) {
            var curNum2 = bear[d].tag.slice(1);
            if ( utils.isHeaderTag(bear[d].tag) && curNum2 === activeNum ) {
                // following says: if (a) we clicked a header to
                // expand it and the header we've reached in our walk
                // is collapsed; or (b) we clicked a header to
                // collapse and the header we've reached is not
                // collapsed, THEN toggle
                if ( (activeIsCollapsed && (utils.oneOf("collapsed", bear[d].classes) > -1)) ||
                     (!activeIsCollapsed && (utils.oneOf("collapsed", bear[d].classes) < 0)) ) {
                    this.me(elements, bear, d);
                }
            }
            d++;
        }
        // end `toggleSame` definition
//        var sameEnd = new Date();
        //console.log("toggleSame ending");
        //console.log("toggleSame time: " + (sameEnd - sameStart));
    },

    me: function (elements, bear, target) {
        //console.log("toggleMe commencing");
//        var meStart = new Date();

        var elementIndex = target;

        // get the number of the header (h1 => 1, h2 => 2, etc)
        var headerNum = bear[elementIndex].tag.slice(1);
        //console.log('toggling a H' + headerNum);

        // this variable holds the next header of greater or equal
        // value; it's used to determine how much stuff gets
        // expanded or collapsed
        var stop = utils.compareHeaders(bear, elementIndex, headerNum);

        ///////////////////////////////////////////
        // IF THE HEADER IS COLLAPSED, WE EXPAND //
        ///////////////////////////////////////////
        var index = utils.oneOf("collapsed", bear[elementIndex].classes);
//        console.log(elements[elementIndex]);
        if ( index > -1 ) {
            utils.toggleCollapse(elements[elementIndex]);
            utils.changeClass.remove(bear, elementIndex, "collapsed");
            //console.log(bear[elementIndex].classes);
            //console.log('expanding mode go');
            //console.log(bear[elementIndex].classes);
            // starting a new counter to go through the elements
            // array and figure out what needs to be unhidden and
            // what headers need to lose the "collapsed" class:
            var r = elementIndex + 1;
            while ( r !== stop && r < bear.numberOfElements ) {
                // if the first element we come across is not a
                // header element, then unhide it and increment
                // the new counter:
                if ( !utils.isHeaderTag(bear[r].tag) ) {
                    utils.changeClass.remove(bear, r, "hidden");
                    // bear[r].classes.splice(index,1);
                    elements[r].classList.remove("hidden");
                    r++;
                }
                else {
                    // if the element IS a header, then, if it
                    // DOESN'T have the "collapsed" class, unhide
                    // it and increment the counter:
                    if ( (utils.oneOf("collapsed", bear[r].classes) < 0) ) {
                        utils.changeClass.remove(bear, r, "hidden");
                        //bear[r].classes.splice(index,1);
                        elements[r].classList.remove("hidden");
                        r++;
                    }
                    // if the header IS "collapsed", then unhide
                    // it BUT skip everything past it (until we
                    // get to another header):
                    else {
                        var rTagNum = bear[r].tag.slice(1);
                        var rStop = utils.compareHeaders(bear, r, rTagNum);
                        elements[r].classList.remove("hidden");
                        utils.changeClass.remove(bear, r, "hidden");
                        //bear[r].classes.splice(index,1);
                        while ( r !== rStop && r < bear.numberOfElements ) {
                            r++;
                        }
                    }
                }
            }
        }
        ////////////////////////////////////////////////////////
        // IF THE ACTIVE HEADER IS NOT COLLAPSED, COLLAPSE IT //
        // AND ITS "CHILDREN":                                //
        ////////////////////////////////////////////////////////
        else {
            utils.toggleCollapse(elements[elementIndex]);
//            console.log('collapsing mode go');
            utils.changeClass.add(bear, elementIndex, "collapsed");
  //          console.log(bear[elementIndex].classes);
            var h = elementIndex + 1;
            while ( h !== stop && h < bear.numberOfElements ) {
                elements[h].classList.add("hidden");
                utils.changeClass.add(bear, h, "hidden");
                // //console.log(bear[h].classes);
                h++;
            }
        }

        // end `toggleMe` definition
//        var meEnd = new Date();
        //console.log("toggleMe ending");
        //console.log("toggleMe() time: " + (meEnd - meStart));
    }
};

module.exports = toggle;
