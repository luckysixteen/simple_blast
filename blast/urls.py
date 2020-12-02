from django.urls import path

from . import views

app_name = 'blast'
urlpatterns = [
    path('', views.index, name='index'),
    path('search/', views.search, name='search'),
    path('<int:blast_id>/result/', views.result, name='result'),
]