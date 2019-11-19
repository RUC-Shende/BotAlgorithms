Guide to Using D3 V5
====================

Here is the `full API reference <https://github.com/d3/d3/blob/master/API.md>`_
to the D3 V5 library. As it's very large however, we'll be linking the important methods directly throughout.

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

Selection with D3
-----------------

We can do a lot more than just `select()
<https://github.com/d3/d3-selection/blob/v1.4.0/README.md#select>`_ the body of
the DOM in D3, because otherwise our code statements would be super long, and ugly looking.
We are also able to select elements by class, ID, and tag name. Some examples:

.. code-block:: javascript
    :emphasize-lines: 1

    selection.js

    var body = d3.select("body");
    // So we've seen this one, and we can chain selections off of it.

    // Say we want to append and then select a circle with an ID of "dot".
    // Assume we've already created the SVG as shown in the above example.
    body.select("svg").append("circle")
                      .attr("cx", 10)
                      .attr("cy", 10)
                      .attr("r" , 5)
                      .attr("id" "dot"); // Now this circle has an id of "#dot" in the DOM.

    // Now we can select it by saying:
    var ourCircle = d3.select("#dot"); // The '#' is specific to searching for an ID.

    // Similarly, we can give something a class and find it, or multiple like it.
    body.select("svg").append("rect")
                      .attr("x", 50)
                      .attr("y", 50)
                      .attr("width", 10)
                      .attr("height", 10)
                      .attr("class", "square"); // This will belong to ".square"

    var ourSquare = d3.select(".square"); // The '.' is specific to searching for a class.

Note that when using d3.select(), only the first element on the page that matches the
search query will be returned. However, if we want to `selectAll()
<https://github.com/d3/d3-selection/blob/v1.4.0/README.md#selectAll>`_, then we can
get a nice list of all elements on the page that match the selectors.

.. code-block:: javascript
    :emphasize-lines: 1

    selection.js

    body.select("svg").append("rect")
                      .attr("x", 100)
                      .attr("y", 100)
                      .attr("width", 20)
                      .attr("height", 20)
                      .attr("class", "square");

    // Say we have everything from the example directly above already loaded in.
    // We now go ahead and add another <rect class="square"/>

    d3.selectAll(".square");
    // Returns an array of both of the objects in class square, in the order they
    // were added to the DOM.

Data, and How D3 Handles the Work For You
-----------------------------------------

Arrays have `data that we want to use <https://github.com/d3/d3-selection/blob/v1.4.0/README.md#selection_data>`_, and D3 can make it look pretty for us.
Say we have the following elements already in our project, as well as an array of
points in [x,y] format:

.. code-block:: javascript
    :emphasize-lines: 1

    datum.js

    var bodySVG = d3.select("body").append("svg")
                    .attr("height", 200)
                    .attr("width", 200);

    var dataPoints = [[5,5], [195,5], [195, 195], [5, 195], [100, 100]];

    // We can directly hand this data to the D3 Element and tell it to utilize
    // it when drawing these points.

    bodySVG.data(dataPoints);

    // Side note: if you want the element to hold data, but not use it directly,
    // you can say:
    // bodySVG.datum(dataPoints);

    var circles = bodySVG.selectAll("circle").enter().append("circle");
    circles.attr("r", 5)
           .attr("cx", function (d) {return d[0]})
           .attr("cy", function (d) {return d[1]})
           .style("fill", "red");

In the above example, using the `enter <https://github.com/d3/d3-selection/blob/v1.4.0/README.md#selection_enter>`_ function applied each of the dataPoints
contained in ``bodySVG`` onto a new circle that had been created by ``append``, and returned the array of newly created circles with selectAll.

The reason that ``selectAll`` was called last in this situation, is because ``enter`` takes precedence.
Think of it as "entering" into the node, applying some data to some new elements, and then exiting and calling the selectAll.
Thus, we can get an accurate list of circles before ever techincally creating them.

In the second statement, we used an anonymous function to apply the data to each circle.
When using this anon function, D3 likes us to use the variable ``d`` to represent the current data point.

Elements and their functions, doing more with data
--------------------------------------------------

Lets take a look at some functions that have similar uses, but are from
different sources. Say we have our circles and ``bodySVG`` from above.

.. code-block:: javascript
    :emphasize-lines: 1

    var a = [1,2,3,4,5];
    // forEach is a Javascript builtin function for use on iterables.
    a.forEach(function (d, i) {
        console.log("Index " + i + " contains data " + d);
    })
    // By utilizing an anon function with arguments d,i
    // we can see the index as well as element in the list
    // while iterating through a forEach call.

    // now we look at a D3 function, each().
    // this is meant to be used with lists of elements, like selectAll will give.

    bodySVG.selectAll("circle").each(function (d,i) {
        console.log(this); // will log the D3 instance of the shape.
        d3.select(this).style("stroke", "cyan");
    })

As ``forEach``, D3 has the `each() <https://github.com/d3/d3-selection/blob/v1.4.0/README.md#selection_each>`_
function, which will iterate through a list of D3 elements. Important to note as well,
is that during a function defined in ``each``, the current reference to ``this`` is the
DOM reference to the current element in the list, making it available to be ``d3.select``ed.

If, for some reason, we want to call an anonymous function on a particular element, D3 lets
us do that as well. Using the `call() <https://github.com/d3/d3-selection/blob/v1.4.0/README.md#selection_call>`_
function on a ``d3.select``ed element will let us define an anonymous function to be called.
Notably different than ``each`` however, the reference of ``this`` is not a reference to any element during this fucntion call.
A reference to an element may be passed in like so:

.. code-block:: javascript
    :emphasize-lines: 1

    bodySVG.append("circle").call( function (d) { // d becomes the reference to the newly appended object.
        console.log(d);
        d3.select(d).style("fill", "green"); // So, if we want to utilize d, we must again select it before use.

    });
