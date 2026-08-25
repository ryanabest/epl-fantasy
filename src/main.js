import { mount } from 'svelte';
import './style/app.scss';
import App from './App.svelte';
import data2024 from './assets/2024/data.json';
import data2025 from './assets/2025/data.json';
import data2026 from './assets/2026/data.json';

const targetEl = document.getElementById('app');
const year = targetEl.dataset.year;
const allData = { '2024': data2024, '2025': data2025, '2026': data2026 };

const app = mount(App, {
  target: targetEl,
  props: { data: allData[year], year }
});

export default app;
