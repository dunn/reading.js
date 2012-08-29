// written by Alex Dunn in 2012

////////////////////
// GLOBAL VARIABLES:
////////////////////

// the "H1" etc are just sample items to remind us what this array is
// for: holding the extracted contents of various header levels
var rangeArray = [ ["H1", ""], ["H2", ""], ["H3", ""], ["H4", ""], ["H5", ""], ["H6", ""] ];

// just a list to reference when dealing with header elements;
// in all caps because I guess javascript likes that?
var headerList = ["H1", "H2", "H3", "H4", "H5", "H6"];

// this array is populated with the header elements in the document,
// so we don't have to cycle through every element every time
var headers = [];

// this is just the headers visible after a collapse or expansion
var visible = [];

// this gets used by showMe and hideMe, so maybe it's a good idea to
// declare it here
var headerNum = "";

// unicode symbols for button icons
var iconThis = "←";
var iconAll = "↕";

// http://stackoverflow.com/questions/493175/how-can-i-create-an-empty-html-anchor-so-the-page-doesnt-jump-up-when-i-click
var headerLinks = " <button class='this' title='Collapse this section'>" + iconThis + "</button> <button class='all' title='Collapse all sections at this level'>" + iconAll + "</button>";

// keyCode/charCode variables
var keyNext = 106;
var keyPrev = 107;
var keyNextUp = 108;
var keyPrevUp = 105;
var keyFirst = 117;
var keyLast = 109;
var keyAll = 97;
var keyExpand = 102;
var keyTheme = 115;

// gets inserted at the top of the document
var helpBoxText = "<h3>Keyboard shortcuts</h3><ul><li><b>" + String.fromCharCode(keyNext) + "</b>: Next section</li><li><b>" + String.fromCharCode(keyPrev) + "</b>: Previous section</li><li><b>return/enter</b>: Toggle active section</li><li><b>" + String.fromCharCode(keyNextUp) + "</b>: Next section up</li><li><b>" + String.fromCharCode(keyPrevUp) + "</b>: Previous section up</li><li><b>" + String.fromCharCode(keyFirst) + "</b>: First section</li><li><b>" + String.fromCharCode(keyLast) + "</b>: Last section</li><li><b>" + String.fromCharCode(keyAll) + "</b>: Toggle active section and all sections at the same level</li><li><b>" + String.fromCharCode(keyExpand) + "</b>: Expand all sections (do this before you search within the document!)</li><li><b>" + String.fromCharCode(keyTheme) + "</b>: Switch theme (light/dark)</li></ul>";

