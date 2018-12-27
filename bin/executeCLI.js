#!/usr/bin/env node
const fs = require('fs');
const hzExec = require("../src/execute.js");
const cliParser = require("command-line-args");
const pathOption = [
	{ name: 'path', defaultOption: true }
];
const mainOptions = cliParser(pathOption, { stopAtFirstUnknown: true });
const argv = mainOptions._unknown || [];
var args = {};
if ("path" in mainOptions) {
	//if (Object.keys(args).length > 1) throw new Error("Invalid command.");
	args.input = mainOptions.path;
}
if ("_unknown" in mainOptions) {
	const cliOptions = [
		{ name: "input", alias: "i", type: String },
		{ name: "output", alias: "o", type: String },
		{ name: "source", alias: "s", type: String },
		{ name: "compile", alias: "c", type: Boolean },
		{ name: "spawn", type: Boolean }
	];
	args = cliParser(cliOptions, {argv});
	if ("path" in mainOptions) args.input = mainOptions.path;
}
if (!("input" in args)) args.input = null;
if (!("output" in args)) args.output = null;
if (!("source" in args)) args.source = null;
if (!("compile" in args)) args.compile = false;
if (!("spawn" in args)) args.spawn = false;
function execute(source) {
	if (args.compile && args.output !== null) console.log("Compiling...");
	return hzExec(source, args.compile, args.spawn);
}
function inputSource(input, callback) {
	fs.readFile(input, function (error, buffer) {
		if (error) throw error;
		callback(buffer.toString());
	});
}
function stdInSource(callback) {
	var source = "";
	process.stdin.on("data", chunk => {
		source += chunk;
	});
	process.stdin.on("end", function () {
		callback(source);
	});
}

if (args.source !== null) {
	execute(args.source);
} else if (args.input !== null) {
	if (args.input === null) {
		console.error("Error: No script source given!");
		process.exitCode = 1;
		return;
	}
	if (args.output !== null) console.log("Opening " + args.input + " for execution.");
	inputSource(args.input, execute);
} else {
	stdInSource(execute);
}