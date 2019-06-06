Beginner's Guide to Javascript and D3.js
========================================

Hello future undergraduate research assistants, this is Chris and Dave.
This file is meant to help with understanding of javascript and D3 in HTML,
with some small code snippets, and examples of the snippets together for some code examples.
Each code snippet will go over (attempt to) show every possible way to use,
and why it's used, in a sense this is a manual that is meant to be compact with
tips, tricks, and weird things that happen with it.

Boilerplate HTML
----------------

Copy and paste this to get a default HTML file:

.. code-block:: HTML

    <!doctype html>
    <html>
        <head>
        </head>
        <body></body>
    </html>


Comments
--------

* HTML comments between <!-- and -->
* // before javascript comments
* JS multi-line comments between /\* and \*/

How To Load a Javascript File into HTML
---------------------------------------

If the Javascript file looks like this:

.. code-block:: javascript
    :emphasize-lines: 1

    example.js

    function main() {
        alert("Hello World!");
        return;
    }

Then the best way to load it into the HTML file is like this:

.. code-block:: HTML
    :emphasize-lines: 1

    index.html

    <!doctype html>
    <html>
        <head>
        </head>
        <body>
            <!-- Locally, same directory -->
            <script src="example.js">

            <!-- Different directory from parent directory -->
            <script src="../local/path/to/code/example.js">
        </body>
    </html>

Please note that once the Javascript file is loaded, it will only execute
when you tell it to, whether it be right away (from function calls inside the file)
or in a different script tag, as shown below:

.. code-block:: HTML
    :emphasize-lines: 1

    index.html

    <!doctype html>
    <html>
        <head>
        </head>
        <body>
            <!-- Locally, same directory -->
            <script src="example.js">

            <!-- Now that we have loaded in our 'example.js' we can use its functions. -->
            <!-- Not all '<script>' tags need a 'src' -->
            <!-- Any text between the tags will use JS syntax. HTML  syntax is invalid in here. -->
            <script>
                // Will Alert "Hello World!" as seen in the example.js file.
                main();
            </script>
        </body>
    </html>

Since D3.js is a library, we want to load it in before any of our local code runs.
We can do this by loading it in the header of the HTML, so that it is included when
any of our own Javascript runs in the body:

.. code-block:: HTML
    :emphasize-lines: 1

    index.html

    <!doctype html>
    <html>
        <head>
            <!-- Using the same script tag, but this one gets loaded first. -->
            <script src="https://d3js.org/d3.v5.min.js"></script>
            <!-- Now we can safely use D3 methods in our body. -->
        </head>
        <body>
            <!-- Locally, same directory -->
            <script src="example.js">

            <!-- Now that we have loaded in our 'example.js' we can use its functions. -->
            <!-- Not all '<script>' tags need a 'src' -->
            <!-- Any text between the tags will use JS syntax. HTML  syntax is invalid in here. -->
            <script>
                // Will Alert "Hello World!" as seen in the example.js file.
                main();
            </script>
        </body>
    </html>

Variables In Javascript
-----------------------

Variables in Javascript act similarly to those in Python: they are never typecast to
any specific value. A few examples:

.. code-block:: javascript
  :emphasize-lines: 1

    variables.js

    /* If the variable always needs to be a specific type, it may help to
    name it in a certain way (prefixes or suffixes) to ensure you are always
    playing with the right values. */

    var apple = 1; //int

    var banana = 'Banana';
    var carrot = "Carrot";
    // Note that single quotes or double quotes are valid for strings,
    // so long as you start and end the string with the same ones.

    var durian = true; //boolean

    // Arrays are of one type only.
    var eggplant = []; // Array, uninitialized.
    var rhyme = ["tomato", "potato"];

    // You can however, make multi-dimensional arrays of arrays.
    var multiArray = [["orange", "doorhinge"], rhyme];

As you can see, JS figures out the type of var automatically. This isn't always
helpful, but most of the time it's a nice feature.

Understanding Infinity
----------------------

