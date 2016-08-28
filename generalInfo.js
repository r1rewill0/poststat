var GeneralInfo = function() {
	
	var owner_id = null;
	var top_count = 3000, top_post_count = 50;
	var top_posts_by_likes = [], top_posts_by_comments = [], top_posts_by_reposts = [], top_comments = [];
	var post_authors    = {hash: [], have2: false, only2: true};
	var comment_authors = {hash: []};
	var like_authors    = {hash: [], have2: false, only2: true};
	var popular_reposts = {hash: []};
	var post_count = 0; owner_count = 0; repost_count = 0;
	var wall_likes_count = 0; wall_comments_count = 0; wall_reposts_count = 0;
	var with_likes_count = 0, with_comments_count = 0, with_reposts_count = 0;
	var comment_likes_count = 0;
	var analysis_time = 0;
	var week_serial = [], month_serial = [];
	var first_date = null, last_date = null;
	var friend_likes_count = 0;
	
	//Добавление информации о профилях и группах
	function appendProfilesAndGroups(data) {
		var objprofiles = data.profiles;
		var objgroups = data.groups;
		for (var i = 0; i < objprofiles.length; i++) {
			objects[objprofiles[i].id] = objprofiles[i];
		}
		for (var i = 0; i < objgroups.length; i++) {
			objects[-objgroups[i].id] = objgroups[i];
		}
	}
	
	//Добавление статистики постов
	function append(posts) {
		if (posts.length == 0) return;
		for (var i = 0; i < posts.length; i++) {
			var post = posts[i];
			post_count++;
			owner_id = post.owner_id;
			if (post.owner_id == post.from_id) {
				owner_count++;
			}
			if (post.copy_history) repost_count++;
			wall_likes_count += post.likes.count;
			wall_comments_count += post.comments.count;
			wall_reposts_count += post.reposts.count;
			if (post.copy_history) {
				appendAuthor('post', post.copy_history[0].from_id, post, popular_reposts);
			}
			if (post.likes.count > 0) with_likes_count++;
			if (post.comments.count > 0) with_comments_count++;
			if (post.reposts.count > 0) with_reposts_count++;
			appendAuthor('post', post.from_id, post, post_authors, false);
			if (post.signer_id)	appendAuthor('post', post.signer_id, post, post_authors, true);
			appendToSerials(post.date);
		}
		if (!first_date) {
			first_date = posts[0].is_pinned && posts.length > 1 ? posts[1].date : posts[0].date;
		}
		last_date = posts[posts.length - 1].date;
		sort_this(top_posts_by_likes, posts, sortTopLikes, top_post_count);
		sort_this(top_posts_by_comments, posts, sortTopComments, top_post_count);
		sort_this(top_posts_by_reposts, posts, sortTopReposts, top_post_count);
	}
	
	//Добавление статистики комментариев
	function appendComments(complex_comments) {
		appendProfilesAndGroups(complex_comments);
		var comments = complex_comments.items;
		for (var i = 0; i < comments.length; i++) {
			var comment = comments[i];
			appendAuthor('comment', comment.from_id, comment, comment_authors);
			comment_likes_count += comment.likes.count;
		}
		sort_this(top_comments, comments, sortTopLikes, top_post_count);
	}
	
	//Добавление статистики лайков
	function appendLikes(likes) {
		friend_likes_count += likes.length;
		for (var i = 0; i < likes.length; i++) {
			var like = likes[i];
			if (!objects[like.id]) objects[like.id] = like;
			appendAuthor('like', like.id, like.post, like_authors);
		}
	}
	
	//Вспомогательные методы
	function sortTopLikes(a, b)    {return b.likes.count - a.likes.count; }
	function sortTopComments(a, b) {return b.comments.count - a.comments.count; }
	function sortTopReposts(a, b)  {return b.reposts.count - a.reposts.count; }
	
	/*function sort_this_new(best_items, items, sort_func, max_count) {
		for (var i = 0; i < items.length; i++) {
			var item = items[i];
			best_items.push(item);
		}
		best_items.sort(sort_func);
		best_items.splice(max_count);
	}*/
		
	function sort_this(best_items, items, sort_func, max_count) {
		for (var i = 0; i < items.length; i++) {
			var item = items[i];
			if (best_items.length == max_count && sort_func(item, best_items[max_count - 1]) > 0) continue;
			best_items.push(items[i]);
			var comp = 1;
			for (var j = best_items.length - 2; comp > 0 && j >= 0; j--) {
				comp = sort_func(best_items[j], best_items[j+1]);
				if (comp > 0) {
					temp = best_items[j+1];
					best_items[j+1] = best_items[j];
					best_items[j] = temp;
				}
			}
			if (best_items.length > max_count) {
				best_items.splice(max_count);
			}
		}
	}
	
	function appendAuthor(type, id, post, author_info, condition2) {
		var obj = objects[id];
		if (!obj) return;
		if (!author_info.hash[id]) author_info.hash[id] = {id: id, name: (id > 0 ? obj.first_name + ' ' + obj.last_name : obj.name), url: 'http://vk.com/' + (obj.screen_name || (id > 0 ? 'id' + id : 'club' + (-id))), object: obj, items: [], count: 0, items2: [], count2: 0};
		var author = author_info.hash[id];
		author.items.push(post);
		author.count++;
		if (condition2) {
			author_info.have2 = true;
			author.count2++;
			author.items2.push(post);
		}
		else if (type == 'post' && id > 0 || type != 'post')
			author_info.only2 = false;
	}
	
	function appendToSerials(unixstamp) {
		var date = new Date(unixstamp*1000);
		var first = new Date(date.getFullYear(), date.getMonth(), date.getDate());
		var milli = first.getTime() - 1000 * 60 * 60 * 24 * ((date.getDay() + 6) % 7);
		first = new Date(milli);
		var month_date = new Date(date.getFullYear(), date.getMonth());
		appendToSerial(week_serial, first);
		appendToSerial(month_serial, month_date);
	}
	
	function appendToSerial(serial, new_date) {
	var lastInSerial = serial.length > 0 ? serial[serial.length - 1] : null;
		if (lastInSerial != null && lastInSerial.date.valueOf() == new_date.valueOf()) {
			lastInSerial.value++;
		}
		else {
			var struct = {date: new_date, value:1};
				if (lastInSerial == null || lastInSerial.date.valueOf() > new_date.valueOf()) {
				serial.push(struct);
			}
			else {
				var i = 0;
				while (i < serial.length - 1 && serial[i].date.valueOf() > new_date.valueOf()) i++;
				if (serial[i].date.valueOf() == new_date.valueOf())
					serial[i].value++;
				else
					serial.splice(i, 0, struct);
			}
		}
	}
	
	//Завершение анализа
	function finish() {
		hashToArray('post', post_authors);
		hashToArray('comment', comment_authors);
		hashToArray('like', like_authors);
		hashToArray('post', popular_reposts);
		week_serial.reverse();
		month_serial.reverse();
	}
	
	function hashToArray(type, authors) {
		var result = [];
		for (var i in authors.hash)
			result.push(authors.hash[i]);
		result = result.sort(function(a,b) {return b.count - a.count});
		authors.top = result;
		authors.show2 = (type == 'post' || type == 'like') && authors.have2 && !authors.only2;
		for (var i = 0; i < result.length; i++) {
			var author = result[i];
			var items = author.items;
			author.first_date = getDate(items[0].is_pinned && items.length > 1 ? items[1].date : items[0].date);
			author.last_date = getDate(items[items.length - 1].date);
		}
	}
	
	function getDate(unix_timestamp){
		if (!unix_timestamp) return 'дата';
		var date = new Date(unix_timestamp * 1000);
		return date;
	}
	
	//Отображение результатов
	function show() {
		if (!owner_id) return;
		getGenName(owner_id, real_show);
	}
	
	function real_show(gen_name, owner_id) {
		tabs.tab('tab_general').content.innerHTML = showGeneralInfo(gen_name);
		showSerialChart(owner_id);
		show_posts_or_error(top_posts_by_likes, 'likes', 'tab_top_posts_by_likes', 'Нет ни одной записи с лайками');
		show_posts_or_error(top_posts_by_comments, 'comments', 'tab_top_posts_by_comments', 'Нет ни одной записи с комментариями');
		show_posts_or_error(top_posts_by_reposts,  'reposts', 'tab_top_posts_by_reposts', 'Нет ни одной записи с репостами');
		showOptionalInfo();
	}
	
	function showGeneralInfo(gen_name) {
		var result = '<div class="general_section"><h2>Общая информация</h2><table class="counters">';
		result += '<tr><td>Всего записей:</td><td>' + post_count + '</td></tr>';
		result += '<tr><td>Записей ' + gen_name + ':</td><td>' + owner_count + '</td></tr>';
		result += '<tr><td>Репостов на стене:</td><td>' + repost_count + '</td></tr>';
		result += '</table></div><div class="general_section"><h2>Лайки, комментарии, репосты</h2><table class="counters">';
		result += '<tr><td>Число лайков:</td><td>' + wall_likes_count + '</td></tr>';
		if (sett.friend_likes)
		result += '<tr><td>В том числе от друзей:</td><td>' + friend_likes_count + '</td></tr>';
		result += '<tr><td>Число комментариев:</td><td>' + wall_comments_count + '</td></tr>';
		result += '<tr><td>Число репостов со стены:</td><td>' + wall_reposts_count + '</td></tr>';
		result += '</table></div><div class="general_section"><h2>Записи с лайками, комментариями и репостами</h2><table class="counters">';		
		result += '<tr><td>Число записей c лайками:</td><td>' + with_likes_count + '</td></tr>';
		result += '<tr><td>Число записей с комментариями:</td><td>' + with_comments_count + '</td></tr>';
		result += '<tr><td>Число записей с репостами:</td><td>' + with_reposts_count + '</td></tr>';
		result += '</table></div><div class="general_section"><h2>Прочее</h2><table class="counters">';
		result += '<tr><td>Время выполнения (с):</td><td>' + analysis_time + '</td>';
		if (comment_likes_count > 0)
		result += '<tr><td>Число лайков в комментариях:</td><td>' + comment_likes_count + '</td></tr>';
		result += '</table></div>';
		return result;
	}
	
	function showSerialChart() {
		if (post_count <= 1) return;
		var cont = tabs.tab('tab_general').content;
		var day_count = Math.round((first_date - last_date)/60/60/24);
		var avg_week = day_count == 0 ? 0 : Math.round(post_count * 7 / day_count);
		cont.innerHTML += '<div class="general_section" style="margin-bottom:5px"><h2>Временной ряд</h2><div style="line-height:160%;">Число дней от первого поста до последнего: <b>' + day_count + '</b><br/>Среднее число постов в неделю: <b>' + avg_week + '</b></div></div>';
		SerialChart.init(owner_id, cont, week_serial, month_serial);
		updateHeight();
	}

	function show_posts_or_error(posts, counter, tab_id, warning) {
		if (posts[0][counter].count > 0)
			PostList.create('post', posts, objects, tab_id);
	}
	
	function showOptionalInfo() {
		UserList.create('post', post_authors.top, objects, 'tab_top_post_authors', post_authors.show2);
		UserList.create('repost', popular_reposts.top, objects, 'tab_popular_reposts');
		if (sett.comments && top_comments.length > 0) {
			tabs.tab('tab_top_comments').show();
			PostList.create('comment', top_comments, objects, 'tab_top_comments');
			UserList.create('comment', comment_authors.top, objects, 'tab_top_comment_authors');
			tabs.tab('tab_top_comment_authors').show();
		}
		if (sett.likes && like_authors.top.length > 0) {
			UserList.create('like', like_authors.top, objects, 'tab_top_like_authors');
			tabs.tab('tab_top_like_authors').show();
		}
	}
	
	//Открытие данных пользователя в новой вкладке
	function showAuthorPosts(gen_name, id, type, column2) {
		var author = type == 'post' ? post_authors.hash[id] : type == 'comment' ? comment_authors.hash[id] : type=='like' ? like_authors.hash[id] : type=='repost' ? popular_reposts.hash[id] : null;
		var posts = type == 'post' ? (column2 ? author.items2 : author.items) : author.items;
		console.info('В НОВОЙ ВКЛАДКЕ', posts);
		var tab_name = 'tab_author_posts';
		PostList.create(type == 'comment' ? 'comment' : 'post', posts, objects, tab_name);
		tabs.tab(tab_name).show();
		var new_name = type == 'post' ? 'Посты от' : type == 'comment' ? 'Комментарии от' : type == 'like' ? 'Лайкнутые посты от' : type == 'repost' ? 'Репосты' : null;
		tabs.tab(tab_name).rename(new_name + ' ' + gen_name);
		tabs.tab(tab_name).setActive();
		updateHeight();
	}
	
	function getGenName(id, callback, type, column2) {
		if (id > 0) {
			VK.api('users.get', {user_ids: id, name_case: 'gen', https: 1}, function(data) {
				var gen_name = data.response ? data.response[0].first_name : 'автора';
				callback(gen_name, id, type, column2);
			});
		}
		else callback('группы', id, type, column2);
	}
	
	function showAuthorPostsWithoutGenName(id, type, column2) {
		getGenName(id, showAuthorPosts, type, column2);
	}
	
	function setDate(a, b) {
		analysis_time = Math.round((b-a)/1000.0, 3);
	}

	return {append: append, appendProfilesAndGroups: appendProfilesAndGroups, appendComments: appendComments, appendLikes: appendLikes, setDate: setDate, finish: finish, show: show, showAuthorPosts: showAuthorPostsWithoutGenName};
};