/**
* Draggy - a CSS3 based (translate3d) drag & drop microlibrary
* TODO: Support browsers other than webkit, that supports translate3d
**/
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

  window.Draggy = function(id, onChange, config) {
    this.config = config || {};
    this.ele = d.getElementById(id);
    this.ele.onChange = onChange || function() {};
    this.ele.position = [0, 0];
    this.ele.restrictX = this.config.restrictX || false;
    this.ele.restrictY = this.config.restrictY || false;
    this.ele.limitsX = this.config.limitsX || [-9999, 9999];
    this.ele.limitsY = this.config.limitsY || [-9999, 9999];
    this.enable();
  };

  Draggy.prototype = {
    disable: function() {
      this.ele.removeEventListener(events.start, this.dragStart);
    },
    enable: function() {
      this.ele.addEventListener(events.start, this.dragStart);
    },
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

      this.style.zIndex = '999';
      d.body.style.webkitUserSelect = 'none';

      d.addEventListener(events.move, dragMove);
      d.addEventListener(events.end, dragEnd);

      function dragMove (e) {
        e.preventDefault();
        var movedX, movedY, relX, relY;
        var clientX = isTouch ? e.touches[0].pageX : e.clientX;
        var clientY = isTouch ? e.touches[0].pageY : e.clientY;
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
        self.style.cssText = 'z-index:999;-webkit-transform:translate3d(' + relativeX + 'px,' + relativeY + 'px, 0);';
        // Send coordinates to onChange method
        self.onChange(relativeX, relativeY);
      }

      function dragEnd (e) {
        self.style.zIndex = '';
        d.body.style.webkitUserSelect = '';
        d.removeEventListener(events.move, dragMove);
        d.removeEventListener(events.end, dragEnd);
      }

    },

    moveTo: function(x,y) {
      this.ele.style.cssText = '-webkit-transform:translate3d(' + x + 'px,' + y + 'px, 0);';
      this.ele.position = [x,y];
    },

    reset: function() {
      this.ele.style.cssText = '-webkit-transform:translate3d(0, 0, 0);';
      this.ele.position = [0,0];
    }
  };
})();