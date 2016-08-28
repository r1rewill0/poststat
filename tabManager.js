var tabManager = function(tabs_id, tab_contents_id) {
	
	var active_tab = null;
	var active_content = null;
	
	var tab_elems = document.getElementById(tabs_id);
	var content_elems = document.getElementById(tab_contents_id);
	for (var i = 0; i < tab_elems.children.length; i++) {
		var child = tab_elems.children[i];
		child.addEventListener("click", function() {setActiveTab(this)});
		var content = getContentByTabId(child.id);
		if (content) content.style.display = 'none';
	}
	setActiveTab(tab_elems.children[0]);
	
	function setActiveTab(tab) {
		if (active_tab != null) {
			active_tab.className = "";
			active_content.style.display = "none";
		}
		active_tab = tab;
		active_content = getContentByTabId(tab.id);
		active_tab.className = "active_link";
		active_tab.style.display = "block"
		active_content.style.display = "block";
		updateHeight();
	}
	
	function getContentByTabId(id) {
		return document.getElementById(id + '_content');
	}
	
	function getTab(tab_id) {
		var tab = document.getElementById(tab_id);
		var tab_content = getContentByTabId(tab_id);
		if (!tab || !tab_content) return null;
		return {id: tab_id, elem: tab, content: tab_content, isActive: function() {return active_tab && active_tab.id == tab_id}, setActive: function() {setActiveTab(tab)}, show: function() {tab.style.display = 'block'}, hide: function() {tab.style.display = 'none'}, rename: function(new_name) {tab.children[0].children[2].innerHTML = new_name;}};
	}
	
	function getActive() {return getTab(active_tab.id);}
	
	function hideAll() {
		for (var i = 0; i < tab_elems.children.length; i++) {
			var tab = tab_elems.children[i];
			tab.style.display = 'none';
			var tab_content = getContentByTabId(tab.id);
			tab_content.style.display = 'none';
			tab_content.innerHTML = '';
		}
	}
	
	return {tab: getTab, active: getActive, hideAll: hideAll};
}