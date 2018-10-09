Project History
===============

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
