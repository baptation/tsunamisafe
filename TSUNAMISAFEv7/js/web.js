// Initialisation des deux fonds de carte : 
// Fond de carte données routières :
var fond = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
	attribution: '<a target="_blank" href="https://www.geoportail.gouv.fr/">Geoportail France</a>',
	bounds: [[-75, -180], [81, 180]],
	minZoom: 2,
	maxZoom: 22,
	apikey: 'choisirgeoportail',
	format: 'image/png',
	style: 'normal'
});
//Fond de carte avec images satellites uniquement :
var fondsat = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/{z}/{x}/{y}?access_token=sk.eyJ1IjoibWd4bWFwYm94IiwiYSI6ImNsaGhqYWtkcDA2MzMza21wbWxlZXM2NjcifQ.o-zagZeblhCDm03jWYjTNw', {
	bounds: [[-75, -180], [81, 180]],
	minZoom: 2,
	maxZoom: 22,
	apikey: 'choisirgeoportail',
	format: 'image/png',
	style: 'normal'
});
//Affichage de la carte par défaut au lancement de la page web : 
var map = L.map('map', {
    
    zoom: 12,
    layers: [fond]
    });
//Ajout des deux fonds de carte à la page : 
var baseLayers = {
    'Carte routière': fond,
    'Images satellites': fondsat,
    };
L.control.layers(baseLayers).addTo(map);


// Récupération des blocs
var mainMenu = document.querySelector("#menu");
var burgerMenu = document.querySelector("#menu-burger");


// Vérifie si l'événement touchstart existe et est le premier déclenché
var clickedEvent = "click"; // Au clic si "touchstart" n'est pas détecté
window.addEventListener('touchstart', function detectTouch() {
	clickedEvent = "touchstart"; // Transforme l'événement en "touchstart"
	window.removeEventListener('touchstart', detectTouch, false);
}, false);

// Créé un "toggle class" en Javascrit natif (compatible partout)
burgerMenu.addEventListener(clickedEvent, function(evt) {
	console.log(clickedEvent);
	// Modification du menu burger
	if(!this.getAttribute("class")) {
		this.setAttribute("class", "clicked");
	} else {
		this.removeAttribute("class");
	}
	// Créé l'effet pour le menu slide (compatible partout)
	if(mainMenu.getAttribute("class") != "visible") {
		mainMenu.setAttribute("class", "visible");
	} else {
		mainMenu.setAttribute("class", "invisible");
	}
}, false);


// Affichage des fichiers kml
var refuge = omnivore.kml('kml/refuge.kml').addTo(map)
var zone = omnivore.kml('kml/zone.kml').addTo(map)


// Initialisation du marqueur de la position
var lastmarker;


// Affichage de la position en temps réel
navigator.geolocation.watchPosition(function(position) {
    var latlng = [position.coords.latitude, position.coords.longitude];
    if (lastmarker) {
        map.removeLayer(lastmarker);
    }
    var marker = L.marker(latlng).setIcon(L.icon({
        iconUrl: 'logo/loc.png',
        iconSize: [40, 40],
        iconAnchor: [20, 20]
    })).addTo(map);
    lastmarker = marker;
});


// Fonction récupérant les coordonnées entrées dans le popup
function saveCoords() {
    var lat = document.getElementById("lat").value;
    var lng = document.getElementById("lng").value;
    startMarker.setLatLng([lat, lng]);
    updateRoute();
    startMarker.openPopup();
};


// Initialisation du départ de l'itinéraire en la localisation initiale de l'utilisateur
var startMarker = L.marker([48.84093303791553, 2.587645278430475], {draggable : true}).setIcon(L.icon({
    iconUrl: 'logo/depart2.png',
    iconSize: [60, 60],
    iconAnchor: [17, 50]
})).addTo(map);
if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
    var lat = position.coords.latitude;
    var lng = position.coords.longitude;
    startMarker.setLatLng([lat,lng]);
    map.setView([lat,lng])
});
};


// Ouverture du pupop
window.addEventListener('load', function() {
    var popup = document.getElementById('popup');
    var closeBtn = document.getElementById('close-btn'); 
    closeBtn.addEventListener('click', function() {
      popup.style.display = 'none';
    });
  
    popup.style.display = 'block';
});


// Initialisation de la variable comprenant l'itinéraire
var routingControl;


