<script>
  export let teams;
  import { formatNum } from "../js/utils/format";
  const teamsSorted = teams.sort((a, b) => b.points - a.points);

  const handleTeamClick = (e) => {
    const parent = e.target.parentNode;
    parent.classList.toggle('no-margin-bottom');
    const table = parent.querySelector('.table-cont');
    if (!table.style.maxHeight) {
      table.style.maxHeight = 0;
    } else if (table.style.maxHeight && table.style.maxHeight !== '0px') {
      table.style.maxHeight = 0;
    } else {
      table.style.maxHeight = table.scrollHeight + 'px';
    }
  }
</script>


{#each teamsSorted as team}
  <div class="team">
    <button class=h2 on:click={(e) => handleTeamClick(e)}>
      <span>{team.team}</span>
      <span class="points">{team.points} point{team.points === 1 ? '' : 's'}</span>
    </button>
    <div class="table-cont">
      <table>
        <tbody>
          <tr>
            <th class=player>&nbsp;</th>
            <th class=team>&nbsp;</th>
            <th class=goals>G</th>
            <th class=assists>A</th>
            <th class=own_goals>OG</th>
            <th class=points>Pts</th>
          </tr>
          {#each team.players.sort((a, b) => b.stats.points - a.stats.points) as player}
            <tr>
              <td class=player>
                {player.playerName}
                <span class=pos>#{player.jersey}</span>
              </td>
              <td class=team>{player.playerTeam}</td>
              <td class=goals>{formatNum(player.stats.goals)}</td>
              <td class=assists>{formatNum(player.stats.assists)}</td>
              <td class=own_goals>{formatNum(player.stats.own_goals)}</td>
              <td class=points>{formatNum(player.stats.points)}</td>
            </tr>
          {/each}
          <tr class=total>
            <td class=player>&nbsp;</td>
            <td class=team>&nbsp;</td>
            <td class=goals>{formatNum(team.players.map(d => d.stats.goals).reduce((a, b) => a + b))}</td>
            <td class=assists>{formatNum(team.players.map(d => d.stats.assists).reduce((a, b) => a + b))}</td>
            <td class=own_goals>{formatNum(team.players.map(d => d.stats.own_goals).reduce((a, b) => a + b))}</td>
            <td class=points>{formatNum(team.players.map(d => d.stats.points).reduce((a, b) => a + b))}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
{/each}

<style lang="scss">
  @import '../style/partials/variables';

  .team {
    margin: 0px auto 50px auto;
    max-width: 700px;
    position: relative;
    &:global(.no-margin-bottom) {
      margin-bottom: 25px;
    }
    button.h2 {
      background: none;
      color: inherit;
      border: none;
      padding: 0;
      font: inherit;
      cursor: pointer;
      outline: inherit;

      font-weight: 700;
      margin-bottom: 5px;
      span {
        pointer-events: none;
        background-image: linear-gradient(to top, $gray-dark-background 45%, rgba(0,0,0,0) 40%);
        font-family: $sans;
        font-size: 24px;
        margin-bottom: 5px;
        &.points {
          font-family: $mono;
          color: $gray-text;
          font-size: 20px;
          margin-left: 5px;
        }
        &.trophy {
          position: absolute;
          margin-left: 5px;
          top: -4px;
          font-size: 32px;
          background-image: none;
        }
      }
    }
  }

  .table-cont {
    max-height: 500px;
    overflow: hidden;
    transition: max-height 0.2s ease-out;
    @media screen and (max-width: $M) {
      overflow-x: scroll;
      max-height: 1000px;
    }
  }

  table {
    width: 100%;
    margin: auto;
    @media screen and (max-width: $M) {
      &.with-ih {
        width: calc(100% + 25px);
      }
    }
    tr {
      th {
        font-family: $sans;
        font-size: 12px;
        font-weight: 700;
        text-align: center;
        height: 15px;
        &.in_hand {
          border-left: 1px dotted $black;
          @media screen and (max-width: $M) {
            border-left: none;
          }
        }
      }
      td {
        text-wrap: balance;
        vertical-align: middle;
        padding: 5px;
        font-size: 16px;
        font-family: $sans;
        @media screen and (max-width: $M) {
          font-size: 15px;
        }
        &.in_hand {
          border-left: 1px dotted $black;
          @media screen and (max-width: $M) {
            border-left: none;
          }
        }
        &.goals, &.assists, &.points, &.own_goals, &.in_hand {
          text-align: center;
          width: 50px;
          @media screen and (max-width: $M) {
            width: 25px;
          }
        }
        &.points {
          font-weight: 700;
          background: $gray-background;
        }
        span.pos {
          color: $gray-text;
          font-family: $mono;
          font-weight: 700;
          font-size: 12px;
          @media screen and (max-width: $M) {
            font-size: 10px;
          }
        }

        span.thru {
          text-decoration: line-through;
        }
      }
      &:not(:last-child) {
        td {
          border-bottom: 1px dotted $gray-grid;
        }
      }
      &.blank {
        line-height: 0.05;
        td {
          border-bottom: none;
        }
      }
      &.inactive-title-row {
        td.inactive-title {
          font-weight: 700;
        }
      }
    }
  }
</style>