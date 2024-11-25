-- Шаг 1: Удаление старых таблиц, если они существуют
DROP TABLE IF EXISTS t_users;
DROP TABLE IF EXISTS t_worker_type;
DROP TABLE IF EXISTS t_shifts;
DROP TABLE IF EXISTS t_shift_type;
DROP TABLE IF EXISTS t_notifications;
DROP TABLE IF EXISTS t_production_calendar;
DROP VIEW IF EXISTS v_users;
DROP VIEW IF EXISTS v_shifts;
DROP VIEW IF EXISTS v_notifications;

-- СОЗДАНИЕ ТАБЛИЦ
-- Создание таблицы типов работников (t_worker_type)
CREATE TABLE t_worker_type (
    id INTEGER PRIMARY KEY AUTOINCREMENT,           -- Уникальный идентификатор типа работника
    name TEXT NOT NULL,                             -- Название типа (например, "Руководитель", "Инженер")
    description TEXT                                -- Описание типа работника
);

-- Создание таблицы t_users с дополнительными полями для роли сотрудника, стоимости часа работы и шаблона графика
CREATE TABLE t_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,           -- Уникальный идентификатор пользователя
    username TEXT NOT NULL,                         -- Имя пользователя для входа в систему
    password TEXT NOT NULL,                         -- Хешированный пароль пользователя
    login TEXT,                                     -- Электронная почта пользователя
    is_active BOOLEAN DEFAULT TRUE,                 -- Флаг активности учетной записи
    worker_type_id INTEGER,                         -- Идентификатор типа работника (связь с таблицей типов работников)
    color TEXT NOT NULL,        					-- Цвет в графике
    FOREIGN KEY (worker_type_id) REFERENCES t_worker_type(id)  -- Внешний ключ к типу работника
);

-- Создание таблицы смен (t_shifts)
CREATE TABLE t_shifts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,           -- Уникальный идентификатор смены
    employee_id INTEGER NOT NULL,                   -- Идентификатор сотрудника (ссылка на t_users)
    shift_type_id INTEGER NOT NULL,                 -- Идентификатор типа смены (ссылка на t_shift_type)
    start_time DATETIME NOT NULL,                   -- Время начала смены
    end_time DATETIME NOT NULL,                     -- Время окончания смены
    is_approved BOOLEAN DEFAULT FALSE,              -- Статус утверждения смены
    set_task TEXT,									-- Поставленные задачи
    completed_task TEXT,							-- Выполненные задачи
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,  -- Дата и время создания смены
    FOREIGN KEY (employee_id) REFERENCES t_users(id),  -- Внешний ключ к сотруднику
    FOREIGN KEY (shift_type_id) REFERENCES t_shift_type(id)  -- Внешний ключ к типу смены
);

-- Создание таблицы типов смен (t_shift_type)
CREATE TABLE t_shift_type (
    id INTEGER PRIMARY KEY AUTOINCREMENT,           -- Уникальный идентификатор типа смены
    name TEXT NOT NULL,                             -- Название типа смены ("Рабочая смена", "Нехватка персонала", "Некому подменить", "Нештатная ситуация")
    description TEXT                                -- Описание типа смены
);

-- Создание таблицы уведомлений (t_notifications)
CREATE TABLE t_notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,           -- Уникальный идентификатор уведомления
    user_id_send INTEGER NOT NULL,					-- Оправитель
    user_id_accept INTEGER NOT NULL,				-- Получатель
    shift_id INTEGER NOT NULL,                      -- Идентификатор смены (ссылка на t_shifts)
    manager_id_accept INTEGER NOT NULL,                    -- Идентификатор руководителя (ссылка на t_users)
    message TEXT NOT NULL,                          -- Текст уведомления
    sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,     -- Дата и время отправки уведомления
    is_read_user BOOLEAN DEFAULT FALSE,                  -- Статус прочтения уведомления
    is_read_manager BOOLEAN DEFAULT FALSE,                  -- Статус прочтения уведомления
    FOREIGN KEY (shift_id) REFERENCES t_shifts(id),        -- Внешний ключ к смене
    FOREIGN KEY (manager_id_accept) REFERENCES t_users(id), -- Внешний ключ к руководителю
    FOREIGN KEY (user_id_send) REFERENCES t_users(id),        -- Внешний ключ к руководителю
    FOREIGN KEY (user_id_accept) REFERENCES t_users(id)        -- Внешний ключ к руководителю

);

