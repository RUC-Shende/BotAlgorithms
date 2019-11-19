Search-and-Exit Tourist and Superclass Method Documentation
===========================================================

This document aims to explain the methods and functions used in
the superclass (``iclData`` and ``iclVisual`` classes) as well as some non-API functions found in
the ``Tourist`` class. As of version 3.0, we have introduced the modules system which allows for
easy addition and substraction of features from the base ``iclData`` class.

The Tourist
===========

A tourist in this case is the same exact thing as saying a 'robot' or 'mobile agent'. It's
just a name we've had for the little circles in the sim since the beginning.

.. js:autoclass:: touristmodule.Tourist(iclData, x, y, num, icl, p)
    :members:

Reliable and Byzantine Tourist Extensions
-----------------------------------------
These class extensions add the concept of reliablity to the tourist class along with a voting
system to assist tourists to pin-point byzantine bots.

Modified R&B Tourist class
--------------------------
Everything is included from original tourist class. The following are added variables.

.. js:autoclass:: tourist1d.Tourist
    :members: groundCovered, byz, attendance, voted, claimInput

Reliable Tourist
----------------
.. js:autoclass:: tourist1d.ReliableTourist(iclData, x, y, num, icl)
    :members:

Byzantine Tourist
-----------------
.. js:autoclass:: tourist1d.ByzantineTourist(iclData, x, y, num, icl)
    :members:

Vote System
-----------
.. js:autoclass:: linemodules.voteSystem
    :members: Init

Other API methods are defined in `the API section of these docs <api.html>`_, so this
will just be going over the methods behind the API.

Direct Tourist to its Next Destination
--------------------------------------

.. js:autofunction:: touristmodule.Tourist#DirectTo

ICLData
=======

This is a data structure that we use to maintain positions of Tourists and
other relevant data when running the sim.
We tried to keep it as removed from visuals as possible, data-only.
ICLVisual uses this a lot when running the actual simulation.

.. js:autoclass:: modules.iclData(id, instruBinder, algorithmName, angle, wireless, path, start)
    :members:

The ID given on creation is a nice way to ensure we are not mucking about in the data
of another instance of iclData when using ``superlist[controllerID]`` during comparisons.

ICLVisual
=========

This is the data structure which maintains all the visuals and updates the graphics
on each frame. It does a mixture of modifying data in its own iclData member variable,
and updating graphics based on them.

.. js:autoclass:: modules.iclVisual(iclData, field, graph)
    :members:

Modules
=======

These modules are generally required to make the visualizer do anything other than just go for
10 seconds and stop, but other modules can be added to add more visualizers or track data in a different way.
Modules must always have an instance of iclData sent in to be able to see anything.

Creating a module: Arguments
----------------------------

The only requirement of a module is the use of an instance of ``iclData``.
Anything else you could like to include at the time of module creation is up to you.
Because ``iclData`` instances generally don't have access to ANY visuals, it can be handy to
pass in d3 references to the SVGs you would like to visually initialize and update. More on this later.


Creating a module: Init and Update
----------------------------------

By including these functions in your module, they will run at the time that the data is calculated.
``Init()`` runs once and thus is used for initializing important class vars etc.
``Update()`` runs once every frame, AFTER the tourists' positions have been updated and all iclData
attributes have been updated. Basically, every frame will contain new lateUpdate style data.

There is nothing needed to set these up, just create a ``Init()`` and ``Update()`` function in your
module and they will run as scheduled.

Creating a module: VInit, VUpdate, and VReset
---------------------------------------------

To show visuals based on data calculated in your module, you need a VInit and VUpdate.
Having these functions in your module will allow the ``iclVisual.reEnact`` function to call them
at similar times to when ``Init`` and ``Update`` were called. The difference between these
two types of functions is that when running visual updates, no new data is being calculated by
``iclData``.

There is nothing needed to set these up, just create a ``VInit()`` and ``VUpdate()`` function in your
module and they will run as scheduled.

It has been helpful thus far to give the module a ``VReset`` function and call it at the beginning of
``VInit()`` to get rid of all old d3 elements. This is not required.


ExitFindMod
-----------

ExitFindMod allows for the placement of an exit. The caveat is that ``iclData.createHistory()``
must always be run TWICE when this mod is active, in order to create the "pre-history" and the
"real history." The old history will be kept in ExitFindMod.premo and never usually visualized.

.. js:autoclass:: modules.exitFindMod(iclData, exit, field, graph)
    :members:


LineFillMod
-----------

LineFillMod is interesting in that it keeps track of the number of points searched. Once all points on a
path have been searched, ``lineFillMod.count`` will be 0, and the ``lineFillmod.pts`` array will be empty.
As it proved to be useful for calculating things such as total exit time if exit had been found at a certain point,
it has been modified from its original to also keep track of this. For all points searched,
``lineFillMod.exitTimes`` keeps track of the time it takes an algorithm to terminate based on the conditions.
This doesn't yet work in face-to-face algorithms, but it calculates the distance of robots from the exit keeping
priority status in mind to attempt to determine a worst-case exit placement and termination time.

.. js:autoclass:: modules.lineFillMod(iclData, exitEnvelopeGraph)
    :members:

Other Useful Functions
======================
Defined by the ``utils`` class, these are a set of static functions designed to be
accessed from anywhere and used to calculate common things.

.. js:autofunction:: modules.utils.wallAtAngle
.. js:autofunction:: modules.utils.genPoly
.. js:autofunction:: modules.utils.distance
.. js:autofunction:: modules.utils.midpoint
.. js:autofunction:: modules.utils.cmpXYPairs
.. js:autofunction:: modules.utils.AddAround
.. js:autofunction:: modules.utils.WhereLineSegsCross
