Search and Exit Tourist API
===========================

.. js:autoclass:: tourist.Tourist(iclData, p)
   :members:

Currently, the project supports the following instructions for robots (class: Tourist). Arguments in [square-brackets] are optional,
as denoted in the description.

GoToWallAtAngle (angle)
-----------------------

.. js:autofunction:: tourist.Tourist#GoToWallAtAngle

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

.. js:autofunction:: tourist.Tourist#FollowWall

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

.. js:autofunction:: tourist.Tourist#Wait


The robot will wait indefinitely at the point it is currently at unless a time argument is specified.
Commonly used once the queen has finished its trajectory, and is waiting for the servants to find the exit.

WaitAverage () {Wireless specific}
----------------------------------

.. js:autofunction:: tourist.Tourist#WaitAverage


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

.. js:autofunction:: tourist.Tourist#GoToPoint

The robot will go to a specified point on the current (x, y) plane.

Intercept () {Face-to-Face specific}
-----------------------------------------------

.. js:autofunction:: tourist.Tourist#Intercept

If the exit is found, or the robot needs to go to another at the point in time, it may calculate the robot's
trajectory and then calculate a path for itself to directly intercept the robot at the earliest time possible.
This is most commonly used in the face-to-face algorithms' exit protocols::

    (Multi-Robot Instructions)

        1. Search Algorithm....


    (Multi-Robot Exit Protocol)

        1. Intercept  # *see below*

\*Upon finding the exit, the robot will find all of the closest robots to itself and intercept their paths,
exchanging information about the exit and updated trajectories of other robots, until there are no required exiting robots left.
