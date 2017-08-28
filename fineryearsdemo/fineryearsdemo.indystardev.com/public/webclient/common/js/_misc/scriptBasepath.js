window.scriptBasepath = {
  
  basepaths: {},
  debug: true,
  allowOverwrite: true,
  detectFor: function(directiveName) 
  {

    /* gets base path of directive, for relative references to images/templates/etc */
    var scripts     = document.getElementsByTagName('script');
    var path        = scripts[scripts.length-1].src.split('?')[0];      // remove any ?query
    var basepath    = path.split('/').slice(0, -1).join('/')+'/';  // remove last filename part of path
    
    var overwriting = this.basepaths[directiveName] !== undefined;
    if (overwriting && !this.allowOverwrite) {return this.basepaths[directiveName];}
    if (overwriting && this.debug) { this._warnOverwrite(directiveName, this.basepaths[directiveName], basepath); }
    
    // console.log('setting basepath for ' + directiveName + ' to: ', basepath);
    this.basepaths[directiveName] = basepath;

    return this.basepaths[directiveName];
  },
  for: function(directiveName)
  {
    if (this.basepaths[directiveName] === undefined) {
      return this.detectFor(directiveName); 
    }
    return this.basepaths[directiveName];
  },
  _warnOverwrite : function(directiveName, oldBasepath, newBasepath) {
    if (this.debug) {
      console.warn('basepath for directive: ', 
                    directiveName, 
                    ' is already defined - changing from: ', 
                    oldBasepath, 
                    'to: ', 
                    newBasepath
                  )
      ;
    }
  }
  
};