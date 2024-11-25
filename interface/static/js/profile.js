document.addEventListener('DOMContentLoaded', function () {
    const activeUserId = document.getElementById("activeUserId").textContent;
    console.log(activeUserId);

    // Условие для отображения/скрытия элементов
    if (activeUserId === "1") {
        // Если значение равно 1, показываем элементы
        document.getElementById("analyticPage").style.display = "block";
        document.getElementById("adminPage").style.display = "block";
    } else {
        // Если значение не равно 1, скрываем элементы
        document.getElementById("analyticPage").style.display = "none";
        document.getElementById("adminPage").style.display = "none";
    }

    const userData = JSON.parse(localStorage.getItem('activeUser'));

    if (userData) {
        // Заполнение данных в HTML
        document.getElementById('userName').textContent = userData.username;
        document.getElementById('userWorkerTypeName').textContent = userData.worker_type_name;
        document.getElementById('userLogin').textContent = userData.login;

        // Обновляем цвет кружочка
        const colorElement = document.getElementById('userColor');
        if (colorElement) {
            const color = userData.color || '#a3d9ff'; // Default color if not found
            colorElement.style.backgroundColor = color;

            // Обновляем текст
            const colorTextElement = document.getElementById('colorText');
            if (colorTextElement) {
                colorTextElement.textContent = `Цвет на календаре: ${color}`;
            }
        }

        // Обновляем изображение
        const userImage = document.querySelector('.card-body img');
        userImage.src = userData.img_path || '/static/img/users/default.png'; // Default image if not found
    } else {
        console.error('Нет данных пользователя в localStorage!');
    }

    // Блок загрузки уведомлений
    const notificationsContainer = document.getElementById('notificationsContainer'); // Элемент, куда будем рендерить уведомления
    if (activeUserId) {
        fetch(`/notifications/unread/${activeUserId}/`) // Запрос к UnreadNotificationsView
            .then(response => response.json())
            .then(data => {
                if (data.length === 0) {
                    // Если уведомлений нет
                    notificationsContainer.innerHTML = `
                        <div class="alert alert-info" role="alert">
                            У вас нет новых уведомлений.
                        </div>`;
                } else {
                    // Генерируем HTML для списка уведомлений
                    let notificationsHtml = '';
                    data.forEach(notification => {
                        notificationsHtml += `
                            <div class="notification-item card mb-2 shadow-sm">
                                <div class="card-body d-flex align-items-center">
                                    <img class="rounded-circle me-3" width="50" height="50" 
                                         src="/static/img/users/${notification.login_send}.png" 
                                         alt="${notification.username_send}">
                                    <div>
                                        <h6 class="card-title mb-1">${notification.username_send}</h6>
                                        <p class="card-text mb-0">${notification.message}</p>
                                        <small class="text-muted">Отправлено: ${new Date(notification.sent_at).toLocaleString()}</small>
                                    </div>
                                </div>
                            </div>`;
                    });

                    // Вставляем уведомления в контейнер
                    notificationsContainer.innerHTML = notificationsHtml;
                }
            })
            .catch(error => {
                console.error('Ошибка при загрузке уведомлений:', error);
                notificationsContainer.innerHTML = `
                    <div class="alert alert-danger" role="alert">
                        Ошибка загрузки уведомлений.
                    </div>`;
            });
    }
});
