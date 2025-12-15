import dk from '@/assets/humam/desikan06_parcellation.json'
import type { INode } from '@/state'
export { dk }

export const lobes = ['temporal', 'cingulate', 'frontal', 'occipital', 'parietal', 'insula']
export const areas = Object.keys(dk)
export const layers = ['III/II', 'IV', 'V', 'VI']
export const populations = ['E', 'I']

export const abbreviation = (area: string | undefined) =>
  area && areas.includes(area) ? dk[area].abbreviation : null
export const description = (area: string | undefined) =>
  area && areas.includes(area) ? dk[area].description : null
export const areaId = (area: string | undefined) => (areas.includes(area) ? dk[area].id : null)

export const nameMapping = (id: string, delimiter = '.') => {
  const names = id.split(delimiter)

  return {
    id: id,
    lobe: names[1],
    area: names[2],
    layer: names[3],
    pop: names[4],

    parent: names[names.length - 2],
    name: names[names.length - 1],
  }
}

export const getLobe = (id: string, delimiter = '.'): string => id.split(delimiter)[1] ?? ''
export const getArea = (id: string, delimiter = '.'): string => id.split(delimiter)[2] ?? ''
export const getLayer = (id: string, delimiter = '.'): string => id.split(delimiter)[3] ?? ''
export const getPop = (id: string, delimiter = '.'): string => id.split(delimiter)[4] ?? ''
export const isArea = (id: string, delimiter = '.'): boolean => {
  const names = id.split(delimiter)
  return getArea(id) == names[names.length - 1]
}

const offsetY = {
  'II/III': -100,
  IV: -35,
  V: 30,
  VI: 95,
}

const offsetX = {
  E: -45,
  I: 45,
}

export const addPsitionOffsets = (nodes: INode[]) => {
  nodes.forEach((node: INode) => {
    node.offsetY = offsetY[getLayer(node.id)]
    node.offsetX = offsetX[getPop(node.id)]
  })
}
