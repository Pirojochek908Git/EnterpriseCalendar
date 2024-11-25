# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey and OneToOneField has `on_delete` set to the desired behavior
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
from django.db import models


class WorkerType(models.Model):
    name = models.CharField(max_length=100)  # Название типа работника
    description = models.TextField(blank=True, null=True)  # Описание типа работника

    class Meta:
        managed = False
        db_table = 't_worker_type'


class User(models.Model):
    username = models.CharField(max_length=100)  # Имя пользователя для входа в систему
    password = models.CharField(max_length=255)  # Хешированный пароль пользователя
    login = models.EmailField(blank=True, null=True)  # Электронная почта пользователя
    is_active = models.BooleanField(default=True)  # Флаг активности учетной записи
    worker_type = models.ForeignKey(WorkerType, on_delete=models.SET_NULL, null=True, blank=True)  # Тип работника
    color = models.CharField(max_length=20)  # Цвет в графике

    class Meta:
        managed = False
        db_table = 't_users'


class ShiftType(models.Model):
    name = models.CharField(max_length=100)  # Название типа смены
    description = models.TextField(blank=True, null=True)  # Описание типа смены

    class Meta:
        managed = False
        db_table = 't_shift_type'


class Shifts(models.Model):
    employee = models.ForeignKey(User, on_delete=models.CASCADE)  # Сотрудник
    shift_type = models.ForeignKey(ShiftType, on_delete=models.CASCADE)  # Тип смены
    start_time = models.DateTimeField()  # Время начала смены
    end_time = models.DateTimeField()  # Время окончания смены
    is_approved = models.BooleanField(default=False)  # Статус утверждения смены
    set_task = models.TextField(blank=True, null=True)  # Поставленные задачи
    completed_task = models.TextField(blank=True, null=True)  # Выполненные задачи
    created_at = models.DateTimeField(auto_now_add=True)  # Дата и время создания смены

    class Meta:
        managed = False
        db_table = 't_shifts'


class Notification(models.Model):
    user_send = models.ForeignKey(User, related_name='sent_notifications', on_delete=models.CASCADE)  # Отправитель
    user_accept = models.ForeignKey(User, related_name='received_notifications', on_delete=models.CASCADE)  # Получатель
    shift = models.ForeignKey(Shifts, on_delete=models.CASCADE)  # Ссылка на смену
    manager_accept = models.ForeignKey(User, related_name='manager_notifications', on_delete=models.CASCADE) # Руководитель
    message = models.TextField()  # Текст уведомления
    sent_at = models.DateTimeField(auto_now_add=True)  # Дата и время отправки уведомления
    is_read_user = models.BooleanField(default=False)  # Статус прочтения уведомления
    is_read_manager = models.BooleanField(default=False)

    class Meta:
        managed = False
        db_table = 't_notifications'


class UserView(models.Model):
    id = models.IntegerField(primary_key=True)  # Уникальный идентификатор пользователя
    username = models.CharField(max_length=100)  # Имя пользователя
    password = models.CharField(max_length=255)  # Хешированный пароль
    login = models.EmailField(blank=True, null=True)  # Электронная почта
    is_active = models.BooleanField()  # Флаг активности
    worker_type_id = models.IntegerField()  # ID типа работника
    color = models.CharField(max_length=20)  # Цвет в графике
    worker_type_name = models.CharField(max_length=100)  # Название типа работника
    worker_type_description = models.TextField(blank=True, null=True)  # Описание типа работника

    class Meta:
        managed = False
        db_table = 'v_users'  # Связь с представлением v_users


class ShiftsView(models.Model):
    id = models.IntegerField(primary_key=True)  # Уникальный идентификатор смены
    employee_id = models.IntegerField()  # ID сотрудника
    username = models.CharField(max_length=100)  # Имя сотрудника
    login = models.EmailField(blank=True, null=True)  # Электронная почта сотрудника
    is_active = models.BooleanField()  # Флаг активности сотрудника
    color = models.CharField(max_length=20)  # Цвет сотрудника в графике
    worker_type_name = models.CharField(max_length=100)  # Название типа работника
    worker_type_description = models.TextField(blank=True, null=True)  # Описание типа работника
    shift_type_id = models.IntegerField()  # ID типа смены
    shift_type_name = models.CharField(max_length=250)
    shift_type_description = models.CharField(max_length=250)
    start_time = models.DateTimeField()  # Время начала смены
    end_time = models.DateTimeField()  # Время окончания смены
    is_approved = models.BooleanField()  # Статус утверждения смены
    set_task = models.TextField(blank=True, null=True)  # Поставленные задачи
    completed_task = models.TextField(blank=True, null=True)  # Выполненные задачи
    created_at = models.DateTimeField()  # Дата создания смены

    class Meta:
        managed = False
        db_table = 'v_shifts'  # Связь с представлением v_shifts


class NotificationView(models.Model):
    id = models.IntegerField(primary_key=True)  # Идентификатор уведомления
    user_id_send = models.IntegerField()  # ID отправителя
    username_send = models.CharField(max_length=255)  # Имя отправителя
    login_send = models.CharField(max_length=255)  # Логин отправителя
    worker_type_id_send = models.IntegerField()  # Тип работника отправителя
    worker_type_name_send = models.CharField(max_length=255)  # Название типа работника отправителя
    worker_type_description_send = models.TextField(null=True, blank=True)  # Описание типа работника отправителя
    color_send = models.CharField(max_length=50)  # Цвет отправителя
    is_active_send = models.BooleanField()  # Активен ли отправитель
    user_id_accept = models.IntegerField()  # ID получателя
    username_accept = models.CharField(max_length=255)  # Имя получателя
    login_accept = models.CharField(max_length=255)  # Логин получателя
    worker_type_id_accept = models.IntegerField()  # Тип работника получателя
    worker_type_name_accept = models.CharField(max_length=255)  # Название типа работника получателя
    worker_type_description_accept = models.TextField(null=True, blank=True)  # Описание типа работника получателя
    color_accept = models.CharField(max_length=50)  # Цвет получателя
    is_active_accept = models.BooleanField()  # Активен ли получатель
    manager_id_accept = models.IntegerField()  # ID менеджера
    username_manager = models.CharField(max_length=255)  # Имя менеджера
    login_manager = models.CharField(max_length=255)  # Логин менеджера
    worker_type_id_manager = models.IntegerField()  # Тип работника менеджера
    worker_type_name_manager = models.CharField(max_length=255)  # Название типа работника менеджера
    worker_type_description_manager = models.TextField(null=True, blank=True)  # Описание типа работника менеджера
    color_manager = models.CharField(max_length=50)  # Цвет менеджера
    is_active_manager = models.BooleanField()  # Активен ли менеджер
    shift_id = models.IntegerField()  # ID смены
    message = models.TextField()  # Текст уведомления
    sent_at = models.DateTimeField()  # Время отправки
    is_read_user = models.BooleanField()  # Прочитано ли уведомление
    is_read_manager = models.BooleanField()  # Прочитано ли уведомление

    class Meta:
        managed = False
        db_table = 'v_notifications'  # Связь с представлением v_shifts








