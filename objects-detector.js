const video = document.getElementById('webcam');
const liveView = document.getElementById('liveView');
const demosSection = document.getElementById('demos');
const enableWebcamButton = document.getElementById('webcamButton');

// Verifica si se tiene acceso a la webcam
function getUserMediaSupported() {
    return !!(navigator.mediaDevices &&
      navigator.mediaDevices.getUserMedia);
  }
  
  /*
    Si la webcam es soportada, añade un event listener 
    al botón para que cuando el usuario lo active  llame
    a la función enableCam 
  */
  if (getUserMediaSupported()) {
    enableWebcamButton.addEventListener('click', enableCam);
  } else {
    console.warn('getUserMedia() is not supported by your browser');
  }
 
  // habilita la webcam y comienza la clasificación
function enableCam(event) {
    // continúa cuando COCO-SSD termine de cargar
    if (!model) {
      return;
    }
    
    // esconde el botón después de hacer click
    event.target.classList.add('removed');  
    
    // parametros para getUsermedia
    const constraints = {
      video: true
    };
  
    // activa el webcam stream
    navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
      video.srcObject = stream;
      video.addEventListener('loadeddata', predictWebcam);
    });
  }

var children = [];


function predictWebcam() {
    // Comenzamos a clasificar cada frame del stream
    model.detect(video).then(function (predictions) {
      for (let i = 0; i < children.length; i++) {
        liveView.removeChild(children[i]);
      }
      children.splice(0);
      
      //Ahora vamos a iterar sobre las predicciones y dibujamos en el live-view
      //si detectamos un objeto dentro del modelo
      for (let n = 0; n < predictions.length; n++) {
        // Si tomamos mas del 66% como parametro para predicción, entonces se dibuja
        if (predictions[n].score > 0.66) {
          const p = document.createElement('p');
          p.innerText = predictions[n].class  + ' - with ' 
              + Math.round(parseFloat(predictions[n].score) * 100) 
              + '% confidence.';
          p.style = 'margin-left: ' + predictions[n].bbox[0] + 'px; margin-top: '
              + (predictions[n].bbox[1] - 10) + 'px; width: ' 
              + (predictions[n].bbox[2] - 10) + 'px; top: 0; left: 0;';
  
          const highlighter = document.createElement('div');
          highlighter.setAttribute('class', 'highlighter');
          highlighter.style = 'left: ' + predictions[n].bbox[0] + 'px; top: '
              + predictions[n].bbox[1] + 'px; width: ' 
              + predictions[n].bbox[2] + 'px; height: '
              + predictions[n].bbox[3] + 'px;';
  
          liveView.appendChild(highlighter);
          liveView.appendChild(p);
          children.push(highlighter);
          children.push(p);
        }
      }
      
      //Llama a esta función otra vez y mantén prediciendo cuando el navegador este listo
      window.requestAnimationFrame(predictWebcam);
    });
  }

var model = true;
demosSection.classList.remove('invisible');

//Almacena el modelo resultante en el scope global de la apliación
var model = undefined;

// Carga el modelo coco-ssd
cocoSsd.load().then(function (loadedModel) {
  model = loadedModel;
  // muestra el demo despuñes de que el modelo termine de cargar
  demosSection.classList.remove('invisible');
});