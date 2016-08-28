
//ОТОБРАЖЕНИЕ ПОСТОВ

/*
type - тип постов: 'post' или 'comment'
posts - массив объектов-постов
objects - ассоциативный массив: ключ - id пользователя или сообщества, значение - объект Profile
params - параметры отображения
	onlyPosts
*/

function showPosts(type, posts, objects, params) {
	var months = ['янв','фев','мар','апр','мая','июн','июл','авг','сен','окт','ноя','дек'];
	var only_posts = params && params.onlyPosts == true;
	
	function showThisPosts() {
		if (posts.length == 0) return '';
		var result = '';
		if (!only_posts) {
			result += '<div class="page_wall_posts">';
		}
		for (var i = 0; i < posts.length; i++) {
			var post = posts[i];
			var from_info = getInfoById(post.from_id);
			if (!from_info) continue;
			var post_url = 'http://vk.com/wall' + (type == 'post' ? post.owner_id + '_' + post.id : post.post.owner_id + '_' + post.post.id + '?reply=' + post.id); 
			var post2_url = type == 'post' ? post_url : 'http://vk.com/wall' + post.post.owner_id + '_' + post.post.id;
			var pair = type == 'post' ? post.owner_id + '_' + post.id : post.post.owner_id + '_' + post.post.id;
			var post_date = getDateTime(post.date);
			
			result += '<div class="post"><div class="_post_content">'; //Начало поста		
			result += showPostHeader(from_info, post_url, post_date); //Шапка поста	
			result += '<div class="post_content"><div class="post_info">'; //Контент поста	
			result += '<div class="wall_text">'; //Сам пост
			result += '<div class="_wall_post_cont">' + showPostContent(post, post2_url) + '</div>';
			result += showPostQuote(post);
			result += '</div>';		
			result += showPostLikes(post, post_url);//Лайки, репосты		
			result += '</div></div>';//Конец контента поста	
			result += '</div></div>';//Конец поста
		}
		if (!only_posts) {
			result += '</div>';
		}
		return result;
	}
	
	function showPostHeader(from_info, post_url, post_date) {
		return '<div class="post_header"><a class="post_image" href="' + from_info.url + '" target="_blank"><img class="post_img" src="' + from_info.photo_50 + '" width=50 height=50 onload="updateHeight()"></a><div class="post_header_info"><h5 class="post_author"><a class="author" href="' + from_info.url + '" target="_blank">' + from_info.name + '</a></h5><div class="post_date"><a class="post_link" href="' + post_url + '" target="_blank"><span class="rel_date">' + post_date + '</span></a></div></div></div>';
	}
	
	function showPostLikes(post, post_url) {
		var result = '<div class="post_full_like_wrap clear_fix"><div class="post_full_like"><a class="post_like"><i class="post_like_icon"></i><span class="post_like_link _link">Мне нравится</span><span class="post_like_count _count">' + (post.likes.count > 0 ? post.likes.count : '') + '</span></a>'
		if (post.reposts) {
			result += '<a class="post_share _share_wrap' + (post.reposts.count > 0 ? '' : ' no_shares') + '"><i class="post_share_icon _icon"></i><span class="post_share_link _link">Поделиться</span><span class="post_share_count _count">' + (post.reposts.count > 0 ? post.reposts.count : '') + '</span></a>';
		}
		result += '</div>';
		if (post.comments && post.comments.count > 0) {
			var com_count = post.comments.count + ' ' + getDeclensionName(post.comments.count, ['комментариев', 'комментарий', 'комментария']);
			result += '<span class="reply_link_wrap"><a href="' + post_url + '" class="reply_link" target="_blank">' + com_count + '</a></span>';
		}
		result += '</div>';
		return result;
	}
	
	function showPostQuote(post) {
		if (!post.copy_history) return '';
		var repost = post.copy_history[0];
		var repost_owner_info = getInfoById(repost.owner_id, objects);
		var repost_from_info = getInfoById(repost.from_id, objects);
		if (!repost_owner_info) return '';
		if (!repost_from_info) {
			console.log("LOG XYI ZNAET CHTO", repost, objects);
		}
		var repost_url = 'http://vk.com/wall' + repost.owner_id + '_' + repost.id;
		var repost_date = getDateTime(repost.date);
		var result = '<div class="copy_quote">';
		result += showPostHeader(repost_from_info, repost_url, repost_date);
		result += showPostContent(repost, repost_url);
		result += '</div>';
		return result;
	}

	function showPostContent(post, post2_url) {
		var result = '';
		var text = getExtendedText(post.text);
		if (text)
			result += '<div class="wall_post_text">' + text + '</div>';
		photos = [], videos = [], audios = [], docs = [], picdocs = [], graffities = [], links = [], pages = [], polls = [], notes = [], albums = [], stickers = [];
		if (post.attachments) {
			for (var j = 0; j < post.attachments.length; j++) {
				att = post.attachments[j];
				if (att.type == 'photo')
					photos.push(att.photo);
				else if (att.type == 'video')
					videos.push(att.video);
				else if (att.type == 'audio')
					audios.push(att.audio);
				else if (att.type == 'doc')
					if (att.doc.photo_100)
						picdocs.push(att.doc);
					else
						docs.push(att.doc);
				else if (att.type == 'graffiti')
					graffities.push(att.graffiti);
				else if (att.type == 'link')
					links.push(att.link);
				else if (att.type == 'page')
					pages.push(att.page);
				else if (att.type == 'poll')
					polls.push(att.poll);
				else if (att.type == 'note')
					notes.push(att.note);
				else if (att.type == 'sticker')
					stickers.push(att.sticker);
				else if (att.type == 'album')
					albums.push(att.album);
			}
			if (picdocs.length >= 2) {
				result += '<div class="wall_browse_images"><a href="' + post2_url + '?browse_images=1" target="_blank">Просмотреть все изображения</a></div>';
			}
			var media_count = photos.length + videos.length + graffities.length;
			
			//Альбом(ы)
			if (albums.length > 0) {
				for (var j = 0; j < albums.length; j++) {
					album = albums[j];
					result += '<div class="wall_album_wrap clear_fix" style="width: 442px;"><div class="wall_album fl_l"><a href="http://vk.com/album' + album.owner_id + '_' + album.id + '" target="_blank" class="wall_album_cover_wrap"><img class="wall_album_cover" src="' + album.thumb.photo_604 + '"><div class="wall_album_caption"><div class="wall_album_title_wrap clear_fix"><div class="wall_album_title fl_l">' + album.title + '</div><div class="wall_album_count fl_r">' + album.size + '</div></div></div></a></div></div>';
				}
			}
			//Фото, видео, граффити
			if (media_count > 0) {
				for (var j = 0; j < post.attachments.length; j++) {
					att = post.attachments[j];
					if (att.type == 'photo' || att.type == 'video' || att.type == 'graffiti') {
						this_class = 'page_post_sized_full_thumb' + (j==0 ? ' page_post_sized_full_thumb_first' : '');
						result += '<div class="' + this_class + '"><div class="' + this_class + ' clear_fix" style="';
						if (att.type == 'photo') {
							photo = att.photo;
							photo_photo = photo.photo_604;
							var photo_width, photo_height;
							var hasWidth = photo.width;
							if (hasWidth) {
								photo_width = photo.width, photo_height = photo.height;
								if (photo_width > 537) {
									photo_height = photo_height * 537 / photo_width;
									photo_width = 537;
								}
								if (photo_height > 537) {
									photo_width = photo_width * 537 / photo_height;
									photo_height = 537;
								}
								photo_width = Math.floor(photo_width);
								photo_height = Math.floor(photo_height);
							}
							else {
								photo_width = 537;
								photo_height = 537;
							}
							var photo_url = post2_url + '?z=photo' + photo.owner_id + '_' + photo.id + (photos.length > 0 ? '%2Fwall' + (type=='post' ? post.owner_id + '_' + post.id : post.post.owner_id + '_' + post.id) : '');
							result += 'width: ' + photo_width + 'px; height: ' + photo_height + 'px;"><a href="' + photo_url + '" target="_blank" style="width: ' + photo_width + 'px; height: ' + photo_height + 'px;';
							if (hasWidth)
								result += '" class="page_post_thumb_wrap"><img src="' + photo_photo + '" width="' + photo_width + '" height="' + photo_height + '" onload="updateHeight()">';
							else	
								result += ' background-image: url(' + photo_photo + ');" class="page_post_thumb_unsized page_post_thumb_last_column page_post_thumb_last_row page_post_thumb_unsized_single" >';
							result += '</a></div>';
						}
						else if (att.type == 'video') {
							video = att.video;
							video_photo = video.photo_320;
							video_url = post2_url + '?z=video' + video.owner_id + '_' + video.id;
							result += 'width: 537px; height: 403px;"><a href="' + video_url + '" target="_blank" style="background-image: url(' + video_photo +'); width: 537px; height: 403px;" class="page_post_thumb_wrap image_cover  page_post_thumb_video page_post_thumb_last_column page_post_thumb_last_row" onload="updateHeight()"><div class="page_post_video_play_inline"></div><span class="page_post_video_duration_single">' + getDuration(video.duration) + '</span></a></div>';
							result += '<div class="media_desc post_video_desc"><a class="lnk" href="' + video_url + '" target="_blank"><span class="a post_video_title"><b class="video"></b><span class="post_video_title_content">' + video.title + '</span></span><span class="post_video_views_count">' + video.views + ' ' + getDeclensionName(video.views, ['просмотров', 'просмотр', 'просмотра']) + '</span></a></div>';
						}
						else if (att.type == 'graffiti') {
							graffiti = att.graffiti;
							gr_photo = graffiti.photo_586;
							var graffiti_url = post2_url + '?z=graffiti' + graffiti.id + '?from_id=' + graffiti.owner_id
							result += 'width: 537px; height: 268px;"><a href="' + graffiti_url + '" style="width: 537px; height: 268px;" target="_blank" class="page_post_thumb_wrap"><img src="' + gr_photo + '" width="537" height="268" class="page_post_thumb_sized_photo" onload="updateHeight()"></a></div>';
						}
						result += '</div>';
					}
				}
			}
			
			//аудио, документы, гифки и опросы
			if (stickers.length + audios.length + docs.length + picdocs.length + polls.length > 0) {
				result += '<div class="post_media clear_fix">';
				result += '<div class="wall_audio_rows _wall_audio_rows">';
				for (var j = 0; j < audios.length; j++) {
					audio = audios[j];
					result += '<div class="audio_row _audio_row inlined clear_fix"><div class="audio_play_wrap"><button class="audio_play _audio_play"></button></div><div class="audio_info"><div class="audio_duration_wrap _audio_duration_wrap"><div class="audio_duration _audio_duration">' + getDuration(audio.duration) + '</div></div><div class="audio_title_wrap"><a href="/search?c[section]=audio&amp;c[q]=' + encodeURIComponent(audio.artist) + ' + &amp;c[performer]=1" class="audio_performer" target="_blank">' + audio.artist + '</a><span class="audio_info_divider">–</span><span class="audio_title _audio_title"><span class="audio_title_inner" tabindex="0">' + audio.title + '</span><span class="audio_author"></span></span></div></div></div>';
				}
				result += '</div>';
				
				for (var j = 0; j < docs.length; j++) {
					doc = docs[j];
					filename = doc.title.length - doc.ext.length - 1 > 46 ? doc.title.substr(0, 46) + '..' : doc.title;
					result += '<div class="media_desc"><a class="lnk" href="' + doc.url + '" target="_blank"><b class="fl_l doc"></b>Файл <span class="a">' + filename + '</span></a></div>';
				}
				for (var j = 0; j < picdocs.length; j++) {
					doc = picdocs[j];
					filename = doc.title.length - doc.ext.length - 1 > 10 ? doc.title.substr(0, 10) + '...' + doc.ext : doc.title;
					filesize = doc.size < 1000*1000 ? Math.ceil(doc.size / 1000) + 'Kb' : Math.ceil(doc.size / (1000*1000)) + 'Mb';
					result += '<div class="media_desc media_desc_soft"><a href="' + doc.url + '" target="_blank"><div class="page_doc_photo" style="background-image: url(' + doc.photo_100 + ');"></div><div class="page_doc_photo_hint"><span class="fl_l">' + filename + '</span>&nbsp;<span class="fl_r">' + filesize + '</span></div></a></div>';
				}
				for (var j = 0; j < polls.length; j++) {
					poll = polls[j];
					result += '<div class="page_media_poll_wrap"><div class="page_media_poll_title_wrap clear_fix"><span class="fl_r page_media_poll_desc">' + (poll.anonymous ? 'Анонимное голосование' : 'Открытое голосование') + '</span><div class="page_media_poll_title">' + poll.question + '</div></div><div class="page_media_poll"><div class="page_poll_stats">';
					console.log(poll.answers);
					var votes_arr = poll.answers.map(function(x) {return x.votes});
					var max_votes = Math.max.apply(null, votes_arr);
					console.log(max_votes);
					for (var k = 0; k < poll.answers.length; k++) {
						var answer = poll.answers[k];
						var answer_width = max_votes == 0 ? 0 : answer.votes * 100 / max_votes;
						console.log(max_votes, answer.votes, answer.votes * 100 / max_votes, answer_width);
						result += '<div class="page_poll_stat"><div class="page_poll_text">' + answer.text + '</div><div class="page_poll_row_wrap"><div class="page_poll_row_percent">' + answer.rate + '%</div><div class="page_poll_row"><div class="page_poll_percent" style="width: ' + answer_width + '%;"></div><div class="page_poll_row_count">' + getDelimNum(answer.votes) + '</div></div></div></div>';
					}
					progolosoval = getDeclensionName(poll.votes, ['Проголосовало', 'Проголосовал', 'Проголосовали']);
					chelovek = getDeclensionName(poll.votes, ['человек', 'человек', 'человека']);
					result += '</div><div class="page_poll_bottom"><span class="page_poll_total">' + progolosoval + ' <b>' + getDelimNum(poll.votes) + '</b> ' + chelovek + '.</span></div></div></div>';
				}
				result += '</div>';
			}
			for (var i = 0; i < notes.length; i++) {
				note = notes[i];
				result += '<div class="media_desc"><a class="lnk" href="http://vk.com/note' + post.owner_id + '_' + note.id + '" target="_blank"><b class="fl_l note"></b>Заметка <span class="a">' + note.title + '</span></a></div>';
			}
			if (links.length > 0) {
				var link = links[0];
				var short_url = getShortUrl(link.url);
				if (short_url == 'vk.com' || short_url == 'vkontakte.ru')
					result += '<div class="group_share clear clear_fix"><div class="photo fl_l"><a href="' + link.url + ' target=\"_blank\""><img src="' + link.image_src + '" onload="updateHeight()"></a></div><div class="info fl_l"><div class="title"><a href="' + link.url + '" target="_blank">' + link.title + '</a></div><div class="desc">' + link.description + '</div></div></div>';
				else {
					result += '<div class="media_desc"><a class="lnk" href="' + link.url + '" target="_blank"><b class="fl_l"></b><span class="a">' + short_url + '</span></a></div>';
					console.log("IMG", link);
					if (media_count == 0) {
						var short_text = getShortText(link.description, 180, '..');
						if (link.image_src) {
							result += '<div class="media_desc"><div class="page_media_thumbed_link"><table cellpadding="0" cellspacing="0"><tbody><tr><td href="' + link.url + '" target="_blank" style="background-image: url(' + link.image_src + ');" class="page_media_link_thumb"><a href="' + link.url +'" target="_blank" class="page_media_link_thumb"></a></td><td class="page_media_link_desc_td"><div class="page_media_link_desc_wrap page_media_link_wpreview_desc"><a href="' + link.url + '" target="_blank" class="page_media_link_title">' + link.title + '</a><div class="page_media_link_desc">' + short_text + '</div></div></td></tr></tbody></table></div></div>';
						}
						else {
							result += '<div class="media_desс"><a class="lnk lnk_mail clear_fix" href="' + link.url + '" target="_blank"><span class="lnk_mail_title a clear_fix">' + link.title + '</span><span class="lnk_mail_domain clear_fix">' + short_url + '</span><span class="lnk_mail_description clear_fix"></span></a></div>';
						}
					}
				}
			}
			if (pages.length > 0) {
				var link = pages[0];
				var url = 'http://vk.com/page-' + link.group_id + '_' + link.id;
				result += '<div class="media_desc"><a class="lnk" href="' + url + '" target="_blank"><b class="fl_l"></b>Страница <span class="a">' + getShortText(link.title, 21, '..') + '</span></a><div class="post_media_link_preview_wrap inl_bl"><div class="button_blue"><a href="' + url + '" target="_blank"><button><span class="wall_postlink_preview_btn_label">Просмотреть</span></button></a></div></div></div>';
			}
			if (stickers.length > 0) {
				var sticker = stickers[0];
				result += '<a><img height=128 class="sticker_img" src="' + sticker.photo_128 + '"></a>';
			}
		}
		if (post.geo) {
			result += '<div class="media_desc"><a class="page_media_place clear_fix"><span class="fl_l checkin_big"></span><div class="fl_l page_media_place_label">' + post.geo.place.title.replace(', ', '<br>') + '</div></a></div>';
		}
		if (post.signer_id) {
			signer = objects[post.signer_id];
			result += '<div class="wall_signed"><a class="wall_signed_by" href="http://vk.com/' + signer.screen_name + '" target="_blank">' + signer.first_name + ' ' + signer.last_name + '</a></div>';
		}
		return result;
	}

	function getInfoById(id) {
		if (!id) return null;
		var result = {id: id, name: '', screen_name: '', photo_50: '', photo_100: ''};
		var info = objects[id];
		result.name = id > 0 ? info.first_name + ' ' + info.last_name : info.name;
		result.screen_name = info.screen_name;
		result.photo_50 = info.photo_50;
		result.photo_100 = info.photo_100;
		result.url = 'http://vk.com/' + (info.screen_name || (info.id > 0 ? 'id' + info.id : 'club' + Math.abs(info.id)));
		return result;
	}

	function getInfoByScreenName(screen_name) {
		if (!screen_name) return null;
		var id;
		if (match = screen_name.match(/(wall|id|club|event|public)(-?\d+)/)) {
			id = match[2];
			return screen_name;
		}
		if (!id) return null;
	}

	function getExtendedText(text) {
		var reHashtag =  /([^\wа-яёА-ЯЁ]|^)\#([a-zA-Zа-яёА-ЯЁ][\wа-яёА-ЯЁ_@]*)/g;
		var reVKLink = /\[(.+?)\|(.+?)\]/g;
		var reUri = /((https?:\/\/)?([\wа-яёА-ЯЁ\-_]+(\.[\wа-яёА-ЯЁ\-_]+)*?\.(ac|ad|ae|aero|af|ag|ai|al|am|an|ao|aq|ar|army|arpa|as|asia|at|au|aw|ax|axa|az|ba|bar|bb|bd|be|beer|best|bf|bg|bh|bi|bid|bike|bio|biz|bj|blue|bm|bmw|bn|bo|br|bs|bt|buzz|bv|bw|by|bz|bzh|ca|cab|camp|care|cash|cat|cc|cd|ceo|cf|cg|ch|ci|city|ck|cl|club|cm|cn|co|com|cool|coop|cr|cu|cv|cw|cx|cy|cz|de|desi|dj|dk|dm|dnp|do|dz|ec|edu|ee|eg|er|es|et|eu|eus|fail|farm|fi|fish|fj|fk|fm|fo|foo|fr|fund|ga|gal|gb|gd|ge|gent|gf|gg|gh|gi|gift|gl|gm|gmo|gn|gop|gov|gp|gq|gr|gs|gt|gu|guru|gw|gy|haus|hiv|hk|hm|hn|host|hr|ht|hu|id|ie|il|im|in|info|ink|int|io|iq|ir|is|it|je|jm|jo|jobs|jp|ke|kg|kh|ki|kim|kiwi|km|kn|kp|kr|krd|kred|kw|ky|kz|la|land|lb|lc|lgbt|li|life|limo|link|lk|lr|ls|lt|lu|luxe|lv|ly|ma|mc|md|me|meet|menu|mg|mh|mil|mini|mk|ml|mm|mn|mo|mobi|moda|moe|mp|mq|mr|ms|mt|mu|mv|mw|mx|my|mz|na|name|navy|nc|ne|net|nf|ng|ngo|nhk|ni|nl|no|np|nr|nra|nrw|nu|nyc|nz|om|ong|onl|org|ovh|pa|pe|pf|pg|ph|pics|pink|pk|pl|pm|pn|post|pr|pro|ps|pt|pub|pw|py|qa|qpon|re|red|ren|rest|rich|rio|ro|rs|ru|ruhr|rw|sa|sb|sc|scb|scot|sd|se|sexy|sg|sh|si|sj|sk|sl|sm|sn|so|sohu|soy|sr|st|su|surf|sv|sx|sy|sz|tax|tc|td|tel|tf|tg|th|tips|tj|tk|tl|tm|tn|to|town|toys|tp|tr|tt|tv|tw|tz|ua|ug|uk|uno|us|uy|uz|va|vc|ve|vet|vg|vi|vn|vote|voto|vu|wang|wed|wf|wien|wiki|ws|wtc|wtf|xxx|xyz|ye|yt|za|zm|zone|zw)([\w\-\.,@?^=%\&;:\/~\+#]*[\w\-\@?^=%\&;\/~\+#])?))/g;
		text = text.replace(/\</g, "&lt;");
		text = text.replace(/\>/g, "&gt;");
		text = text.replace(/\n/g, '<br>').replace(reUri, '<a href="http://$3" target="_blank">$1</a>');
		text = text.replace(Emoji.emojiRegEx, Emoji.emojiReplace).replace(/\uFE0F/g, '');
		var vklinks = text.match(reVKLink);
		if (vklinks) {
			for (var i = 0; i < vklinks.length; i++) {
				vklink = vklinks[i];
				vklink_delim = vklink.indexOf('|');
				vklink_addr = vklink.substring(1, vklink_delim);
				vklink_title = vklink.substring(vklink_delim + 1, vklink.length - 1); 
				if ((vklink_sname = getInfoByScreenName(vklink_addr))) {
					new_link = '<a href="http://vk.com/' + vklink_sname + '" class="mem_link" target="_blank">' + vklink_title + '</a>';
					text = text.replace(vklink, new_link);
				}
			}
		}
		return text.replace(reHashtag, '$1<a href="http://vk.com/feed?section=search&q=%23$2" target="_blank">#$2</a>');
	}

	function getShortUrl(url) {
		var result = url.substr(7);
		if (result.charAt(0) == '/')
			result = result.substr(1);
		var i = result.indexOf('/');
		if (i > 0)
			result = result.substr(0, i);
		return result;
	}

	function getShortText(text, count, aft) {
		return text && text.length > count ? text.substr(0, count) + aft : text;
	}

	function getDelimNum(num) {
		return num.toString().replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, '$1<span class="delim"> </span>');
	}

	function getDateTime(unix_timestamp){
		if (!unix_timestamp) return 'Запись';
		var post_date = new Date(unix_timestamp * 1000);
			var year = post_date.getFullYear();
			var month = months[post_date.getMonth()];
			var day = post_date.getDate();
			var hour = post_date.getHours();
			var min = post_date.getMinutes();
			if (min < 10)
			min = '0' + min;
			var time = day + ' ' + month + (year != (new Date()).getFullYear() ? ' ' + year : '') + ' в ' + hour + ':' + min;
			return time;
	}

	function getDeclensionName(n, names) {
			n = n % 100;
			if ((n % 10 == 0) || (n % 10 > 4) || (n > 4 && n < 21)) {
				return names[0];//20 комментариев, 0 человек, записей
			} else
			if (n % 10 == 1) {
				return names[1]; //21 комментарий, 1 человек, запись
			} else {
				return names[2]; //22 комментария, 2 человека, записи
			}
	}

	function getDuration(duration) {
		result = '';
		hrs = Math.floor(duration / 3600);
		if (hrs > 0) {
			result += hrs + ':';
		}
		mins = Math.floor((duration % 3600) / 60);
		result += (mins < 10 && result != '') ? '0' + mins : mins;
		result += ':';
		secs = duration % 60;
		result += (secs < 10) ? '0' + secs : secs;
		return result;
	}
	

	return showThisPosts();
}