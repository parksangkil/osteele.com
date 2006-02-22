/* Copyright 2006 Oliver Steele.  All rights reserved. */

/*
  Next:
  - debug global, ignoreCase, multiline
  - resize the graph
  - text => text area
  
  Graph:
  - link to reanimator
  - change label to "Update"; only update when out of date
  
  Deploy:
  - check example syntax (especially python)
  - match, split, scan on empty in various languages
  - conditionalize canvas
  - link to blog entry
  
  Later:
  - better tab highlighting
  - documentation sidebar
  - server error
  - scrim while loading graph
  
  Debugging:
  document={location: 'http://osteele.com//'}
*/

/*
 * Utilities
 */

String.prototype.escapeJavascript = function () {
	var s = this;
	s = s.replace('\\', '\\\\');
	s = s.replace('\n', '\\n');
	s = s.replace('"', '\\"');
	return '"' + s + '"';
};

String.prototype.matches = function(re) {
	var matches = [];
	var i = 0;
	while (i < this.length) {
		var m = this.slice(i).match(re);
		if (!m) break;
		matches.push({index: i+m.index, string: m[0], length: m[0].length});
		i += m.index + m[0].length;
		if (m.index + m[0].length == 0) i++;
	}
	return matches;
};

String.prototype.scan = function(re) {
	return $A(this.matches(re)).map(function(m){return m.string});
};

/*
 * Tab Controller (class doubles as container)
 */

function TabController(name) {
	TabController.controllers[name] = this;
	this.name = name;
	this.view = $(name);
	this.results = $(name + '-results');
	this.usage = $(name + '-usage');
}

// Class methods (in its use as a container)

TabController.controllers = {};
TabController.selected = null;

TabController.select = function(name) {
	if (typeof name != 'string') {
		var tab = name;
		name = tab.innerHTML.toLowerCase();
		Element.setStyle(tab, {fontWeight: 'bold'});
		if (this.lastTab)
			Element.setStyle(this.lastTab, {fontWeight: 'normal'});
		this.lastTab = tab;
	}
	Element.hide.apply(null, $H(TabController.controllers).keys());
	Element.show(name);
	TabController.selected = this.controllers[name];
}

TabController.updateContents = function(patternChanged, re, input) {
	/*controller = TabController.selected;
			if (patternChanged)
				controller.updatePattern(re, input);
			else
				controller.updateInput(re, input);
				controller.updateProgramUsage(re, input);*/
	$H(TabController.controllers).values().each(
		function (controller) {
			if (patternChanged)
				controller.updatePattern(re, input);
			else
				controller.updateInput(re, input);
			controller.updateProgramUsage(re, input);
		});
}

// Instance methods (in its use as a base class)

TabController.prototype.updatePattern = function (pattern, input) {
	this.updateInput(pattern, input);
};

TabController.prototype.updateInput = function (pattern, input) {};

TabController.prototype.makeResultsList = function(ar) {
	if (!ar.length)
		return '<i>No results.</i>';
	return $A(ar).map(function(s){
						  if (!s)
							  return "<i>empty string</i>";
						  return '<tt>'+s.escapeHTML()+'</tt>';
					  }).join('<br/>');
};

TabController.prototype.updateProgramUsage = function(re, input) {
	if (!this.usage) return;

	var p = re.source;
	p = p.replace(/\\/, '\\\\');
	p = p.replace('\'', '\\\'');
	p = p.replace('/', '\/');
	
	p = {flags: re,
		 python: 'r\'' + p + '\'',
		 ruby: '/' + p + '/',
		 php: '/' + p + '/',
		 js: re.toString()};
	if (re.ignoreCase) {
		p.php += 'i';
		p.ruby += 'i';
	}
	if (re.multiline) {
		p.php = 's';
		p.ruby += 'm';
	}
	p.php = '\'' + p.php + '\'';

	var table = this.getUsageTable(p, input.escapeJavascript());
	html = '<div><strong>Usage:</strong></div><table>';
	for (var i = 0; i < table.length; ) {
		var name = table[i++];
		var syntax = table[i++].escapeHTML();
		html += '<tr><td>'+name+'</td><td><tt>'+syntax+'</tt></td></tr>';
	}
	this.usage.innerHTML = html + '</table>';
};

/*
 * Search tab
 */
var searchController = new TabController('search');

searchController.updatePattern = function (re, input) {
	this.showResults(re, input);
};

