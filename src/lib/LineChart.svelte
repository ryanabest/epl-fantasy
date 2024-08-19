<script>
  export let data;
  import d3 from "../js/d3";
  import { colors } from "../js/utils/teams";

  let width; // this will be populated with the width of our chart containers via svelte's bind:clientWidth={w}
  let height; // this will be populated with the height of our chart containers via svelte's bind:clientHeight={w}
  const margin = { top: 30, bottom: 20, left: 30, right: 150 };

  const startDate = data.teams[0].pointsByDate[0].date;
  const endDate = data.teams[0].pointsByDate[data.teams[0].pointsByDate.length - 1].date;

  const maxPts = data.teams.map(d => d.points).sort()[data.teams.length - 1];

  // scales and line
  $: xScale = d3.scaleUtc([new Date(startDate), new Date(endDate)],[margin.left, width - margin.right - margin.left]);
  $: yScale = d3.scaleLinear([0, maxPts],[height - margin.bottom - margin.top, margin.top]);
  $: line = d3.line()
    .x((d) => xScale(new Date(d.date)))
    .y((d) => yScale(d.points))
    .curve(d3.curveStepAfter);

  const teamsSorted = data.teams.sort((a, b) => a.points - b.points)
</script>

<div class="chart-cont" bind:clientWidth={width} bind:clientHeight={height}>
  <svg>
    <g class="chart" transform="translate({margin.left},{margin.top})">
      {#each teamsSorted as team}
        <g class="team" data-team={team.team}>
          <path stroke={colors[team.team]} stroke-width="4" d={line(team.pointsByDate)}></path>
        </g>
      {/each}
    </g>
  </svg>
</div>

<style lang="scss">
  .chart-cont {
    width: 100%;
    height: 500px;
    
    svg {
      width: 100%;
      height: 100%;
      overflow: visible;

      path {
        fill: none;
      }
    }
  }
</style>