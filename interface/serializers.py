# Сериализатор. Обработка данных перед отправкой пользователю
from rest_framework import serializers
from .models import ShiftsView, Shifts, NotificationView, Notification


class ShiftsViewSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShiftsView
        fields = '__all__'


# Сериализатор для добавления смены
class ShiftAddSerializer(serializers.ModelSerializer):
    class Meta:
        model = Shifts
        fields = ('employee', 'shift_type', 'start_time', 'end_time', 'is_approved',
                  'set_task', 'completed_task', 'created_at')


# Сериализатор для изменения смены
class ShiftUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Shifts
        fields = ('employee', 'shift_type', 'start_time', 'end_time', 'is_approved',
                  'set_task', 'completed_task')


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationView
        fields = '__all__'  # Выбираем все поля из модели


class NotificationAddSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['shift', 'user_send', 'user_accept', 'manager_accept', 'message', 'sent_at', 'is_read_user', 'is_read_manager']