(function(sis,window){
  var name = "TumblrDisplay";
  var t = function(el,opts){
    if (!el) return null;
    this.$el = $(el);
    this.$el.addClass("tumblrDisplay");
    if (this.initialized()) return this;

    if (opts){
      this.fetch(opts.blog).done(opts.done);
    }
    var $this = this;

    // load images / infinite scroll
    var buff = 300;
    var onScroll = function(e,el){
      //($(document).height() - $(window).scrollTop() <= $(window).height() + buff) && console.log('load more!');
      var $el = $(el || $this.$el);
      var wst = $(window).scrollTop();
      var wh = $(window).height();

      var bot = wst + wh;

      var unloaded = $el.find(".placeholder").each(function(){
        var et = $(this).offset().top;
        var eb = et + $(this).height();
        if (et<=bot && et >= wst){
          $(this).css("visibility","visible");
          if ($(this).is("[data-src]")) {
            var img = $("<img>",{src: $(this).attr("data-src")}).css("opacity",0).appendTo(this);
            $(this).removeAttr("data-src");
            img.load(function(){
              $(this).animate({
                opacity: 1,
              },600);
            });
          }
        }else{
          $(this).css("visiblity","hidden");
        }
      });
    };
    $(window).scroll(onScroll);
    // so we don't orphan any elements
    this.$el.bind("remove",function(){
      $(window).unbind("scroll",onScroll);
    });
  }

  var p = {
    fetch: function(tumbleog,el){
      var $this = this;
      var failText = "Please enter a valid Tumbler blog (e.g., 'puppygifs.tumblr.com)'";
      var tblog = null;
      var reg = /(\w+)(?:\.*)/;
      try{
        tblog = tumbleog.match(reg)[1];
      }catch(e){

      }
      if (!tblog) return this.fail(failText,el);

      var url = "http://"+tblog+".tumblr.com/api/read/json?callback=?";

      // Look into yahoo api to fetch tumblr json b/c yahoo will always reuturn an answer
      // Not enough time now b/c yahoo doesn't return json, so we'd have to parse it out.
      /*
      $.getJSON("http://query.yahooapis.com/v1/public/yql?"+
        "q=select%20*%20from%20html%20where%20url%3D%22"+
          encodeURIComponent(url)+"%22&format=json'&callback=?", function(data){

        }
      );
      */
      $.getJSON(url,function(data){
        $this.build(data,el);
      });

      return this;
    },
    build: function(json,time,el){
      if (!json) return this;
      time = typeof time === "number" ? time : 400;
      var $this = this;
      var content = $("<div>",{"class":"tempContent"});
      var ul = $("<ul>").appendTo(content);
      for (var i=0; i<json.posts.length; i++){
        ul.append(parsePost(json.posts[i]));
      }

      var $el = $(el || this.$el);

      $el.append(content).animate({
        height: content.outerHeight()
      },time,function(){
        //$(this).height("auto");
      });

      var oc = $el.find(".content");
      console.log(oc[0]);

      content.animate({
        opacity: 1,
      },time,function(){
        oc.remove();
        $(this).addClass("content").removeClass("tempContent");
      });

      oc.animate({
        opacity: 0
      },time);

      $(window).trigger("scroll",el);
      this.call("doneFunction",el);
      return this;
    },
    remove: function(el){
      $(el || this.$el).trigger("remove");
      return this;
    },
    fail: function(text,el){
      console.log(text);
      this.call("doneFunction",el);
      return this;
    },
    done: function(func,el){
      if (typeof func !== "function") return this;
      this.setFunction("doneFunction",func,el);
      return this;
    }
  }

  // private functions
  function parsePost(json){
    if (!json) return null;
    switch(json.type){
      case "photo":
        return buildPhoto(json);
        break;
      default:
        return null;
    }
    return null;
  }

  function buildPhoto(json){
    // maintain aspect ratio;
    var maxWidth = 300;
    var maxHeight = 300;
    var time = 218;

    var width = json.width;
    var height = json.height;
    var r = width/height;
    if (width > maxWidth){
      width = maxWidth;
      height = width/r;
    }
    if (height > maxHeight){
      height = maxHeight;
      width = height*r;
    }

    var li = $("<li>",{"class": "photo"});
    var ph = $("<div>",{"class":
      "placeholder",
      "data-src": json["photo-url-1280"]
    }).height(height).width(width).appendTo(li);

    var lt = $("<div>",{
      "class": "loading",
      "text":"Loading Image"
    }).appendTo(ph);

    return li;
  }

  sis.extend(name,t,p);

})(sis,window);
