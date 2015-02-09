var program = require('commander');
var chalk = require('chalk');
var Table = require('cli-table');
var fs = require('fs-extra'),
    path = require('path');
var child = require('child_process');
var recursive = require('recursive-readdir');
var inquirer = require("inquirer");

////////////get installed mods
function getDirectories(srcpath) {
	return fs.readdirSync(srcpath).filter(function(file) {
    return fs.statSync(path.join(srcpath, file)).isDirectory();
  });
}
function isValid(folder) {
  return fs.existsSync(path.join(__dirname, "mods", folder , "modinfo.json"))
}

var modlist = getDirectories(__dirname + '/mods');
var modlist = modlist.filter(isValid);
var modfiles = modlist.map(function(mod) {
	temp = JSON.parse(fs.readFileSync(path.join("mods", mod,"modinfo.json"), "utf8"))
	temp.filename = mod
	return temp;
});
//////

console.log(' ' + chalk.bgRed.bold('      Doto 2 Mod Manager       '));
////cli logic
program
  .command('enable [name]')
  .description('Enables specified mod')
  .action(function(env, options){
	if (!env || modlist.indexOf(env) == -1) {
		console.log(chalk.bgRed('ERROR:') + ' Invalid mod');
	} else {
		modfiles[modlist.indexOf(env)].enabled = true
		fs.writeFile(path.join("mods", env,"modinfo.json"), JSON.stringify(modfiles[modlist.indexOf(env)], null, 4), function(err) {
			if(err) {
			  console.log(chalk.bgRed('ERROR:') + " " + err);
			} else {
			  console.log(chalk.green('SUCCESS:') + " Mod " + chalk.bold(env) + " enabled");
			}
		}); 
	}
  });
  
program
  .command('disable [name]')
  .description('Disables specified mod')
  .action(function(env, options){
	if (!env || modlist.indexOf(env) == -1) {
		console.log(chalk.bgRed('ERROR:') + ' Invalid mod');
	} else {
		modfiles[modlist.indexOf(env)].enabled = false
		fs.writeFile(path.join("mods", env,"modinfo.json"), JSON.stringify(modfiles[modlist.indexOf(env)], null, 4), function(err) {
			if(err) {
			  console.log(chalk.bgRed('ERROR:') + " " + err);
			} else {
			  console.log(chalk.green('SUCCESS:') + " Mod " + chalk.bold(env) + " disabled");
			}
		}); 
		
	}
  });
  
program
  .command('remove [name]')
  .description('Removes specified mod')
  .action(function(env, options){
	if (!env || modlist.indexOf(env) == -1) {
		console.log(chalk.bgRed('ERROR:') + ' Invalid mod');
	} else {
		fs.removeSync(path.join(__dirname, "mods", env));
		console.log(chalk.green('SUCCESS:') + " Mod " + chalk.bold(path.basename(env)) + " removed");
	}
  });

  program
  .command('build')
  .description('Compiles the currently enabled mods to a vpk package that gets load by Dota')
  .action(function(env, options){
	fs.removeSync(path.join(__dirname, "temp"));
	modfiles.forEach(function(e, i) {
		if (e.enabled) {
			console.log('copying ' + e.filename + '...');
			fs.copySync(path.join("mods", e.filename), path.join(__dirname, "temp"));
		}
	});
	fs.removeSync(path.join(__dirname, "temp", "modinfo.json"));				
	recursive(path.join(__dirname, "temp"), ['modinfo.json'], function (err, files) {
		files = files.map(function(e) {
			console.log(e)
			return e.slice(__dirname.length + 6); //\ t e m p \ lol ugly
		});
		fs.outputFile(path.join(__dirname, "temp", "list.txt"), files.join('\r\n'));
		fs.copySync(path.join(__dirname, "vpk"), path.join(__dirname, "temp"));
		child.execFile(path.join(__dirname, "temp", "vpk.exe"), ["-M", "a", "pak01", "@" + path.join(__dirname, "temp", "list.txt")], {cwd : path.join(__dirname, "temp")}, function(error, stdout, stderr){
			
			files = fs.readdirSync(path.join(__dirname, "temp"));
			vpks = [];
			files.forEach(function(e) {
				if (e.slice(-3) == 'vpk') {
					//we good
					vpks.push(e)
					console.log('>>' + e);
				}
			});
			if (vpks.length == 0) {
				console.log(chalk.red('ERROR:') + " VPK creation failed");	
			}	else {
				fs.removeSync(path.join(__dirname, "..", "custom"))
				vpks.forEach(function(e) {
					fs.copySync(path.join(__dirname, "temp", e), path.join(__dirname, "..", "custom", path.basename(e)));
				});
				console.log(chalk.green('SUCCESS:') + " VPK was built");
			}
		}); 
	});	
  });
  
program
	.command('list')
	.description('Lists all installed mods')
	.action(function(env, options){
		// instantiate 
		var table = new Table({
			head: [chalk.cyan('_'), chalk.cyan('Name'), chalk.cyan('Description'), chalk.cyan('Author')]
		  , colWidths: [3, 15, 30, 20]
		});
		modfiles.forEach(function(e) {
			if (e.enabled) {
				status = chalk.green('X');
			} else {
				status = chalk.red('O');
			}
			table.push([status, e.filename, e.name, e.author]);
		})	 
		console.log(table.toString());	
  });

 
program
  .command('*')
  .description('Adds a folder as a new mod')
  .action(function(env){
    console.log('installing "%s"', env);
	if (modlist.indexOf(env) != -1) {
		console.log(chalk.red('ERROR:') + " this mod already exists");
		process.exit() 
	}
	var questions = [
	  {
		type: "input",
		name: "q_name",
		message: "Enter the name of your mod, keep it short, simple and unique",
		default: function () { return path.basename(env).replace(/\s+/g, '_').toLowerCase(); }
	  },
	  {
		type: "input",
		name: "q_author",
		message: "Who's the mods author?",
		default: function () { return "Unknown"; }
	  },
	  {
		type: "input",
		name: "q_namelong",
		message: "A short summary what this mod does"
	  }
	];
	
	if (fs.statSync(env).isDirectory()) {
		inquirer.prompt(questions, function( answers ) {
			
			fpath = path.join(__dirname, "mods", path.basename(answers.q_name).replace(/\s+/g, '_').toLowerCase())
			fs.copy(env, fpath, function (err) {
				if (err) {
					return console.error(err);
				}
				info =     {"name": answers.q_namelong,
							"version": "1.0.0",
							"description": "Too long for cmd, maybe add some credits later",
							"enabled": false,
							"author": answers.q_author,
							"filename": path.basename(fpath)}
				fs.writeFile(path.join(fpath, "modinfo.json"), JSON.stringify(info, null, 4), function(err) {
					if(err) {
					  console.log(chalk.bgRed('ERROR:') + " " + err);
					} else {
					  console.log(chalk.green('SUCCESS:') + " Mod " + chalk.bold(path.basename(fpath)) + " installed");
					}
				}); 
			});
		});
	}
	//process.stdin.resume();
  });
 

program.parse(process.argv);

if (!process.argv[2]) {
	program.help()
}