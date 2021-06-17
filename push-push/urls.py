from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView

from .views import home

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', home),
    path('firebase-messaging-sw.js', TemplateView.as_view(template_name='firebase-messaging-sw.js', content_type='application/x-javascript'))

]

urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)