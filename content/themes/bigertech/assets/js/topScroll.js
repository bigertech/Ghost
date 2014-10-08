(function () {
  var keys = [32, 37, 38, 39, 40];
  function preventDefault(e) {
    e = e || window.event;
    if (e.preventDefault)
      e.preventDefault();
    e.returnValue = false;
  }

  function keydown(e) {
    for (var i = keys.length; i--;) {
      if (e.keyCode === keys[i]) {
        preventDefault(e);
        return;
      }
    }
  }

  function touchmove(e) {
    preventDefault(e);
  }

  function disableWheel(e) {
    /*e = e || window.event;
    if (e.preventDefault) {
      e.preventDefault();
      e.stopPropagation();
    }
    else {
      e.cancelBubble = true;
      e.returnValue = false;
    }

    return false;*/
  }

  function disable_scroll() {
    /*if( document.body.clientWidth >= 768 ) {
      window.onmousewheel = document.onmousewheel = disableWheel;
    }*/
    window.onmousewheel = document.onmousewheel = disableWheel;
    document.onkeydown = keydown;
    document.body.ontouchmove = touchmove;
  }

  function enable_scroll() {
    window.onmousewheel = document.onmousewheel = document.onkeydown = document.body.ontouchmove = null;
  }

  var docElem = window.document.documentElement,
    scrollVal,
    isRevealed,
    noscroll,
    isAnimating,
    modify = $('#post-template');

  function scrollY() {
    return window.pageYOffset || docElem.scrollTop;
  }

  function scrollPage() {
    scrollVal = scrollY();

    if (noscroll) {
      if (scrollVal < 0) return false;
      // keep it that way
      window.scrollTo(0, 0);
    }

    if (isAnimating) {
      return false;
    }

    if (scrollVal <= 0 && isRevealed) {
      toggle(0);
    }
    else if (scrollVal > 0 && !isRevealed) {
      toggle(1);
    }
  }

  function toggle(reveal) {
    isAnimating = true;

    if (reveal) {
      modify.addClass('modify');
    } else {
      noscroll = true;
      disable_scroll();
      modify.removeClass('modify');
    }
    isRevealed = !isRevealed;
    isAnimating = false;
    if (reveal) {
      noscroll = false;
      enable_scroll();
    }
    // simulating the end of the transition:

    setTimeout(function () {
      isRevealed = !isRevealed;
      isAnimating = false;
      if (reveal) {
        noscroll = false;
        enable_scroll();
      }
    }, 600);
  }

  // refreshing the page...
  var pageScroll = scrollY();
  noscroll = pageScroll === 0;
 /* if (document.body.clientWidth >= 768) {
    disable_scroll();
  }*/
  if (pageScroll) {
    isRevealed = true;
    modify.addClass('modify');
  }

  if (document.body.clientWidth >= 768) {
    $(window).scroll(scrollPage);
  }

})();
