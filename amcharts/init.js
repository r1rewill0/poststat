var SerialChart = function () {
	
	var owner_id, week_serial, month_serial, sum_week_serial, sum_month_serial, type, is_sum;
	
	function init(id, content, week_ser, month_ser) {
		var html = '<div style="margin-top: 10px; width: 600px"><div style="height: 20px; float: right;">';
		html += '<a class="chart_item" onclick="SerialChart.selectType(this,0)">По неделям</a>';
		html += '<a class="chart_item chart_item_sel" onclick="SerialChart.selectType(this,1)">По месяцам</a></div>'
		html += '<div style="height: 20px; float: left;">'
		html += '<a class="chart_item chart_item_sel" onclick="SerialChart.selectSum(this,false)">Обычный</a>'
		html += '<a class="chart_item" onclick="SerialChart.selectSum(this,true)">С накоплением</a></div></div>'
		html += '<div id="serialElem" style="width: 600px; height: 300px;"></div>';
		content.innerHTML += html;
		owner_id = id;
		week_serial = week_ser;
		month_serial = month_ser;
		sum_week_serial = createSumSerial(week_serial);
		sum_month_serial = createSumSerial(month_serial);
		type = 1, is_sum = false;
		initChart();
	}
	
	function createSumSerial(serial) {
		var result = [];
		var sum = 0;
		if (serial.length > 0) {
			result.push(serial[0]);
			sum = serial[0].value;
		}
		for (var i = 1; i < serial.length; i++) {
			sum += serial[i].value;
			result.push({date: serial[i].date, value: sum});
		}
		return result;
	}
	
	function initChart() {
		var chartData = type == 0 ? (is_sum ? sum_week_serial : week_serial) : (is_sum ? sum_month_serial : month_serial);
		var chart = AmCharts.makeChart("serialElem", {
			type: "serial",
			pathToImages: "amcharts/images/",
			dataProvider: chartData,
			categoryField: "date",
			categoryAxis: {
				parseDates: true,
				gridAlpha: 0.15,
				minorGridEnabled: true,
				axisColor: "#DADADA"
			},
			valueAxes: [{
				axisAlpha: 0.2,
				id: "v1"
			}],
			graphs: [{
				title: "red line",
				id: "g1",
				valueAxis: "v1",
				valueField: "value",
				bullet: "round",
				bulletBorderColor: "#45688E",
				bulletBorderAlpha: 1,
				bulletSize: 2,
				lineThickness: 2,
				lineColor: "#45688E",
				negativeLineColor: "#0352b5",
				balloonText: "[[category]]<br><b><span style='font-size:14px;'>Постов: [[value]]</span></b>"
			}],
			chartCursor: {
				fullWidth:true,
				categoryBalloonColor: "#45688E",
				cursorAlpha:0.1,
				pan:true
			},
			chartScrollbar: {
				scrollbarHeight: 40,
				color: "#FFFFFF",
				autoGridCount: true,
				graph: "g1"
			},

			mouseWheelZoomEnabled:true
		});
		//chart.addListener("dataUpdated", function() {chart.zoomToIndexes(chartData.length - 40, chartData.length - 1);});
		chart.addListener("clickGraphItem", onclick);
	}
	
	function onclick(e) {
		var date = e.item.category;
		var date2 = null;
		if (type == 0) {
			date2 =  new Date(date.getTime() + 1000*60*60*24*6); //плюс шесть дней
		}
		else if (type == 1) {
			date1 = new Date(date.getFullYear(), date.getMonth() + 1, 1);			
			date2 = new Date(date1.getTime() - 1000*60*60*24);//плюс месяц, минус день
		}
		if (date2 > new Date()) return;
		function withZero(i) { return (i < 10 ? "0" + i : i).toString(); }
		var vk_day = withZero(date2.getDate()) + withZero(date2.getMonth() + 1) + date2.getFullYear();
		var addr = "http://vk.com/wall" + owner_id + "?day=" + vk_day;
		console.log(addr);	
		window.open(addr);

	}
	
	function selectType(elem, value) {
		type = value;
		selectItem(elem);
		initChart();
	}
	
	function selectSum(elem, value) {
		is_sum = value;
		selectItem(elem);
		initChart();
	}
	
	function selectItem(elem) {
		var children = elem.parentNode.children;
		for (var i = 0; i < children.length; i++) {
			children[i].className = "chart_item";
		}
		elem.className = "chart_item chart_item_sel";
	}
	
	return {init: init, selectType: selectType, selectSum: selectSum};
}()