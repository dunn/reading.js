// written by Alex Dunn in 2012

////////////////////
// GLOBAL VARIABLES:
////////////////////

// just a list to reference when dealing with header elements;
// in all caps because I guess javascript likes that?
var headerList = [ "H1", "H2", "H3", "H4", "H5", "H6" ];

// this array will be populated with document.body.children
var elements = [];

// this array is populated with the header elements in the document,
// so we don't have to cycle through every element every time
var headers = [];

// this is just the headers visible after a collapse or expansion
var visible = [];

// unicode symbols for button icons
var iconThis = "←";
var iconAll = "↕";

// http://stackoverflow.com/questions/493175/how-can-i-create-an-empty-html-anchor-so-the-page-doesnt-jump-up-when-i-click
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

// gets inserted at the top of the document
var helpBoxText = "<h3>Keyboard shortcuts</h3><ul><li><b>" + String.fromCharCode(keyNext) + "</b>: Next section</li><li><b>" + String.fromCharCode(keyPrev) + "</b>: Previous section</li><li><b>return/enter</b>: Toggle active section</li><li><b>" + String.fromCharCode(keyNextUp) + "</b>: Next section (one level up)</li><li><b>" + String.fromCharCode(keyPrevUp) + "</b>: Previous section (one level up)</li><li><b>" + String.fromCharCode(keyFirst) + "</b>: First section</li><li><b>" + String.fromCharCode(keyLast) + "</b>: Last section</li><li><b>" + String.fromCharCode(keyAll) + "</b>: Toggle everything in this section</li><li><b>" + String.fromCharCode(keyExpand) + "</b>: Expand all sections (do this before you search within the document)</li><li><b>" + String.fromCharCode(keyTheme) + "</b>: Switch theme (light/dark)</li></ul>";

