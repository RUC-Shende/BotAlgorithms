Project History
===============

06/21/19: Version 2.0 Released
------------------------------

As of this update, we have implemented a completely new version of the algorithm visualizer.
The reason for this is that we wanted to be able to see comparisons of more than one
algorithm side by side in the same window, and the number of global variables that one
instance of a simulation relied on was too great. We have since split the visualizer
into 3 modules: `iclData <documentation.html#icldata>`_, `iclVisual <documentation.html#iclvisual>`_,
and `Tourist <documentation.html#the-tourist>`_.

By splitting these into classes, we can reduce the number of global variables used as well
as allow for comparisons to be shown. We also created a landing page for the app
that shows the different number of shapes, followed by a list of all available algorithms on
the next page. The algorithms are selected by the shortname in the URL when the ``diskalgs.html``
page is loaded.

Version 2.0 onward adds a reworked version of the visualizer on the diskAlgs page.
Version 2.0.2 adds the time slider, working time/frame text.

03/05/19: Circle Showcase
-------------------------

In this update of Circle Showcase we have added a few smaller features.

One of the additions to our priority algorithm section was a graph that shows the distance of either one or both priority robots from the servant robot
at any given time. In adding this graph we now have a general idea of what the finishing time would be depending on where the servant robot finds the exit.
We have been able to use this data to prove that our newest algorithm, 2 priority 1 servant (1) would have a finishing time of 3.55 time units.


01/07/19: Circle Showcase
-------------------------

We have made many major and minor improvements to the Circle Showcase in this update.

In terms of bigger improvements and bug fixes, one of the more notable ones was making it so that the graph shown on the right scales to be in proportion with the whole viewport when the algorithm is finished.
Doing this meant removing the lines left over from the rest of the algorithm (when the algorithm went for a full ten seconds.) We only do this once the algorithm has finished because when it is running, it
is doing a live simulation of the algorithm with the given exit, so we do not know until the end how big we should make it.

Another leftover from running a pre-simulation was removed in this update as well. Previously, when an algorithm was freshly selected we would run it with no exit anywhere on the circle, to set up all of our necessary
variables, ensure it was working, etc. Now, the lines from pre-loading are no longer drawn as they were not necessary and made following the graph and animation harder.

Some of the minor improvements and fixes are as follows: added a way to determine priority (queen) in instruBinder, made algorithm names clearly stated in multiple places, reorganized the layout of the sidebar,
removed the selection tabs, added a footer with links to documentation, and added a legend with priority (queen) indicator.

Next will be more improvements to the documentation and GraphComparison module.

11/06/18
--------

After improving it a bit more, the basics of Line searching have been implemented, and the `Tourist1D` class has been created. `Tourist1D` is a simplified version of `Tourist` seen in the circle algorithms.
With this update, the `Tourist1D` can now find the exit based on the exit position given by `GLOBAL_EXIT`. With the addition of `GLOBAL_EXIT`, a few more global vars were needed, so we added `SCALE`, `EXIT`,
and `GLOBAL_CENTER`. Our `EXIT` is defined using a number line value, usually an integer, and used with `GLOBAL_CENTER` and `SCALE` to calculate our `GLOBAL_EXIT` with the formula: `GLOBAL_CENTER + (EXIT * SCALE)`.

In the next update, we will improve scaling the line as a `Tourist1D` moves off screen and getting the relative position of the `Tourist1D` as it goes to bigger values.

11/02/18
--------

[EDIT]

We implemented priority search exiting, with the priority robot being given instructions to simply Wait after finding the exit.
We also added a visual to let the user know that the priority robot has found the exit. We also implemented in Intercept, a condition for which bots will only target the priority
robot upon finding the exit. Since the priority robot is usually closest to an exit at a given time, it is the most likely choice for the exit-finder to target first, but as such
the priority will not target closer robots but instead move directly to the exit, leaving the servant to head for the other evacuees.

Even though the goal is to evacuate the priority robot and end the algorithm, we show all robots finding the exit in CircleShowcase. It is simpler in the case of this showcase to
show all robots exiting, because with 2 and 3 robots, the predicted trajectories of the robots are about the same as they are without a priority robot.

10/29/18
--------

