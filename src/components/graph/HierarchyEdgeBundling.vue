<template>
  <!-- <select v-model="filterLinksBy" @change="update">
    <option :key="area" :value="area" v-for="area in areaItems">{{ area }}</option>
  </select>

  {{ filterLinksBy }} -->

  <div style="display: flex; justify-content: center">
    <svg id="humam_hierarchy_edge_bundling"></svg>
  </div>
</template>

<script setup lang="ts">
// https://observablehq.com/@d3/hierarchical-edge-bundling
import { onMounted, ref, toRef, watch } from 'vue'
import * as d3 from 'd3'

import { getParent, hierarchy, id } from '@/helpers/hierarchy'
import { useHumamState } from '@/helpers/useHumamState'
import { abbreviation } from '@/helpers/parcellation'
import { color } from '@/helpers/theme'

const { state } = useHumamState()

const props = defineProps<{ nodes: any[]; links: any[] }>()
const nodes = toRef(() => props.nodes.map((d) => ({ ...d })))
const links = toRef(() => props.links.map((d) => ({ ...d })))

const filterLinksBy = ref('')

const width = 850
const radius = width / 2

const filterLinks = (links) => {
  let filteredLinks = [...links]

  if (filterLinksBy.value)
    filteredLinks = filteredLinks.filter(
      (d) => d.source.includes(filterLinksBy.value) || d.target.includes(filterLinksBy.value),
    )
  return filteredLinks
}

const nodeOutgoings = (nodes, links) => {
  const map = new Map(nodes.leaves().map((d) => [id(d), d]))
  for (const n of nodes.leaves()) {
    n.outgoing = links.filter((l) => l.source === id(n)).map((l) => [n, map.get(l.target)])
  }
  return nodes
}

function addArc(ref, data, level = 1, r = 24) {
  const arcInnerRadius = radius - r
  const arcWidth = 2
  const arcOuterRadius = arcInnerRadius + arcWidth
  const arc = d3
    .arc()
    .innerRadius(arcInnerRadius)
    .outerRadius(arcOuterRadius)
    .startAngle((d) => d.start)
    .endAngle((d) => d.end)

  const leafGroups = d3.groups(data, (d) => id(getParent(d, level)))
  const arcAngles = leafGroups.map((g) => ({
    id: g[0],
    name: g[0],
    label: g[0].substring(g[0].lastIndexOf('.') + 1),
    // area: g[0].split(".")[2],
    // layer: g[0].split(".")[3],
    start: d3.min(g[1], (d) => d.x),
    end: d3.max(g[1], (d) => d.x),
  }))

  ref
    .selectAll('.arc')
    .data(arcAngles, (d) => d.id)
    .enter()
    .append('path')
    .attr('id', (_, i) => `arc_${level}_${i}`)
    .attr('data', (d) => d.name)
    .attr('d', (d) => arc(d))
    .attr('fill', (d) =>
      filterLinksBy.value.length === 0 || filterLinksBy.value.includes(d.id)
        ? color(d.id)
        : 'var(--color-text)',
    )
    .attr('stroke', 'rgba(0,0,0,0)')
    .attr('stroke-width', '20px')
    .on('click', (_, d) => {
      filterLinksBy.value = filterLinksBy.value != d.id ? d.id : ''
      update()
    })

  ref
    .selectAll('.arcLabel')
    .data(arcAngles, (d) => d.id)
    .enter()
    .append('text')
    .attr('fill', 'var(--color-text)')
    .attr('x', 5) //Move the text from the start angle of the arc
    .attr('dy', -5) //Move the text down
    .style('pointer-events', 'none')
    .append('textPath')
    .style('font-size', '1.6em')
    .attr('class', 'arcLabel')
    .attr('xlink:href', (_, i) => `#arc_${level}_${i}`)
    .text((d) => (d.end - d.start < (1 * Math.PI) / 180 ? '' : d.label)) // 6 degrees min arc length for label to apply

  return leafGroups
}

