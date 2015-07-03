
(function (glob, factory) {
	factory(glob);
}
	(this, function (window) {

		/*** *** *** *** ***\
		 * Hegemony
		[ method ]
		 **
		\*** *** *** *** ***/
		function H() {};
		H.data = {};
		H.renderer;

		/*\
		 * PROPERTIES
		\*/
		H.properties = {
			"Planet.planet.originX.default" : 600,
			"Planet.planet.originY.default" : 600,
			"PlanetField.width.default" : 150,
			"PlanetField.height.default" : 60,
		};
		function getProperty(propertyName) {
			return H.properties[propertyName];
		}

		// Ensemble des fonctions publiques, exposées

		/**\
		 * Sauvegarde des données, sous forme de JSON.
		\**/
		H.save = function () {
			alert('Data Saved!');
			var savedData = window.open();
			savedData.document.write(JSON.stringify(this.data));
		};

		/**\
		 * Charge un fichier JSON permettant d'initialiser Hegemony.
		\**/
		H.load = function (data) {
			this.data = JSON.parse(data);
			refresh();
		};

		/**\
		 * Effectue le rendu de l'état d'Hegemony.
		\**/
		function rendering() {
			if (H.renderer == null) {
				H.renderer = Raphael('content', $('#content').width(), $('#content').height());
			}
			return H.renderer;
		}

		/**\
		 * Refresh
		 **
		 * Affiche le contenu de l'écran
		\**/
		function refresh() {
			rendering().clear();

			drawToolBox();

			var planetData = H.data.planets.FIRST;
			var planet = new Planet(planetData);
			//planet.render();
			//planet.save();

			var generatedP = Planet.generate("NewP", "oxygen", 300);
			generatedP.render();
		};

		function finalizePlayerTurn() {
			var game = findData("game");
			setData("game", "turnCount", game["turnCount"] + 1);
			alert("Turn : " + game["turnCount"]);
			refresh();
		};

		function findData(dataName) {
			var result = findChildRecursively(H.data, dataName);
			return result;
		};

		function setData(ownerName, propertyName, value) {
			var owner = findData(ownerName);
			owner[propertyName] = value;
		};

		/*\
		 * Fonction technique permettant de retrouver récursivement un enfant dans l'objet donné.
		\*/
		function findChildRecursively(ownerObject, childName) {
			for (child in ownerObject) {
				if (child == childName) {
					return ownerObject[childName];
				}
			}
			for (child in ownerObject) {
				var result = findChildRecursively(child, childName);
				if (result != null) {
					return result;
				}
			}
			return null;
		}

		/**\
		 * Planet
		[ method ]
		 **
		 * Permet de manipuler une planète.
		\**/
		function Planet(planetData) {
			if (typeof planetData == "String") {
				return Planet(JSON.parse(planetData));
			}

			this.name = planetData["name"];
			this.owner = planetData["owner"];
			this.planetType = planetData["planetType"];
			this.size = planetData["size"];

			this.planetFields = [];
			for (var field in planetData["fields"]) {
				var planetFieldData = planetData["fields"][field];
				var planetField = new PlanetField(this, planetFieldData);
				this.addPlanetField(planetField);
			}
		}
		(function (planetproto) {
			// Constantes
			Planet.originX = getProperty("Planet.planet.originX.default");
			Planet.originY = getProperty("Planet.planet.originY.default");
			/*\
			 * Effectue le rendu de la planète
			\*/
			planetproto.render = function () {
				var planetRenderer = rendering()
					.circle(Planet.originX, Planet.originY, this.size)
					.attr('fill', '#bbbbbb')
					.click(
						select);
				function select() {
					planetRenderer.attr('fill', 'green')
					planetRenderer.click(unselect);
				};
				function unselect() {
					planetRenderer.attr('fill', 'gray')
					planetRenderer.click(select);
				};
				function refreshPlanet() {};

				for (var planetField in this["planetFields"]) {
					this["planetFields"][planetField].render();
				}
			};

			/*\
			 * Ajoute un champ à la planète.
			\*/
			planetproto.addPlanetField = function (planetField) {
				this["planetFields"].push(planetField);
			};

			/*\
			 * Effectue la sauvegarde de la planète
			\*/
			planetproto.save = function () {
				H.data["planets"][this.name] = this;
			};

			/*\
			 * Permet de créer entièrement une planète
			\*/
			Planet.generate = function (name, planetType, size) {
				var generatedData = {};
				generatedData.name = name;
				generatedData.planetType = planetType;
				generatedData.size = size;

				var result = new Planet(generatedData);

				var firstFieldData = {};
				firstFieldData.originX = Planet.originX - PlanetField.halfWidth();
				firstFieldData.originY = Planet.originY - result.size; // + PlanetField.halfHeight();
				firstFieldData.available = true;

				var planetField = new PlanetField(result, firstFieldData);
				result.addPlanetField(planetField);

				// for(var i = 0; i

				return result;
			};

		})(Planet.prototype);

		/**\
		 * PlanetField
		[ method ]
		 **
		 * Permet de manipuler le champs d'une planète.
		\**/
		function PlanetField(planet, planetFieldData) {
			if (typeof planetFieldData == "String") {
				return PlanetField(JSON.parse(planetFieldData));
			}
			this.originX = planetFieldData["originX"];
			this.originY = planetFieldData["originY"];
			this.available = planetFieldData["available"];
			this.planetFieldType = "none";
		}
		(function (planetfieldproto) {
			// Constantes
			PlanetField.width = getProperty("PlanetField.width.default");
			PlanetField.height = getProperty("PlanetField.height.default");

			PlanetField.halfHeight = function () {
				var halfHeight = Math.floor(this.height / 2);
				return halfHeight;
			};
			PlanetField.halfWidth = function () {
				var halfWidth = Math.floor(this.width / 2);
				return halfWidth;
			};

			/*\
			 * Effectue le rendu du field
			\*/
			planetfieldproto.render = function () {
				var halfHeight = PlanetField.halfHeight();
				var halfWidth = PlanetField.halfWidth();
				var path =
					"M" + (this.originX) + " " + (this.originY)
					 + "l" + (halfWidth) + " " + (halfHeight)
					 + "l" + (halfWidth) + " " + (-halfHeight)
					 + "l" + (-halfWidth) + " " + (-halfHeight)
					 + "Z";

				var planetFieldRenderer = rendering().path(path)
					.attr('fill', 'gray').attr('fill-opacity', '0.7')
					.attr('stroke-width', '0.5')
					.hover(
						function () {
						this.attr('fill-opacity', '0.5');
					},
						function () {
						this.attr('fill-opacity', '0.7')
					}).click(
						select);
				if (!this.available) {
					planetFieldRenderer.transform("s0.25")
				}
				/* Comportement de sélection du champ. */
				function select() {
					planetFieldRenderer.attr('fill', 'green')
					planetFieldRenderer.click(unselect);
				}
				/* Comportement lorsque l'on dé-sélectionne du champ. */
				function unselect() {
					planetFieldRenderer.attr('fill', 'gray')
					planetFieldRenderer.click(select);
				}
			};

			/*\
			 * Génère les données relatives aux champ suivant.
			\*/
			planetfieldproto.nextRightFieldData = function () {
				var nextOriginX = this.originX + this.halfWidth();
				var nextOriginY = this.originY + this.halfHeight();

				var result = {};
				result.originX = nextOriginX;
				result.originY = nextOriginY;
				return result;

			};
			/*\
			 * Méthode statique, permettant de récupérer le champ de planète suivant pour une planète donnée, et un champ donné.
			\*/
			PlanetField.findNextPlanetField = function (planet, previousPlanetField) {};
			/*\
			 * Méthode statique, permettant de récupérer le premier champ de la planète donnée.
			\*/
			PlanetField.findPlanetField = function (planet) {};
		})(PlanetField.prototype);

		/*\
		 * Draw toolbox
		 **
		 * Affiche la boîte à outils du joueur
		\*/
		function drawToolBox() {
			var toolbox = rendering().rect($('#content').width() - 300, 0, 300, $('#content').height());
			toolbox.attr('fill', '#ccccdd');

			var nextTurnButton = rendering().text($('#content').width() - 290, 10, '>>');
			nextTurnButton.attr('text-anchor', 'start').attr('cursor', 'pointer');
			nextTurnButton.click(finalizePlayerTurn).hover(
				function () {
				this.attr('fill-opacity', '0.6')
			},
				function () {
				this.attr('fill-opacity', '1');
			});

			var saveButton = rendering().text($('#content').width() - 40, 10, 'Save');
			saveButton.attr('text-anchor', 'start').attr('cursor', 'pointer');
			saveButton.click(function () {
				H.save();
			}).hover(
				function () {
				this.attr('fill-opacity', '0.6');
			},
				function () {
				this.attr('fill-opacity', '1');
			});
		}

		/*\
		 * EXPOSE Hegemony
		\*/
		window.Hegemony = H;
		return H;
	}));

/**
 * Bootstrap
 */
$(document).ready(function () {
	$('#content').append('<input type="file" id="loading" />');
	$('#loading').change(loadHegemony);
}, false);

function loadHegemony(evt) {
	var file = evt.target.files[0];
	var reader = new FileReader();
	reader.onload = (function (theFile) {
		return function (e) {
			Hegemony.load(e.target.result);
		};
	})(file, this);

	reader.readAsText(file);
	$(this).hide();
}