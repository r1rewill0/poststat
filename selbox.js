function SelBox(content_id) {
	var int_item = null, sel_input = null;
	var can_show = false;

	var html = '<div class="fl_l wall_search_wrap"><div class="input_back">';
	html += '<div class="input_back_content" style="width: 407px; color: rgb(140, 142, 145);">'
	html += '<div class="sel_item_box fl_l summary_tab_sel" style="display:none;">';
	html += '<a class="summary_tab2">'
	html += '<div class="summary_tab3"><table cellspacing=0 cellpadding=0><tr><td><nobr class="sel_item_text"></nobr></td><td><div class="sel_item_del" ></div></td></tr></table></div>'
	html += '</a></div>';
	html += '<div class="sel_pointer"></div>';
	/*html += '<div><ul class="sel_options"></ul><ul class="sel_options"></ul></div><ul class="sel_options" style="display:none"></ul>';
	html += '</div>';*/
	html += '</div></div>';
	html += '<input type="text" autocomplete="off" class="sel_input" autofocus>';

	html += '<div class="sel_box" style="display: none;"><div class="summary_tabs clear_fix"><div><div class="fl_l summary_tab_sel"><a class="summary_tab2"><div class="summary_tab3"><nobr>Друзья</nobr></div></a></div><div class="fl_l summary_tab"><a class="summary_tab2"><div class="summary_tab3"><nobr>Сообщества</nobr></div></a></div></div><div class="fl_l summary_tab" style="display: none"><a class="summary_tab2"><div class="summary_tab3"><nobr>К друзьям и сообществам</nobr></div></a></div></div><div><ul class="sel_options" style="display: block;"></ul><ul class="sel_options"></ul></div><ul class="sel_options" style="display:none"></ul></div>';
	html += '</div>';
	
	
	
	var m = document.getElementById(content_id);
	m.innerHTML = html;
	var input_back = m.getElementsByClassName("input_back")[0];
	var sel_item_box = m.getElementsByClassName("sel_item_box")[0];
	var sel_item_text = m.getElementsByClassName("sel_item_text")[0];
	var sel_item_del = m.getElementsByClassName("sel_item_del")[0];
	var sel_pointer = m.getElementsByClassName("sel_pointer")[0];
	var sel_box = m.getElementsByClassName("sel_box")[0];
	console.log(sel_box);
	var sel_tabs = sel_box.children[0].children[0];
	var sel_friends_tab = sel_tabs.children[0];
	var sel_groups_tab = sel_tabs.children[1];
	var sel_back_tab = sel_box.children[0].children[1];
	var sel_lists = sel_box.children[1];
	var sel_friends_list = sel_lists.children[0];
	var sel_groups_list = sel_lists.children[1];
	var sel_search_list = sel_box.children[2];
	sel_input = m.getElementsByClassName("sel_input")[0];
	
	sel_friends_list.style.display = 'block';
	sel_pointer.style.display = true;
	can_show = true;
	setListeners();
	
	var me, my_friends, my_groups;
	var code = 'return {me: API.users.get({fields: "photo_50"})[0], friends: API.friends.get({order: "name", fields: "photo_50"}).items, groups: API.groups.get({extended:1}).items};';
	VK.api('execute', {code: code, v: "5.34", test_mode: tm, https: 1}, createItems);
	
	function createItems(data) {
		if (!data.response) return;
		me = data.response.me;
		me.name = me.first_name + ' ' + me.last_name;
		my_friends = data.response.friends;
		my_friends.splice(0, 0, me);
		my_groups = data.response.groups;
		for (var i = 0; i < my_friends.length; i++) {
			var friend = my_friends[i];
			friend.name = friend.first_name + ' ' + friend.last_name;
			createItem(sel_friends_list, friend, friend.id);
		}
		for (var i = 0; i < my_groups.length; i++) {
			var group = my_groups[i];
			createItem(sel_groups_list, group, -group.id);
		}
	}

	function createItem(list, item, id, other_list) {
		var li = document.createElement('li');
		var a = document.createElement('a');
		a.className = "sel_option";
		a.innerHTML = '<span class="sel_checkbox"></span><input type="hidden" value="' + id + '"><img class="sel_option_photo" src="' + item.photo_50 + '"><label class="sel_option_text">' + item.name + '</label>';
		a.onclick = !other_list ? chooseItem : function() {
			chooseItemByLi(item.option);
		};
		li.appendChild(a);
		if (!other_list) item.option = a;
		list.appendChild(li);
	}
	
	function setListeners() {
		
		sel_item_del.onclick = deleteItem;
		sel_pointer.onclick = showOrHide;
		sel_friends_tab.onclick = chooseFriends;
		sel_groups_tab.onclick = chooseGroups;
		sel_input.onkeyup = onKeyUp;
		sel_back_tab.onclick = showNormalTabs;
		window.addEventListener('mousedown', hide);
		sel_pointer.addEventListener('mousedown', stopPropagation);
		sel_box.addEventListener('mousedown', stopPropagation);
	}
	
	function showOrHide() {
		if (sel_box.style.display == 'block') {
			sel_box.style.display = 'none';
		}
		else {
			showNormalTabs();
			sel_box.style.display = 'block';
		}
	}
	
	function hide() {
		sel_box.style.display = 'none';
	}
	
	function stopPropagation(e) {
		e.stopPropagation();
	}
	
	function chooseFriends() {
		sel_friends_tab.className = 'fl_l summary_tab_sel';
		sel_groups_tab.className = 'fl_l summary_tab';
		sel_groups_list.style.display = 'none';
		sel_friends_list.style.display = 'block';
	}
	
	function chooseGroups() {
		sel_groups_tab.className = 'fl_l summary_tab_sel';
		sel_friends_tab.className = 'fl_l summary_tab';
		sel_friends_list.style.display = 'none';
		sel_groups_list.style.display = 'block';		
	}
	
	function chooseItem() {
		chooseItemByLi(this);
	}
	
	function chooseItemByLi(li) {
		showNormalTabs();
		if (int_item) int_item.className = 'sel_option';
		int_item = li;
		int_item.className = 'sel_option_selected';
		item_title = int_item.children[3].innerHTML;
		sel_item_text.innerHTML = item_title.length > 30 ? item_title.substr(0, 30) + '...' : item_title;
		sel_item_box.style.display = 'block';
		sel_box.style.display = 'none';
		sel_input.value = '';
	}
	
	function deleteItem() {
		sel_item_box.style.display = 'none';
		int_item.className = 'sel_option';
		sel_input.focus();
		int_item = null;
	}
	
	 function onKeyUp(event) {
		if (event.keyCode==13) {
			showNormalTabs();
			sel_box.style.display = 'none';
			VKAnalysis.show();
			return;
		}
		var value = sel_input.value.toLowerCase();
		if (!value) return hide();
		var result = [];
		findInArr(my_friends);
		findInArr(my_groups);
		if (result.length == 0) return hide();
		result = result.slice(0, 10);
		sel_search_list.innerHTML = '';
		for (var i = 0; i < result.length; i++) {
			var item = result[i];
			createItem(sel_search_list, item, item.id, true);
		}
		sel_tabs.style.display = 'none';
		sel_lists.style.display = 'none';
		sel_search_list.style.display = 'block';
		sel_back_tab.style.display = 'block';
		sel_box.style.display = 'block';
		
		function findInArr(arr) {
			for (var i = 0; i < arr.length; i++) {
				var item = arr[i];
				if (item.name.toLowerCase().indexOf(value) >= 0) {
					result.push(item);
				}
			}
		}
	}
	
	function showNormalTabs() {
		sel_search_list.style.display = 'none';
		sel_back_tab.style.display = 'none';
		sel_tabs.style.display = 'block';
		sel_lists.style.display = 'block';
	}

	function getId(callback) {
		if (int_item != null) {
			callback(int_item.children[1].value);
		}
		else {
			var match, value = sel_input.value;
			if (value == '') return;
			if (match = value.match(/(https?\:\/\/)?(vk\.com\/|vkontakte\.ru\/)?([\w_\.]+)/)) {
				var short_name = match[3];
				if ((match = value.match(/id(\d+)/)) || (match = value.match(/wall(\-?\d+)/))) {
					callback(match[1]);
				}
				else if (match = value.match(/(club|public|event)(\d+)/)) {
					callback('-' + match[2]);
				}
				else {
					VK.api('utils.resolveScreenName', {screen_name: short_name}, function(data) {
						if (data.response && data.response.object_id) {
							callback((data.response.type=='group' ? '-' : '') + data.response.object_id);
						}
					});
				}
			}
		}
	}

return {getId: getId};
};