-- Создание таблицы производственного календаря (t_production_calendar)
CREATE TABLE t_production_calendar (
    id INTEGER PRIMARY KEY AUTOINCREMENT,           -- Уникальный идентификатор записи в календаре
    date DATE NOT NULL,                             -- Дата праздника или выходного дня
    is_holiday BOOLEAN DEFAULT FALSE,               -- Флаг, указывающий, является ли день праздничным
    description TEXT                                -- Описание праздника или выходного дня
);

-- СОЗДАНИЕ ПРЕДСТАВЛЕНИЙ
-- Создание представления v_users
CREATE VIEW v_users AS
SELECT tu.id, 
	   tu.username, 
	   tu.password, 
	   tu.login, 
	   tu.is_active, 
	   tu.worker_type_id, 
	   tu.color,
	   twt.name AS worker_type_name,
	   twt.description AS worker_type_description
  FROM t_users AS tu 
       JOIN t_worker_type AS twt ON tu.worker_type_id = twt.id 

-- Создание представления v_shifts
CREATE VIEW v_shifts AS
SELECT ts.id, 
	   ts.employee_id, 
	   tu.username,
	   tu.login,
	   tu.is_active,
	   tu.color, 
	   twt.name AS worker_type_name, 
  	   twt.description AS worker_type_description, 
	   ts.shift_type_id, 
	   tst.name AS shift_type_name,
	   tst.description AS shift_type_description,
	   ts.start_time, 
	   ts.end_time, 
	   ts.is_approved, 
	   ts.set_task, 
	   ts.completed_task, 
	   ts.created_at
  FROM t_shifts AS ts
  	   JOIN t_users AS tu ON ts.employee_id = tu.id 
       JOIN t_worker_type AS twt ON tu.worker_type_id = twt.id 
       JOIN t_shift_type AS tst ON ts.shift_type_id = tst.id
       
-- Создание представления v_notifications    
CREATE VIEW v_notifications AS
SELECT tn.id, 
	   tn.user_id_send, 
	   tus.username AS username_send,
	   tus.login AS login_send,
	   tus.worker_type_id AS worker_type_id_send,
	   twts.name AS worker_type_name_send,
	   twts.description AS worker_type_description_send,
	   tus.color AS color_send,
	   tus.is_active AS is_active_send,	   
	   tn.user_id_accept, 
	   tua.username AS username_accept,
	   tua.login AS login_accept,
	   tua.worker_type_id AS worker_type_id_accept,
	   twta.name AS worker_type_name_accept,
	   twta.description AS worker_type_description_accept,
	   tua.color AS color_accept,
	   tua.is_active AS is_active_accept,	   
	   tn.manager_id_accept, 
	   tum.username AS username_manager,
	   tum.login AS login_manager,
	   tum.worker_type_id AS worker_type_id_manager,
	   twtm.name AS worker_type_name_manager,
	   twtm.description AS worker_type_description_manager,
	   tum.color AS color_manager,
	   tum.is_active AS is_active_manager,
	   tn.shift_id, 
	   tn.message, 
	   tn.sent_at, 
	   tn.is_read_user,
	   tn.is_read_manager
  FROM t_notifications AS tn
       JOIN t_users AS tus ON tn.user_id_send = tus.id
       JOIN t_users AS tua ON tn.user_id_accept = tua.id
       JOIN t_users AS tum ON tn.manager_id_accept = tum.id
       JOIN t_worker_type AS twts ON tus.worker_type_id = twts.id
       JOIN t_worker_type AS twta ON tua.worker_type_id = twta.id
       JOIN t_worker_type AS twtm ON tum.worker_type_id = twtm.id