/////////////////
// SETUP FUNCTION
/////////////////
window.onload=function() {
"use strict";

// default to the light Solarized theme
document.documentElement.classList.add("light");

// populate the elements array (without the infobox):
elements = document.body.children;

// populate the headers array (without the infobox):
headers = getElements(headerList, false);

// all the headers start out visible:
visible = headers;

for ( var i = 0; i < headers.length; i++ ) {
    // append some cute buttons:
    var content = headers[i].innerHTML;
    headers[i].innerHTML=content+headerLinks;

    // and add an event listener:
    // http://www.quirksmode.org/js/introevents.html
    headers[i].onclick=toggleHandler;
}

// make the first header active, but don't scroll to it
headers[0].classList.add("active");

///////////
// NOW add the help box at the top:

// first find the first element after <body>:
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

// end onload
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
        activateSame(visible, "down", 1);
    }
    // if they press 'k' go up:
    else if ( theKey === keyPrev ) {
        activateSame(visible, "up", 1);
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
    // if they press "i", go to the next header that's a level up:
    else if ( theKey === keyPrevUp ) {
        for ( var i = 0; i < visible.length; i++ ) {
            if ( visible[i] === whoIsActive() ) {
                for ( var j = (i-1); j >= 0; j-- ) {
                    if ( getHeaderNum(whoIsActive()) > getHeaderNum(visible[j]) ) {
                        clearActive(visible);
                        makeActive(visible[j]);
                        break;
                    }
                }
            }
        }
    }
    // if they press "l" go to the previous header that's a level up:
    else if ( theKey === keyNextUp ) {
        for ( var k = 0; k < visible.length; k++ ) {
            if ( visible[k] === whoIsActive() ) {
                for ( var v = (k+1); v < visible.length; v++ ) {
                    if ( getHeaderNum(whoIsActive()) > getHeaderNum(visible[v]) ) {
                        clearActive(visible);
                        makeActive(visible[v]);
                        break;
                    }
                }
            }
        }
    }
    // if they press "f", expand everything:
    // this is a useful feature I guess, but it also has to be
    // activated before the user tries to search; hence being bound to
    // "f".  This is more a work-around than an actual solution, obvs:
    else if ( theKey === keyExpand ) {
        while ( isAnythingHidden(headers) ) {
            for ( var f = 0; f < headers.length; f++ ) {
                if ( headers[f].classList.contains("collapsed") ) {
                    toggleHandler(headers[f]);
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
};

/////////////////////
// TOGGLING FUNCTIONS
/////////////////////

// toggleHandler checks what's being toggled, and passes the
// element(s) to toggleMe:
function toggleHandler(what) {
"use strict";
    // figure out what element(s) we're toggling:
    var headerTarget = getTargets(what);

    var theActive = whoIsActive();

    // is it just one header, or an array?  If it's not an array it
    // won't have a defined length:
    if ( headerTarget.length === undefined ) {
        toggleMe(headerTarget);
    }
    else {
        toggleSame();
    }

    // reset the active headers:
    clearActive(headers);

    // now scroll to the header (especially important if we're hiding
    // or showing multiple elements, cause that moves things around
    // like crazy); also set the header as "active":

    makeActive(theActive);

    // repopulate the headers array with only the visible headers:
    visible = getElements(headerList, true);
}

// called by toggleHandler
function toggleMe(who) {
"use strict";
    // get the number of the header (h1 => 1, h2 => 2, etc)
    var headerNum = getHeaderNum(who);

    // first we use this `for` loop to locate ourselves in the
    // document
    for ( var i = 0; i < elements.length; i++ ) {
        // ok, we've located ourselves:
        if ( elements[i] === who ) {
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
                    var tName = elements[r].tagName;
                    // if the first element we come across is not a
                    // header element, then unhide it and increment
                    // the new counter:
                    if ( ! ( tName === "H1" || tName === "H2" || tName === "H3" || tName === "H4" || tName === "H5" || tName === "H6" ) ) {
                        elements[r].classList.remove("hidden");
                        r++;
                    }
                    else {
                        // if the element IS a header, then, if it DOESN'T
                        // have the "collapsed" class, unhide it and
                        // increment the counter:
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
            // re-affirm the event listener:
            addToggler(who);
            // probably don't have to break it here, but maybe it will
            // run faster if it doesn't have to go through the rest of
            // the pasge elements:
            break;
        }
    }
// end function
}

///////////////////////////////////////
// CALLED BY KEYPRESS AND TOGGLEHANDLER
///////////////////////////////////////

// toggle all headers of the same level as the active:
function toggleSame() {
"use strict";
    var active = whoIsActive();
    var activeHeaderName = active.tagName;
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
    else {
        toggleHandler(active);
        var activeNum = getHeaderNum(active);
        for ( var b = 0; b < visible.length; b++ ) {
            if ( visible[b] === active ) {
                // visible gets reset by toggleHandler, so we have to
                // use subtract to keep track of how many fewer
                // headers there will be in the new array:
                var subtract = 0;
                var c = b - 1;
                while ( getHeaderNum(visible[c]) >= activeNum ) {
                    var curNum = getHeaderNum(visible[c]);
                    if ( isCollapsed(active) ) {
                        if ( !isCollapsed(visible[c]) && curNum === activeNum ) {
                            toggleHandler(visible[c]);
                        }
                        else {
                            subtract++;
                        }
                    }
                    else {
                        if ( isCollapsed(visible[c]) && curNum === activeNum ) {
                            toggleHandler(visible[c]);
                        }
                        else {
                            subtract++;
                        }
                    }
                    c--;
                }
                var d = b - subtract + 1;
                while ( getHeaderNum(visible[d]) >= activeNum ) {
                    var curNum2 = getHeaderNum(visible[d]);
                    if ( isCollapsed(active) ) {
                        if ( !isCollapsed(visible[d]) && curNum2 === activeNum ) {
                            toggleHandler(visible[d]);
                        }
                    }
                    else {
                        if ( isCollapsed(visible[d]) && curNum2 === activeNum ) {
                            toggleHandler(visible[d]);
                        }
                    }
                    d++;
                }
                break;
            }
        }
    }
}

function activateSame(ref, dir, num) {
"use strict";
    if ( dir === "down" ) {
        // ref.length - 1 so we can't scroll beyond the last
        // header:
        for ( var i = 0; i < ( ref.length - 1 ); i++ ) {
            if ( ref[i].classList.contains("active") ) {
                clearActive(ref);
                makeActive(ref[i + num]);
                // if we don't break it will loop forever
                break;
            }
        }
    }
    else {
        for ( var k = ref.length - 1; k > 0; k-- ) {
            if ( ref[k].classList.contains("active") ) {
                clearActive(ref);
                makeActive(ref[k - num]);
                // if we don't break it will loop forever
                break;
            }
        }
    }
}

/////////////////////
// CALLED BY TOGGLEME
/////////////////////

// this function is completely useless outside this script:
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
            for ( var level = 0; level < headerList.length; level++ ) {
                // if the element found is a header and is greater
                // than or equal to the headerTarget:
                if ( array[i].tagName === headerList[level] && (array[i].tagName.slice(1)) <= headerNum ) {
                    // return the header match
                    return array[i];
                }
            }
        }
    }
}

// this function returns a header element or an array of headers,
// depending on what was clicked or pressed:
function getTargets(inputs) {
"use strict";

    // if toggleHandler was called by a keypress, then whatever function
    // that called toggleHandler has already passed the correct element(s)
    // to the function, so we don't need to do much:
    if ( ! isClick(inputs) ) {
        return inputs;
    }
    // if something was clicked, we need to figure out what:
    else {
        clearActive(headers);
        // first we'll check if it was the actual header element:
        var yes = 0;
        for ( var i = 0; i < headerList.length; i++ ) {
            if ( inputs.target.tagName === headerList[i] ) {
                yes = 1;
            }
        }
        // if it was the header that was clicked, just return that
        // element:
        if ( yes === 1 ) {
            makeActive(inputs.target);
            return inputs.target;
        }
        // otherwise, see if it it was the "all" button:
        else if ( inputs.target.classList.contains("all") ) {
            // if so, return an array of all the headers at that level:
            makeActive(inputs.target.parentElement);
            return document.getElementsByTagName(inputs.target.parentElement.tagName);
        }
        else {
            // if it was something else clicked (the "this" button), then
            // just return the header parent:
            makeActive(inputs.target.parentElement);
            return inputs.target.parentElement;
        }
    }
}

///////////////////////////
// ARRAY-BUILDING FUNCTIONS
///////////////////////////

function getElements(refArray, visibleOnly) {
"use strict";
// set up a counter; this will be used to build the array of header
// elements:
var counter = 0;
var matches = [];
    // move through the array that contains every element and see
    // which elements are headers
    for ( var i = 0; i < elements.length; i++ ) {
        // for each element found, see if it matches anything on our
        // header reference list:
        for ( var j = 0; j < refArray.length; j++ ) {
            var elemNo = elements[i].tagName;
            var refNo = refArray[j];
            // don't include the infobox in the array of visible
            // headers; if visibleOnly is false, DO include the
            // "hidden" headers:
            if ( elemNo === refNo && !elements[i].parentElement.classList.contains("js-infobox") ) {
                if ( !visibleOnly ) {
                    // and add the element to the header-only array:
                    matches[counter] = elements[i];
                    counter++;
                }
                else {
                    if ( !elements[i].classList.contains("hidden")) {
                        // and add the element to the header-only array:
                        matches[counter] = elements[i];
                        counter++;
                    }
                }
            }
        }
    }           
    return matches;
}

//////////////////
// OTHER FUNCTIONS
//////////////////

// event listener; needs to be re-added each time:
function addToggler(where) {
"use strict";
    where.onclick=toggleHandler;
}

// class handling functions; hopefully self-explanatory:

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

// class="active" functions:

function makeActive(me) {
"use strict";
    me.classList.add("active");
    me.scrollIntoView();
}

function clearActive(array) {
"use strict";
    for ( var i = 0; i < array.length; i++ ) {
        if ( array[i].classList.contains("active") ) {
            array[i].classList.remove("active");
        }
    }
}

// just returns true if the the argument passed was a click event:

function isClick(input) {
"use strict";
    if ( input.target !== undefined ) {
        return true;
    }
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

