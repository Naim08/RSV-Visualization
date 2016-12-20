from django.shortcuts import render
import os
import pandas as pd
import json, csv
import datetime
# Create your views here.
from django.http import HttpResponse
from django.contrib.auth.decorators import login_required

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