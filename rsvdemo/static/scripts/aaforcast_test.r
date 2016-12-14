rm(list=ls())
script.dir <- dirname(sys.frame(1)$ofile)
setwd(script.dir)
source("aaforcast.r")
fsdata=read.csv("C:/Users/Class2018/Box Sync/Forecasting App 2.0/tsdata.csv")

fc_type="test"

fc_horizon=6

peroid="Monthly"

resultlist = aaforcast(fsdata, fc_type, fc_horizon, peroid)
