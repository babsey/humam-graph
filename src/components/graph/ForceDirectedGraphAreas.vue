<template>
  <svg ref="svg"></svg>
</template>

<script setup lang="ts">
// https://observablehq.com/@d3/force-directed-graph/2
import * as d3 from 'd3'
import { onMounted, ref } from 'vue'

import { lobeColor } from '@/helpers/theme'
import {
  abbreviation,
  description,
  getArea,
  getLobe,
  type ILink,
  type INode,
} from '@/helpers/parcellation'
import { state } from '@/state'

const svg = ref(null)

// Specify the dimensions of the chart.
const width = 1280
const height = 920

const selectedNodes = ref([])
const keyCode = ref(null)

d3.select('body')
  .on('keydown', (e) => (keyCode.value = e.keyCode))
  .on('keyup', () => (keyCode.value = null))

function linkArc(d: ILink) {
  const r = Math.hypot(d.target.x - d.source.x, d.target.y - d.source.y)
  return `
    M${d.source.x},${d.source.y}
    A${r},${r} 0 0,1 ${d.target.x},${d.target.y}
  `
}

const getLinkOpacity = (link: ILink) => {
  if (selectedNodes.value.length > 0) return selectedNodes.value.includes(link.source.id) ? 1 : 0.1

  return getLobe(link.source.id) == getLobe(link.target.id) ? 1 : 0.1
}

const getNodeTextColor = (node: INode) => {
  return selectedNodes.value.length > 0 && selectedNodes.value.includes(node.id)
    ? 'var(--color-text)'
    : 'var(--color-background)'
}

const toggleSelection = (nodeId: string) => {
  if (selectedNodes.value.includes(nodeId)) {
    selectedNodes.value.splice(selectedNodes.value.indexOf(nodeId), 1)
  } else {
    if (keyCode.value === 17) {
      selectedNodes.value.push(nodeId)
    } else {
      selectedNodes.value = [nodeId]
    }
  }
}

const render = () => {
  const nodeValueMax = d3.max(state.nodes, (d: INode) => d.value) ?? 50
  const linkValueMax = d3.max(state.links, (d: ILink) => d.value) ?? 100

  d3.select('.network').selectAll('g').remove()

  // Create a simulation with several forces.
  const simulation = d3
    .forceSimulation(state.nodes)
    .force(
      'link',
      d3
        .forceLink(state.links)
        .id((d: ILink) => d.id)
        .strength((d: ILink) => (d.value / linkValueMax) * 100),
      // .strength((d) => (d.source.parent == d.target.parent ? 1 : 0.1)),
    )
    .force('charge', d3.forceManyBody().strength(-10000))
    .force('center', d3.forceCenter(width / 2, height / 2))
    .on('tick', ticked)

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
    .style('color', (d: ILink) => lobeColor(d.source.id))
    .attr('marker-end', () => `url(${new URL(`#arrow-E`, location)})`)

  const node = d3
    .select('.network')
    .append('g')
    .selectAll()
    .data(state.nodes)
    .join('g')
    .attr('color', (d: INode) => d.color ?? lobeColor(d.id))

  node
    .append('circle')
    .attr('r', (d: INode) => (d.value / nodeValueMax) * 50)
    .on('click', (_, d: INode) => toggleSelection(d.id))
    .attr('fill', 'currentcolor')
    .append('title')
    .text((d: INode) => description(getArea(d.id)))

  node
    .append('text')
    .attr('fill', 'var(--color-text)')
    .style('text-anchor', 'middle')
    .style('pointer-events', 'none')
    .attr('transform', 'translate(0, 5)')
    .text((d: INode) => abbreviation(getArea(d.id)))

  // Add a drag behavior.
  node.call(d3.drag().on('start', dragstarted).on('drag', dragged).on('end', dragended))

  // Set the position attributes of links and nodes each time the simulation ticks.
  function ticked() {
    link.attr('d', linkArc).style('opacity', (d: ILink) => getLinkOpacity(d))

    node
      .attr('transform', (d: INode) => `translate(${d.x},${d.y})`)
      .selectAll('text')
      .attr('stroke', (d: INode) => getNodeTextColor(d))
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

// watch(() => [state.nodes, state.links], render)
</script>
