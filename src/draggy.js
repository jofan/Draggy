/**
 * draggy.js
 *
 * A JavaScript/CSS3 microlibrary for moving elements in Webkit browsers.
 * TODO: Support browsers other than webkit, that supports CSS3 translate
 *
 * BROWSER SUPPORT: Safari, Chrome, Firefox, Opera, IE9+
 *
 * @author     Stefan Liden
 * @version    0.7.1
 * @copyright  Copyright 2012 Stefan Liden
 * @license    Dual licensed under MIT and GPL
 */

(function() {
  'use strict';

  // Some simple utility function to update classes
  var util = {
    addClass: function(ele, classname) {
      if (!this.hasClass(ele, classname)) {
        ele.className += ' ' + classname;
      }
    },
    hasClass: function(ele, classname) {
      if (ele.className) {
        return ele.className.match(new RegExp('(\\s|^)' + classname + '(\\s|$)'));
      } else {
        return false;
      }
    },
    removeClass: function(ele, classname) {
      var cleaned = new RegExp(new RegExp('(\\s|^)' + classname + '(\\s|$)'));
      ele.className = ele.className.replace(cleaned, '');
    }
  };

  // Browser compatibility
  var transform = {}; 
  (function() {
    var ele = document.createElement('div');
    if ('WebkitTransform' in ele.style) {
      transform.pre = '-webkit-transform:translate3d(';
      transform.post = ', 0);';
    }
    else if ('MozTransform' in ele.style) {
      console.log('Eh?');
      transform.pre = '-moz-transform:translate(';
      transform.post = ');';
    }
    else if ('msTransform' in ele.style) {
      transform.pre = '-ms-transform:translate(';
      transform.post = ');';
    }
    else if ('OTransform' in ele.style) {
      transform.pre = '-o-transform:translate(';
      transform.post = ');';
    }
    else {
      transform.pre = 'transform:translate(';
      transform.post = ');';
    }
  }()); 

  var d = document,
      isTouch = 'ontouchstart' in window,
      mouseEvents = {
        start: 'mousedown',
        move: 'mousemove',
        end: 'mouseup'        
      },
      touchEvents = {
        start: 'touchstart',
        move: 'touchmove',
        end: 'touchend'
      },
      events = isTouch ? touchEvents : mouseEvents;

  window.onDrag = d.createEvent('UIEvents');
  window.onDrop = d.createEvent('UIEvents');
  onDrag.initEvent('onDrag', true, true);
  onDrop.initEvent('onDrop', true, true);

  window.Draggy = function(attachTo, config) {
    this.attachTo = attachTo;
    this.config = config || {};
    this.onChange = config.onChange || function() {};
    this.position = [0,0];
    this.init();
  };

  Draggy.prototype = {
    init: function() {
      this.ele = (typeof this.attachTo === 'string' ? d.getElementById(this.attachTo) : this.attachTo);
      this.ele.draggy = this;
      this.ele.onChange = this.onChange;
      this.ele.position = this.position || [0, 0];
      this.ele.restrictX = this.config.restrictX || false;
      this.ele.restrictY = this.config.restrictY || false;
      this.ele.limitsX = this.config.limitsX || [-9999, 9999];
      this.ele.limitsY = this.config.limitsY || [-9999, 9999];
      this.enable();
    },
    // Reinitialize draggy object and move to saved position
    reInit: function() {
      this.init();
      this.setTo(this.ele.position[0], this.ele.position[1]);
    },
    // Disable the draggy object so that it can't be moved
    disable: function() {
      this.ele.removeEventListener(events.start, this.dragStart);
    },
    // Enable the draggy object so that it can be moved
    enable: function() {
      this.ele.addEventListener(events.start, this.dragStart);
    },
    // Get current state and prepare for moving object
    dragStart: function(e) {
      var restrictX = this.restrictX,
          restrictY = this.restrictY,
          limitsX = this.limitsX,
          limitsY = this.limitsY,
          relativeX = this.position[0],
          relativeY = this.position[1],
          posX = isTouch ? e.touches[0].pageX : e.clientX,
          posY = isTouch ? e.touches[0].pageY : e.clientY,
          newX, newY,
          self = this; // The DOM element

      util.addClass(this, 'activeDrag');

      d.addEventListener(events.move, dragMove);
      d.addEventListener(events.end, dragEnd);
      
      // Move draggy object using CSS3 translate3d
      function dragMove (e) {
        e.preventDefault();
        var movedX, movedY, relX, relY,
            clientX = isTouch ? e.touches[0].pageX : e.clientX,
            clientY = isTouch ? e.touches[0].pageY : e.clientY;
        if (!restrictX) {
          // Mouse movement (x axis) in px
          movedX = clientX - posX;
          // New pixel value (x axis) of element
          newX = relativeX + movedX;
          if (newX >= limitsX[0] && newX <= limitsX[1]) {
            posX = clientX;
            relativeX = newX;
          }
        }
        if (!restrictY) {
          movedY = clientY - posY;
          newY = relativeY + movedY;
          if (newY >= limitsY[0] && newY <= limitsY[1]) {
            posY = clientY;
            relativeY = newY;
          }
        }
        self.position = [relativeX, relativeY];
        self.style.cssText = transform.pre + relativeX + 'px,' + relativeY + 'px' + transform.post;
        self.onChange(relativeX, relativeY);
        self.dispatchEvent(onDrag);
      }
      // Stop moving draggy object, save position and dispatch onDrop event
      function dragEnd (e) {
        self.pointerPosition = [posX, posY];
        self.draggy.position = self.position;
        util.removeClass(self.draggy.ele, 'activeDrag');
        self.dispatchEvent(onDrop);
        d.removeEventListener(events.move, dragMove);
        d.removeEventListener(events.end, dragEnd);
      }

    },
    // API method for moving the draggy object
    // Position is updated
    // Limits and restrictions are adhered to
    // Callback is NOT called
    // onDrop event is NOT dispatched
    moveTo: function(x,y) {
      x = this.ele.restrictX ? 0 : x;
      y = this.ele.restrictY ? 0 : y;
      if (x < this.ele.limitsX[0] || x > this.ele.limitsX[1]) { return; }
      if (y < this.ele.limitsY[0] || y > this.ele.limitsY[1]) { return; }
      this.ele.style.cssText = transform.pre + x + 'px,' + y + 'px' + transform.post;
      this.ele.position = this.position = [x,y];
    },
    // API method for setting the draggy object at a certain point
    // Limits and restrictions are adhered to
    // Callback is called
    // onDrop event is dispatched
    setTo: function(x,y) {
      x = this.ele.restrictX ? 0 : x;
      y = this.ele.restrictY ? 0 : y;
      if (x < this.ele.limitsX[0] || x > this.ele.limitsX[1]) { return; }
      if (y < this.ele.limitsY[0] || y > this.ele.limitsY[1]) { return; }
      this.ele.style.cssText = transform.pre + x + 'px,' + y + 'px' + transform.post;
      this.ele.onChange(x, y);
      this.ele.dispatchEvent(onDrop);
      this.ele.position = this.position = [x,y];
    },
    // API method for resetting position of draggy object
    reset: function() {
      this.ele.style.cssText = transform.pre + '0, 0' + transform.post;
      this.ele.position = [0,0];
    }
  };

})();