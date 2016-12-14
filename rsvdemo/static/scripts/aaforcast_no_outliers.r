#' Use "auto.arima" and "Holt-winters" to make prediction
#'
#' Choose the one which can generate better results based on SSE
#' @param ts_df The data we are using (data.frame), which should 
#'        include two columns(time and value)
#' @param fc_type the forecast type (character)
#' @param fc_horizon How many points we should predict (integer)
#' @param peroid how ofen the data points colleted (character)
#'        like "Monthely","Weekly","Daily" 
#' @return a list of two dataframes: 
#'             the first one is the actual and fitter data
#'             the second one is the forecast results


aaforcast <- function(ts_df, fc_type, fc_horizon, peroid) { 
  library(tsoutliers)
  library(expsmooth)
  library(fma)
  library(stats)
  runningTiming=Sys.time()
  
  ts_df[,1]=as.Date(ts_df[,1])
  ts_df[,2]=as.numeric(ts_df[,2])
    
  if(peroid=="Monthly"){
    freq=12
  } else if(peroid=="Weekly"){
    freq=4
  } else if(peroid=="Daily"){
    freq=365
  } else{
    freq=1
  }
  
  mHoltWinter <- HoltWinters(ts(ts_df[,2],frequency = freq));
  mARIMA<-auto.arima(ts(ts_df[,2],frequency = freq))
  
  
  model_valid=data.frame(time=ts_df[,1],actual=ts_df[,2])
  if (mHoltWinter$SSE>sum(mARIMA$residuals^2)){
    model=mARIMA
    model_valid$pred=fitted(model)
  }else{
    model=mHoltWinter
    model_valid$pred=c(rep(NA,length(model$x)-nrow(data.frame(model$fitted))),
                       data.frame(model$fitted)$xhat)
  }
  model_valid$pred_type=fc_type
  model_valid$pred_time=runningTiming
  model_predict <- forecast(model, h=fc_horizon)
  model_predict = data.frame(forcast_V=data.frame(model_predict)[,1])
  model_predict$pred_type=fc_type
  model_predict$pred_time=runningTiming
  
  
  if(peroid=="Monthly"){
    future_time=seq(as.Date(ts_df[nrow(ts_df),1]), 
                                  by = "month", length = fc_horizon + 1)
  } else if(peroid=="Weekly"){
    future_time=seq(as.Date(ts_df[nrow(ts_df),1]), 
                                  by = "week", length = fc_horizon + 1)
  } else if(peroid=="Daily"){
    future_time=seq(as.Date(ts_df[nrow(ts_df),1]), 
                                  by = "day", length = fc_horizon + 1)
  } else{
    future_time=seq(as.Date(ts_df[nrow(ts_df),1]), 
                                  by = "year", length = fc_horizon + 1)
  }
  model_predict$future_time=future_time[2:length(future_time)]
  
  model_predict=subset(model_predict,
                       select=c("future_time","forcast_V","pred_type","pred_time"))
  
  return(list(model_valid,model_predict))
}