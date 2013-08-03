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
//   }
// }
//
(function(sis){
  var name = "TextInput";
  // Constructor
  var TextInput = function(el,opts){
    if (!el) return null;
    this.$el = $(el);
    if (this.initialized()) return this;

    if (opts){
      this.setValidation(opts.validate).setDone(opts.done).setFail(opts.fail);
    }

    var $this = this;
    // bind submit to the elements
    this.$el.bind("submit",function(e,val){
      var f = $this.get("validateFunction",this);
      var success = f ? f.call(this,val) : true;
      success = typeof success === "boolean" ? success : true;
      success ? $(this).trigger("done",val) : $(this).trigger("fail",val);
    });

    // bind done to the elements
    this.$el.bind("done",function(e,val){
      var f = $this.get("doneFunction",this);
      typeof f === "function" && f.call(this,val);
    });

    // bind fail to the elements
    this.$el.bind("fail",function(e,val){
      var f = $this.get("failFunction",this);
      typeof f === "function" && f.call(this,val);
    });
    return this;
  };

  // Public methods
  var p = {
    setFunction: function(funcName,func,el){
      if (typeof func !== "function" || typeof funcName !== "string" ) return this;
      this.set(funcName,func,$(el || this.$el));
      return this;
    },
    unsetFunction: function(funcName, el){
      if (typeof funcName !== "string") return this;
      this.set(funcName,null,$(el || this.$el));
      return this;
    },
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
    submit: function(el){
      var robj = [];
      var $el = $(el || this.$el);
      $el.each(function(idx){
        var $t = $(this);
        $t.trigger("submit",$t.val());
      });
      return this;
    }
  }
  sis.extend(name,TextInput,p);

})(sis);
