from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView
from django.views.decorators.csrf import csrf_exempt

from push.views import home, save_token

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', csrf_exempt(home)),
    path('firebase/', csrf_exempt(save_token)),
    # path('sw.js', TemplateView.as_view(template_name='sw.js', content_type='application/x-javascript')),
    path('firebase-messaging-sw.js', TemplateView.as_view(template_name='firebase-messaging-sw.js', content_type='application/x-javascript')),

]

urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)