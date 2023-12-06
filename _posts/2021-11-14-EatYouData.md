---
title: "Eat Your Data!"
header:
    image:
    og_image: /assets/images/20211114_eyd.gif
tags:
  - R
  - GameR
  - Snake Game
---

If you have ever found yourself in a situation where you didn't know what to do next with the data you have in hands, then there is a very high probability that this package is the right one for you! Eat you data is a snake-like game where the objective is to... well... eat your data! It provides the fun you would never have with your data!

## The game package

[GameR](https://github.com/ptarroso/gameR) is a useless package written in R where I accumulate hundreds of lines of irrelevant code. There is no reason to do this except (maybe) to feed procrastination in the hope of learning new tricks or to force new perspectives on programming and how to deal with data. Maybe it just simply is a release valve for stress when all other code is failing...

{% include inarticleadv.html %}

## Eat Your Data

This game is based on the classic [snake game](https://en.wikipedia.org/wiki/Snake_(video_game_genre)). You provide some data to the function and it returns a game! How joyful! The data must be numeric and without missing data (simply delete the rows with missing data... they are not doing anything useful there!). The game will perform a Principal Components Analysis and extract as many components as you wish (defaults to 4, the second argument to the function).

If everything is correct, a plot window will show up with the game. If not, you will really need to carefully consider getting new and more robust data! **This is a serious and danger drawback of playing this game!** Make sure your data meets the extremely high standards of a PCA, otherwise the scar on your career will last a lifetime.

The gameplay is straightforward. Start the game with "S" and use the arrows to move the snake. The data will appear as light blue dots but you are interested in the red one. This is the data point you should eat to grow the snake. On the classic game, this would be enough. However games in gameR package are not so easy! You have to navigate the snake in all dimensions of your data. To do that, you will have to use the numbers in your keyboard. By default, the game starts on the components **C1** and **C2**. If you press '2', the plot will change to **C2** and **C3**, with '3' will change to **C3** and **C4**, an so on. The number pressed will define the component on X.

As an example, you could start the game with the always helpful *Iris* data set that comes with R. I'm using the first 4 columns that have numeric data.

{% highlight R %}
library(gameR)
eatyoudata(iris[,1:4])
{% endhighlight %}

![alt]({{ site.url }}{{ site.baseurl }}/assets/images/20211114_eyd.gif){: .align-center}

{% include inarticleadv.html %}

## Some technical notes

I avoided using the "keypress" package to detect user key input that I have used in the [other game]({% post_url 2020-05-27-GameofLife %}). I'm using now the the R native *getGraphicsEvent* function to detect the key press. It has the advantage of being native (no other package is needed) and the focus on graphical window (instead of focus on the console). The code is a bit more convoluted but still quite easy to follow. I did not test in all OSes but it should increase the compatibility also.

Enjoy!
