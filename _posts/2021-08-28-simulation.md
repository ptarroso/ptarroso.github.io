---
title: "Simple simulation of life with JS"
header:
    image:
    og_image:
tags:
  - simulation
  - evolution
  - javascript
custom-javascript-list:
  - "https://cdn.jsdelivr.net/npm/chart.js"
---

There is no direction or intent in evolution. However, an idea that evolution
has a goal towards some sense of perfection seems quite prevalent on the
society. This perfection is often related to be more human-like: given enough
time, monkeys and apes do not necessarily have to evolve to a more human like
species. There is no purpose in evolution except facing the current threats
through adaptation (or removal of less adapted diversity). So monkeys and apes
will increase brain size if they need better tools for harnessing their
surroundings, will favour bipedalism if the raised viewpoint and releasing the
upper members from locomotion related tasks will provide an advantage, etc. Of
course, this is the positive side, when the accumulated diversity assures some
degree of fitness on a changing environment. The other possibility is that the
species already drew all the evolutionary cards and has no other way to cope
with current threats. In this case, populations will decrease in number and
eventually will go extinct.

A broader interpretation of the idea that evolution is a kind of a force that
drives species towards a more human like organism could be that
*evolution aims to perfection*. In a strict sense, it is true: at each time,
evolution does balance fitness with environment and provides the means to be
*perfect*. However, this is always ephemeral, lasting only until the environment
changes again. There is no long term perfection goal, there is only a lack of
purpose in evolution.

With that in mind I tried to make a *toy model* in JS. It might provide some
insights about some processes but it was aimed to be simple, not an exhaustive
and detailed simulation of life. The main actor is the circle. It embeds the
idea of perfection due to the simplicity of the representation: each point
around the perimeter have the same distance to the centre. A single parameter
controls the roughness of the circle by randomly adjusting the radius. It ranges
from 1, a perfect circle, to 0 where every other point has a random value of
radius, rendering it more star-shaped. Each shape, from the perfect circle to
the rough one, has 20 points (small black dots) on the perimeter.

<div>
  <div style="display: flex; align-items: flex-end;">
    <div style="border: 1px solid #d6ecfb;border-radius: 15px;margin: 20px 20px;overflow: hidden;">
      <canvas id="actors" width="500" height="100">
        Canvas not supported; please update your browser.
      </canvas>
    </div>
  </div>
  <input type="button" id="rActors" value="Refresh" onclick="refreshActors();">
</div>

You can press the refresh button on the image above to generate new
configurations. You will see that the circle remains a stable shape as expected
but the remaining shapes will assume different configuration by chance, being
more noticeable as the roughness value increases.

# First simulation

As said, the simulation is quite simple. It consists of a defined area were the
actors move randomly, following a Brownian motion on the 2D space. All actors
have the same base radius, velocity and longevity (500 iterations) and a maximum
of 100 actors are allowed simultaneously. When a actor is born, it cannot
reproduce until it reaches maturity after 100 iterations. At every iteration the
position of the actors is checked. If the centres of a pair of actors, let's say
A and B, are at a distance equal to two times the radius, then a collision is
detected. In this case, a possible reproduction event is checked: the distance
of the centre of A (female) to each of the black dots of B (male) is calculated.
The number of dots that are at a smaller distance than the radius of the actor
at the moment of collision gives the number of offspring. The female cannot
reproduce again for 100 iterations if she produces offspring. In the simulation,
reproducing actors are green and non-reproducing are red.

To keep it simple, the offspring roughness is the average of the parents value.
There is no discreet hereditary unit like a gene. Thus, the inheritance of the
shape is quite different from real life, but still defined by the parents. One
of the consequences of this is that there will be a trend to average the values
and the most extreme values will tend to disappear as parents are removed. The
other difference is that there is no external selective pressure. The simulation
has a neutral environment and none of the shapes produced is being preferred.
Still, if one shape tends to produce more offspring, then it might fix the
roughness value towards there own values. The spikes might provide an advantage
to produce more offspring but because their configuration is random, the
offspring inherits the value but not the shape as shown in the image above.

<div>
  <div style="display: flex; align-items: flex-end;">
    <div style="border: 1px solid #d6ecfb;border-radius: 15px;margin: 20px 20px;overflow: hidden;">
      <canvas id="simulation1" width="250" height="250"></canvas>
    </div>
    <div class="chart-container" style="height:200; width:250">
      <canvas id="chartsim1"></canvas>
    </div>
  </div>
  <input type="button" id="startsim1" value="Start" onclick="startsim1();">
  <input type="button" id="stopsim1" value="Stop" disabled=true onclick="stopsim1();">
  <input type="button" id="resetsim1" value="Reset" onclick="resetsim1();">