A few weird equations surrounding infinity will produce the JS value `NaN` (Not a Number.)
This value is falsy.

For example:

* Infinity * 0 == NaN
* Infinity - Infinity == NaN
* Infinity / Infinity == NaN
* (Any number) / Infinity == 0
* (Any nonzero number) / 0 == Infinity
* 0 / 0 == NaN

Reference Variables
-------------------

These are variables that will be reference-only, and will not copy values when set.
True for reference variables of other types like objects, classes, sets, and so on,
but string are not reference vars in Javascript. In these examples, arrays are used
to show referencing.

.. code-block:: javascript
    :emphasize-lines: 1

    references.js

    var arr = [1,2,3,4];
    var b = arr;

    console.log(b[0]); // Logs "1"

    // Change the original, change the reference as well. Be careful of this.
    arr[0] = 5;
    console.log(b[0]); // Logs "5" with no explicit changes to b

    ...

When using `Array.slice() <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/slice>`_
we can make a shallow copy. This prevents us from modifying the original data of the slice()'d array.
We can do similar things manually with classes, objects, etc by looping through all
class variables or key-value pairs.

.. code-block:: javascript
    :emphasize-lines: 1

    references.js

    ...

    var arr = [1,2,3,4];
    var b   = a.slice(); // makes a naive copy, not a reference.

    console.log(b[0]); // Logs "1"

    a[0] = 5;

    console.log(b[0]); // Still logs "1"

    ...

Now we go three layers deep. We put a reference variable inside another array,
and then slice it. The result is as follows:

.. code-block:: javascript
    :emphasize-lines: 1

    references.js

    ...

    var c = [23];
    var a = [c,2,3,4];

    var b = a.slice();

    console.log(b[0]); // Logs "[23]"

    c[0] = 5;

    console.log(b[0]); // Logs "[5]"

You may also create an alias for a non-reference variable. What would you use this for?
We don't know, but here's an example anyways.

.. code-block:: javascript
    :emphasize-lines: 1

    references.js

    var a = 5;
	var b = ( ) => { return a; };
	alert( b( ) ); //results in 5
	a = 10;
	alert( b( ) ); //results in 10


Conditionals in Javascript
--------------------------

IF conditional examples:

.. code-block:: javascript
    :emphasize-lines: 1

    conditional.js

    // singular
    if (true) {
        //stuff
    }

    // if, else
    if (conditionIsTrue) {
        // do stuff
    }
    else {
        // do other stuff
    }

    // if, else if, else
    if (conditionIsTrue) {
        // do stuff
    }
    else if (otherCond) {
        // do other stuff
    }
    else {
        // do OTHER other stuff
    }

There are also ternary statements which are less lines of code but harder to read.

.. code-block:: javascript
    :emphasize-lines: 1

    ternary.js

    // Basically, "?" is the if, ":" is the else.

    var a = (condition) ? (valueIfTrue) : (valueIfFalse);

Conditional Operators
---------------------

Along with the normal <, >, <=, >=, !, &&, || operators JS has two different equivalence operators.

.. code-block:: javascript
    :emphasize-lines: 1

    equivalence.js

    //normal == to check if they have the same value.
    var a = 12;
    if (a == 12){} // Will be true
    if (a == 13){} // false.

    // Now there is also ===, which checks for type and value equivalence.
    // We recommend this when working with classes and you are trying to find one.
    // Remember, it doesn't check each element separately, only its reference for reference variables.
    1 === 1; // will evaluate true as its same type and value.

    var a = [1,2,3];
    var b = [1,2,3];
    a === b; // this will be false because reference addr. is not the same.

    var c = a;
    c === a; // true because they share the same reference addr.

Looping
-------

Pretty common. Go through and do something a certain number of times or
until a value is reached.

