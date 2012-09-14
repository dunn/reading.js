// written by Alex Dunn in 2012

////////////////////
// GLOBAL VARIABLES:
////////////////////

// just a list to reference when dealing with header elements;
// in all caps because I guess javascript likes that?
var headerList = [ "H1", "H2", "H3", "H4", "H5", "H6" ];
// these are excluded from the array of elements that can be made
// active (by scrolling with j/k and other keys):
var scrollSkip = [ "HEADER", "HR" ];

// this array will be populated with document.body.children
var elements = [];

// this array is populated with the header elements in the document,
// so we don't have to cycle through every element every time
var headers = [];

// `visible` holds the visible elements after an expansion or collapse
// ("visible" means it doesn't have `class="hidden"`)
var visible = [];

// unicode symbols for button icons
var iconThis = "←";
var iconAll = "↕";

var headerLinks = " <button class='this' title='Collapse this section'>" + iconThis + "</button> <button class='all' title='Collapse all sections at this level'>" + iconAll + "</button>";

// keyCode/charCode variables
var keyNext = 106;
var keyPrev = 107;
var keyNextUp = 111;
var keyPrevUp = 105;
var keyFirst = 117;
var keyLast = 109;
var keyAll = 97;
var keyExpand = 102;
var keyTheme = 115;

// this gets set to the window.location (minus `#id`) in the `onload`
// function and is also used in the `makeActive` function (we add the
// `#id` to it):
var url;

/////////////////
// SETUP FUNCTION
/////////////////
window.onload=function() {
"use strict";

// default to the dark Solarized theme
document.documentElement.classList.add("dark");

// populate the elements array (without the infobox):
elements = document.body.children;

// get every element except for the <header>:
visible = getElements(false, scrollSkip, true);

// get the <h1>, <h2> etc headers:
headers = getElements(true, headerList, false);

// make the first header active, but don't scroll to it:
headers[0].classList.add("active");

for ( var i = 0; i < headers.length; i++ ) {
    // append some cute buttons:
    headers[i].innerHTML += headerLinks;

    // and add an event listener:
    // http://www.quirksmode.org/js/introevents.html
    headers[i].onclick=toggleHandler;
}

// make the first header the target of the "skip to content link" in
// the infobox.  if it doesn't already have an id, give it one:
var firstHId = headers[0].getAttribute("id");
var startId;
if ( firstHId === null ) {
    headers[0].setAttribute("id", "startOfContent");
    startId = "startOfContent";
}
else {
    startId = firstHId;
}

// url handling; changing the active header adds the #id of that
// header to the window.location, and if someone navigates to the
// document using a #id link, activate that header:
url = window.location.toString();
// check if it has an ID suffix:
var urlPound = url.indexOf("#");
if ( urlPound !== -1 ) {
    var urlId = url.slice(urlPound + 1);
    // after getting the id, remove it from the global url var:
    url = url.slice(0, urlPound);
    // find the element with the id from the url
    var startAt = document.getElementById(urlId);
    // if it's a header, make it active upon loading:
    if ( yesHeaderTag(startAt) ) {
        clearActive(headers);
        makeActive(startAt);
    }
}

//////////////////////////////////
// NOW add the infobox at the top:

var helpBoxText = "<p><a href=\"#" + startId + "\" title=\"Skip to content\">Skip to content</a></p><aside><h3>Keyboard shortcuts</h3><ul><li><span class=\"key\">" + String.fromCharCode(keyNext) + " / " + String.fromCharCode(keyPrev) + "</span> next/previous</li><li><span class=\"key\">enter</span> toggle active header</li><li><span class=\"key\">" + String.fromCharCode(keyNextUp) + " / " + String.fromCharCode(keyPrevUp) + "</span> next/previous header (one level up)</li><li><span class=\"key\">" + String.fromCharCode(keyFirst) + " / " + String.fromCharCode(keyLast) + "</span> start/end of document</li><li><span class=\"key\">" + String.fromCharCode(keyAll) + "</span> toggle everything in this section</li><li><span class=\"key\">" + String.fromCharCode(keyExpand) + "</span> expand everything (do this before you search)</li><li><span class=\"key\">" + String.fromCharCode(keyTheme) + "</span> change theme</li></ul></aside>";

// find the first element after <body>:
var firstElement = document.body.children[0];
// then make a new div
var helpDiv = document.createElement("div");
// and give it a class (if you change the class, make sure to change
// it in getElements too)
helpDiv.classList.add("js-infobox");
// and shove it into the top of the page
document.body.insertBefore(helpDiv, firstElement);
// and give it some content:
helpDiv.innerHTML=helpBoxText;

// end onload function
};