The past week and a half have been small changes. We added the `Tourist1D` class to simulate actions on a one dimensional plane.
When creating this class, we knew that it needed a few functions such as `GoLeft`, `GoRight`, and `Wait` at the very least.
Implementing these was as simple as calculating the distance the bot needs to travel each from and then adding that to its data buffer.
Once we have loaded all of the commands, we run the simulation.

The time delta for a bot to travel the correct distance (1 unit/sec) is calculated by `delta = (distance / 60) * (scale / distance) * velocity`,
where `scale` is essentially the unit/pixel ratio and `velocity` is the robot's current speed. In implementing this movement, we thought that perhaps
calculating the time delta once at the start would work, but we still have to modify it at each step of the movement process, to keep the line and robots on the
screen relatively close to 0. We will implement a system to check if the bot will go off of the line, and adjust the scaling of the line markers and distance traveled
appropriately.

10/17/18: iclData and iclVisual 95% Complete! We have Graph Comparison!
-----------------------------------------------------------------------

In this update, we finished the `iclVisual` class, and worked out how to have two graphs on the screen and running at the same time. This was important to the project as being able to compare different
algorithms in an algorithm visualizer is critical to seeing which one performs faster under certain conditions. As of this update, users can now switch between Graph View and Animation View,
select different algorithms using the drop down menu above each respective animation, and use three functions: play, rewind, and slow both of the algorithms down at the same time.

The biggest part of getting the `iclVisual` to work was creating the class in such a way that it calls on its corresponding `iclData` instance for everything. `iclVisual` is making no edits to the way the algorithm
would normally run, simply emulating it on the screen. We decided in the end to use a few functions outside of either class, to make the process of things like setting the update interval and changing the HTML around.
One of the glitches we came across during the process of implementing algorithm selection, was that even though the instance of `iclVisual` was being cleared properly in javascript, the paths and circles that represented the
bots in HTML were not being deleted. This was because they were embedded in the HTML and were not being removed even through the variables they used to create the paths were gone.
This was solved by simply calling `d3.remove()` on all of the offending paths and circles (as d3 elements) when the algorithm got reset and before a new iclVisual instance was generated. Having fewer window variables proved to
make things easier in terms of being able to show more than one graph at once, but resulted in a lot more code; we had to change many variable names from ones that were once global to instance variables using `this`.

As of now, there is very little styling on the page, but this will change next week.


10/12/18
--------

We began working on a superclass this week, to be able to create multiple instances of a simulation with different instructions and be able to compare them.
This stems from the `iclData` class, which will now contain just the data of a singular run at a time. This means we can now compare data points of different
instruction lists and puts us one step closer to visually comparing more than one algorithm. We are also in the process of creating an `iclVisual` class
to produce the visuals for each instance. For now, we have successfully gotten a static visual of a completed run to show. We are working on making the play and pause
buttons work, as once the algorithm loads inside an instance of `icldata`, all we need to do is play it back by editing the visuals and we have a working set of objects
we can use to see multiple graphs at once.

The reason we had to turn to a superclass is that many of our original variables were global and being used in one run of ICLReader at a time, so if we wanted to create a second
simulation on screen we would have to make completely new and different global variables for all of the data such as `tourists`, `graphDots`, etc. This was most easily solved by
just making a class to generate the data and sending it to one that produced the visuals separately. In doing this, we also separated the necessary graphical components from
necessary data components and we have the ability to use this data for anything now, separately from our visuals. If we wanted to we might be able to create an offline version
of each of the graphs by plotting the points using PyPlotLib. Of course, one of the other great benefits of moving these things into their own classes is that we free up the already cluttered `window`
in Javascript by removing all of these global variables. Lesson learned, do not overuse and rely on too many globals, as it does not make things easy as the project expands.

Firing Events Before Data is Ready (10/08/18)
---------------------------------------------

Tonight, while testing more .icl files, I noticed an error: the number of robots specified in the file did not match the number that went through the algorithm.
For example, I loaded in an algorithm that should have contained 4 robots; instead, only 2 showed up when I started the program. It seemed that the instruBinder was not being properly updated before the function Reset() was
called, but at some point in the process (after the invisible load and before the exitChosen event) the instruBinder would update and everything would work as intended, minus the already known glitch where the previous tour and graph lines
would stay the same. Somewhere, the instruBinder stayed the same because a certain function would not update it in time for Start, Reset, and Load to count the number of tourists, so they just used the last known insturBinder to do so.
The problem was within LoadAlgorithms. To load the *new* instruBinder, we had to call `fileReader.readAsText(file);` on the loaded icl file, but after that singleton function (defined above the call) fired, Reset() was being called too quickly for
the new instruBinder to be in effect. This is how it looked before the change:

.. code-block:: javascript

    function LoadAlgorithms(event) {
        var fileReader = new FileReader();
        fileReader.onload = (function(file){
            for (i=0;i<numBots;i++) {
                // parse commands and arguments...
            }
            // here instruBinder is assigned and properly constructed!
        });
        fileReader.readAsText(file); // HERE IS THE PROBLEM!!
        Reset();

    }


Most of the function is standard Javascript file loading, but the one thing I did not account for was the fact that for some reason, Javascript would run through the entirety of LoadAlgorithms, and by the time it was DONE, only then would instruBinder
be properly constructed. More importantly, Reset was being called before the fileReader was finished constructing instruBinder, so we were using the old one to Start, Load, etc, and by the time that was all said and done our global instruBinder
was ready for the visual run through. The solution to my problem seemed to show itself when I realized that if `fileReader.readAsText(file);` was taking too long, then the easiest thing to do would be to not call Reset until we were good and ready.
And that meant moving Reset INSIDE the singleton function we defined for `onload`. This fix, albeit a simple one, was hard to notice because I did not yet know just how quickly Javascript went when executing the code.
Not only did this fix the problem of not seeing as many robots as we would have liked, it also provided a correct instruBinder for both the visual, and invisible loads, so the correct and expected path was shown upon loading the algorithm!

The final code simply instroduced Reset into the singleton function and removed it from the outer part of the function.

.. code-block:: javascript

    function LoadAlgorithms(event) {
        var fileReader = new FileReader();
        fileReader.onload = (function(file){
            for (i=0;i<numBots;i++) {
                // parse commands and arguments...
            }
            // here instruBinder is assigned and properly constructed!
            // we check that everything is okay, close the menu
            Reset();
        });
        fileReader.readAsText(file);
    }




10/05/18
--------

In this update, we introduced Circle Showcase v1.0 as a way to show all of the algorithms we have studied to date in action.
This update includes new algorithms in the circle showcase, Priority Evacuation 1 and Priority Evacuation 2. Previously, these were described as Queen algorithms, but as of recently we have
classified these as 'Priority' (10/03/18). We also introduced the ability to load a file in \*.icl format, created by our command generator. Currently, these files assume face-to-face communication
and are not perfected in their display yet, but they run fine.

The holdup we were dealing with in getting the ICL file reader to work had to do with the GoOutAtAngle function, so as we are investigating the cause of why this glitches the emulation,
we will use GoToWallAtAngle in its place. For reference, both angles have approximately the same functionality, but the former was supposed to be used as a way for the robots to start from the center.

Our current goals are: distinguishing priority robots and modifying the command algorithms to accomadate this, generating animations of the app in action to be shown on this documentation website, and
a feature to compare two algorithms on the same page. We also plan to make a FAQ section of this documentation website.

09/12/18
--------

In this update, we introduced the Face-to-Face showcase, featuring algorithms A, B, and C. These algorithms each consist of 2 robots searching for an exit with face-to-face (f2f) communication only.
To supplement this, we added short descriptions of each of the algorithms and provided images showing the logic behind having the robots take detours. We also show examples of what interception means
when the robots are using f2f communication. The f2f showcase had been added earlier, but it was mainly for testing and there were not yet descriptions of the algorithms that were clear.

When writing the algorithm descriptions, originally we wanted to include all of the steps for each algorithm, but decided against it as for algorithms B and C, the first steps are exactly that of
algorithm A. So, in the description of algorithm B and C, only the pertinent information and changes to the algorithm from the model of A are shown. This drastically reduced the space taken up by the descriptions
and allowed for a cleaner UI.

As well as reducing text, we also added a menu on the side that could be used for loading different algorithms and loading in \*.icl files. This allowed for quick switches between algorithms, and will be useful in the
future. The menu functions similarly to the hamburger menu seen in recent Android versions, where clicking the menu will slide a drawer of options out onto the screen, and the user can quickly pick an option and get back to looking at the algorithm
once they choose their options.