.. code-block:: javascript
    :emphasize-lines: 1

    loops.js

    // for loop incremental
    for( var i = 0; i < 10; i++ ) {
    	//do stuff
    }

    // for loop decrement
    for( var i = 10; i > 0; i-- ) {
    	//do stuff
    }

    // for loop get odd numbers
    for( var i = 1; i < 20; i += 2 ) {
    	//do stuff with those odd numbers less than 20
    }

    // for loop different number of variables
    for( var i = 0, j = 20; i < j; i++, j-- ) {
    	//Do stuff with these colliding numbers
    }//Both will be 10 at the end of the loop

    // while: only do this if true
    While( true ) {
    	//Do stuff
    }

    // do while: do this once, and then repeat if true
    Do {
    	//Do stuff
    } while( true );

    // Control Flow the continue
    // A continue will skip the rest current cycle, and start the next cycle
    // Example:
    for( var i = 0; i < 10; i++ ) {
    	If( i % 2 == 0 ) {//Is it not odd?
    		continue;
    	}
    	alert( “odd number” );
    }

    // Control Flow break
    // Need to end a loop cycle in the middle, but don’t start a new cycle?
    // Break it.
    while( true ) {
    	if( user input ) {
    		break;
    	}
    }

    // labeling your loops
    // In a loop with in a loop, and need to get out of both? Well then, give
    // them labels, and break the outer loop with its label.
    labelOne:
    while( true ) {
    	labelTwo:
    	while( true ) {
    		if( user input ) {
    			break labelOne;
    		}
    	}
    }

Functions in Javascript
-----------------------

There are 3 ways to define a function in Javascript. Again, similarly to Python
we do not need to define a return type, and instead of `def` we use `function`.

.. code-block:: javascript
    :emphasize-lines: 1

    functions.js

    //Example 1: Normal Definition
    function fx( parameters ) {
        // do stuff
        return;
    }

    //Example 2: As a var
    var fy = ( parameter ) => {
        // do stuff
    }

    // We may call it as a normal function call:
    fy();

    //Example 3: As a singleton function with parameters:
    var hold = ((parameter) => {
        // do stuff;
        return val;
    })( 5 );

    //Same as calling:
    var hold = fz(5);

Objects in Javascript
---------------------

An object is a set of key-value pairs, used very frequently in JS. It is also
similar to a dict in Python.

.. code-block:: javascript
    :emphasize-lines: 1

    objects.js

    // Create an object and use string to retrieve value.
    var alphabet = {
        "A" : 1,
        "B" : 2,
        "C" : 3
    }

    var thisLetter = alphabet["A"];
    // thisLetter == 1

    var thatLetter = alphabet.B;
    // thatLetter == 2

Often when using Javascript we use the JSON format to send and retrieve data.
A JSON string is generally a valid JS Object and can be used as such.

Classes in Javascript
---------------------

Classes are simply special data structures we can use to store data.

.. code-block:: javascript
    :emphasize-lines: 1

    classes.js

    //Example 1: Class with no input parameters
    class Person {
        constructor() {
            this.name = "Harold";
            this.age  = 65;
        }
    }

    var man = new Person();
    // man.name == "Harold";
    // man.age  == 65;


    //Example 2: Class which takes input parameters
    class Car {
        constructor(type, mileage) {
            this.type = type;
            this.mileage = mileage;
            this.works = true;
            this.wheels = true;
        }
    }

    var type = "Tesla";
    var mileage = 20000;

    var tesla = new Car(type, mileage);

In our project, the main components are all composed of classes that
contain D3 elements and data that we modify to create visuals.

D3 V5 Elements
==============

Here is the `full API reference <https://github.com/d3/d3/blob/master/API.md>`_
to the D3 library. As it's very large however, we'll be linking the important methods directly throughout.

In D3.js, we have the power to select and modify DOM elements directly.
We can use this to modify SVG, Text, and almost any element you can imagine.
This is the trick to making the algorithms run smoothly, as we can quickly change
element attributes every frame.

