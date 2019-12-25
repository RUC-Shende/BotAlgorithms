.. exit-algorithms-docs documentation master file, created by
   sphinx-quickstart on Thu Aug 16 13:05:37 2018.
   You can adapt this file completely to your liking, but it should at least
   contain the root `toctree` directive.

Welcome to Search and Exit Algorithms documentation!
====================================================

This site covers the documentation of our app.

.. toctree::
   :maxdepth: 2
   :caption: Contents:

   api
   documentation
   references
   detailed-changelog
   project-summary
   guide-js
   guide-ddd

Intro
=====

This research is supported by the National Science Foundation under grant # CCF-AF 1813940 (RUI: Search, Evacuation and Reconfiguration with Coordinated Mobile Agents).

This app was designed to simulate mobile agents, or robots, in an area, searching for an exit along the perimeter of the area.
The goal of this app is to allow users to test out different algorithms by writing their own instructions for the
robots, and try to decrease the lower bound of how long it takes for different numbers of robots to find the exit.

Getting Started
===============

To see the app in action, simply get the project from `Github
<https://github.com/dbushta/BotAlgorithms/>`_.

In version |version| of the app, there are a few types of simulations available for showing wireless and face-to-face communication model algorithms.
See the `changelog <detailed-changelog.html>`_ for a more detailed explanation.


Types of algorithms
===================

These algorithms differ significantly depending upon the number of available robots, the type of communication they utilize,
and the shape of the area the robots are searching. We assume, in these algorithms, that the robots

a. know the algorithms and trajectory of the others at any given time.
b. all move at the same speed, being their maximum speed. (since version 1.0)
c. know how to move about the area and recognize the exit no matter what.

In our app, we provide multiple examples of algorithms `previously stated in other papers <references.html>`_.

Number of robots
----------------
Currently, algorithms exist for 2 robots, 3 robots, and n > 3 robots. For any number greater than 3, the algorithms usually share
many similar steps, so we use these 3 categories to separate the algorithms.

Types of communication
----------------------
There are two ways for the robots to communicate with each other. One way is Face-to-Face, which states that robots can only share new
information (such as exit location and any changed trajectories of other robots) by being next to another, meaning their paths must
intersect for information to be exchanged.

The other form of communication utilized by the robots is wireless. In this wireless communication model, the robots may broadcast
to any other robots in the given area, and it is assumed that the broadcast range is long enough to reach the others no matter the size of the area.

The face-to-face algorithms typically require more steps than the wireless algorithms, and thus we differentiate between the two types.

Shape of the area
-----------------
The shape of the area the robots search plays a factor in what they do as well, for example if the robots are simply searching for an
exit on a 2-dimensional line, they will take some different commands than if they were searching on a 2-dimensional convex shape. It is also assumed
that the shapes are generally convex, and not concave.

Showcases
=========
Currently, the project showcases these algorithms:

Disk
----

Algorithm A: Face-to-Face, 2 Robots.
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

For this algorithm, the robots start by moving towards the perimeter at the same angle. Once the robots reach the perimeter, they go in opposite directions of each other, eg. if robot 1 goes clockwise, then robot 2 goes counter-clockwise. The robots continue to move along the perimeter until one of them finds the exit. Once the exit is found, the robot that found the exit will move to intercept the other's path. When the robots meet at the interception point, they travel directly back to the exit location.

.. figure:: ../resources/intercept.png
    :scale: 50 %
    :align: center

`Face-to-Face, 2 Robots. Algorithm A.
</BotAlgorithms/disk/circleAlgs.html#A>`_.

Algorithm referenced in:

* Jurek Czyzowicz et al. (2014). Evacuating Robots via Unknown Exit in a Disk. Proceedings of DISC 2014, LNCS 8784, pp. 122–136, 2014 
* Jurek Czyzowicz et al. (2015). Evacuating Robots From a Disk Using Face-To-Face Communication. Proceedings of CIAC, 2015 p. 140-152, 2015.

Algorithm B: Face-to-Face, 2 Robots.
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

For this algorithm, it takes two arguments, B(X, Φ).

* X represents the arc length before taking a detour.
* Φ represents the angle to take the detour.

The robots will follow the same steps as algorithm A for a certain distance X. If the robots have traveled the distance X without being notified of the exit, both robots initiate the detour phase at angle Φ relative to the tangent of the circle at that point. If, after the detour phase the exit has not been found, the robots move straight back to the point where the detour was initiated and resume algorithm A. 

.. figure:: ../resources/detour.png
    :scale: 50 %
    :align: center

The advantage of this method is that the detour phase provides a slightly faster evacuation time if the exit is found quickly, allowing the robot who finds the exit to travel less distance to intercept the other if the other is currently in its detour phase. If the exit location is beyond the detour phase point, then the advantages of this algorithm no longer exist.

