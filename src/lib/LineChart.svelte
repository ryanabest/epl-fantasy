<script>
  export let data;
  import d3 from "../js/d3";
  import { colors } from "../js/utils/teams";
  import { slugify } from "../js/utils/format";

  let width; // this will be populated with the width of our chart containers via svelte's bind:clientWidth={w}
  let height; // this will be populated with the height of our chart containers via svelte's bind:clientHeight={w}
  const margin = { top: 30, bottom: 20, left: 30, right: 100 };

  const startDate = data.teams[0].pointsByDate[0].date;
  const endDate = data.teams[0].pointsByDate[data.teams[0].pointsByDate.length - 1].date;

  const maxPts = Math.max(...data.teams.map(d => d.points));

  const strokeWidth = 4;

  // ~~ LINE SCALES ~~ //
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

  // ~~ CIRCLE PARAMS ~~ //
  const radius = 25;
  const swoopyWidth = 25;

  // ~~ SWOOPY DATA ~~ //
  $: _genSwoopyData = (team, i) => {
    const swoopyData = [];
    const d = team.pointsByDate[team.pointsByDate.length - 1];
    if (!xScale || !yScale) return [];
    const leftX = xScale(new Date(d.date))
    const leftY = yScale(d.points);
    const rightX = width - margin.right - margin.left + swoopyWidth
    const rightY = radius + (((radius + (strokeWidth / 2)) * 2) * (data.teams.length - i - 1));
    const xDiff = rightX - leftX;
    const yDiff = rightY - leftY;

    for (let i = -6; i < 6; i++) {
      const sigY = leftY + (sigmoid(i) * yDiff);
      const sigX = leftX + (((i + 6) / 11) * xDiff);
      swoopyData.push({ x: sigX, y: sigY });
    }

    function sigmoid (t) {
      return 1 / (1 + Math.pow(Math.E, -t));
    }
    
    return swoopyData;
  }

  $: swoopyLine = d3.line()
    .x(d => d.x)
    .y(d => d.y);

  $: teamsSorted = data.teams
    .sort((a, b) => a.points - b.points)
    .map((team, i) => {
      const swoopyData = _genSwoopyData(team, i);
      return { ...team, swoopyData }
    });
</script>

<div class="chart-cont" bind:clientWidth={width} bind:clientHeight={height}>
  <svg>
    <g class="chart" transform="translate({margin.left},{margin.top})">
      <g class="axis-g" bind:this={gy}></g>
      <g class="swoop-g">
        {#each teamsSorted as d}
          <path d={swoopyLine(d.swoopyData)} stroke={colors[d.team]} stroke-width=1 stroke-linecap="round" stroke-dasharray="0 2"></path>
        {/each}
      </g>
      <g class="line-g">
        {#each teamsSorted as d}
          <g class="team" data-team={d.team}>
            <path stroke="#ffffff" stroke-width={strokeWidth * 1.5} d={line(d.pointsByDate)}></path>
            <path stroke={colors[d.team]} stroke-width={strokeWidth} d={line(d.pointsByDate)}></path>
          </g>
        {/each}
      </g>
      <g class="circle-g">
        {#each teamsSorted as d, i}
          <circle
            id='circle-{slugify(d.team)}'
            r={radius}
            cy={radius + (((radius + (strokeWidth / 2)) * 2) * (teamsSorted.length - i - 1))}
            cx={width - margin.right - margin.left + radius + swoopyWidth}
            stroke={colors[d.team]}
            stroke-width={strokeWidth}
            fill="url(#pattern-{slugify(d.team)})"
          />
        {/each}
        <!-- cy={(radius * 2) * (teamsSorted.length - i - 1)} -->
      </g>
    </g>
    <defs>
      {#each teamsSorted as d}
        <pattern id="pattern-{slugify(d.team)}" height=100% width=100% patternContentUnits="objectBoundingBox">
          <image x="0" y="0" height=1 width=1 preserveAspectRatio="xMidYMid slice" xlink:href="{slugify(d.team)}.png" />
        </pattern>
      {/each}
    </defs>
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