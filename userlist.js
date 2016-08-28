var UserList = function() {
	
	var post_pack_count = 30;	
	var infos = [];
	var sort_type = 0;
	
	function create(type, users, objects, tab_id, show2) {
		var info = {type: type, users: users, count: users.length, show2: show2, offset: 0, wall_elem: null, more_link_elem: null, sort_type: "count", sort_dir: false};
		createHTMLStructure();
		addPostPack(info);
		infos[tab_id] = info;
		if (users.length > 1) tabs.tab(tab_id).show();
		
		function createHTMLStructure() {	
			var title1 = type == 'post' ? 'Число постов' : type == 'comment' ? 'Число комментариев' : type == 'like' ? 'Число лайков' : type == 'repost' ? 'Число репостов' : null;
			var title2 = type == 'post' ? 'От имени группы' : type == 'like' ? 'Число репостов' : '';
			var html = '<div class="summary_wrap"><div class="pg_pages fl_r"><a class="fl_l">Поиск</a></div><div class="summary" style="padding-top: 0px;">Всего: ' + info.count + '</div></div>';
			html += '<div class="user_search_wrap" style="display:none"><input class="user_search"></div>';
			html += '<table class="top">' + getTableTitle() + '</table>';
			html += '<table class="top" style="display: none;"></table>'
			html += '<a class="more_link clear" onload="updateHeight()" style="display: block;"><div class="progress" style="display: block;"></div><div style="display: none;">к следующим записям</div></a>';
			var m = document.getElementById(tab_id + '_content');
			m.innerHTML = html;
			var search_link = m.children[0].children[0].children[0];
			var search_wrap = m.children[1], search_input = m.children[1].children[0];
			var main_table = m.children[2], search_table = m.children[3];
			var main_table_rows = main_table.children[0];
			var title_row = main_table_rows.children[0].children;
			var date_title = title_row[title_row.length - 1];
			var count_title = title_row[2];
			search_link.onclick = showOrHide;
			search_input.onkeypress = onKeyPress;
			info.wall_elem = main_table_rows;
			info.more_link_elem = m.children[4];
			info.more_link_elem.onclick = onClick;
			date_title.onclick = function() {sortBySmth("date")};
			count_title.onclick = function() {sortBySmth("count")};
			
			function getTableTitle() {
				return '<tr><td>#</td><td>Имя</td><td>' + title1 + '</td>' + (info.show2 ? '<td>' + title2 + '</td>' : '') + '<td>Период</td></tr>';
			}
			
			function showOrHide() {
				if (search_wrap.style.display == 'none') {
					search_wrap.style.display = 'block';
					this.innerHTML = 'Убрать поиск';
					search_input.focus();
					updateHeight();
				}
				else {
					search_wrap.style.display = 'none';
					this.innerHTML = 'Поиск';
					search_table.style.display = 'none';
					main_table.style.display = 'block';
					info.more_link_elem.style.display = 'block';
					updateHeight();
				}
			};
			
			function onKeyPress(event) {
				if (event.keyCode != 13) return;
				var value = search_input.value.toLowerCase();
				if (value == '') return;
				var result = [];
				for (var i = 0; i < users.length; i++) {
					var user = users[i];
					if (user.name.toLowerCase().indexOf(value) >= 0) result.push(user);
				}
				info.more_link_elem.style.display = 'none';
				main_table.style.display = 'none';	
				if (result.length > 0) {
					search_table.innerHTML = getTableTitle() + showItems(info.type, result.slice(0, 30), 0, info.show2);
					search_table.style.display = 'block';
				}
				else
					search_table.style.display = 'none';
				updateHeight();
			}
		}
		
		function sortBySmth(type) {
			var info = infos[tabs.active().id];
			var sort_func = null;
			info.sort_dir = info.sort_type == type ? !info.sort_dir : false;
			if (type == "date")
				//info.sort_dir == false - кто последний меня лайкал (по убыв даты), true - кто первый меня лайкал (по возр. даты)
				sort_func = function(a,b) {return (info.sort_dir ? a.last_date - b.last_date : b.first_date - a.first_date) || (b.id - a.id)};
			else if (type == "count")
				sort_func = function(a,b) {return (info.sort_dir ? a.count-b.count : b.count - a.count) || (b.last_date - a.last_date)};
			else
				return;
			info.sort_type = type;
			info.users.sort(sort_func);
			info.offset = 0;
			while (info.wall_elem.children.length > 1) {
				var child = info.wall_elem.children[1];
				info.wall_elem.removeChild(child);
			}
			info.more_link_elem.style.display = "block";
			addPostPack(info);
		}

		function getDeclensionName(n) {
			n = n % 100;
			return (n % 10 == 0) || (n % 10 > 4) || (n > 4 && n < 21) ? 'человек' : n % 10 == 1 ? 'человек' : 'человека';
		}
	}

	function onScroll() {
		var tab = tabs.active();
		var info = infos[tab.id];
		if (info && tab.elem.style.display != 'none') {
			addPostPack(info);
		}
	}
	
	function onClick() {
		var info = infos[tabs.active().id];
		addPostPack(info);
	}
	
	function addPostPack(info) {
		if (!info.more_link_elem || info.more_link_elem.style.display == 'none') return;
		var post_pack = info.users.slice(info.offset, info.offset + post_pack_count);
		info.wall_elem.insertAdjacentHTML('beforeEnd', showItems(info.type, post_pack, info.offset, info.show2));
		info.offset += post_pack_count;
		if (info.offset >= info.count) {
			info.more_link_elem.style.display = 'none';
		}
		updateHeight();
	}
	
	function showItems(type, post_pack, offset, show2) {
		var result = '';
		for (var i = 0; i < post_pack.length; i++) {
			var user = post_pack[i];
			var first_date = user.first_date.toLocaleDateString();
			var last_date = user.last_date.toLocaleDateString();
			var period = first_date == last_date ? first_date : 'С ' + last_date + ' по ' + first_date;
			result += '<tr><td>' + (offset+i+1) + '</td><td><a target=blank href="' + user.url + '">' + user.name + '</a></td><td><a onclick="generalInfo.showAuthorPosts(' + user.id + ',\'' + type + '\')">' + user.count + '</a></td>' + (show2 ? '<td>' + (user.count2 ? '<a onclick="generalInfo.showAuthorPosts(' + user.id + ',\'' + type + '\',true)">' + user.count2 + '</a>' : '') + '</td>' : '') + '<td>' + period + '</td></tr>';
		}
		return result;
	}
	
	return {create: create, scroll: onScroll};
}();