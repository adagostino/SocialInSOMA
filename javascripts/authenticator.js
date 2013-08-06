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
      var $t = $(this);
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
        top: 0,
        left: 0,
        opacity: out ? 0 : 1,
        position: "absolute"
      };
      var cssEnd = {};
      var wh = this.getWidthHeight();
      //console.log(this.$el.attr("data-name"),this.getWidthHeight());
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
          case "up":
            cssStart.marginTop = out ? -wh.height : wh.height;
            cssEnd.marginTop = "0";
            break;
          case "down":
            cssStart.marginTop = out ? wh.height : -wh.height;
            cssEnd.marginTop = "0";
            break;
          case "fade":
            cssStart.opacity = 0;
            cssEnd.opacity = 1;
            break;
          default:
            cssStart.opacity = 1;
            cssEnd.opacity = 1;
            break;
        };
        var hs = out ? "Hide" : "Show";
        !out && $(this).css(cssStart).show();
        $this.call("before"+hs,this);
        $(this).animate(out ? cssStart : cssEnd,time,function(){
          out ? $(this).hide().css({
            marginTop: 0,
            marginLeft: 0,
            top: 0,
            left: 0,
            opacity: 1,
            position: "absolute"
          }) : $(this).css("position","relative");
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
  var auth = function(el,opts){
    if (!el) return null;
    this.$el = $(el);
    if (this.initialized()) return this;

    if (opts){
      this.onAuthenticated(opts.onAuthenticated);
    }

    var $this = this;
    this.$el.each(function(idx){
      // get the unordered list containing all authPanels
      var ul = sis.exists("ul",this,true) || $("<ul>").appendTo(this);
      var $t = $(this);
      $this.set("ul",ul,this);
      // assign and store existing auth panels (denoted by data-name attribute)

      ul.find("li").each(function(){
        var n = $(this).attr("data-name");
        $this.getPanel(n,$t);
      });
    });
    this.set("current","signIn");
    // bind the show/hide
    this.$el.delegate("li[data-name]","show",function(e,name){
      $this.show(name,null,e.delegateTarget)
    });
    this.$el.delegate("form","authenticated",function(e){
      console.log(e.delegateTarget);
      $(e.delegateTarget).trigger("authenticated",e.delegateTarget);
    });
    this.$el.on("authenticated",function(e,target){
      e.target === target && $this.call("authFunc",this);
    });
  };

  var p = {
    onAuthenticated: function(func,el){
      this.setFunction("authFunc",func,el);
      return this;
    },
    show: function(name,time,el){
      var $this = this;
      time = typeof time === "number" ? time : 400;
      $(el || this.$el).each(function(){
        var s = $this.getPanel(name,this);
        var h = $this.getPanel($(this).find("li.authPanel:visible").attr("data-name"),this);
        var ul = $this.get("ul",this);
        var wh = s.getWidthHeight();
        ul.animate({
          height: wh.height
        },time);
        h.hide(time);
        s.show(time);
      });

    },
    getPanel: function(panel,el){
      if (typeof panel !== "string") return null;
      switch(panel.toLowerCase()){
        case "signin":
          return this.getSignInPanel(el);
          break;
        case "trouble":
          return this.getTroublePanel(el);
          break;
        case "create":
          return this.getCreatePanel(el);
          break;
        case "recoverpass":
          return this.getPassPanel(el);
          break;
        case "recoveruser":
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
        var sip = $this.get("signIn",this) || $this.set("signIn",createSignInPanel($this.get("ul",this)),this);
        a.push(sip);
      });
      return a.length == 1 ? a[0] : a;
    },
    getCreatePanel: function(el){
      var $el = $(el || this.$el);
      var $this = this;
      var a = [];
      $el.each(function(ind){
        var sip = $this.get("create",this) || $this.set("create",createCreatePanel($this.get("ul",this)),this);
        a.push(sip);
      });
      return a.length == 1 ? a[0] : a;
    },
    getTroublePanel: function(el){
      var $el = $(el || this.$el);
      var $this = this;
      var a = [];
      $el.each(function(ind){
        var sip = $this.get("trouble",this) || $this.set("trouble",createTroublePanel($this.get("ul",this)),this);
        a.push(sip);
      });
      return a.length == 1 ? a[0] : a;
    },
    getPassPanel: function(el){
      var $el = $(el || this.$el);
      var $this = this;
      var a = [];
      $el.each(function(ind){
        var sip = $this.get("recoverPass",this) || $this.set("recoverPass",createPassPanel($this.get("ul",this)),this);
        a.push(sip);
      });
      return a.length == 1 ? a[0] : a;
    },
    getUserPanel: function(el){
      var $el = $(el || this.$el);
      var $this = this;
      var a = [];
      $el.each(function(ind){
        var sip = $this.get("recoverUser",this) || $this.set("recoverUser",createUserPanel($this.get("ul",this)),this);
        a.push(sip);
      });
      return a.length == 1 ? a[0] : a;
    }
  };

  // private functions
  function createSignInPanel(ul){
    // not really finished with this function but good enough for now since it's created using html
    var li = sis.exists("li[data-name='signIn']",ul,true) || $("<li>",{"data-name":"signIn"}).appendTo(ul);
    var hdr = sis.exists("h2",li,true) || li.prepend($("<h2>",{text: "Sign In"}));//.after(li);

    var form = sis.exists("form",li,true);
    var email = createEmailInput(createInput("text","E-mail","email","sign-in-email",form));
    var pass  = createNameInput("Please enter your password",
                createInput("password","Password","password","sign-in-password",form));
    var btn = sis.exists(".btn",form,true) || $("<div>",{"class": "btn", html: "<span>Sign In</span>"}).appendTo(form);
    var f = new sis.Form(form,{
      done: function(){
        $(this).trigger("authenticated");
      }
    });
    pass.$el.keyup(function(e){
      e.which == 13 && btn.click();
    });

    return new sis.AuthPanel(li,{
      afterShow: function(){
        $(ul).height("auto");
        $(ul).trigger("afterShow");
      }
    });
  }

  function createCreatePanel(ul){
    var li = sis.exists("li[data-name='create']",ul,true)
      || $("<li>",{
            "data-name":"create",
            "data-in": "up",
            "data-out": "down"
          }).hide().appendTo(ul);
    li.addClass("authPanel");
    var xout = sis.exists("a.xout",li,true) || $("<a>",{"class": "xout", html: "<div>&times;</div>"}).appendTo(li);
    xout.attr("data-show","signIn");
    var hdr = sis.exists("h2",li,true) || $("<h2>",{text: "Create an Account"}).appendTo(li);
    var form = sis.exists("form",li,true) || $("<form>",{"action":"create"}).appendTo(li);
    var fname = createNameInput("Please enter your first name",
                createInput("text","First Name","fname","create-first-name",form));
    var lname = createNameInput("Please enter your last name",
                createInput("text","Last Name","lname","create-last-name",form));
    var email = createEmailInput(createInput("text","E-mail","email","create-email",form));
    var pass  = createNameInput("Please enter a password",
                createInput("password","Password","password","create-password",form));
    var cpass = createConfirmPassInput(pass.$el[0],
                createInput("password","Confirm Password","cpassword","create-confirm-password",form));
    var btn = sis.exists(".btn",form,true) || $("<div>",{"class": "btn", html: "<span>Create Account</span>"}).appendTo(form);


    var f = new sis.Form(form,{
      done: function(){
        $(this).trigger("authenticated");
      }
    });

    $(pass.$el).keyup(function(e){
      e.which == 13 && btn.click();
    });
    $(cpass.$el).keyup(function(e){
      e.which == 13 && btn.click();
    });

    return new sis.AuthPanel(li,{
      afterShow: function(){
        $(ul).height("auto");
        $(ul).trigger("afterShow");
      }
    });
  }

  function createTroublePanel(ul){
    var li = sis.exists("li[data-name='trouble']",ul,true)
      || $("<li>",{
            "data-name":"trouble",
            "data-in": "down",
            "data-out": "up"
          }).hide().appendTo(ul);
    li.addClass("authPanel");
    var xout = sis.exists("a.xout",li,true) || $("<a>",{"class": "xout", html: "<div>&times;</div>"}).appendTo(li);
    var hdr = sis.exists("h2",li,true) || $("<h2>",{text: "Having Trouble?"}).appendTo(li);

    xout.attr("data-show","signIn");
    var pass = sis.exists("a.panelLink[data-show='recoverPass']",li,true) || $("<div>",{
      "class":"troubleLink",
      html: "<a class='panelLink' data-show='recoverPass'>Forgot your password?</a>"
    }).appendTo(li);
    var user = sis.exists("a.panelLink[data-show='recoverUser']",li,true) || $("<div>",{
      "class":"troubleLink",
      html: "<a class='panelLink' data-show='recoverUser'>Forgot your username?</a>"
    }).appendTo(li);


    return new sis.AuthPanel(li,{
      afterShow: function(){
        $(ul).height("auto");
        $(ul).trigger("afterShow");
      }
    });
  };

  function createPassPanel(ul){
    var li = sis.exists("li[data-name='recoverPass']",ul,true)
      || $("<li>",{
            "data-name":"recoverPass",
            "data-in": "left",
            "data-out": "left"
          }).hide().appendTo(ul);
    li.addClass("authPanel");
    var xout = sis.exists("a.xout",li,true) || $("<a>",{"class": "xout", html: "<div>&times;</div>"}).appendTo(li);
    xout.attr("data-show","signIn");
    var hdr = sis.exists("h2",li,true) || $("<h2>",{text: "Recover Password"}).appendTo(li);



    var form = sis.exists("form",li,true) || $("<form>",{"action":"recoverPass"}).appendTo(li);
    var email = createEmailInput(createInput("text","E-mail","email","recoverPass-email",form));
    var btn = sis.exists(".btn",form,true) || $("<div>",{"class": "btn", html: "<span>Recover Password</span>"}).appendTo(form);
    var f = new sis.Form(form,{
      done: function(){
        $(this).trigger("authenticated");
      }
    });

    $(email.$el).keyup(function(e){
      e.which == 13 && btn.click();
    });

    return new sis.AuthPanel(li,{
      afterShow: function(){
        $(ul).height("auto");
        $(ul).trigger("afterShow");
      }
    });
  }

  function createUserPanel(ul){
    var li = sis.exists("li[data-name='recoverUser']",ul,true)
      || $("<li>",{
            "data-name":"recoverUser",
            "data-in": "right",
            "data-out": "right"
          }).hide().appendTo(ul);
    li.addClass("authPanel");

    var xout = sis.exists("a.xout",li,true) || $("<a>",{"class": "xout", html: "<div>&times;</div>"}).appendTo(li);
    xout.attr("data-show","signIn");
    var hdr = sis.exists("h2",li,true) || $("<h2>",{text: "Recover Username"}).appendTo(li);
    var form = sis.exists("form",li,true) || $("<form>",{"action":"recoverUser"}).appendTo(li);
    var fname = createNameInput("Please enter your first name",
                createInput("text","First Name","fname","recoverUser-first-name",form));
    var lname = createNameInput("Please enter your last name",
                createInput("text","Last Name","lname","recoverUser-last-name",form));
    var bday = createDateInput(createInput("text","Birthday","bday","recoverUser-bday",form));
    var btn = sis.exists(".btn",form,true) || $("<div>",{"class": "btn", html: "<span>Recover Username</span>"}).appendTo(form);
    var f = new sis.Form(form,{
      done: function(){
        $(this).trigger("authenticated");
      }
    });

    $(bday.$el).keyup(function(e){
      e.which == 13 && btn.click();
    });

    return new sis.AuthPanel(li,{
      afterShow: function(){
        $(ul).height("auto");
        $(ul).trigger("afterShow");
      }
    });
  };

  function createInput(type,title,name,id,form){
    sis.exists("label[for='"+id+"']",form,true) || $("<label>",{"for":id,text:title}).appendTo(form);
    return sis.exists("input[name='"+name+"']",form,true) || $("<input>",{
      name: name,
      id: id,
      type: type
    }).appendTo(form);
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
        return (1+d.getMonth())+"/"+d.getDate()+"/"+d.getFullYear();
      },
      failText: "Please enter a valid date (e.g., mm/dd/yyyy)"
    });
    return i;
  }

  function createConfirmPassInput(opass,el){
    var i = new sis.TextInput(el,{
      validate: function(val){
        var v = $.trim(val);
        var ov = $.trim($(opass).val());
        return v > 0 && v == ov;
      },
      done: function(val){
        $(this).removeClass("error");
      },
      fail: function(val){
        $(this).addClass("error");
      },
      failText: "Please make sure the 'Password' and 'Confirm Password' fields match"
    });
    return i;
  }
  sis.extend(namespace,auth,p);

})(sis);
