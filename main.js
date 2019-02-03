
var http = require('http');


//var fs = require('fs');
var request = require('request');
var moment = require('moment');

var rootUrl = process.env.URL || "http://localhost:5200";
var PORT = process.env.PORT || 5200;


//https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson
moment.relativeTimeThreshold('s', 59);
moment.relativeTimeThreshold('m', 59);
moment.relativeTimeThreshold('h', 23);
moment.relativeTimeThreshold('d', 28);
moment.relativeTimeThreshold('M', 12);

var main = function(){
	getWeekEQData = function(e,r,b){
		function percentChange(v1,v2){
		    if(isNaN(v1) || isNaN(v2)){
		      return ''
		    }
		    let num = v1 - v2
		    return (num / v2) * 100
		  }
		var stateParse = function(state,str){
			// determine if string contains the state
			var chk = str.split(', '+state)
			console.log(chk)
			if(chk.length == 2){
				//console.log("String " + str + ' contains ' + state)
				return true
			}
			return false

		}
		if(typeof e == 'undefined' || !e){
			if(typeof r == 'undefined'){
				console.log("Response empty")
			}else{
				
			}
			if(typeof b == 'undefined'){
				console.log("Body empty")
			}else{
				console.log(typeof b)
				var t = JSON.parse(b)
//				console.log(t.features)
				var r = []
				for (var i = t.features.length - 1; i >= 0; i--) {
					//console.log(t.features[i].properties)
					var quake = t.features[i].properties
					if(stateParse('Alaska',quake.place)){
						if(quake.mag > 2){
							var newObj = {
								mag : quake.mag,
								place : quake.place,
								time : moment(quake.time),
							}

							r.push(newObj)
						}
					}
				}
				var result = []
				r.filter(function(q,i){
					if( i > 0  ){
						var lastElement = r[i-1].time
						var thisElement = r[i].time
						var lastElementMag = r[i-1].mag
						var thisElementMag = r[i].mag 
						percentChange(r[i-1].mag,r[i].mag) 
						//console.log( r[i].mag + ' ' + moment(r[i].time).calendar()  + ':' +  + percentChange(r[i].mag,r[i-1].mag).toFixed(2)  + ' in ' + thisElement.from(lastElement))
						var output = {
							mag : r[i].mag,
							calTime : moment(r[i].time).calendar(),
							percentChange : percentChange(r[i].mag,r[i-1].mag).toFixed(2),
							changeDuration : thisElement.from(lastElement,true),
							fromNow : moment(r[i].time).fromNow()

						}
						//console.log(output)
						// check if change duration is within appropriate ammount?
						var durationCheck = output.changeDuration.split(' minutes')
						if(durationCheck.length == 2){
							var minutesCheck = parseInt(durationCheck[0])
							if(minutesCheck && typeof minutesCheck == 'number'){
								//if(minutesCheck > 30){
									output.changeDurationMin  = minutesCheck
									result.push(output)

								//}
							}

						}else{
							durationCheck = output.changeDuration.split(' hours')
							if(durationCheck.length == 2){
								var hoursCheck = parseInt(durationCheck[0])
								if(hoursCheck && typeof hoursCheck == 'number'){
									//console.log("HOURS CHECK?")
									//console.log(output)
									result.push(output)
								}
							}

						}
					}else{
						if(i === 0){
							console.log('init')
						
						}else{
							console.log('last')
							//result.push({
							//	mag: q.mag,
							//	calTime : moment(q.time).calendar(),
							//	percentChange : percentChange(r[i-1].mag,q.mag).toFixed(2),
							//	changeDuration : thisElement.from(lastElement,true)
							//	latest: true
							//})

						}
					}
					console.log(result.calTime)
				})
				//console.log(result)
				console.log("Mag\t%Change\tDuration")
				result.map(function(o){
					// day check, show date where timeago is more than a day or an hour?
					var fromNowChk = ['hours','day','days']
					var interval = false
					fromNowChk.filter(function(i){
						var chk = o.fromNow.split(i)
						if(chk.length == 2){
							interval = i
						}
					})
					console.log(o.mag + '\t' + o.percentChange + "\t" + o.changeDuration + "\t" + o.fromNow + "\t" + interval)
				})

			}
		}else{
			console.log("Request issue")
			console.log(e)
		}
		
	}
	request('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson',getWeekEQData)	


}

main()
