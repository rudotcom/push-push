from django.views.decorators.http import require_GET
from django.shortcuts import render


@require_GET
def home(request):
    user = request.user
    return render(request, 'home.html')