-- ВСТАВКА ДАННЫХ
-- Добавление данных t_worker_type
INSERT INTO t_worker_type (id, name, description)
VALUES 
(1, 'Руководитель отдела', 'Руководитель отдела'),
(2, 'Инженер', 'Инженер');

-- Добавление данных t_users
INSERT INTO t_users (id, username, password, login, is_active, worker_type_id, color)
VALUES 
(1, 'Степаниденко Ирина Андреевна', '1234', 'stepanidenko_ia', TRUE, 1, '#a3d9ff'), -- Руководитель отдела
(2, 'Степанов Степан Степанович', 	'4321', 'stepanov_ss', 	   TRUE, 2, '#ffb3b3'), -- Инженер
(3, 'Юрий Юрьевич Юрий', 			'1111', 'uriy_uu', 		   TRUE, 2, '#d3ffa3'), -- Инженер
(4, 'Денис Денисович Денисов', 		'2222', 'denis_dd', 	   TRUE, 2, '#ffc3a3'), -- Инженер
(5, 'Иван Иванович Иванов', 		'3333', 'ivan_ii', 		   TRUE, 2, '#dab3ff'); -- Инженер

-- Добавление данных t_shift_type
INSERT INTO t_shift_type (id, name, description)
VALUES 
(1, 'Рабочая смена', 'Обычная рабочая смена сотрудника'),
(2, 'Нехватка персонала', 'Смена назначена из-за нехватки персонала'),
(3, 'Некому подменить', 'Смена назначена в условиях отсутствия замены'),
(4, 'Нештатная ситуация', 'Смена вызвана нештатной ситуацией или чрезвычайными обстоятельствами');

-- Праздники в России
INSERT INTO t_production_calendar (id, date, is_holiday, description)
VALUES
(1, '2024-01-01', TRUE, 'Новый год'),
(2, '2024-01-02', TRUE, 'Новогодние каникулы'),
(3, '2024-01-03', TRUE, 'Новогодние каникулы'),
(4, '2024-01-04', TRUE, 'Новогодние каникулы'),
(5, '2024-01-05', TRUE, 'Новогодние каникулы'),
(6, '2024-01-06', TRUE, 'Новогодние каникулы'),
(7, '2024-01-07', TRUE, 'Рождество Христово'),
(8, '2024-02-23', TRUE, 'День защитника Отечества'),
(9, '2024-03-08', TRUE, 'Международный женский день'),
(10, '2024-05-01', TRUE, 'Праздник Весны и Труда'),
(11, '2024-05-09', TRUE, 'День Победы'),
(12, '2024-06-12', TRUE, 'День России'),
(13, '2024-11-04', TRUE, 'День народного единства');


