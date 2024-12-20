# Представления. Формирование шаблонов и данных для серверного рендеринга
import requests
import json
from rest_framework import generics
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.http import JsonResponse
from rest_framework import status
from rest_framework.views import APIView
from django.http import HttpResponse
from django.template import loader
from django.views import View
from django.utils.timezone import now

from django.utils import timezone
from datetime import datetime, timedelta
from django.db.models import Count
from django.db.models import Sum, F, ExpressionWrapper, DurationField
from django.db.models.functions import Cast
from datetime import datetime

# Таблицы из модели
from .models import UserView, NotificationView, ShiftsView, ShiftType, WorkerType, Shifts, Notification
# Сериализаторы
from .serializers import ShiftsViewSerializer, ShiftAddSerializer, \
    ShiftUpdateSerializer, NotificationSerializer, NotificationAddSerializer


# Формирование данных для веб-страниц и рендер шаблона
# Формирование шаблона и данных для серверного рендеринга базовой страницы
def index(request):
    template = loader.get_template('interface/index.html')
    shiftType = ShiftType.objects.all()
    users = UserView.objects.all()
    workerType = WorkerType.objects.all()
    array = {'users': users,
             'shiftType': shiftType,
             'workerType': workerType}
    return HttpResponse(template.render(array, request))


# Формирование шаблона и данных для серверного рендеринга страницы с графиком
def monitor(request):
    template = loader.get_template('interface/monitor.html')
    users = UserView.objects.all()
    array = {'users': users}
    return HttpResponse(template.render(array, request))


# Формирование шаблона и данных для серверного рендеринга страницы с информацией
def info(request):
    template = loader.get_template('interface/info.html')
    users = UserView.objects.all()
    array = {'users': users}
    return HttpResponse(template.render(array, request))


# Формирование шаблона и данных для серверного рендеринга страницы с информацией
def auth(request):
    template = loader.get_template('interface/auth.html')
    users = UserView.objects.all()
    array = {'users': users}
    return HttpResponse(template.render(array, request))


# Формирование шаблона и данных для серверного рендеринга страницы с информацией
def profile(request):
    template = loader.get_template('interface/profile.html')
    notifications = NotificationView.objects.all()
    array = {'notifications': notifications}
    return HttpResponse(template.render(array, request))


# Данные для получения данных графика для определенного агента
class CalendarApiData(generics.ListAPIView):
    queryset = ShiftsView.objects.all()  # Укажите queryset
    serializer_class = ShiftsViewSerializer

    def post(self, request):
        # Создание экземпляра сериализатора с полученными данными запроса
        serializer = ShiftsViewSerializer(data=request.data)

        # Проверка валидности данных сериализатора
        if serializer.is_valid():
            shifts = ShiftsView.objects.all().values()
            return Response({'shifts': list(shifts)}, status=status.HTTP_200_OK)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# Добавление новой смены
class ShiftAddData(generics.CreateAPIView):
    queryset = Shifts.objects.all()
    serializer_class = ShiftAddSerializer

    def create(self, request, *args, **kwargs):
        # Используем стандартную логику создания записи
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)

        # Получаем ID созданной смены
        shift_id = serializer.instance.id

        # Возвращаем кастомный ответ с ID
        return Response(
            {
                "message": "Смена успешно добавлена",
                "data": serializer.data,
                "shift_id": shift_id  # Возвращаем ID созданной смены
            },
            status=status.HTTP_201_CREATED,
            headers=headers
        )


# Изменение смены
class ShiftUpdateView(APIView):
    def get_object(self, pk):
        try:
            return Shifts.objects.get(pk=pk)
        except Shifts.DoesNotExist:
            raise Http404

    def put(self, request, pk):
        shift = self.get_object(pk)
        serializer = ShiftUpdateSerializer(shift, data=request.data)

        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'Смена успешно обновлена'}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, pk):
        shift = self.get_object(pk)
        serializer = ShiftUpdateSerializer(shift, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'Смена частично обновлена'}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# Удаление смены
class DeleteShiftView(APIView):
    def delete(self, request, shift_id):
        try:
            shift = Shifts.objects.get(id=shift_id)
            shift.delete()
            return Response({"message": "Смена успешно удалена"}, status=status.HTTP_200_OK)
        except Shifts.DoesNotExist:
            return Response({"error": "Смена не найдена"}, status=status.HTTP_404_NOT_FOUND)