`Face-to-Face, 2 Robots. Algorithm B.
</BotAlgorithms/disk/circleAlgs.html#B>`_.

Algorithm referenced in:

* Jurek Czyzowicz et al. (2014). Evacuating Robots via Unknown Exit in a Disk. Proceedings of DISC 2014, LNCS 8784, pp. 122–136, 2014 
* Jurek Czyzowicz et al. (2015). Evacuating Robots From a Disk Using Face-To-Face Communication. Proceedings of CIAC, 2015 p. 140-152, 2015.

Algorithm C: Face-to-Face, 2 Robots.
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

For this algorithm, it takes three arguments, C(X, Φ, λ).

* X represents the arc length before taking a detour.
* Φ represents the angle to take the detour.
* λ represents the time the robot is following the detour path at angle Φ, in which afterward the robots head directly for the center.

Initially, the algorithm mimics algorithm A for a set X arch length. If the robots have traveled the distance X without being notified of the exit, both robots initiate the triangular detour phase and move at angle Φ relative to the tangent of the circle at that point for time λ. After time λ, the robot heads for the centerline of the circle and then moves back to the beginning of the triangular detour phase. If, after the triangular detour phase, the exit has not been found, the robots resume algorithm A.

.. figure:: ../resources/tri-detour.png
    :scale: 75 %
    :align: center

If the exit is found quickly, then the triangular detour phase provides a slightly faster evacuation time. In this event, the robot that finds the exit will have to travel less distance to intercept the other if the other is currently in its detour phase. The only time this advantage no longer exists is if the exit position is after the detour phase.

`Face-to-Face, 2 Robots. Algorithm C.
</BotAlgorithms/disk/circleAlgs.html#C>`_.

Algorithm referenced in: 

* Jurek Czyzowicz et al. (2014). Evacuating Robots via Unknown Exit in a Disk. Proceedings of DISC 2014, LNCS 8784, pp. 122–136, 2014 
* Jurek Czyzowicz et al. (2015). Evacuating Robots From a Disk Using Face-To-Face Communication. Proceedings of CIAC, 2015 p. 140-152, 2015.

Wireless - Algorithm A, 2 Robots.
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

For this algorithm, the robots follow the same steps of "Algorithm A: Face-to-Face, 2 Robots" until an exit is found. Once the exit is found by one of the robots, that robot broadcasts its 
location to the other robot who, when the location is received, heads directly to the exit.

`Wireless, 2 Robots. Algorithm A.
</BotAlgorithms/disk/circleAlgs.html#Awl>`_.

Wireless - Algorithm B, 2 Robots.
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

For this algorithm, the robots follow the same steps of "Algorithm B: Face-to-Face, 2 Robots" until an exit is found. Once the exit is found by one of the robots, that robot broadcasts its location to the other robot who, when the location is received, heads directly to the exit.

`Wireless, 2 Robots. Algorithm B.
</BotAlgorithms/disk/circleAlgs.html#Bwl>`_.

Wireless - Algorithm C, 2 Robots.
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

For this algorithm, the robots follow the same steps of "Algorithm C: Face-to-Face, 2 Robots" until an exit is found. Once the exit is found by one of the robots, that robot broadcasts its location to the other robot who, when the location is received, heads directly to the exit.

`Wireless, 2 Robots. Algorithm C.
</BotAlgorithms/disk/circleAlgs.html#Cwl>`_.


Wireless - Priority Robot + 1 additional robot
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

For this algorithm, two arguments are expected to be given, Q(α, β).

* α represents the arc length the priority robot takes before breaking from its path for a detour.
* β represents the angle (α + β) on the unit disk that the priority robot travels to create a chord. Once that point is reached, the priority robot will travel in the opposite direction it was going before detour, going back to the original point of its detour.

The robots start by moving to the perimeter of the disk at the same angle. Once there the helper bot will travel clockwise around the circle until it finds the exit and notifies the priority bot of its location. The priority bot, on the other hand, travels counter-clockwise for time α, at which point it will take a detour and travel to angle (α + β). Once there it will travel clockwise back to where it originally made its detour.

If the exit still was not found the priority bot goes back to traveling counter-clockwise.


`Wireless, 1 Robot + Priority Robot.
</BotAlgorithms/disk/circleAlgs.html#Q1>`_.

Wireless - Priority Robot + 2 additional robots
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

For this algorithm, two arguments are expected to be given, Q(α, p).

* α represents the arc length the priority robot will travel before moving directly across the disk to point p
* p represents the y-value of the point K(α/2, p). 
* K(α/2, p) is the point where the priority bot will diverge and travel toward the angle -α/2 on the disk. 

We will denote the helpers in this algorithm as S1 and S2, and the priority as P.

Initially, S1 and P will go out to the perimeter at angle (π - α), while S2 will go out to the perimeter at angle π. Once the robots get to the perimeter, S1 will travel clockwise until it finds the exit, while S2 will travel counter-clockwise until it finds the exit.