////////////////////
// KEYPRESS FUNCTION
////////////////////
window.onkeypress=function(key) {
"use strict";

// http://stackoverflow.com/a/5420482
key = key || window.event;
var theKey = key.which || key.keyCode;

    // if they hit [return], toggle the active section:
    if ( theKey === 13 ) {
        toggleHandler( whoIsActive() );
    }
    // if they press "a", collapse all headers at the same level as
    // the active header:
    else if ( theKey === keyAll ) {
        toggleSame();
    }        
    // if they pressed 'j' then move down one:
    if ( theKey === keyNext ) {
        moveActive(visible, true, 1);
    }
    // if they press 'k' go up:
    else if ( theKey === keyPrev ) {
        moveActive(visible, false, 1);
    }
    // if they press "u", go to the first visible header:
    else if ( theKey === keyFirst ) {
        clearActive(visible);
        makeActive(visible[0]);
    }
    // if they press "m" go to the last visible header:
    else if ( theKey === keyLast ) {
        clearActive(visible);
        makeActive(visible[visible.length - 1]);
    }
    // if they press "i", go to the previous header that's a level up:
    else if ( theKey === keyPrevUp ) {
        nextUp(false);
    }
    // if they press "o" go to the next header that's a level up:
    else if ( theKey === keyNextUp ) {
        nextUp(true);
    }
    // if they press "f", expand everything
    // (this is a useful feature I guess, but it also has to be
    // activated before the user tries to search; hence being bound to
    // "f".  This is more a work-around than an actual solution,
    // obvs):
    else if ( theKey === keyExpand ) {
        while ( isAnythingHidden(visible) ) {
            for ( var f = 0; f < visible.length; f++ ) {
                if ( visible[f].classList.contains("collapsed") ) {
                    toggleHandler(visible[f]);
                }
            }
        }
    }
    // press "s" to change the theme
    else if ( theKey === keyTheme ) {
        var html = document.documentElement;
        html.classList.toggle("dark");
        html.classList.toggle("light");
    }

// end keypress fn
};

/////////////////////
// TOGGLING FUNCTIONS
/////////////////////

// toggleHandler checks what's being toggled, and in turn calls
// toggleMe or toggleSame:
function toggleHandler(what) {
"use strict";

    var headerTarget;

    // if toggleHandler was called by a keypress, then whatever
    // function that called toggleHandler has already passed the
    // correct element(s) to the function, so we don't need to do
    // much:
    if ( ! isClick(what) ) {
        headerTarget = what;
    }
    
    // if something was clicked, we need to figure out what:
    else {
        clearActive(headers);
        // if it was the header that was clicked, just return that
        // element:
        if ( yesHeaderTag(what.target) ) {
            headerTarget = what.target;
            headerTarget.classList.add("active");
        }
        // otherwise, see if it it was the "all" button:
        else if ( what.target.classList.contains("all") ) {
            // if so, return an array of all the headers at that
            // level:
            headerTarget = document.getElementsByTagName(what.target.parentElement.tagName);
            what.target.parentElement.classList.add("active");
        }
        else {
            // if it was something else clicked (the "this" button),
            // then just return the header parent:
            headerTarget = what.target.parentElement;
            headerTarget.classList.add("active");
        }
    }
        
    // is it just one header, or an array?  If it's not an array it
    // won't have a defined length:
    if ( headerTarget.length === undefined && yesHeaderTag(headerTarget) ) {
        toggleMe(headerTarget);
    }
    else {
        toggleSame();
    }

    var theActive = whoIsActive();
    
    makeActive(theActive);
    
    // repopulate arrays:
    headers = getElements(true, headerList, true);
    visible = getElements(false, scrollSkip, true);

// end toggleHandler
}

