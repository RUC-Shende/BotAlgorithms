Search-and-Exit Tourist and Superclass Method Documentation
===========================================================

This document aims to explain the methods and functions used in
the superclass (``iclData`` and ``iclVisual`` classes) as well as some non-API functions found in
the ``Tourist`` class.

The use of global variables
---------------------------

Our original design of the algorithm simulator used way too many global variables to
successfully keep developing on top of. The biggest reason for the switch to classes for all this
information is that otherwise it would require us to essentially double the amount of global
variables used to do things like comparison, and that just wasn't a safe or efficient choice.

We do, however keep some global vars just because its easier.
In the current implementation of ``superclass.js``, we use a variable called ``superlist``
to keep track of all of our instances of ``iclVisual``. All classes refer to ``superlist``, so it is
necessary for the simulation to work. We understand that this might not be the best practice, but is
certainly better than before, and helps us meet the requirements to make this simulator work.
Remember, we are essentially creating our own small game engine here with graphics, etc., and
because Javascript is so weird about certain things (for example ``setInterval()``'s context) we have to adapt to JS's
way of working.

To help implement comparisons and make switching between indices in the superlist easier,
we create the ``controllerID`` which would just be the index of the current ``iclVisual`` we
want to modify. When implementing comparisons we will likely just be switch between 1 and 0 for the
``controllerID`` the whole time.

This simulation is built on a mechanism that Javascript provides called an Interval. When we refer
to our own Interval that makes the thing work, we call it ``theMotor``. We are still testing comparisons, so
there could be a chance of adding a second motor that focuses just on the second comparison, but we have to see how they play
together before making that decision. The whole reason for the use of these global variables is because of
this Interval, when a function is called on an interval, even if the method that is being called is specific
to an instance of a class, the method's reference for ``this`` change from the usual reference to the
instance to a reference to the window. So, we have to use window variables to get what we want.

Other global variables that aren't nearly as vital include a copy of ``instruBinder`` and ``algName`` that are changed depending on the
current algorithm we are loading in, and  ``unit2Px`` and ``center``, which will be defined below as they relate to ``iclData``.

The Tourist
===========

A tourist in this case is the same exact thing as saying a 'robot' or 'mobile agent'. It's
just a name we've had for the little circles in the sim since the beginning.

.. js:autoclass:: tourist.Tourist(iclData, p)
    :members:

Other API methods are defined in `the API section of these docs <api.html>`_, so this
will just be going over the methods behind the API.

Calculating the Wall Position at a Given Angle
----------------------------------------------

.. js:autofunction:: tourist.Tourist#WallAtAngle

Direct Tourist to its Next Destination
--------------------------------------

.. js:autofunction:: tourist.Tourist#DirectTo

ICLData
=======

This is a data structure that we use to maintain positions of Tourists and
other relevant data when running the sim.
We tried to keep it as removed from visuals as possible, data-only.
ICLVisual uses this a lot when running the actual simulation.

.. js:autoclass:: superclass.iclData(id, instruBinder, algorithmName, angle, wireless)
    :members:

The ID given on creation is a nice way to ensure we are not mucking about in the data
of another instance of iclData when using ``superlist[controllerID]``.

ICLVisual
=========

This is the data structure which maintains all the visuals and updates the graphics
on each frame. It does a mixture of modifying data in its own iclData member variable,
and updating graphics based on them.

.. js:autoclass:: superclass.iclVisual(iclData)
    :members:

Other Useful Functions
======================

.. js:autofunction:: superclass.editAnims

.. js:autofunction:: superclass.showAnims

.. js:autofunction:: superclass.changeInstructions

.. js:autofunction:: superclass.ChoosExit

.. js:autofunction:: superclass.exitPreview

.. js:autofunction:: superclass.exitChosen

.. js:autofunction:: superclass.showHelp

.. js:autofunction:: superclass.showAlgorithmDesc
