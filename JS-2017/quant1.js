 // subroutine to estimate a proportion or test for a special value
 // Inputs: 
 //     2 category labels (default = Success/Failure) and a count for each 
 
    var q1SummDiv = d3.select("#q1Inference"),
        q1Tstdata,
        q1CIdata,
        q1Label,
        q1Values,
		q1hdr,
		q1CnfLvl = 0.80,
		q1CLvl,
		q1lowerBd,
		q1upperBd,
		q1MuNull,
        q1N,
        q1Pval,
        q1Shifted = [],
        q1SD,
        q1SEXbar,
        q1Xbar,
        q1TestDirection,
        q1Data = [],
        chartq1 ,
        q1Color = [],
        confLevels = [
			{ key: "80%", value: "0.80" },
			{ key: "90%", value: "0.90" },
			{ key: "95%", value: "0.95" },
			{ key: "99%", value: "0.99" }
		], 
		q1Inference,
		q1InfOutput,
		targetQuantile,
      	upperBd,
      	upperCI,
        resampleq1,
        sampleq1;

 var svgq1 = d3.select("#q1InfSVG");      
               
function summarizeMu1() {
      // builds summary table and dot plot for 1 quantitative variable
	var margin = 30, 
    	barHeight = 20,  
        colors = [],
        w = 300,  
        h = 60;  
      
      q1Label = document.getElementById("q1Label").value;
      q1Values = document.getElementById("q1Values").value.split(",");
      //console.log(q1Values);
      q1N = q1Values.length;
      for(i=0; i<q1N; i++){
      	q1Values[i] = +q1Values[i];
      }
      q1Xbar = d3.mean(q1Values);
      q1SD = d3.deviation(q1Values);
      q1SEXbar = q1SD / Math.sqrt(q1N);
      //console.log(q1Xbar);
             
      q1Summ = document.getElementById("q1SummaryText");
      q1Data = [{"label": "Xbar", "xx": q1Xbar},
      			{"label": "SE", "xx": q1SEXbar},
      			{"label": "Sample Size", "xx": q1N}];
      q1Summ.innerHTML = "x&#773; =  " + q1Xbar.toPrecision(5) +" <br> s = " +
              q1SD.toPrecision(5) + "<br> Sample Size = " + q1N;
      q1Summ.style = "display: block";  
     
	// use dotChart(data, svg)

}
	
function q1OnChange(arg) {
	// set colors for dots to illustrate confidence interval
	var sq1Len, 
		tempColors, twoTail;
      q1Label = document.getElementById("q1Label").value;
      q1Values = document.getElementById("q1Values").value.split(",");
      q1N = q1Values.length;
	 if(arg.value){
			q1CnfLvl = +arg.value;
		};
		if(q1CIdata){
			sq1Len  = q1CIdata[0].length;
			tempColors = colorMu1(q1CIdata[0]);
			 q1lowerBd = tempColors[1].toPrecision(4);
			 q1upperBd = tempColors[2].toPrecision(4);
			q1CIdata = [q1CIdata[0], tempColors[0] ];
			q1InfOutput = discreteChart(q1CIdata, q1InfSVG, q1CIinteract);
			sq1Len = q1CIdata[0].length;
			twoTail = Math.round((1 - q1CnfLvl)* sq1Len);
			if(twoTail % 2 === 1){ // check for odd number
				q1CnfLvl = q1CnfLvl - 1/sq1Len; // reduce to lower confidence
				//console.log(q1CnfLvl);
			}  
		} else{
			console.log("No resampled data for CI");
		}
		q1ftr = document.getElementById("q1OutputFoot1");
	 	q1ftr.innerHTML = //"<div style = 'height = 10'> </div>" +
	   "<div style = 'width:360px'> Mean "+ q1Label +" in  "+ sq1Len + " Re-samples" +
	   "<br> <br>"+ Math.round(q1CnfLvl*100)+ 
	   "% Confidence Interval: (" + q1lowerBd +", "+ q1upperBd +" )</div>";	   
}
	
var q1CIrangeslide = rangeslide("#q1ConfLvl", {
		data: confLevels,
		showLabels: true,
		startPosition: 0,
		showTicks: false,
        dataSource: "value",
        labelsContent: "key",
        valueIndicatorContent: "key",
		thumbWidth: 24,
		thumbHeight: 24,
		handlers: {
			"valueChanged": [q1OnChange]
		}
	});

