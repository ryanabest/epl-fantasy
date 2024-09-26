<script>
  export let team;
  export let maxPts;
  import d3 from "../js/d3";
  import { colors } from "../js/utils/teams";

  let width; // this will be populated with the width of our chart containers via svelte's bind:clientWidth={w}
  let height; // this will be populated with the height of our chart containers via svelte's bind:clientHeight={w}
  const margin = { top: 0, bottom: 0, left: 0, right: 0 };

  const startDate = team.pointsByDate[0].date;
  const endDate = team.pointsByDate[team.pointsByDate.length - 1].date;
  $: xScale = d3.scaleUtc([new Date(startDate), new Date(endDate)],[margin.left, width - margin.right - margin.left]);
  $: yScale = d3.scaleLinear([0, maxPts],[height - margin.bottom - margin.top, margin.top]);
  $: line = d3.line()
    .x((d) => xScale(new Date(d.date)))
    .y((d) => yScale(d.points))
    .curve(d3.curveStepAfter);

  $: area = d3.area()
      .x((d) => xScale(new Date(d.date)))
      .y0((d) => yScale(0))
      .y1((d) => yScale(d.points))
      .curve(d3.curveStepAfter);

</script>

<div class="sparkline chart-cont"  bind:clientWidth={width} bind:clientHeight={height}>
  <svg>
    <g class="chart" transform="translate({margin.left},{margin.top})">
      <path fill={colors[team.team]} d={area(team.pointsByDate)} opacity=0.4></path>
      <path stroke=#ffffff fill=none stroke-width=5px d={line(team.pointsByDate)}></path>
      <path stroke={colors[team.team]} fill=none stroke-width=3px d={line(team.pointsByDate)}></path>
    </g>
  </svg>
</div>

<style lang="scss">
  @import '../style/partials/variables';

  .sparkline {
    height: 50px;
    width: 40%;
    position: absolute;
    right: 0;
    top: 20px;
    transform: translateY(-100%);
    @media screen and (max-width: $M) {
      width: 50px;
    }
    svg {
      background: $gray-dark-background;
      overflow: visible;
      width: 100%;
      height: 100%;
      path.points-area {
        stroke-width: 0px;
        stroke: $black;
      }

      path.points-line {
        stroke-width: 3px;
        fill: none;
      }
    }
  }
</style>