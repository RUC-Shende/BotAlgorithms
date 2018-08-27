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

   filenamehere
   for an extra page

Intro
=====

This app was designed to simulate mobile agents, or robots, in an area, searching for an exit along the perimeter of the area.
The goal of this app is to allow users to test out different algorithms by writing their own instructions for the
robots, and try to decrease the lower bound of how long it takes for different numbers of robots to find the exit.

Getting Started
===============

To see the app in action, simply get the project from `Github
<https://github.com/dbushta/BotAlgorithms/>`_.

In version 1.0 of the app, there are a few types of simulations available for showing 2 Robot Face-to-Face communication model algorithms.

Types of algorithms
===================

These algorithms differ significantly depending upon the number of available robots, the type of communication they utilize,
and the shape of the area the robots are searching. We assume, in these algorithms, that the robots

a. know the algorithms and trajectory of the others at any given time.
b. all move at the same speed, being their maximum speed.
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

`Face-to-Face, 2 Robots
</disk/f2f/f2fshowcase.html>`_.

API
===

Currently, the project supports the following instructions for robots. Arguments in [square-brackets] are optional,
as denoted in the description.

GoToWallAtAngle (x)
-------------------
The robot will go to the perimeter of the shape at the given angle on the unit shape.
Most commonly used for deployment phase, for example, Algorithm A (n=2, Face-to-Face)::

    (R1 Instructions)

        1. GoToWallAtAngle 30  # 30 degrees on the unit shape.
        2. FollowWall left


    (R2 Instructions)

        1. GoToWallAtAngle 210  # 210 degrees on the unit shape.
        2. FollowWall right

The default (no argument) will cause the robot to choose a random angle to go out at.

FollowWall (direction, [time/angle])
--------------------------------------
The robot will search for the exit along the perimeter of the shape in the specified
direction. [Optional: time/angle to travel for, no argument will result in indefinitely until it is notified of the exit.]
Most commonly used for the search phase, or pre/post-detour phase::

    (Servant Instructions)

        1. GoToWallAtAngle 180
        2. FollowWall right  # Indefinitely search in the clockwise direction.


    (Queen Instructions)

        1. GoToWallAtAngle 180
        2. FollowWall left 120  # Search in the counter-clockwise direction for 120 degrees.
        3. GoToWallAtAngle 350
        4. FollowWall right     # Indefinitely search in the clockwise direction.

Note: left and right are relative to counter-clockwise and clockwise respectively.

Wait ([time])
-------------
The robot will wait indefinitely at the point it is currently at unless a time argument is specified.
Commonly used once the queen has finished its trajectory, and is waiting for the servants to find the exit.

WaitAverage () {Wireless specific}
----------------------------------
The robot will wait at the average position of all the other robots. This usually involves the other robots
doing the search, and the one who is to WaitAverage will simply be ready for a broadcast of an exit location.

Broadcast () {Wireless specific}
--------------------------------
If the exit is found, the robot will wirelessly broadcast its location to all other robots that need to exit.
Currently only available as a command for a robot's exit protocol::

    (Multi-Robot Instructions)

        1. Search Algorithm....


    (Multi-Robot Exit Protocol) {wireless}

        1. Broadcast  # Broadcasts the exit location to all available robots and subsequently
        2. GoToExit   # exits the room.

The robots that receive the broadcast immediately abandon their instructions and follow exit protocol.

Note: in instances where there is a priority evacuation, such as a queen, only the queen is *required*
by the program to be able to receive the broadcasts.


GoToPoint (x, y)
----------------
The robot will go to a specified point on the current (x, y) plane.

InterceptNonBeliever () {Face-to-Face specific}
-----------------------------------------------
If the exit is found, or the robot needs to go to another at the point in time, it may calculate the robot's
trajectory and then calculate a path for itself to directly intercept the robot at the earliest time possible.
This is most commonly used in the face-to-face algorithms' exit protocols::

    (Multi-Robot Instructions)

        1. Search Algorithm....


    (Multi-Robot Exit Protocol)

        1. InterceptNonBeliever  # *see below*

\*Upon finding the exit, the robot will find all of the closest robots to itself and intercept their paths,
exchanging information about the exit and updated trajectories of other robots, until there are no required exiting robots left.

PursueNonBeliever ()
--------------------
The robot will take a straight line path to the closest available robot until it catches it.
