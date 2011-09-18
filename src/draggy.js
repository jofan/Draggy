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

  window.Draggy = function(id) {
    this.ele = d.getElementById(id);
    this.ele.addEventListener(events.start, this.dragStart);
    this.originalPosition = getPosition(this.ele);
  };

  Draggy.prototype = {
    dragStart: function(e) {
      this.position = getPosition(this);
      var currX = this.position[0];
      var currY = this.position[1];
      var posX = e.clientX;
      var posY = e.clientY;
      var newX, newY;
      var self = this;

      this.style.zIndex = '999';
      d.body.style.webkitUserSelect = 'none';

      d.addEventListener(events.move, dragMove);
      d.addEventListener(events.end, dragEnd);

      console.log('Starting drag');
    
      function dragMove (e) {
        // Get the new coordinates
        newX = currX + (e.clientX - posX);
        newY = currY + (e.clientY - posY);
        // Set the new coordinates
        self.style.top = newY + 'px';
        self.style.left = newX + 'px';
        // Update current coordinates to new position
        currX = newX;
        currY = newY;
        // Set current mouse/touch position
        posX = e.clientX;
        posY = e.clientY;
      }

      function dragEnd (e) {
        console.log('Dropping element...');
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
      this.ele.style.top = this.originalPosition[1] + 'px';
      this.ele.style.left = this.originalPosition[0] + 'px';
      this.ele.position = this.originalPosition;
    }
  };
})();