/////////////////
// SETUP FUNCTION
/////////////////
window.onload=function() {
"use strict";

// default to the light Solarized theme
document.documentElement.classList.add("light");

headers = getVisibleHeaders();

for ( var num = 0; num < headers.length; num++ ) {
    // append some cute buttons:
    var content = headers[num].innerHTML;
    headers[num].innerHTML=content+headerLinks;

    // and add an event listener:
    // http://www.quirksmode.org/js/introevents.html
    headers[num].onclick=toggleMe;
}

// make the first header active
makeActive(headers[0]);

///////////
// now add the help box at the top:

// first find the first element after <body>:
var elements = document.getElementsByTagName("*");
var firstElement;
for ( var elemCount = 0; elemCount < elements.length; elemCount++ ) {
    if ( elements[elemCount].tagName === "BODY" ) {
        firstElement = elements[elemCount + 1];
        break;
    }
}

// then make a new div
var helpDiv = document.createElement("div");
// and give it a class (if you change the class, make sure to change
// it in getVisibleHeaders too)
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
var key = key || window.event;
var theKey = key.which || key.keyCode;

    // populate the visible array if we haven't already:
    if ( visible.length === 0 ) {
        visible = getVisibleHeaders();
    }

    // if they hit [return], toggle the active section:
    else if ( theKey === 13 ) {
        toggleMe( whoIsActive() );
    }
    // if they press "a", collapse all headers at the same level as
    // the active header:
    else if ( theKey === keyAll ) {
        var activeHeaderNum = document.getElementsByClassName("active")[0].tagName;
        var headersAtLevel = document.getElementsByTagName(activeHeaderNum);
        toggleMe(headersAtLevel);
    }        
    // if they pressed 'j' then move down one:
    if ( theKey === keyNext ) {
        // visible.length - 1 so we can't scroll beyond the last
        // header:
        for ( var down = 0; down < ( visible.length - 1 ); down++ ) {
            if ( visible[down].classList.contains("active") ) {
                clearActive(visible);
                makeActive(visible[down + 1]);
                // if we don't break it will loop forever
                break;
            }
        }
    }
    // if they press 'k' go up:
    else if ( theKey === keyPrev ) {
        // visible.length - 1 so we can't scroll beyond the last
        // header:
        for ( var up = visible.length - 1; up > 0; up-- ) {
            if ( visible[up].classList.contains("active") ) {
                clearActive(visible);
                makeActive(visible[up - 1]);
                // if we don't break it will loop forever
                break;
            }
        }
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
        for ( var vNum = 0; vNum < visible.length; vNum++ ) {
            if ( visible[vNum] === whoIsActive() ) {
                for ( var v = (vNum+1); v < visible.length; v++ ) {
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
        var activeThing = whoIsActive();
        while ( isAnythingHidden(headers) ) {
            for ( var f = 0; f < headers.length; f++ ) {
                if ( headers[f].classList.contains("collapsed") ) {
                    toggleMe(headers[f]);
                }
            }
        }
        clearActive(visible);
        makeActive(activeThing);
    }
    // press "s" to change the theme
    else if ( theKey === keyTheme ) {
        var html = document.documentElement;
        if ( html.classList.contains("light") ) {
            html.classList.remove("light");
            html.classList.add("dark");
        }
        else {
            html.classList.remove("dark");
            html.classList.add("light");
        }
    }
};

/////////////////////
// TOGGLING FUNCTIONS
/////////////////////

// toggleMe checks what's being toggled, and passes the element(s) to
// either showMe or hideMe:
function toggleMe(who) {
"use strict";

    // figure out what element(s) we're toggling:
    var headerTarget = getTargets(who);

    // is it just one header, or an array?  If it's not an array it
    // won't have a defined length:
    if ( headerTarget.length === undefined ) {
        // get the number of the header (h1 => 0, h2 => 1, etc)
        headerNum = getHeaderNum(headerTarget);

        // is it hidden?
        var hideBool = isHidden(headerTarget);
        // not hidden? then hide it!
        if ( ! hideBool ) {
            // ok, we're hiding things now:
            hideIt(headerTarget);
        }
        // yes hidden?  then show it!
        else {
            showIt(headerTarget);
        }
    }
    else {
        // this gets set to true or false depending on if the active
        // header is hidden
        var hideCheck;
        if ( isClick(who) ) {
            hideCheck = who.target.parentElement.classList.contains("collapsed");
        }
        else {
            hideCheck = whoIsActive().classList.contains("collapsed");
        }
        if ( ! hideCheck ) {
            // if it's not hidden, then hide it!
            for ( var item = 0; item < headerTarget.length; item++ ) {
                if ( ! headerTarget[item].classList.contains("collapsed") ) {
                    // ok, we're hiding things now:
                    hideIt(headerTarget[item]);
                }
            }
        }
        // if the header was already hidden, then show all hidden
        // headers at that level:
        else {
            for ( var a = 0; a < headerTarget.length; a++ ) {
                if ( headerTarget[a].classList.contains("collapsed") ) {
                    showIt(headerTarget[a]);
                }
            }
        }
    }
    var theActive = whoIsActive();

    // reset the active headers:
    clearActive(headers);

    // now scroll to the header (especially important if we're hiding
    // or showing multiple elements, cause that moves things around
    // like crazy); also set the header as "active":

    // if we just hid or showed one header, then go to that header:
    if ( headerTarget.length === undefined ) {
        makeActive(headerTarget);
    }

    // if we clicked the "all" button, then to go that button's
    // associated header:
    else if ( isClick(who) ) {
        makeActive(who.target.parentElement);
    }
    // if we pressed "a", then go to the header that was active when
    // we pressed "a":
    else {
        makeActive(theActive);
    }
    // repopulate the headers array with only the visible headers:
    visible = getVisibleHeaders();
}

// called by toggleMe
function hideIt(theHidden) {
"use strict";

    // all this `for` loop does is allow us to locate ourselves in the
    // document.  Once we figure out which header was clicked, we set
    // a range that begins just after:
    for ( var i = 0; i < headers.length; i++ ) {
        if ( headers[i] === theHidden ) {
            // start the range after the clicked header
            var range = document.createRange();
            range.setStartAfter(headers[i]);
            // then figure out where to stop; compareHeaders just
            // returns the next header that's the same size or bigger,
            // or the last element of the document (fileEnd):
            // https://developer.mozilla.org/en-US/docs/DOM/Element.lastElementChild
            var fileEnd = document.body.lastChild;
            var stop = compareHeaders(i, headers);
            if ( stop === fileEnd ) {
                range.setEnd(fileEnd);
            }
            else {
                range.setEndBefore(stop);
            }
            // having set the range, we extract everything in
            // it and store the extracted contents in
            // rangeArray:
            // https://developer.mozilla.org/en-US/docs/DOM/range.extractContents
            rangeArray[headerNum][i] = range.extractContents();

            // add the hidden class and renew the event listener:
            addHiddenClass(theHidden);
            addToggler(theHidden);
        }
        // end `for` loop
    }
}

// called by toggleMe
function showIt(what) {
"use strict";

// if we're showing, not hiding, things:
    // this is just like hideMe.  We find where we are in the
    // document, then use compareHeaders to find our endpoint and
    // inject the stored content before that endpoint.  We don't even
    // need to set a range this time:
    for ( var i = 0; i < headers.length; i++ ) {
        // https://developer.mozilla.org/en-US/docs/DOM/Node.insertBefore
        if ( headers[i] === what ) {
            var restoreElem = rangeArray[headerNum][i];
            var nextElem = compareHeaders(i, headers);
            var parentElem = nextElem.parentElement;
            parentElem.insertBefore(restoreElem, nextElem);
            
            // remove the class and renew the event listener:
            removeHiddenClass(what);
            addToggler(what);
        }
    }
// end function
}

///////////////////////////
// ARRAY-BUILDING FUNCTIONS
///////////////////////////

function getVisibleHeaders() {
"use strict";

// get all elements, then get the headers
// http://www.siteexperts.com/tips/contents/ts16/page3.asp
var allArray = document.getElementsByTagName("*");
// set up a counter; this will be used to build the array of header
// elements:
var counter = 0;
var heads = [];
    // move through the array that contains every element and see
    // which elements are headers
    for ( var elem = 0; elem < allArray.length; elem++ ) {
        // for each element found, see if it matches anything on our
        // header reference list:
        for ( var hNum = 0; hNum < headerList.length; hNum++ ) {
            var elemNo = allArray[elem].tagName;
            var headNo = headerList[hNum];
            // don't include the infobox in the array of visible headers
            if ( elemNo === headNo && !allArray[elem].parentElement.classList.contains("js-infobox") ) {
                // and add the element to the header-only array:
                heads[counter] = allArray[elem];
                counter++;
            }
        }
    }           
    return heads;
}

/////////////////////
// CALLED BY TOGGLEME
/////////////////////

// this function is completely useless outside this script:
function compareHeaders(counter, array) {
"use strict";

    // 'counter' is 'i' or the count var for whatever current `for`
    // loop is running
    for ( var j = counter + 1; j <= array.length; j++ ) {
        // return document.body.lastChild if there are no more headers
        if ( j === array.length ) {
            return document.body.lastChild;
        }
        // look at each header after the targetHeader; stop and return
        // that header if it's the same size or bigger than the
        // targetHeader.  Using '<' not '>' because smaller is bigger
        // (h1 < h6):
        else if ( (array[j].tagName.slice(1) - 1) <= headerNum ) {
            return array[j];
        }
    }
}

// this function returns a header element or an array of headers,
// depending on what was clicked or pressed:
function getTargets(inputs) {
"use strict";

    // if toggleMe was called by a keypress, then whatever function
    // that called toggleMe has already passed the correct element(s)
    // to the function, so we don't need to do much:
    if ( ! isClick(inputs) ) {
        return inputs;
    }
    // if something was clicked, we need to figure out what:
    else {
        // first we'll check if it was the actual header element:
        var yes = 0;
        for ( var h = 0; h < headerList.length; h++ ) {
            if ( inputs.target.tagName === headerList[h] ) {
                yes = 1;
            }
        }
        // if it was the header that was clicked, just return that
        // element:
        if ( yes === 1 ) {
            return inputs.target;
        }
        // otherwise, see if it it was the "all" button:
        else if ( inputs.target.classList.contains("all") ) {
            // if so, return an array of all the headers at that level:
            return document.getElementsByTagName(inputs.target.parentElement.tagName);
        }
        else {
            // if it was something else clicked (the "this" button), then
            // just return the header parent:
            return inputs.target.parentElement;
        }
    }
}

//////////////////
// OTHER FUNCTIONS
//////////////////

// event listener; needs to be re-added each time:
function addToggler(where) {
"use strict";
    where.onclick=toggleMe;
}

// class handling functions; hopefully self-explanatory:

function isHidden(thing) {
"use strict";
    return thing.classList.contains("collapsed");
}

function removeHiddenClass(where) {
"use strict";
    where.classList.remove("collapsed");
}

function addHiddenClass(where) {
"use strict";
    where.classList.add("collapsed");
}

// this function is just used on headers; it gets the header
// number-level (h1 = 1) then subtracts one because we're going to be
// using it with the rangeArray, which starts at 0:

function getHeaderNum(who) {
"use strict";
    // -1 so it plays nice with rangeArray
    return who.tagName.slice(1) - 1;
}

// class="active" functions:

function makeActive(me) {
"use strict";
    me.classList.add("active");
    me.scrollIntoView();
}

function clearActive(array) {
"use strict";
    for ( var head = 0; head < array.length; head++ ) {
        if ( array[head].classList.contains("active") ) {
            array[head].classList.remove("active");
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
        for ( var thing = 0; thing < things.length; thing++ ) {
            if ( things[thing].classList.contains("collapsed") ) {
                anything++;
            }
        }
        return ( anything > 0 ? true : false );
    }
}
