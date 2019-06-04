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
   references
   detailed-changelog
   project-summary
   guide

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

In version 1.1 of the app, there are a few types of simulations available for showing 2 Robot Face-to-Face communication model algorithms.
The ICL reader in v1.1 uses ICLReader V24's Framework.


Types of algorithms
===================

These algorithms differ significantly depending upon the number of available robots, the type of communication they utilize,
and the shape of the area the robots are searching. We assume, in these algorithms, that the robots

a. know the algorithms and trajectory of the others at any given time.
b. all move at the same speed, being their maximum speed. (Version 1.0)
c. know how to move about the area and recognize the exit no matter what.

In our app, we provide multiple examples of algorithms previously stated in other papers, and allow users to create their own using these
variables.

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

`Face-to-Face, 2 Robots. Algorithms A, B, and C.
</BotAlgorithms/disk/circleShowcase.html>`_.

`Wireless, 2 Robots. Algorithms A, B, and C.
</BotAlgorithms/disk/circleShowcase.html#A>`_.

`Wireless, 1 Robot + Priority Robot.
</BotAlgorithms/disk/circleShowcase.html#Q1>`_.

`Wireless, 2 Robots + Priority Robot.
</BotAlgorithms/disk/circleShowcase.html#Q2>`_.

`Wireless, 1 Robot + 2 Priority.
</BotAlgorithms/disk/circleShowcase.html#Q2S1>`_.
