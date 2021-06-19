import requests
from django.conf import settings
from django.http.response import JsonResponse, HttpResponse
from django.views.decorators.http import require_GET, require_POST
from django.shortcuts import render
import json


@require_GET
def home(request):
    user = request.user

    return render(request, 'home.html')


@require_POST
def save_token(request):
    token = request.POST.get('token')

    data = {
        "notification": {
            "title": "Ваш заказ готов к выдаче",
            "body": "Заказ № 0000 готов к выдаче. Приятного аппетита!",
            "icon": "/static/burger.png",
            "click_action": f'https://{settings.SITE_URL}/'
        },
        "to": token
    }

    headers = {'Content-Type': 'application/json', 'Authorization': 'key=AAAAnWgu_Ro:APA91bHJ7sudUMquTVgnSFEQE7MOvsb8Qwf_cGRZN11Do7Z7x2StayBP_zEL5YVKUzvqubd7KFJ317CLL4bD77s-bHroEfW6GvajPnGKsr1QZTOq5wuZt_2WbbvZ7d2SA4dyyC10fgdP'}

    response = requests.post('https://fcm.googleapis.com/fcm/send', data=json.dumps(data), headers=headers)
    content = response.content
    print(content)

    return HttpResponse(str(content))



@require_POST
def send_firebase_message(request):
    try:
        session_key = request.session.session_key
        print(request.POST.get('token'))

        return HttpResponse(status=200)
    except Exception:
        return HttpResponse(status=500)


# @require_POST
# @csrf_exempt
# def send_push(request):
#     try:
#         body = request.body
#         data = json.loads(body)
#
#         if 'head' not in data or 'body' not in data or 'id' not in data:
#             return JsonResponse(status=400, data={"message": "Invalid data format"})
#
#         user_id = data['id']
#         user = get_object_or_404(User, pk=user_id)
#         payload = {'head': data['head'], 'body': data['body']}
#         send_user_notification(user=user, payload=payload, ttl=1000)
#
#         return JsonResponse(status=200, data={"message": "Web push successful"})
#     except TypeError:
#         return JsonResponse(status=500, data={"message": "An error occurred"})