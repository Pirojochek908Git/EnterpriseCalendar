// Создаем график
var chart = echarts.init(document.getElementById('chart'));

// Запрашиваем данные
var xhr = new XMLHttpRequest();
xhr.open('GET', '/analytics/shifts-by-type/', false); // Синхронный запрос
xhr.send();

if (xhr.status === 200) {
    var data = JSON.parse(xhr.responseText);

    // Конфигурация графика
    var option = {
        title: {
            text: 'Распределение смен по типам',
            left: 'center'
        },
        tooltip: {
            trigger: 'item',
            formatter: '{a} <br/>{b}: {c} ({d}%)'
        },
        legend: {
            orient: 'vertical',
            left: 'right', // Перемещаем легенду вправо
            top: 'middle', // По центру по вертикали
            data: data.labels
        },
        series: [
            {
                name: 'Типы смен',
                type: 'pie',
                radius: '50%',
                data: data.labels.map((label, index) => ({
                    value: data.values[index],
                    name: label
                })),
                emphasis: {
                    itemStyle: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                }
            }
        ]
    };

    // Отображаем график
    chart.setOption(option);
} else {
    console.error('Ошибка загрузки данных:', xhr.status);
}

var chart = echarts.init(document.getElementById('employee-chart'));

// Запрос данных
var xhr = new XMLHttpRequest();
xhr.open('GET', '/analytics/employee-load/?start_date=2024-01-01&end_date=2024-12-31', false); // Синхронный запрос
xhr.send();

if (xhr.status === 200) {
    var data = JSON.parse(xhr.responseText);

    var option = {
        title: {
            text: 'Загрузка сотрудников',
            left: 'center'
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            },
            formatter: function (params) {
                // params[0].name — это ФИО, переданное из Django
                return `ФИО: ${params[0].name}<br>Часы: ${params[0].value} ч`;
            }
        },
        grid: {
            left: '30%',
            right: '10%',
            top: '10%',
            bottom: '10%'
        },
        xAxis: {
            type: 'value',
            boundaryGap: [0, 0.01]
        },
        yAxis: {
            type: 'category',
            data: data.labels,  // ФИО сотрудников
        },
        series: [
            {
                name: 'Часы работы',
                type: 'bar',
                data: data.values,  // Количество часов
                itemStyle: {
                    color: '#5470C6'
                }
            }
        ]
    };

    chart.setOption(option);
} else {
    console.error('Ошибка загрузки данных:', xhr.status);
}

var chart = echarts.init(document.getElementById('shift-time-distribution-chart'));

// Запрос данных
var xhr = new XMLHttpRequest();
xhr.open('GET', '/analytics/shift-time-distribution/?start_date=2024-01-01&end_date=2024-12-31', false); // Синхронный запрос
xhr.send();

if (xhr.status === 200) {
    var data = JSON.parse(xhr.responseText);

    var option = {
        title: {
            text: 'Распределение смен по времени суток',
            left: 'center'
        },
        tooltip: {
            trigger: 'item',
            formatter: '{a} <br/>{b}: {c} ({d}%)'
        },
        legend: {
            orient: 'vertical',
            left: 'left',
            data: data.categories
        },
        series: [
            {
                name: 'Смены',
                type: 'pie',
                radius: '55%',
                center: ['50%', '60%'],
                data: data.categories.map((category, index) => ({
                    value: data.values[index],
                    name: category
                })),
                emphasis: {
                    itemStyle: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                }
            }
        ]
    };

    chart.setOption(option);
} else {
    console.error('Ошибка загрузки данных:', xhr.status);
}