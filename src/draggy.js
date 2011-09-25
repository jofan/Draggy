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
  // http://www.quirksmode.org/js/findpos.html
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
    this.ele.limitsX = this.config.limitsX || [-9999, 9999];
    this.ele.limitsY = this.config.limitsY || [-9999, 9999];
    this.ele.fromOrigin = [0, 0];
    this.ele.addEventListener(events.start, this.dragStart);
    this.ele.originalPosition = getPosition(this.ele);
    this.initElement();
  };

  Draggy.prototype = {
    initElement: function() {
    },
    dragStart: function(e) {
      this.position = getPosition(this);
      var restrictX = this.restrictX;
      var restrictY = this.restrictY;
      var limitsX = this.limitsX;
      var limitsY = this.limitsY;
      var originalX = this.originalPosition[0];
      var originalY = this.originalPosition[1];
      var relativeX = 0;
      var relativeY = 0;
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
        var movedX, movedY, relX, relY;
        if (!restrictX) {
          // Mouse movement (x axis) in px
          movedX = e.clientX - posX;
          // New pixel value (x axis) of element
          newX = currX + movedX;
          // How many pixels element has moved (x axis) from original position
          relX = newX - originalX;
          if (relX >= limitsX[0] && relX <= limitsX[1]) {
            self.style.left = newX + 'px';
            currX = newX;
            posX = e.clientX;
            relativeX = relX;
          }
        }
        if (!restrictY) {
          movedY = e.clientY - posY;
          newY = currY + movedY;
          relY = newY - originalY;
          if (relY >= limitsY[0] && relY <= limitsY[1]) {
            self.style.top = newY + 'px';
            currY = newY;
            posY = e.clientY;
            relativeY = relY;
          }
        }
        self.onChange(self, [currX, currY], [relativeX, relativeY]);
      }

      function dragEnd (e) {
        self.position = [currX, currY];
        self.fromOrigin = [relativeX, relativeY];
        self.style.zIndex = '';
        d.body.style.webkitUserSelect = '';
        d.removeEventListener(events.move, dragMove);
        d.removeEventListener(events.end, dragEnd);
      }

    },

    moveTo: function(x,y) {
      var xFromOrigin = x - this.ele.originalPosition[0];
      var yFromOrigin = y - this.ele.originalPosition[1];
      this.ele.style.top = y + 'px';
      this.ele.style.left = x + 'px';
      this.ele.position = [x,y];
      this.ele.fromOrigin = [xFromOrigin, yFromOrigin];
    },

    reset: function() {
      this.ele.style.top = this.ele.originalPosition[1] + 'px';
      this.ele.style.left = this.ele.originalPosition[0] + 'px';
      this.ele.position = this.ele.originalPosition;
      this.ele.fromOrigin = [0, 0];
    }
  };
})();
