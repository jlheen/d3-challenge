// ***************************
// Option: Try to make the chart responsive
// ***************************




// Creating the svg container

var svgWidth = 960;
var svgHeight = 500;

var margin = {
    top: 20,
    right: 40,
    bottom: 80,
    left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group to the HTML chart class
//  that will hold our chart, and shift the latter by left and top margins.
var svg = d3
    .select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// ********************************
// Data: Initial X & Y Axis = Poverty v. Healthcare
// Labeled as chosenXAxis & defaultYaxis
// Secondary X & Y = Income v. Smokes
// Labeled as newXscale & newYscale


// Initial X-Axis: Poverty
var chosenXAxis = "poverty";

// function used for updating x-scale var upon click on axis label
function xScale(censusDataSet, chosenXAxis) {
    // create scales
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(censusDataSet, d => d[chosenXAxis]) * 0.8,
        d3.max(censusDataSet, d => d[chosenXAxis]) * 1.2
        ])
        .range([0, width]);

    return xLinearScale;

}

// function used for updating xAxis var upon click on axis label
function renderAxes(newXscale, xAxis) {
    var bottomAxis = d3.axisBottom(newXscale);

    xAxis.transition()
        .duration(500)
        .call(bottomAxis);

    return xAxis;
}

// ************************************
// TO DO: ENTER IN INITIAL PARAMS FOR Y-AXIS 
// to prepare for change
// Goal: create changing x-axes, then try to implement the changes for the y-axis
// ************************************


// // Initial Y-Axis: Healthcare
// var defaultYAxis = "healthcare";

// // function used for updating x-scale var upon click on axis label
// function xScale(censusDataSet, chosenXAxis) {
//     // create scales
//     var xLinearScale = d3.scaleLinear()
//       .domain([d3.min(censusDataSet, d => d[chosenXAxis]) * 0.8,
//         d3.max(censusDataSet, d => d[chosenXAxis]) * 1.2
//       ])
//       .range([0, width]);

//     return xLinearScale;

//   }

// ************************************
// TO DO: CHANGE CIRCLES FOR BOTH AXES
// add in attr("cy"...)
// ************************************


// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXscale, chosenXAxis) {

    circlesGroup.transition()
        .duration(500)
        .attr("cx", d => newXscale(d[chosenXAxis]));
        // .attr("cy", d => newYscale(d[newXscale]))

    return circlesGroup;
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, circlesGroup) {

    var label;

    // **********
    // NOTE!!!
    // in HW - have 3 x- and y-axes 
    // either need if/elif/else, etc. OR switch stmt

    if (chosenXAxis === "poverty") {
        label = "Poverty (%):";
    }
    else {
        label = "Income";
    }

    var toolTip = d3.tip()
        .attr("class", "tooltip")
        .offset([80, -60])
        .html(function (d) {
            return (`${d.state}<br>${label} ${d[chosenXAxis]}`);
        });

    circlesGroup.call(toolTip);

    circlesGroup.on("mouseover", function (data) {
        toolTip.show(data);
    })
        // onmouseout event
        .on("mouseout", function (data, index) {
            toolTip.hide(data);
        });

    return circlesGroup;
}


// *************************
// DATA RETRIEVAL
// &
// FUNCTION EXECUTION
// *************************

// *************************
// QUESTION:
// HOW TO PATH TO SOMETHING OUT OF & INSIDE OTHER FOLDER?
// *************************


// Retrieve data from the CSV file and execute everything below
d3.csv("../../assets/data/data.csv").then(function (censusDataSet, err) {
    if (err) throw err;

    // parse data
    censusDataSet.forEach(function (data) {
        data.poverty = +data.poverty;
        data.healthcare = +data.healthcare;
        data.income = +data.income;
    });

    // xLinearScale function above csv import
    var xLinearScale = xScale(censusDataSet, chosenXAxis);

    // Create y scale function
    var yLinearScale = d3.scaleLinear()
        .domain([0, d3.max(censusDataSet, d => d.healthcare)])
        .range([height, 0]);

    // Create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // append x axis
    var xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);

    // append y axis
    chartGroup.append("g")
        .call(leftAxis);

    // ************************************
    // TO DO: UPDATE CIRCLES
    // default setting is state showing on the circles
    // what for the mouseover event -- the data points
    // ONE POSSIBLE SOLUTION: https://stackoverflow.com/questions/13615381/d3-add-text-to-circle -- would this mean I need to update the circles with a separate function for the text?
    // similar: https://stackoverflow.com/questions/20644415/d3-appending-text-to-a-svg-rectangle
    // ************************************

    // append INITIAL circles
    var circlesGroup = chartGroup.selectAll("circle")
        .data(censusDataSet)
        .enter()
        .append("circle")
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("cy", d => yLinearScale(d.healthcare))
        .attr("r", 15)
        .attr("fill", "#339DFF")
        .attr("opacity", ".3");

    // ************************************
    // TO ADD
    // ************************************

    //  text for the circles
//     circlesGroup.append("text")
//         .attr("dx", function (chosenXAxis) { return -20 })
//         .text(function (d) { return d.label })
// })

// Create group for two x-axis labels
var XlabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

var povertyRateLabel = XlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty") // value to grab for event listener
    .classed("active", true)
    .text("Poverty Rate");

var incomeLabel = XlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "income") // value to grab for event listener
    .classed("inactive", true)
    .text("Income");


    // ************************************
// TO DO: YlabelsGroup for two y-axes
    // ************************************

// var YlabelsGroup = chartGroup.append("g")
//     .attr("transform", `translate(${width / 2}, ${height + 20})`);

// var healthcareLabel = YlabelsGroup.append("text")
//     .attr("x", 0)
//     .attr("y", 20)
//     .attr("value", "healthcare") // value to grab for event listener
//     .classed("active", true)
//     .text("Healthcare");

// var smokersLabel = YlabelsGroup.append("text")
//     .attr("x", 0)
//     .attr("y", 40)
//     .attr("value", "smokes") // value to grab for event listener
//     .classed("inactive", true)
//     .text("Smokers (%)");


// Initial Y-Axis
chartGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .classed("axis-text", true)
    .text("Healthcare");

    

// updateToolTip function above csv import
var circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

// x axis labels event listener
XlabelsGroup.selectAll("text")
    .on("click", function () {
        // get value of selection
        var value = d3.select(this).attr("value");
        if (value !== chosenXAxis) {

            // replaces chosenXAxis with value
            chosenXAxis = value;

            // console.log(chosenXAxis)

            // functions here found above csv import
            // updates x scale for new data
            xLinearScale = xScale(censusDataSet, chosenXAxis);

            // updates x axis with transition
            xAxis = renderAxes(xLinearScale, xAxis);

            // updates circles with new x values
            circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);

            // updates tooltips with new info
            circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

            // changes classes to change bold text
            if (chosenXAxis === "poverty") {
                povertyRateLabel
                    .classed("active", true)
                    .classed("inactive", false);
                incomeLabel
                    .classed("active", false)
                    .classed("inactive", true);
            }
            else {
                povertyRateLabel
                    .classed("active", false)
                    .classed("inactive", true);
                incomeLabel
                    .classed("active", true)
                    .classed("inactive", false);
            }
        }
    });
}).catch (function(error) {
    console.log(error);
});