</div>

The first simulation starts with half of the actors as a perfect circle and the
other half as the star-shaped with roughness set to 1. There are 100 actors that
start in random positions and are set to a random age to decrease the
synchronization of born/death events. The histogram on the right shows the
relative proportion of the roughness value at each iteration.

When the simulation is reset, different configurations of the actors emerge by
chance. This initial configuration becomes decisive for the final result.
Different random configurations produce a trend towards different values. If you
let the simulation for some time, the histogram will peak at some value. After
resetting you will see that the value might substantially change for the new
simulation. This simple simulation of life already show some hints that there is
no direction. The random mating will generate a pattern that depends on the
local arrangement of the actors. If all perfect circles are grouped together,
then they will tend to have offspring with very low values of roughness.

# Second simulation

In this second simulation I have modified some of the parameters. The longevity
is set to 200 iterations so the the female only reproduces once. To compare the
effect on perfect circles and star-shaped circles (roughness set to 1) I have
forced a hand-made natural selection... On the left all actors are fully
star-shaped and on the right are perfect circles. Since there is no diversity of
shapes, and because of the inheritance by averaging parents value and there is
no mechanism for generating diversity, all children will have the same value as
the parents.

<div>
  <div style="display: flex; align-items: flex-end;">
    <div style="border: 1px solid #d6ecfb;border-radius: 15px;margin: 20px 20px;overflow: hidden;">
      <canvas id="simulation2a" width="250" height="250"></canvas>
    </div>
    <div style="border: 1px solid #d6ecfb;border-radius: 15px;margin: 20px 20px;overflow: hidden;">
      <canvas id="simulation2b" width="250" height="250"></canvas>
    </div>
  </div>
  <input type="button" id="startsim2" value="Start" onclick="startsim2();">
  <input type="button" id="stopsim2" value="Stop" disabled=true onclick="stopsim2();">
  <input type="button" id="resetsim2" value="Reset" onclick="resetsim2();">
</div>

When the simulation is started, three numbers appear at the bottom of each
simulator square. The **n** is the current number of actors, the **extinction**
is the number of extinction events for each population (the simulation is
automatically restarted after an extinction event), and the average number of
**offspring** per reproduction (since females only reproduce once, this value
will be equal to offspring per female).

This simulation shows the effect of the shape in the number of offspring and how
it can this affect the longevity of the population. Once the rate of
reproduction is not sufficient, the population cannot be maintained and becomes
extinct. There are other factors beside the shape that might affect the final
result. The initial position of two actors in the simulator can have an effect
on the final outcome but this is minimized by the random distribution of the
actors in both simulations and the successive simulations after extinctions.

The simulated population on the left will become extinct far less often than
the right one. With the conditions set in the simulation, the perfect circle has
a smaller number of offspring which makes the population unsustainable. Due to
the shorter longevity, the circles do not have time to wonder around, so the
successful search for a partner depends much more on the proximity. This effect,
however, is purely demographic in the simulation. An adverse environment could
escalate the effect, by removing more individuals.

# Some final remarks

These simple simulations do not prove much about direction in evolution but
might provide some insights about the processes acting. More complex
simulations, perhaps with a non-uniform environment, a more defined behaviour
and a realist inheritance mechanism would provide further insights. There are
many more things acting simultaneously in real life that might guide evolution
to different directions. When looking backwards from the current state of an
organism, the evolutionary path it underwent seems very logical, however we
often forget all the failed *evolutionary experiments* that were needed. These
were perfect at some time, but change or chance might have rendered them
unsuitable.

The other purpose of this simulation was more technical: to use a canvas html
object to display an animation. The simulation of simple mechanisms of life
provided a good experiment field. The code of the simulations is available
[here]({{ site.url }}{{ site.baseurl }}/assets/js/simulator.js)
and [here]({{ site.url }}{{ site.baseurl }}/assets/js/controls.js).

If you did enjoy the simulation and have some comments or found some errors
please send me a message on any of the contacts available.

<script src="{{ site.url }}{{ site.baseurl }}/assets/js/simulator.js"></script>
<script src="{{ site.url }}{{ site.baseurl }}/assets/js/controls.js"></script>
