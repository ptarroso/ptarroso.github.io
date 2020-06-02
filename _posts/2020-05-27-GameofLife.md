---
title: "The Game of Life"
header:
    image:
    og_image: /assets/images/20200528_gol.gif
tags:
  - R
  - GameR
  - Game of Life
---

The [Conway's Game of Life](https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life) always fascinated me. Just some apparently living squares that could remain alive or die accordingly to just a few rules. In fact, only two. After some introduction about the Game of Life, I show a new (useless) R package **gameR** where I have implemented the game with a few changes.

## Game of Life

The Game of Life relates to the concept of [cellular automaton](https://en.wikipedia.org/wiki/Cellular_automaton) where pixels in a grid respond to its neighbors based on a set of rules. Conway's objective was to devoid the set of rules to a bare minimum but maintain the proprieties that made it look alive generation after generation. The set was rules was reduced to only two:

1. If the cell is alive, then it stays alive if it has either 2 or 3 live neighbors.
2. if the cell is dead, then it springs to life only in the case that it has 3 live neighbors

There is an implicit third rule that is all other cells remain dead or die in the following generation. There are many relations to the biological world. For instance, rule no.1 is related to survival when resources are adequate and rule no.2 is related to reproduction. Conway and enthusiasts of Game of Life soon discovered that [patterns](https://www.conwaylife.com/wiki/Category:Patterns) with some specific behavior could be produced and start naming them: blocks, loaf, gliders, spaceships, glider guns, etc. Some of these patterns are immutable, some generate oscillating patterns that return to the original pattern every few generations. But others, like gliders, move on the plane where the Game of Life occurs. There are still patterns that might not move but its configuration allow to generate secondary patterns that do move (e.g. glider guns).

Conway wasn't sure if the Game of Life was mathematics. But, Conway, it might not be math by your standards, but surely it is beautiful! In fact it relates to all questions stemming from a seminal one: how can complexity arise from simplicity? The patterns discovered allowed to do more than only a seemingly live game: they allowed to generate communication between patterns and even patterns that allow to perform any kind of [computation](http://rendell-attic.org/gol/utm/index.htm). This idea of self-organization emerging spontaneously is a powerful analogy to many systems like emergence of consciousness (heavily discussed by Daniel Dennett in his books) or, ultimately, emergence of life from simple raw materials.


## gameR package

I started some archaeological expedition to my backups to find some old code where I had implemented the Game of Life. I decided to start a new R package with it that is currently available at [my github](https://github.com/ptarroso/gameR). The readme with the package has detailed instructions on how to install the package.

The *gameR* is a useless package and the Game of Life seemed a good way to start as a no-player game! But, of course, the Game of Life in *gameR* needs more rules! So I made a few changes. First, the original Game of Life happens in an infinite plane. Not anymore. Now it happens on a map! You can use your own raster maps or just generate an empty one. If you choose to provide a real raster map with data (altitude, temperature, etc), than two extra rules might apply:

{:start="3"}
3.  I have removed the infinite plane but gave them a world. So, at the edges of the world, where land and water meet, the cells can now live forever where	they contemplate the infinity on an ocean.
4. Cells only live with certain environmental conditions, thus they die if those conditions are not met.

The package *gameR* includes all the functionality to run the Game of Life with the previous rules. I'm using the library [*keypress*](https://cran.r-project.org/web/packages/keypress/index.html) to detect user key input. It simplifies a lot the process but it has a drawback: you have to run the game on a terminal (or command line) instead of R Studio or other IDE. See the package readme for more instructions.

You can start a simple game just using the command `gol()` after loading the package. I want a slightly more complex example to demonstrate the new rules. So I'm using a map of altitude that is available with a package and I'm creating a pattern of elements (the grid) so I can have the same start for both examples.

The following code load the package and the altitude raster. The raster covers the whole world, but we are cropping to a smaller area to better visualization of the living cells.

{% highlight R %}
library(gameR)
dem <- raster(system.file("data/dem.tif", package="gameR"))
map <- crop(dem, extent(-20, 40, 0, 60))
{% endhighlight %}

Now we use the map as a base to place some elements (patterns). The package includes some elements, but you can design your own and place it at specific coordinates in the map. Check the help of the functions for more options. We will use a random placement of 25 random elements in the map.

{% highlight R %}
grid <- prepareGrid(map, n=25)
{% endhighlight %}

*(Hint: you can always use plot to check both rasters)*

Now we will use the map to run the Game of Life with the 3rd rule.

{% highlight R %}
gol(map, grid)
{% endhighlight %}

![alt]({{ site.url }}{{ site.baseurl }}/assets/images/20200528_gol1.gif){: .align-center}

As you can see, it spreads over most the available area. The living cells reach a large potion of the coastline where they became immortal beings contemplating the ocean as dictated by the 3rd rule.

We can add the 4th rule now. The suitable environmental conditions are implemented as a normal distribution. The user gives a mean and standard deviation to create a normal distribution that defines the living range based on 95% of the area around the mean. This is, of course, in relation to the values on the map. Let's say it defines a simple niche for our game of life. We are using altitude in meters here, so we define the mean as 0 and standard deviation as 500m. It allows the cells to thrive on low altitudes.

{% highlight R %}
gol(map, grid, mean=0, sd=500)
{% endhighlight %}

![alt]({{ site.url }}{{ site.baseurl }}/assets/images/20200528_gol2.gif){: .align-center}

Note that the starting pattern is the same as in the first example. However now, as you can see that the higher mountains Europe and Africa are blocking the passage and the living cells are expanding as possible around the mountains. It is more difficult for the game of Life to spread all over the area because cells tend to die where habitat became less favorable. This shows an interesting parallel to one of [my previous posts]({% post_url 2020-04-16-Phylin2%}), where I use a resistance model to describe distance between observations of a species.

Try the Game of Life yourself with the [gameR package](https://github.com/ptarroso/gameR)!

I decided to create this post as a small tribute to John Conway who passed away last month, on the 11th April. He was one of the many victims of covid19.
