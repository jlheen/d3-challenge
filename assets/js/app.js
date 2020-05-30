
// ***************************
// CREATE THE SVG CONTAINER
// ***************************

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

// ***************************
// WRITE FUNCTIONS
// ***************************

// ********************************
// Data: Initial X & Y Axis = Poverty v. Healthcare
// Labeled as chosenXAxis & defaultYaxis
// Secondary X & Y = Income v. Smokes
// Labeled as newXscale & newYscale

// ***************************
// INITIAL X-AXES
// Functions for updating on event clicks
// ***************************

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
function renderXAxes(newXscale, xAxis) {
    var bottomAxis = d3.axisBottom(newXscale);

    xAxis.transition()
        .duration(500)
        .call(bottomAxis);

    return xAxis;
}

// Initial Y-Axis: Poverty
var chosenYAxis = "healthcare";

// function used for updating y-scale var upon click on axis label
function yScale(censusDataSet, chosenYAxis) {
    // create scales

    var yLinearScale = d3.scaleLinear()
        .domain([d3.min(censusDataSet, d => d[chosenYAxis]) * 0.8, 
        d3.max(censusDataSet, d => d[chosenYAxis]) * 1.2])
        .range([height, 0]);

    return yLinearScale;

}

// function used for updating xAxis var upon click on axis label
function renderYAxes(newYscale, yAxis) {
    var leftAxis = d3.axisLeft(newYscale);

    yAxis.transition()
        .duration(500)
        .call(leftAxis);

    return yAxis;
}

// function used for updating circles group with a transition to
// new circles
function renderCirclesX(circlesGroup, chosenXAxis, newXscale) {
    
    circlesGroup.transition()
        .duration(500)
        .attr("cx", d => newXscale(d[chosenXAxis]))
        // .attr("cy", d => newYscale(d[chosenYAxis]));

    return circlesGroup;
}
// new circles
function renderCirclesY(circlesGroup, chosenYAxis, newYscale) {
    
    circlesGroup.transition()
        .duration(500)
        // .attr("cx", d => newXscale(d[chosenXAxis]))
        .attr("cy", d => newYscale(d[chosenYAxis]));

    return circlesGroup;
}

