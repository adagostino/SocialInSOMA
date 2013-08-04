// data-name, data-in, data-out
// anchors: data-show
// opts: {
//   in: string -- values: up,down,left,right,fade
//   out: string -- values: up,down,left,right,fade
//   beforeShow: -- user defined function that fires before show ("this" is the AuthPanel li element)
//   afterShow: -- user defined function that fires after show ("this" is the AuthPanel li element)
//   beforeHide: -- user defined function that fires before hide ("this" is the AuthPanel li element)
//   afterHide: -- user defined function that fires after hide ("this" is the AuthPanel li element)
// }
(function(sis){
  var namespace = "AuthPanel";
  var ap = function(el,opts){
    if (!el) return null;
    this.$el = $(el);
    if (this.initialized()) return this;

    if (opts) {
      this.setDir(opts.in).setDir(opts.out,true).beforeShow(opts.beforeShow)
          .afterShow(opts.afterShow).beforeHide(opts.beforeHide).afterHide(opts.afterHide);
    }

    this.$el.delegate("a[data-show]","click",function(e){
      e.preventDefault();
      var $t = $(e.delegateTarget);
      $t.trigger("show",$t.attr("data-show"));
    });
    return this;
  };

  // Public methods
  var p = {
    getDir: function(out,el) {
      // the data-in/data-out attributes take precedence
      var out = typeof out === "boolean" ? out : false;
      var el = $(el || this.$el)[0];
      return $(el).attr("data-"+(out ? "out" : "in")) || this.get(out ? "outDir" : "inDir",el);
    },
    setDir: function(dir,out,el) {
      if (typeof dir !== "string") return this;
      var out = typeof out === "boolean" ? out : false;
      var $el = $(el || this.$el);
      $el.attr("data-"+(out ? "out" : "in"), dir);
      this.set(out ? "outDir" : "inDir", dir, $el);
      return this;
    },
    getWidthHeight: function(el) {
      var $el = $(el || this.$el);
      return {width: $el.outerWidth(true), height: $el.outerHeight(true) };
    },
    setFunc: function(funcName,func,el){
      if (typeof func !== "function" || typeof funcName !== "string") return this;
      this.set(funcName,func,$(el || this.$el));
      return this;
    },
    unsetFunc: function(funcName,el){
      if (typeof funcName !== "string") return this;
      this.set(funcName,null,$(el || this.$el));
      return this;
    },
    beforeShow: function(func,el){
      return this.setFunc("beforeShow",func,el);
    },
    afterShow: function(func,el){
      return this.setFunc("afterShow",func,el);
    },
    beforeHide: function(func,el){
      return this.setFunc("beforeHide",func,el);
    },
    afterHide: function(func,el){
      return this.setFunc("afterHide",func,el);
    },
    toggle: function(out,time,el){
      var $el = $(el || this.$el);
      var $this = this;
      time = typeof time === "number" ? time : 218;
      out = typeof out === "boolean" ? out : false;
      // margin-top, margin-left, opacity
      var cssStart = {
        marginTop: 0,
        marginLeft: 0,
      };
      var cssEnd = {};
      $el.each(function(idx){
        var dir = $this.getDir(out,this);
        switch(dir){
          case "left":
            cssStart.marginLeft = "-100%";
            cssEnd.marginLeft = "0";
            break;
          case "right":
            cssStart.marginLeft = "100%";
            cssEnd.marginLeft = "0";
            break;
          case "top":
            cssStart.marginTop = "-100%";
            cssEnd.marginTop = "0";
            break;
          case "bottom":
            cssStart.marginTop = "100%";
            cssEnd.marginTop = "0";
            break;
          case "fade":
            cssStart.opactiy = 0;
            cssEnd.opacity = 1;
            break;
          default:
            cssStart.opacity = 1;
            cssEnd.opacity = 1;
            time = 0;
            break;
        };
        var hs = out ? "Hide" : "Show";
        !out && $(this).css(cssStart).show();
        $this.call("before"+hs,this);
        $(this).animate(out ? cssStart : cssEnd,time,function(){
          $this.call("after"+hs,this);
        });
      });
      return this;
    },
    show: function(time,el){
      return this.toggle(false,time,el);
    },
    hide: function(time,el){
      return this.toggle(true,time,el);
    }
  };

  sis.extend(namespace,ap,p);
})(sis);

// Authenticator
// This can have as many panels as you want, but there are specific panels
// that will always be there:
//    signIn: the sign in panel
//    create: a panel to create a new account
//    recoverPass: a panel to reover a users lost password
//    reoverUser: a panel to reover a users name
// bc of this, there are 4 dedicated functions to retrieve/build these panels

