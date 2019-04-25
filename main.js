
var http = require('http'), request = require('request'), moment = require('moment');
var rootUrl = process.env.URL || "http://localhost";
var PORT = process.env.PORT || 5200;

var stateList = ['ALASKA','CALIFORNIA','COLORADO','OREGON','UTAH','HAWAII']
var stateData = {}
var stateResult = {}

rootUrl += PORT;

//https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson
moment.relativeTimeThreshold('s', 59);
moment.relativeTimeThreshold('m', 59);
moment.relativeTimeThreshold('h', 23);
moment.relativeTimeThreshold('d', 28);
moment.relativeTimeThreshold('M', 12);

	var express = require('express');
	var app = express();
	process.on('SIGTERM', () => {
	  console.info('SIGTERM signal received.');
	});
	process.on('SIGINT', () => {
	  console.info('SIGINT signal received.');
	  //onShutdown()
	  process.exit()
	});
	app.use(express.static(__dirname + '/public'));
	//app.set('port', );

	app.set('port', PORT);
	app.listen(PORT,function(){
		console.log('Earthquakeint app listening on port' +  PORT)
	})
	
	app.get('/api/:state', function(req, response) {
		
							getWeekEQData = function(e,r,b,stateName){
							function percentChange(v1,v2){
							    if(isNaN(v1) || isNaN(v2)){
							      return ''
							    }
							    return ((v1 - v2) / v2) * 100
							  }
							var stateParse = function(state,str){
								if(state == 'CALIFORNIA' && typeof str == 'string'){
									str = str.split(',')
									if(str.length === 2){
										if(str[1].trim() == 'CA'){
											return true
										}
									}
								}else{
								// determine if string contains the state
								// wont work for two word state such as New Mexico
									str = str.toUpperCase()
									var chk = str.split(', '+state.toUpperCase())
									if(chk.length == 2 || chk.length == 3){
										return true
									}
								}
								return false

							}
							if(typeof e == 'undefined' || !e){
								if(typeof r == 'undefined'){
									console.log("Response empty")
									return false
								}
								if(typeof b == 'undefined' || !b || b == null){
									console.log("Body empty")
								}else{
									var t = JSON.parse(b)
									var r = []

									for (var i = t.features.length - 1; i >= 0; i--) {
										var quake = t.features[i].properties
										stateList.filter(function(state,stateIndex){
											if(stateParse(state,quake.place)){
												if(quake.mag > 2){
													var newObj = {
														mag : quake.mag,
														place : quake.place,
														time : moment(quake.time),
													}
													if(typeof stateData[state] == 'undefined'){
														stateData[state]= []
													}
													stateData[state].push(newObj)
													r.push(newObj)
												}
											}else{
												console.log("String not found")
												console.log(quake.place)
											}
										})
										/*
										if(stateParse('Alaska',quake.place)){
											if(quake.mag > 2){
												var newObj = {
													mag : quake.mag,
													place : quake.place,
													time : moment(quake.time),
												}
												r.push(newObj)
											}
										}*/
									}
									var result = []
									for(var stateKey in stateData){
										var s = stateData[stateKey]
										
										s.filter(function(q,i){
											if( i > 0  ){
											var lastElement = s[i-1].time
											var thisElement = s[i].time
											var lastElementMag = s[i-1].mag
											var thisElementMag = s[i].mag 
											percentChange(s[i-1].mag,s[i].mag) 
											//console.log( r[i].mag + ' ' + moment(r[i].time).calendar()  + ':' +  + percentChange(r[i].mag,r[i-1].mag).toFixed(2)  + ' in ' + thisElement.from(lastElement))
											var output = {
												place: s[i].place,
												mag : s[i].mag,
												calTime : moment(s[i].time).calendar(),
												percentChange : percentChange(s[i].mag,s[i-1].mag).toFixed(2),
												changeDuration : thisElement.from(lastElement,true),
												fromNow : moment(s[i].time).fromNow()
											}
											// check if change duration is within appropriate ammount?
											var durationCheck = output.changeDuration.split(' minutes')
											if(durationCheck.length == 2){
												var minutesCheck = parseInt(durationCheck[0])
												if(minutesCheck && typeof minutesCheck == 'number'){
													output.changeDurationMin  = minutesCheck
													if(typeof stateResult[stateKey] == 'undefined'){
														stateResult[stateKey] = []
													}
													stateResult[stateKey].push(output)
												}
											}else{
												durationCheck = output.changeDuration.split(' hours')
												if(durationCheck.length == 2){
													var hoursCheck = parseInt(durationCheck[0])
													if(hoursCheck && typeof hoursCheck == 'number'){
														if(typeof stateResult[stateKey] == 'undefined'){
															stateResult[stateKey] = []
														}
													stateResult[stateKey].push(output)
													}
												}
											}
										}
										/*
										else{
											if(i === 0){
												console.log('init')
											}else{
												console.log('last')
											}
										}
										*/
										})
									}
									r.filter(function(q,i){
										return false
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
											// check if change duration is within appropriate ammount?
											var durationCheck = output.changeDuration.split(' minutes')
											if(durationCheck.length == 2){
												var minutesCheck = parseInt(durationCheck[0])
												if(minutesCheck && typeof minutesCheck == 'number'){
													output.changeDurationMin  = minutesCheck

													result.push(output)
												}
											}else{
												durationCheck = output.changeDuration.split(' hours')
												if(durationCheck.length == 2){
													var hoursCheck = parseInt(durationCheck[0])
													if(hoursCheck && typeof hoursCheck == 'number'){
														result.push(output)
													}
												}
											}
										}
										/*
										else{
											if(i === 0){
												console.log('init')
											}else{
												console.log('last')
											}
										}
										*/
									})

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
										console.log(
											o.mag + '\t' + 
											o.percentChange + "\t" + 
											o.changeDuration + "\t" + 
											o.fromNow + "\t" + 
											interval
										)
									})
								}
							}else{
								console.log("Request issue")
								console.log(e)
							}
						}

		response.setHeader('Content-Type', 'application/json');
		if(typeof req.params.state == 'string' && req.params.state != 'undefined'){
			// normalize string
			var theState = req.params.state.trim().toUpperCase()
			
			if(stateList.indexOf(theState) > -1){
				console.log("state in state list")

				request('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson',getWeekEQData)

			}else{
				console.log(theState + ' is not in state list.')
			}
		}
	/*	var ordered_move = {}
		for(var exchange in cryptoSocket.Exchanges){

		}
	*/
		//response.send(JSON.stringify({price:cryptoSocket.Exchanges,move:move_data,binance_t:binance_trades,balances:cryptoSocket.Balances,averages:globalAverages}));
	});

	app.get('/',function(req,res){
	       
	     res.sendFile('index.html');

	});
	app.get('/ak',function(req,res){
		res.setHeader('Content-Type', 'application/json');
		res.end(JSON.stringify(stateResult['ALASKA']))
	})
	app.get('/ca',function(req,res){
		res.setHeader('Content-Type', 'application/json');
		res.end(JSON.stringify(stateResult['CALIFORNIA']))
	})
	app.get('/hi',function(req,res){
		res.setHeader('Content-Type', 'application/json');
		res.end(JSON.stringify(stateResult['HAWAII']))
	})
