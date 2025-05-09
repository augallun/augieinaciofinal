// set the dimensions and margins of the graph
const margin = {top: 30, right: 10, bottom: 10, left: 0},
  width = 1000 - margin.left - margin.right,
  height = 600 - margin.top - margin.bottom;

// append the svg object to the body of the page
const svg = d3.select("#parallel")
.append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
.append("g")
  .attr("transform",
        `translate(${margin.left},${margin.top})`);
  const tooltip = d3.select("#parallel")
    .append("div")
    .style("position", "absolute")
    .style("z-index", "10")
    .style("visibility", "hidden")
    .style("background", "rgba(0, 0, 0, 0.8)")
    .style("color", "white")
    .style("padding", "6px")
    .style("border-radius", "4px")
    .style("font-size", "12px")
    .style("pointer-events", "none");
// Parse the Data
d3.csv('data/transfersdv.csv').then( function(data) {

    // Define the list of columns to include
    const included = ["transfer fee", "age", "Performance_Gls", "Performance_Ast", "Progression_PrgC", "Progression_PrgP", "Progression_PrgR", "Playing Time_Min",];

    // Extract only the specified dimensions for the plot
    dimensions = Object.keys(data[0]).filter(function(d) { 
        return included.includes(d);
    });

  // For each dimension, I build a linear scale. I store all in a y object
  const y = {}
  for (let i in dimensions) {
    const name = dimensions[i]
    y[name] = d3.scaleLinear()
      .domain( d3.extent(data, function(d) { return +d[name]; }) )
      .range([height, 0])
  }

  // Build the X scale -> it find the best position for each Y axis
  x = d3.scalePoint()
    .range([0, width])
    .padding(1)
    .domain(dimensions);
  //color
  
  // The path function take a row of the csv as input, and return x and y coordinates of the line to draw for this raw.
  function path(d) {
      return d3.line()(dimensions.map(function(p) { return [x(p), y[p](d[p])]; }));
  }

  console.log("Sample path:", path(data[0]));

  const getPrimaryPosition = pos => pos.split(",")[0].trim();
  
  // Draw the lines
  //const colorDimension = "transfer fee";
  //const color = d3.scaleSequential()
      //.domain(d3.extent(data, d => +d[colorDimension]))
      //.range(["#fde0dd", "#2ca25f"]);
    //  const colorDimension = "transfer fee";
    //  const feeExtent = d3.extent(data, d => +d[colorDimension]);
    //  const customInterpolator = d3.scaleLinear()
   // .domain([0, 1])
    //.range([
     //   d3.rgb("#ffffcc"),
     //   d3.rgb("#800026")
     // ])
    //.interpolate(d3.interpolateRgb);
  
  //const color = d3.scaleSequential()
   //   .domain(feeExtent)
    //  .interpolator(t => customInterpolator((t - feeExtent[0]) / (feeExtent[1] - feeExtent[0])));
    const colorDimension = "transfer fee";
const feeExtent = d3.extent(data, d => +d[colorDimension]);

const customColors = [
  "#ffffcc",
  "#ffeda0",
  "#fed976",
  "#feb24c",
  "#fd8d3c",
  "#fc4e2a",
  "#e31a1c",
  "#bd0026",
  "#800026"
];

// Create a smooth interpolator from your custom color list
const customInterpolator = d3.piecewise(d3.interpolateRgb, customColors);

// Now plug it into a proper sequential color scale
const color = d3.scaleSequential()
  .domain(feeExtent)
  .interpolator(customInterpolator);

    svg
      .selectAll("myPath")
      .data(data)
      .join("path")
      .attr("d",  path)
      .style("fill", "none")
      .style("stroke", d => color(+d[colorDimension]))  // use your color scale here
      //.style("stroke-dasharray", d => {
        //const primaryPos = getPrimaryPosition(d.position);
        //return positionStyles[primaryPos] || "0";
      //})
      .style("fill", "none")
      .style("opacity", 0.75)
      .on("mouseover", function(event, d) {
        d3.select(this)
          .style("stroke-width", 3)
          .style("opacity", 1)
          .raise(); // bring to front
    
        tooltip
        .html(`
          <strong>Player:</strong> ${d["player name"]}<br>
          <strong>current team:</strong> ${d["to club name"]}<br><br>
          <strong>transfered from:</strong> ${d["team"]}<br><br>
          ${dimensions.map(dim => `<strong>${dim}</strong>: ${d[dim]}`).join("<br>")}
        `)
          .style("visibility", "visible");
      })
      .on("mousemove", function(event) {
        tooltip
          .style("top", (event.pageY + 10) + "px")
          .style("left", (event.pageX + 10) + "px");
      })
      .on("mouseout", function() {
        d3.select(this)
          .style("stroke-width", null)
          .style("opacity", 0.5);
        tooltip.style("visibility", "hidden");
      });
  // Draw the axis:
  svg.selectAll("myAxis")
    // For each dimension of the dataset I add a 'g' element:
    .data(dimensions).enter()
    .append("g")
    // I translate this element to its right position on the x axis
    .attr("transform", function(d) { return "translate(" + x(d) + ")"; })
    // And I build the axis with the call function
    .each(function(d) { d3.select(this).call(d3.axisLeft().scale(y[d])); })
    // Add axis title
    .append("text")
      .style("text-anchor", "middle")
      .attr("y", -9)
      .text(function(d) { return d; })
      .style("fill", "black")



      document.getElementById("positionFilter").addEventListener("change", function() {
        const selected = this.value;
      
        const filteredData = selected === "All"
          ? data
          : data.filter(d => d.position.split(",")[0].trim() === selected);
      
        updateLines(filteredData);
      });
      
      function updateLines(filteredData) {
        const lines = svg.selectAll("path").data(filteredData, d => d.id || d.name); // use unique key
      
        lines.enter()
          .append("path")
          .attr("d", d => path(d))
          .style("stroke", d => color(+d[colorDimension]))
          .style("fill", "none")
          .merge(lines)
          .transition()
          .duration(500)
          .attr("d", d => line(d));
      
        lines.exit().remove();
      };

});


