# Регистрация моделей
from django.contrib import admin

# Register your models here.
from .models import WorkerType, User, ShiftType, Shifts, Notification
from .models import UserView, ShiftsView, NotificationView

admin.site.register(WorkerType)
admin.site.register(User)
admin.site.register(ShiftType)
admin.site.register(Shifts)
admin.site.register(Notification)

admin.site.register(UserView)
admin.site.register(ShiftsView)
admin.site.register(NotificationView)




