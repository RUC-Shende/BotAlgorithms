Project History
===============

10/05/18 (Most Recent)
----------------------

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
