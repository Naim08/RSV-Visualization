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






///////////////////////////////////////////////////////////////////////////////////////////


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

var subjectIDUnique = subjectID.unique().slice(1)

var whenUnique = when.unique()



////////////////////////////////////////




function doEverything() {
    test(subjectIDUnique, when)
    test2(subjectIDUnique, whenUnique)
    test3()
    test4()
}


function makeJSON(data) {
    obs = []
    
    
    for (i = 1; i < data['Platform'].length; i++) {
        o = {}
        
        o['App Version'] = data['App Version'][i]
        o['Platform'] = data['Platform'][i]
        o['Question ID'] = data['Question ID'][i]
        o['Question Text'] = data['Question Text'][i]
        o['Response ID'] = data['Response ID'][i]
        o['Response Text'] = data['Response Text'][i]
        o['Site ID'] = data['Site ID'][i]
        o['Subject ID'] = data['Subject ID'][i]
        o['Therm'] = data['Therm'][i]
        o['When'] = new Date(data['When'][i]) 
        
        obs.push(o)
    }
    
    return obs
}

master = makeJSON(data)
console.log(master)


function getUniqueIDsFromFilter(filter) {
    d = []
    
    for (var i = 0; i < filter.length; i++) {
        d.push(filter[i]['Subject ID'])
    }
    
    return d.unique()
}

function getUniqueSymptomsFromFilter(filter) {
    d = []
    
    for (var i = 0; i < filter.length; i++) {
        d.push(filter[i]['Question Text'])
    }
    
    return d.unique()
}

function getUniqueDatesFromFilter(filter) {
     d = []
    
    for (var i = 0; i < filter.length; i++) {
        d.push(filter[i]['When'])
    }
    
    return d.unique()
}
function filter(master, whatToFilter, inputID) {
    var results = []
    
    for (var i = 0; i < master.length; i++) {
        if (master[i][whatToFilter] == inputID) {
            results.push(master[i])
        }
    }
    
    return results
}
function filterByDate(startdate, enddate, filter) {
    var results = []
	for(var i = 0; i < filter.length; i++){
	    if(filter[i]['When'] >= startdate && filter[i]['When'] <= enddate) {
		results.push(filter[i]);
	    }
	
	}
	return results;
    

}
function getAppAccessData(master) {
    counts = []
    uniqueIDs = getUniqueIDsFromFilter(master)
    
    for (var i = 0; i < uniqueIDs.length; i++) {
        rows = filter(master, "Subject ID", uniqueIDs[i])
        count = countDistWhen(rows)
        counts.push(count)
    }
    
    results = []
    results[0] = uniqueIDs
    results[1] = counts
    
    return results
}

function getSymptomFrequencyData(master, symptom) {
    symptomFilter = filter(master, "Question Text", symptom)
    
    uniqueDates = getUniqueDatesFromFilter(symptomFilter)
    
    for (var i = 0; i < uniqueDates.length; i++) {
        rows = filter(symptomFilter, "When", uniqueDates[i])
        count = countDistWhen(rows)
        counts.push(count)
    }
    results = []
    results[0] = uniqueDates
    results[1] = counts
    
    return results
}

function countDistWhen(rows) {
    d = {}
    
    for (var i = 0; i < rows.length; i++) {
        d[rows[i]['When']] = 0
    }
    
    return Object.keys(d).length
}

function countDistResponse(rows) {
    d = {}

    for (var i = 0; i < rows.length; i++) {
        if(d.hasOwnProperty(rows[i]['Response ID']) == false)
	    d[rows[i]['Response ID']] = 1
	    else {
		d[rows[i]['Response ID']] = d[rows[i]['Response ID']] + 1
	    }
    }

        return d
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
    
    containers = [document.getElementById("appAccessContainer"), document.getElementById("sympFreqContainer"), document.getElementById("userSympMapContainer"), document.getElementById("sympResponseContainer")]
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


function test() {
    console.log("test")
    
    appAccessData = getAppAccessData(master)
    
    appAccessData[1].unshift("Count")
    
    userIds = appAccessData[0]
    counts = appAccessData[1]
    
    var chart = c3.generate({
        bindto: '#chart1',
        data: {
            //make sure that graphableForecasted is plotted first so that it doesnt look like there is an extra forecasted point that is really the last actual value point
            columns: [
                counts
            ],
            colors: {
                Actual: "#29AFDF",
                Forecasted : "#ED2835"
            },
            type: 'bar'
        },
        subchart: {
            show: true
        },
        axis: {
            x: {
                type: 'categories',
                categories: userIds,
                tick: {
                    multiline: false,
                    culling: {
                        max: 15
                    }
                },
                label: {
                    text: 'User ID',
                    position: 'outer-center'
                }
            },
            y: {
                type: 'categories',
                categories: counts,
                label: {
                    text: "Count",
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
    
    symptomFrequencyData = getSymptomFrequencyData(master, "NO_SYMPTOMS_LOGGED")
    
    when = symptomFrequencyData[0]
    counts = symptomFrequencyData[1]
    
    var chart = c3.generate({
        bindto: '#chart2',
        data: {
            //make sure that graphableForecasted is plotted first so that it doesnt look like there is an extra forecasted point that is really the last actual value point
            columns: [
                counts
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
                text: 'Date',
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




