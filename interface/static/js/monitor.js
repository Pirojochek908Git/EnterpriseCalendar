// Инициализация графиков
const chart = echarts.init(document.getElementById('chart'));
const employeeChart = echarts.init(document.getElementById('employee-chart'));
const shiftTimeChart = echarts.init(document.getElementById('shift-time-distribution-chart'));

// Функция загрузки данных для графика
function loadChartData(dateRange = 'day', selectedDate = new Date().toISOString().split('T')[0]) {
    const url = `/analytics/shift-load/?date_range=${dateRange}&selected_date=${selectedDate}&_=${new Date().getTime()}`;  // Добавлен параметр _ для предотвращения кэширования

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Ошибка загрузки данных: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            const option = {
                title: {
                    text: 'Загруженность сотрудников',
                    left: 'center'
                },
                tooltip: {
                    trigger: 'item',
                    formatter: '{a} <br/>{b}: {c} ({d}%)'
                },
                legend: {
                    orient: 'vertical',
                    left: 'left',
                    data: data.labels // Используем labels вместо categories
                },
                series: [
                    {
                        name: 'Смены',
                        type: 'pie',
                        radius: '55%',
                        center: ['50%', '60%'],
                        data: data.labels.map((label, index) => ({
                            value: data.values[index],  // Используем values вместо categories
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

            chart.setOption(option);
        })
        .catch(error => console.error(error));
}

// Функция загрузки данных для второго графика (сотрудники)
function loadEmployeeChart(dateRange = 'day', selectedDate = new Date().toISOString().split('T')[0]) {
    const url = `/analytics/employee-load/?date_range=${dateRange}&selected_date=${selectedDate}&_=${new Date().getTime()}`;
    fetch(url)
        .then(response => response.json())
        .then(data => {
            const option = {
                title: { text: 'Загрузка сотрудников', left: 'center' },
                tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, formatter: function (params) {
                    return `ФИО: ${params[0].name}<br>Часы: ${params[0].value} ч`;
                }},
                xAxis: { type: 'value', boundaryGap: [0, 0.01] },
                yAxis: { type: 'category', data: data.labels },
                series: [{
                    name: 'Часы работы',
                    type: 'bar',
                    data: data.values,
                    itemStyle: { color: '#5470C6' }
                }]
            };
            employeeChart.setOption(option);
        })
        .catch(console.error);
}

// Функция загрузки данных для третьего графика (распределение по времени суток)
function loadShiftTimeChart(dateRange = 'day', selectedDate = new Date().toISOString().split('T')[0]) {
    const url = `/analytics/shift-time-distribution/?date_range=${dateRange}&selected_date=${selectedDate}&_=${new Date().getTime()}`;
    fetch(url)
        .then(response => response.json())
        .then(data => {
            const option = {
                title: { text: 'Распределение смен по времени суток', left: 'center' },
                tooltip: { trigger: 'item', formatter: '{a} <br/>{b}: {c} ({d}%)' },
                legend: { orient: 'vertical', left: 'left', data: data.categories },
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
            shiftTimeChart.setOption(option);
        })
        .catch(console.error);
}

// Обработчики выбора диапазона и даты
document.addEventListener('DOMContentLoaded', () => {
    const dateRangeSelect = document.getElementById('shifts-date-range');
    const datePicker = document.getElementById('shifts-date-picker');

    // Устанавливаем текущую дату в datePicker
    datePicker.value = new Date().toISOString().split('T')[0];

    // Загрузка графиков при изменении диапазона или даты
    const updateCharts = () => {
        const dateRange = dateRangeSelect.value;
        const selectedDate = datePicker.value;
        loadChartData(dateRange, selectedDate);
        loadEmployeeChart(dateRange, selectedDate);
        loadShiftTimeChart(dateRange, selectedDate);
    };

    dateRangeSelect.addEventListener('change', updateCharts);
    datePicker.addEventListener('change', updateCharts);

    // Первоначальная загрузка графиков
    updateCharts();
});
