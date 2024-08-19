<script>
  import data from './assets/data.json';
  import Intro from "./lib/Intro.svelte";
  import LineChart from './lib/LineChart.svelte';
</script>

<main>
  <Intro lastUpdated={data.last_updated} />
  <LineChart data={data} />
</main>

<style>
  main {
    margin: auto auto 60px;
    max-width: 1024px;
    padding: 20px;
    width: calc(100% - 40px);
  }
</style>
