Project Summary and Notes:
==========================

Ideas and planning placed in one location, whether they worked, didn't work, or haven't been implemented yet.
Sometimes an idea doesn't work for a problem, but instead could work for a later problem; Just don't know it yet.

-David


Contents:
---------

What is a mobile agent, and what defines it.
What are some problems, and solution ideas.
Plans for later.

What is a mobile Agent?:
------------------------

         (Lets call them bots, out of laziness, for now)
         A bot atleast is an object that has the capacity to move around and wait.
         In 1D space?

                  1. Bound to a line.
                  2. Moves along a line for some distance or time.
                  3. Can go backwards, not limited to following the line one way.

         In 2D space?

                  Top left is the point (0,0), and right is zero degrees.
                  Can move bi-directionally from where it is.

                           1. Such as move along relative polar coordinate (d, a)

                                    d: distance

                                    a: angle realtive to screen

                           2. Move along a vector (dx,dy)

                                    dx: is the displacement along the x direction

                                    dy: is the displacement along the y direction

                           3. Move to a point on the screen, any point relative to (x,y)

                                    x: the line x = some real value given

                                    y: the line y = some real value given

                                    (x,y): is the intersection of both lines, or the point of destination


         How does time effect motion?

                  Since time isn't incremental but computers are, motion also has to be incremented into steps.

                  Each step is one length of motion for a bot.
                           A length of motion is defines as an allowance that a bot must travel or spend each step.

                           If a bot waits, then the amount of time waiting is removed from allowance.

                           If a bot reaches its instruction destination with half allowace, and has more instruction:

                                    -> use the remaing allowance to begin the next instruction

                                    -> allowance, in some cases, can be divided among many steps

                                    Note: This idea came about to save fractions of a second:

                                             1. lost by reaching destination and waiting

                                             2. waiting a full allowance, when only half was required

         What are area specific instructions and conditions?

                  Instructions:

                           A convex room would require that no bots can leave the room, and can recognize walls.

                                    1. Go to wall at angle
                                             -> the convex room encapsulates the center

                                             -> a position on the wall is defined by a polar coordinate

                                    2. Go to center, a position located in the middle of the room

                                    3. Go to exit, go to the point on the wall of the room labelled exit.

                           A line

                                    1. Follow line with angle.

                                             -> angle that defines when to go backwards and forwards with time

                  Conditions:

                           Exit in 1D or 2D
                                    1. Only one bot must find it
                                    2. All bots must each it
                                    3. A specific bot must reach it
                                    4. A specific subset of bots must reach it
                                    5. A specific amount of bots must reach it

         What happens in a non-wireless communication?

                  Each bot has an exit instruction, an advanced instruction to tell others of where the exit is.
                  An exit instruction, includes locating meeting telling, and finally going to an exit.

                  Locating meeting telling instructions:

                           Pursue bot

                                   Finds a bot that is not being chased and doesn't know exit location

                                   Problem, bot might never be able to catch up, as they travel at same speed.

                           Intercept bot

                                   Almost like pursue, except it looks ahead of the other bot and goes there to intercept

                                   If the bot it wants to intercept, cannot be intercepted, then it looks at another

                                            -> This happens if a bot has got through the wall and is leaving screen.

                           Ignore exit

                                   Do not use any special instructions, keep going along normal instructions

                                            -> Tell anyone nearby where exit it while traveling

         What about wireless communication?

                  The moment a bot finds the exit, all other bots know where it is.
                  This has led to an interesting effect, specifically:

                           -> Each bot is updated one at a time, rather than simultaneously

                           -> What if the exit is found on the (n/2)th bot?

                                    -> Remember what all bots did a step ago, and reset knowing when exit was found

                           -> But what if the exit is found earlier on the (n/2 + 1)th bot?

                                    -> Full step is calculated, so an earlier time will be found as exit time.

Classification of Functions and bot
-----------------------------------

                  Physical Functions
                                    1. Wait - Indefinitely wait at position, or wait for some amount of time
                                    2. Move - Move towards a given point

                           Properties

                                    1. Color
                                    2. Instructions (either written or possible inputed by keyboard)

                  Basic Functions
                                    1. Go to Point - (x,y), go to point
                                    2. Go at Vector - (dx, dy), use change in position to figure out point relative to location
                                    3. Go at Angle - (d, a), move at a relative angle a at a distance d
                                    4. Pursue Bot - follow closest bot
                                    5. Intercept Bot - Look where bot is going and meet it there

                           Properties

                                    1. Knows other bots

                  AnyD Functions

                                    1. Go to Center - go to center
                                    2. Go to Exit - an exit function, go to exit
                                    3. Check all pairs of bots using randomization or divide and conquer to determine when they talk

                                             -> Share exit location

                                             -> Share info on other bots

                           Properties

                                    1. Exit knowledge
                                    2. Priority color, color of border to stand out better
                                    
                  1D Functions Line

                                    1. Follow Wall Right - Go left or right along x axis
                                    2. Travel at Angle - From a time vs position graph of the bots traveling back and forth

                                             ->have the bots follow this pattern

                  2D Functions Room

                                    1. Go to Wall at Angle - Go to a part of the wall at an angle realtive to center
                                    2. Follow Wall - follow wall indefinitely or for limited time

Problems that occurred
----------------------
         1. User uses 2D instructions on line
         2. User tells bot to leave bounds
         3. An infinite line on a finite screen

                  3a. How to know how far a bot has travelled along the line, or gone back and reduced furthest

                  3b. Best way to find furthest from center, without too much processing.

         4. Mobile agents have a position (x,y), that determines where to render

                  -> but on a finite infinite line, how to render a bot that should be off-screen

         5. What should be a minimum for a side that no bots travel across?
         6. Will the positive y axis going downwards have an affect on what is left and right for travel along wall in 2D, 1D
         7. What happens in non-wireless when a bot is traveling to infinity, and it needs to go to exit?

Solutions/ideas
---------------
         1.
                  a. Create new 1D functions
                  b. Edit all function to have 1D equivalent instructions
                  c. Change all 2D functions in instruction list to 1D equivalent during load
         2.
                  a. Create boundary limits, such as checking if a bot has left bounds, push back to bounds.
                  b. Give all functions a boundary condition when executing
         3.
                  a. Look at the x-coordinates of all bots in n - 1 to find furthest in positive and negative.
         4.
                  b. Take the furthest, and the x-coordiante of a bot

                           -> find the ratio and that's the radius distance from center along the infinite finite line
         5.
                  a. Symmetric to the longest side
                  b. Zero
                  c. One radius to retain the visual distance of center to left side
         6.
                  Left will have to mean both counter-clockwise and literally left

                  -> Left is negative along the x-axis, and counter-clockwise is positive
         7.
                  Need a way to slow them down, such as, well slowing them down while not knowing exit location

Plans
-----
         1. The graph will not have predetermined numbers, and will be made relative to unique points
         2. Constantly check bots close together
         3. When all bots know exit, use boolean integer to stop checks
         4. Make nice buttons that Chris would like
         5. Create a property called actives and inactives
                  actives: save information with time
                  inactives: no need to save or update
         6. actives can have a lifetime, that determines when they are visible
         7. change overlay to a graphics editor, such as drawing lines, arrows, and even words.
         8. alterante to 7. Instructions create visuals as they run
