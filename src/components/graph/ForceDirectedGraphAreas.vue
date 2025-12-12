<template>
  <svg ref="svg"></svg>
</template>

<script setup lang="ts">
// https://observablehq.com/@d3/force-directed-graph/2
import * as d3 from "d3";
import { onMounted, ref, watch } from "vue";

import { lobeColor } from "@/helpers/theme";
import { abbreviation, description, nameMapping } from "@/helpers/parcellation";

const props = defineProps<{ nodes: any[]; links: any[] }>();
// The force simulation mutates links and nodes, so create a copy
// so that re-evaluating this cell produces the same result.
const nodes = ref([]);
const links = ref([]);

const svg = ref(null);

// Specify the dimensions of the chart.
const width = 1280;
const height = 920;

var selectedArea = ref(null);
var selectedNodes = ref([]);

function linkArc(d) {
  const r = Math.hypot(d.target.x - d.source.x, d.target.y - d.source.y);
  return `
    M${d.source.x},${d.source.y}
    A${r},${r} 0 0,1 ${d.target.x},${d.target.y}
  `;
}

const getLinkOpacity = (link) => {
  if (selectedNodes.value.length > 0) return selectedNodes.value.includes(link.source.name) ? 1 : 0.1;

  return link.source.lobe == link.target.lobe ? 1 : 0.1;
};

const getNodeTextColor = (node) => {
  return selectedNodes.value.length > 0 && selectedNodes.value.includes(node.name)
    ? "var(--color-text)"
    : "var(--color-background)";
};

const toggleSelection = (nodeId) => {
  if (selectedNodes.value.includes(nodeId)) {
    selectedNodes.value.splice(selectedNodes.value.indexOf(nodeId), 1);
  } else {
    selectedArea.value = nodeId;
    selectedNodes.value.push(nodeId);
  }
};

const update = () => {
  nodes.value = props.nodes.map((d) => ({ ...d, ...nameMapping(d.name) }));
  links.value = props.links.map((d) => ({ ...d }));

  console.log(nodes, links)

  d3.select(".network").selectAll("g").remove();

  // Create a simulation with several forces.
  const simulation = d3
    .forceSimulation(nodes.value)
    .force(
      "link",
      d3
        .forceLink(links.value)
        .id((d) => d.id)
        .strength((d) => (d.source.parent == d.target.parent ? 1 : 0.1))
    )
    .force("charge", d3.forceManyBody().strength(-3000))
    .force("center", d3.forceCenter(width / 2, height / 2))
    .on("tick", ticked);

  // Add a line for each link, and a circle for each node.
  const link = d3
    .select(".network")
    .append("g")
    .attr("fill", "none")
    .attr("stroke", "currentcolor")
    .attr("stroke-width", 3.5)
    .selectAll("path")
    .data(links.value)
    .join("path")
    .style("color", (d) => lobeColor(d.source.id))
    .attr("marker-end", () => `url(${new URL(`#arrow-E`, location)})`);

  const node = d3
    .select(".network")
    .append("g")
    .selectAll()
    .data(nodes.value)
    .join("g")
    .attr("color", (d) => d.color ?? lobeColor(d.id));

  node
    .append("circle")
    .attr("r", 25) // d.value / 2)
    .on("click", (_, d) => toggleSelection(d.name))
    .attr("fill", "currentcolor")
    .append("title")
    .text((d) => description(d.area));

  node
    .append("text")
    .attr("fill", "var(--color-text)")
    .style("text-anchor", "middle")
    .style("pointer-events", "none")
    .attr("transform", "translate(0, 5)")
    .text((d) => abbreviation(d.area));

  // Add a drag behavior.
  node.call(d3.drag().on("start", dragstarted).on("drag", dragged).on("end", dragended));

  // Set the position attributes of links and nodes each time the simulation ticks.
  function ticked() {
    link.attr("d", linkArc).style("opacity", (d) => getLinkOpacity(d));

    node
      .attr("transform", (d) => `translate(${d.x},${d.y})`)
      .selectAll("text")
      .attr("stroke", (d) => getNodeTextColor(d));
  }

  // Reheat the simulation when drag starts, and fix the subject position.
  function dragstarted(event) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    event.subject.fx = event.subject.x;
    event.subject.fy = event.subject.y;
  }

  // Update the subject (dragged node) position during drag.
  function dragged(event) {
    event.subject.fx = event.x;
    event.subject.fy = event.y;
  }

  // Restore the target alpha so the simulation cools after dragging ends.
  // Unfix the subject position now that it’s no longer being dragged.
  function dragended(event) {
    if (!event.active) simulation.alphaTarget(0);
    event.subject.fx = null;
    event.subject.fy = null;
  }
};

onMounted(() => {
  // Create the SVG container.
  d3.select(svg.value)
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [0, 0, width, height])
    .attr("style", "max-width: 100%; height: auto;");

  d3.select(svg.value)
    .append("defs")
    .selectAll("marker")
    .data(["E"])
    .join("marker")
    .attr("id", (d) => `arrow-${d}`)
    .attr("viewBox", "0 -5 10 10")
    .attr("refX", 15)
    .attr("refY", -0.5)
    .attr("markerWidth", 6)
    .attr("markerHeight", 6)
    .attr("orient", "auto")
    .append("path")
    .attr("fill", "currentcolor")
    .attr("d", "M0,-3L10,0L0,3");

  d3.select(svg.value).append("g").attr("class", "network");

  update();
});

watch(
  () => [props.nodes, props.links],
  () => {
    update();
  }
);
</script>
