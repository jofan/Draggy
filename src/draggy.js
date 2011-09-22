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

  // PPK script for getting position of element
  function getPosition(ele) {
    var curleft = 0;
    var curtop = 0;
    if (ele.offsetParent) {
      do {
        curleft += ele.offsetLeft;
        curtop += ele.offsetTop;
      } while (ele = ele.offsetParent);
    }
    return [curleft,curtop];
  }

  window.Draggy = function(id, onChange, config) {
    this.config = config || {};
    this.ele = d.getElementById(id);
    this.ele.onChange = onChange || function() {};
    this.ele.restrictX = this.config.restrictX || false;
    this.ele.restrictY = this.config.restrictY || false;
    this.ele.limitsX = this.config.limitsX || false;
    this.ele.limitsY = this.config.limitsY || false;
    this.ele.xFromOrigin = 0;
    this.ele.yFromOrigin = 0;
    this.ele.addEventListener(events.start, this.dragStart);
    this.ele.originalPosition = getPosition(this.ele);
    this.initElement();
  };

  Draggy.prototype = {
    initElement: function() {
      this.ele.moveX = function(ele, evt) {
        var ele = ele || this;
        var movedX, movedY;
        movedX = evt.clientX - posX;
        ele.directionX = (movedX > 0 ? 'right' : 'left');
        if (ele.directionX !== 'left' && self.xFromOrigin >= 0) {
          newX = currX + movedX;
          ele.style.left = newX + 'px';
          currX = newX;
          posX = evt.clientX;
        }
      };
    },
    dragStart: function(e) {
      this.position = getPosition(this);
      this.directionX = null;
      this.directionY = null;
      // Initial element position
      var currX = this.position[0];
      var currY = this.position[1];
      // Initial mouse/touch position
      var posX = e.clientX;
      var posY = e.clientY;
      var newX, newY;
      var self = this; // The DOM element

      this.style.zIndex = '999';
      d.body.style.webkitUserSelect = 'none';

      d.addEventListener(events.move, dragMove);
      d.addEventListener(events.end, dragEnd);

      function dragMove (e) {
        var movedX, movedY;
        if (!self.restrictX) {
          movedX = e.clientX - posX;
          self.directionX = (movedX > 0 ? 'right' : 'left');
          self.moveX();
          if (self.directionX !== 'left' && self.xFromOrigin >= 0) {
            newX = currX + movedX;
            self.style.left = newX + 'px';
            currX = newX;
            posX = e.clientX;
          }
        }
        if (!self.restrictY) {
          newY = currY + (e.clientY - posY);
          self.style.top = newY + 'px';
          currY = newY;
          posY = e.clientY;
        }
        self.xFromOrigin = currX - self.originalPosition[0];
        self.yFromOrigin = currY - self.originalPosition[1];
        self.onChange(self, currX, currY);
        // Get the new coordinates
        // Set the new coordinates
        // Update current coordinates to new position
        // Set current mouse/touch position
      }

      function dragEnd (e) {
        self.position = [currX, currY];
        self.style.zIndex = '';
        d.body.style.webkitUserSelect = '';
        d.removeEventListener(events.move, dragMove);
        d.removeEventListener(events.end, dragEnd);
      }

    },

    moveTo: function(x,y) {
      this.ele.style.top = y + 'px';
      this.ele.style.left = x + 'px';
      this.ele.position = [x,y];
    },

    reset: function() {
      this.ele.style.top = this.ele.originalPosition[1] + 'px';
      this.ele.style.left = this.ele.originalPosition[0] + 'px';
      this.ele.position = this.ele.originalPosition;
    }
  };
})();
