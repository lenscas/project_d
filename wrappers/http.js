exports.init = function(appPath,configPath){
	//const request = require("request");
	const http = require("http");
	return {
		put : function(data){
            data.method = "put";
            data.write = JSON.stringify(data.data)
            data.headers = data.headers || {}
            data.headers["Content-Length"] = data.write.length
            data.headers["Content-Type"] = 'application/json'
            
			if(!data.callBack){
				new ReferenceError("data.callBack is not defined.")
            }
            this.send(data)
            
		},
		get  : function(data){
			data.method = "get";
			if(!data.callBack){
				new ReferenceError("data.callBack is not defined.")
			}
			if(data.data){
				data.url += "?";
				let first=true;
				Object.keys(data.data).forEach(value=>{
					if(first){
						first=false;
					} else {
						data.url +="&";
					}
					data.url +=value+"="+data.data[value];
				});
			}
			this.send(data);
		},
		send : function(data){
			const url = "/api/" +data.url;
            let basic = {
                hostname : "0.0.0.0",
                port     : 3000,
                path     : url,
                headers  : data.headers || {}
            }
            let ret = resp =>{
                let respData = "";
                resp.on("data",chunk => {
                    respData += chunk;
                });
                resp.on("end",()=>{
                    let returnData;
                    let hasErrored=false;
                    try{
                        returnData = JSON.parse(respData)
                    }
                    catch(e){
                        hasErrored = true;
                    }
                    if(!hasErrored){
                        data.callBack(returnData);
                    }
                    
                });
            }
            if(data.method == "get"){
				let req = http.get(
					basic,
					ret
				)
				req.on('error', function (err) {
					console.log('error: ' + err.message);
				});
			} else if(data.method == "put") {
                basic.method = "PUT"
                let req = http.request(
                    basic,
                    ret
                )
                req.write(data.write)
                req.end()
            }
			
		}
	}
}