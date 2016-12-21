from django.shortcuts import render
import os
import pandas as pd
import json, csv
import datetime
# Create your views here.
from django.http import HttpResponse
from django.contrib.auth.decorators import login_required
import xlsxwriter

# Create your views here.
# this login required decorator is to not allow to any  
# view without authenticating
@login_required(login_url="login")
def index(request):
    path = os.getcwd() + '/media/outputUPDATED.csv'
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
    path = os.getcwd() + '/media/outputUPDATED.csv'
    #this should live elsewhere, definitely
    if os.path.exists(path):
        with open(path, "rb") as excel:
            data = excel.read()

        response = HttpResponse(data,content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        response['Content-Disposition'] = 'attachment; filename='+'output' + datetime.datetime.now().strftime('%m-%d-%Y-T-%H-%M-%S') + '.csv'
        return response    
def prepareData(request):
    cachedata = ''
    if request.method == 'GET':
        if 'storagecache' in request.GET:
            cachedata = request.GET['storagecache']
            cachedata = json.loads(cachedata)
            print('Cache value:')
            print(cachedata)
            path = os.getcwd() + '/media/testsheet.xlsx'
            workbook = xlsxwriter.Workbook(path)
            worksheet = workbook.add_worksheet()
            bold = workbook.add_format({'bold': 1})
            headings = ['userid', 'counts']
            worksheet.write_row('A1', headings, bold)
            del cachedata['Application Access Frequency']['count'][0]
            worksheet.write_column('A2', cachedata['Application Access Frequency']['userid'])
            worksheet.write_column('B2', cachedata['Application Access Frequency']['count'])

            chart1 = workbook.add_chart({'type': 'column'})
            chart1.add_series({
                'categories': '=Sheet1!$A$2:$A$'+str(len(cachedata['Application Access Frequency']['userid'])+1),
                'values':     '=Sheet1!$B$2:$B$'+str(len(cachedata['Application Access Frequency']['count'])+1),
                'gap':        500,
                })
            chart1.set_title ({'name': 'Application Access Frequency'})
            chart1.set_x_axis({'name': 'User ID'})
            chart1.set_y_axis({'name': 'Count'})
            chart1.set_size({'x_scale': .12*len(cachedata['Application Access Frequency']['userid']), 'y_scale': 3})
            # Set an Excel chart style.
            chart1.set_style(11)

            # Insert the chart into the worksheet (with an offset).
            worksheet.insert_chart('D2', chart1, {'x_offset': 50, 'y_offset': 10})

            workbook.close()
            data_start_loc = [0, 0] # xlsxwriter rquires list, no tuple
    return HttpResponse(cachedata)   
