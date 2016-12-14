from django.shortcuts import render
import os
import pandas as pd
# Create your views here.
from django.http import HttpResponse


def index(request):
    path = os.getcwd() + '/media/outputUPDATED.csv'
    rsvfile = pd.read_csv(path)
    return render(request, 'index.html', {'rsvfile': rsvfile})
