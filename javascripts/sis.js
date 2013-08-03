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
      x.namespace = namespace;
      // set up get/set functions for it to inherit
      x.prototype.set = x.set || function(key,value,el){
        return $this.data(el || x.$el,namespace,key,value);
      };
      x.prototype.get = x.get || function(key,el){
        return $this.data(el || x.$el,namespace,key);
      };
      x.prototype.initialized = x.initialized || function(el){
        var o = $this.data(el || x.$el,namespace);
        for (var i in o){
          return true;
        }
        return false;
      };
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
  sis.extend("exists",function(selector,parentSelector){
    var $el = parentSelector ? $(parentSelector).find(selector) : $(selector);
    return $el.length > 0 ? $el : null;
  });
})(sis);
