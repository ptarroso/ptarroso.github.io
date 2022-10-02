#!/usr/bin/env python3
from osgeo import ogr,gdal
import argparse
import numpy as np

class progress:
    def __init__(self, n):
        self.n = n
        self.i = 0
        self.p = 0
        self._print()
    def _print(self):
        p = self.p
        d = int(p/2)
        print("|{}{}|{:.1f}%".format("."*d, " "*(50-d), p), end="\r")
        if (self.i == self.n):
            print()
    def update(self, i):
        self.i = i
        p = int(i/self.n*1000)/10
        if p > self.p:
            self.p = p
            self._print()

descr = "Rasterizes a vector layer using a raster image as a model for " \
        "resolution and dimensions. It rasterizes based on the number of "\
        "features present in the pixel or based on maximum or mean of a "\
        "numeric field value in the vector layer."

parser = argparse.ArgumentParser(description=descr,
                        formatter_class=argparse.ArgumentDefaultsHelpFormatter)
parser.add_argument("source", help="Source vector layer to rasterize")
parser.add_argument("raster", help="Raster layer used as model")
parser.add_argument("output", help="Output raster layer name (must be tif)")
parser.add_argument("--method", choices=['count', 'max', 'mean'], 
                    default="count", help="Function used in rasterization.")
parser.add_argument("--field", required = False, default = "", 
                    help="Vector field name (mandatory for max and mean)")
args = vars(parser.parse_args())


if __name__ == '__main__':

    source = ogr.Open(args["source"])
    src_layer = source.GetLayer()

    raster = gdal.Open(args["raster"])

    method = args["method"]
    if method in ["max", "mean"] and args["field"] == "":
        exit("Field name is mandatory when method is masx or mean")
    field = args["field"]

    data = raster.ReadAsArray()
    data = data * 0
    if method == "mean":
        sumdt = data.copy()

    rst_driver = gdal.GetDriverByName('MEM')
    vec_driver = ogr.GetDriverByName('MEMORY')

    prg = progress(src_layer.GetFeatureCount())
    i = 0
    for feat in src_layer:
        tmp_ds = vec_driver.CreateDataSource('memData')
        tmp_layer = tmp_ds.CreateLayer('temp', geom_type=src_layer.GetGeomType(),
                                        srs=src_layer.GetSpatialRef())
        err = tmp_layer.CreateFeature(feat.Clone())
        cur = rst_driver.CreateCopy('rst', raster , 0)
        newBand = cur.GetRasterBand(1)
        err = newBand.WriteArray(data*0)
        err = gdal.RasterizeLayer(cur, [1], tmp_layer, burn_values=[1], 
                                  options = ["ALL_TOUCHED=TRUE"])
        
        if method == "count":
            data = data + cur.ReadAsArray()
        elif method == "max":
            val = feat.GetField(field)
            data = np.maximum(data, cur.ReadAsArray()*val)
        elif method == "mean":
            val = feat.GetField(field)
            data = data + cur.ReadAsArray()*val
            sumdt = sumdt + cur.ReadAsArray()
            
        i += 1
        prg.update(i)

    if method == "mean":
        data = data / sumdt

    drv = gdal.GetDriverByName('GTiff')
    outRaster = drv.CreateCopy(args["output"], raster , 0)
    newBand = outRaster.GetRasterBand(1)
    newBand.WriteArray(data)
    outRaster.FlushCache()
    outRaster = None


