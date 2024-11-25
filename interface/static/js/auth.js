    document.querySelector('.btn-user').addEventListener('click', function (event) {
        event.preventDefault(); // Предотвращаем переход по ссылке по умолчанию

        // Получаем значения из полей input
        const emailInput = document.getElementById('exampleInputEmail').value.trim();
        const passwordInput = document.getElementById('exampleInputPassword').value.trim();

        // Получаем строки из невидимой таблицы
        const rows = document.querySelectorAll('.table tbody tr');
        let userData = null; // Переменная для хранения данных пользователя

        // Перебираем строки таблицы и ищем совпадение
        rows.forEach(row => {
            const cells = row.querySelectorAll('td');
            const userEmail = cells[3].textContent.trim(); // Логин (email)
            const userPassword = cells[2].textContent.trim(); // Пароль

            if (emailInput === userEmail && passwordInput === userPassword) {
                // Если нашли совпадение, сохраняем данные пользователя
                userData = {
                    id: cells[0].textContent.trim(),
                    username: cells[1].textContent.trim(),
                    password: userPassword,
                    login: userEmail,
                    is_active: cells[4].textContent.trim(),
                    worker_type_id: cells[5].textContent.trim(),
                    color: cells[6].textContent.trim(),
                    worker_type_name: cells[7].textContent.trim(),
                    worker_type_description: cells[8].textContent.trim(),
                    img_path: '/static/img/users/' + userEmail + '.png',
                };
            }
        });

        if (userData) {
            // Сохраняем данные в localStorage
            localStorage.setItem('activeUser', JSON.stringify(userData));

            // Переходим на следующую страницу
            window.location.href = '/';
        } else {
            // Если данные не совпали, выводим сообщение об ошибке
            alert('Неправильный логин или пароль!');
        }
    });