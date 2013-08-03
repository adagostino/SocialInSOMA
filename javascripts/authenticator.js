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
  var name = "AuthPanel";
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
      console.log("show clicked");
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
    show: function(el){
      var $el = $(el || this.$el);
      var $this = this;

      return this;
    },
    hide: function(el){
      var $el = $(el || this.$el);
      var $this = this;

      return this;
    }
  }

  sis.extend(name,ap,p);
})(sis);

(function(sis){
  var name = "Authenticator";


})(sis);
