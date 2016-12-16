Array.prototype.contains = function(v) {
    for(var i = 0; i < this.length; i++) {
        if(this[i] === v) return true;
    }
    return false;
};

Array.prototype.unique = function() {
    var arr = [];
    for(var i = 0; i < this.length; i++) {
        if(!arr.contains(this[i])) {
            arr.push(this[i]);
        }
    }
    return arr; 
}
////////////////////////////////////////////////////////////////////////////////////////////




var charts = []

rsvfile = JSON.parse(resultJSON);

var subjectID = []
subjectID.push.apply(subjectID, rsvfile['Subject ID'])


var when = []
when.push.apply(when, rsvfile['When'])

var questionText = []
questionText.push.apply(questionText, rsvfile['Question Text'])

var responseID = []
responseID.push.apply(responseID, rsvfile['Response ID'])


var responseText = []
responseText.push.apply(responseText, rsvfile['Response Text'])

var platform = []
platform.push.apply(platform, rsvfile['Platform'])




////////////////////////////////////////

var subjectIDUnique = subjectID.unique()

var whenUnique = when.unique()



////////////////////////////////////////




function doEverything() {
    test(subjectIDUnique, when)
    test2(subjectIDUnique, whenUnique)
    test3()
    test4()
}


function changeTab(element, graphContainer) {
    //grab the navbar from the dom
    tabNav = document.getElementById("tabNav")
    //get the children (the <li> elements)
    childrenLi = tabNav.children
    tabs = []
    //get the <a> tags from the <li> tabs
    for(var i = 0; i < childrenLi.length; i++) {
        a = childrenLi[i].children
        tabs.push(a)
    }
    //clear class of each <a> tag to make it look unselected
    for(var i = 0; i < tabs.length; i++){
        tabs[i][0].removeAttribute("class")
    }
    //make the selected <a> tag look selected
    element.setAttribute("class", "activeTab")
    
    containers = [document.getElementById("appAccessContainer"), document.getElementById("userSympFreqContainer"), document.getElementById("userSympMapContainer"), document.getElementById("sympResponseContainer")]
    //hide all graphs
    for(var i = 0; i < containers.length; i++) {
        containers[i].style.display = "none"
    }
    //show only the graph we want to see
    graphContainer.style.display = "block"
    //resize all graphs on tab switch
    for (var i = 0; i < charts.length; i++) {
        charts[i].resize()
    }
}


function test(subjectIDUnique,  when) {
    console.log("test")
    var chart = c3.generate({
        bindto: '#chart1',
        data: {
            //make sure that graphableForecasted is plotted first so that it doesnt look like there is an extra forecasted point that is really the last actual value point
            columns: [
                subjectID
            ],
            colors: {
                Actual: "#29AFDF",
                Forecasted : "#ED2835"
            }
        },
        subchart: {
            show: true
        },
        axis: {
            x: {
                type: 'categories',
                categories: when,
                tick: {
                    multiline: false,
                    culling: {
                        max: 15
                    }
                },
                label: {
                    text: 'Time Series',
                    position: 'outer-center'
                }
            },
            y: {
                type: 'categories',
                categories: subjectIDUnique,
                label: {
                    text: "SubjectID",
                    position: 'outer-middle'

                }
            }
        },
        zoom: {
            enabled: true,
            rescale: true
        },
        legend: {
            position: 'right'
        }
    });
    
    charts.push(chart)

}

function test2(subjectIDUnique, whenUnique) {
    console.log("test2")
    var chart = c3.generate({
        bindto: '#chart2',
        data: {
            //make sure that graphableForecasted is plotted first so that it doesnt look like there is an extra forecasted point that is really the last actual value point
            columns: [
                whenUnique
            ],
            colors: {
                Actual: "#29AFDF",
                Forecasted : "#ED2835"
            }
        },
        subchart: {
            show: true
        },
        axis: {
            x: {
                type: 'categories',
                categories: subjectIDUnique,
                tick: {
                    multiline: false,
                    culling: {
                        max: 15
                    }
                },
                label: {
                text: 'Time Series',
                position: 'outer-center'
                }
            },
            y: {
                label: {
                    text: "Values",
                    position: 'outer-middle'

                }
            }
        },
        zoom: {
            enabled: true,
            rescale: true
        },
        legend: {
            position: 'right'
        }
    });
    
    charts.push(chart)

}

function test3() {
    console.log("test3")
    var chart = c3.generate({
        bindto: '#chart3',
        data: {
          columns: [
            ['data1', 100, 200, 100, 400, 150, 250],
            ['data2', 50, 20, 10, 40, 15, 25]
          ],
          axes: {
            data2: 'y2'
          }
        },
        axis: {
          y: {
            label: { // ADD
              text: 'Y Label',
              position: 'outer-middle'
            }
          },
          y2: {
            show: true,
            label: { // ADD
              text: 'Y2 Label',
              position: 'outer-middle'
            }
          }
        }
    });
    charts.push(chart)
    
}

function test4() {
    console.log("test4")
    var chart = c3.generate({
        bindto: '#chart4',
        data: {
          columns: [
            ['data1', 3110, 200, 100, 400, 150, 250],
            ['data2', 50, 20, 10, 40, 15, 25]
          ],
          axes: {
            data2: 'y2'
          }
        },
        axis: {
          y: {
            label: { // ADD
              text: 'Y Label',
              position: 'outer-middle'
            }
          },
          y2: {
            show: true,
            label: { // ADD
              text: 'Y2 Label',
              position: 'outer-middle'
            }
          }
        }
    });
    
    charts.push(chart)

}



