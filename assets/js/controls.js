// utilities for button control
function disableBtn(id) {
  const btn = document.getElementById(id);
  if (!btn.disabled) {
    btn.disabled = true;
  }
}

function enableBtn(id) {
  const btn = document.getElementById(id)
  if (btn.disabled) {
    btn.disabled = false;
  }
}

function isVisible(id) {
  // only check top and bottom visibility (not sides)
  let elem = document.getElementById(id)
  let rect = elem.getBoundingClientRect();
  return rect.top > 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight)
}

// actors
function refreshActors() {
  const canvas_actors = document.getElementById("actors");
  let ctx_actors = canvas_actors.getContext("2d");
  ctx_actors.clearRect(0, 0, canvas_actors.width, canvas_actors.height);
  ctx_actors.font = "15px Arial";
  ctx_actors.textAlign = "center";
  let actors = new Array(6);
  for (let i = 0; i < actors.length; i++) {
    let x = canvas_actors.width * i / actors.length + 40;
    let y = canvas_actors.height / 2;
    actors[i] = new Particle(x, y, 20, 20, i / 5);
    actors[i].display(ctx_actors);
    ctx_actors.fillText(i / 5, x, 15);
  }
}

// Trigger actions with buttons
function startsim1() {
  //canvas_sim1 = document.getElementById("simulation1");
  disableBtn("startsim1");
  enableBtn("stopsim1");
  let ctx_sim1 = canvas_sim1.getContext("2d");
  ctx_sim1.fillStyle = 'rgba(255, 255, 255, .4)';
  ctx_sim1.fillRect(0, 0, canvas_sim1.width, canvas_sim1.height);
  sim1.update();
  sim1_chart.update(sim1.hist);
  sim1_timeout = window.setTimeout(startsim1, 25);
}

function stopsim1() {
  disableBtn("stopsim1");
  enableBtn("startsim1");
  clearTimeout(sim1_timeout);
  sim1_timeout = null;
}

function resetsim1() {
  //canvas_sim1 = document.getElementById("simulation1");
  sim1 = new Simulation(canvas_sim1, 100, 0.5);
  sim1_chart = new histogram('chartsim1', sim1.hist);
  let ctx_sim1 = canvas_sim1.getContext("2d");
  ctx_sim1.clearRect(0, 0, canvas_sim1.width, canvas_sim1.height);
  sim1.update();
  sim1_chart.update(sim1.hist);
}

function startsim2() {
  disableBtn("startsim2");
  enableBtn("stopsim2");
  for (let i = 0; i < 2; i++) {
    let ctx_sim2 = canvas_sim2[i].getContext("2d");
    ctx_sim2.fillStyle = 'rgba(255, 255, 255, .4)';
    ctx_sim2.fillRect(0, 0, canvas_sim2[i].width, canvas_sim2[i].height);

    // Track average offspring per sucessful reproduction
    if (sim2[i].nreproduct > 0) {
      sim2_data[i].offspring = (sim2[i].noffspring / sim2[i].nreproduct).toFixed(2);
    }

    // Reinitiate the simulation after an extinction (no particles left)
    if (sim2[i].particles.length == 0) {
      sim2[i] = new Simulation(canvas_sim2[i], 100, i);
      sim2[i].maxAge = 200;
      sim2_data[i].extinct += 1;
    }

    // update simulation
    sim2[i].update();

    // update text
    ctx_sim2.font = "12px Comic Sans MS";
    ctx_sim2.fillStyle = "#4c9fd8";
    ctx_sim2.textAlign = "left";
    let msg = "n:" + sim2[i].particles.length +
      " | Extinctions:" + sim2_data[i].extinct +
      " | Offspring:" + sim2_data[i].offspring;
    ctx_sim2.fillText(msg, 10, canvas_sim2[i].height - 2);
  }
  sim2_timeout = window.setTimeout(startsim2, 25);
}

function stopsim2() {
  disableBtn("stopsim2");
  enableBtn("startsim2");
  clearTimeout(sim2_timeout);
  sim2_timeout = null;
}

function resetsim2() {
  //canvas_sim1 = document.getElementById("simulation1");
  sim2 = new Array(2);
  sim2_data = [{extinct:0, offspring:0}, {extinct:0, offspring:0}];
  for (let i = 0; i < 2; i++) {
    sim2[i] = new Simulation(canvas_sim2[i], 100, i);
    sim2[i].maxAge = 200;
    let ctx_sim2 = canvas_sim2[i].getContext("2d");
    ctx_sim2.clearRect(0, 0, canvas_sim2[i].width, canvas_sim2[i].height);
    sim2[i].update();
  }
}


// Scrolling events
document.addEventListener('scroll', function() {
  if (!isVisible("simulation1")) {
    stopsim1();
  }
  if (!isVisible("simulation2a")) {
    stopsim2();
  }
}, {
  passive: true
});


// global variables for simulations
refreshActors();

// simulation 1
const canvas_sim1 = document.getElementById("simulation1");

var sim1;
var sim1_chart;
var sim1_timeout;
resetsim1();

// simulation 2
const canvas_sim2 = [document.getElementById("simulation2a"),
                     document.getElementById("simulation2b")];
var sim2;
var sim2_timeout;
var sim2_data = [{extinct:0, offspring:0}, {extinct:0, offspring:0}];
resetsim2();
