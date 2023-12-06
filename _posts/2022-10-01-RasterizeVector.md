---
title: "Rasterizing vector data in Python with OGR/GDAL"
tags:
  - Python
  - GDAL
  - GIS
---

In this post I will describe a simple tool to rasterize data. There are plenty of rasterization tools in GDAL, QGIS and other GIS that produce excellent results and are extremely fast. However, I needed a tool that not only converted the vector to raster but also counted the number of vector features within each pixel, as well as having the option to collect other values based on the vector feature data. This was not immediate to achieve with the tools at my disposition, so I opted to write some code in python. Maybe it is possible to achieve the same results by tweaking with the SQL code in the [gdal_rasterize](https://gdal.org/programs/gdal_rasterize.html) tool, for instance, but I did not explore that path.

# Preparing Python

There are a few modules that are needed to run the code below. One is the obvious [GDAL Python bindings](https://gdal.org/api/python_bindings.html) allowing to import raster and vector data into the Python environment. The other is the typical [NumPy](https://numpy.org/) allowing to perform fast calculations on matrices.

{% include inarticleadv.html %}

# The strategy

I follow a "quick and dirty" strategy for this code that gets the job done but will not work well on very large rasters or vectors. I iterate over the features in the vector layer to produce a raster map of the individual features. These maps are extracted to a numpy array and processed accordingly to the method chosen. The two main methods I needed was the **count** which sums the number of features present in each pixel, and the **max** which calculates the maximum value of a numeric attribute associated with the vector features present in each pixel.

# Opening the data

At this initial point we need to open the data file. For the vector layer with just need to access the layer with the features. I'm assuming the dataset only has one layer.

{% highlight python %}
source = ogr.Open("myvector.shp")
src_layer = source.GetLayer()
{% endhighlight %}

For the raster we will need to open the file and read the data within the raster to a numpy array. The raster is only used as a model for the final raster, passing definitions like extent, spatial resolution, etc. All data in this raster is ignored in the subsequent rasterization process. On the last line of this code chunk, all data is set to 0 to initiate the feature counting.

{% highlight python %}
raster = gdal.Open("myraster.tif")
data = raster.ReadAsArray()
data = data * 0
{% endhighlight %}

The algorithm iterates over the features and rasterizes each one individually. For that purpose, we will need to create temporary data holders for vector and raster. I have opted for *in memory* datasets, in the expectation to speed up the processing. The following code prepares two drivers for those data holders.

{% highlight python %}
rst_driver = gdal.GetDriverByName('MEM')
vec_driver = ogr.GetDriverByName('MEMORY')
{% endhighlight %}

This script dumps a lot of information in memory and that's why the code will not work well for very large rasters.

# The algorithm

The algorithm is very straight forward: 1) iterate over features in the vector layer, 2) rasterize the single feature layer to a raster in memory, 3) process the raster data as a numpy matrix and accumulate counts per pixel.

{% highlight python %}
for feat in src_layer:
    # Create in memory vector layer with single feature
    tmp_ds = vec_driver.CreateDataSource('memData')
    tmp_layer = tmp_ds.CreateLayer('temp', geom_type=src_layer.GetGeomType(),
                                    srs=src_layer.GetSpatialRef())
    err = tmp_layer.CreateFeature(feat.Clone())

    # Create in memory raster by copying source
    cur = rst_driver.CreateCopy('rst', raster , 0)
    newBand = cur.GetRasterBand(1)
    # Reset the raster data
    err = newBand.WriteArray(data*0)

    # Rasterize single vector to raster
    err = gdal.RasterizeLayer(cur, [1], tmp_layer, burn_values=[1], 
                              options = ["ALL_TOUCHED=TRUE"])
    
    # Accumulate on data matrix
    data = data + cur.ReadAsArray()
    i += 1
{% endhighlight %}

I also needed another value besides counting the number of features. I needed another raster with the maximum value of a field in the vector layer for all features present at each pixel. Let's say the vector layer has a numeric field named 'level'. I needed the *data* matrix to store the maximum value found at each iteration loop. A simple modification of the last lines of the script allows us to achieve that result:

{% highlight python %}
    # Data accumulates maximum value
    val = feat.GetField("level")
    data = np.maximum(data, cur.ReadAsArray()*val)
{% endhighlight %}

It gets the value of the field 'level' for the single feature in the iteration and multiplies the raster matrix (only zeros and ones) with that value. Using numpy element-wise maximum operation, the 'data' matrix will only have the maximum value found at each pixel for all features present.

As a last step, we just need to export the *data* matrix to a raster again. Since we did not change any raster proprieties with the processing, I'm recycling the raster definition, writing the *data* matrix to the raster and exporting it to a GeoTIF. 

{% highlight python %}
drv = gdal.GetDriverByName('GTiff')
outRaster = drv.CreateCopy("output.tif", raster , 0)
newBand = outRaster.GetRasterBand(1)
newBand.WriteArray(data)
outRaster.FlushCache()
outRaster = None
{% endhighlight %}


{% include inarticleadv.html %}

# Final thoughts

The gdal and ogr libraries offer a very powerful solution to access spatial data for a unimaginable number of formats for both raster and vector data. The osgeo module lends that power to python. However, the way that it is written translates to a very "unpythonic" code. Other packages (like [rasterio](https://pypi.org/project/rasterio/), for example) offer simpler interfaces that might result in more pythonic code that we are used to.

[Here you can find]({{ site.url }}{{ site.baseurl }}/assets/resources/rasterize.py) the full script. I have added a few more lines of code that you can explore, including 3 methods *count*, *max* and *mean*. It also offers a simple progress bar and a command line interface through *argparse* so you can use the tool directly in your terminal like this:

{% highlight bash %}
python rasterize.py in.shp rst.tif
python rasterize.py --field level --method max in.shp rst.tif
python rasterize.py -h
{% endhighlight %}

It is still a very simple script. It does not offer much error control, options to modify the rasterization process or output formats, but it works for the purpose it was created!
