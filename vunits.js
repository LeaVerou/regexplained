/**
 * Polyfill for the vw, vh, vm units
 * Requires StyleFix from -prefix-free http://leaverou.github.com/prefixfree/
 * @author Lea Verou
 */

(function() {

if(!window.StyleFix) {
	return;
}

// Feature test
var dummy = document.createElement('_').style,
	units = ['vw', 'vh', 'vm'].filter(function(unit) {
		dummy.width = '';
		dummy.width = '10' + unit;
		return !dummy.width;
	});

if(!units.length) {
	return;
}

StyleFix.register(function(css) {
	var w = innerWidth, h = innerHeight, m = Math.min(w,h);
	
	return css.replace(RegExp('\\b(-?\\d*\\.?\\d+)(' + units.join('|') + ')\\b', 'gi'), function($0, num, unit) {
		switch (unit) {
			case 'vw':
				return (num * w / 100) + 'px';
			case 'vh':
				return num * h / 100 + 'px';
			case 'vm':
				return num * m / 100 + 'px';
		}
	});
});

})();