-- Добавление смен
INSERT INTO t_shifts (id, employee_id, shift_type_id, start_time, end_time, is_approved, set_task, completed_task, created_at)
VALUES
-- Дневные смены с начальником
(1, 1, 1, '2024-11-01 08:00:00', '2024-11-01 20:00:00', TRUE, 'Проверка отчетов и координация задач', NULL, CURRENT_TIMESTAMP),
(2, 1, 1, '2024-11-02 08:00:00', '2024-11-02 20:00:00', TRUE, 'Проверка отчетов и координация задач', NULL, CURRENT_TIMESTAMP),
(3, 1, 1, '2024-11-03 08:00:00', '2024-11-03 20:00:00', TRUE, 'Проверка отчетов и координация задач', NULL, CURRENT_TIMESTAMP),
(4, 1, 1, '2024-11-04 08:00:00', '2024-11-04 20:00:00', TRUE, 'Проверка отчетов и координация задач', NULL, CURRENT_TIMESTAMP),
(5, 1, 1, '2024-11-05 08:00:00', '2024-11-05 20:00:00', TRUE, 'Проверка отчетов и координация задач', NULL, CURRENT_TIMESTAMP),
(6, 1, 1, '2024-11-06 08:00:00', '2024-11-06 20:00:00', TRUE, 'Проверка отчетов и координация задач', NULL, CURRENT_TIMESTAMP),
-- Ночные смены и остальные дневные смены
(7, 2, 1, '2024-11-01 20:00:00', '2024-11-02 08:00:00', TRUE, 'Обслуживание оборудования', NULL, CURRENT_TIMESTAMP),
(8, 3, 1, '2024-11-02 20:00:00', '2024-11-03 08:00:00', TRUE, 'Обслуживание оборудования', NULL, CURRENT_TIMESTAMP),
(9, 4, 1, '2024-11-03 20:00:00', '2024-11-04 08:00:00', TRUE, 'Обслуживание оборудования', NULL, CURRENT_TIMESTAMP),
(10, 5, 1, '2024-11-04 20:00:00', '2024-11-05 08:00:00', TRUE, 'Обслуживание оборудования', NULL, CURRENT_TIMESTAMP),
(11, 2, 1, '2024-11-05 20:00:00', '2024-11-06 08:00:00', TRUE, 'Обслуживание оборудования', NULL, CURRENT_TIMESTAMP),
(12, 3, 1, '2024-11-06 20:00:00', '2024-11-07 08:00:00', TRUE, 'Обслуживание оборудования', NULL, CURRENT_TIMESTAMP),
-- Продолжение графика
(13, 1, 1, '2024-11-07 08:00:00', '2024-11-07 20:00:00', TRUE, 'Проверка отчетов и координация задач', NULL, CURRENT_TIMESTAMP),
(14, 4, 1, '2024-11-07 20:00:00', '2024-11-08 08:00:00', TRUE, 'Обслуживание оборудования', NULL, CURRENT_TIMESTAMP),
(15, 1, 1, '2024-11-08 08:00:00', '2024-11-08 20:00:00', TRUE, 'Проверка отчетов и координация задач', NULL, CURRENT_TIMESTAMP),
(16, 5, 1, '2024-11-08 20:00:00', '2024-11-09 08:00:00', TRUE, 'Обслуживание оборудования', NULL, CURRENT_TIMESTAMP),
(17, 2, 1, '2024-11-09 08:00:00', '2024-11-09 20:00:00', TRUE, 'Ремонт и контроль оборудования', NULL, CURRENT_TIMESTAMP),
(18, 3, 1, '2024-11-09 20:00:00', '2024-11-10 08:00:00', TRUE, 'Ремонт и контроль оборудования', NULL, CURRENT_TIMESTAMP),

-- Дневные смены с начальником
(19, 1, 1, '2024-11-10 08:00:00', '2024-11-10 20:00:00', TRUE, 'Проверка отчетов и координация задач', NULL, CURRENT_TIMESTAMP),
(20, 1, 1, '2024-11-11 08:00:00', '2024-11-11 20:00:00', TRUE, 'Проверка отчетов и координация задач', NULL, CURRENT_TIMESTAMP),
(21, 1, 1, '2024-11-12 08:00:00', '2024-11-12 20:00:00', TRUE, 'Проверка отчетов и координация задач', NULL, CURRENT_TIMESTAMP),
(22, 1, 1, '2024-11-13 08:00:00', '2024-11-13 20:00:00', TRUE, 'Проверка отчетов и координация задач', NULL, CURRENT_TIMESTAMP),
(23, 1, 1, '2024-11-14 08:00:00', '2024-11-14 20:00:00', TRUE, 'Проверка отчетов и координация задач', NULL, CURRENT_TIMESTAMP),
(24, 1, 1, '2024-11-15 08:00:00', '2024-11-15 20:00:00', TRUE, 'Проверка отчетов и координация задач', NULL, CURRENT_TIMESTAMP),