const update = () => {
  if (!nodes.value || !links.value) return
  const selectedAreas = state.areas.length > 0

  const data = hierarchy(nodes.value)
  const tree = d3.cluster().size([2 * Math.PI, radius - 80])
  const root = tree(nodeOutgoings(d3.hierarchy(data), filterLinks(links.value)))

  const svg = d3
    .select('#humam_hierarchy_edge_bundling')
    .attr('width', width)
    .attr('height', width)
    .attr('viewBox', [-width / 2, -width / 2, width, width])
    .attr('style', 'max-width: 100%; height: auto; font: 10px sans-serif;')

  svg.selectAll('g').remove()

  const arcs = svg.append('g')
  let leafGroups
  if (selectedAreas) {
    addArc(arcs, root.leaves(), 1, 60)
    leafGroups = addArc(arcs, root.leaves(), 2, 30)
  } else {
    leafGroups = addArc(arcs, root.leaves(), 1, 30)
  }
  svg
    .append('g')
    .selectAll()
    .data(root.leaves())
    .join('g')
    .attr('class', 'node')
    .attr('transform', (d) => `rotate(${(d.x * 180) / Math.PI - 90}) translate(${d.y},0)`)
    .append('text')
    // .on("click", (_, d) => {
    //   filterLinksBy.value = filterLinksBy.value != id(d) ? id(d) : "";
    //   update();
    // })
    .attr('dy', '0.31em')
    .attr('x', (d) => (d.x < Math.PI ? 2 : -2))
    .attr('font-size', '1.4em')
    // .attr("fill", "var(--color-text)")
    .attr('fill', (d) => color(id(d)))
    .attr('text-anchor', (d) => (d.x < Math.PI ? 'start' : 'end'))
    .attr('transform', (d) => (d.x >= Math.PI ? 'rotate(180)' : null))
    .style('cursor', 'pointer')
    .text((d) => abbreviation(d.data.name) ?? d.data.name)
    .each(function (d) {
      d.text = this
    })
    .on('mouseover', overed)
    .on('mouseout', outed)
    // .call((text) => text.append("title").text((d) => `${dk[d.data.name].description}`));
    .call((text) => text.append('title').text((d) => `${id(d)}`))

  const line = d3
    .lineRadial()
    .curve(d3.curveBundle.beta(0.8))
    .radius((d) => d.y)
    .angle((d) => d.x)

  const k = 6 // 2^k colors segments per curve

  svg
    .append('g')
    .attr('class', 'link')
    .attr('stroke', 'var(--color-text)')
    .attr('fill', 'none')
    .selectAll()
    .data(root.leaves().flatMap((d) => d.outgoing))
    .join('path')
    .style('opacity', 0.3)
    .attr('stroke', (d) => color(id(d[0])))
    // .style("mix-blend-mode", "multiply")
    .attr('d', ([i, o]) => line(i.path(o)))
    .each(function (d) {
      d.path = this
    })

  function overed(_, d) {
    // links
    svg
      .selectAll('.link')
      .selectAll('path')
      .attr('stroke', 'var(--color-text)')
      .style('opacity', 0.05)

    d3.selectAll(d.outgoing.map((d) => d.path))
      .style('opacity', 1)
      .attr('stroke', color(id(d)))
      .raise()

    // nodes
    d3.selectAll(root.leaves().map((d) => d.text)).attr('fill', 'var(--color-text)')
    d3.selectAll(d.outgoing.map(([, d]) => d.text))
      .attr('fill', (d) => color(id(d)))
      .attr('font-weight', 'bold')

    // focused node
    d3.select(this)
      .attr('font-weight', 'bold')
      .attr('fill', (d) => color(id(d)))
  }

  function outed(_, d) {
    // links
    // link.style("mix-blend-mode", "multiply");
    svg
      .selectAll('.link')
      .selectAll('path')
      .style('opacity', 0.3)
      .attr('stroke', (d) => color(id(d[0])))
    // d3.selectAll(d.outgoing.map((d) => d.path)).attr("stroke", (d) => color(id(d[0])));

    // nodes
    d3.selectAll(root.leaves().map((d) => d.text))
      // .attr("fill", "var(--color-text)")
      .attr('fill', (d) => color(id(d)))
      .attr('font-weight', null)
  }
}

onMounted(update)

watch(
  () => [props.nodes, props.links],
  () => {
    filterLinksBy.value = ''
    update()
  },
)
</script>
