import * as d3 from "d3";

import { lobes, layers, areas } from "./parcellation";

// Specify the color scale.
const color1 = d3.scaleOrdinal(d3.schemeTableau10);
const color2 = d3.scaleOrdinal(d3.schemePaired);
const color3 = d3.scaleOrdinal(d3.schemePiYG[4]);

export const lobeColor = (name: string) => {
  const lobe = name.split(".")[1];
  return color1(lobes.indexOf(lobe));
};

export const areaColor = (name: string) => {
  const area = name.split(".")[2];
  return color2(areas.indexOf(area));
};

export const layerColor = (name: string) => {
  const layer = name.split(".")[3];
  return color3(layers.indexOf(layer));
};

export const colorExc = "#377eb8";
export const colorInh = "#e41a1c";

export const popColor = (name: string) => {
  const pop = name.split(".")[4];
  return { E: colorExc, I: colorInh }[pop];
};

export const color = (name: string) => {
  const names = name.split(".");
  if (names.length === 5) return popColor(name);
  else if (names.length === 4) return layerColor(name);
  else if (names.length === 3) return areaColor(name);
  else if (names.length === 2) return lobeColor(name);
};
