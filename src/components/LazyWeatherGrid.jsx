import loadable from "@loadable/component";

const LazyWeatherGrid = loadable(() => import("./WeatherGrid"), {
  fallback: <div>Loading...</div>
});

export default LazyWeatherGrid;
