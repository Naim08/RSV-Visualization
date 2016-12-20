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

rsvfile = JSON.parse(data);

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
    aaf(false)
    sf(false)
    srf(false)
    af(false)
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

master = makeJSON(rsvfile)


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

function countDistWhen(rows) {
    d = {}
    
    for (var i = 0; i < rows.length; i++) {
        d[rows[i]['When']] = 0
    }
    
    return Object.keys(d).length
}

function getAppAccessData(master, useFilter) {
    var arr = master
    if (useFilter) {
        var startDate = $('#reportrangeAAF').data('daterangepicker').startDate;
        var endDate = $('#reportrangeAAF').data('daterangepicker').endDate;

        console.log(endDate)
        
        document.getElementById("dateAAF").innerHTML = startDate.format('M/D/YYYY') + ' - ' + endDate.format('M/D/YYYY')

        $('#reportrangeAAF span').html(startDate.format('MMMM D, YYYY') + ' - ' + endDate.format('MMMM D, YYYY'));

        
        arr = filterByDate(startDate, endDate, arr)
        
        var subjectIDSelect = document.getElementById("subjectidAAF")
        var subjectID = subjectIDSelect.options[subjectIDSelect.selectedIndex].text
        
        document.getElementById("userAAF").innerHTML = subjectID
        
        if (subjectID != 'All') {
            arr = filter(arr, "Subject ID", subjectID)
        }
    }
    
    var counts = []
    var uniqueIDs = getUniqueIDsFromFilter(arr)
    
    for (var i = 0; i < uniqueIDs.length; i++) {
        rows = filter(arr, "Subject ID", uniqueIDs[i])
        count = countDistWhen(rows)
        counts.push(count)
    }
    
    var results = []
    results[0] = uniqueIDs
    results[1] = counts
    
    return results
}