function toggleMe(who) {
"use strict";
    // first we use this `for` loop to locate ourselves in the
    // document
    for ( var i = 0; i < elements.length; i++ ) {
        // ok, we've located ourselves:
        if ( elements[i] === who ) {
            // get the number of the header (h1 => 1, h2 => 2, etc)
            var headerNum = getHeaderNum(who);
            // this variable holds the next header of greater or equal
            // value; it's used to determine how much stuff gets
            // expanded or collapsed
            var stop = compareHeaders(i, elements, headerNum);
            ////////////////////////////////////////
            // IF THE HEADER IS COLLAPSED, WE EXPAND
            ////////////////////////////////////////
            if ( isCollapsed(who) ) {
                toggleCollapse(who);
                // starting a new counter to go through the elements
                // array and figure out what needs to be unhidden and
                // what headers need to lose the "collapsed" class:
                var r = i + 1;
                while ( elements[r] !== stop && elements[r] !== undefined ) {
                    // if the first element we come across is not a
                    // header element, then unhide it and increment
                    // the new counter:
                    if ( ! yesHeaderTag(elements[r]) ) {
                        elements[r].classList.remove("hidden");
                        r++;
                    }
                    else {
                        // if the element IS a header, then, if it
                        // DOESN'T have the "collapsed" class, unhide
                        // it and increment the counter:
                        if ( !isCollapsed(elements[r]) ) {
                            elements[r].classList.remove("hidden");
                            r++;
                        }
                        // if the header IS "collapsed", then unhide
                        // it BUT skip everything past it (until we
                        // get to another header):
                        else {
                            var rTagNum = getHeaderNum(elements[r]);
                            var rStop = compareHeaders(r, elements, rTagNum);
                            elements[r].classList.remove("hidden");
                            while ( elements[r] !== rStop && elements[r] !== undefined ) {
                                r++;
                            }
                        }
                    }
                }
            }
            // if the active header is not collapsed, collapse it and
            // its "children":
            else {
                toggleCollapse(who);
                var h = i + 1;
                while ( elements[h] !== stop && elements[h] !== undefined ) {
                    elements[h].classList.add("hidden");
                    h++;
                }
            }
            // re-affirm the event listener; we don't need to do this
            // if the element is not a header, because only headers
            // are clickable
            addToggler(who);

            // probably don't have to break it here, but maybe it will
            // run faster if it doesn't have to go through the rest of
            // the page elements:
            break;
        }
    }
// end function
}

// toggle all headers of the same level as the active:
function toggleSame() {
"use strict";
    var active = whoIsActive();
    var activeHeaderName = active.tagName;
    // are we toggling all <h1>s?
    if ( activeHeaderName === "H1" ) {
        var h1s = document.getElementsByTagName("H1");
        toggleHandler(active);
        if ( ! isCollapsed(active) ) {
            for ( var i = 0; i < h1s.length; i++ ) {
                if ( h1s[i] !== active && isCollapsed(h1s[i]) ) {
                toggleHandler(h1s[i]);
                }
            }
        }
        else {
            for ( var k = 0; k < h1s.length; k++ ) {
                if ( h1s[k] !== active && ! isCollapsed(h1s[k]) ) {
                toggleHandler(h1s[k]);
                }
            }
        }
    }
    // are we toggling things other than <h1>s?
    else if ( yesHeaderTag(active) ) {
        toggleHandler(active);
        var activeNum = getHeaderNum(active);
        for ( var b = 0; b < headers.length; b++ ) {
            if ( headers[b] === active ) {
                // headers gets reset by toggleHandler, so we have to
                // use 'subtract' to keep track of how many fewer
                // headers there will be in the new array:
                var subtract = 0;
                var c = b - 1;
                while ( getHeaderNum(headers[c]) >= activeNum ) {
                    var curNum = getHeaderNum(headers[c]);
                    if ( isCollapsed(active) ) {
                        if ( !isCollapsed(headers[c]) && curNum === activeNum ) {
                            toggleHandler(headers[c]);
                        }
                        else {
                            subtract++;
                        }
                    }
                    else {
                        if ( isCollapsed(headers[c]) && curNum === activeNum ) {
                            toggleHandler(headers[c]);
                        }
                        else {
                            subtract++;
                        }
                    }
                    c--;
                }
                var d = b - subtract + 1;
                while ( getHeaderNum(headers[d]) >= activeNum ) {
                    var curNum2 = getHeaderNum(headers[d]);
                    if ( isCollapsed(active) ) {
                        if ( !isCollapsed(headers[d]) && curNum2 === activeNum ) {
                            toggleHandler(headers[d]);
                        }
                    }
                    else {
                        if ( isCollapsed(headers[d]) && curNum2 === activeNum ) {
                            toggleHandler(headers[d]);
                        }
                    }
                    d++;
                }
                break;
            }
        }
    }
}

/////////////////
// TOGGLE SUPPORT
/////////////////

// this function finds the active header, then returns the next header
// that's at the same level or higher (i.e., if the active header is
// h3, it will return the next h3, h2, or h1---whichever comes first):
function compareHeaders(counter, array, headerNum) {
"use strict";

    // 'counter' is the count var for whatever current `for` loop is
    // running:
    for ( var i = counter + 1; i < array.length; i++ ) {
        // return document.body.lastChild if there are no more headers
        if ( i === array.length - 1) {
            return elements[elements.length];
        }
        // look at each header after the targetHeader; stop and return
        // that header if it's the same size or bigger than the
        // targetHeader.  Using '<' not '>' because smaller is bigger
        // (h1 < h6):
        else {
            if ( yesHeaderTag(array[i]) && (array[i].tagName.slice(1)) <= headerNum ) {
                // return the header match
                return array[i];
            }
        }
    }
}