-- Ночные смены и остальные дневные смены
(25, 2, 1, '2024-11-15 20:00:00', '2024-11-16 08:00:00', TRUE, 'Обслуживание оборудования', NULL, CURRENT_TIMESTAMP),
(26, 3, 1, '2024-11-16 20:00:00', '2024-11-17 08:00:00', TRUE, 'Обслуживание оборудования', NULL, CURRENT_TIMESTAMP),
(27, 4, 1, '2024-11-17 20:00:00', '2024-11-18 08:00:00', TRUE, 'Обслуживание оборудования', NULL, CURRENT_TIMESTAMP),
(28, 5, 1, '2024-11-18 20:00:00', '2024-11-19 08:00:00', TRUE, 'Обслуживание оборудования', NULL, CURRENT_TIMESTAMP),
(29, 2, 1, '2024-11-19 08:00:00', '2024-11-19 20:00:00', TRUE, 'Обслуживание оборудования', NULL, CURRENT_TIMESTAMP),
(30, 3, 1, '2024-11-20 08:00:00', '2024-11-20 20:00:00', TRUE, 'Обслуживание оборудования', NULL, CURRENT_TIMESTAMP),
-- Продолжаем чередование
(31, 1, 1, '2024-11-21 08:00:00', '2024-11-21 20:00:00', TRUE, 'Проверка отчетов и координация задач', NULL, CURRENT_TIMESTAMP),
(32, 4, 1, '2024-11-21 20:00:00', '2024-11-22 08:00:00', TRUE, 'Обслуживание оборудования', NULL, CURRENT_TIMESTAMP),
(33, 1, 1, '2024-11-22 08:00:00', '2024-11-22 20:00:00', TRUE, 'Проверка отчетов и координация задач', NULL, CURRENT_TIMESTAMP),
(34, 5, 1, '2024-11-22 20:00:00', '2024-11-23 08:00:00', TRUE, 'Обслуживание оборудования', NULL, CURRENT_TIMESTAMP),
(35, 2, 1, '2024-11-23 08:00:00', '2024-11-23 20:00:00', TRUE, 'Обслуживание оборудования', NULL, CURRENT_TIMESTAMP),
(36, 3, 1, '2024-11-24 08:00:00', '2024-11-24 20:00:00', TRUE, 'Обслуживание оборудования', NULL, CURRENT_TIMESTAMP),

(37, 1, 1, '2024-11-25 08:00:00', '2024-11-25 20:00:00', TRUE, 'Проверка отчетов и координация задач', NULL, CURRENT_TIMESTAMP),
(38, 4, 1, '2024-11-25 20:00:00', '2024-11-26 08:00:00', TRUE, 'Обслуживание оборудования', NULL, CURRENT_TIMESTAMP),
(39, 1, 1, '2024-11-26 08:00:00', '2024-11-26 20:00:00', TRUE, 'Проверка отчетов и координация задач', NULL, CURRENT_TIMESTAMP),
(40, 5, 1, '2024-11-26 20:00:00', '2024-11-27 08:00:00', TRUE, 'Обслуживание оборудования', NULL, CURRENT_TIMESTAMP),
(41, 2, 1, '2024-11-27 08:00:00', '2024-11-27 20:00:00', TRUE, 'Обслуживание оборудования', NULL, CURRENT_TIMESTAMP),
(42, 3, 1, '2024-11-28 08:00:00', '2024-11-28 20:00:00', TRUE, 'Обслуживание оборудования', NULL, CURRENT_TIMESTAMP),

(43, 1, 1, '2024-11-29 08:00:00', '2024-11-29 20:00:00', TRUE, 'Проверка отчетов и координация задач', NULL, CURRENT_TIMESTAMP),
(44, 4, 1, '2024-11-29 20:00:00', '2024-11-30 08:00:00', TRUE, 'Обслуживание оборудования', NULL, CURRENT_TIMESTAMP),
(45, 1, 1, '2024-11-30 08:00:00', '2024-11-30 20:00:00', TRUE, 'Проверка отчетов и координация задач', NULL, CURRENT_TIMESTAMP);


