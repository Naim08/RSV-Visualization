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
    test()
    test2()
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
        o['When'] = new Date(data['When'][i].replace('-', '/'))
        o['When String'] = o['When'].toLocaleDateString()
        
        obs.push(o)
    }
    
    return obs
}

master = makeJSON(data)


function getUniqueIDsFromFilter(filter) {
    var d = []
    
    for (var i = 0; i < filter.length; i++) {
        d.push(filter[i]['Subject ID'])
    }
    
    return d.unique()
}

function getUniqueSymptomsFromFilter(filter) {
   var  d = []
    
    for (var i = 0; i < filter.length; i++) {
        d.push(filter[i]['Question Text'])
    }
    
    return d.unique()
}

function getUniqueDatesFromFilter(filter) {
     var d = []
    
    for (var i = 0; i < filter.length; i++) {
        d.push(filter[i]['When String'])
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
    var counts = []
    var uniqueIDs = getUniqueIDsFromFilter(master)
    
    for (var i = 0; i < uniqueIDs.length; i++) {
        rows = filter(master, "Subject ID", uniqueIDs[i])
        count = countDistWhen(rows)
        counts.push(count)
    }
    
    var results = []
    results[0] = uniqueIDs
    results[1] = counts
    
    return results
}

function getSymptomFrequencyData(master, symptom) {
    var start = filterByDate(new Date("2016/10/1"), new Date("2016/10/31"), master)
    var symptomFilter = filter(master, "Question Text", "NO_SYMPTOMS_LOGGED")
    
    var uniqueDates = getUniqueDatesFromFilter(symptomFilter)
    
    var counts = []
    
    for (var i = 0; i < uniqueDates.length; i++) {
        var rows = filter(symptomFilter, 'When String', uniqueDates[i])
        var count = rows.length
        counts.push(count)
    }
    
    var results = []
    results[0] = uniqueDates
    results[1] = counts
    
    return results
}

function countDistWhen(rows) {
    var d = {}
    
    for (var i = 0; i < rows.length; i++) {
        d[rows[i]['When String']] = 0
    }
    
    return Object.keys(d).length
}

function countDistResponse(rows) {
    var d = {}

    for (var i = 0; i < rows.length; i++) {
        if(d.hasOwnProperty(rows[i]['Response ID']) == false)
	    d[rows[i]['Response ID']] = 1
	    else {
		d[rows[i]['Response ID']] = d[rows[i]['Response ID']] + 1
	    }
    }

        return d
    }

function getSymptomResponseFrequencyData(master) {
    var symptomFilter = filter(master, "Question Text", "COUGHING")
    
    responses = countDistResponse(symptomFilter)
    
    results = []
    results[0] = []
    results[1] = []
    
    for (var key in responses) {
        if (responses.hasOwnProperty(key)) {
            results[0].push(key)
            results[1].push(responses[key])
        }
    }
    
    return results
}

function changeTab(element, graphContainer) {
    //grab the navbar from the dom
    var tabNav = document.getElementById("tabNav")
    //get the children (the <li> elements)
    var childrenLi = tabNav.children
    var tabs = []
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
    var appAccessData = getAppAccessData(master)
    
    appAccessData[1].unshift("Count")
    
    var userIds = appAccessData[0]
    var counts = appAccessData[1]
    
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
    var symptomFrequencyData = getSymptomFrequencyData(master, "NO_SYMPTOMS_LOGGED")
    symptomFrequencyData[1].unshift("Count")
    
    var when = symptomFrequencyData[0]
    var counts = symptomFrequencyData[1]
    
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

function test3() {
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
    
    var symptomResponseFrequencyData = getSymptomResponseFrequencyData(master)
    
    var responseIDs = symptomResponseFrequencyData[0]
    var counts = symptomResponseFrequencyData[1]
    counts.unshift("Count")
    
    var chart = c3.generate({
        bindto: '#chart4',
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
                categories: responseIDs,
                tick: {
                    multiline: false,
                    culling: {
                        max: 15
                    }
                },
                label: {
                text: 'Reponse ID',
                position: 'outer-center'
                }
            },
            y: {
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




