// LineChart.jsx
import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

const LineChart = () => {
  const d3Container = useRef(null);
  const [data, setData] = useState(null);

  useEffect(() => {
    // Load and process the data
    d3.csv('./Dataset/US_Car_Accident_Dataset.csv').then(data => {
      data.forEach(d => {
        d.Fatalities_in_Crash = +d.Fatalities_in_Crash;
        d.Crash_Date = new Date(d.Crash_Date);
      });
      setData(data);
      updateChart('All', data);
    });
  }, []);

  const updateChart = (gender, data) => {
    // Clear previous SVG elements
    d3.select(d3Container.current).select("svg").remove();

    // Set the dimensions and margins of the graph
    const margin = { top: 10, right: 30, bottom: 50, left: 60 };
    const width = 800 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    // Append the svg object to the div with id 'my_dataviz'
    const svg = d3.select(d3Container.current)
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Filter data based on gender
    const filteredData = (gender === 'All') ? data : data.filter(d => d.Gender === gender);

    // Aggregate data by month
    const aggregatedData = d3.rollups(
      filteredData,
      v => d3.sum(v, d => d.Fatalities_in_Crash),
      d => d3.timeFormat("%Y-%m")(d.Crash_Date)
    ).map(([key, value]) => ({ month: d3.timeParse("%Y-%m")(key), fatalities: value }));

    // Define the domain for x and y scales
    const x = d3.scaleTime().range([0, width]);
    const y = d3.scaleLinear().range([height, 0]);

    x.domain(d3.extent(aggregatedData, d => d.month));
    y.domain([0, d3.max(aggregatedData, d => d.fatalities)]);

    // Initialize X and Y axes
    const xAxis = d3.axisBottom(x).ticks(d3.timeMonth.every(1)).tickFormat(d3.timeFormat("%b"));
    const yAxis = d3.axisLeft(y);

    // Add X axis
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(xAxis);

    // Add Y axis
    svg.append("g")
      .call(yAxis);

    if (gender === 'All') {
      // Aggregate data by gender
      const genders = [...new Set(data.map(d => d.Gender))];
      genders.forEach(gender => {
        const genderData = d3.rollups(
          data.filter(d => d.Gender === gender),
          v => d3.sum(v, d => d.Fatalities_in_Crash),
          d => d3.timeFormat("%Y-%m")(d.Crash_Date)
        ).map(([key, value]) => ({ month: d3.timeParse("%Y-%m")(key), fatalities: value }));

        svg.append("path")
          .datum(genderData)
          .attr("fill", "none")
          .attr("stroke", getColor(gender))
          .attr("stroke-width", 2.5)
          .attr("d", d3.line()
            .x(d => x(d.month))
            .y(d => y(d.fatalities))
          )
          .attr("class", `line-${gender}`);
      });
    } else {
      // Draw the line for the selected gender
      svg.append("path")
        .datum(aggregatedData)
        .attr("fill", "none")
        .attr("stroke", getColor(gender))
        .attr("stroke-width", 2.5)
        .attr("d", d3.line()
          .x(d => x(d.month))
          .y(d => y(d.fatalities))
        )
        .attr("class", `line-${gender}`);
    }
  };

  const getColor = (gender) => {
    const colors = {
      "Male": "#1f77b4",
      "Female": "#ff7f0e",
      "Not Reported": "#2ca02c",
      "Unknown": "#d62728",
      "All": "#000000"  // Default color for "All"
    };
    return colors[gender] || '#000000';
  };

  return (
    <div>
      <button onClick={() => updateChart('Male', data)}>Male</button>
      <button onClick={() => updateChart('Female', data)}>Female</button>
      <button onClick={() => updateChart('Not Reported', data)}>Not Reported</button>
      <button onClick={() => updateChart('Unknown', data)}>Unknown</button>
      <button onClick={() => updateChart('All', data)}>All</button>
      <div id="my_dataviz" ref={d3Container}></div>
    </div>
  );
};

export default LineChart;
