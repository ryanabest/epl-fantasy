import { line, curveStepAfter, area } from 'd3-shape';
import { scaleLinear, scaleUtc } from 'd3-scale';
import { axisLeft, axisBottom } from 'd3-axis';
import { select } from 'd3-selection';
import { timeFormat } from 'd3-time-format';
import { timeMonth } from 'd3-time';

export default {
  area,
  axisLeft,
  axisBottom,
  curveStepAfter,
  line,
  scaleLinear,
  scaleUtc,
  select,
  timeFormat,
  timeMonth,
}