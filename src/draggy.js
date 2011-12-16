/**
 * draggy.js
 *
 * A JavaScript microlibrary for moving elements in Webkit browsers.
 *
 * @author     Stefan Liden
 * @version    0.2
 * @copyright  Copyright 2011 Stefan Liden
 * @license    Dual licensed under MIT and GPL
 */
 
(function() {
  var d = document,
      isTouch = 'ontouchstart' in window,
      mouseEvents = {
        start: 'mousedown',
        move: 'mousemove',
        end: 'mouseup'        
      }
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


  window.Draggy = function(id, onChange, config) {
    this.id = id;
    this.onChange = onChange || function() {};
    this.config = config || {};
    this.position = [0,0];
    this.init();
  };

  Draggy.prototype = {
    init: function() {
      this.ele = (typeof this.id === 'string' ? d.getElementById(this.id) : this.id);
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
      this.moveTo(this.ele.position[0], this.ele.position[1]);
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
      d.body.style.webkitUserSelect = 'none';

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
        self.style.cssText = '-webkit-transform:translate3d(' + relativeX + 'px,' + relativeY + 'px, 0);';
        self.onChange(relativeX, relativeY);
        self.dispatchEvent(onDrag);
      }
      // Stop moving draggy object, save position and dispatch onDrop event
      function dragEnd (e) {
        self.pointerPosition = [posX, posY];
        self.draggy.position = self.position;
        util.removeClass(self.draggy.ele, 'activeDrag');
        d.body.style.webkitUserSelect = '';
        self.dispatchEvent(onDrop);
        d.removeEventListener(events.move, dragMove);
        d.removeEventListener(events.end, dragEnd);
      }

    },
    // API method for moving the draggy object programatically
    moveTo: function(x,y) {
      this.ele.style.cssText = '-webkit-transform:translate3d(' + x + 'px,' + y + 'px, 0);';
      this.ele.position = this.position = [x,y];
    },
    // API method for resetting position of draggy object
    reset: function() {
      this.ele.style.cssText = '-webkit-transform:translate3d(0, 0, 0);';
      this.ele.position = [0,0];
    }
  };

})();