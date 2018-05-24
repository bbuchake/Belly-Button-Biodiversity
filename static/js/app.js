
//Dropdown list object
var $selDataset = document.getElementById("selDataset")

//Populate dropdownlist
Plotly.d3.json("/names", function(error, response) {
    if (error) return console.warn(error);
    var sampleIDs = response;
    for (var i = 0; i < sampleIDs.length; i++) {
      var option = document.createElement("option");
      option.value = sampleIDs[i];
      option.text = sampleIDs[i];
      $selDataset.append(option);
    }
  })
  
// Pie chart
Plotly.d3.json("/samples/BB_940", function(error, response) {
    if (error) return console.warn(error);
    var data = [{values: response.sample_values.slice(0,10),
                labels: response.otu_ids.slice(0,10),
                type: "pie"}

    ];
    var layout = {autosize:false,
      width: 500, 
      height: 500,
      margin: {l: 20, r: 20, b: 20, t: 20}};
    
    Plotly.plot("pie", data, layout);
})

// Bubble chart
Plotly.d3.json("/samples/BB_940", function(error, response){
    if (error) return console.warn(error);
    var data = [{
        x: response.otu_ids,
        y: response.sample_values,
        mode: 'markers',
        marker: {
            color: response.otu_ids,
            size: response.sample_values
        }
    }];
    var layout = {
        height: 500,
        width: 700,
        title: "Belly Button Contents",
        xaxis: {title: "OTUs"},
        yaxis: {title: "Value by Sample"}
    };
    Plotly.plot("bubble", data, layout);

})

// Restyle pie chart
function updatePie(newdata) {

    var Pie = document.getElementById("pie");

    Plotly.restyle(Pie, "labels", [newdata.labels.slice(0,10)]);
    Plotly.restyle(Pie, "values", [newdata.values.slice(0,10)]);
    }

// restyle/update Bubble
function updateBub(newdata) {
    var Bub = document.getElementById("bubble");
    Plotly.restyle(Bub, "x", [newdata.labels]);
    Plotly.restyle(Bub, "y", [newdata.values]);
}


//Function for dropdowlist option change
function optionChanged(sample) {
    var sampURL = `/samples/${sample}`;
    var metaURL = `/metadata/${sample}`;
    // New data
    Plotly.d3.json(sampURL, function(error, response) {
      if (error) return console.warn(error);
      var vals = [];
      var labs = [];
      for (var i = 0; i < 50; i++){
        vals.push(response.sample_values[i]);
        labs.push(response.otu_ids[i]);
      }
      newdata = {values: vals, labels: labs};
      updatePie(newdata);
      updateBub(newdata);
    });
}

