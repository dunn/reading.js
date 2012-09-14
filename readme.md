# Reading.js

This project is a half-hearted attempt to make it easier to read
things&mdash;particularly long documents&mdash;online.
[For example, here's what Walter Ott's *Modern Philosophy* looks like with Reading.js](http://baruffio.com/modernphilosophy/text.html
"Modern Philosophy by Walter Ott").

## Features

The two important things are the `scripts/reading.js` script and the
`stylesheets/reading.css` stylesheet.  When these two are included in
a well-structured HTML file, they add:

- **Keyboard shortcuts**

- **Section folding**
    
- **Two color schemes** (Ethan Schoonover's
    [Solarized](http://ethanschoonover.com/solarized) are awesome.)
    
## Using Reading.js

Feel free to download and modify this project to your heart's content
(seriously, please make it better).  But if you just want to use the
files with your own document, add these two lines to the `<head>` of
your HTML document:

```html
<link rel="stylesheet" href="http://baruffio.com/reading.js/stylesheets/reading.css">
<script type="text/javascript" src="http://baruffio.com/reading.js/scripts/reading.min.js"></script>
```

The above will include compressed versions of `reading.js` and
`reading.css` in your document.

I haven't tested any other `.css` file alongside `reading.css`; things
might get weird if you try to include another stylesheet.

The `reading.html5` template can be used with
[pandoc](http://johnmacfarlane.net/pandoc/ "pandoc project page") when
converting documents to HTML.

## What do you mean by "well-structured HTML"?

I designed Reading.js to use with the HTML documents that I make with
[pandoc](http://johnmacfarlane.net/pandoc/ "pandoc project page"), it
should play nice with other Markdown-to-HTML converters as well.  But
it **won't** work with most HTML documents, because:

1. Reading.js can only collapse sections of text that begin with a
header element (`h1`, `h2`, `h3`, `h4`, `h5`, or `h6`), and

2. the header elements have to be direct children of the `<body>` (that
is, they are not enclosed in a `<div>` or any other element).

Reading.js just won't work if the header elements in your document are
differently formatted.  (If you're using pandoc, don't use the
`--section-divs` option.)  

The `range-method` branch of this project is an older version of the
script that hid content using JavaScript instead of CSS.  That avoided
some of the limitations just mentioned, but was much slower.

Clearly these limitations only exist because I'm a shitty programmer.
But I'm also lazy, and I only use Reading.js on HTML files made by
pandoc, so I probably won't fix this any time soon.  (Another reason
for you to fork it, yes?)

## Does this work in all browsers?

I doubt it.  It *seems* to work OK in

- Firefox 15 (running on Mountain Lion)

- Chrome 21 (Mountain Lion)

- Opera 12 (Mountain Lion)

- Safari 6 (Windows Vista j/k lol)

But beyond that I'm blissfully ignorant.  (Also, lists look pretty
wonky in Firefox and other Gecko browsers thanks to a
[bug that's old enough to be in junior high](https://bugzilla.mozilla.org/show_bug.cgi?id=36854),
so I guess you could argue it doesn't really work there after all.)

## "License"

This software may be used for any purpose whatever, but with no
warranty or guarantee of any kind.