The priority P will travel counter-clockwise for arc length α, at which point it will take its detour. The priority robot will travel to the point K(α/2, p) on the interior of the disk. P will then travel to angle (2π - α/2) on the perimeter and wait until the exit is found.

`Wireless, 2 Robots + Priority Robot.
</BotAlgorithms/disk/circleAlgs.html#Q2>`_.

Wireless -  Priority Robot + 4 additional robots
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

For this algorithm, two helpers will travel to the perimeter at angle 0. They will 1.309 radians around the perimeter in opposite directions towards angle pi, searching until they've reached the starting point of the next helper.

The two remaining helpers will travel to the perimeter at 1.309 radians and 4.974 radians respectively. Once they've reached the perimeter they'll begin to travel in opposite directions toward angle pi, searching until an exit is found.

The priority robot will wait at the center (0, 0) for 1 + pi/2 time. Afterward, the priority will travel to the perimeter at angle pi. It then waits at that point (-pi, 0) until the exit is found.

`Wireless, 4 Robots + Priority Robot.
</BotAlgorithms/disk/circleAlgs.html#Q1S4>`_.

Wireless - Priority Robot + 8 additional robots
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

For this algorithm, two helpers will travel to the perimeter at angle zero. They will each travel pi/3 radians around the perimeter in opposite directions towards angle pi, searching until they've reached the starting point of the next helper.

The next two helpers will travel to the perimeter at pi/3 radians and 5pi/3 radians respectively. Once they've reached the perimeter though begin to travel in opposite directions towards angle pi, searching until the exit is found.

The next two helpers will travel to the perimeter at pi/2 radians and 3pi/2 radians respectively. Once they've reached the perimeter though begin to travel in opposite directions towards angle pi, searching until the exit is found.

The last two helpers will travel to the perimeter at 2pi/3 radians and 4pi/3 radians respectively. Once they've reached the perimeter though begin to travel in opposite directions towards angle pi, searching until the exit is found.

The priority robot will wait at the center (0, 0) for 1 + pi/2 time. Afterward, the priority robot will travel to perimeter pi. It then waits at the point (-pi, 0) until the exit is found.

`Wireless, 8 Robots + Priority Robot.
</BotAlgorithms/disk/circleAlgs.html#Q1S8>`_.


Wireless - 2 Priority Robots + 1 additional robot
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

For this algorithm, we designate two of the robots as priority robots and only one as a helper. The algorithm terminates when at least one of the priority robots find the exit. The algorithm takes one argument, Q(α).

* α represents the angle at which one helper and one priority robot will travel toward the perimeter. We will denote the helper as S, and the two priority robots as P1 and P2.

The robots S and P1 will travel to the perimeter at angle α, while P2 travels to the perimeter at angle zero. Once S and P1 reached the perimeter P1 travels counterclockwise until it finds the exit. P2 will also travel counterclockwise until it finds the exit while S travels clockwise.

This algorithm has an upper bound of 3.55 time units for angle α = 14π/9 - 2√3/3. The two worst cases for the exit location in this algorithm are 2π - θ for some very small θ, or π - ((6√3 - 2)/9).

`Wireless, 1 Robot + 2 Priority.
</BotAlgorithms/disk/circleAlgs.html#Q2S1>`_.

Triangle
--------

Wireless - 2 Robots, starting at Center
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
For this algorithm, one argument is expected Q(α). 

* α represents the angle in which the robots will move to the perimeter. 

Initially, both robots will approach the perimeter at angle α. Once they've reached the perimeter, they will traverse the triangle in opposite directions. 

`Wireless, 2 Robots, starting at Center.
</BotAlgorithms/polygon/polygonAlgs.html#3_cStart>`_.

Wireless - 2 Robots, starting on Wall
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

* Algorithm description coming soon

`Wireless, 2 Robots, starting on Wall.
</BotAlgorithms/polygon/polygonAlgs.html#3_wStart>`_.

Wireless - 2 Robots, starting in Interior with start selection
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

* Algorithm description coming soon

`Wireless, 2 Robots, starting in Interior with start selection.
</BotAlgorithms/polygon/polygonAlgs.html#3_iStart>`_.

Square
------

Wireless - 2 Robots, starting at Center
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

* Algorithm description coming soon

`Wireless, 2 Robots, starting at Center.
</BotAlgorithms/polygon/polygonAlgs.html#4_cStart>`_.

Wireless - 2 Robots, starting on Wall
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

* Algorithm description coming soon

`Wireless, 2 Robots, starting on Wall.
</BotAlgorithms/polygon/polygonAlgs.html#4_wStart>`_.

Wireless - 2 Robots, starting in Interior with start selection
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

* Algorithm description coming soon

`Wireless, 2 Robots, starting in Interior with start selection.
</BotAlgorithms/polygon/polygonAlgs.html#4_iStart>`_.
