/**
 * dropzone.js
 *
 * A plugin for the Draggy library.
 *
 * BROWSER SUPPORT: Safari, Chrome, Firefox, Opera, IE9
 *
 * @author     Stefan Liden
 * @version    0.1
 * @copyright  Copyright 2012 Stefan Liden (Jofan)
 * @license    Dual licensed under MIT and GPL
 */

 (function() {
  'use strict';

  var d = document;

  window.DropZone = function(id, config) {
    this.id = id;
    this.init();
  }

  window.DropZone.prototype = {
    init: function() {
      this.ele = (typeof this.id === 'string' ? d.getElementById(this.id) : this.id);
      this.enable();
    },
    reInit: function() {
      this.init();
    },
    disable: function() {

    },
    enable: function() {
      d.addEventListener('onDrag', this.checkIfActive);
    },
    // Remove and reset Draggy objects
    reset: function() {
    },
    checkIfActive: function(event) {
      var obj = event.target.draggy;
      // console.log(obj.position[0]);
    }
  }

}());