class UnreadNotificationsView(APIView):
    def get(self, request, user_id_accept):
        # Фильтруем данные
        notifications = NotificationView.objects.filter(user_id_accept=user_id_accept, is_read_user=False)

        # Сериализуем данные
        serializer = NotificationSerializer(notifications, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class MarkNotificationAsReadView(APIView):
    def post(self, request, notification_id):
        try:
            # Ищем уведомление по ID
            notification = Notification.objects.get(id=notification_id)

            # Обновляем статус прочтения для пользователя
            notification.is_read_user = True

            # Если руководитель совпадает с ID = 1, обновляем и для менеджера
            if notification.manager_accept_id == 1:
                notification.is_read_manager = True

            # Сохраняем изменения
            notification.save()

            return Response({"message": "Уведомление обновлено успешно."}, status=status.HTTP_200_OK)
        except Notification.DoesNotExist:
            return Response({"error": "Уведомление не найдено."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class AddNotificationView(APIView):
    def post(self, request):
        # Получаем данные из запроса
        data = request.data
        shift_id = data.get('shift')
        user_send = data.get('user_send')
        user_accept = data.get('user_accept')  # Новый параметр
        manager_accept = data.get('manager_accept', 1)  # По умолчанию ID руководителя = 1
        message = data.get('message', '')  # Сообщение

        # Формируем данные для уведомления
        notification_data = {
            'shift': shift_id,
            'user_send': user_send,
            'user_accept': user_accept,
            'manager_accept': manager_accept,
            'message': message,
            'sent_at': now(),
            'is_read_user': False,
            'is_read_manager': False
        }

        # Сериализация и сохранение
        serializer = NotificationAddSerializer(data=notification_data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ShiftAnalyticsView:
    def get(self, request):
        date_range = request.GET.get('date_range', 'day')
        selected_date = request.GET.get('selected_date', None)

        # Преобразуем выбранную дату в формат DateTime
        if selected_date:
            selected_date = datetime.strptime(selected_date, '%Y-%m-%d').date()

        # Устанавливаем фильтрацию по периоду
        if date_range == 'week' and selected_date:
            start_of_week = selected_date - timedelta(days=selected_date.weekday())  # Начало недели
            end_of_week = start_of_week + timedelta(days=6)  # Конец недели
            data = ShiftsView.objects.filter(start_time__date__range=[start_of_week, end_of_week]) \
                .values('shift_type_name') \
                .annotate(count=Count('id')) \
                .order_by('-count')
        elif date_range == 'month' and selected_date:
            # Получаем первый и последний день месяца для фильтрации
            start_of_month = selected_date.replace(day=1)  # Первое число месяца
            # Для получения последнего дня месяца
            if selected_date.month == 12:
                next_month = selected_date.replace(year=selected_date.year + 1, month=1, day=1)
            else:
                next_month = selected_date.replace(month=selected_date.month + 1, day=1)
            end_of_month = next_month - timedelta(days=1)  # Последний день месяца

            # Фильтруем данные по диапазону дат
            data = ShiftsView.objects.filter(start_time__date__range=[start_of_month, end_of_month]) \
                .values('shift_type_name') \
                .annotate(count=Count('id')) \
                .order_by('-count')
        else:  # Для дня по умолчанию
            if selected_date:
                data = ShiftsView.objects.filter(start_time__date=selected_date) \
                    .values('shift_type_name') \
                    .annotate(count=Count('id')) \
                    .order_by('-count')
            else:
                data = ShiftsView.objects.values('shift_type_name') \
                    .annotate(count=Count('id')) \
                    .order_by('-count')

        # Формирование JSON-ответа
        response_data = {
            "labels": [item['shift_type_name'] for item in data],
            "values": [item['count'] for item in data]
        }
        return JsonResponse(response_data)


class EmployeeLoadAnalyticsView:
    def get(self, request):
        # Получение параметров из запроса
        date_range = request.GET.get('date_range', 'day')  # 'day', 'week', 'month'
        selected_date = request.GET.get('selected_date', datetime.now().strftime('%Y-%m-%d'))

        # Преобразуем выбранную дату в объект datetime
        selected_date = datetime.strptime(selected_date, '%Y-%m-%d')

        # Определяем временные рамки в зависимости от date_range
        if date_range == 'day':
            start_date = selected_date
            end_date = selected_date + timedelta(days=1)
        elif date_range == 'week':
            start_date = selected_date - timedelta(days=selected_date.weekday())  # Понедельник
            end_date = start_date + timedelta(days=7)
        elif date_range == 'month':
            start_date = selected_date.replace(day=1)
            next_month = start_date.replace(day=28) + timedelta(days=4)  # Переход на следующий месяц
            end_date = next_month.replace(day=1)
        else:
            return JsonResponse({"error": "Invalid date_range parameter"}, status=400)

        # Получаем данные с агрегатным подсчётом времени
        data = (
            ShiftsView.objects.filter(start_time__gte=start_date, end_time__lte=end_date)
            .annotate(work_time=ExpressionWrapper(
                F('end_time') - F('start_time'), output_field=DurationField()
            ))
            .values('username', 'login')  # Получаем username
            .annotate(total_work=Sum('work_time'))
            .order_by('-total_work')
        )

        # Преобразуем username в формат "Фамилия И.О."
        formatted_data = []
        for item in data:
            username_parts = item['username'].split(' ')
            if len(username_parts) >= 2:
                full_name = f"{username_parts[0]} {username_parts[1][0]}."
            else:
                full_name = username_parts[0]  # Если только одно имя, то выводим его как есть
            formatted_data.append({
                "name": full_name,
                "login": item['login'],
                "total_work": item['total_work'].total_seconds() / 3600  # Часы
            })

        # Формируем JSON-ответ
        response_data = {
            "labels": [item['name'] for item in formatted_data],
            "values": [item['total_work'] for item in formatted_data]
        }
        return JsonResponse(response_data)


class ShiftTimeDistributionView(View):
    def get(self, request):
        # Получаем параметры date_range и selected_date из запроса
        date_range = request.GET.get('date_range', 'day')
        selected_date = request.GET.get('selected_date', timezone.now().strftime('%Y-%m-%d'))

        # Преобразуем строку в объект даты
        selected_date = datetime.strptime(selected_date, '%Y-%m-%d')

        # В зависимости от выбранного диапазона, рассчитываем start_date и end_date
        if date_range == 'day':
            # Для дня start_date и end_date совпадают с выбранной датой
            start_date = selected_date
            end_date = selected_date + timedelta(days=1)
        elif date_range == 'week':
            # Для недели start_date - начало недели, end_date - конец недели
            start_date = selected_date - timedelta(days=selected_date.weekday())  # Понедельник этой недели
            end_date = start_date + timedelta(days=7)  # Конец недели (воскресенье)
        elif date_range == 'month':
            # Для месяца start_date - первое число месяца, end_date - первое число следующего месяца
            start_date = selected_date.replace(day=1)
            end_date = (start_date.replace(month=start_date.month % 12 + 1, day=1)
                        if start_date.month < 12
                        else start_date.replace(year=start_date.year + 1, month=1, day=1))

        # Классификация смен по времени суток
        shift_categories = {
            "Утро": (6, 12),
            "День": (12, 18),
            "Вечер": (18, 22),
            "Ночь": (22, 6)
        }

        # Подсчет смен в каждый период времени суток
        shift_counts = {category: 0 for category in shift_categories}

        # Получаем смены в заданном диапазоне времени
        shifts = ShiftsView.objects.filter(start_time__gte=start_date, end_time__lte=end_date)

        for shift in shifts:
            start_hour = shift.start_time.hour
            for category, (start, end) in shift_categories.items():
                if start <= end:
                    # Для "Утро", "День", "Вечер" — обычная логика
                    if start <= start_hour < end:
                        shift_counts[category] += 1
                        break
                else:
                    # Для "Ночь" (с 22:00 до 6:00) — обрабатываем смены, пересекающие полночь
                    if start_hour >= start or start_hour < end:
                        shift_counts[category] += 1
                        break

        # Подготавливаем данные для графика
        response_data = {
            "categories": list(shift_counts.keys()),
            "values": list(shift_counts.values())
        }

        return JsonResponse(response_data)