searchController.updateInput = function (re, input) {
	this.showResults();
};

searchController.showResults = function(re, input) {
	var match = input.match(re);
	if(!match) {
		$('search-summary').innerHTML = '<span class="nomatch">No match.</span>';
		$('search-details').innerHTML = '';
		return;
	}
	
	function esc(str, cssClass) {
		str = '<tt>'+str.escapeHTML()+'</tt>';
		if (cssClass)
			str = '<span class="'+cssClass+'">'+str+'</span>';
		return str;
	};
	
	//var re0 = new RegExp(re.source, (re.ignoreCase ? 'i' : '')+(re.multiline ? 'm' : ''));
	var re0 = re;

	var prefix = input.slice(0, match.index);
	var suffix = input.slice(input.match(re0).index + match[0].length);
	var s = '<kbd>'+re.toString().escapeHTML()+'</kbd>' + ' matches ';
	s += esc(prefix, 'prefix');
	s += '<em>' + esc(match[0]) +'</em>';
	s += esc(suffix, 'suffix');
	$('search-summary').innerHTML = s;
	
	if (match.length > 2)
		$('search-summary') = ff(input, re, function () {return 'x'});
	
	var s = '';
	if (prefix) s += 'Prefix = ' + esc(prefix)+'<br/>';
	s += 'Match = ' + (match[0] ? esc(match[0]) : "'' (empty string)")+'<br/>';
	if (suffix) s += 'Suffix = ' + esc(suffix)+'<br/>';
	if (match.length > 1) {
		s += '<br/><i>Groups:</i><br/>';
		match.each(function(m, i) {
					   if (i)
						   s += '$'+i+' = '+esc(m);
				   });
	}
	$('search-details').innerHTML = s;
}

searchController.getUsageTable = function(re, s) {
	var ruby = re.flags.global ? 'scan' : 'match';
	return [
		'JavaScript', s + '.match(' + re.js + ')',
		'',  re.js + '.exec(' + s + ')',
		'PHP', 'preg_match(' + re.php + ', ' + s + ', &match)',
		'Python', 'match = re.match(' + re.python + ', '+s+')',
		'Ruby', s + '.'+ruby+'(' + re.ruby + ')'
		//'', s + ' =~ ' + re.ruby
		];
};

/*
 * Replace tab
 */
var replaceController = new TabController('replace');

function ff(input, re, fn) {
	var s = '';
	var i = 0;
	var matches = input.matches(re);
	$A(matches).each(
		function (m) {
			s += input.slice(i, m.index).escapeHTML();
			s += fn();
			i = m.index + m.length;
		});
	s += input.slice(i).escapeHTML();
	return s;
}

replaceController.updateInput = function (re, input) {
	var sub = $F('replacement');
	this.results.innerHTML = ff(input, re, function () {return '<em>' + sub + '</em>'});
};

replaceController.getUsageTable = function(re, s) {
	var sub = $F('replacement');
	sub = sub.replace('\\', '\\\\');
	sub = sub.replace('\"', '\\"');
	sub = '"' + sub + '"';
	sub = sub.escapeHTML();
	var ruby = re.flags.global ? 'gsub' : 'sub';
	return [
		'JavaScript', s + '.replace(' + re.js + ', ' + sub + ')',
		'PHP', 'preg_replace(' + re.php + ', ' + s + ', ' + sub + ')',
		'Python', 're.sub(' + re.python + ', '+s+', ' + sub+')',
		'Ruby', s +'.'+ruby+'('+re.ruby+', ' + sub + ')'
		];
};

/*
 * Scan tab
 */
var scanController = new TabController('scan');

scanController.updateInput = function (re, input) {
	this.results.innerHTML = this.makeResultsList(input.scan(re));
};

scanController.getUsageTable = function(re, s) {
	return [
		'PHP', 'preg_match(' + re.php + ', ' + s + ', &match)',
		'Python', 'match = re.match(' + re.python + ', '+s+')',
		'Ruby', s + '.scan(' + re.ruby + ')'
		];
};

/*
 * Split tab
 */
var splitController = new TabController('split');

splitController.updateInput = function (re, input) {
	this.results.innerHTML = this.makeResultsList(input.split(re));
};

splitController.getUsageTable = function(re, s) {
	return [
		'JavaScript', s + '.split(' + re.js + ')',
		'PHP', 'preg_split(' + re.php + ', ' + s + ', &match)',
		'Python', 'match = re.split(' + re.python + ')',
		'Ruby', s + '.split(' + re.ruby + ')'
		];
};