var main = function(){

	getWeekEQData = function(e,r,b,stateName){
		function percentChange(v1,v2){
		    if(isNaN(v1) || isNaN(v2)){
		      return ''
		    }
		    return ((v1 - v2) / v2) * 100
		  }
		var stateParse = function(state,str){
			// determine if string contains the state
			// wont work for two word state such as New Mexico
			var chk = str.split(', '+state)
			if(chk.length == 2 || chk.length == 3){
				return true
			}
			return false
		}
		if(typeof e == 'undefined' || !e){
			if(typeof r == 'undefined'){
				console.log("Response empty")
				return false
			}
			if(typeof b == 'undefined' || !b || b == null){
				console.log("Body empty")
			}else{
				var t = JSON.parse(b)
				var r = []
				for (var i = t.features.length - 1; i >= 0; i--) {
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
						// check if change duration is within appropriate ammount?
						var durationCheck = output.changeDuration.split(' minutes')
						if(durationCheck.length == 2){
							var minutesCheck = parseInt(durationCheck[0])
							if(minutesCheck && typeof minutesCheck == 'number'){
								output.changeDurationMin  = minutesCheck
								result.push(output)
							}
						}else{
							durationCheck = output.changeDuration.split(' hours')
							if(durationCheck.length == 2){
								var hoursCheck = parseInt(durationCheck[0])
								if(hoursCheck && typeof hoursCheck == 'number'){
									result.push(output)
								}
							}
						}
					}
					/*
					else{
						if(i === 0){
							console.log('init')
						}else{
							console.log('last')
						}
					}
					*/
				})
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
					console.log(
						o.mag + '\t' + 
						o.percentChange + "\t" + 
						o.changeDuration + "\t" + 
						o.fromNow + "\t" + 
						interval
					)
				})
			}
		}else{
			console.log("Request issue")
			console.log(e)
		}
	}
	request('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson',getWeekEQData)	
}
