var _ = function (type, props, children) {
	var elem = null;
	if (type === "text") {
		return document.createTextNode(props);
	} else {
		elem = document.createElement(type);
	}
	for (var n in props) {
		if (n === "style") {
			for (var x in props.style) {
				elem.style[x] = props.style[x];
			}
		} else if (n === "className") {
			elem.className = props[n];
		} else if (n === "event") {
			for (var x in props.event) {
				elem.addEventListener(x, props.event[x]);
			}
		} else {
			elem.setAttribute(n, props[n]);
		}
	}
	if (children) {
		for (var i = 0; i < children.length; i++) {
			if (children[i] != null)
				elem.appendChild(children[i]);
		}
	}
	return elem;
};

function dataExpand() {
	var container = this.lastElementChild;
	while (container.children.length) {
		animationQueue.push({
			type: 'data-row',
			elem: container.children[0]
		});
		this.parentNode.appendChild(container.children[0]);
	}
	this.remove();
	animationTrigger();
}
function genBlock(total, data) {
	var child = [], max = data[0][1], content = document.querySelector('.content'), count = 0;
	data.forEach(function (i) {
		count += i[1];
		child.push(_('div', { className: 'data-row' }, [
			_('div', { className: 'back-progress', style: { width: (i[1] / max * 100) + '%' } }),
			_('div', { className: 'item-name' }, [_('text', i[0])]),
			_('div', { className: 'item-count' }, [_('text', i[1])])
		]));
	});
	if (count < total) {
		child.push(_('div', { className: 'data-row' }, [
			_('div', { className: 'back-progress', style: { width: ((total - count) / total * 100) + '%' } }),
			_('div', { className: 'item-name' }, [_('text', '其他')]),
			_('div', { className: 'item-count' }, [_('text', total - count)])
		]));
	}
	if (data.length > 10) {
		count = 0;
		for (var i = 0; i < 10; i++) {
			count += data[i][1];
		}
		child.push(_('div', { className: 'data-row', style: { cursor: 'pointer' }, event: { click: dataExpand } }, [
			_('div', { className: 'back-progress', style: { width: ((total - count) / total * 100) + '%' } }),
			_('div', { className: 'item-name' }, [_('text', '其他' + (data.length - 10) + '条数据')]),
			_('a', { style: { display: 'none' } }, child.splice(10))
		]));
	}
	child.forEach(function (i) {
		animationQueue.push({
			type: 'data-row',
			elem: i
		});
	});
	content.appendChild(_('div', { className: 'data-block' }, child));
}

var pieTitle = {
	city: '访客城市',
	nation: '访客地区',
	request: '请求地址',
	referrer: '来源页面',
	referrer_domain: '来源域名',
	ua: '用户客户端',
	browser: '用户浏览器',
	os: '用户系统'
};
function addPie(total, json, name) {
	var data = [], count = 0;
	for (var i = 0; i < json[name].length; i++) {
		if (i >= 10) break;
		count += json[name][i][1];
		data.push({
			y: json[name][i][1] / total * 100,
			name: json[name][i][0]
		});
	}
	if (count < total) {
		data.push({
			y: (total - count) / total * 100,
			name: '其他'
		});
	}
	animationQueue.push({
		type: 'pie',
		elem: document.getElementById('pie-' + name),
		param: {
			chart: {
				backgroundColor: 'transparent',
				renderTo: 'pie-' + name,
				type: 'pie',
				style: {
					fontFamily: 'inherit'
				}
			},
			tooltip: {
				pointFormat: '{series.ame}: {point.percentage:.1f}%'
			},
			plotOptions: {
				pie: {
					dataLabels: {
						enabled: false
					}
				}
			},
			credits: {
				enabled: false
			},
			title: {
				text: pieTitle[name]
			},
			series: [{
				type: 'pie',
				colorByPoint: true,
				data: data
			}]
		}
	});
}

