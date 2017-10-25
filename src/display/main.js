var U = require('../utility.js');
var DU = require('./utility.js');
var C_DISPLAY = 'desummary';
var C_SVG = 'desummary-svg';
var C_PLOT = 'desummary-plot';
var C_AXIS_X = 'desummary-axis-x';
var C_AXIS_Y = 'desummary-axis-y';
var transform = require('../transform.js');
var axiser = require('./axis.js');
var lines = require('./lines.js');
var bars = require('./bars.js');

module.exports = U.assign(
  axiser,
  {
    _wrap: wrap,
    _wrapMany: wrapMany,
    lineDiagram: lines.lineDiagram,
    barDiagram: bars.barDiagram,
    groupedBarDiagram: bars.groupedBarDiagram,
    stackedBarDiagram: bars.stackedBarDiagram,
  }
);

function wrap(element, draw, select, options) {
  var display = getDisplay(element, options);
  return function (model, n) {
    var size = getSize(display, options);
    var data = transform._apply(getData(model, options), options.transform);
    var axis = axiser._get(data, options);
    var plot = getPlot(display, size, select, options, n, 1);
    draw(plot, size, axis, data, select, options);
    applyAxis(display, size, axis, options);
  };
}

function wrapMany(element, draw, select, options) {
  var display = getDisplay(element, options);
  return function (model, n) {
    var i;
    var size = getSize(display, options);
    var data = transform._apply(getData(model, options), options.transformToMany);
    for (i = 0; i < data.length; i++) {
      data[i] = transform._apply(data[i], options.transform);
    }
    var axis = axiser._get(data, options, true);
    for (i = 0; i < data.length; i++) {
      var plot = getPlot(display, size, select, options, n, i);
      draw(plot, size, axis, data[i], select, options);
    }
    while (removePlot(display, options, n, i)) i++;
    applyAxis(display, size, axis, options);
  };
}

function getData(model, options) {
  return model[options.source || 'data'];
}

function getDisplay(element, options) {
  if (jQuery && element instanceof jQuery) {
    element = element[0];
  }
  element = d3.select(element);
  var display = element.select(DU.s(C_DISPLAY));
  if (!options.combine || display.empty()) {
    display = element.append('div');
  }
  display.classed(DU.a(C_DISPLAY, options.class), true);
  return display;
}

function getSize(element, options) {
  var width = options.width || element.node().offsetWidth;
  var height = options.height || element.node().offsetHeight;
  return {
    width: width,
    height: height,
    inWidth: width - options.marginLeft - options.marginRight,
    inHeight: height - options.marginTop - options.marginBottom,
  };
}

function getPlot(display, size, select, options, n, i) {

  var clsSvg = [C_SVG, options.combineMany ? 1 : i].join('-');
  var svg = display.select(DU.s(clsSvg));
  if (svg.empty()) {
    svg = display.append('svg').attr('class', clsSvg);
    svg.append('g').attr('class', C_AXIS_X);
    svg.append('g').attr('class', C_AXIS_Y);
    select.register(svg);
  }
  svg.attr('width', size.width).attr('height', size.height);

  var clsPlot = [C_PLOT, n, i].join('-');
  var plot = svg.select(DU.s(clsPlot));
  if (plot.empty()) {
    plot = svg.append('g')
      .attr('class', clsPlot)
      .attr('transform', DU.translateMargins(options));
  }
  return plot;
}

function removePlot(display, options, n, i) {

  var clsSvg = [C_SVG, options.combineMany ? 1 : i].join('-');
  var svg = display.select(DU.s(clsSvg));
  if (svg.empty()) return false;
  if (!options.combineMany) {
    svg.remove();
    return true;
  }

  var clsPlot = [C_PLOT, n, i].join('-');
  var plot = svg.select(DU.s(clsPlot));
  if (plot.empty()) return false;
  plot.remove();
  return true;
}

function applyAxis(display, size, axis, options) {
  display.selectAll('svg').each(function() {
    var svg = d3.select(this);
    svg.select(DU.s(C_AXIS_X))
      .attr('transform', DU.translateMargins(options, 0, size.inHeight))
      .call(d3.axisBottom(axis.x.scale));
    svg.select(DU.s(C_AXIS_Y))
      .attr('transform', DU.translateMargins(options))
      .call(d3.axisLeft(axis.y.scale));
  });
}
