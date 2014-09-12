var Menu = {
  settings: {
    menuBtn: $(".js-menuBtn"),
    menu: $(".js-menu"),
    closeBtn: $(".js-closeBtn"),
    bg: $(".js-Bg"),
    container: $(".js-menuContainer"),
    isOpen: !1,
    isAnimating: !1
  },
  init: function () {
    this.bindUIActions()
  },
  bindUIActions: function () {
    var e = this.settings;
    e.menuBtn.click(function () {
        Menu.toggle()
    });
    e.bg.click(function () {
        Menu.close()
    });
    e.container.click(function () {
        Menu.close()
    });
    e.closeBtn.click(function () {
        Menu.close()
    });
    $(window).keydown(function (e) {
        e.which === 27 && Menu.close()
    })
  },
  toggle: function () {
    var e = this.settings;
    e.isOpen ? Menu.close() : Menu.open()
  },
  open: function () {
    function t() {
        e.menu.addClass("is-active");
        e.isAnimating = !1
    }
    var e = this.settings;
    if (e.isAnimating === !1) {
        e.isOpen = !0;
        e.isAnimating = !0;
        e.menu.css("display", "block");
        setTimeout(t, 100)
    }
  },
  close: function () {
    function t() {
        e.menu.css("display", "none");
        e.isAnimating = !1
    }
    var e = this.settings;
    if (e.isAnimating === !1) {
        e.isOpen = !1;
        e.isAnimating = !0;
        e.menu.removeClass("is-active");
        setTimeout(t, 1200)
    }
  }
}, Search = {
  settings: {
      textBox: $(".textbox"),
      searchBtn: $(".js-searchBtn"),
      search: $(".js-search"),
      closeBtn: $(".js-closeBtn"),
      bg: $(".js-Bg"),
      container: $(".js-searchContainer"),
      isOpen: !1,
      isAnimating: !1
  },
  init: function () {
      this.bindUIActions()
  },
  bindUIActions: function () {
    var e = this.settings;
    e.searchBtn.click(function () {
        Search.toggle()
    });
    // 处理搜索框阻止冒泡
    e.textBox.click(function () {
      return false;
    });
    e.bg.click(function () {
        Search.close()
    });
    e.container.click(function () {
        Search.close()
    });
    e.closeBtn.click(function () {
        Search.close()
    });
    $(window).keydown(function (e) {
        e.which === 27 && Search.close()
    })
  },
  toggle: function () {
      var e = this.settings;
      e.isOpen ? Search.close() : Search.open()
  },
  open: function () {
      function t() {
          e.search.addClass("is-active");
          e.textBox.focus();
          e.isAnimating = !1
      }
      var e = this.settings;
      if (e.isAnimating === !1) {
          e.isOpen = !0;
          e.search.css("display", "block");
          setTimeout(t, 100)
      }

  },
  close: function () {
      function t() {
          e.search.css("display", "none");
          e.isAnimating = !1
      }
      var e = this.settings;
      if (e.isAnimating === !1) {
          e.isOpen = !1;
          e.isAnimating = !0;
          e.search.removeClass("is-active");
          setTimeout(t, 1200)
      }
  },
};

var Tag = {
  settings: {
    tagBtn: $(".js-tagBtn"),
    tag: $(".js-tags"),
    closeBtn: $(".js-closeBtn"),
    bg: $(".js-Bg"),
    container: $(".js-tagContainer"),
    isOpen: !1,
    isAnimating: !1
  },
  init: function () {
    this.bindUIActions()
  },
  bindUIActions: function () {
    var e = this.settings;
    e.tagBtn.click(function () {
        Tag.toggle()
    });
    e.bg.click(function () {
        Tag.close()
    });
    e.container.click(function () {
        Tag.close()
    });
    e.closeBtn.click(function () {
        Tag.close()
    });
    $(window).keydown(function (e) {
        e.which === 27 && Tag.close()
    })
  },
  toggle: function () {
    var e = this.settings;
    e.isOpen ? Tag.close() : Tag.open()
  },
  open: function () {
    function t() {
        e.tag.addClass("is-active");
        e.isAnimating = !1
    }
    var e = this.settings;
    if (e.isAnimating === !1) {
        e.isOpen = !0;
        e.isAnimating = !0;
        e.tag.css("display", "block");
        setTimeout(t, 100)
    }
  },
  close: function () {
    function t() {
        e.tag.css("display", "none");
        e.isAnimating = !1
    }
    var e = this.settings;
    if (e.isAnimating === !1) {
        e.isOpen = !1;
        e.isAnimating = !0;
        e.tag.removeClass("is-active");
        setTimeout(t, 1200)
    }
  }
};

$(document).ready(function () {
  Menu.init();
  Search.init();
  Tag.init();
});