function colorMu1(resample){
	// changes colors for CI illustration
	var color = [],
		lowerBd,
		upperBd,
		quantile, twoTail,
	    sq1Len = resample.length;
	  if(sq1Len > 0){  
	  	//console.log(q1CnfLvl, sq1Len);
	  	twoTail = (1 - q1CnfLvl)* sq1Len;
	  	quantile = Math.floor(twoTail / 2);
	  	if(! twoTail % 2){ // check for odd number 
	  		q1CnfLvl = q1CnfLvl - 1/sq1Len; // reduce to lower confidence
	  	} 
	  
		for(i=quantile; i <= sq1Len-quantile ; i++){
	      color[i] = 0; // color for middle circles
	  	} 
		for(i=0; i<= quantile; i++){
	  		color[i] = 1;   
	  		// color lower tail
	  		color[sq1Len-i-1] = 1;
	  		 // color upper tail
	  		lowerBd = resample[i];   // move lowerBd up
	  		upperBd = resample[sq1Len - i -1];  // move upperBd down
	  	}
	  } else{
	  	 console.log("No Data for CI");
	  }
	  return [color, lowerBd, upperBd];
}	
  
function estimateMu1(){
	//function to estimate the true mean based on resamples of original numeric data
	// Gather Inputs:
      
      q1Label = document.getElementById("q1Label").value;
      q1Values = document.getElementById("q1Values").value.split(",");
      q1N = q1Values.length;
      q1Xbar = d3.mean(q1Values);
      
	 q1hdr = document.getElementById("q1OutputHead1");
	 q1hdr.innerHTML = 
	 "<h4>Estimate True Mean with a Confidence Interval</h4>"; 
	  
 	  q1CLvl = document.getElementById("q1ConfLvl");
	  q1CLvl.style.display ="";
	  q1Tst = document.getElementById("q1Test");
	  q1Tst.style.display ="none";
	 // show plot
	   
	  resampleq1 = resample1Mean(q1Values,100).sort(function(a,b){return a - b});
	  sq1Len = resampleq1.length;
	  
	  CI =  colorMu1(resampleq1);
	  q1Color = CI[0];
	  q1lowerBd = CI[1].toPrecision(4);
	  q1upperBd = CI[2].toPrecision(4);
	  
	 q1ftr = document.getElementById("q1OutputFoot1");
	 q1ftr.innerHTML = 
	   "<div style='width=50px'></div>"+
	   "<div style = 'width:360px'> Mean "+ q1Label +" in  "+ sq1Len + " Re-samples" +
	   "<br> <br>"+ Math.round(q1CnfLvl*100) + 
	   "% Confidence Interval: (" + q1lowerBd +", "+ q1upperBd +" )</div>"; 
 	  
	  //console.log(q1lowerBd, q1upperBd);
	  
	 return([resampleq1, q1Color]);		
} 	  
 
 

function testMu1(tailChoice){
	//function to test 'Is the true mean  = some value?' for quantitative data
	// to force the null hypothesis to be true, we resample from 
	// a shifted distribution of values which has sample mean equal to the hypothesized mean.
	// Gather Inputs:
      
      q1Label = document.getElementById("q1Label").value;
      q1Values = document.getElementById("q1Values").value.split(",");
      q1MuNull = +document.getElementById("q1trueMu").value;
      q1N = q1Values.length;
      q1Xbar = d3.mean(q1Values);
      
      q1CLvl = document.getElementById("q1ConfLvl");
	  q1CLvl.style.display ="none";
	    
	  q1Tst = document.getElementById("q1Test");
	  q1Tst.style.display ="";
	 //q1Pval = undefined;
	  
      var sq1Len,
        shift = q1Xbar - q1MuNull;
        
      for(i=0; i < q1N; i++){
      	q1Shifted[i] = q1Values[i] - shift;
      }
      
	 if(tailChoice === 'undefined'){ 
	 	q1hdr = document.getElementById("q1OutputHead1");
	 	q1hdr.innerHTML = "<div class = 'w3-cell-row'> <div class = 'w3-cell' style = 'width:50%'> "+
	 		" Stronger evidence is sample mean </div>"+ 
  	 	   "<div class = 'w3-cell' style='width:40%'>"+
  	 	   "<select class = 'w3-select w3-card w3-border w3-mobile w3-pale-yellow' id='q1Extreme'"+
  	 	   " onchange = 'q1TestUpdate()' >"+ 
  				"<option value='lower'>Less Than or =</option>"+
  				"<option value='both' selected >As or More Extreme Than</option>"+
  				"<option value='upper'>Greater Than or =</option>"+
		   	"</select> </div>  <div class ='w3-cell' style = 'width:30%'> &nbsp;&nbsp;" + q1Xbar.toPrecision(4) +
		   	"</div> </div> ";
		   q1ftr.innerHTML = 
		   "<div  style = 'width:320px'> Mean "+ q1Label +" in samples from H<sub>0</sub>";
		 	sampleq1 = resample1Mean(q1Shifted, 100);
		 	sq1Len = sampleq1.length;
		 	console.log(d3.mean(sampleq1), sq1Len);
	 } else{
	 	
	 }
	 // TODO: clicking a point changes a table to show that proportion
	return(sampleq1);
} 	  