// Calcul de l'itinéraire
fetch('kml/refuge.kml')
.then(res => res.text())
.then(kmltext => {
    var parser = new DOMParser();
    var kml = parser.parseFromString(kmltext, "text/xml");
    var geojson = toGeoJSON.kml(kml);
    var refugeLayer = L.geoJson(geojson, {
        pointToLayer: function(geoJsonPoint, latlng) {
            return L.marker(latlng);
        }
    });
    // Recherche du point le plus proche
    var nearestPoint = findNearestPoint(startMarker.getLatLng(), refugeLayer);
    //Récupérer l'indice de la langue sélectionnée
    var elem = document.querySelector('select');
    var langue = '';
    if (elem.options.selectedIndex == '0') { //EN
        langue = 'en';
        // Ajouter un popup contenant les informations spécifiques de chaque point
        langue_iti (langue, startMarker.getLatLng(), nearestPoint, startMarker);
    } else {
        if( elem.options.selectedIndex == '2' ){ //ESP
            langue = 'es';
            // Ajouter un popup contenant les informations spécifiques de chaque point
            langue_iti (langue, startMarker.getLatLng(), nearestPoint, startMarker);
        } else { //FR
            langue = 'fr';
            // Ajouter un popup contenant les informations spécifiques de chaque point
            langue_iti (langue, startMarker.getLatLng(), nearestPoint, startMarker);
        }
    };
    elem.addEventListener('change', (event) => {
        map.removeControl(routingControl);
        var etatactu = document.querySelector('select');
        if (etatactu.options.selectedIndex == '0') { //EN
            langue = 'en';
            // Ajouter un popup contenant les informations spécifiques de chaque point
            langue_iti (langue, startMarker.getLatLng(), nearestPoint, startMarker);
        } else {
            if( etatactu.options.selectedIndex == '2' ){ //ESP
                langue = 'es';
                // Ajouter un popup contenant les informations spécifiques de chaque point
                langue_iti (langue, startMarker.getLatLng(), nearestPoint, startMarker);
            } else { //FR
                langue = 'fr';
                // Ajouter un popup contenant les informations spécifiques de chaque point
                langue_iti (langue, startMarker.getLatLng(), nearestPoint, startMarker);
            }
        }
    });
});
// Mettre à jour l'itinéraire lorsque le marqueur est déplacé
startMarker.on('dragend', updateRoute);   


// Ajout d'un popup sur le marqueur de départ de l'itinéraire pour modifier sa position en entrant des coordonnées
startMarker.on('click', function() {
    // Création du formulaire pour entrer les nouvelles coordonnées
    var popupContent = "<strong>Simuler une position de départ :</strong><br><br><form>Latitude : <input type='text' id='lat'><br>Longitude : <input type='text' id='lng'><br><br><input type='button' id='save-btn' value='Enregistrer'></form>";
    var popup = L.popup().setContent(popupContent);
    // affichage du popup sur la carte
    startMarker.bindPopup(popup).openPopup();
    // sélectionner le bouton et ajouter un événement click qui appelle saveCoords
    var saveButton = document.getElementById('save-btn');
    saveButton.addEventListener('click', function() {
        saveCoords();
    });
    startMarker.off('click');
});
startMarker.on('dragend', function(event) {
    startMarker.on('click', function() {
        // Création du formulaire pour entrer les nouvelles coordonnées
        var popupContent = "<strong>Simuler une position de départ :</strong><br><br><form>Latitude : <input type='text' id='lat'><br>Longitude : <input type='text' id='lng'><br><br><input type='button' id='save-btn' value='Enregistrer'></form>";
        var popup = L.popup().setContent(popupContent);
        // affichage du popup sur la carte
        startMarker.bindPopup(popup).openPopup();
        // sélectionner le bouton et ajouter un événement click qui appelle saveCoords
        var saveButton = document.getElementById('save-btn');
        saveButton.addEventListener('click', function() {
            saveCoords();
        });
        startMarker.off('click');
    }); 
});


// Fonction pour trouver le refuge le plus proche du
function findNearestPoint(position, layer) {
    var nearestPoint;
    var nearestDistance = Infinity;
    layer.eachLayer(function(l) {
        if (l instanceof L.Marker) {
            var distance = l.getLatLng().distanceTo(position);
            if (distance < nearestDistance) {
                nearestPoint = l.getLatLng();
                nearestDistance = distance;
            }
        }
    });
    return nearestPoint;
};


