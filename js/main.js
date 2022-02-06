'use strict';

$(document).ready(function () {

	//Инициализируем библиотеку адаптивности таблицы
	$('.fintable').stacktable();

	//Скрываем - показываем отдельные столбцы
	$(".main-content__switch-list input[type='checkbox']").on('click', function () {
		$('.fintable th:nth-child(' + $(this).val() + ')').toggleClass("hide");
		$('.fintable td:nth-child(' + $(this).val() + ')').toggleClass("hide");
	});

	//Событие обновления страницы клике на иконку refresh
	$('.upper-menu').find('.icon-refresh').on('click', function () {
		location.reload($('#graph'));
	});

	//Выделение прохода по строкам таблицы
	$('.fintable__row').hover(function () {
		$(this).find('td').toggleClass('rows-hover');
	});

	//Если в таблице были скрытые столбцы, возвращаем их при переходе на разрешение экрана меньше или равно 991
	$(window).resize(function () {
		
		location.reload();

		if ($(window).width() <= 991) {

			var checkBox = $(".main-content__switch-list input[type='checkbox']");

			for (var i = 0; i < checkBox.length; i++) {

				if (!($(checkBox)[i].checked)) {
					$(checkBox)[i].click();
				}
			}
		}
	});

	//Добавляем класс this-day-income всем ячейкам которые содержат финансовые данные за "Текущий день" (это необходимо будет для заполнения данными адаптивной таблицы)
	var cellNamethisDay = $('tbody .st-key');

	for (var i = 0; i < cellNamethisDay.length; i++) {

		if ($(cellNamethisDay[i]).html() == 'Текущий день')

			$(cellNamethisDay[i]).next('.st-val').addClass('this-day-income');
	}

	//Вытягиваем данные из файла JSON в переменную data
	var data = (function () {
		var json = null;
		$.ajax({
			'async': false,
			'global': false,
			'url': 'data/data.json',
			'dataType': "json",
			'success': function (data) {
				json = data;
			}
		});
		return json;
	})();

	//Заполняем вложенные массивы данными из полученой переменной
	var allColumns = [
		[],
		[],
		[],
		[]
	];

	for (var key in data) {

		allColumns[0] = allColumns[0] + ' ' + data[key].thisDay;
		allColumns[1] = allColumns[1] + ' ' + data[key].yesterday;
		allColumns[2] = allColumns[2] + ' ' + data[key].LastWeek;
		allColumns[3] = allColumns[3] + ' ' + data[key].weekBeforeLast;
	}

	//Данные массивов преобразуем в тип Int
	for (var i = 0; i < allColumns.length; i++) {

		allColumns[i] = allColumns[i].split(' ');
		allColumns[i].shift();
		allColumns[i] = allColumns[i].map(function (str) {
			return parseInt(str, 10);
		});
	}

	//Данные массивов вставляем в таблицу
	var allTableRow = $('.fintable__body .fintable__row');

	for (var i = 0; i < allTableRow.length; i++) {
		$(allTableRow[i]).find('.fintable__cell:nth-child(2)').html(allColumns[0][i]);
		$(allTableRow[i]).find('.fintable__cell:nth-child(3) .fintable__number').html(allColumns[1][i]);
		$(allTableRow[i]).find('.fintable__cell:nth-child(4) .fintable__number').html(allColumns[2][i]);
		$(allTableRow[i]).find('.fintable__cell:nth-child(5) .fintable__number').html(allColumns[3][i]);
	}

	//Заполняем вложенные массивы данными содержащими посчитанный процент 	
	var percentColumns = [
		[],
		[],
		[]
	];

	for (var i = 0; i < allColumns[0].length; i++) {

		percentColumns[0] = percentColumns[0] + ' ' + (allColumns[0][i] / allColumns[1][i] * 100);
		percentColumns[1] = percentColumns[1] + ' ' + (allColumns[0][i] / allColumns[2][i] * 100);
		percentColumns[2] = percentColumns[2] + ' ' + (allColumns[0][i] / allColumns[3][i] * 100);
	}

	//Данные массивов преобразуем в тип Int с учетом округления
	for (var i = 0; i < percentColumns.length; i++) {

		percentColumns[i] = percentColumns[i].split(' ');
		percentColumns[i].shift();
		percentColumns[i] = percentColumns[i].map(function (str) {
			return Math.round(parseFloat(str));
		});
	}

	//Данные массивов вставляем в таблицу c проверкой на отклонение от показателей на текущий день
	var numberChild = 2; //Вспомогательные переменные для цикла for
	var column = 0; //Вспомогательные переменные для цикла for

	for (var j = 0; j < percentColumns.length; j++) {
		++numberChild;
		++column;

		for (var i = 0; i < allColumns[0].length; i++) {

			if (allColumns[0][i] < allColumns[column][i]) {
				$(allTableRow[i]).find('td:nth-child(' + numberChild + ') .fintable__percent').css('color', 'red');
				$(allTableRow[i]).find('td:nth-child(' + numberChild + ') .fintable__percent').html('-' + percentColumns[j][i] + '%');

			} else if (allColumns[0][i] > allColumns[column][i]) {
				$(allTableRow[i]).find('td:nth-child(' + numberChild + ')').css('background', '#e7f6df');
				$(allTableRow[i]).find('td:nth-child(' + numberChild + ') .fintable__percent').css('color', 'green');
				$(allTableRow[i]).find('td:nth-child(' + numberChild + ') .fintable__percent').html('+' + percentColumns[j][i] + '%');

			} else if (allColumns[0][i] == allColumns[column][i]) {
				$(allTableRow[i]).find('td:nth-child(' + numberChild + ') .fintable__percent').css('color', 'red');
			}
		}
	}

	//Создаем массив из отрицательных процентов
	var negativePercent = [
		[],
		[],
		[]
	];

	numberChild = 2;

	for (var j = 0; j < negativePercent.length; j++) {
		++numberChild;

		for (var i = 0; i < allColumns[0].length; i++) {
			negativePercent[j] = negativePercent[j] + ',' + $(allTableRow[i]).find('td:nth-child(' + numberChild + ') .fintable__percent').html();
			negativePercent[j] = negativePercent[j].replace(/[%+]/g, '');
			negativePercent[j] = negativePercent[j].split(',');
		}

		negativePercent[j].shift();
		negativePercent[j] = negativePercent[j].map(function (str) {
			return parseInt(str);
		});
	}

	//Проверяем где отрицательный процент больше или равен -10% и закрашиваем эту ячейку в красный цвет
	numberChild = 2;

	for (var j = 0; j < negativePercent.length; j++) {
		++numberChild;

		for (var i = 0; i < allColumns[0].length; i++) {

			if (negativePercent[j][i] <= -10) {
				$(allTableRow[i]).find('td:nth-child(' + numberChild + ')').css('background', '#fcddda');
			}
		}
	}

	//Сливаем четыре массива в один для запонения новой структуры таблицы, которая возникает при ее адаптивности
	var allNumberCell = [];

	for (var i = 0; i < allColumns[0].length; i++) {

		allNumberCell = allNumberCell + ' ' + allColumns[0][i];
		allNumberCell = allNumberCell + ' ' + allColumns[1][i];
		allNumberCell = allNumberCell + ' ' + allColumns[2][i];
		allNumberCell = allNumberCell + ' ' + allColumns[3][i];
	}

	allNumberCell = allNumberCell.split(' ');
	allNumberCell.shift();

	//Запоняем данными адаптивную таблицу
	var thisDayIncomeCell = $('tbody .this-day-income');
	var numberSpanCell = $('tbody .st-val .fintable__number');
	var j = 0; //счетчик для цикла
	var n = 0; //счетчик для цикла

	for (var i = 0; i < allNumberCell.length; i++) {

		if (i == 0 || i == 4 || i == 8 || i == 12 || i == 16 || i == 20 || i == 24 || i == 28 || i == 32 || i == 36) {

			$(thisDayIncomeCell[n]).html(allNumberCell[i]);
			++n;

		} else {

			$(numberSpanCell[j]).html(allNumberCell[i]);
			++j;
		}
	}


	//Сливаем три массива в один для запонения содержащих процент ячеек в адаптивной таблице
	var allPercentCell = [];

	for (var i = 0; i < 10; i++) {

		allPercentCell = allPercentCell + ' ' + negativePercent[0][i];
		allPercentCell = allPercentCell + ' ' + negativePercent[1][i];
		allPercentCell = allPercentCell + ' ' + negativePercent[2][i];
	}

	allPercentCell = allPercentCell.split(' ');
	allPercentCell.shift();
	allPercentCell = allPercentCell.map(function (str) {
		return parseInt(str);
	});

	//Запоняем c проверками процентными данными адаптивную таблицу 
	var percentSpanCell = $('tbody .st-val .fintable__percent');

	for (var i = 0; i < percentSpanCell.length; i++) {

		$(percentSpanCell[i]).html(allPercentCell[i] + '%');

		if (allPercentCell[i] <= -10) {
			$(percentSpanCell[i]).css('color', 'red');
			$(percentSpanCell[i]).parent().css('background', '#fcddda');

		} else if (allPercentCell[i] > 0) {
			$(percentSpanCell[i]).html('+' + allPercentCell[i] + '%');
			$(percentSpanCell[i]).parent().css('background', '#e7f6df');
			$(percentSpanCell[i]).css('color', 'green');

		} else {
			$(percentSpanCell[i]).css('color', 'red');
		}
	}

	//Проверка экрана устройства, для включения адаптивности блоку с графиками
	var rowGraph = $('.fintable__row-graph');
	
	if ($(this).width() < 992) {
		$(rowGraph[0]).html('<td class="fintable__cell fintable__cell_graph" id="graph" colspan="2"></td>');
	}

	//Инициализация и настройки графиков
	Highcharts.chart('graph', {

		title: {
			text: 'Графики'
		},

		yAxis: {

			title: {
				text: 'тыс. грн.'
			},

			lineWidth: 1,
			max: 200000,
			tickInterval: 50000,
			categories: []
		},

		xAxis: {
			categories: ['Текущий день', 'Вчера', 'Текущий день на прошлой неделе', 'Текущий день на позапрошлой неделе'],
		},

		legend: {
			enabled: false
		},

		series: [{
			name: 'Выручка',
			data: [
				+data.proceeds.thisDay,
				+data.proceeds.yesterday,
				+data.proceeds.LastWeek,
				+data.proceeds.weekBeforeLast
			]
		}, {
			name: 'Наличные',
			data: [
				+data.cash.thisDay,
				+data.cash.yesterday,
				+data.cash.LastWeek,
				+data.cash.weekBeforeLast
			]
		}, {
			name: 'Безналичный расчет',
			data: [
				+data.cashlessPayments.thisDay,
				+data.cashlessPayments.yesterday,
				+data.cashlessPayments.LastWeek,
				+data.cashlessPayments.weekBeforeLast
			]
		}, {
			name: 'Кредитные карты',
			data: [
				+data.creditCards.thisDay,
				+data.creditCards.yesterday,
				+data.creditCards.LastWeek,
				+data.creditCards.weekBeforeLast
			]
		}, {
			name: 'Средний чек',
			data: [
				+data.averageCheck.thisDay,
				+data.averageCheck.yesterday,
				+data.averageCheck.LastWeek,
				+data.averageCheck.weekBeforeLast
			]
		}, {
			name: 'Средний гость',
			data: [
				+data.averageGuest.thisDay,
				+data.averageGuest.yesterday,
				+data.averageGuest.LastWeek,
				+data.averageGuest.weekBeforeLast
			]
		}, {
			name: 'Удаление из чека (после оплаты)',
			data: [
				+data.deleteFromCheckAfter.thisDay,
				+data.deleteFromCheckAfter.yesterday,
				+data.deleteFromCheckAfter.LastWeek,
				+data.deleteFromCheckAfter.weekBeforeLast
			]
		}, {
			name: 'Удаление из чека (до оплаты)',
			data: [
				+data.deleteFromCheckBefore.thisDay,
				+data.deleteFromCheckBefore.yesterday,
				+data.deleteFromCheckBefore.LastWeek,
				+data.deleteFromCheckBefore.weekBeforeLast
			]
		}, {
			name: 'Количество чеков',
			data: [
				+data.amountOfChecks.thisDay,
				+data.amountOfChecks.yesterday,
				+data.amountOfChecks.LastWeek,
				+data.amountOfChecks.weekBeforeLast
			]
		}, {
			name: 'Количество гостей',
			data: [
				+data.amountOfGuest.thisDay,
				+data.amountOfGuest.yesterday,
				+data.amountOfGuest.LastWeek,
				+data.amountOfGuest.weekBeforeLast
			]
		}],

		responsive: {
			rules: [{
				condition: {
					maxWidth: 768,
				},
				chartOptions: {
					legend: {
						enabled: true,
						alignColumns: false,
						itemDistance: 50,
						itemMarginBottom: 10,
						itemWidth: 100,
						align: 'center',
					}
				}
			}]
		}
	});

	//На старт страницы все графики кроме "Выручка" скрыты
	var graphs = $('.highcharts-series');
	var marks = $('.highcharts-markers');

	if ($(window).width() > 991) {
		for (var i = 0; i < graphs.length; i++) {
			if (i > 0) {
				$(graphs[i]).css('visibility', 'hidden');
				$(marks[i]).css('visibility', 'hidden');
			}
		}
	}

	//Скрывает - показывает график при клике на строке таблицы
	var indicator = [
		'Выручка, грн.',
		'Наличные',
		'Безналичный расчет',
		'Кредитные карты',
		'Средний чек, грн.',
		'Средний гость, грн.',
		'Удаления из чека (после оплаты), грн.',
		'Удаления из чека (до оплаты), грн.',
		'Количество чеков',
		'Количество гостей'
	]

	$('tr').on('click', function () {

		if ($(window).width() > 991) {

			if ($(this).find('td').html() == 'Выручка, грн.') {

				$(graphs[0]).toggleClass('graph-hidden');
				$(marks[0]).toggleClass('graph-hidden');

			} else {

				for (var i = 0; i < 10; i++) {

					if ($(this).find('td').html() == indicator[i]) {

						$(graphs[i]).toggleClass('graph-visible');
						$(marks[i]).toggleClass('graph-visible');

						break;
					}
				}
			}
		}
	});
});