(function(sis){
  var namespace = "Authenticator";
  var auth = function(el){
    if (!el) return null;
    this.$el = $(el);
    if (this.initialized()) return this;

    var $this = this;
    this.$el.each(function(idx){
      // get the unordered list containing all authPanels
      var ul = sis.exists("ul",this,true) || $("<ul>").appendTo(this);
      $this.set("ul",ul,this);
      // assign and store existing auth panels (denoted by data-name attribute)
      ul.find("li").each(function(){
        var n = $(this).attr("data-name");
        $this.getPanel(n,this);
        //name && $this.set(name,new sis.AuthPanel(this));

      });

    });
    // bind the show/hide
    this.$el.delegate("li[data-name]","show",function(e,name){
      $this.show(name,e.delegateTarget)
    });
  };

  var p = {
    show: function(name,el){

    },
    getPanel: function(panel,el){
      if (typeof panel !== "string") return null;

      switch(panel.toLowerCase()){
        case "signin":
          return this.getSignInPanel(el);
          break;
        case "create":
          return this.getCreatePanel(el);
          break;
        case "recoverpass":
          return this.getPassPanel(el);
          break;
        case "reoveruser":
          return this.getUserPanel(el);
          break;
        default:
          return this.get(panel,$(el || this.$el));
          break;
      }
    },
    getSignInPanel: function(el){
      var $el = $(el || this.$el);
      var $this = this;
      var a = [];
      $el.each(function(ind){
        a.push($this.get("signIn",this) ? $this.get("signIn",this) : $this.set("signIn",createSignInPanel($this.get("ul",this)),this));
      });
      return a.length == 1 ? a[0] : a;
    }
  };

  // private functions
  function createSignInPanel(ul){
    var li = sis.exists("li[data-name='signIn']",ul,true) || $("<li>",{"data-name":"signIn"}).appendTo(ul);
    var hdr = sis.exists("h2",li,true) || li.prepend($("<h2>",{text: "Sign In"}));//.after(li);

    var form = sis.exists("form",li,true);
    var email = createEmailInput(sis.exists("input[name='email'][type='text']",form,true) || $("<input>",{name: "email", type: "text"}).appendTo(form));
    email.$el.attr("id","sign-in-email");
    sis.exists("label[for='sign-in-email']",li,true) || email.$el.before($("<label>",{"for":"sign-in-email", text: "E-mail"}));
    var pass = createNameInput("Please enter your password",sis.exists("input[name='password'][type='password']",form,true) || $("<input>",{name: "password", type: "password"}).appendTo(form));
    pass.$el.attr("id","sign-in-password");
    sis.exists("label[for='sign-in-password']",li,true) || pass.$el.before($("<label>",{"for":"sign-in-password", text: "Password"}));
    var btn = sis.exists(".btn",form,true) || $("<div>",{"class": "btn", html: "<span>Sign In</span>"}).appendTo(form);
    var f = new sis.Form(form);
    pass.$el.keyup(function(e){
      e.which == 13 && btn.click();
    });

    return new sis.AuthPanel(li)
  }

  function createCreatePanel(ul){
    var li = sis.exists("li[data-name='signIn']",ul,true) || $("<li>",{"data-name":"signIn"}).appendTo(ul);
  }

  function createNameInput(failText,el){
    var i = new sis.TextInput(el,{
      validate: function(val){
        return $.trim(val).length > 0;
      },
      done: function(val){
        $(this).removeClass("error");
      },
      fail: function(val){
        $(this).addClass("error");
      },
      failText: failText
    });
    return i;
  }

  function createEmailInput(el){
    var i = new sis.TextInput(el,{
      validate: function(val){
        var reg = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return reg.test($.trim(val));
      },
      done: function(val){
        $(this).removeClass("error");
      },
      fail: function(val){
        $(this).addClass("error");
      },
      failText: "Please enter a valid email address"
    });
    return i;
  }

  function createDateInput(el){
    var i = new sis.TextInput(el,{
      validate: function(val){
        return new Date(val) != "Invalid Date";
      },
      done: function(val){
        $(this).removeClass("error");
      },
      fail: function(val){
        $(this).addClass("error");
      },
      parse: function(val){
        var d = new Date(val);
        return {month: 1 + d.getMonth(), date: d.getDate(), year: d.getFullYear()}
      },
      failText: "Please enter a valid date (e.g., mm/dd/yyyy)"
    });
    return i;
  }

  function createPassInput(el){

  }
  sis.extend(namespace,auth,p);

})(sis);
