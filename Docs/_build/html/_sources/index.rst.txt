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

`Face-to-Face, 2 Robots. Algorithm A.
</BotAlgorithms/disk/circleAlgs.html#A>`_.

`Face-to-Face, 2 Robots. Algorithm B.
</BotAlgorithms/disk/circleAlgs.html#B>`_.

`Face-to-Face, 2 Robots. Algorithm C.
</BotAlgorithms/disk/circleAlgs.html#C>`_.

`Wireless, 2 Robots. Algorithm A.
</BotAlgorithms/disk/circleAlgs.html#Awl>`_.

`Wireless, 2 Robots. Algorithm B.
</BotAlgorithms/disk/circleAlgs.html#Bwl>`_.

`Wireless, 2 Robots. Algorithm C.
</BotAlgorithms/disk/circleAlgs.html#Cwl>`_.

`Wireless, 1 Robot + Priority Robot.
</BotAlgorithms/disk/circleAlgs.html#Q1>`_.

`Wireless, 2 Robots + Priority Robot.
</BotAlgorithms/disk/circleAlgs.html#Q2>`_.

`Wireless, 1 Robot + 2 Priority.
</BotAlgorithms/disk/circleAlgs.html#Q2S1>`_.

Triangle
--------
`Wireless, 2 Robots, starting at Center.
</BotAlgorithms/polygon/polygonAlgs.html#3_cStart>`_.

`Wireless, 2 Robots, starting on Wall.
</BotAlgorithms/polygon/polygonAlgs.html#3_wStart>`_.

`Wireless, 2 Robots, starting in Interior with start selection.
</BotAlgorithms/polygon/polygonAlgs.html#3_iStart>`_.

Square
------
`Wireless, 2 Robots, starting at Center.
</BotAlgorithms/polygon/polygonAlgs.html#4_cStart>`_.

`Wireless, 2 Robots, starting on Wall.
</BotAlgorithms/polygon/polygonAlgs.html#4_wStart>`_.

`Wireless, 2 Robots, starting in Interior with start selection.
</BotAlgorithms/polygon/polygonAlgs.html#4_iStart>`_.
