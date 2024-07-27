import { useEffect, useRef } from "react";
import * as d3 from "d3";

const Barplot = () => {
  const d3Container = useRef(null);

  useEffect(() => {
    if (d3Container.current) {
      // Clear any existing SVG before drawing the new one
      d3.select(d3Container.current).select("svg").remove();

      // Set the dimensions and margins of the graph
      const margin = { top: 10, right: 30, bottom: 90, left: 40 },
        width = 460 - margin.left - margin.right,
        height = 450 - margin.top - margin.bottom;

      // Append the svg object to the div with id 'my_dataviz'
      const svg = d3.select(d3Container.current)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      // Parse the Data
      d3.csv("./Dataset/US_Car_Accident_Dataset.csv").then((data) => {
        // Aggregate data: sum Fatalities_in_Crash for each Atmospheric_Condition
        const aggregatedData = d3.rollup(data, v => d3.sum(v, d => +d.Fatalities_in_Crash), d => d.Atmospheric_Condition);

        // Convert the aggregated data to an array of objects
        const aggregatedDataArray = Array.from(aggregatedData, ([Atmospheric_Condition, Fatalities_in_Crash]) => ({ Atmospheric_Condition, Fatalities_in_Crash }));

        // X axis
        const x = d3.scaleBand()
          .range([0, width])
          .domain(aggregatedDataArray.map(d => d.Atmospheric_Condition))
          .padding(0.2);

        svg.append("g")
          .attr("transform", `translate(0,${height})`)
          .call(d3.axisBottom(x))
          .selectAll("text")
          .attr("transform", "translate(-10,0)rotate(-45)")
          .style("text-anchor", "end");

        // Y axis
        const y = d3.scaleLinear()
          .domain([0, d3.max(aggregatedDataArray, d => d.Fatalities_in_Crash)])
          .range([height, 0]);

        svg.append("g")
          .call(d3.axisLeft(y));

        // Bars
        svg.selectAll("mybar")
          .data(aggregatedDataArray)
          .enter()
          .append("rect")
          .attr("x", d => x(d.Atmospheric_Condition))
          .attr("width", x.bandwidth())
          .attr("fill", "#69b3a2")
          .attr("height", d => height - y(0))
          .attr("y", d => y(0));

        // Animation
        svg.selectAll("rect")
          .transition()
          .duration(800)
          .attr("y", d => y(d.Fatalities_in_Crash))
          .attr("height", d => height - y(d.Fatalities_in_Crash))
          .delay((d, i) => i * 100);
      });
    }
  }, []); // Empty dependency array to run only once

  return <div id="my_dataviz" ref={d3Container}></div>;
};

export default Barplot;
