'use strict'

/* Глобальные переменные для всей программы */
let structure;
let	controller;
let date = {};
let logic = {}; 

/* Общие функции приложения миграции */
/* Функция очистки конфигурационных файлов */
function сlearConfig() {
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

/* Функция запускающая процесс миграции */
function migration() {

	if( structure == null || controller == null) {
		alert("Добавьте все конфигурационные файлы.");
		return false;
	} else {

		removeMigrationWeb();

		createLogic(getLexemController(controller));
		createStructure();

		alert("Миграция выполнена.");
	}

	return true;
}

/* Функция удаления элементов страници миграции */
function removeMigrationWeb() {
	let wrapper = document.getElementById("wrapper");

	wrapper.parentNode.removeChild(wrapper);
}

/* Функции работы с логикой */
/* Функция миграции логики */
function controllerManage(input) {
	let file = input.files[0];

	let reader = new FileReader();

	reader.readAsText(file);

	reader.onload = function() {
		controller = reader.result;
		alert(controller);
	}

	reader.onerror = function() {
		alert(reader.error);
	};
}

/* Функция создания массива лексем из класса controller */
function getLexemController(str) { 
	let arrayLexem = str.split('\n');

	arrayLexem = deleteEmptyItem(arrayLexem).join(' ').split(' ');

	arrayLexem = deleteEmptyItem(arrayLexem);

	arrayLexem = arrayLexem.map((item) => item.replace(/\s+/g, ''));

	return arrayLexem.map((item) => item.replace(/\s+/g, ''));
}

/* Функции работы с файлом логики*/
function createLogic(arrayLexem) {
	for(let i = 0; i < arrayLexem.length; i++) {

		if(arrayLexem[i] == "void") {
			let action = arrayLexem[i + 1].slice(0, -2),
				nameDate,
				nameField;
			i++;

			while(arrayLexem[i] != "}") {

				if(arrayLexem[i] == "Date") {
					nameDate = arrayLexem[i + 1];
					i++;
				}

				if(arrayLexem[i].includes("setText")) {
					nameField = arrayLexem[i].split('.')[0];
					logic[action] = createFunctionDate(nameDate, nameField);
				}

				i++;
			}	
		}
	}
}

function deleteEmptyItem(arr) {
	for(let i = 0; i < arr.length; i++) {
		if(arr[i] == false) {
			arr.splice(i, 1);
			i--;
		}
	}

	return arr;
}

/* Создание логики каждого типа */

//let click = eval("function click() {let now = new Date(); return now;}");
function createFunctionDate(nameDate, nameField) {
	let code = "let " + nameDate + " = new Date();" +
			   "let " + nameField + " = document.getElementById('" + nameField +"');" + 
			    nameField + ".value = " + nameDate + ";"; 

	return new Function('', code);
}

/*
let click = createFunctionDate();

click();
*/

/* Функции работы со структурой и оформлением */
/* Функция миграции оформления и стилей */
function structureManage(input) {
	let file = input.files[0];

	let reader = new FileReader();

	reader.readAsText(file);

	reader.onload = function() {
		structure = reader.result;
		alert(structure);
	};

	reader.onerror = function() {
		alert(reader.error);
	};
}

/* Функции обработки структуры и оформления */
function createStructure() {
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

	let style = document.createElement("style");

	style.type = "text/css";
	style.innerHTML = getStyleFromJSON(children["style"], div.className);
	document.getElementsByTagName('head')[0].appendChild(style);

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
}

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
	nodeTextField.id = textField["fx:id"];

	let style = document.createElement("style");

	style.type = "text/css";
	style.innerHTML = getStyleFromJSON(textField["style"], nodeTextField.id);
	document.getElementsByTagName('head')[0].appendChild(style);

	nodeTextField.className = nodeTextField.id;

	div.append(nodeTextField);
}

/* Функции обработки оформления */
function getStyleFromJSON(str, selector) {
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

	return "." + selector + " { " + arrayStyle.join(' ') + '}';
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

/* Функция создания новой страницы */
/*function createDOM() {
	let newDOM = window.open("", "Web App");

	newDOM.document.open();

	newDOM.document.write("<html><head><meta charset='utf-8'><title>Веб-приложение</title></head>");
	newDOM.document.write("<body><p>Hey</p></body></html>");

	return newDOM;
} Эта идея требует много времени реализации*/