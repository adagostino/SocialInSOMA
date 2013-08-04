// Form Inputs that take the following:
// el: object or selector for DOM Elements
// opts: {
//   validate: func(formValue){
//     // user supplied function to check input -- function is supplied current form value, return true or false
//     return true or false
//   }
//   done: func(formValue){
//     // what to do if input passes validation
//   },
//   fail: func(formValue){
//    // what to do if input fails validation
//   },
//   parse: func(val){
//     // optional function to parse the value when submitting
//     // return a key/value hash (e.g., {month:11, date:21, year: 1997})
//   },
//   failText: string -- user suppllied message if input doesn't pass validation
// }
//
(function(sis){
  var namespace = "TextInput";
  // Constructor
  var TextInput = function(el,opts){
    if (!el) return null;
    this.$el = $(el);
    if (this.initialized()) return this;

    if (opts){
      this.setValidation(opts.validate).setDone(opts.done).setFail(opts.fail).setParse(opts.parse).setFailText(opts.failText);
    }

    var $this = this;

    // bind done to the elements
    this.$el.bind("done",function(e,val){
      $this.call("doneFunction",this,val);
    });

    // bind fail to the elements
    this.$el.bind("fail",function(e,val){
      var f = $this.get("failFunction",this);
      $this.call("failFunction",this,val);
    });
    return this;
  };

  // Public methods
  var p = {
    setValidation: function(func,el){
      return this.setFunction("validateFunction",func,el);
    },
    unsetValidation: function(el){
      return this.unsetFunction("validateFunction",el);
    },
    setDone: function(func,el){
      return this.setFunction("doneFunction",func,el);
    },
    unsetDone: function(el){
      return this.unsetFunction("doneFunction",el);
    },
    setFail: function(func,el){
      return this.setFunction("failFunction",func,el);
    },
    unsetFail: function(el){
      return this.unsetFunction("failFunction",el);
    },
    setParse: function(func,el){
      return this.setFunction("parseFunction",func,el);
    },
    unsetParse: function(el){
      return this.unsetFunction("parseFunction",el);
    },
    setFailText: function(txt,el){
      if (typeof txt !== "string") return this;
      this.set("failText",txt, el);
      return this;
    },
    unsetFailText: function(el){
      this.set("failText",null,el);
      return this;
    },
    submit: function(el){
      var $el = $(el || this.$el);
      var $this = this;
      var robj = [];
      $el.each(function(idx){
        var $t = $(this);
        var val = $t.val();
        var f = $this.get("validateFunction",this);
        var success = f ? f.call(this, val) : true;
        success = typeof success === "boolean" ? success : true;
        success ? $(this).trigger("done",val) : $(this).trigger("fail",val);
        var o = {};
        o[$t.attr("name")] = success ? typeof $this.get("parseFunction",this) === "function"
                                       ? $this.get("parseFunction",this).call(this,val)
                                       : val
                                     : $this.get("failText",this) || $t.attr("name");
        robj.push({success: success, val: o});
      });
      return robj;
    }
  }
  sis.extend(namespace,TextInput,p);

})(sis);


// Just a quick button object so I can enable and disable buttons
(function(sis){
  var namespace = "Button";
  var b = function(el,clickFunc){
    if (!el) return null;
    this.$el = $(el);
    if (this.initialized()) return this;

    // set the clickFunction
    this.click(clickFunc);

    var $this = this;
    this.$el.bind("click",function(e){
      if ($(this).hasClass("disabled")) return;
      $this.call("clickFunction",this,e);
    });
  };

  var p = {
    click: function(func,el){
      return this.setFunction("clickFunction",func,el);
    },
    unsetClick: function(el){
      return this.setFunction("clickFunction",null,el);
    },
    disable: function(el){
      $(el || this.$el).addClass("disabled");
      return this;
    },
    enable: function(el){
      $(el || this.$el).removeClass("disabled");
      return this;
    }
  };

  sis.extend(namespace,b,p);
})(sis);

// Form input
// opts: {
//  done: func,
//  fail: func
// }
(function(sis){
  var namespace = "Form";
  var f = function(el,opts){
    if (!el) return null;
    this.$el = $(el);
    if (this.initialized()) return this;

    opts && this.setDone(opts.done).setFail(opts.fail);

    var $this = this;
    this.$el.each(function(idx){
      var inputs = [];
      var $t = $(this);
      $t.find("input[name]").each(function(){
        inputs.push(new sis.TextInput(this));
      });
      $this.set("inputs",inputs,this);
      var btn = sis.exists(".btn",this,true);
      var submitBtn = btn ? new sis.Button(btn,function(){
        submitBtn.disable();
        $this.submit($t);
      }) : null;
      submitBtn && $this.set("submitButton",submitBtn);

    });

  };
  // public functions
  var p = {
    submit: function(el){
      var $this = this;
      $(el || this.$el).each(function(){
        var inputs = $this.get("inputs",this);
        var a = $this.get("alert");
        (a && a.is(":visible")) && a.empty().hide();
        var so = {};
        var fa = [];
        for (var i=0; i<inputs.length; i++){
          var sa = inputs[i].submit();
          for (var j=0; j<sa.length; j++){
            for (var k in sa[j].val){
              sa[j].success ? so[k]=sa[j].val[k] : fa.push(sa[j].val[k]);
            }
          }
        }
        if (fa.length > 0){
          // call fail
          console.log("failed");
          console.log(fa);
          $this.fail(fa,this);
        }else{
          // place ajax function here using "action" from from and the
          // 'so' object to pass values. On success call "done" function,
          // on fail call "fail" function
          console.log("success");
          console.log(so);
          $this.done(so,this);
        }
      });
      return this;
    },
    setDone: function(func,el){
      return this.setFunction("doneFunction",func,el);
    },
    unsetDone: function(el){
      return this.setFunction("doneFunction",null,el);
    },
    setFail: function(func,el){
      return this.setFunction("failFunction",func,el);
    },
    unsetFail: function(el){
      return this.setFunction("failFunction",null,el);
    },
    done: function(so,el){
      var $this = this;
      $(el || this.$el).each(function(idx){
        //empty and hide the alert
        var a = $this.get("alert",this);

        (a && a.is(":visible")) && a.hide().empty();
        $this.call("doneFunction",this, so);
        $this.get("submitButton",this) && $this.get("submitButton",this).enable();
      });
      return this;
    },
    fail: function(errorArray,el){
      var $this = this;
      $(el || this.$el).each(function(idx){
        // get the alert
        var a = $this.get("alert",this) || $this.set("alert",$("<div>",{"class":"alert"}).hide().appendTo(this),this);
        // fill the alert
        for (var i=0; i<errorArray.length; i++){
          a.append($("<div>",{html: errorArray[i]}));
        }
        a.slideDown(218);
        $this.call("failFunction",this,[errorArray]);
        $this.get("submitButton",this) && $this.get("submitButton",this).enable();
      });
      return this;
    }
  }



  sis.extend(namespace,f,p);
})(sis);