function q1TestUpdate(){
	var check, 
		extCount = 0,
		lowP,
		hiP,
		sq1Len;
 	q1Inference = 'test';
 	// get direction of evidence:
 	 q1TestDirection = document.getElementById("q1Extreme").value;
 	
 	if(!(sampleq1)){
 		sampleq1 = testMu1();
 	}
 	sq1Len = sampleq1.length;
 	 if(q1TestDirection ==="lower"){
 	 	for(i = 0; i < sq1Len; i++){
 	 		check = 0 + (sampleq1[i] <= q1Xbar);
 	 		extCount += check;
			q1Color[i] =  check; 	 		
 	 	}
 	 } else if(q1TestDirection ==="upper"){
 	 	for(i = 0; i < sq1Len; i++){
 	 		check = 0 + (sampleq1[i] >= q1Xbar) ;
 	 		extCount += check;
			q1Color[i] =  check; 	 		
 	 	}
 	 	
 	 } else{
		lowP = q1Xbar * (q1Xbar <= q1MuNull) + (2*q1MuNull - q1Xbar)*(q1Xbar > q1MuNull)+ 1/1000000;
		hiP  = q1Xbar * (q1Xbar >= q1MuNull) + (2*q1MuNull - q1Xbar)*(q1Xbar < q1MuNull)- 1/1000000;
 	 	for(i = 0; i < sq1Len; i++){
 	 		check = 0 + ((sampleq1[i] <= lowP)|(sampleq1[i] >= hiP));
 	 		extCount += check;
			q1Color[i] =  check; 	 		
 	 	} 	 	
 	 }
 	 //console.log(d3.sum(q1Color));
 	 q1Pval = extCount / sq1Len;
 	 q1Tstdata = [sampleq1, q1Color];
  	q1InfOutput = discreteChart(q1Tstdata, q1InfSVG, q1TestInteract ); 	
  	
	 q1ftr = document.getElementById("q1OutputFoot1");
	 q1ftr.innerHTML = 
	   "<div  style = 'width:320px'> Mean "+ q1Label +
	   " in " + sq1Len +" Samples from H<sub>0</sub> <br>"+
	   "p-value (strength of evidence): " + formatPvalue(extCount, sq1Len) + "</div>"; //
 	  
}

//function q1InteractWith(infOut){
//	var sample = infOut[1],  // values
//	    dots = infOut[0][0];    // circles on the chart
	//dots.style("fill","steelblue");
//}

function q1CIinteract(d,i){
	console.log(d.x);
	var q1modal = document.getElementById("q1SelectedSample");
	q1modal.style.display = "block";
	q1modal.innerHTML = d.x;
	// open modal box to show success and failure counts in the selected resample;
	window.onclick = function(event) {
    if (event.target == q1modal) {
        q1modal.style.display = "none";
    	}
	}
} ;

function q1TestInteract(d,i){
	//console.log(d.x);
	// open modal box to show success and failure counts in the selected sample;
} ;

function q1MoreSimFn(){
	// function to add more points to an estimate or test of one proportion
	var sq1Len,
		more = +document.getElementById("q1More").value,
		newValues =[];
	if(more > 0){
	 	
	if( q1Inference === 'test'){
	    newValues = resample1Mean(q1Shifted, more);
	    for(i=0; i < more; i++){
	      sampleq1.push(newValues[i]);
	    } 
	  sampleq1 = sampleq1.sort(function(a,b){return a - b});
	  console.log(d3.mean(sampleq1), sampleq1.length);
	  q1TestUpdate();
	  return(sampleq1);
	} else{
		newValues= resample1Mean(q1Values, more);
	    for(i=0; i < more; i++){
	        resampleq1.push(newValues[i]); 
	    }
	  //console.log(q1CnfLvl);
	  q1OnChange(q1CnfLvl);  
      return(resampleq1);  
	}
  }
}