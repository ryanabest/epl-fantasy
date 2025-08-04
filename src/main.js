import './style/app.scss';
import App from './App.svelte';
import data2024 from './assets/2024/data.json';
import data2025 from './assets/2025/data.json';

const targetEl = document.getElementById('app');
const year = targetEl.dataset.year;
const allData = { '2024': data2024, '2025': data2025 };

const app = new App({
  target: targetEl,
  props: { data: allData[year], year }
});

export default app;