function dataReceived(json) {
	animationQueue = [];
	var total = 0, content = document.querySelector('.content');
	json.os.forEach(function (i) { total += i[1]; });
	Array.from(content.children).forEach(function (i) { i.remove(); });
	//city+nation
	content.appendChild(_('div', { className: 'data-pie twin' }, [
		_('div', { className: 'pie', id: 'pie-city' }),
		_('div', { className: 'pie-gap' }),
		_('div', { className: 'pie', id: 'pie-nation' })
	]));
	addPie(total, json, 'city');
	addPie(total, json, 'nation');
	genBlock(total, json.city);
	genBlock(total, json.nation);
	//request
	content.appendChild(_('div', { className: 'data-pie' }, [
		_('div', { className: 'pie', id: 'pie-request' })
	]));
	addPie(total, json, 'request');
	genBlock(total, json.request);
	//referrer
	content.appendChild(_('div', { className: 'data-pie twin' }, [
		_('div', { className: 'pie', id: 'pie-referrer' }),
		_('div', { className: 'pie-gap' }),
		_('div', { className: 'pie', id: 'pie-referrer_domain' })
	]));
	addPie(total, json, 'referrer');
	addPie(total, json, 'referrer_domain');
	genBlock(total, json.referrer);
	genBlock(total, json.referrer_domain);
	//ua+browser
	content.appendChild(_('div', { className: 'data-pie twin' }, [
		_('div', { className: 'pie', id: 'pie-ua' }),
		_('div', { className: 'pie-gap' }),
		_('div', { className: 'pie', id: 'pie-browser' })
	]));
	addPie(total, json, 'ua');
	addPie(total, json, 'browser');
	genBlock(total, json.ua);
	genBlock(total, json.browser);
	//os
	content.appendChild(_('div', { className: 'data-pie' }, [
		_('div', { className: 'pie', id: 'pie-os' })
	]));
	addPie(total, json, 'os');
	genBlock(total, json.os);
	animationTrigger();
}

var animationQueue = [], animationQueueRunning = false;
function animationTick() {
	animationQueueRunning = true;
	var hit = false;
	loop: for (var i = 0; i < animationQueue.length; i++) {
		var item = animationQueue[i], box;
		switch (item.type) {
			case 'data-row':
				box = item.elem.getBoundingClientRect();
				if (box.top < (innerHeight)) {
					item.elem.className += ' in';
					animationQueue.splice(i, 1);
					hit = true;
					break loop;
				}
				break;
			case 'pie':
				box = item.elem.getBoundingClientRect();
				if (box.top < (innerHeight)) {
					new Highcharts.Chart(item.param);
					animationQueue.splice(i, 1);
					hit = true;
					break loop;
				}
				break;
		}
	}
	hit && setTimeout(animationTick, 30);
	animationQueueRunning = hit;
}
function animationTrigger() {
	if (!animationQueueRunning)
		animationTick();
}
window.addEventListener('scroll', animationTrigger);
window.addEventListener('resize', animationTrigger);

var xhr = null,
	dateString;
function getData(date) {
	if (xhr != null && xhr.abort) {
		xhr.abort();
		xhr = null;
	}

	xhr = new XMLHttpRequest();
	xhr.open('GET', 'https://estertion.github.io/BiliPlus-Processed-Log-Data/' + date + '.json', true);
	xhr.onreadystatechange = function () {
		if (xhr.readyState == 4) {
			if (xhr.status == 200) {
				try {
					dataReceived(JSON.parse(xhr.response));
					document.querySelector('.head_date').textContent = dateString;
					toTop();
				} catch (e) { }
			} else {
				console.warn('获取失败，状态码：' + xhr.status);
			}
			xhr = null;
		}
	};
	xhr.send();
}
window.addEventListener('load', function () {
	var check = function (e) {
		return (e < 10 ? '0' : '') + e;
	};
	flatpickr.l10ns.default.firstDayOfWeek = 1;
	head_date = flatpickr('.head_date', {
		minDate: '2016.10.11',
		maxDate: 'today',
		appendTo: document.querySelector('.heading'),
		dateFormat: 'Y年m月d日',
		static: true,
		disableMobile: true,
		locale: 'zh',
		onChange: function (dates, dateStr) {
			dateString = dateStr;
			document.querySelector('.head_date').textContent = '加载中…';
			getData(('' + dates[0].getFullYear() + check(dates[0].getMonth() + 1) + check(dates[0].getDate())).substr(2));
		}
	});
});

toTop = (function () {
	var currentPos, startTime, scrolling = false,
		toTopFunc = function (time) {
			var dt = time - startTime,
				y = Math.max(currentPos * (1 - dt / 500), 0);
			window.scrollTo(0, y);
			if (dt < 500)
				requestAnimationFrame(toTopFunc);
			else
				scrolling = false;
		};
	return function () {
		if (scrolling) return;
		scrolling = true;
		currentPos = scrollY;
		startTime = performance.now();
		requestAnimationFrame(toTopFunc);
	};
})();