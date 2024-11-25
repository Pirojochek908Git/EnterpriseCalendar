"""EnterpriseCalendar URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path

# from interface.views import interfaceAPIView
from interface.views import index, monitor, info, auth, profile, \
    CalendarApiData, ShiftAddData, ShiftUpdateView, DeleteShiftView, ShiftAnalyticsView, \
    EmployeeLoadAnalyticsView, ShiftTimeDistributionView, UnreadNotificationsView, MarkNotificationAsReadView, \
    AddNotificationView

urlpatterns = [
    # Главная страница
    path('', index),
    # Страница мониторинга
    path('monitor/', monitor),
    # Страница информации
    path('info/', info),
    # Страница авторизации
    path('auth/', auth),
    # Страница профиля
    path('profile/', profile),
    # Страница администратора
    path('admin/', admin.site.urls),
    # API для получения данных для календаря
    path('api/calendarData/', CalendarApiData.as_view(), name='calendar-data'),
    # API для добавления смены
    path('api/addShiftData', ShiftAddData.as_view(), name='shift-add'),

    path('notifications/unread/<int:user_id_accept>/', UnreadNotificationsView.as_view(), name='unread-notifications'),

    path('notifications/mark-as-read/<int:notification_id>/', MarkNotificationAsReadView.as_view(),
         name='mark-notification-as-read'),

    path('api/addNotification', AddNotificationView.as_view(), name='add-notification'),

    # API для изменения смены
    path('api/updateShiftData/<int:pk>/', ShiftUpdateView.as_view(), name='shift-update'),
    # API для удаления смены
    path('api/deleteShiftData/<int:shift_id>/', DeleteShiftView.as_view(), name='delete-shift'),
    # API для графика
    path('analytics/shifts-by-type/', ShiftAnalyticsView().get, name='shifts_by_type'),
    # API для добавления данных агента
    path('analytics/employee-load/', EmployeeLoadAnalyticsView().get, name='employee_load'),

    path('analytics/shift-time-distribution/', ShiftTimeDistributionView.as_view(), name='shift-time-distribution'),
]
