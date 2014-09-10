/**
 * cbpAnimatedHeader.js v1.0.0
 * http://www.codrops.com
 *
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 *
 * Copyright 2013, Codrops
 * http://www.codrops.com
 */
var animatedHeader = (function() {

	var docElem = document.documentElement,
		navbar = document.querySelector( '.navbar' ),
		didScroll = false,
		changeHeaderOn = 312;

	function init() {
		window.addEventListener( 'scroll', function( event ) {
			if( !didScroll ) {
				didScroll = true;
				setTimeout( scrollPage, 250 );
			}
		}, false );
	}

	function scrollPage() {
		var sy = scrollY();
		if ( sy >= changeHeaderOn ) {
			classie.add( navbar, 'navbar-pinned' );
		}
		else {
			classie.remove( navbar, 'navbar-pinned' );
		}

		didScroll = false;
	}

	function scrollY() {
		return window.pageYOffset || docElem.scrollTop;
	}

	if ( document.querySelector( '.home-template' ) ) {
		if (document.body.clientWidth > 768 ) {
			init();
		}
	}

	if ( document.querySelector( '.author-template' ) ) {
		if ( document.querySelector( '.archive-template' ) ) {
			return false;
		} else {
			if (document.body.clientWidth > 768 ) {
				init();
			}
		}
	}

})();
