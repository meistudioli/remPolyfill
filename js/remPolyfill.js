//remPolyfill
(function() {
	var handler, createCSSClass, getPageSize, getStyle, attrChange, init, viewportUnits, remPolyfill, dRoot, counter, max, iid;
	if (typeof Object == 'undefined' || typeof Object.defineProperty == 'undefined') return;

	//method
	createCSSClass = function(selector, style, brandNew) {
		if (!document.styleSheets || document.getElementsByTagName('head').length == 0) return;
	    var styleSheet, mediaType, getSheet = false;
		if (typeof brandNew != 'undefined' && brandNew) {
			if (typeof brandNew.sheet != 'undefined') {
				styleSheet = brandNew.sheet;
				mediaType = typeof styleSheet.media;
				getSheet = true;
			} else {
				var s = document.createElement('style');
				s.type = 'text/css';
				document.getElementsByTagName('head')[0].appendChild(s);
				s.usable = true;
				navigator.ssHost = document.styleSheets[document.styleSheets.length-1];
			}//end if
		}//end if
		if (!getSheet) {
			if (navigator.ssHost) {
				styleSheet = navigator.ssHost;
				mediaType = typeof styleSheet.media;
			} else {
				for (var i=-1,l=document.styleSheets.length;++i<l;) {
					var ss = document.styleSheets[i], media, isCrossDomain, mediaText;
					if (ss.disabled || (typeof ss.usable != 'undefined' && !ss.usable)) continue;
					media = ss.media;
					mediaType = typeof media;
					if (typeof ss.usable == 'undefined') ss.usable = false;
					if (mediaType == 'string') {
						try {
							isCrossDomain = (ss.rules == null) ? true : false;
						} catch(e) { isCrossDomain = true; }
						if ((media == '' || media.indexOf('screen') != -1) && !isCrossDomain) { styleSheet = ss; ss.usable = true; }
					} else if (mediaType == 'object') {
						try {
							isCrossDomain = (ss.cssRules == null) ? true : false;
							mediaText = media.mediaText;
						} catch(e) {isCrossDomain = true;}
						if (!isCrossDomain && (typeof mediaText != 'undefined' && (mediaText == '' || mediaText.indexOf('screen') != -1))) { styleSheet = ss; ss.usable = true; }
					}//end if
					if (typeof styleSheet != 'undefined') break;
				}//end for
				if (typeof styleSheet == 'undefined') {
					var s = document.createElement('style');
					s.type = 'text/css';
					document.getElementsByTagName('head')[0].appendChild(s);
					for (var i=-1,l=document.styleSheets.length;++i<l;) {
						var ss = document.styleSheets[i];
						if (ss.disabled || typeof ss.usable != 'undefined' && !ss.usable) continue;
						ss.usable = true;
						styleSheet = ss;
					}//end for
					mediaType = typeof styleSheet.media;
				}//end if
				navigator.ssHost = styleSheet;
			}//end if
		}//end if

	    if (mediaType == 'string') {
			for (var i=-1,l=styleSheet.rules.length;++i<l;) if (styleSheet.rules[i].selectorText && styleSheet.rules[i].selectorText.toLowerCase() == selector.toLowerCase()) { styleSheet.rules[i].style.cssText = style; return; }
			styleSheet.addRule(selector, style);
	    } else if (mediaType == 'object') {
			for (var i=-1,l=styleSheet.cssRules.length;++i<l;) if (styleSheet.cssRules[i].selectorText && styleSheet.cssRules[i].selectorText.toLowerCase() == selector.toLowerCase()) { styleSheet.cssRules[i].style.cssText = style; return; }
			styleSheet.insertRule(selector + '{' + style + '}', 0);
	    }//end if
	};

	getPageSize = function() {
		var xScroll, yScroll;
		
		if (window.innerHeight && window.scrollMaxY)  {xScroll = document.body.scrollWidth; yScroll = window.innerHeight + window.scrollMaxY; }
		else if (document.body.scrollHeight > document.body.offsetHeight){ xScroll = document.body.scrollWidth; yScroll = document.body.scrollHeight; }
		else { xScroll = document.body.offsetWidth; yScroll = document.body.offsetHeight; }
		
		var windowWidth, windowHeight, pageWidth, pageHeight;
		if (self.innerHeight) {	windowWidth = self.innerWidth; windowHeight = self.innerHeight; }
		else if (document.documentElement && document.documentElement.clientHeight) { windowWidth = document.documentElement.clientWidth; windowHeight = document.documentElement.clientHeight; }
		else if (document.body) { windowWidth = document.body.clientWidth; windowHeight = document.body.clientHeight; }	
		
		pageHeight = (yScroll < windowHeight) ? windowHeight : yScroll;
		pageWidth = (xScroll < windowWidth) ? windowWidth : xScroll;
		return [pageWidth,pageHeight,windowWidth,windowHeight];
	};

	getStyle = function (e, property) {
		var v = '';
		if (typeof(e.style) != 'undefined' && e.style[property]) v = e.style[property];
		else if (e.currentStyle) v = e.currentStyle[camelCase(property)];
		else if (window.getComputedStyle) v = document.defaultView.getComputedStyle(e,null).getPropertyValue(property.replace(/([A-Z])/g,'-$1').toLowerCase());
		if (v == undefined) v = 1;
		return v;
	};

	handler = function() {
		if (!navigator.viewportUnits) {
			createCSSClass('html.rem-polyfill', 'font-size:'+(getPageSize()[2]/100)+'px;');
		} else {
			createCSSClass('html.rem-polyfill', 'font-size:1vw;');
		}//end if
	};

	attrChange = function(attrName, oldVal, newVal, target) {
		if (target.classList.contains('rem-polyfill')) {
			if (!navigator.remPolyfill) navigator.remPolyfill = true;
		} else {
			if (navigator.remPolyfill) navigator.remPolyfill = false;
		}//end if
	};

	init = function() {
		dRoot = document.querySelector('html');

		//properties
		Object.defineProperties(navigator, {
			viewportUnits: {
				enumerable: true,
				get: function() {
					var dummy, unit;
					if (typeof viewportUnits == 'undefined') {
						createCSSClass('.viewport-unit', 'font-size:100vw;');
						dummy = document.createElement('div');
						dummy.classList.add('viewport-unit');
						document.body.appendChild(dummy);

						unit = getStyle(dummy, 'font-size').toLowerCase();
						viewportUnits = (/vw/i.test(unit) || parseInt(unit, 10) == getPageSize()[2]) ? true : false;
						document.body.removeChild(dummy);
					}//end if
					return viewportUnits;
				}
			},
			remPolyfill: {
				enumerable: true,
				configurable: true,
				get: function() {
					return remPolyfill || false;
				},
				set: function(flag) {
					if (typeof flag != 'boolean') return;

					remPolyfill = flag;

					//handler
					try {
						window.removeEventListener('resize', handler, false);
					} catch(err) {}

					if (remPolyfill) {
						if (!dRoot.classList.contains('rem-polyfill')) dRoot.classList.add('rem-polyfill');
						window.addEventListener('resize', handler, false);
						handler();
					} else {
						if (dRoot.classList.contains('rem-polyfill')) dRoot.classList.remove('rem-polyfill');
					}//end if
					return remPolyfill;
				}
			}
		});

		//MutationObserver
		if (typeof MutationObserver != 'undefined') {
			new MutationObserver(
				function(mutations) {
					mutations.forEach(function(mutation) {
						var attrName, oldVal, newVal;
						if (mutation.type != 'attributes' || mutation.attributeName != 'class') return;

						attrName = mutation.attributeName;
						oldVal = mutation.oldValue;
						newVal = mutation.target.getAttribute(attrName);
						attrChange(attrName, oldVal, newVal, mutation.target);
					});
				}
			).observe(dRoot, {attributes: true});
		}//end if

		//init
		navigator.remPolyfill = dRoot.classList.contains('rem-polyfill');
	};

	//init
	counter = 0;
	max = 10000; //10 seconds
	iid = setInterval(
		function() {
			counter += 5;
			if (counter >= max) {
				clearInterval(iid);
				return;
			}//end if
			if (document.body) {
				clearInterval(iid);
				init();
			}//end if
		}
	, 5);
})();
/*programed by mei(李維翰), http://www.facebook.com/mei.studio.li*/