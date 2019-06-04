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

D3 Elements
-----------
