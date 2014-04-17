(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
// make a skeletal map of the direct children of <body>
var build = function() {
    //        var getStart = new Date();

    var source = document.body.children;
    var sourceLen = document.body.childElementCount;

    var bear = {numberOfElements: sourceLen};

    while ( sourceLen-- ) {
        bear[sourceLen] = {};
        var tempBear = bear[sourceLen];

        tempBear.tag = source[sourceLen].tagName;
        tempBear.classes = source[sourceLen].classList.toString().split(' ');
    }
    //        var getEnd = new Date();

    // end `buildABear` definition
    //console.log('bear build with: ' + bear.numberOfElements + ' elements');
    return bear;
};

module.exports = build;

},{}],2:[function(require,module,exports){
"use strict";

var build = require('./bear.js');
var utils = require('./utils.js');
var toggle = require('./toggle.js');

// three CSS themes we can switch between
var themes = ["high", "light", "dark"];

// keyCode/charCode variables
var keys = {
    next: 106,
    prev: 107,
    nextUp: 111,
    prevUp: 105,
    first: 117,
    last: 109,
    all: 97,
    expand: 102,
    theme: 115
};

/// add event listener:
// https://developer.mozilla.org/en-US/docs/DOM/element.addEventListener
// http://stackoverflow.com/a/1841941/1431858
/// only `type` argument is quoted (i.e.: window, "load", function())
function addListener(element, type, response) {
    if (element.addEventListener) {
        element.addEventListener(type, response, false);
    }
    else if (element.attachEvent) {
        element.attachEvent("on" + type, response);
    }
}

var listeners = function(elements, bear) {
    addListener(window, "load", function() {
        // do this stuff when the `window.load` event fires:

        // unicode symbols for button icons
        var iconThis = "←";
        var iconAll = "↕";

        var headerLinks = " <button class='this' title='Collapse this section'>" + iconThis + "</button> <button class='all' title='Collapse all sections at this level'>" + iconAll + "</button>";

        // default to the first theme
        document.documentElement.classList.add(themes[0]);

        var elements = document.body.children;

        var bear = build();

        // append some cute buttons:
        var pointer = bear.numberOfElements - 1;
        // var bearPoint = bear[pointer];
        while ( pointer ) {
            if ( utils.isHeaderTag(bear[pointer].tag) ) {
                elements[pointer].innerHTML += headerLinks;
                // and add an event listener:

                // we have to set elements[pointer] to a variable in
                // order to pass it to the listener function
                var listen = elements[pointer];
                addListener(elements[pointer], "click", function(listen) {
                    //console.log(elements[pointer]);
                    toggle.handler(elements, bear, listen);
                });
            }
            pointer--;
            // bear[pointer] = bear[pointer];
        }

        // make the first header active, but don't scroll to it:
        pointer = 0;
        // bear[pointer] = bear[pointer];
        while ( (pointer < bear.numberOfElements) && (bear[pointer].tag !== ("H1" || "H2" || "H3" || "H4" || "H5" || "H6") ) ) {
            pointer++;
            // bear[pointer] = bear[pointer];
        }
        elements[pointer].classList.add("active");

        // make the first header the target of the "skip to content link"
        // in the infobox.  if it doesn't already have an id, give it one:
        var firstHId = elements[pointer].getAttribute("id");
        var startId;
        if ( firstHId === null ) {
            elements[pointer].setAttribute("id", "startOfContent");
            startId = "startOfContent";
        }
        else {
            startId = firstHId;
        }

        // If the page loads with an #id that points to a header, scroll
        // to that header when the page loads:
        var url = window.location.toString();
        // check if the url has an #id suffix:
        var urlPound = url.indexOf("#");
        if ( urlPound !== -1 ) {
            var urlId = url.slice(urlPound + 1);
            // after getting the id, remove it from the global url var:
            url = url.slice(0, urlPound);
            // find the element with the id from the url
            var startAt = document.getElementById(urlId);
            // if it's a header, make it active upon loading,
            // but check if getElementById worked also:
            if ( startAt && utils.isHeaderTag(startAt.tagName) ) {
                utils.makeActive(elements, bear, startAt);
            }
        }
        // now add the infobox at the top:
        var helpBoxText = "<p><a href=\"#" + startId + "\" title=\"Skip to content\">Skip to content</a></p><aside><h3>Keyboard shortcuts</h3><ul><li><span class=\"key\">" + String.fromCharCode(keys.next) + " / " + String.fromCharCode(keys.prev) + "</span> next/previous</li><li><span class=\"key\">enter</span> toggle active header</li><li><span class=\"key\">" + String.fromCharCode(keys.nextUp) + " / " + String.fromCharCode(keys.prevUp) + "</span> next/previous header (one level up)</li><li><span class=\"key\">" + String.fromCharCode(keys.first) + " / " + String.fromCharCode(keys.last) + "</span> start/end of document</li><li><span class=\"key\">" + String.fromCharCode(keys.all) + "</span> toggle everything in this section</li><li><span class=\"key\">" + String.fromCharCode(keys.expand) + "</span> expand everything (do this before you search)</li><li><span class=\"key\">" + String.fromCharCode(keys.theme) + "</span> change theme</li></ul></aside>";

        // find the first element after <body>:
        var firstElement = document.body.children[0];
        // then make a new div
        var helpDiv = document.createElement("div");
        // and give it a class (if you change the class name, make sure to
        // change it in _screen.scss)
        helpDiv.classList.add("js-infobox");
        // and shove it into the top of the page
        document.body.insertBefore(helpDiv, firstElement);
        // and give it some content:
        helpDiv.innerHTML=helpBoxText;

        // repopulate the elements array
        elements = document.body.children;

        // rebuild the bear
        bear = build();

        // end window.load event listener
    });

    //////////////
    // KEYPRESS //
    //////////////

    addListener(window, "keypress", function(key) {
        // do this stuff when a key is pressed:

        // http://stackoverflow.com/a/5420482
        key = key || window.event;
        var theKey = key.which || key.keyCode;

        var scrollSkip = [ "DIV", "HEADER", "HR" ];

        var indexRelativeToActive = {
            scrollSkip: [ "DIV", "HEADER", "HR" ],
            down: function(bear, num) {
                var i = utils.activeIndex(bear);
                i = i + num;
                while ( bear[i] &&
                        ( (utils.oneOf(bear[i].tag, scrollSkip) > -1) ||
                          (utils.oneOf("hidden", bear[i].classes) > -1) ) ) {
                    i++;
                }
                return ( (i < bear.numberOfElements) ? i : utils.activeIndex(bear));
            },
            up: function(bear, num) {
                var i = utils.activeIndex(bear);
                i = i - num;
                while ( bear[i] &&
                        ( (utils.oneOf(bear[i].tag, scrollSkip) > -1) ||
                          (utils.oneOf("hidden", bear[i].classes) > -1) ) ) {
                    i--;
                }
                // i > 0 so we can't go up beyond the first header:
                return ( i > 0 ? i : utils.activeIndex(bear));
            }
        };

        var headerOneLevelUp = function(bear, direction) {
            var down = direction === "down";
            var k = utils.activeIndex(bear);
            for ( var v = (down ? (k+1) : (k-1)); (down ? v < bear.numberOfElements: v >= 0); (down ? v++ : v--) ) {
                if ( utils.isHeaderTag(bear[v].tag) ) {
                    if ( (bear[k].tag.slice(1) > bear[v].tag.slice(1)) ||
                         !utils.isHeaderTag(bear[k].tag) ) {
                        return v;
                    }
                }
                break;
            }
        };

        switch (theKey) {
            // if they hit return/enter, toggle the active section:
        case 13 :
            toggle.handler(elements, bear, elements[utils.activeIndex(bear)] );
            break;
            // if they press "a", collapse all headers at the same level
            // as the active header:
        case keys.all :
            var active = utils.activeIndex(bear);
            if ( utils.isHeaderTag(bear[active].tag) ) {
                toggle.same(elements, bear, active);
            }
            break;
            // if they pressed 'j' then move down one:
        case keys.next :
            utils.makeActive(elements, bear, elements[indexRelativeToActive.down(bear, 1)]);
            break;
            // if they press 'k' go up:
        case keys.prev :
            utils.makeActive(elements, bear, elements[indexRelativeToActive.up(bear, 1)]);
            break;
            // if they press "u", go to the first visible element:
        case keys.first :
            var y = 1;
            while ( y++ < bear.numberOfElements ) {
                if ( utils.oneOf(bear[y-2].tag, scrollSkip) === -1 ) {
                    utils.makeActive(elements, bear, elements[y-2]);
                    break;
                }
            }
            break;
            // if they press "m" go to the last visible element:
        case keys.last :
            var z = bear.numberOfElements;
            while ( --z ) {
                if ( utils.oneOf(bear[z].tag, scrollSkip) === -1 ) {
                    utils.makeActive(elements, bear, elements[z]);
                    break;
                }
            }
            break;
            // if they press "i", go to the previous header that's a level up:
        case keys.prevUp :
            utils.makeActive(elements, bear, elements[headerOneLevelUp(bear, "up")]);
            break;
            // if they press "o" go to the next header that's a level up:
        case keys.nextUp :
            utils.makeActive(elements, bear, elements[headerOneLevelUp(bear, "down")]);
            break;
            // if they press "f", expand everything
            // (this is a useful feature I guess, but it also has to be
            // activated before the user tries to search; hence being bound to
            // "f".  This is more a work-around than an actual solution,
            // obvs):
        case keys.expand :
            var index = 0;
            var anything;
            while ( index < bear.numberOfElements ) {
                if ( utils.oneOf("collapsed", bear[index].classes) > -1 ) {
                    toggle.me(elements, bear, index);
                }
                index++;
            }
            break;
            // press "s" to change the theme
        case keys.theme :
            var html = document.documentElement.classList;
            for ( var i = 0; i < themes.length; i++ ) {
                // if we've reached the active theme,
                if ( html.contains(themes[i]) ) {
                    // then turn it off,
                    html.toggle(themes[i]);
                    // if we're NOT at the penultimate theme,
                    if ( i < themes.length - 1 ) {
                        // then turn on the next theme
                        html.toggle(themes[i + 1]);
                        break;
                    }
                    // if we ARE at the penultimate theme, then start over
                    else {
                        html.toggle(themes[0]);
                    }
                }
            }
            break;
        }
        bear = build();
        // end window.keypress event listener
    });
};

module.exports = listeners;

},{"./bear.js":1,"./toggle.js":4,"./utils.js":5}],3:[function(require,module,exports){
// copyright (c) 2012--2014 Alex Dunn
(function() {
    "use strict";

    var listeners = require('./listeners.js');

    var elements;
    var bear;

    listeners(elements, bear);

    // end
})();

},{"./listeners.js":2}],4:[function(require,module,exports){
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
        console.log("toggleSame commencing");
//        var sameStart = new Date();

        var activeHeaderName = bear[b].tag;
        var activeIsCollapsed = utils.oneOf("collapsed", bear[b].classes);
        var activeNum = activeHeaderName.slice(1);

        if ( activeIsCollapsed ) {
            utils.changeClass.remove(bear, b, "collapsed");
        }
        else {
            utils.changeClass.add(bear, b, "collapsed");
        }
        this.me(elements, bear, b);

        // first walk up, toggling all at the same level
        var c = b - 1;
        while ( c &&
                (!utils.isHeaderTag(bear[c].tag) ||
                 (bear[c].tag.slice(1) >= activeNum)) ) {
            var curNum = bear[c].tag.slice(1);
            if ( utils.isHeaderTag(bear[c].tag) ) {
                if ( activeIsCollapsed &&
                     (utils.oneOf("collapsed", bear[c].classes) < 0) &&
                     curNum === activeNum ) {
                         //console.log("toggling a: " + curNum);
                         this.me(elements, bear, c);
                         //changeClass.remove(bear, c, "collapsed");
                     }
                // collapsing?
                else if ( (utils.oneOf("collapsed", bear[c].classes) > -1) &&
                          curNum === activeNum ) {
                              //console.log("toggling a: " + curNum);
                              this.me(elements, bear, c);
                              //changeClass.add(bear, c, "collapsed");
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
            if ( utils.isHeaderTag(bear[d].tag) ) {
                if ( activeIsCollapsed &&
                     (utils.oneOf("collapsed", bear[d].classes < 0) ) &&
                     curNum2 === activeNum ) {
                         this.me(elements, bear, d);
                         //changeClass.remove(bear, d, "collapsed");
                     }
                else if ( (utils.oneOf("collapsed", bear[d].classes) > -1 ) &&
                         curNum2 === activeNum ) {
                             this.me(elements, bear, d);
                             //changeClass.add(bear, d, "collapsed");
                         }
            }
            d++;
        }
        // end `toggleSame` definition
//        var sameEnd = new Date();
        console.log("toggleSame ending");
        //console.log("toggleSame time: " + (sameEnd - sameStart));
    },

    me: function (elements, bear, target) {
        console.log("toggleMe commencing");
//        var meStart = new Date();

        var elementIndex = target;

        // get the number of the header (h1 => 1, h2 => 2, etc)
        var headerNum = bear[elementIndex].tag.slice(1);
        console.log('toggling a H' + headerNum);

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
        console.log("toggleMe ending");
        //console.log("toggleMe() time: " + (meEnd - meStart));
    }
};

module.exports = toggle;

},{"./utils.js":5}],5:[function(require,module,exports){
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

},{}]},{},[3])