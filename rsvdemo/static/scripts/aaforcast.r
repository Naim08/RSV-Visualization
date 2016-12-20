#' Use "auto.arima" and "Holt-winters" to make prediction
#'
#' Choose the one which can generate better results based on SSE
#' @param ts_df The data we are using (data.frame), which should 
#'        include two columns(time and value)
#' @param fc_type the forecast type (character)
#' @param fc_horizon How many points we should predict (integer)
#' @param period how ofen the data points colleted (character)
#'        like "Monthely","Weekly","Daily" 
#' @return a list of two dataframes: 
#'             the first one is the actual and fitter data
#'             the second one is the forecast results


aaforcast <- function(ts_df, fc_type, fc_horizon, period) { 
  library(tsoutliers)
  library(expsmooth)
  library(fma)
  library(stats)
  # browser()
  runningTiming=Sys.time()
  
  ts_df[,1]=as.Date(ts_df[,1])
  ts_df[,2]=as.numeric(ts_df[,2])
  
  if(period=="Monthly"){
    freq=12
  } else if(period=="Weekly"){
    freq=4
  } else if(period=="Daily"){
    freq=365
  } else{
    freq=1
  }
  
  mHoltWinter <- HoltWinters(ts(ts_df[,2],frequency = freq));
  if(period=="Daily") {
    mARIMA<-auto.arima(ts(ts_df[,2],frequency = freq))
    fulldata = data.frame()
    fulldata$outliers = data.frame(type=character(0), ind=integer(0), time=character(0), coefthat=numeric(0), tstat=numeric(0))
  } else {
    a = as.numeric(c(format(ts_df[,1][1], "%Y"), format(ts_df[,1][1], "%m")))
    b = as.numeric(c(format(ts_df[,1][length(ts_df[,1])], "%Y"), format(ts_df[,1][length(ts_df[,1])], "%m")))
    fulldata<-tso(ts(ts_df[,2],frequency = freq, start=a), types=c("AO","LS","TC"))
    mARIMA <- fulldata$fit
    if (nrow(fulldata$outliers) > 0) {
      newxreg <- outliers.effects(fulldata$outliers, length(ts_df[,2]) + fc_horizon, freq=freq)
      newxreg <- ts(newxreg[-seq_along(ts_df[,2]),], start = b)
    }
  }
  
  
  model_valid=data.frame(time=ts_df[,1],actual=ts_df[,2])
  if (mHoltWinter$SSE>sum(mARIMA$residuals^2)){
    model=mARIMA
    modeltype="ARIMA"
    model_valid$pred=fitted(model)
  }else{
    model=mHoltWinter
    modeltype="Exponential Smoothing"
    model_valid$pred=c(rep(NA,length(model$x)-nrow(data.frame(model$fitted))),
                       data.frame(model$fitted)$xhat)
  }
  model_valid$pred_type=modeltype
  model_valid$pred_time=runningTiming
  # model_predict <- predict(model, fc_horizon, prediction.interval = TRUE)
  if(period=="Daily" || modeltype == "Exponential Smoothing" || nrow(fulldata$outliers) == 0) {
    model_predict <- forecast(model, h=fc_horizon)
  } else {
    model_predict <- forecast(model, n.ahead=fc_horizon, xreg=newxreg)
  }
  model_predict = data.frame(forcast_V=model_predict$mean)
  model_predict$pred_type=modeltype
  model_predict$pred_time=runningTiming
  
  
  if(period=="Monthly"){
    future_time=seq(as.Date(ts_df[nrow(ts_df),1]), 
                    by = "month", length = fc_horizon + 1)
  } else if(period=="Weekly"){
    future_time=seq(as.Date(ts_df[nrow(ts_df),1]), 
                    by = "week", length = fc_horizon + 1)
  } else if(period=="Daily"){
    future_time=seq(as.Date(ts_df[nrow(ts_df),1]), 
                    by = "day", length = fc_horizon + 1)
  } else{
    future_time=seq(as.Date(ts_df[nrow(ts_df),1]), 
                    by = "year", length = fc_horizon + 1)
  }
  model_predict$future_time=future_time[2:length(future_time)]
  
  model_predict=subset(model_predict,
                       select=c("future_time","forcast_V","pred_type","pred_time"))
  
  return(list(model_valid,model_predict, fulldata$outliers))
}