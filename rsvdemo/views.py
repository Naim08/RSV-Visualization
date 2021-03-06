from django.shortcuts import render
import os
import pandas as pd
import json, csv, copy, mimetypes
from shutil import make_archive
import datetime
# Create your views here.
from django.http import HttpResponse
from django.contrib.auth.decorators import login_required
import xlsxwriter
from selenium import webdriver
import sys
from wsgiref.util import FileWrapper

#achive folder to zipfiles
def zipdir(path, ziph):
    # ziph is zipfile handle
    make_archive('zipfile', 'gztar', 'media/rsvfiles')

#creating a stupid global variable. I hope someone forgives me@@
cachedata = ''

# Create your views here.
# this login required decorator is to not allow to any  
# view without authenticating
@login_required(login_url="login")
def index(request):
    path = os.getcwd() + '/media/rsvfiles/outputUPDATED.csv'
    f = open(path)
    df = {
        'Subject ID': [],
        'Site ID': [],
        'Platform': [],
        'App Version': [],
         'When': [],
        'Question ID': [],
        'Question Text': [],
        'Response ID': [],
        'Response Text': [],
        'Therm': []
        }
    csv_f = csv.reader(f)
    for row in csv_f:
        df['Subject ID'].append(unicode(row[0], errors='replace'))
        df['Site ID'].append(unicode(row[1], errors='replace'))
        df['Platform'].append(unicode(row[2], errors='replace'))
        df['App Version'].append(unicode(row[3], errors='replace'))
        df['When'].append(unicode(row[4], errors='replace'))
        df['Question ID'].append(unicode(row[5], errors='replace'))
        df['Question Text'].append(unicode(row[6], errors='replace'))
        df['Response ID'].append(unicode(row[7], errors='replace'))
        df['Response Text'].append(unicode(row[8], errors='replace'))
        df['Therm'].append(unicode(row[9], errors='replace'))
    return render(request, 'index.html', {'rsvfile':json.dumps(df)})

def download(request):
    path = os.getcwd() + '/zipfile.tar.gz'
    #this should live elsewhere, definitely
    if os.path.exists(path):
        response = HttpResponse(FileWrapper(open(path, 'rb')),  # notice extra 'rb'
                           content_type=mimetypes.guess_type(path)[0])
        response['Content-Disposition'] = 'attachment; filename='+'zipfile.tar.gz'
        return response    
