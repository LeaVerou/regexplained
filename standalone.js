window.regexptester = new RegExpTester(document.body);

var tweetButton = $('.tweet.button');
tweetButton.onclick = tweetButton.onmouseover = function() {
	this.href = 'http://twitter.com/intent/tweet?hashtags=regexplained&text=%40regexplained%20' +
		encodeURIComponent('/' + regexptester.input.value + '/' + regexptester.flags);
}

$$('#keyboard-shortcuts > dfn').forEach(function(dfn) {
	var keys = $$('kbd[data-keycode], kbd[data-ctrlkey]', dfn);

	dfn.setAttribute('tabindex', '0');

	dfn.onclick = function() {
		var e = {};

		keys.forEach(function(kbd) {
			if (kbd.hasAttribute('data-keycode')) {
				e.keyCode = +kbd.getAttribute('data-keycode');
			}
			else if (kbd.hasAttribute('data-ctrlkey')) {
				e.ctrlKey = true;
			}
		});

		$.fire(document.body, 'keydown', e);
	};
});

if (self.requestAnimationFrame && self.Promise) {
	// Fancy tooltips
	$.include(self.tippy, "https://unpkg.com/tippy.js@2/dist/tippy.js").then(function() {
		tippy('[title]', {
			arrow: true,
			size: "large"
		});
	});

	$.create("link", {
		"href": "https://unpkg.com/tippy.js@2/dist/tippy.css",
		"rel": "stylesheet",
		"inside": document.head
	});
}