INSERT INTO t_notifications (id, user_id_send, user_id_accept, shift_id, manager_id_accept, message, sent_at, is_read_user, is_read_manager)
VALUES
-- Уведомления для смен с начальником
(1, 1, 2, 7, 1, 'Утверждение смены. Пожалуйста, подтвердите свою ночную смену.', CURRENT_TIMESTAMP, FALSE, FALSE),
(2, 1, 3, 8, 1, 'Утверждение смены. Пожалуйста, подтвердите свою ночную смену.', CURRENT_TIMESTAMP, FALSE, FALSE),
(3, 1, 4, 9, 1, 'Утверждение смены. Пожалуйста, подтвердите свою ночную смену.', CURRENT_TIMESTAMP, FALSE, FALSE),
(4, 1, 5, 10, 1, 'Утверждение смены. Пожалуйста, подтвердите свою ночную смену.', CURRENT_TIMESTAMP, FALSE, FALSE),
(5, 1, 2, 13, 1, 'Утверждение смены. Пожалуйста, подтвердите свою дневную смену.', CURRENT_TIMESTAMP, FALSE, FALSE),
(6, 1, 3, 14, 1, 'Утверждение смены. Пожалуйста, подтвердите свою ночную смену.', CURRENT_TIMESTAMP, FALSE, FALSE),
(7, 1, 5, 16, 1, 'Утверждение смены. Пожалуйста, подтвердите свою ночную смену.', CURRENT_TIMESTAMP, FALSE, FALSE),
(8, 1, 2, 17, 1, 'Утверждение смены. Пожалуйста, подтвердите свою дневную смену.', CURRENT_TIMESTAMP, FALSE, FALSE),
(9, 1, 3, 18, 1, 'Утверждение смены. Пожалуйста, подтвердите свою ночную смену.', CURRENT_TIMESTAMP, FALSE, FALSE),

-- Уведомления для смен других сотрудников
(10, 2, 1, 7, 1, 'Ваша смена утверждена. Проверьте детали своей ночной смены.', CURRENT_TIMESTAMP, FALSE, FALSE),
(11, 2, 3, 8, 1, 'Ваша смена утверждена. Проверьте детали своей ночной смены.', CURRENT_TIMESTAMP, FALSE, FALSE),
(12, 2, 5, 10, 1, 'Ваша смена утверждена. Проверьте детали своей ночной смены.', CURRENT_TIMESTAMP, FALSE, FALSE),
(13, 3, 1, 8, 1, 'Ваша смена утверждена. Проверьте детали своей ночной смены.', CURRENT_TIMESTAMP, FALSE, FALSE),
(14, 3, 4, 9, 1, 'Ваша смена утверждена. Проверьте детали своей ночной смены.', CURRENT_TIMESTAMP, FALSE, FALSE),
(15, 3, 2, 13, 1, 'Ваша смена утверждена. Проверьте детали своей дневной смены.', CURRENT_TIMESTAMP, FALSE, FALSE),
(16, 4, 1, 9, 1, 'Ваша смена утверждена. Проверьте детали своей ночной смены.', CURRENT_TIMESTAMP, FALSE, FALSE),
(17, 4, 5, 14, 1, 'Ваша смена утверждена. Проверьте детали своей ночной смены.', CURRENT_TIMESTAMP, FALSE, FALSE),
(18, 4, 2, 17, 1, 'Ваша смена утверждена. Проверьте детали своей дневной смены.', CURRENT_TIMESTAMP, FALSE, FALSE),
(19, 5, 1, 10, 1, 'Ваша смена утверждена. Проверьте детали своей ночной смены.', CURRENT_TIMESTAMP, FALSE, FALSE),
(20, 5, 3, 13, 1, 'Ваша смена утверждена. Проверьте детали своей ночной смены.', CURRENT_TIMESTAMP, FALSE, FALSE),
(21, 5, 4, 18, 1, 'Ваша смена утверждена. Проверьте детали своей ночной смены.', CURRENT_TIMESTAMP, FALSE, FALSE);




