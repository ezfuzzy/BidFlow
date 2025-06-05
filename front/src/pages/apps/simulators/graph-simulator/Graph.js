import * as d3 from "d3";
import React, { useEffect } from "react";

const Graph = ({ matrix, showWeight, showDirection }) => {
  useEffect(() => {
    const visualizeGraph = (matrix, showWeight, showDirection) => {
      const width = 800;
      const height = 600;
      d3.select("#graph").html(""); // clear previous graph

      //svg 초기화
      const svg = d3.select("#graph").append("svg").attr("width", width).attr("height", height);

      const defs = svg.append("defs");

      if (showDirection) {
        // 일반 화살표
        defs
          .append("marker")
          .attr("id", "arrowhead")
          .attr("viewBox", "-0 -5 10 10")
          .attr("refX", 28)
          .attr("refY", 0)
          .attr("orient", "auto")
          .attr("markerWidth", 6)
          .attr("markerHeight", 6)
          .attr("xoverflow", "visible")
          .append("svg:path")
          .attr("d", "M 0,-5 L 10 ,0 L 0,5")
          .attr("fill", "#555")
          .style("stroke", "none");

        // 자기 순환 화살표
        defs
          .append("marker")
          .attr("id", "arrowhead-self")
          .attr("viewBox", "-0 -5 10 10")
          .attr("refX", 20)
          .attr("refY", -1.5)
          .attr("orient", "auto")
          .attr("markerWidth", 6)
          .attr("markerHeight", 6)
          .attr("xoverflow", "visible")
          .append("svg:path")
          .attr("d", "M 0,-5 L 10 ,0 L 0,5")
          .attr("fill", "#555")
          .style("stroke", "none");
      }

      const nodes = matrix.map((_, i) => ({ id: i }));
      const links = [];

      matrix.forEach((row, i) => {
        row.forEach((value, j) => {
          if (value !== 0) {
            links.push({ source: i, target: j, weight: value, isSelfLoop: i === j });
          }
        });
      });

      const simulation = d3
        .forceSimulation(nodes)
        .force(
          "link",
          d3
            .forceLink(links)
            .id((d) => d.id)
            .distance(150) //간선 길이
        )
        .force("charge", d3.forceManyBody().strength(-400)) 
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("collision", d3.forceCollide().radius(20));

      const link = svg
        .append("g")
        .attr("class", "links")
        .selectAll("path")  // line 대신 path 사용
        .data(links)
        .enter()
        .append("path")  // line 대신 path 사용
        .attr("stroke-width", 2)
        .attr("stroke", "#555")
        .attr("fill", "none")  // path의 채우기 없음
        .attr("marker-end", (d) => {
          if (!showDirection) return null;
          return d.isSelfLoop ? "url(#arrowhead-self)" : "url(#arrowhead)";
        });

      if (showWeight) {
        // weight graph
        const linkLabels = svg
          .append("g")
          .attr("class", "link-labels")
          .selectAll("text")
          .data(links)
          .enter()
          .append("text")
          .attr("class", "link-label")
          .text((d) => d.weight) // weight setting
          .attr("font-size", 14)
          .attr("fill", "#000")
          .attr("dy", -3);

        simulation.on("tick", () => {
          link.attr("d", (d) => {
            if (d.isSelfLoop) {
              const x = d.source.x;
              const y = d.source.y;
              const rx = 20;
              const ry = 20;
              return `M${x},${y - 20} A${rx},${ry} 0 1,1 ${x + 0.01},${y - 20.01}`;
            } else {
              return `M${d.source.x},${d.source.y} L${d.target.x},${d.target.y}`;
            }
          });

          linkLabels
            .attr("x", (d) => d.isSelfLoop ? d.source.x : (d.source.x + d.target.x) / 2)
            .attr("y", (d) => d.isSelfLoop ? d.source.y - 40 : (d.source.y + d.target.y) / 2);

          node.attr("transform", (d) => `translate(${d.x},${d.y})`);
        });
      } else {
        // no weight graph
        simulation.on("tick", () => {
          link.attr("d", (d) => {
            if (d.isSelfLoop) {
              const x = d.source.x;
              const y = d.source.y;
              return `M${x},${y} C ${x-40},${y-40} ${x+40},${y-40} ${x},${y}`;
            } else {
              return `M${d.source.x},${d.source.y} L${d.target.x},${d.target.y}`;
            }
          });

          node.attr("transform", (d) => `translate(${d.x},${d.y})`);
        });
      }

      const node = svg.append("g").attr("class", "nodes").selectAll("g").data(nodes).enter().append("g");

      node.append("circle").attr("r", 20).attr("fill", "black").attr("stroke", "#fff").attr("stroke-width", 2);

      node
        .append("text")
        .attr("dy", 5)
        .attr("text-anchor", "middle")
        .attr("fill", "#fff")
        .text((d) => d.id + 1); // node numbering

      const drag = (simulation) => {
        function dragStarted(event, d) {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        }

        function dragged(event, d) {
          d.fx = event.x;
          d.fy = event.y;
        }

        function dragEnded(event, d) {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        }

        return d3.drag().on("start", dragStarted).on("drag", dragged).on("end", dragEnded);
      };

      node.call(drag(simulation));
    };

    visualizeGraph(matrix, showWeight, showDirection);
  }, [matrix, showWeight, showDirection]);

  return <div id="graph"></div>;
};

export default Graph;