// update text witin circles for X-axis
function renderCirclesTextX(circlesGroup, chosenXAxis, newXscale) {
    
    circlesGroup.transition()
        .duration(500)
        .attr("x", d => newXscale(d[chosenXAxis]))

    return circlesGroup;
}
// update text witin circles for Y-axis
function renderCirclesTextY(circlesGroup, chosenYAxis, newYscale) {
    
    circlesGroup.transition()
        .duration(500)
        .attr("y", d => newYscale(d[chosenYAxis]));

    return circlesGroup;
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

    console.log(chosenYAxis)

    var Xlabel;
    var Ylabel;

    // conditions for X-Axes

    if (chosenXAxis === "poverty") {
        Xlabel = "Poverty (%):";
    }
    else {
        Xlabel = "Income:";
    }

    // conditions for Y-Axes

    if (chosenYAxis === "healthcare") {
        Ylabel = "Healthcare:";
    }
    else {
        Ylabel = "Smokes:";
    }

    var toolTip = d3.tip()
        .attr("class", "tooltip")
        .offset([80, -60])
        .html(function (d) {
            return (`${d.state}<br>${Xlabel} ${d[chosenXAxis]}<br>${Ylabel} ${d[chosenYAxis]}`);
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
// DATA RETRIEVAL & FUNCTION EXECUTION
// *************************

// Retrieve data from the CSV file and execute everything below
d3.csv("../../assets/data/data.csv").then(function (censusDataSet, err) {
    if (err) throw err;

    // parse data
    censusDataSet.forEach(function (data) {
        data.poverty = +data.poverty;
        data.healthcare = +data.healthcare;
        data.income = +data.income;
        data.smokes = +data.smokes;
    });

    // x & y LinearScale functions above csv import
    var xLinearScale = xScale(censusDataSet, chosenXAxis);
    var yLinearScale = yScale(censusDataSet, chosenYAxis);

    // Create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // append x axis
    var xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);

    // append y axis
    var yAxis = chartGroup.append("g")
        .classed("y-axis", true)
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
        .attr("cy", d => yLinearScale(d[chosenYAxis]))
        .attr("r", 15)
        .attr("fill", "#339DFF")
        .attr("opacity", ".3");

    //  text for the circles
    var circlesText = chartGroup.selectAll()
        .data(censusDataSet)
        .enter()
        .append("text")
        .attr("x", d => (xLinearScale(d[chosenXAxis]) - 10))
        .attr("y", d => (yLinearScale(d[chosenYAxis]) + 5))
        .text(d => d.abbr)
        .attr("font-size", "12px")

    // Create group for two x-axis labels
    var XlabelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 20})`);

    var povertyRateLabel = XlabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "poverty") // value to grab for event listener
        // .classed("active", true)
        .attr("class", "active")
        .text("Poverty Rate (%)");

    var incomeLabel = XlabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "income") // value to grab for event listener
        .attr("class", "inactive")
        .text("Income ($USD)");

    var YlabelsGroup = chartGroup.append("g")
        .attr("transform", "rotate(-90)");

    var healthcareLabel = YlabelsGroup.append("text")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .attr("value", "healthcare") // value to grab for event listener
        .attr("class", "active")
        .text("Healthcare");

    var smokesLabel = YlabelsGroup.append("text")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "2em")
        .attr("value", "smokes") // value to grab for event listener
        .attr("class", "inactive")
        .text("Smokes");


    // updateToolTip function above csv import
    var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

    
    // x axis labels event listener
    XlabelsGroup.selectAll("text")
        .on("click", function () {
            // get value of selection
            var value = d3.select(this).attr("value");
            if (value != chosenXAxis) {

                // replaces chosenXAxis with value
                chosenXAxis = value;

                // console.log(chosenXAxis)

                // functions here found above csv import
                // updates x scale for new data
                newXscale = xScale(censusDataSet, chosenXAxis);

                // updates x axis with transition
                xAxis = renderXAxes(xLinearScale, xAxis);

                // updates circles with new x values and text
                circlesGroup = renderCirclesX(circlesGroup, chosenXAxis, newXscale);
                circlesText = renderCirclesTextX(circlesText, chosenXAxis, newXscale);
                
                // updates tooltips with new info
                circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

                // changes classes to change bold text
                if (chosenXAxis == "poverty") {
                    povertyRateLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    incomeLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                // else if 
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
    // }).catch(function (error) {
    //     console.log(error);

    // *****************************
    // Create Y Labels Event Listener
    // *****************************

    // y axis labels event listener
    YlabelsGroup.selectAll("text")
        .on("click", function () {
            // get value of selection
            var value = d3.select(this).attr("value");
            if (value != chosenYAxis) {

                // replaces chosenXAxis with value
                chosenYAxis = value;

                // console.log(chosenXAxis)

                // functions here found above csv import
                // updates y scale for new data
                newYscale = yScale(censusDataSet, chosenYAxis);

                // updates x axis with transition
                yAxis = renderYAxes(yLinearScale, yAxis);

                // updates circles with new y values and text
                circlesGroup = renderCirclesY(circlesGroup, chosenYAxis, newYscale);
                circlesText = renderCirclesTextY(circlesText, chosenYAxis, newYscale);

                // updates tooltips with new info
                circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

                // changes classes to change bold text
                if (chosenYAxis == "healthcare") {
                    healthcareLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    smokesLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else {
                    healthcareLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    smokesLabel
                        .classed("active", true)
                        .classed("inactive", false);
                }
            }
        });
    }).catch(function (error) {
        console.log(error);
    });