// Fonction pour changer la langue des instructions de l'itinéraire
function langue_iti (langue, position, nearestPoint, startMarker){
    fetch('kml/refuge.kml')
    .then(res => res.text())
    .then(kmltext => {
        var parser = new DOMParser();
        var kml = parser.parseFromString(kmltext, "text/xml");
        var geojson = toGeoJSON.kml(kml);
        var refugeLayer = L.geoJson(geojson, {
            pointToLayer: function(geoJsonPoint, latlng) {
                return L.marker(latlng);
            }
        });
    var newPosition = startMarker.getLatLng();
    var newNearestPoint = findNearestPoint(newPosition, refugeLayer);
    routingControl = L.Routing.control({
        waypoints: [
            newPosition,
            newNearestPoint
        ],
        createMarker: function(i, wp, nWps) {
            if (i === nWps - 1) {
                return null; // désactive l'affichage de la "pin" sur le point d'arrivée
            } else {
                startMarker.addTo(map); // Ajoute le marqueur au groupe de calques
                return startMarker;
            }
        },
        router: new L.Routing.mapbox('sk.eyJ1IjoiY2xlbWVudGJyb3Vzc2VhdSIsImEiOiJjbGdrb3VtbDIwZWxyM2ZxcWNnbW8yZGg3In0.KWT6Z7tk4JGZBJ7TcjWGQg', {
            profile: 'mapbox/walking', // mode piéton
            alternatives: true,
            language: langue
        }),
        lineOptions: {
            styles: [{color: 'blue', opacity: 0.8, weight: 15}]
        },
    }).addTo(map);

    
    routingControl.hide();
    var instructions = document.querySelector('input[name="instructions"]');
    instructions.addEventListener('change', function() {
        if (this.checked) {
            routingControl.show();
        } else {
            routingControl.hide();
        }
    }); 
});
};


// Fonction qui recalcule un itinéraire à chaque changement de coordonnées du marqueur de départ
function updateRoute() {
    // Charger le fichier KML et conversion en GeoJSON
    fetch('kml/refuge.kml')
    .then(res => res.text())
    .then(kmltext => {
        var parser = new DOMParser();
        var kml = parser.parseFromString(kmltext, "text/xml");
        var geojson = toGeoJSON.kml(kml);
        var refugeLayer = L.geoJson(geojson, {
            pointToLayer: function(geoJsonPoint, latlng) {
                return L.marker(latlng);
            }
        });
        var newPosition = startMarker.getLatLng();
        var newNearestPoint = findNearestPoint(newPosition, refugeLayer);
        routingControl.setWaypoints([
            newPosition,
            newNearestPoint
        ],);
    });
};



/**********************************TRAITEMENT DES ZONES A RISQUE*************************************************/


// Fonction définissant les popups associés aux zones
function ajout_popups_zones(language, layer){
    if (language == '0') { //EN
        // Ajouter un popup contenant les informations spécifiques de chaque point
        layer.bindPopup("<strong>Zone exposed to tsunami risk</strong><br/><br/>Evacuate in the event of an alert<br/><br/><img src='logo/Panneau_zone_a_evacuer.png' width='100px'>");
    } else {
        if( language == '2' ){ //ESP
            // Ajouter un popup contenant les informations spécifiques de chaque point
            layer.bindPopup("<strong>Zona de riesgo de tsunami</strong><br/><br/>Evacuar en caso de alerta<br/><br/><img src='logo/Panneau_zone_a_evacuer.png' width='100px'>");
        } else { //FR
            // Ajouter un popup contenant les informations spécifiques de chaque point
            layer.bindPopup("<strong>Zone exposée au risque tsunami</strong><br/><br/>À évacuer en cas d'alerte<br/><br/><img src='logo/Panneau_zone_a_evacuer.png' width='100px'>");
        }
    }
};


// Fonction associée aux zones
zone.on('ready', function() {
    // Récupère la couche GeoJSON générée par Omnivore
    var layer = this.getLayers()[0];
    //Récupérer l'indice de la langue sélectionnée
    var elet = document.querySelector('select');
    //Ajouter popups dans la langue initiale
    ajout_popups_zones(elet.options.selectedIndex, layer);
    elet.addEventListener('change', (event) => {
        var etat = document.querySelector('select');
        //Ajouter popups dans la langue modifiée            
        ajout_popups_zones(etat.options.selectedIndex,layer);
      });
    layer.setStyle({
        color: 'red',           // Couleur des lignes
        weight: 9,              // Épaisseur des lignes
        opacity: 0.8,           // Transparence de la couche
        fillColor: 'red',    // Couleur de remplissage des polygones
        fillOpacity: 0.2        // Transparence du remplissage des polygones
    });      
});


