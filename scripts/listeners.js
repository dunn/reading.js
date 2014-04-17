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
