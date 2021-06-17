from django.http.response import JsonResponse, HttpResponse
from django.views.decorators.http import require_GET, require_POST
from django.shortcuts import render, get_object_or_404
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
import json


@require_GET
def home(request):
    user = request.user
    return render(request, 'home.html')


@require_POST
@csrf_exempt
def send_push(request):
    try:
        body = request.body
        data = json.loads(body)
        print(data)
        if 'head' not in data or 'body' not in data or 'id' not in data:
            return JsonResponse(status=400, data={"message": "Invalid data format"})

        payload = {'head': data['head'], 'body': data['body']}

        return JsonResponse(status=200, data={"message": "Web push successful"})
    except TypeError:
        return JsonResponse(status=500, data={"message": "An error occurred"})