The main call to D3 will be `d3.select()
<https://github.com/d3/d3-selection/blob/v1.4.0/README.md#select>`_ and using the many types of selectors
provided by the library to very broadly or finely choose elements. We may put these
selection queries into a variable for later modification as well, so we don't
need to call `d3.select()
<https://github.com/d3/d3-selection/blob/v1.4.0/README.md#select>`_ more than once for an object.

In this example, we select the main body of the document and add an SVG element
on top of it. From there, we can change and set the SVG's attributes at any time.

Furthermore, to add new elements to the page, we can take an already existing
element and `.append() <https://github.com/d3/d3-selection/blob/v1.4.0/README.md#selection_append>`_
to it a new html tag.

Finally to modify the attributes and styling of these elements we can use
`.attr() <https://github.com/d3/d3-selection/blob/v1.4.0/README.md#selection_attr>`_ and
`.style() <https://github.com/d3/d3-selection/blob/v1.4.0/README.md#selection_style>`_ respectively.

.. code-block:: javascript
    :emphasize-lines: 1

    d3example.js

    var bodyRef = d3.select("body"); // Overarching container in HTML

    var exampleGFX = bodyRef.append("svg");
    // This is the same as 'd3.select("body").append("svg");
    // Attaches the svg to the body and makes a reference to it.

    // Size-based attributes assume pixels (px) by default,
    // for anything else make the second argument a string.

    // Set width of new SVG to 25px
    exampleGFX.attr("width", 25);

    // Make the height fit the whole height of the container it's in.
    // In this case, the default body is 100% of the window height, so
    // the SVG will also be 100% of the window height.
    exampleGFX.attr("height", "100%");

    // Give the SVG some style.
    exampleGFX.style("border", "1px solid black");
    exampleGFX.style("background-color", "blue");

We can also put everything into one statement. It looks nice to keep it on
multiple lines and use hanging indents. We like to keep our .attr() and .style() inline this way.

.. code-block:: javascript
    :emphasize-lines: 1

    d3example.js

    //Same code as above, as fewer statements.

    var exampleGFX = d3.select("body").append("svg");

    exampleGFX.attr("width", 25)
              .attr("height", "100%")
              .style("border", "1px solid black")
              .style("background-color", "blue");

Other types of elements examples:

.. code-block:: javascript
    :emphasize-lines: 1

    d3example.js

    var exampleGFX = d3.select("body").append("svg");

    exampleGFX.attr("width", 200)
              .attr("height", "100%")
              .style("border", "1px solid black")
              .style("background-color", "blue");

    // Text: Needs font-size, text, and (x,y) coordinates.
    // Let's append it to the svg for now.
    exampleGFX.append("text")
              .attr("x", 20)
              .attr("y", 20)
              .style("text-anchor", "middle")
              .style("font-size", 12)
              .text("Hello!");
    // Note that (x,y) coordinates are almost always relative to the
    // top left of the element's container, in this case the SVG.

    // Rectangle: Needs width, height, and (x,y) coordinates.
    exampleGFX.append("rect")
              .attr("width", 20)
              .attr("height", 20)
              .attr("x", 50)
              .attr("y", 25)
              .style("fill", "red");

    // Path: needs a string of coordinates and a stroke color.
    var coordinates = "M0,0L1,0L0,1";
    // D3 has methods for making paths based on data. We can worry about the
    // specifics of how to construct a path string later.
    exampleGFX.append("path")
              .attr("d", coordinates) // path's "d" attribute is what path it takes.
              .style("fill", "none")
              .style("stroke", "green");

    // Line: needs (x1,y1) and (x2,y2) and a stroke color.
    exampleGFX.append("line")
              .attr("x1", 0)
              .attr("y1", 0)
              .attr("x2", 100)
              .attr("y2", 100)
              .style("fill", "none")
              .style("stroke", "red");

    // Circle: needs radius and center (cx,cy) coordinates.
    exampleGFX.append("circle")
              .attr("r", 10)
              .attr("cx", 10)
              .attr("cy", 90)
              .style("fill", "red");

As you can see, D3 is very powerful for what little we've seen so far.
