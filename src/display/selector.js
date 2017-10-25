var U = require('../utility.js');
var DU = require('./utility.js');
var C_FOCUS = 'desummary-focus';
var C_SELECTION = 'desummary-selection';
var C_FOCUS_SELECTION = 'desummary-focus-selection';

module.exports = function(options) {

  var svgs = d3.select();
  var selected = [];
  var data = {};

  return {
    register: register,
    clear: clear,
    over: over,
    out: out,
    click: click,
  };

  function register(svg) {
    svgs = svgs.merge(svg);
  }

  function clear() {
    svgs.selectAll(DU.s(C_SELECTION)).classed(C_SELECTION, false);
    U.empty(selected);
  }

  function over(d, i) {
    var control = d3.select(this);
    if (control.classed(C_SELECTION)) {
      control.classed(C_FOCUS_SELECTION, true);
    } else {
      control.classed(C_FOCUS, true);
    }
    if (options.selectPlot) {
      d3.select(this.parentNode).classed(C_FOCUS, true).raise();
    }
  }

  function out(d, i) {
    d3.select(this).classed(DU.a(C_FOCUS, C_FOCUS_SELECTION), false);
    if (options.selectPlot) {
      d3.select(this.parentNode).classed(C_FOCUS, false).lower();
    }
  }

  function click(d, i) {
    if (!U.isIn(this, selected)) {
      selected.push(this);
      d3.select(this).classed(C_SELECTION, true);
      if (options.selectPlot) {
        d3.select(this.parentNode).classed(C_SELECTION, true);
      }
    } else {
      U.removeFrom(this, selected);
      d3.select(this).classed(C_SELECTION, false);
      if (options.selectPlot) {
        var plot = d3.select(this.parentNode);
        if (plot.select(DU.s(C_SELECTION)).empty()) {
          plot.classed(C_SELECTION, false);
        }
      }
    }
    if (options.selected) {
      options.selected(
        U.map(
          U.map(selected, U.pick('__data__')),
          U.pick('payload')
        )
      );
    }
  }

};