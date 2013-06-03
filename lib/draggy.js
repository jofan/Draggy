/**
 * draggy.js component
 *
 * A JavaScript/CSS3 microlibrary for moving elements.
 *
 * BROWSER SUPPORT: Safari, Chrome, Firefox, Opera, IE9
 *
 * @author     Stefan Liden
 * @version    0.9.3
 * @copyright  Copyright 2012 Stefan Liden (Jofan)
 * @license    MIT
 */

var stylar = require('stylar'),
    classes = require('classes');

/**
 * Expose `draggy`.
 */

module.exports = Draggy;

// TODO: Remove positioning with component dependencies
// TODO: Replace custom events with component events (or emitter)

var classes = require('classes');

// Some simple utility functions
var util = {
  // PPK script for getting position of element
  // http://www.quirksmode.org/js/findpos.html
  getPosition: function(ele) {
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
};

// Browser compatibility
var ele = document.createElement('div');

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

function Draggy(attachTo, config) {
  this.attachTo = attachTo;
  this.config   = config || {};
  this.onChange = this.config.onChange || function() {};
  this.position = [0,0];
  this.bindTo   = this.config.bindTo || null;
  this.init();
};

Draggy.prototype = {
  init: function() {
    this.ele           = (typeof this.attachTo === 'string' ? d.getElementById(this.attachTo) : this.attachTo);
    this.ele.draggy    = this;
    this.ele.onChange  = this.onChange;
    this.ele.position  = this.position || [0, 0];
    this.ele.restrictX = this.config.restrictX || false;
    this.ele.restrictY = this.config.restrictY || false;
    this.ele.limitsX   = this.config.limitsX || [-9999, 9999];
    this.ele.limitsY   = this.config.limitsY || [-9999, 9999];
    this.ele.snapBack  = this.config.snapBack || false;
    if (this.bindTo) {
      this.bind(this.bindTo);
    }
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

    // Allow nested draggable elements
    e.stopPropagation();

    classes(this).add('activeDrag');

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
        else if (newX < limitsX[0]) {
          relativeX = limitsX[0];
        }
        else if (newX > limitsX[1]) {
          relativeX = limitsX[1];
        }
      }
      if (!restrictY) {
        movedY = clientY - posY;
        newY = relativeY + movedY;
        if (newY >= limitsY[0] && newY <= limitsY[1]) {
          posY = clientY;
          relativeY = newY;
        }
        else if (newY < limitsY[0]) {
          relativeY = limitsY[0];
        }
        else if (newY > limitsY[1]) {
          relativeY = limitsY[1];
        }
      }
      self.draggy.position = self.position = [relativeX, relativeY];
      stylar(self).set('transform', 'translate(' + relativeX + 'px,' + relativeY + 'px)');
      self.onChange(relativeX, relativeY);
      self.dispatchEvent(onDrag);
    }
    // Stop moving draggy object, save position and dispatch onDrop event
    function dragEnd (e) {
      self.draggy.position = self.position;
      classes(self.draggy.ele).remove('activeDrag');
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
    stylar(this.ele).set('transform', 'translate(' + x + 'px,' + y + 'px)');
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
    stylar(this.ele).set('transform', 'translate(' + x + 'px,' + y + 'px)');
    this.ele.onChange(x, y);
    this.ele.position = this.position = [x,y];
    this.ele.dispatchEvent(onDrop);
  },
  // API method for resetting position of draggy object
  reset: function() {
    stylar(this.ele).set('transform', 'translate(' + 0 + 'px,' + 0 + 'px)');
    this.ele.position = [0,0];
  },
  // API method for restricting draggy object to boundaries of an element
  // Sets x and y limits
  // Used internally if config option "bindTo" is used
  bind: function(element) {
    var ele = (typeof element === 'string' ? d.getElementById(element) : element),
        draggyPos, elePos, draggyWidth, eleWidth, draggyHeight, eleHeight,
        xLimit1,  xLimit2, yLimit1, yLimit2;

    xLimit1 = xLimit2 = yLimit1 = yLimit2 = 0;

    if (ele) {
      draggyPos    = util.getPosition(this.ele);
      elePos       = util.getPosition(ele);
      draggyWidth  = parseInt(this.ele.offsetWidth, 10);
      eleWidth     = parseInt(ele.offsetWidth, 10);
      draggyHeight = parseInt(this.ele.offsetHeight, 10);
      eleHeight    = parseInt(ele.offsetHeight, 10);
      if (!this.ele.restrictX) {
        xLimit1      = elePos[0] - draggyPos[0];
        xLimit2      = (eleWidth - draggyWidth) - Math.abs(xLimit1);
      }
      if (!this.ele.restrictY) {
        yLimit1      = elePos[1] - draggyPos[1];
        yLimit2      = (eleHeight - draggyHeight) - Math.abs(yLimit1);
      }

      this.ele.limitsX = [xLimit1, xLimit2];
      this.ele.limitsY = [yLimit1, yLimit2];

    }
  }
};

