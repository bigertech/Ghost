/**
 * Created by Ashu on 23/10/14.
 */

jQuery(function($) {
  if (navigator.userAgent.indexOf("MSIE") < 0) {
    //IE8 不支持console
    console.log("^_^ 想加入笔戈科技开发团队？请发送邮件到 liuxing@meizu.com");
  }

  if($("img.lazy") && $("img.lazy").length > 0)
    $("img.lazy").lazyload({
      effect: "fadeIn",
      threshold : 500
    });

  $(document).ready( function() {
    var qrcode = $(".qrcode");
    $(".icon-wechat").hover(function(){
      var pos = $(this).position();
      qrcode.css("left", ($(window).width()-qrcode.width())/2);
      qrcode.css("top", pos.top-270);
      qrcode.fadeIn().show();
    },function(){
      qrcode.hide();
    });
  });
});