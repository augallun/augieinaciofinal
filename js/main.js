// set the dimensions and margins of the graph
const margin = {top: 30, right: 10, bottom: 70, left: 0};
  width = 1300 - margin.left - margin.right,
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
    let fullData = [];  // will store the full dataset
    let selectedPosition = "All";
    let selectedLeague = "All";
  const axisTooltip = d3.select("#parallel")
    .append("div")
    .style("position", "absolute")
    .style("z-index", "11")
    .style("visibility", "hidden")
    .style("background", "rgba(0, 0, 0, 0.85)")
    .style("color", "white")
    .style("padding", "8px")
    .style("border-radius", "6px")
    .style("font-size", "13px")
    .style("max-width", "220px")
    .style("pointer-events", "none");
  
// Parse the Data
d3.csv('data/transfersdv.csv').then( function(data) {

    // Define the list of columns to include
    const included = ["transfer fee", "age", "Performance_Gls", "Performance_Ast", "Progression_PrgC", "Progression_PrgP", "Progression_PrgR", "Playing Time_Min",];
    const displayNames = {
      "transfer fee": "Transfer Fee (€)",
      "age": "Age",
      "Performance_Gls": "Goals",
      "Performance_Ast": "Assists",
      "Progression_PrgC": "Progressive Carries",
      "Progression_PrgP": "Progressive Passes",
      "Progression_PrgR": "Progressive Receptions",
      "Playing Time_Min": "Minutes Played"
    };
    const axisDescriptions = {
      "transfer fee": "Estimated cost paid for the player’s transfer in euros.",
      "age": "Player's age during the 2023–2024 season.",
      "Performance_Gls": "Total goals for the 2023–2024 season.",
      "Performance_Ast": "Total assists provided in the 2023–2024 season.",
      "Progression_PrgC": "Carries that moved the ball significantly forward.",
      "Progression_PrgP": "Passes that moved the ball significantly forward.",
      "Progression_PrgR": "Receptions of progressive passes.",
      "Playing Time_Min": "Total minutes played in all club competitions."
    };
    
    
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
    .style("font-size", "13px")
    .text(d => displayNames[d] || d)
    .style("fill", "black")
    .on("mouseover", function(event, d) {
      axisTooltip
        .html(`
          <div style="font-size: 15px; font-weight: bold; margin-bottom: 4px;">
            ${displayNames[d] || d}
          </div>
          <div>${axisDescriptions[d] || "No description available."}</div>
        `)
        .style("visibility", "visible");
    })
    .on("mousemove", function(event) {
      axisTooltip
        .style("top", (event.pageY + 10) + "px")
        .style("left", (event.pageX + 10) + "px");
    })
    .on("mouseout", function() {
      axisTooltip.style("visibility", "hidden");
    });
  

    fullData = data;
    applyFilters();  

      document.getElementById("positionFilter").addEventListener("change", function () {
        selectedPosition = this.value;
        
        applyFilters();
      });
      document.getElementById("leagueFilter").addEventListener("change", function () {
        selectedLeague = this.value;
        applyFilters();
      });
      function applyFilters() {
        let filtered = fullData;
      
        if (selectedPosition !== "All") {
          filtered = filtered.filter(d =>
            d.position && d.position.split(",")[0].trim() === selectedPosition
          );
        }
      
        if (selectedLeague !== "All") {
          filtered = filtered.filter(d => d.league === selectedLeague);
        }
      
        updateLines(filtered);
      }
      
            
      
      
      function updateLines(filteredData) {
        filteredData.sort((a, b) => +a[colorDimension] - +b[colorDimension]); // ascending = yellow on top


        // Remove all existing lines
        svg.selectAll(".data-line").remove();

      
        // Redraw with filtered data
        svg.selectAll(".data-line")
          .data(filteredData)
          .enter()
          .append("path")
          .attr("class", "data-line")  
      
          .attr("d", d => path(d))
          .style("stroke", d => color(+d[colorDimension]))
          .style("fill", "none")
          .style("opacity", 0.75)
          .on("mouseover", function(event, d) {
            d3.select(this)
              .style("stroke-width", 5)
              .style("opacity", 1)
              .style("stroke", "black")
              .raise();
      
            tooltip
              .html(`
                <strong>Player:</strong> ${d["player name"]}<br>
                <strong>Current Team:</strong> ${d["to club name"]}<br>
                <strong>Transferred From:</strong> ${d["team"]}<br><br>
                ${dimensions.map(dim => `<strong>${dim}</strong>: ${d[dim]}`).join("<br>")}
              `)
              .style("visibility", "visible");

          })

          .on("mousemove", function(event) {
            tooltip
              .style("top", (event.pageY + 10) + "px")
              .style("left", (event.pageX + 10) + "px");
          })
          .on("mouseout", function(event, d) {
            d3.select(this)
              .style("stroke-width", null)
              .style("opacity", 0.75)
              .style("stroke", d => color(+d[colorDimension]));
            tooltip.style("visibility", "hidden");

          });
          console.log("Filtered data count:", filteredData.length);


      }
// Create a legend group
const legendWidth = 300;
const legendHeight = 10;

const legendGroup = svg.append("g")
  .attr("class", "legend")
  .attr("transform", `translate(${(width - legendWidth) / 2}, +520)`)



// Define gradient
const defs = d3.select("svg").append("defs");
const gradient = defs.append("linearGradient")
  .attr("id", "color-gradient")
  .attr("x1", "0%").attr("y1", "0%")
  .attr("x2", "100%").attr("y2", "0%");

const numStops = customColors.length;
customColors.forEach((color, i) => {
  gradient.append("stop")
    .attr("offset", `${(i / (numStops - 1)) * 100}%`)
    .attr("stop-color", color);
});

// Draw gradient rect
legendGroup.append("rect")
  .attr("width", legendWidth)
  .attr("height", legendHeight)
  .style("fill", "url(#color-gradient)");

// Add axis scale under the legend
const legendScale = d3.scaleLinear()
  .domain(feeExtent)
  .range([0, legendWidth]);

const legendAxis = d3.axisBottom(legendScale)
  .ticks(5)
  .tickFormat(d3.format("$.2s"));

legendGroup.append("g")
  .attr("transform", `translate(0, ${legendHeight})`)
  .call(legendAxis)
  .selectAll("text")
  .style("font-size", "12px");

// Legend label
legendGroup.append("text")
  .attr("x", legendWidth / 2)
  .attr("y", -6)
  .attr("text-anchor", "middle")
  .style("font-size", "12px")
  .style("fill", "black")
  .text("Transfer Fee (€)");

  console.log("Path for first row:", path(data[0]));
});


