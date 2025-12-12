import dk from '@/assets/humam/desikan06_parcellation.json'

export { dk }

export const lobes = ['temporal', 'cingulate', 'frontal', 'occipital', 'parietal', 'insula']
export const areas = Object.keys(dk)
export const layers = ['III/II', 'IV', 'V', 'VI']
export const populations = ['E', 'I']

export const abbreviation = (area: string) => (areas.includes(area) ? dk[area].abbreviation : null)
export const description = (area: string) => (areas.includes(area) ? dk[area].description : null)
export const id = (area: string) => (areas.includes(area) ? dk[area].id : null)

export const nameMapping = (name: string, delimiter = '.') => {
  const names = name.split(delimiter)

  const data = {
    id: name,
    lobe: names[1],
    area: names[2],
    layer: names[3],
    pop: names[4],

    parent: names[names.length - 2],
    name: names[names.length - 1],
  }

  //   if (data.name == data.area) {
  //     data.label = dk[data.area].abbreviation;
  //     data.title = dk[data.area].description;
  //   }

  return data
}