def prepareData(request):
    global cachedata
    if request.method == 'GET':
        if 'storagecache' in request.GET:
            cachedata = request.GET['storagecache']
            cachedata = json.loads(cachedata)
            localdata = copy.copy(cachedata)
            
            if sys.platform.startswith('win'):
                driver = webdriver.PhantomJS()
            elif sys.platform.startswith('dar'):
                path = os.getcwd() + '/media/phantomjs-2.1.1-macosx/bin/phantomjs'
                driver = webdriver.PhantomJS(executable_path=path)
            else:
                driver = webdriver.PhantomJS()

                
            
            driver.set_window_size(1500, 1200)
            driver.get('http://localhost:80/rsvdemo/generateGraph/')
            driver.save_screenshot(os.getcwd() + '/media/rsvfiles/website.png')
            driver.quit()
            
            mediapath = os.getcwd() + '/media/rsvfiles/filtersheet.xlsx'
            workbook = xlsxwriter.Workbook(mediapath)
            aaf = 'Application Access Frequency'
            sf = 'Symptom Frequency'
            srf = 'Response Frequency'
            aqf = 'Adhoc Query Frequency' 
            worksheet = workbook.add_worksheet(aaf)
            worksheet2 = workbook.add_worksheet(sf)
            worksheet3 = workbook.add_worksheet(aqf)
            worksheet4 = workbook.add_worksheet(srf)
            bold = workbook.add_format({'bold': 1})
            sfHeaders = []
            adHeaders = []
            sfHeaders.append('Dates')
            adHeaders.append('Dates')
            for i in localdata[sf]['count']:
                sfHeaders.append(i[0])
                del i[0]
            for i in localdata[aqf]['sums']:
                adHeaders.append(i[0])
                del i[0]      
            worksheet.write_row('A1', ['userid', 'Count'], bold)
            worksheet2.write_row('A1', sfHeaders, bold)
            worksheet3.write_row('A1', adHeaders, bold)
            worksheet4.write_row('A1', ['Response ID', 'Count'], bold)

            del localdata['Application Access Frequency']['count'][0]
            del localdata[srf]['count'][0]

            #worksheet 1
            worksheet.write_column('A2', localdata['Application Access Frequency']['userid'])
            worksheet.write_column('B2', localdata['Application Access Frequency']['count'])

            #worksheet 2
            worksheet2.write_column('A2', localdata[sf]['dates'])
            for colnum in range(0, len(localdata[sf]['count'])):
                for row in range(0,len(localdata[sf]['count'][colnum])):
                    worksheet2.write(row+1, colnum+1, localdata[sf]['count'][colnum][row])

            #worksheet 3
            worksheet3.write_column('A2', localdata[aqf]['dates'])
            for colnum in range(0, len(localdata[aqf]['sums'])):
                for row in range(0,len(localdata[aqf]['sums'][colnum])):
                    worksheet3.write(row+1, colnum+1, localdata[aqf]['sums'][colnum][row])
            #shortsheet 4
            worksheet4.write_column('A2', localdata[srf]['responseIDs'])
            worksheet4.write_column('B2', localdata[srf]['count'])

            #init each new graph
            chart1 = workbook.add_chart({'type': 'column'})
            chart2 = workbook.add_chart({'type': 'line'})
            
            chart4 = workbook.add_chart({'type': 'column'})
            chart3 = workbook.add_chart({'type': 'line'})
           
            #add series data
            for sym in range(0, len(localdata[sf]['count'])):
                currCol = unichr(sym+66)
                chart2.add_series({
                'categories': '='+sf+'!$A$2:$A$'+str(len(localdata[sf]['dates'])+1), #x value
                'values':     '='+sf+'!$'+currCol+'$2:$'+currCol+'$'+str(len(localdata[sf]['count'])+1), #y values
                'gap':        500, #gap?
                }) 

            for adhoc in range(0, len(localdata[aqf]['sums'])):
                currCo = unichr(adhoc+66)
                chart3.add_series({
                'categories': '=Adhoc Query Frequency!$A$2:$A$72', #x value
                'values':     '=Adhoc Query Frequency!$'+currCo+'$2:$'+currCo+'$'+str(len(localdata[aqf]['sums'])+1), #y values
                })      

            chart1.add_series({
                'categories': '='+aaf+'!$A$2:$A$'+str(len(localdata['Application Access Frequency']['userid'])+1), #x value
                'values':     '='+aaf+'!$B$2:$B$'+str(len(localdata['Application Access Frequency']['count'])+1), #y values
                'gap':        500, #gap?
                })
            chart4.add_series({
                'categories': '='+srf+'!$A$2:$A$'+str(len(localdata[srf]['responseIDs'])+1), #x value
                'values':     '='+srf+'!$B$2:$B$'+str(len(localdata[srf]['count'])+1), #y values
                'gap':        500, #gap?
                })

            chart4.set_title ({'name': srf})
            chart4.set_x_axis({'name': 'Response ID'})
            chart4.set_y_axis({'name': 'Count'})
            chart4.set_size({'x_scale': .5*len(localdata[srf]['responseIDs']), 'y_scale': 3})
            chart3.set_title ({'name': aqf})
            chart3.set_x_axis({'name': 'Dates'})
            chart3.set_y_axis({'name': 'Sums'})
            chart3.set_size({'x_scale': .1*len(localdata[aqf]['dates']), 'y_scale': 3})

            chart2.set_title ({'name': sf})
            chart2.set_x_axis({'name': 'Dates'})
            chart2.set_y_axis({'name': 'Count'})
            chart2.set_size({'x_scale': .05*len(localdata[sf]['dates']), 'y_scale': 3})

            chart1.set_title ({'name': 'Application Access Frequency'})
            chart1.set_x_axis({'name': 'User ID'})
            chart1.set_y_axis({'name': 'Count'})
            chart1.set_size({'x_scale': .12*len(localdata['Application Access Frequency']['userid']), 'y_scale': 3})
            # Set an Excel chart style.
            chart1.set_style(11)
            chart4.set_style(11)
            chart3.set_style(11)
            chart2.set_style(11)

            # # Insert the chart into the worksheet (with an offset).
            # worksheet.insert_chart('D2', chart1, {'x_offset': 50, 'y_offset': 10})
            # worksheet4.insert_chart('D2', chart4, {'x_offset': 50, 'y_offset': 10})
            # worksheet2.insert_chart('Q2', chart2, {'x_offset': 50, 'y_offset': 10})
            # worksheet3.insert_chart('Q2', chart3, {'x_offset': 50, 'y_offset': 10})

            workbook.close()
            make_archive('zipfile', 'gztar', 'media/rsvfiles')
    return HttpResponse(cachedata)  
def generateGraph(request):

    return render(request, 'generateGraph.html', {'cachedata':json.dumps(cachedata)}) 
