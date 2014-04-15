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
