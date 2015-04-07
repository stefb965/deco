var extractZip = require('extract-zip');
var Download = require('download');
var exec = require('child_process').exec;
var NW_VERSION = '0.12.0';
var osx_64 = './bin/nw/nwjs-v' + NW_VERSION + '-osx-x64/nwjs.app/Contents/MacOS/nwjs';
var linux_64 = './bin/nw/nwjs-v' + NW_VERSION + '-linux-x64/nw';
var os = require('os');
var fs = require('fs');


// we'll assume just 64 bit
if(os.arch() != 'x64'){
    throw 'we only support running tests on 64 bit machines'
}

if(os.platform() === 'darwin'){
    if(!fs.existsSync(osx_64)) {
        new Download({mode: '755', extract: true})
        .get('http://dl.nwjs.io/v0.12.0/nwjs-v' + NW_VERSION + '-osx-x64.zip')
        .dest('./bin/nw')
        .run(function (err, files) {
            if(err){
                return console.error(err);
            }
            runNw(osx_64);
        });
    }
    else{
        runNw(osx_64);
    }

}
else if(os.platform() === 'linux'){
    if(!fs.existsSync(linux_64)) {
        new Download({mode: '755', extract: true})
        .get('http://dl.nwjs.io/v0.12.0/nwjs-v' + NW_VERSION + '-linux-x64.tar.gz')
        .dest('./bin/nw')
        .run(function (err, files) {
            if(err){
                return console.error(err);
            }
            runNw(linux_64);
        });
    }
    else{
        runNw(linux_64);
    }
}
else{
    throw 'we only support running tests on mac and linux for now'
}

function runNw(nwPath){
    var nw = exec(nwPath + ' ./dist/tests');
    nw.stdout.on('data', function (data) {
        process.stdout.write(data);
    });
    var onError = false;
    nw.stderr.on('data', function (data) {
        if(data.indexOf('DEBUG:') === -1 &&
            data.indexOf('DEPRECATION:') === -1 &&
            data.indexOf('(file:') === -1){
            data = data.replace(/\[.*\]/g, "");
            data = data.replace(/\, source.*/g, "");
            data = data.replace(/\"/g, "");
            
            
            if (data.match(/ok \d+/) !== null && data.match(/not ok/) === null)
            {
                onError = false;
            }

            if(data.trim().length > 0){
                if(!onError){
                    process.stdout.write(TrimBeginningWhiteSpace(data));    
                    if(data.match(/not ok/) !== null){
                        onError = true;
                    }
                }
                else{
                    process.stderr.write(TrimBeginningWhiteSpace(data));
                }
            }
        }
    });
    nw.on('exit', function (code) {
        setTimeout(function(){
            process.exit(code);
        }, 2000);
    });   
}

function TrimBeginningWhiteSpace(str){  
  while(str.charAt(0) == (" ") ){str = str.substring(1);}
  while(str.charAt(str.length-1) ==" " ){str = str.substring(0,str.length-1);}
  return str;
}