var FirstPosts = function() {
	var first_posts_count = 10;
	var wall_id, gen_name, offsets;
	var	can_see_all_posts, all_count, owner_count;
	var wait_more = false;
	
	function init(id) {
		wall_id = id;
		offsets = {all: 0, owner: 0}, filter = "all";
		getQueryAboutObject(id, function(data) {
			if (data.response) {
				if (data.response.deactivated) return;
				gen_name = wall_id >= 0 ? data.response.about.first_name : 'сообщества';
				can_see_all_posts = data.response.about.can_see_all_posts == 1;
				all_count = data.response.all_count;
				owner_count = data.response.owner_count;
				createHTMLStructure();
				initFirstPosts();
			}
		});
	}
	
	function createHTMLStructure() {
		var start = '<div class="summary_wrap" id="fw_summary_wrap">' + (can_see_all_posts ? '<div class="pg_pages fl_r" id="fw_pages"><a id="first_filter" class="fl_l" onclick="FirstPosts.changeFilter()">' + getFilterName() + '</a></div>' : '') + '<div class="summary" id="fw_summary" style="padding-top:0px;">' + getSummaryName() + '</div></div>';
		var wall_all = createWall('all', 'block');
		var wall_owner = can_see_all_posts ? createWall('owner', 'none') : '';
		document.getElementById('tab_first_posts_content').innerHTML = start + wall_all + wall_owner;
	}
	
	function createWall(filter, display) {
		var startWall = '<div class="wall_module wide_wall_module" id="first_wall_' + filter + '" style="display: ' + display + ';"><div class="clear_fix"><div class="wall_posts own">';
		var endWall = '</div><a class="more_link clear" id="wall_more_link_' + filter + '" onload="updateHeight()" onclick="FirstPosts.showMore(\'' + filter + '\')" style="display: block;"><div class="progress" id="wall_more_progress" style="display: block;"></div><div style="display: none;">к следующим записям</div></a></div></div>';
		return startWall+endWall;
	}
	
	function getQueryAboutObject(wall_id, callback) {
		var about_code = wall_id >= 0 ?
			'API.users.get({' + (wall_id > 0 ? 'user_ids:' + wall_id + ', ' : '') + 'fields: "can_see_all_posts", name_case: "gen"})[0]' :
			'API.groups.getById({group_id:' + (-wall_id) + ', fields: "can_see_all_posts"})[0]';
		var code = 'return {about:' + about_code + ', all_count: API.wall.get({owner_id:' + wall_id + ', count: 1, filter:"all"}).count, owner_count: API.wall.get({owner_id: ' + wall_id + ', count: 1, filter:"owner"}).count};';
		VK.api("execute", {code: code, https: 1}, callback);
	}
	
	function initFirstPosts() {	
		filter = 'all';
		getFirstPosts(function(posts, next) {
			appendFirstPosts(posts, next);
			if (can_see_all_posts) {
				filter = 'owner';
				getFirstPosts(function(posts, next) {
					appendFirstPosts(posts, next);
					filter = 'all';
				});
			}
		});
	}
	
	function appendFirstPosts(first_posts, next) {
		var html = showPosts('post', first_posts, objects, {onlyPosts: true});
		document.getElementById('first_wall_' + filter).children[0].children[0].innerHTML = html;
		document.getElementById('wall_more_link_' + filter).style.display = next ? 'block' : 'none';
		updateHeight();
	}
	
	function getFilterName() {
		return filter == 'all' ? 'К записям ' + gen_name : 'Ко всем записям';
	}
	
	function getSummaryName() {
		var post_count = filter == 'all' ? all_count : owner_count;
		return 'Всего ' + post_count + ' ' + getDeclensionName(post_count);
	}
	
		function getDeclensionName(n) {
			n = n % 100;
			if ((n % 10 == 0) || (n % 10 > 4) || (n > 4 && n < 21))
				return 'записей';//20 записей
			else if (n % 10 == 1)
				return 'запись'; //21 запись
			else
				return 'записи'; //22 записи
	}
	
	function addProfilesAndGroups(data) {
		var objprofiles = data.profiles;
		var objgroups = data.groups;
		for (var i = 0; i < objprofiles.length; i++) {
			objects[objprofiles[i].id] = objprofiles[i];
		}
		for (var i = 0; i < objgroups.length; i++) {
			objects[-objgroups[i].id] = objgroups[i];
		}
	}

	function getFirstPosts(callback) {
		var offset_by_start = offsets[filter];
		var code = 'var all_count=API.wall.get({owner_id: ' + wall_id + ', filter: "' + filter+'"}).count;'
		+ 'var offset0 = all_count-' + (offset_by_start+first_posts_count) + ', count0 = all_count-' + offset_by_start + ';'
		+ 'var offset = offset0 > 0 ? offset0 : 0;'
		+ 'var count = offset > 0 ? ' + first_posts_count + ' : count0 > 0 ? count0 : 0;'
		+ 'return {next: offset > 0, value: API.wall.get({owner_id: ' + wall_id + ', count: count, offset: offset, filter: "' + filter + '", extended:1, https: 1})};';
		VK.api("execute", {code:code}, function (data) {
			if (data.response) {
				console.log("HI", data.response);
				addProfilesAndGroups(data.response.value);
				var first_posts = data.response.value.items.reverse();
				offset_by_start += first_posts.length;
				offsets[filter] = offset_by_start;
				var next = data.response.next;
				callback(first_posts, next);
			}
			else {
				if (data.error.error_code != 6) return showErrorResult("Не удалось", data.error);
				console.error("FAIL", data.error);
				setTimeout(function() {getFirstPosts(callback)}, 300);
			}
		});
	}

	function showMore() {
		if (offsets[filter] == -1) return;
		wait_more = true;
		var wml = document.getElementById('wall_more_link_' + filter);
		console.log("LOG", offsets, filter);
		wml.children[1].style.display = 'none';
		wml.children[0].style.display = 'block';
		getFirstPosts(function(first_posts, next) {
			wml.previousSibling.insertAdjacentHTML('beforeEnd', showPosts('post', first_posts, objects, {onlyPosts: true}));
			wml.children[0].style.display = 'none';
			wml.children[1].style.display = 'block';
			if (!next) {
				wml.style.display = 'none';
				offsets[filter] = -1;
			}
			updateHeight();
			wait_more = false;
		});
	}

	function changeFilter() {
		
		filter = filter == 'owner' ? 'all' : 'owner';
		console.log("LOG I CHANGE FILTER, NOW: " + filter)
		document.getElementById('first_filter').innerHTML = getFilterName();
		document.getElementById('fw_summary').innerHTML = getSummaryName();
		document.getElementById('first_wall_all').style.display = filter == 'all' ? 'block' : 'none';
		document.getElementById('first_wall_owner').style.display = filter == 'owner' ? 'block' : 'none';
		updateHeight();
	}

	function onScroll() {
		if (document.getElementById('tab_first_posts_content').style.display != 'none' && !wait_more)
		{
			showMore();
		}
	}

return {init: init, scroll: onScroll, showMore: showMore, changeFilter: changeFilter};
}();