/**********************************TRAITEMENT DES SITES REFUGES*************************************************/


// Fonction traduisant la nature du site en entrée dans la langue choisie
function translateNatureSite (type,nom, commune, layer, langue){
    langue = Number(langue);
    /********LECTURE DU FICHIER DE TRADUCTION**********/
    // Créer une instance XMLHttpRequest
    var lecture = new XMLHttpRequest();
    // Configurer la requête HTTP GET
    lecture.open('GET', 'kml/traduction-refuges.txt', true);
    // Lorsque la réponse est prête
    lecture.onload = function() {
    // Vérifier le statut de la réponse HTTP
    if (lecture.status === 200) {
        // Diviser le contenu en un tableau de lignes
        var lines = lecture.responseText.split('\n');
        // Afficher le tableau dans la console
        lines.forEach(function(element){
            if (type == element.split(',')[0]){
                var new_type = element.split(',')[langue];
                if (langue ==1){
                    // Ajouter un popup contenant les informations spécifiques de chaque point
                    var popupContent = "<strong>Tsunami warning refuge</strong><br><br>Name of the site : " + nom + '<br>Nature of the site : ' + new_type + '<br>Municipality : ' + commune;
                    layer.bindPopup(popupContent);
                }else {
                    if (langue ==2){
                        // Ajouter un popup contenant les informations spécifiques de chaque point
                        var popupContent = "<strong>Un lugar donde refugiarse en caso de alerta de tsunami</strong><br><br>Nombre del sitio : " + nom + '<br>Naturaleza del sitio : ' + new_type + '<br>Municipio : ' + commune;
                        layer.bindPopup(popupContent);
                    }
                }   
            }  
        });
    } else {
        // En cas d'erreur, afficher le statut de la réponse HTTP
        console.log('Erreur de chargement du fichier : ' + lecture.status);
    }
    };
    // Envoyer la requête HTTP GET
    lecture.send();
};


// Fonction définissant les popups associés aux refuges
function ajout_popups(type, nom, commune, layer, language){
    if (language == '0') {
        var langue = '1';
        translateNatureSite (type, nom, commune, layer, langue);
    } else {
          if( language == '2' ){
            translateNatureSite (type, nom, commune, layer, language);
        } else {
            // Ajouter un popup contenant les informations spécifiques de chaque point
            var popupContent = "<strong>Refuge en cas d'alerte tsunami</strong><br><br>Nom du site : " + nom + '<br>Nature du site : ' + type + '<br>Commune : ' + commune;
            layer.bindPopup(popupContent);
        }
    }
};


// Fonctions associées aux refuges
refuge.on('ready', function() {
    // Parcourir chaque couche de point
    this.eachLayer(function(layer) {
        // Récupérer les attributs spécifiques de chaque point
        var nom = layer.feature.properties.Nom_SR;
        var type = layer.feature.properties.Type;
        var commune = layer.feature.properties.Commune;

        //Récupérer l'indice de la langue sélectionnée
        var elt = document.querySelector('select');
        
        //Ajouter popups dans la langue initiale
        ajout_popups(type, nom, commune, layer, elt.options.selectedIndex);

        elt.addEventListener('change', (event) => {
            var etat = document.querySelector('select');
            //Ajouter popups dans la langue modifiée            
            ajout_popups(type, nom, commune, layer, elt.options.selectedIndex);
          });

        // Définir la fonction pointToLayer pour personnaliser l'apparence des points
        layer.setIcon(L.icon({
            iconUrl: 'logo/icone_refuge_vert.png',
            iconSize: [45, 45],
            iconAnchor: [22.5, 22.5]
        }));
    });
});


















/*
startMarker.on('dragend', function(event) {
    //var isMarkerInsidePolygon = polyENSG.getBounds().contains(startMarker.getLatLng());
    if (polyENSG.getBounds().contains(startMarker.getLatLng())) {
    console.log("Le marqueur est à l'intérieur du polygone.");   
     
  } else {
    console.log("Le marqueur n'est pas à l'intérieur du polygone.");
    
    startMarker.on('dragend', updateRoute2);
};
});*/