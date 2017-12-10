CSS.registerProperty({
	name: "--progress",
	syntax: "<percentage>",
	inherits: false,
	initialValue: "0%"
});

(function($){

// Remove spaces in syntax breakdown and add classes to the ones that are towards the end
$$('.syntax-breakdown h1 code').forEach(function(code){
	code.innerHTML = code.innerHTML
		.replace(/[\t\r\n]/g, '');

	var text = code.textContent;

	$$('span', code).forEach(function(span){
		span.classList.add('delayed');

		if(text.indexOf(span.textContent) > text.length/2) {
			// FIXME will break when there are duplicates
			span.classList.add('after-middle');
		}
	});
});

$$('.regex-test.slide').forEach(function(slide){
	if (slide.title) {
		var heading = $("h1", slide);

		if (heading) {
			heading.innerHTML = slide.title + ": " + heading.innerHTML;
		}
	}

	slide.tester = new RegExpTester(slide);
});

(function(){
	var _ = window.TwitterSearch = $.Class({
		constructor: function(q, details) {
			this.q = q;
			this.details = details;
		},

		send: function(q) {
			var url = `twittersearch.php?q=${encodeURIComponent(this.q)}&since_id=${_.maxId}&count=100&result_type=recent`;

			return $.fetch(url, {responseType: "json"})
				.then(xhr => {
					this.onload && this.onload(xhr.response);
				});
		},

		static: {
			maxId: 0,

			dateOffset: function (date) {
				var seconds = Math.round((+new Date - new Date(date))/1000);

				if (seconds >= 3600) {
					var hours = Math.round(seconds/3600);
					return hours + ' hour' + (hours===1? '' : 's') + ' ago'
				}

				if(seconds > 60) {
					var minutes = Math.round(seconds/60);
					return minutes + ' minute' + (minutes===1? '' : 's') + ' ago'
				}

				return seconds + ' seconds ago';
			}
		}
	});
})();

$$('.slide[data-type="Challenge"]').forEach(function(slide) {
	var minutes = slide.getAttribute('data-duration') || 1,
	    duration = 60 * minutes;

	var video = $.create({
		tag: "video",
		src: "videos/" + (slide.getAttribute("data-video") || "hamsters.webm"),
		preload: "metadata",
		loop: true
	});

	var timer = $.create({
		className: 'timer',
		'data-duration': minutes,
		style: {
			"--duration": minutes * 60
		},
		contents: [{
			tag: 'button',
			contents: 'Go!',
			type: 'button',
			onclick: function(){
				var running = true;
				video.play();
				timer.classList.add('running');

				// var search = new TwitterSearch('#regexplained', details);
                //
				// search.onload = function(data) {
				// 	// Process data
				// 	var results = data.statuses,
				// 	    list = $('div', search.details),
				// 	    summary = $('summary', search.details);
                //
				// 	// Fix relative dates for older tweets
				// 	$$('time', list).forEach(function(time) {
				// 		time.textContent = TwitterSearch.dateOffset(time.getAttribute('datetime'));
				// 	});
                //
				// 	TwitterSearch.maxId = Math.max(data.search_metadata.max_id, TwitterSearch.maxId);
                //
				// 	for (var i=results.length, tweet; tweet = results[--i];) {
				// 		// Don’t add the same tweets twice
				// 		// Twitter Search API is fucked
				// 		var datetime = new Date(tweet.created_at);
				// 		var offset = new Date() - datetime;
                //
				// 		if(!$('#t' + tweet.id, list) && offset < 1000 * 60 * 20) {
				// 			// Is not already in the list and has been posted in the last 20 minutes
				// 			var username = tweet.user.screen_name;
				// 			var datetimeISO = (datetime).toISOString();
				// 			var id = tweet.id;
                //
				// 			$.create('article', {
				// 				id: 't' + tweet.id,
				// 				innerHTML: `
				// 					<img src="${tweet.user.profile_image_url}" />
				// 					<h1>
				// 						<a href="http://twitter.com/${username}" target="_blank">@${username}</a>
				// 						<a href="http://twitter.com/${username}/status/${id}" target="_blank">
				// 							<time datetime="${datetimeISO}">${TwitterSearch.dateOffset(datetimeISO)}</time>
				// 						</a>
				// 					</h1>
				// 					<p>${tweet.text.replace(/[@#]regexplained/g, '')}</p>
				// 				`,
				// 				start: list
				// 			});
				// 		}
				// 	}
                //
				// 	summary.innerHTML = $$("article", list).length + ' tweets';
                //
				// 	// Schedule next fetch
				// 	if (running) {
				// 		setTimeout(function() {
				// 			search.send();
				// 		}, 5000);
				// 	}
				// }
                //
				// search.send();

				setTimeout(function(){
					// Time’s up!
					running = false;
					video.pause();
				}, (duration + 25) * 1000); // +25s to account for the twitter lag
			}
		}, video],
		inside: slide
	});

	var details = $.create('details', {
		tag: 'details',
		properties: {
			className: 'tweets'
		},
		contents: [{
			tag: 'summary',
			contents: '0 tweets'
		},{
			tag: 'div'
		}],
		inside: slide
	});
});

})(Bliss);
