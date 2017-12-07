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
	slide.tester = new RegExpTester(slide);
});

(function(){
	var _ = window.TwitterSearch = function(q, details) {
		this.q = q;
		this.details = details;
	}

	_.maxId = 0;

	_.prototype = {
		send: function(q) {
			window.twitterSearch = this;

			$.import('http://api.twitter.com/1.1/search/tweets.json?' +
				'callback=twitterSearch.callback' +
				'&q=' + encodeURIComponent(this.q) +
				'&since_id=' + _.maxId +
				'&count=100' +
				'&result_type=recent');
		},

		callback: function(data) {
			delete window.twitterSearch;

			_.maxId = +data.max_id;

			this.onload && this.onload(data);
		}
	};

	_.dateOffset = function (date) {
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
})();

$$('.slide[data-type="Challenge"]').forEach(function(slide){
	var minutes = slide.getAttribute('data-duration') || 1,
	    duration = 60 * minutes,
	    SVGNamespace = 'http://www.w3.org/2000/svg';

	var animate = $.create({
		tag: 'animate',
		namespace: SVGNamespace,
		attributes: {
			attributeName: 'stroke-dasharray',
			values: '0,314.1593%;314.1593%,314.1593%',
			dur: 2*duration + 's', // No fucking idea why it needs double the time!!
			begin: 'indefinite',
			fill: 'freeze'
		}
	});

	var timer = $.create({
		tag: 'div',
		properties: {
			className: 'timer'
		},
		attributes: {
			'data-duration': minutes
		},
		contents: [{
			tag: 'svg',
			namespace: SVGNamespace,
			contents: {
				tag: 'circle',
				namespace: SVGNamespace,
				attributes: {
					cx: '50%',
					cy: '50%',
					r: '25%',
					"stroke-dasharray": '0,314.1593%'
				},
				contents: animate
			}
		}, {
			tag: 'button',
			contents: 'Go!',
			properties: {
				type: 'button',
				onclick: function(){
					animate.beginElement();

					var running = true;
					timer.classList.add('running');

					var search = new TwitterSearch('#regexplained', details);

					search.onload = function(data) {
						// Process data
						var results = data.results,
						    list = $('div', search.details),
						    summary = $('summary', search.details);

						for (var i=results.length, tweet; tweet = results[--i];) {

							// Don’t add the same tweets twice
							// Twitter Search API is fucked
							if($('#t' + tweet.id, list)) {
								results.splice(i, 1);
								continue;
							}

							$.create('article', {
								properties: {
									id: 't' + tweet.id
								},
								contents: [{
									tag: 'img',
									properties: {
										src: tweet.profile_image_url
									}
								}, {
									tag: 'h1',
									contents: [{
										tag: 'a',
										properties: {
											href: 'http://twitter.com/' + tweet.from_user,
											target: '_blank'
										},
										contents: '@' + tweet.from_user
									}, ' ', {
										tag: 'a',
										properties: {
											href: 'http://twitter.com/' + tweet.from_user + '/status/' + tweet.id,
											target: '_blank'
										},
										contents: {
											tag: 'time',
											attributes: {
												datetime: (new Date(tweet.created_at)).toISOString()
											}
										}
									}]
								}, {
									tag: 'p',
									properties: {
										innerHTML: tweet.text.replace(/[@#]regexplained/g, '')
									}
								}],
								start: list
							});
						}

						// Fix relative dates
						$$('time', list).forEach(function(time) {
							time.textContent = TwitterSearch.dateOffset(time.getAttribute('datetime'));
						});

						summary.innerHTML = (parseInt(summary.innerHTML) || 0) + results.length + ' tweets';

						// Schedule next fetch
						if(running) {
							setTimeout(function() {
								search.send();
							}, 5000);
						}
					}

					search.send();

					setTimeout(function(){
						// Time’s up!
						running = false;
						timer.classList.remove('running');

					}, (duration + 20) * 1000); // +20s to account for the twitter lag
				}
			}
		}],
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
