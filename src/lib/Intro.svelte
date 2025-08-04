<script>
  export let lastUpdated;
  export let year;
  import dayjs from 'dayjs';
  const date = dayjs(lastUpdated).format("MMM D, YYYY")
  const time = dayjs(lastUpdated).format("h:mm A")
</script>

<div id="intro">
  <h1>The Athletic's {year} Fantasy&nbsp;EPL</h1>
  <p class="timestamp">Updated {date}, at {time}</p>
</div>

<style lang="scss">
  @import '../style/partials/variables';
  
  #intro {
    text-align: center;
    margin: 30px auto;

    p.timestamp {
      font-family: $mono;
      color: $gray-text;
      text-transform: uppercase;
      font-size: 14px;
      letter-spacing: 0.5px;
      margin: 0;
    }

    h1 {
      font-family: $sans;
      font-size: 40px;
      line-height: 1.27;
      color: $black;
      margin: 15px auto;
    }
  }
</style>