// event listener; needs to be re-added each time:
function addToggler(where) {
"use strict";
    where.onclick=toggleHandler;
}

function isCollapsed(thing) {
"use strict";
    return thing.classList.contains("collapsed");
}

function toggleCollapse(where) {
"use strict";
    where.classList.toggle("collapsed");
}

function getHeaderNum(who) {
"use strict";
    if ( who.length === undefined ) {
        return who.tagName.slice(1);
    }
    else {
        return who[0].tagName.slice(1);
    }
}

// just returns true if the the argument passed was a click event:
function isClick(input) {
"use strict";
    return ( input.target !== undefined );
}

// what is the first (only) element that has `class="active"`?
function whoIsActive() {
"use strict";
    return document.getElementsByClassName("active")[0];
}

// well, IS anything hidden?
function isAnythingHidden(things) {
"use strict";
    if ( things.length === undefined ) {
        return things.classList.contains("collapsed");
    }
    else {
        var anything = 0;
        for ( var i = 0; i < things.length; i++ ) {
            if ( things[i].classList.contains("collapsed") ) {
                anything++;
            }
        }
        return ( anything > 0 ? true : false );
    }
}

//////////////////////////
// ACTIVE/SCROLL FUNCTIONS
//////////////////////////

function moveActive(ref, down, num) {
"use strict";
    for ( var i = 0; i < ref.length; i++ ) {
        if ( ref[i].classList.contains("active") ) {
            // ref.length - 1 so we can't scroll beyond the last
            // header:
            if ( down && i < ( ref.length - 1) ) {
                clearActive(ref);
                makeActive(ref[i + num]);
            }
            // i > 0 so we can't go up beyond the first header:
            else if ( !down && i > 0 ) {
                clearActive(ref);
                makeActive(ref[i - num]);
            }
            // if we don't break it will loop forever
            break;
        }
    }
}

// `down` is a boolean: true is down, false is up
function nextUp(down) {
"use strict";
    var b = whoIsActive();
    for ( var k = 0; k < visible.length; k++ ) {
        if ( visible[k] === b ) {
            for ( var v = (down ? (k+1) : (k-1)); (down ? v < visible.length: v >= 0); (down ? v++ : v--) ) {
                if ( yesHeaderTag(visible[v]) ) {
                    if ( (getHeaderNum(b) > getHeaderNum(visible[v])) || !yesHeaderTag(b) ) {
                        clearActive(visible);
                        makeActive(visible[v]);
                        break;
                    }
                }
            }
            break;
        }
    }
}

function makeActive(me) {
"use strict";
// uses global var "url"
    me.classList.add("active");
    var id = me.getAttribute("id");
    if ( id !== null ) {
        window.location.replace(url + "#" + id);
    }
    me.scrollIntoView();
}

function clearActive(array) {
"use strict";
    for ( var i = 0; i < array.length; i++ ) {
        array[i].classList.remove("active");
    }
}

//////////////////
// OTHER FUNCTIONS
//////////////////

// `fromTheArray` and `visibleOnly` are booleans; `refArray` is an
// array of tag names.  if `fromTheArray` is true, only elements whose
// tagNames match the refArray are returned; if it is false, only
// elements who DON'T match get returned.  if `visibleOnly` is true,
// only elements that aren't class="hidden" get returned, and
// vice-versa if false
function getElements(fromTheArray, refArray, visibleOnly) {
"use strict";
// set up a counter; this will be used to build the array of header
// elements:
var counter = 0;
var matches = [];
    // move through the array that contains every element and see
    // which elements are matches
    for ( var i = 0; i < elements.length; i++ ) {
        // don't include the infobox in the array of visible
        // headers:
        if ( !elements[i].parentElement.classList.contains("js-infobox") && !elements[i].classList.contains("js-infobox") ) {
            if ( (fromTheArray && isOneOf(elements[i].tagName, refArray)) || (!fromTheArray && !isOneOf(elements[i].tagName, refArray)) ) {
                if ( !visibleOnly || (visibleOnly && !elements[i].classList.contains("hidden")) ) {
                    // and add the element to the header-only array:
                    matches[counter] = elements[i];
                    counter++;
                }
            }
        }
    }           
    return matches;
}

function yesHeaderTag(tag) {
"use strict";
    var t = tag.tagName;
    return ( t === "H1" || t === "H2" || t === "H3" || t === "H4" || t === "H5" || t === "H6" );
}

function isOneOf(thing, array) {
"use strict";
    for ( var i = 0; i < array.length; i++ ) {
        if ( thing === array[i] ) {
            return true;
        }
    }
}
