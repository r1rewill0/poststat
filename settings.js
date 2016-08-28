var sett = {
comments: false,
likes: false,
friend_likes: false,
showOrHide: function() {
var elem = document.getElementById('more_settings_content');
elem.style.display = elem.style.display == 'none' ? 'block' : 'none';
document.getElementById('more_settings_link').innerHTML = elem.style.display == 'none' ? 'Дополнительные параметры' : 'Скрыть дополнительные параметры';
updateHeight();
},
checkbox: function(type, cb) {
cb.className = cb.className =='checkbox off' ? 'checkbox on' : 'checkbox off';
var value = cb.className == 'checkbox on' ? true : false;
if (type=='comments') this.comments = value;
else if (type=='likes') {
	this.likes = value;
	this.friend_likes = false;
	var cb_friends = document.getElementById('friend_likes_checkbox');
	var cb_friends_row = document.getElementById('friend_likes_checkbox_row');
	cb_friends_row.style.display = value ? 'block' : 'none';
	cb_friends.className = 'checkbox off';
	
}
else if (type=='friend_likes') this.friend_likes = value;
}
};