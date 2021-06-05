'use strict'

let structure;
let	controller;
let date = {};
let logic = {}; 

function deleteConfig() {

	if( structure != null || controller != null) {
		structure = null;
		controller = null;

		logic = {};

		alert("Файлы очищены.");
	} else {
		alert("Файлы не добавлены.");
	}

	return true;
}

function migration() {
	alert("Здесь должна быть миграция.");
}

/* Функция миграции оформления и стилей */
function structureManage(input) {
	
	if(!checkController()) {
		return false;
	}

	let file = input.files[0];
	//alert('File name: ' + file.name);

	let reader = new FileReader();

	reader.readAsText(file);

	reader.onload = function() {
		structure = reader.result;
		alert(structure);

		let jsonObj = JSON.parse(structure);
		
		/*for(let key in jsonObj) {
			alert(`${key}: ${jsonObj[key]}`);

			if(typeof(jsonObj[key]) == 'object') {
				for(let innerKey in jsonObj[key]) {
					alert(`${innerKey}: ${jsonObj[key][innerKey]}`);
				}
			}
		}*/

		let children = jsonObj["AnchorPane"]["children"];

		let div = document.createElement('div');
			div.className = "note";
			document.body.append(div);

		for(let item in children) {

			switch (item) {
				case "Label":
					createLabel(children[item], div);
					break;
				case "Button":
					createButton(children[item], div);
					break;
				case "TextField":
					createTextField(children[item], div);
					break;
				default:
					break;
			}
		}
	};

	reader.onerror = function() {
		alert(reader.error);
	};
}

/* Функция миграции логики */
function controllerManage(input) {
	let file = input.files[0];
	//alert('File name: ' + file.name);

	let reader = new FileReader();

	reader.readAsText(file);

	reader.onload = function() {
		controller = reader.result;

		createLogic(getLexemController(controller));
	}

	reader.onerror = function() {
		alert(reader.error);
	};
}

/* Функции проверки */
function checkJSON() {
	if(!structure) {
		alert("Файл структуры не был добавлен.")

		return false;
	}

	alert(structure);

	return true;
}

function checkController() {
	if(!controller) {
		alert("Файл логики не был добавлен.")

		return false;
	}

	alert(controller);

	return true;
}

/* Функции обработки оформления */

/* Создание каждого элемента приложения */ 
function createLabel(label, div) {
	let nodeLabel = document.createElement('p');
	nodeLabel.innerHTML = label["text"];
	div.append(nodeLabel);
}

function createButton(button, div) {
	let nodeButton = document.createElement("button");
	nodeButton.innerHTML = button["text"];
	nodeButton.id = button["fx:id"];
	//nodeButton.onclick = window[button["onAction"].slice(1)];
	//alert(button["onAction"].slice(1));
	nodeButton.onclick = logic[button["onAction"].slice(1)]; // Определение функции логики для кнопки
	//nodeButton.onclick = logic.click;
	//alert(logic.click);
	div.append(nodeButton);
}

function createTextField(textField, div) {
	let nodeTextField = document.createElement("input");
	nodeTextField.id = "textField";

	let style = document.createElement("style");

	style.type = "text/css";
	style.innerHTML = getStyleFromJSON(textField["style"]);
	document.getElementsByTagName('head')[0].appendChild(style);

	nodeTextField.className = "textField";

	div.append(nodeTextField);
}

/* Функции работы с файлом логики*/
function deleteEmptyItem(arr) {
	for(let i = 0; i < arr.length; i++) {
		if(arr[i] == false) {
			arr.splice(i, 1);
			i--;
		}
	}

	return arr;
}

function createLogic(arrayLexem) {
	let action;

	alert(arrayLexem);

	for(let i = 0; i < arrayLexem.length; i++) {

		if(arrayLexem[i] == "void") {
			action = arrayLexem[i + 1].slice(0, -2);
			i++;

			alert(action);

			while(arrayLexem[i] != "}") {
				//alert(arrayLexem[i]);

				if(arrayLexem[i] == "Date") {
					let nameDate = arrayLexem[i + 1];

					let btn = document.getElementById("btn");

					logic[action] = createFunctionDate(nameDate);

					i++;
				}

				i++;
			}
		}
	}
}

/* Создание логики каждого типа */

//let click = eval("function click() {let now = new Date(); return now;}");
function createFunctionDate(nameDate) {
	let code = "let " + nameDate + " = new Date();" +
			   "let textField = document.getElementById('textField');" + 
			   "textField.value = " + nameDate + ";"; 

	return new Function(code);
}

/*
let click = createFunctionDate();

click();
*/

/* Функция создания массива лексем из класса controller */
function getLexemController(str) { 
	let arrayLexem = str.split('\n');

	arrayLexem = deleteEmptyItem(arrayLexem).join(' ').split(' ');

	arrayLexem = deleteEmptyItem(arrayLexem);

	arrayLexem = arrayLexem.map((item) => item.replace(/\s+/g, ''));

	return arrayLexem.map((item) => item.replace(/\s+/g, ''));
}

/* Функции обработки оформления */
function getStyleFromJSON(str) {
	let arrayStyle = str.split(' ');

	for(let i = 0; i < arrayStyle.length; i++) {

		if(arrayStyle[i].slice(0, 4) == "-fx-") {
			arrayStyle[i] = arrayStyle[i].substring(4)
		}
	}

	for(let i = 0; i < arrayStyle.length; i++) {

		if (arrayStyle[i] == "border-radius:" || 
			arrayStyle[i] == "background-radius:" || 
			arrayStyle[i] == "border-width:" ||
			arrayStyle[i] == "width:" ||
			arrayStyle[i] == "height:") {
			arrayStyle[i + 1] = arrayStyle[i + 1].slice(0, -1) + "px" + ';';
		}
	}

	return ".textField { " + arrayStyle.join(' ') + '}';
}