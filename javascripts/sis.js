// set up the namespace
(function(window){
  var count = 0;
  var sis = {
    _dataObj: {}, // Key/Value hash of data for the elements on the page
    data: function(el,namespace,key,value){
      // add/retrieve data to the dataObj
      var $this = this;
      var robj = [];
      if (!el) return robj;
      $(el).each(function(idx){
        var ind = this["data-sis"];
        if ( typeof ind !== "number"){
          this["data-sis"] = count;
          $this._dataObj[count] = {element: this, data: {}};
          ind = count++;
        }
        // need to define a namespace to store or retrive data
        if (namespace){
          $this._dataObj[ind].data[namespace] = $this._dataObj[ind].data[namespace] || {};
          if (!key) {
            robj.push($this._dataObj[ind].data[namespace]);
          } else {
            if (typeof value !== "undefined") {
              $this._dataObj[ind].data[namespace][key] = value;
            }
            robj.push($this._dataObj[ind].data[namespace][key]);
          }
        }else{
          robj.push($this_dataObj[ind]);
        }
      });
      return robj.length > 1 ? robj : robj[0];
    },
    extend: function(namespace,x,publicMethods){
      //add x to sis
      var $this = this;
      // set up functions for it to inherit
      var proto = {
        namespace: namespace,
        set: function(key,value,el){
          return $this.data(el || this.$el,namespace,key,value);
        },
        get: function(key,el){
          return $this.data(el || this.$el,namespace,key);
        },
        initialized: function(el){
          var o = $this.data(el || this.$el,namespace);
          for (var i in o){
            return true;
          }
          return false;
        },
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
        call: function(funcName,context,paramArray){
          return typeof this.get(funcName,context) === "function" ?  this.get(funcName,context).call(context,paramArray) : null;
        }
      };
      for (var i in proto){
        x.prototype[i] = proto[i];
      }
      if (typeof publicMethods === "object"){
        for (var i in publicMethods){
          x.prototype[i] = publicMethods[i];
        }
      }
      this[namespace] = x;
      return this;
    }
  };
  window.sis = sis;
})(window);

// convenience function to check if element exists
(function(sis){
  sis.extend("exists",function(selector,parentSelector,returnFirst){
    var $el = parentSelector ? $(parentSelector).find(selector) : $(selector);
    returnFirst = typeof returnFirst === "boolean" ? returnFirst : false;
    return $el.length > 0 ? returnFirst ? $($el[0]) : $el : null;
  });
})(sis);
