import * as d3 from 'd3'

import { lobes, layers, areas, getPop, getLayer, getArea, getLobe } from './parcellation'

// Specify the color scale.
const color1 = d3.scaleOrdinal(d3.schemeTableau10)
const color2 = d3.scaleOrdinal(d3.schemePaired)
const color3 = d3.scaleOrdinal(d3.schemePiYG[4])

export const colorExc = '#377eb8'
export const colorInh = '#e41a1c'

export const lobeColor = (id: string) => {
  const lobe = getLobe(id)
  return lobe ? color1(lobes.indexOf(lobe)) : 'var(--color-text)'
}

export const areaColor = (id: string) => {
  const area = getArea(id)
  return area ? color2(areas.indexOf(area)) : 'var(--color-text)'
}

export const layerColor = (id: string) => {
  const layer = getLayer(id)
  return layer ? color3(layers.indexOf(layer)) : 'var(--color-text)'
}

export const popColor = (id: string) => {
  const pop = getPop(id)
  return { E: colorExc, I: colorInh }[pop]
}

export const color = (id: string) => {
  const names = id.split('.')
  if (names.length === 5) return popColor(id)
  else if (names.length === 4) return layerColor(id)
  else if (names.length === 3) return areaColor(id)
  else if (names.length === 2) return lobeColor(id)
}
