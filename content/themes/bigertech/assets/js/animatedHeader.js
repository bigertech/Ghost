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

var isIE = function(ver){
  var b = document.createElement('b')
  b.innerHTML = '<!--[if IE ' + ver + ']><i></i><![endif]-->'
  return b.getElementsByTagName('i').length === 1
}

if(isIE(7)){
  alert("你的浏览器版本太低，请尽快升级,以便获得更好的浏览体验");
} else {
  var animatedHeader = (function() {

    var docElem = document.documentElement,
      navbar = document.querySelector( '.navbar' ),
      didScroll = false,
      changeHeaderOn = 312;

    function init() {
      if (window.addEventListener) {
        window.addEventListener( 'scroll', function( event ) {
          if( !didScroll ) {
            didScroll = true;
            setTimeout( scrollPage, 250 );
          }
        }, false );
      } else {
        window.attachEvent( 'onscroll', function( event ) {
          if ( !didScroll ) {
            didScroll = true;
            setTimeout( scrollPage, 250 );
          }
        });
      }
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
      if (document.body.clientWidth > 740 ) {
        init();
      }
    }

    if ( document.querySelector( '.category-template' ) ) {
      if ( document.querySelector( '.archive-template' ) ) {
        return false;
      } else {
        if (document.body.clientWidth > 740 ) {
          init();
        }
      }
    }

    if ( document.querySelector( '.author-template' ) ) {
      if ( document.querySelector( '.archive-template' ) ) {
        return false;
      } else {
        if (document.body.clientWidth > 740 ) {
          init();
        }
      }
    }

  })();
}


