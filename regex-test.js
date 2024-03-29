// Code for simple regex testers
(function(){

var _ = self.RegExpTester = $.Class({
	constructor: function(container){
		var me = this;

		var patternAttr = container.getAttribute('data-pattern'),
		    initialPattern = RegExp(patternAttr || ''),
		    initialTest = container.getAttribute('data-test');

		this.container = container;
		this.pattern = RegExp(initialPattern.source);
		this.flags = container.getAttribute('data-flags') || 'g';
		this.detailed = !container.hasAttribute('data-simple');
		this.matches = [];

		container.classList.add('regex-test');

		this.input = $.create("input", {
			value: patternAttr,
			tabIndex: 1
		});

		this.tester = $.create("input", {
 			value: initialTest,
 			tabIndex: 2
		});

		this.flagsContainer = $.create('span', {
			textContent: this.flags
		});

		this.testerContainer = $.create({
			className: 'tester' + (initialPattern.test(initialTest)? '' : ' invalid'),
			contents: [
				'"',
				{
					tag: 'div',
					contents: this.tester
				},
				'"'
			],
			start: container
		});

		this.patternContainer = $.create({
			className: 'pattern',
			contents: [
				'/',
				{
					tag: 'div',
					contents: this.input
				},
				'/',
				this.flagsContainer
			],
			start: container
		});

		this.matchIndicator = $.create('div', {
			properties: {
				className: 'match indicator'
			},
			inside: this.tester.parentNode
		});

		this.submatchIndicator = $.create('div', {
			properties: {
				className: 'sub match indicator'
			},
			inside: this.tester.parentNode
		});

		this.matchIndicator.style.display = this.submatchIndicator.style.display = 'none';

		this.timeIndicator = $.create({
			className: "time-taken",
			after: this.testerContainer
		});

		container.addEventListener('keydown', function(evt) {
			if (!evt.altKey && (evt.keyCode === 38 || evt.keyCode === 40)) {
				evt.stopPropagation();
				evt.preventDefault();

				var method = (evt.keyCode === 40? 'next' : 'prev') +
				             (evt.ctrlKey? 'Subpattern' : 'Match');
				me[method]();
			}

			if (evt.ctrlKey) {
				if (["i", "m", "s", "y", "u"].indexOf(evt.key) > -1) {
					me.toggleFlag(evt.key);
				}
			}
		});

		$.bind([this.input, this.tester], 'input', function(){
			var div = this.parentNode.parentNode;
			var length = [...this.value].length;

			div.style.fontSize = _.fontSize(length) + '%';

			this.style.width = .2 + "ch";

			if (this.scrollWidth > 0) {
				this.style.width = this.scrollWidth + "px";
			}

			me.displayTimeTaken();

			setTimeout(() => me.test(), 20);
		});

		if(this.embedded = container.classList.contains('slide')) {
			addEventListener('hashchange', function(){
				if (container.id === location.hash.slice(1)) {
					$.fire([me.input, me.tester], 'input');
				}
			});

			setTimeout(function(){
				$.fire(window, 'hashchange');
			}, 0);
		}
		else {
			$.fire([this.input, this.tester], 'input');
		}
	},

	positionIndicator: function(indicator, index, length) {
		var ch = this.tester.ch || this.tester.offsetWidth / this.tester.value.length;

		indicator.style.left = ch * index + 'px';
		indicator.style.left = index + 'ch';
		indicator.style.width = ch * length + 'px';
		indicator.style.width = length + 'ch';
	},

	test: function() {
		if(!this.input.value) { return; }

		var flagsPlusD = this.flags.replace('d', '') + 'd';

		try {
			var pattern = this.pattern = RegExp(this.input.value, flagsPlusD);
			this.input.parentNode.parentNode.classList.remove('invalid');
		}
		catch(e) {
			this.input.parentNode.parentNode.classList.add('invalid');
			return;
		}

		var timeBefore = performance.now();

		var test = this.testStr = this.tester.value.replace(/\\n/g, '\n').replace(/\\r/g, '\r'),
		    isMatch = pattern.test(test);

		this.tester.parentNode.parentNode.classList[isMatch? 'remove' : 'add']('invalid');

		this.matches = [];

		pattern.lastIndex = 0;

		if (isMatch) {
			// Show exact matches
			var match;


			while (match = pattern.exec(test)) {
				var matches = {
					index: match.index,
					length: match[0].length,
					subpatterns: match
				};

				this.matches.push(matches);

				if(matches.length === 0) {
					pattern.lastIndex++;
				}
			}
		}

		this.displayTimeTaken(performance.now() - timeBefore);

		this.nextMatch();
	},

	displayTimeTaken: function(timeTaken) {
		if (timeTaken) {
			this.timeIndicator.classList.remove("in-progress");
			this.timeIndicator.innerHTML = _.formatDuration(timeTaken);
			this.timeIndicator.classList.toggle("slow", timeTaken > 10);
			this.timeIndicator.classList.toggle("very-slow", timeTaken > 100);
			this.timeIndicator.classList.toggle("fast", timeTaken < 1);
		}
		else {
			this.timeIndicator.classList.add("in-progress");
		}
	},

	toggleFlag: function (flag) {
		if (this.flags.indexOf(flag) > -1) {
			this.flags = this.flags.replace(RegExp(flag, 'g'), '');
		}
		else {
			this.flags += flag;
		}

		this.flagsContainer.textContent = this.flags;

		this.test();
	},

	gotoMatch: function (index) {
		if(!this.matches.length) {
			this.matchIndicator.style.display = 'none';

			this.subpatterns = [];
		}
		else {
			var match = this.matches[index];

			if(match) {
				var preMatch = this.testStr.substring(0, match.index),
					preMatchLineBreaks = (preMatch.match(/[\n\r]/g) || []).length,
					inMatchLineBreaks = (match.subpatterns[0].match(/[\n\r]/g) || []).length;

				this.positionIndicator(
					this.matchIndicator,
					match.index + preMatchLineBreaks,
					match.length + inMatchLineBreaks
				);
				this.matchIndicator.style.display = '';

				this.subpatterns = match.subpatterns.slice() || []; // slice for cloning
			}
			else {
				throw Error('No match exists at ' + index);
			}
		}

		this.nextSubpattern();
	},

	gotoSubpattern: function (index) {
		if(!this.subpatterns.length) {
			this.submatchIndicator.style.display = 'none';
		}
		else {
			var match = this.matches[this.matches.index];

			if (match) {
				var subpatternIndices = match.subpatterns.indices[index],
					subpatternStart = subpatternIndices ? subpatternIndices[0] : match.subpatterns.index;

				var preMatch = this.testStr.substring(0, match.index),
					preMatchLineBreaks = (preMatch.match(/[\n\r]/g) || []).length,
					matchUntilSubpattern = match.subpatterns[0].substring(0, subpatternStart - match.index),
					inMatchPreSubpatternLineBreaks = (matchUntilSubpattern.match(/[\n\r]/g) || []).length,
					subpatternMatch = match.subpatterns[index] || '',
					inSubpatternMatchLineBreaks = (subpatternMatch.match(/[\n\r]/g) || []).length;

				this.positionIndicator(
					this.submatchIndicator,
					subpatternStart + preMatchLineBreaks + inMatchPreSubpatternLineBreaks,
					subpatternMatch.length + inSubpatternMatchLineBreaks
				);
				this.submatchIndicator.style.display = '';
			}
			else {
				throw Error('No subpattern exists at ' + index);
			}
		}
	},

	nextMatch: function () {
		var matches = this.matches;

		if(!('index' in matches) || matches.index < 0 || matches.index + 1 >= matches.length) {
			matches.index = -1;
		}

		this.gotoMatch(++matches.index);
	},

	prevMatch: function () {
		var matches = this.matches;

		if(!matches.index) {
			matches.index = matches.length;
		}

		this.gotoMatch(--matches.index);
	},

	nextSubpattern: function () {
		if(this.subpatterns === undefined) {
			this.nextMatch();
		}

		var matches = this.subpatterns;

		if(!('index' in matches) || matches.index < 0 || matches.index + 1 >= matches.length) {
			matches.index = -1;
		}

		this.gotoSubpattern(++matches.index);
	},

	prevSubpattern: function () {
		var matches = this.subpatterns;

		if(!matches.index) {
			matches.index = matches.length;
		}

		this.gotoSubpattern(--matches.index);
	},

	static: {
		formatDuration: function(ms) {
			var unit = "ms";

			if (ms >= 1000) {
				ms /= 1000;
				unit = "s";
			}

			return ms.toLocaleString("en-us", {
				maximumFractionDigits: ms < 10? 2 : 1
			}) + unit;
		}
	}
});


_.fontSize = (function(){
	var sizes = [];

	sizes[9]  = 360;
	sizes[11] = 340;
	sizes[13] = 290;
	sizes[20] = 200;
	sizes[40] = 100;

	var lowerBound = 9;

	for(var i=0; i<9; i++) {
		sizes[i] = sizes[9];
	}

	for(var i=9; i<sizes.length; i++) {
		if(sizes[i] === undefined) {
			for(var j=i+1; sizes[j] === undefined; j++);

			var upperBound = j,
			    range = upperBound - lowerBound,
			    ratio = (i - lowerBound)/range;

			sizes[i] = sizes[lowerBound] - ratio * (sizes[lowerBound] - sizes[upperBound])
		}
		else {
			lowerBound = i;
		}
	}

	return function(length) {
		if(sizes[length]) {
			return sizes[length];
		}

		return sizes[sizes.length - 1];
	}
})();

})();
