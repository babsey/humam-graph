import * as d3 from 'd3'
import { reactive } from 'vue'

import raw_data_areas from '@/assets/humam/humam_network_areas.json'
import raw_data from '@/assets/humam/humam_network_pop.json'

import { hierarchy, id } from './helpers/hierarchy'
import { getArea } from './helpers/parcellation'

export interface INode {
  area?: string
  children?: INode[]
  color?: string
  data?: { name: string }
  id: string
  lobe?: string
  name: string
  offsetX?: number
  offsetY?: number
  outgoing?: [INode, INode][]
  parent?: INode
  value: number
}

export interface ILink {
  id: string
  source: INode | string
  target: INode | string
  value: number
}

const width = 850
const radius = width / 2

export const state = reactive({
  areas: [],
  filterLinksBy: '',
  links: [],
  nodes: [],
  root: d3.hierarchy([]),
})

const filterLinks = (links: ILink[]) => {
  let filteredLinks = [...links]

  if (state.filterLinksBy)
    filteredLinks = filteredLinks.filter(
      (d: ILink) =>
        d.source.includes(state.filterLinksBy) || d.target.includes(state.filterLinksBy),
    )
  return filteredLinks
}

const updateNodeOutgoings = (leaves: INode[], links: ILink[]) => {
  const map = new Map(leaves.map((d) => [id(d), d]))
  for (const n of leaves) {
    n.outgoing = links.filter((l) => l.source.id === id(n)).map((l) => [n, map.get(l.target.id)])
  }
}

export const update = () => {
  state.links = JSON.parse(
    JSON.stringify(
      state.areas.length > 0
        ? raw_data.links.filter(
            (link: ILink) =>
              state.areas.includes(getArea(link.source)) &&
              state.areas.includes(getArea(link.target)),
          )
        : raw_data_areas.links,
    ),
  )

  state.nodes = JSON.parse(
    JSON.stringify(
      state.areas.length > 0
        ? JSON.parse(JSON.stringify(raw_data)).nodes.filter((node) =>
            state.areas.includes(getArea(node.id)),
          )
        : raw_data_areas.nodes,
    ),
  )

  const nodeMap = new Map(state.nodes.map((node: INode) => [node.id, node]))
  state.links.forEach((link: ILink) => {
    link.source = nodeMap.get(link.source)
    link.target = nodeMap.get(link.target)
  })

  const tree = d3.cluster().size([2 * Math.PI, radius - 80])
  const data = hierarchy(state.nodes)
  const nodes = d3.hierarchy(data)
  updateNodeOutgoings(nodes.leaves(), filterLinks(state.links))
  state.root = tree(nodes)
}
