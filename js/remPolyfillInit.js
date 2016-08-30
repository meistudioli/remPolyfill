function pageInit() {
	var stopEvents, trigger;

	trigger = document.querySelector('.trigger');
	if (document.querySelector('html').classList.contains('rem-polyfill')) {
		trigger.textContent = 'ON';
	}//end if

	stopEvents = function (e, mode) {
		//mode:0/1/2 -> stopPropagation/preventDefault/both
		if (typeof(mode) == 'undefined' || [0,1].indexOf(mode) == -1) mode = 2;
		switch (mode) {
			case 0:
				(e.stopPropagation) ? e.stopPropagation() : window.event.cancelBubble = true;
				break;
			case 1:
				(e.preventDefault) ? e.preventDefault() : window.event.returnValue = false;
				break;
			default:
				if (e.stopPropagation) {
					e.stopPropagation();
					e.preventDefault();
				} else {
					window.event.cancelBubble = true;
					window.event.returnValue = false;
				}//end if
		}//end if
	};

	//trigger
	trigger.addEventListener('click',
		function(e) {
			stopEvents(e);

			if (navigator.remPolyfill) {
				navigator.remPolyfill = false;
				this.textContent = 'OFF';
			} else {
				navigator.remPolyfill = true;
				this.textContent = 'ON';
			}//end if
		}
	, false);
}
/*programed by mei(李維翰), http://www.facebook.com/mei.studio.li*/