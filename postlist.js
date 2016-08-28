var PostList = function() {
	
	var post_pack_count = 10;	
	var infos = [];
	
	function create(type, posts, objects, tab_id, params) {

		var info = {type: type, posts: posts, count: posts.length, offset: 0, wall_elem: null, more_link_elem: null};	
		var order = params && params.order == true ? true : false;
		var show_summary = params && params.show_summary == true ? true : false;
		
		if (order) posts.reverse();
		createHTMLStructure();
		addPostPack(info);
		infos[tab_id] = info;
		tabs.tab(tab_id).show();
		
		function createHTMLStructure() {
			var html = show_summary ? '<div class="summary_wrap"><div class="summary" style="padding-top:0px;">Всего ' + info.count + ' ' + getDeclensionName(info.count) + '</div></div>' : '';
			html += '<div class="wall_module wide_wall_module"><div class="clear_fix"><div class="wall_posts own"></div>';
			html += '<a class="more_link clear" onload="updateHeight()" style="display: block;"><div class="progress" style="display: block;"></div><div style="display: none;">к следующим записям</div></a></div></div>';
			var m = document.getElementById(tab_id + '_content');
			m.innerHTML = html;
			var wall_module = m.children[show_summary ? 1 : 0].children[0];
			info.wall_elem = wall_module.children[0];
			info.more_link_elem = wall_module.children[1];
			info.more_link_elem.onclick = onClick;
		}

		function getDeclensionName(n) {
			n = n % 100;
			return (n % 10 == 0) || (n % 10 > 4) || (n > 4 && n < 21) ? 'записей' : n % 10 == 1 ? 'запись' : 'записи';
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
		var post_pack = info.posts.slice(info.offset, info.offset + post_pack_count);
		info.wall_elem.insertAdjacentHTML('beforeEnd', showPosts(info.type, post_pack, objects, {onlyPosts: true}));
		info.offset += post_pack_count;
		if (info.offset >= info.count - 1) {
			info.more_link_elem.style.display = 'none';
		}
		updateHeight();
	}

	return {create: create, scroll: onScroll};
}();