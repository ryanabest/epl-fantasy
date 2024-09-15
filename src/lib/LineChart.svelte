<script>
  export let data;
  import d3 from "../js/d3";
  import { colors } from "../js/utils/teams";

  let width; // this will be populated with the width of our chart containers via svelte's bind:clientWidth={w}
  let height; // this will be populated with the height of our chart containers via svelte's bind:clientHeight={w}
  const margin = { top: 30, bottom: 20, left: 30, right: 150 };

  const startDate = data.teams[0].pointsByDate[0].date;
  const endDate = data.teams[0].pointsByDate[data.teams[0].pointsByDate.length - 1].date;

  const maxPts = Math.max(...data.teams.map(d => d.points));

  // scales and line
  $: xScale = d3.scaleUtc([new Date(startDate), new Date(endDate)],[margin.left, width - margin.right - margin.left]);
  $: yScale = d3.scaleLinear([0, maxPts],[height - margin.bottom - margin.top, margin.top]);
  $: line = d3.line()
    .x((d) => xScale(new Date(d.date)))
    .y((d) => yScale(d.points))
    .curve(d3.curveStepAfter);

  let gy;
  $: yAxisFunc = d3.axisLeft(yScale)
    .ticks(6)
    .tickSize(-width + margin.left + margin.right)
    .tickSizeOuter(0)
    .tickPadding(7);

  $: d3.select(gy)
    .call(yAxisFunc)
    .call(g => {
      if (!g.node()) return;
      
      const zeroTick = g.select('g.tick:nth-child(2)');
      const lastTick = g.select('g.tick:last-child');

      lastTick
        .append('text').attr('class', 'pts-bg')
        .attr('x', lastTick.select('text').attr('x'))
        .attr('dy', lastTick.select('text').attr('dy'))
        .attr('dx', '0.5em')
        .attr('text-anchor', 'start')
        .style('stroke', '#ffffff')
        .style('stroke-width', '10px')
        .text('points');

      lastTick
        .append('text').attr('class', 'pts')
        .attr('x', lastTick.select('text').attr('x'))
        .attr('dy', lastTick.select('text').attr('dy'))
        .attr('dx', '0.5em')
        .attr('text-anchor', 'start')
        .text('points');

      zeroTick.classed('zero', true);
    });

  const teamsSorted = data.teams.sort((a, b) => a.points - b.points);
</script>

<div class="chart-cont" bind:clientWidth={width} bind:clientHeight={height}>
  <svg>
    <g class="chart" transform="translate({margin.left},{margin.top})">
      <g class="axis-g" bind:this={gy}></g>
      <g class="line-g">
        {#each teamsSorted as d}
          <g class="team" data-team={d.team}>
            <path stroke="#ffffff" stroke-width="6" d={line(d.pointsByDate)}></path>
            <path stroke={colors[d.team]} stroke-width="4" d={line(d.pointsByDate)}></path>
          </g>
        {/each}
      </g>
      <g class="swoop-g">

      </g>
      <g class="circle-g">
        {#each teamsSorted as d}
          <circle
            id='circle-{d.team}'
          />
        {/each}
      </g>
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

  :global(g.axis-g) {
    :global(path.domain) {
      display: none;
    }

    :global(g.tick) {
      :global(line) {
        stroke: #cdcdcd;
      }

      :global(text) {
        fill: #999797;
        font-size: 14px;
        font-family: Roboto Mono;
      }
    }

    :global(g.tick.zero) {
      :global(line) {
        stroke: #555555;
        stroke-width: 1.5px;
      }
      :global(text) {
        fill: #555555;
      }
    }
  }
</style>