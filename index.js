// makeResponsive is a function to resize your chart according to the browser window size
d3.select(window).on("resize",makeResponsive);
makeResponsive();
function makeResponsive(){
    //Define svg area dimensions
    var svgWidth = window.innerWidth;  //adjust to window's width. 
    var svgHeight = 500;
    // define margin
    var margin = {
        top:50,
        right:100,
        bottom:100,
        left:200
    };
    // define chart dimension:
    var chartWidth = svgWidth-margin.right-margin.left;
    var chartHeight = svgHeight-margin.top-margin.bottom;
    var svgArea=d3.select("body").select("svg")
    if(!svgArea.empty()){
        svgArea.remove();
    }
    // append svg group and hold the chart
    var $svg = d3.select("#svg")
        .append("svg")
        .attr("width",svgWidth)
        .attr("height",svgHeight);
    // shift the latter by left and top margins
    var chartGroup = $svg.append("g")
        .attr("transform",`translate(${margin.left},${margin.top})`);
    // retrieve data from csv file.
    d3.csv("data.csv",function(error,data){
        // console error
        if(error) throw error;
        console.log(data)
        var abbr = data.map(d=>d.abbr);
        // format data number
        data.forEach(d=>{
            d.poverty = +d.poverty,
            d.smoke= +d.smoke,
            d.activity = +d.physicalActivity,
            d.abbr=d.abbr
        });
        console.log(abbr)
        
        // define default xScale and yScale:
        var xColumn = "poverty";
        var yColumn = "physicalActivity";
        createXscale(xColumn);
        createYscale(yColumn);

        // define xScale's min and max
        function createXscale(columnName){
            xMin = d3.min(data,d=>{
                return d[columnName]-3   //can't use dotnotation here
            });
            xMax = d3.max(data,d=>{
                return d[columnName]+3
            });
            // console.log(xMin,xMax)
        }

        // define xScale
        var xScale = d3.scaleLinear()
            .range([0,chartWidth])
            .domain([xMin,xMax]);

        //define yScale min and max
        function createYscale(columnName){
            yMin = d3.min(data,d=>{
                return d[columnName] -3     //can't use dotnotation here
            });
            yMax = d3.max(data,d=>{
                return d[columnName]+3
            });
            // console.log(yMin,yMax)
        }

        // define yScale
        var yScale = d3.scaleLinear()
            .range([chartHeight,0])
            .domain([yMin, yMax]);

        // create axes
        var bottomAxis = d3.axisBottom(xScale);
        var leftAxis = d3.axisLeft(yScale);

        // append axes to chartGroup
        chartGroup.append('g')
            .attr('class','x-axis')
            .attr("transform",`translate(0,${chartHeight})`)
            .call(bottomAxis)
        chartGroup.append('g')
            .attr('class','y-axis')
            .call(leftAxis)
    
        // create bubble chart
        var circlesGroup = chartGroup.selectAll('circle')
            .data(data)
            .enter()
            .append("circle")
            .attr("cx", function (d) {
                return xScale(d[xColumn]);
            })
            .attr("cy",d=>yScale(d[yColumn]))
            .attr('r','15')
            .attr("fill","SteelBlue")
            .attr("opacity", 0.75);
        
        // add Yaxis lable
        chartGroup.append("text")
            .attr("text-anchor","middle")
            .attr("transform",`translate(-39,${chartHeight /2})rotate(-90)`)
            .attr("font-weight","bolder")
            .text("Physical Activity (%)");
        // add xAxis label
        chartGroup.append("text")
            .attr("text-anchor","middle")
            .attr("transform",`translate(${chartWidth /2},${chartHeight+margin.top})`)
            .attr("font-weight","bolder")
            .text("In Poverty (%)")
        // add tooltip 
        var toolTip = d3.tip()
            .attr("class","d3-tip")
            .offset([-10,0])
            .html(function(data){
                return `<p>${data.state}</p><hr><p>Poverty: ${data[xColumn]}</p><p>Physical Activity: ${data[yColumn]}</p>`
            })
        circlesGroup.call(toolTip);
        // add text on data points
        chartGroup.selectAll(".state")
            .data(data)
            .enter()
            .append("text")
            .attr('class','state')
            .attr("x",d=>xScale(d[xColumn]))
            .attr("y",d=>yScale(d[yColumn]))
            .text(d=>d.abbr)
            .attr("font-size", "12px")
            .attr("text-anchor", "middle")
            .attr("class","stateText")
            .attr("fill","white")
            .attr('opacity',0.75)
            .on("mouseover",toolTip.show)  //mouseover event
            .on('mouseout',toolTip.hide);  //mouseout event
    })
}


