document.addEventListener('DOMContentLoaded', function () {
    // Получаем данные из localStorage
    const userData = JSON.parse(localStorage.getItem('activeUser'));

    if (userData) {
        // Заполняем данные в соответствующие элементы
        document.getElementById('activeUserName').textContent = userData.username;
        document.getElementById('activeUserLogin').textContent = userData.login;
        document.getElementById('activeUserPassword').textContent = userData.password;
        document.getElementById('activeUserId').textContent = userData.id;
        document.getElementById('activeUserWorkerTypeId').textContent = userData.worker_type_id;
        document.getElementById('activeUserWorkerTypeName').textContent = userData.worker_type_name;
        document.getElementById('activeUserWorkerTypeDescription').textContent = userData.worker_type_description;
        document.getElementById('activeUserColor').textContent = userData.color;
        document.getElementById('activeUserStatus').textContent = userData.is_active;

        // Устанавливаем путь к изображению
        const userImage = document.querySelector('.img-profile');
        userImage.src = userData.img_path || '/static/img/users/user.png'; // Используем default.png, если img_path не указан
    } else {
        console.error('Нет данных пользователя в localStorage!');
    }

    const activeUserId = userData ? userData.id : null; // Получаем ID активного пользователя
    const dropdownMenu = document.getElementById('notificationsDropdown');

    if (activeUserId) {
        // Функция для загрузки уведомлений
        function loadNotifications() {
            // Запрос к API для получения уведомлений
            fetch(`/notifications/unread/${activeUserId}/`)
                .then(response => response.json())
                .then(data => {
                    // Очищаем меню перед добавлением новых элементов
                    dropdownMenu.innerHTML = '';

                    if (data.length === 0) {
                        // Если уведомлений нет
                        dropdownMenu.innerHTML = `<li><a class="dropdown-item" href="#">Нет новых уведомлений</a></li>`;
                    } else {
                        // Динамически добавляем уведомления
                        data.forEach(notification => {
                            const listItem = document.createElement('li');
                            listItem.innerHTML = `
                              <a class="dropdown-item d-flex align-items-center" href="#" data-id="${notification.id}">
                                <img class="img-profile rounded-circle me-2" width="30" height="30" 
                                     src="/static/img/users/${notification.login_send}.png" alt="${notification.username_send}">
                                ${notification.message}
                              </a>`;
                            dropdownMenu.appendChild(listItem);
                        });

                        // Добавляем обработчики клика после рендеринга уведомлений
                        addClickHandlersToNotifications();
                    }
                })
                .catch(error => {
                    console.error('Ошибка:', error);
                    dropdownMenu.innerHTML = `<li><a class="dropdown-item" href="#">Ошибка загрузки уведомлений</a></li>`;
                });
        }

        // Загрузка уведомлений при загрузке страницы
        loadNotifications();

        // Функция для добавления обработчиков клика к уведомлениям
        function addClickHandlersToNotifications() {
            const notifications = document.querySelectorAll('.dropdown-item[data-id]'); // Уведомления с атрибутом data-id

            notifications.forEach(notification => {
                notification.addEventListener('click', () => {
                    const notificationId = notification.getAttribute('data-id'); // ID уведомления

                    // Отправка POST-запроса на сервер
                    fetch(`/notifications/mark-as-read/${notificationId}/`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRFToken': getCookie('csrftoken') // Добавляем CSRF-токен
                        }
                    })
                        .then(response => {
                            if (response.ok) {
                                console.log('Уведомление успешно обновлено');
                                loadNotifications(); // Перезагрузка уведомлений
                            } else {
                                console.error('Ошибка при обновлении уведомления');
                            }
                        })
                        .catch(error => console.error('Ошибка:', error));
                });
            });
        }
    }

    // Функция для получения CSRF-токена из cookie
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
});
