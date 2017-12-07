// Code for simple regex testers
(function(){

var _ = self.RegExpTester = function(container){
	var me = this;

	var patternAttr = container.getAttribute('data-pattern'),
	    initialPattern = RegExp(patternAttr || ''),
	    initialTest = container.getAttribute('data-test');

	this.pattern = RegExp(initialPattern.source);
	this.flags = container.getAttribute('data-flags') || 'g';
	this.detailed = !container.hasAttribute('data-simple');
	this.matches = [];

	container.classList.add('regex-test');

	this.input = $.create({
			tag: 'input',
			properties: {
				value: patternAttr,
				tabIndex: 1
			}
		});

	this.tester = $.create({
		    	tag: 'input',
		    	properties: {
		    		value: initialTest,
		    		tabIndex: 2
		    	}
		    });

	this.flagsContainer = $.create('span', this.flags);

	$.create({
		properties: {
			className: 'tester' + (initialPattern.test(initialTest)? '' : ' invalid')
		},
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
	
	$.create({
		properties: {
			className: 'pattern'
		},
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

	container.addEventListener('keydown', function(evt) {
		if (evt.keyCode === 38 || evt.keyCode === 40) {
			evt.stopPropagation();
			evt.preventDefault();

			var method = (evt.keyCode === 40? 'next' : 'prev') +
			             (evt.ctrlKey? 'Subpattern' : 'Match');
			me[method]();
		}

		if (evt.ctrlKey) {
			if (evt.keyCode === 73) { // I
				me.toggleFlag('i');
			}
			else if (evt.keyCode === 77) { // M
				me.toggleFlag('m');
			}
		}
	});

	$.bind([this.input, this.tester], 'input', function(){
		var div = this.parentNode.parentNode;

		div.style.fontSize = _.fontSize(this.value.length) + '%';

		this.style.width = _.getCh(this);

		me.test();
	});

	if(this.embedded = container.classList.contains('slide')) {
		addEventListener('hashchange', function(){
			if(container.id === location.hash.slice(1)) {
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
};

_.supportsCh = (function() {
	var dummy = document.createElement('_');
	dummy.style.width = '1ch';
	return !!dummy.style.width;
})();

if(_.supportsCh) {
	_.getCh = function(input) { return (input.value.length || .2) + 'ch'; }
}
else {
	_.getCh = function(input) {
		var parent = input.parentNode, dummy;

		dummy = _.getCh.dummy || (_.getCh.dummy = document.createElement('_'));

		dummy.style.display = 'inline-block';

		if(dummy.parentNode !== parent) {
			parent.appendChild(dummy);
		}

		// Replace spaces with characters so they don't get collapsed
		dummy.textContent = input.value.replace(/ /g, 'a');

		var w = dummy.offsetWidth;

		dummy.style.display = 'none';

		input.ch = w/input.value.length;

		return w + 'px';
	}
}

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

_.prototype = {
	positionIndicator: function(indicator, index, length) {
		var ch = this.tester.ch || this.tester.offsetWidth / this.tester.value.length;

		indicator.style.left = ch * index + 'px';
		indicator.style.left = index + 'ch';
		indicator.style.width = ch * length + 'px';
		indicator.style.width = length + 'ch';
	},

	test: function() {
		if(!this.input.value) { return; }

		try {
			var pattern = this.pattern = RegExp(this.input.value, this.flags);
			this.input.parentNode.parentNode.classList.remove('invalid');
		}
		catch(e) {
			this.input.parentNode.parentNode.classList.add('invalid');
			return;
		}

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

		this.nextMatch();
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
				var before = this.testStr.substr(0, match.index + 1),
					lineBreaks = (before.match(/\n|\r/g) || []).length;

				this.positionIndicator(this.matchIndicator, match.index + lineBreaks, match.length);
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
			var match = this.matches[this.matches.index],
			    subpattern = this.subpatterns[index];

			if (match) {
				var strIndex = match.subpatterns[0].indexOf(subpattern);

				if (strIndex === -1) {
					strIndex = match.subpatterns.input.indexOf(subpattern, match.index) - 1;
				}

				var offset = match.index + strIndex;

				var before = this.testStr.substr(0, offset + 1),
					lineBreaks = (before.match(/\n|\r/g) || []).length;

				this.positionIndicator(this.submatchIndicator, offset + lineBreaks, subpattern.length);
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
	}
};

})();
