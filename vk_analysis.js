var generalInfo, objects, wait = false;

var VKAnalysis = function() {
	
	var query_count = 20, query_post_count = 100, max_count = 50;
	
	window.onerror = function() {
		showErrorResult('');
	}

	function show() {
		var startDate = new Date();
		if (wait) return;
		var object_id, all_post_count = 0, local_post_count = 0, offset = 0;
		var local_post_count_multiplier = 1;
		objects = [];
		generalInfo = GeneralInfo();
		var min_time = getMinTime();
		selbox.getId(start);
		
		function start(id) {
			showStart();
			object_id = id;
			recur();
		}
		
		function getMinTime() {
			var min_time = 0;
			var sel_val = document.getElementById('sett_time').value;
			switch (sel_val) {
				case 'week': min_time = (new Date()).getTime() / 1000 - 7 * 24 * 60 * 60; break;
				case 'month': min_time = (new Date()).getTime() / 1000 - 1 * 31 * 24 * 60 * 60; break;
				case 'quarter': min_time = (new Date()).getTime() / 1000 - 3 * 31 * 24 * 60 * 60; break;
				case 'half_year': min_time = (new Date()).getTime() / 1000 - 6 * 31 * 24 * 60 * 60; break;
				case 'year': min_time = (new Date()).getTime() / 1000 - 366 * 24 * 60 * 60; break;
			}
			return min_time;
		}
		
		function recur() {
			var massive = [];
			for (var i = 0; i < query_count; i++) {
				massive.push('API.wall.get({owner_id:' + object_id + ',count:' + query_post_count + ', offset:' + (offset+i*query_post_count) + ',extended: 1})');
			}
			var code = 'return [' + massive.join(',') + '];';
			console.time('recur');
			console.time('recur2')
			VK.api('execute', {code: code, https: 1}, function (data) {
				console.timeEnd('recur');
				if (data.response) {
					var posts = [];
					var hundreds = data.response;
					var old = false;
					all_post_count = hundreds[data.response.length - 1].count;
					var offset_growth = 0, comm_count = 0;
					for (var i = 0; i < hundreds.length && !old; i++) {
						var hundred = hundreds[i];
						var hundred_posts = hundred.items;
						generalInfo.appendProfilesAndGroups(hundred);
						for (var j = 0; j < hundred_posts.length; j++) {
							var post = hundred_posts[j]
							if (post.date < min_time) {
								if (!post.is_pinned) {old = true; break;}
							} else {
								posts.push(hundred_posts[j]);
							}
						}
					}
					offset_growth += posts.length;
					generalInfo.append(posts);
					comm_count += getCommentCount(posts);
					local_post_count_multiplier = comm_count == 0 ? 1 : sett.likes && sett.comments ? 2 : 1;
					getStatObjects('comments', comm_count > 0, posts, function() {getStatObjects('likes', true, posts, function () { 
						offset += offset_growth;
						if (!sett.comments && !sett.likes)
							setPercent(100 * offset / all_post_count);
						console.timeEnd('recur2');
						if (offset < all_post_count && !old)
							setTimeout(recur, 0);
						else
							showResult();
					});});
				}
				else {
					if (data.error.error_code == 6)
						setTimeout(recur, 0);
					else
						showErrorResult("Неизвестная ошибка", data.error);
				}
			});
		}
		
		function getCommentCount(posts) {
			var result = 0;
			for (var i = 0; i < posts.length; i++) {
				result += posts[i].comments.count;
			}
			return result;
		}
		
		function getStatObjects(type, has_objects, posts, callback) {
			if (!sett[type] || !has_objects) return callback();
			var pack_posts;
			var ii = 0, kk = 0;
			var pack_count = 100, query_count = 20;
			var count = 0;
			recur();
			
			function recur() {
				var next_code = getCode();
				VK.api("execute", {code: next_code.code, https: 1}, function(data) {
					if (data.response) {
						for (var i = 0; i < data.response.length; i++) {
							var complex_item = data.response[i];
							if (type == 'comments') comments_stat_analysis(complex_item); else likes_stat_analysis(complex_item);
						}
						setPercent(100 * local_post_count / (local_post_count_multiplier * all_post_count));
						if (next_code.next) setTimeout(recur, 300); else callback();
					}
					else {
						if (data.error.error_code == 6)
							setTimeout(recur, 300);
						else
							showErrorResult("Неизвестная ошибка", data.error);
					}
				});
			}
			
			function comments_stat_analysis(complex_item) {
				var comments = complex_item.items;
				for (var j = 0; j < comments.items.length; j++) {
					var comment = comments.items[j];
					comment.post = pack_posts[complex_item.post_id];
					count++;
				}
				generalInfo.appendComments(comments);
			}
			
			function likes_stat_analysis(complex_item) {
				var likes = complex_item.items.items;
				for (var j = 0; j < likes.length; j++) {
					var like = likes[j];		
					like.post = pack_posts[complex_item.post_id];
					count++;
				}
				generalInfo.appendLikes(likes);
				return count < complex_item.count;
			}
			
			function getCode() {
				var result = 'var res=[];';
				var next = true;
				pack_posts = [];
				for (var c = 0; c <= query_count;) {
					if (ii >= posts.length) {
						next = false;
						break;
					}
					var post = posts[ii];
					if (post[type].count == 0 || kk >= post[type].count || type=='likes' && sett.friend_likes && kk > 0) {
						kk = 0;
						ii++;
						local_post_count++;
					}
					else {
						if (type == 'comments')
							result += 'res.push({post_id:' + post.id + ',items:API.wall.getComments({owner_id:' + post.owner_id + ',post_id:' + post.id + ',offset:' + kk + ',count:' + pack_count + ',need_likes:1,extended:1})});';
						else
							result += 'res.push({post_id:' + post.id + ',items:API.likes.getList({type:"post",owner_id:' + post.owner_id + ',item_id:' + post.id + ',offset:' + kk + ',count:' + pack_count + ',need_likes:1,' + (sett.friend_likes ? 'friends_only:1,' : '') + 'extended:1})});';
						pack_posts[post.id] = post;
						kk += pack_count;
						c++;
					}
				}
				result += 'return res;';
				return {code: result, next: next};
			}
		}
		
		function setPercent(p) {
			p = Math.round(p);
			if (p > 100) p = 100;
			var msg = p + '%';
			this_.progress_elem.style.width = msg;
			VK.callMethod('setTitle', msg);
		}
		
		function showStart() {
			setPercent(0);
			this_.my_progress.style.display = 'block';
			this_.my_result.style.display = 'none';
			this_.err_result.style.display = 'none';
			this_.main_result.style.display = 'none';
			tabs.hideAll();
			updateHeight();
			wait = true;
		}
			
		function showResult() {
			var endDate = new Date();
			generalInfo.setDate(startDate, endDate);
			generalInfo.finish();
			generalInfo.show();
			FirstPosts.init(object_id);
			tabs.tab('tab_general').setActive();
			tabs.tab('tab_first_posts').show();
			console.timeEnd('all_time');
			VK.callMethod('setTitle', '');
			this_.my_progress.style.display = 'none';
			this_.my_result.style.display = 'block';
			this_.main_result.style.display = 'block';
			updateHeight();
			wait = false;
		}
	}
	
	return {show: show};
}();

var minheight = 450, app_width = 635;
function updateHeight() {
	var app_height = Math.max(minheight, this_.my_result.clientHeight + this_.my_result.offsetTop);
	VK.callMethod('resizeWindow', app_width, app_height);
}

function showErrorResult(result, err) {
	VK.callMethod('setTitle', '');
	this_.my_progress.style.display = 'none';
	this_.main_result.style.display = 'none';
	this_.err_result.innerHTML = '<div class="warning">' + result + '</div>';
	this_.err_result.style.display = 'block';
	this_.my_result.style.display = 'block';
	updateHeight();
	wait = false;
	if (err) console.error(err);
}