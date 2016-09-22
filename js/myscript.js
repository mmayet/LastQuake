$(document).ready(function() {
  myReadyFunction();
  startMap();
});

function startMap() {
    map = new google.maps.Map(document.getElementById("map_canvas"), {
        zoom: 6,
    });
    var latLng;
    var eqTitle;
    $(".live-ajax-update").append("<li>Google Map <em> Initiated </em> <br/></li>");
}


function initializeMap(position) {
    NProgress.set(0.4);
    var userCenter = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
    //map.setCenter(userCenter);
    centerMap(position.coords.latitude, position.coords.longitude);

    var image = {
        url: 'images/home.png',
        size: new google.maps.Size(71, 71),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(17, 34),
        scaledSize: new google.maps.Size(25, 25)
    };
    var marker = new google.maps.Marker({
        position: userCenter,
        map: map,
        title: "Your Location",
        icon: image
    });
}

function escapeText(t){
  return document.createTextNode(t).textContent;
}

function quakeReader(results) {
    var time = new Date(new Date().getTime());
    if (results.metadata.count == 0) {
        displayTime(time, results.metadata.generated, time);
        $(".lastUpdated").append("<br/> No recent earthquakes logged by USGS.");
        NProgress.done();
    }
    else {
        for (var i = 0; i <= results.metadata.count; i++) {
            eqTitle = escapeText(results.features[i].properties.title);
            eqLink = escapeText(results.features[i].properties.url);
            var earthquake = results.features[i];
            var coords = earthquake.geometry.coordinates;
            if (i == 0) {
                if (navigator.geolocation) {
                    centerMap(coords[1], coords[0]);
                    navigator.geolocation.getCurrentPosition(initializeMap);
                } else {
                    centerMap(coords[1], coords[0]);
                }
                displayTime(time, results.metadata.generated, earthquake.properties.time);
            }
            $("table").append("<tr><td><a href='" + eqLink + "' target='_blank'>" + eqTitle + "</a></td></tr><tr><td>"
                + timeElapsed(time, earthquake.properties.time) + " Minutes Ago | "
                + timeofEvent(earthquake.properties.time) + "</td></tr>");
            latLng = new google.maps.LatLng(coords[1], coords[0]);
            var marker = new google.maps.Marker({
                position: latLng,
                map: map,
                title: eqTitle
            });
            addButtons(coords[1], coords[0]);

            google.maps.event.addListener(marker, 'click', function () {
                NProgress.start();
                map.setMapTypeId(google.maps.MapTypeId.SATELLITE);
                map.setZoom(20);
                map.setTilt(45);
                map.panTo(this.getPosition());
                NProgress.done();
            });

            $(".live-ajax-update").append("<li>GMap Markers <b> Added </b> <br/></li>");
        }
    }
}

function displayTime(time, epUpdated, epochTime) {
    var timeOfUpdate = new Date(epUpdated).toLocaleTimeString();
    var timeOfQuake = timeofEvent(epochTime);
    var timeAgo = timeElapsed(time, epochTime);
    var lastUpdated = Math.round(Math.abs(new Date(time) - new Date(epUpdated)) / 60000);

    $(".lastUpdated").append(" - USGS Feed was last updated " + lastUpdated + " Minutes Ago at " + timeOfUpdate);
}

function timeofEvent(epochTime) {
    return new Date(epochTime).toLocaleTimeString();
}

function timeElapsed(time, epochTime) {
    return Math.round(Math.abs(new Date(time) - new Date(epochTime)) / 60000);
}

function addButtons(lat, lng) {
    $("table").append("<tr><td><button onclick=\"centerMap(" + lat + "," + lng
        + ");\">Center at this Quake</button></td></tr>");
}

function centerMap(lat, lng) {
    NProgress.start();
    var center = new google.maps.LatLng(lat, lng);
    map.panTo(center);
    NProgress.done();
}

function myBadLoadFunction(XMLHttpRequest,errorMessage,errorThrown) {
  alert("Load failed:"+errorMessage+":"+errorThrown);
}
      
function myReadyFunction(){
  $.ajax({
    url: "/myProxy.php?http://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson",
    dataType: "json",
    success: quakeReader,
    error: myBadLoadFunction
  });
  $(".live-ajax-update").append("<li>JSON Call <em> Initiated </em> <br/></li>");
}