/*
 * Graph tab
 */
var graphController = new TabController('graph');

graphController.updatePattern = function (re, input) {
	var pattern = $F('pattern');
	var e = checkPattern(pattern);
	if (e) {
		$('graphButton').disabled = true;
		Element.show('noGraph');
		if (e != ' ') e = '(The "Graph" button is disabled because the graphing engine doesn\'t handle ' + e + '.)';
		$('noGraph').innerHTML = e;
	} else {
		$('graphButton').disabled = false;
		Element.hide('noGraph');
	}
};

/*
 * Graph view
 */
function setupCanvas(canvas) {
	var ctx = canvas.getContext("2d");
	
	ctx.circle = function(x, y, r) {
		this.moveTo(x+r,y);
		this.arc(x,y,r, 0, 2*Math.PI, true);
	};
	
	ctx.drawString = function(x, y, string) {
		var label = document.createElement('div');
		var text = document.createTextNode(string);
		label.style.left = x;//+'px';
		label.style.top = y-0;//+'px';
		label.style.position = 'absolute';
		label.appendChild(text);
		document.getElementById('cp').appendChild(label);
		ctx.labels.push(label);
	};
	
	ctx.labels = [];
	return ctx;
}

GraphView.requestPattern = function (pattern) {
	pattern = pattern.replace(/^\.(?!\.\*)/, '.*');
	var url="server.py?pattern="+encodeURIComponent(pattern);
	var req = new XMLHttpRequest();
	gReq = req;
	req.onreadystatechange = function(){processReqChange(req)};
	req.open("GET", url, true);
	req.send(null);
}

function processReqChange(request) {
	if (request.readyState == 4) {
        if (request.status == 200) {
			var result = JSON.parse(request.responseText);
			if (typeof result == 'string') {
				warn(result);
			}
			showGraph(result.dfa.graph);
        }
	}
}

function showGraph(graph) {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.labels.each(function(e){e.parentNode.removeChild(e)});
	ctx.labels = [];
	new GraphView(graph).render(ctx);
}

function checkPattern(s) {
	try {
		RegExp(s);
	} catch (e) {
		return ' ';
	}
	s = s.replace(/\\[^bB\d]/, '');
	s = s.replace(/\\[^bB\d''`&]/, '');
	s = s.replace(/$$/, '');
	var e = {
		'quantifiers': /\{/,
		'anchors': /\\[bB]/,
		'assertions': /\(\?[=!]/,
		'back-references': /\\[\d''`&]/ 
	}
	for (var p in e) {
		var m = s.match(RegExp(e[p]));
		//info(e[p]+','+s+','+m);
		if (m) {
			return p.escapeHTML() + ', such as "<kbd>' + m[0].escapeHTML() + '</kbd>"';
		}
	}
}

/*
 * Observers
 */

function updateTabContents(patternChanged) {
	var input = $F('input');
	flags = '';
	if ($F('globalCheckbox')) flags += 'g';
	if ($F('ignoreCaseCheckbox')) flags += 'i';
	if ($F('multilineCheckbox')) flags += 'm';
	try {
		var re = RegExp($F('pattern'), flags);
	} catch (e) {
		Element.show('error');
		$('error').innerHTML = '' + e.message + '<br/><br/>';
		return;
	}
	TabController.updateContents(patternChanged, re, input);
}

function patternChanged() {
	updateTabContents(true);
}

Event.observe('pattern', 'keyup', patternChanged);
Event.observe('globalCheckbox', 'click', patternChanged);
Event.observe('ignoreCaseCheckbox', 'click', patternChanged);
Event.observe('multilineCheckbox', 'click', patternChanged);
Event.observe('input', 'keyup', updateTabContents);
Event.observe('replacement', 'keyup', updateTabContents);

/*
 * Initialization
 */

if (true) {
	Element.show($('graphArea'));
	var canvas = $("canvas");
	var ctx = setupCanvas(canvas);
	if (!checkPattern($F('pattern')))
		GraphView.requestPattern($F('pattern'));
} else
	Element.hide($('graphTabLabel'));

TabController.select('search');
updateTabContents(true);

// On a development machine, display the debugger
var host = document.location.toString().match(/.+?:\/\/(.+?)\//)[1];
if (host.match(/\.dev/))
	Element.show($('debugger'));