function getSymptomFrequencyData(master, useFilter) {
    var arr = master
    var symptomsToGraph = getUniqueSymptomsFromFilter(arr)
    
    if (useFilter) {      
        var startDate = $('#reportrangeSF').data('daterangepicker').startDate;
        var endDate = $('#reportrangeSF').data('daterangepicker').endDate;
        
        $('#reportrangeSF span').html(startDate.format('MMMM D, YYYY') + ' - ' + endDate.format('MMMM D, YYYY'));
        
        arr = filterByDate(startDate, endDate, arr)
        
        document.getElementById("dateSF").innerHTML = startDate.format('M/D/YYYY') + ' - ' + endDate.format('M/D/YYYY')
        
        var subjectIDSelect = document.getElementById("subjectidSF")
        var subjectID = subjectIDSelect.options[subjectIDSelect.selectedIndex].text
        

        console.log(subjectID)
        
        document.getElementById("userSF").innerHTML = subjectID
        

        if (subjectID != 'All') {
            arr = filter(arr, "Subject ID", subjectID)
        }
        
        var symptomSelect = document.getElementById("symptomidSF")
        var symptom = $("#symptomidSF option:selected")
        var selected = []
        $(symptom).each(function(index, brand){
            selected.push($(this).val());
        });
        
        if (selected.length == 0) {
            document.getElementById("sympSF").innerHTML = "All"
        }
        else if (selected.length > 3) {
            document.getElementById("sympSF").innerHTML = "4+ (See Data Filters Box)"
        }
        else{
            document.getElementById("sympSF").innerHTML = selected.toString()
        }
        
        
        if (selected.length != 0) {
            symptomsToGraph = selected
        }
        
        console.log(arr)
        
    }

    
    var uniqueDates = getUniqueDatesFromFilter(arr)
    
    var results = []
    results[0] = uniqueDates
    results[1] = []
    
    for (var j = 0; j < symptomsToGraph.length; j++) {
        f = filter(arr, "Question Text", symptomsToGraph[j])
        
        var counts = []

        for (var i = 0; i < uniqueDates.length; i++) {
            var rows = filter(f, 'When String', uniqueDates[i])
            var count = rows.length
            counts.push(count)
        }
        
        counts.unshift(symptomsToGraph[j])
        results[1].push(counts)
    }

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


function getSymptomResponseFrequencyData(master, useFilter) {
    var arr = master
     
    if (useFilter) {      
        var startDate = $('#reportrangeSRF').data('daterangepicker').startDate;
        var endDate = $('#reportrangeSRF').data('daterangepicker').endDate;
        
        $('#reportrangeSRF span').html(startDate.format('MMMM D, YYYY') + ' - ' + endDate.format('MMMM D, YYYY'));
        
        arr = filterByDate(startDate, endDate, arr)
        
        document.getElementById("dateSRF").innerHTML = startDate.format('M/D/YYYY') + ' - ' + endDate.format('M/D/YYYY')
        
        var subjectIDSelect = document.getElementById("subjectidSRF")
        var subjectID = subjectIDSelect.options[subjectIDSelect.selectedIndex].text
    
        
        document.getElementById("userSRF").innerHTML = subjectID
        
        if (subjectID != 'All') {
            arr = filter(arr, "Subject ID", subjectID)
        }
        
        var symptomSelect = document.getElementById("symptomidSRF")
        var symptom = symptomSelect.options[symptomSelect.selectedIndex].text
        
        console.log(symptom)
        
        document.getElementById("sympSRF").innerHTML = symptom
        
        arr = filter(arr, "Question Text", symptom)
        console.log(arr)
        

    }
    else {
        arr = filter(arr, "Question Text", "COUGHING")  
    }
    
    responses = countDistResponse(arr)
    
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

function getAdhocData(master, useFilter) {
    var arr = master
    if (useFilter) {
        var startDate = $('#reportrangeAF').data('daterangepicker').startDate;
        var endDate = $('#reportrangeAF').data('daterangepicker').endDate;
        
        $('#reportrangeAF span').html(startDate.format('MMMM D, YYYY') + ' - ' + endDate.format('MMMM D, YYYY'));
        
        arr = filterByDate(startDate, endDate, arr)
        
        document.getElementById("dateAF").innerHTML = startDate.format('M/D/YYYY') + ' - ' + endDate.format('M/D/YYYY')
        
        var subjectIDSelect = document.getElementById("subjectidAF")
        var subjectID = subjectIDSelect.options[subjectIDSelect.selectedIndex].text
        
        document.getElementById("userAF").innerHTML = subjectID
        
        if (subjectID != 'All') {
            arr = filter(arr, "Subject ID", subjectID)
        }

    }
    else {
        arr = filter(master, "Subject ID", 001)
    }
    
    var applicableSymptoms = ["FEEDING_ISSUES", "DEHYDRATION", "DIFFICULTY_BREATHING", "RUNNY_NOSE", "COUGHING", "RESPIRATORY_NOISE"]
    
    var uniqueDays = getUniqueDatesFromFilter(arr)
    
    results = []
    results[0] = []
    results[1] = []
    results[2] = []
    
    for (var i = 0; i < uniqueDays.length; i++) {
        s = 0
        
        rows = filter(arr, "When String", uniqueDays[i])
        
        for (var j = 0; j < rows.length; j++) {
            if (applicableSymptoms.contains(rows[j]['Question Text'])) {
                s += rows[j]['Response ID'] - 1
            }
        }
        
        results[0].push(uniqueDays[i])
        results[1].push(s)
    }
    
    for (var i = 0; i < results[1].length; i++) {
        if (results[1][i] >= 6) {
            results[2].push(results[1][i])
        }
        else {
            results[2].push(NaN)
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



function aaf(useFilter) {    
    var appAccessData = getAppAccessData(master, useFilter)
    
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
            type: 'bar',
            labels: true
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
            show: false,
        }
    });
    
    charts.push(chart)

}

function sf(useFilter) {
    var symptomFrequencyData = getSymptomFrequencyData(master, useFilter)
    
    var when = symptomFrequencyData[0]
    var symps = symptomFrequencyData[1]
    
    var chart = c3.generate({
        bindto: '#chart2',
        data: {
            //make sure that graphableForecasted is plotted first so that it doesnt look like there is an extra forecasted point that is really the last actual value point
            columns: symps,
            colors: {
                Actual: "#29AFDF",
                Forecasted : "#ED2835"
            },
            type: 'spline',
//            labels: true
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


function af(useFilter) {
    adHocData = getAdhocData(master, useFilter)
    
    dates = adHocData[0]
    sums = adHocData[1]
    over6 = adHocData[2]
    
    sums.unshift("Adhoc Sum")
    
    var chart = c3.generate({
        bindto: '#chart3',
        data: {
            //make sure that graphableForecasted is plotted first so that it doesnt look like there is an extra forecasted point that is really the last actual value point
            columns: [
                sums
            ],
            colors: {
                Actual: "#29AFDF",
                Forecasted : "#ED2835"
            },
            type: 'line',
            labels: true
        },
        subchart: {
            show: true
        },
        axis: {
            x: {
                type: 'categories',
                categories: dates,
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
                    text: "Sum",
                    position: 'outer-middle'

                }
            }
        },
        grid: {
        y: {
            lines: [
                {value: 6, text: 'Severity Sum  = 6'},
                ]
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

function srf(useFilter) {
    
    var symptomResponseFrequencyData = getSymptomResponseFrequencyData(master, useFilter)
    
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
            type: 'bar',
            labels: true
        },
        subchart: {
            show: false,
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
            show: false,
        }
    });
    
    charts.push(chart)

}




