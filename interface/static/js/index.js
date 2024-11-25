document.addEventListener('DOMContentLoaded', async () => {
    const calendarEl = document.getElementById('calendar');
    if (!calendarEl) {
        console.error('Элемент с ID "calendar" не найден.');
        return;
    }

    // Получаем значение из #activeUserId
    var activeUserId = document.getElementById("activeUserId").textContent;
    document.getElementById('addEventEmployee').value = activeUserId;
    // Условие для отображения/скрытия элементов
    if (activeUserId == "1") {
        // Если значение равно 1, показываем элементы
        document.getElementById("addAdminApprove").style.display = "block";
        document.getElementById("editAdminApprove").style.display = "block";
        document.getElementById("editEventEmployee").disabled = false;
        document.getElementById("addEventEmployee").disabled = false;

    } else {
        // Если значение не равно 1, скрываем элементы
        document.getElementById("addAdminApprove").style.display = "none";
        document.getElementById("editAdminApprove").style.display = "none";
        document.getElementById("editEventEmployee").disabled = true;
        document.getElementById("addEventEmployee").disabled = true;
    }

    // Вспомогательная функция для получения CSRF-токена из cookie
    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.startsWith(name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    const addEventModal = new bootstrap.Modal(document.getElementById('addEventModal'));
    const editEventModal = new bootstrap.Modal(document.getElementById('editEventModal'));
    const addEventForm = document.getElementById('addEventForm');
    const editEventForm = document.getElementById('editEventForm');
    const deleteEventBtn = document.getElementById('deleteEventBtn');

    let selectedEvent = null;

    // Функция для преобразования времени в локальный часовой пояс
    const convertUTCToLocal = (utcDate) => {
        const localDate = new Date(utcDate.getTime() - utcDate.getTimezoneOffset() * 60000);
        return localDate.toISOString().slice(0, 16); // Преобразуем в формат YYYY-MM-DDTHH:mm
    };

    // Функция для преобразования времени из локального в UTC
    const convertLocalToUTC = (localDate) => {
        const date = new Date(localDate);
        return new Date(date.getTime() + date.getTimezoneOffset() * 60000).toISOString(); // Возвращаем в формате UTC
    };

    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'timeGridWeek',
        locale: 'ru',
        themeSystem: 'bootstrap5',
        timeZone: 'local', // Используем локальный часовой пояс
        firstDay: 1, // Устанавливаем понедельник первым днем недели
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'timeGridWeek,timeGridDay,listWeek'
        },
        buttonText: {
            today: 'Сегодняшний день',
            week: 'Неделя',
            day: 'День',
            list: 'Список'
        },
        eventSources: [
            {
                url: '/api/calendarData/', // Ваш API для загрузки событий
                method: 'GET',
                failure: function () {
                    alert('Не удалось загрузить данные для календаря.');
                },
                success: function (apiEvents) {
                    // Преобразуем данные в нужный формат
                    return apiEvents.map(event => ({
                        id: event.id,
                        title: event.username, // Имя сотрудника как заголовок события
                        start: event.start_time,
                        end: event.end_time,
                        color: event.color, // Цвет события
                        extendedProps: {
                            employeeId: event.employee_id,
                            employee: event.username,
                            position: event.worker_type_name,
                            typeId: event.shift_type_id,
                            type: event.shift_type_name,
                            task: event.set_task,
                            completedWork: event.completed_task,
                            isApproved: event.is_approved,
                        }
                    }));
                },
            }
        ],
        editable: true,
        selectable: true,
        allDaySlot: false,
        select: (info) => {
            // Используем локальное время, чтобы не было разницы
            document.getElementById('addEventStart').value = convertUTCToLocal(info.start);
            document.getElementById('addEventEnd').value = convertUTCToLocal(info.end);
            addEventModal.show();
        },
        eventContent: function (info) {
            const event = info.event;
            const dateTimeStart = convertUTCToLocal(event.start)
            const dateTimeEnd = convertUTCToLocal(event.end)
            const timeStart = dateTimeStart.split('T')[1];
            const timeEnd = dateTimeEnd.split('T')[1];

            const {type, employee, position, task, completedWork, isApproved} = event.extendedProps;

            const content = document.createElement('div');
            content.innerHTML = `
               <div class="fc-event-description text-dark">
                   <p class="text-center" style="margin: 0; padding: 0">
                    ${isApproved ? '<img width="12" height="12" src="/static/img/approve.png">' : ''}
                   <strong>${timeStart} — ${timeEnd}</strong></p>
                   <hr style="margin: 0; padding: 0; border: none; border-top: 1px solid #ccc;">
                   <p class="text-center"><strong>${employee}</strong>
                   <br><u>${position}</u></p><br><hr>
                   <p><img width="15" height="15"
                                 src="/static/img/task.png"><strong> Тип смены:</strong><br>${type}</p>
                   <p><img width="15" height="15"
                                 src="/static/img/work-in-progress.png"><strong> Задания:</strong><br> ${task ? task : 'Не указано'}<br></p>
                   <p><img width="15" height="15"
                                 src="/static/img/loading.png"><strong> Выполнено:</strong><br> ${completedWork ? completedWork : 'Не указано'}<br></p>
               </div>
            `;


            return {domNodes: [content]};
        },
        eventClick: (info) => {
            selectedEvent = info.event;
            const employeeIdEvent = selectedEvent.extendedProps.employeeId
            // Заполнение формы редактирования
            const eventProps = selectedEvent.extendedProps;
            document.getElementById('editShiftId').value = selectedEvent.id;
            document.getElementById('editEventEmployee').value = eventProps.employeeId;
            document.getElementById('editEventShiftType').value = eventProps.typeId;
            document.getElementById('editEventStart').value = convertUTCToLocal(selectedEvent.start);
            document.getElementById('editEventEnd').value = convertUTCToLocal(selectedEvent.end);
            document.getElementById('editEventTask').value = eventProps.task || '';
            document.getElementById('editEventCompletedWork').value = eventProps.completedWork || '';
            document.getElementById('editEventShiftApprove').checked = eventProps.isApproved;
            if (employeeIdEvent == activeUserId) {
                editEventModal.show();
            } else if (activeUserId == 1) {
                editEventModal.show();
            } else {
                alert('У Вас нет прав для редактирования модального окна!')
            }

        }
    });

    addEventForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const employee = document.getElementById('addEventEmployee').value;
        const eventType = document.getElementById('addEventShiftType').value;
        const start = document.getElementById('addEventStart').value;
        const end = document.getElementById('addEventEnd').value;
        const task = document.getElementById('addEventTask').value;
        const completedWork = document.getElementById('addEventCompletedWork').value;
        const isApproved = document.getElementById('addEventShiftApprove').checked;

        const requestData = {
            employee: employee,
            shift_type: eventType,
            start_time: start,
            end_time: end,
            is_approved: isApproved,
            set_task: task,
            completed_task: completedWork
        };

        // Отправка POST-запроса для создания смены
        fetch('/api/addShiftData', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify(requestData)
        })
            .then((response) => {
                if (response.ok) {
                    return response.json();
                } else {
                    return response.json().then((errorData) => {
                        throw new Error(JSON.stringify(errorData));
                    });
                }
            })
            .then((responseData) => {
                console.log('Смена успешно добавлена:', responseData);

                // Проверяем, активен ли чекбокс
                const isSendNotificationChecked = document.getElementById('addEventShiftSendCheck').checked;
                if (isSendNotificationChecked) {
                    const shiftId = responseData.shift_id;
                    const userAccept = document.getElementById('addEventShiftSend').value;
                    const message = document.getElementById('addShiftMessage').value;

                    // Формируем данные для уведомления
                    const notificationData = {
                        shift: shiftId,
                        user_send: activeUserId,
                        user_accept: userAccept,
                        message: message,
                        manager_accept: 1 // ID руководителя
                    };

                    console.log('Отправка уведомления:', notificationData);

                    return fetch('/api/addNotification', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRFToken': getCookie('csrftoken')
                        },
                        body: JSON.stringify(notificationData)
                    });
                } else {
                    console.log('Чекбокс не установлен, уведомление не отправляется.');
                    return Promise.resolve();
                }
            })
            .then((notifResponse) => {
                if (notifResponse && notifResponse.ok) {
                    console.log('Уведомление успешно отправлено.');
                    alert('Смена и уведомление успешно добавлены!');
                } else if (notifResponse) {
                    throw new Error('Ошибка при создании уведомления');
                }
            })
            .catch((error) => {
                console.error('Ошибка:', error);
                alert('Произошла ошибка. Проверьте введённые данные.');
            })
            .finally(() => {
                addEventModal.hide();
                addEventForm.reset();
                calendar.refetchEvents();
            });
    });

    editEventForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const shiftId = document.getElementById('editShiftId').value;
        const employee = document.getElementById('editEventEmployee').value;
        const shiftType = document.getElementById('editEventShiftType').value;
        const start = document.getElementById('editEventStart').value;
        const end = document.getElementById('editEventEnd').value;
        const task = document.getElementById('editEventTask').value;
        const completedWork = document.getElementById('editEventCompletedWork').value;
        const isApproved = document.getElementById('editEventShiftApprove').checked;

        const updateEventData = {
            employee: employee,
            shift_type: shiftType,
            start_time: start,
            end_time: end,
            set_task: task,
            completed_task: completedWork,
            is_approved: isApproved
        };

        // Отправка PUT-запроса для обновления смены
        fetch(`/api/updateShiftData/${shiftId}/`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify(updateEventData)
        })
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    return response.json().then(errorData => {
                        throw new Error(JSON.stringify(errorData));
                    });
                }
            })
            .then(data => {
                console.log('Смена успешно обновлена:', data);

                // Проверяем, установлен ли чекбокс
                const isSendNotificationChecked = document.getElementById('editEventShiftSendCheck').checked;
                if (isSendNotificationChecked) {
                    const userAccept = document.getElementById('editEventShiftSend').value;
                    const message = document.getElementById('editShiftMessage').value;

                    // Формируем данные для уведомления
                    const notificationData = {
                        shift: shiftId,
                        user_send: activeUserId,
                        user_accept: userAccept,
                        message: message,
                        manager_accept: 1 // ID руководителя
                    };

                    console.log('Отправка уведомления:', notificationData);

                    return fetch('/api/addNotification', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRFToken': getCookie('csrftoken')
                        },
                        body: JSON.stringify(notificationData)
                    });
                } else {
                    console.log('Чекбокс не установлен, уведомление не отправляется.');
                    return Promise.resolve();
                }
            })
            .then((notifResponse) => {
                if (notifResponse && notifResponse.ok) {
                    console.log('Уведомление успешно отправлено.');
                    alert('Смена обновлена, уведомление отправлено.');
                } else if (notifResponse) {
                    throw new Error('Ошибка при создании уведомления');
                } else {
                    alert('Смена успешно обновлена.');
                }
            })
            .catch(error => {
                console.error('Ошибка:', error);
                alert('Произошла ошибка. Проверьте введённые данные.');
            })
            .finally(() => {
                // Сброс формы и скрытие модального окна
                editEventModal.hide();
                editEventForm.reset();
                calendar.refetchEvents();
            });
    });


    deleteEventBtn.addEventListener('click', () => {
        const shiftId = selectedEvent.id; // ID выбранного события

        fetch(`/api/deleteShiftData/${shiftId}/`, {
            method: 'DELETE',
            headers: {
                'X-CSRFToken': getCookie('csrftoken') // Если используется CSRF защита
            }
        })
            .then(response => response.json())
            .then(data => {
                if (data.message) {
                    console.log(data.message); // "Смена успешно удалена"
                    alert('Смена успешно удалена!');
                    calendar.refetchEvents(); // Удаление события из календаря
                } else if (data.error) {
                    console.error(data.error);
                    alert('Ошибка при удалении смены: ' + data.error);
                }
            })
            .catch(error => {
                console.error('Ошибка:', error);
                alert('Произошла ошибка при соединении с сервером.');
            }).finally(() => {
            // Сброс формы и скрытие модального окна
            editEventModal.hide();
            editEventForm.reset();
        });
    });

    calendar.render();
});
