<script>
  export let lastUpdated;
  export let year;
  import dayjs from 'dayjs';
  const date = dayjs(lastUpdated).format("MMM D, YYYY")
  const time = dayjs(lastUpdated).format("h:mm A")
</script>

<div id="intro">
  <h1>The Athletic’s {year} Fantasy&nbsp;EPL</h1>
  <p class="timestamp">Updated {date}, at {time}</p>
</div>

<style lang="scss">
  @use '../style/partials/variables';
  
  #intro {
    text-align: center;
    margin: 30px auto;

    p.timestamp {
      font-family: variables.$mono;
      color: variables.$gray-text;
      text-transform: uppercase;
      font-size: 14px;
      letter-spacing: 0.5px;
      margin: 0;
    }

    h1 {
      font-family: variables.$sans;
      font-size: 40px;
      line-height: 1.27;
      color: variables.$black;
      margin: 15px auto;
    }
  }
</style>