<template>
  <svg ref="svg"></svg>
</template>

<script setup lang="ts">
// https://observablehq.com/@d3/force-directed-graph/2
import * as d3 from 'd3'
import { onMounted, ref } from 'vue'

import { areaColor, colorExc, colorInh } from '@/helpers/theme'
import { abbreviation, addPsitionOffsets, getArea, getLobe, layers } from '@/helpers/parcellation'
import { state, type ILink, type INode } from '@/state'
import { watch } from 'vue'

const svg = ref(null)

// Specify the dimensions of the chart.
const width = 1280
const height = 920

const linkArc = (d: d3.Selection) => {
  const x1 = d.source.parent.x + d.source.offsetX
  const y1 = d.source.parent.y + d.source.offsetY
  const x2 = d.target.parent.x + d.target.offsetX
  const y2 = d.target.parent.y + d.target.offsetY

  if ([x1, y1, x2, y2].some((v) => isNaN(v))) return ''

  const r = Math.hypot(x2 - x1, y2 - y1)
  return `
    M${x1},${y1}
    A${r},${r} 0 0,1 ${x2},${y2}
  `
}

const addPop = (d: d3.Selection, popType: string) => {
  const pop = d.append('g').attr('transform', `translate(${popType === 'I' ? 45 : -45}, 2)`)
  let text

  if (popType === 'E') {
    pop
      .append('path')
      .attr('d', d3.symbol(d3.symbolTriangle2))
      .attr('transform', `translate(0, 7) scale(5)`)
      .attr('fill', 'white')
      .attr('stroke', colorExc)
    text = pop.append('text').attr('transform', 'translate(-4, 12)')
  } else {
    pop
      .append('path')
      .attr('d', d3.symbol(d3.symbolCircle2))
      .attr('transform', `scale(5)`)
      .attr('fill', 'white')
      .attr('stroke', colorInh)
    text = pop.append('text').text(popType).attr('transform', 'translate(-2, 8)')
  }

  text.attr('font-size', '1.2em').text(popType)
}

const addLayers = function (d: d3.Selection) {
  for (const idx in layers) {
    const layer = d.append('g').attr('transform', `translate(0, ${-100 + idx * 65})`)

    layer
      .append('rect')
      .attr('rx', 6)
      .attr('ry', 6)
      .attr('width', 180)
      .attr('height', 60)
      .attr('fill', 'white')
      .attr('transform', 'translate(-90, -30)')

    layer
      .append('text')
      .attr('transform', `translate(-85, -13)`)
      .attr('fill', 'black')
      .text(layers[idx])

    addPop(layer, 'E')
    addPop(layer, 'I')
  }
}

const render = () => {
  addPsitionOffsets(state.nodes)

  const areaGroup = d3.group(state.nodes, (d: INode) =>
    ['cortex', getLobe(d.id), getArea(d.id)].join('.'),
  )

  const areaNodes = Array.from(areaGroup).map(([id, children]: [string, INode[]]) => {
    const value = d3.sum(children.map((c) => c.value))
    const data = { children, value, id }
    children.forEach((child) => {
      child.parent = data
    })
    return data
  })

  const areaLinkGroups = d3.flatGroup(
    state.links,
    (d: ILink) => ['cortex', getLobe(d.source.id), getArea(d.source.id)].join('.'),
    (d: ILink) => ['cortex', getLobe(d.target.id), getArea(d.target.id)].join('.'),
  )

  const areaLinks = areaLinkGroups.map(([source, target, children]: [string, string, INode[]]) => ({
    source,
    target,
    children,
  }))

  d3.select('.network').selectAll('g').remove()

  // Create a simulation with several forces.
  const simulation = d3
    .forceSimulation(areaNodes)
    .force(
      'link',
      d3
        .forceLink(areaLinks)
        .id((d: ILink) => d.id)
        .strength(0.03),
    )
    .force('charge', d3.forceManyBody().strength(-3000))
    .force('center', d3.forceCenter(width / 2, height / 2))
    .on('tick', ticked)

  const node = d3
    .select('.network')
    .append('g')
    .selectAll()
    .data(areaNodes)
    .join('g')
    .attr('color', (d: INode) => areaColor(d.id))

  node
    .append('rect')
    .attr('rx', 6)
    .attr('ry', 6)
    .attr('width', 200) // d.value / 2)
    .attr('height', 300) // d.value / 2)
    .attr('transform', 'translate(-100, -170)')
    // .on("click", (_, d) => toggleSelection(d.name))
    .attr('fill', 'currentcolor')
    .attr('stroke', 'currentcolor')
    .attr('stroke-width', 3.5)
    .append('title')
    .text((d: INode) => d.name)

  // Add a line for each link, and a circle for each node.
  const link = d3
    .select('.network')
    .append('g')
    .attr('fill', 'none')
    .attr('stroke', 'currentcolor')
    .attr('stroke-width', 3.5)
    .selectAll('path')
    .data(state.links)
    .join('path')
    .style('opacity', 0.2)
    .style('pointer-events', 'none')
    .style('color', (d: ILink) => areaColor(d.source.parent.id))
  // .attr("marker-end", () => `url(${new URL(`#arrow-E`, location)})`);

  node
    .append('text')
    .attr('fill', 'var(--color-background)')
    .attr('font-weight', 'bold')
    .style('text-anchor', 'middle')
    .style('pointer-events', 'none')
    .attr('transform', 'translate(0, -150)')
    .text((d: INode) => `${getArea(d.id)} [${abbreviation(getArea(d.id))}]`)

  node.call(addLayers)

  // Add a drag behavior.
  node.call(d3.drag().on('start', dragstarted).on('drag', dragged).on('end', dragended))

  // Set the position attributes of links and nodes each time the simulation ticks.
  function ticked() {
    link.attr('d', linkArc)

    node.attr('transform', (d: INode) => `translate(${d.x},${d.y})`).selectAll('text')
  }

  // Reheat the simulation when drag starts, and fix the subject position.
  function dragstarted(event: MouseEvent) {
    if (!event.active) simulation.alphaTarget(0.3).restart()
    event.subject.fx = event.subject.x
    event.subject.fy = event.subject.y
  }

  // Update the subject (dragged node) position during drag.
  function dragged(event: MouseEvent) {
    event.subject.fx = event.x
    event.subject.fy = event.y
  }

  // Restore the target alpha so the simulation cools after dragging ends.
  // Unfix the subject position now that it’s no longer being dragged.
  function dragended(event: MouseEvent) {
    if (!event.active) simulation.alphaTarget(0)
    event.subject.fx = null
    event.subject.fy = null
  }
}

onMounted(() => {
  // Create the SVG container.
  d3.select(svg.value)
    .attr('width', width)
    .attr('height', height)
    .attr('viewBox', [0, 0, width, height])
    .attr('style', 'max-width: 100%; height: auto;')

  d3.select(svg.value)
    .append('defs')
    .selectAll('marker')
    .data(['E'])
    .join('marker')
    .attr('id', (d: string) => `arrow-${d}`)
    .attr('viewBox', '0 -5 10 10')
    .attr('refX', 15)
    .attr('refY', -0.5)
    .attr('markerWidth', 6)
    .attr('markerHeight', 6)
    .attr('orient', 'auto')
    .append('path')
    .attr('fill', 'currentcolor')
    .attr('d', 'M0,-3L10,0L0,3')

  d3.select(svg.value).append('g').attr('class', 'network')

  render()
})

watch(() => [state.nodes, state.links], render)
</script>
