const TwoPI = 2 * Math.PI;

function random(min, max) {
  return Math.random() * (max - min) + min
}

class Vector {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  add(vector) {
    return new Vector(this.x + vector.x, this.y + vector.y);
  }
  sub(vector) {
    return new Vector(this.x - vector.x, this.y - vector.y);
  }
  mult(scalar) {
    return new Vector(this.x * scalar, this.y * scalar);
  }
  normal() {
    let mag = this.mag()
    return new Vector(this.x / mag, this.y / mag);
  }
  mag() {
    return Math.sqrt(this.x ** 2 + this.y ** 2);
  }
}

class Box {
  constructor(xmin, ymin, xmax, ymax) {
    this.xmin = xmin;
    this.xmax = xmax;
    this.ymin = ymin;
    this.ymax = ymax;
  }
  get array() {
    return new Array(this.xmin, this.ymin, this.xmax, this.ymax);
  }
}


class Particle {
  constructor(x, y, r, npoints, noise, maxvel) {
    this.position = new Vector(x, y);
    this.r = r;
    this.points = new Array(npoints);
    this.radia = new Array(npoints);
    this.noise = noise;
    for (let i = 0; i < npoints; i++) {
      this.radia[i] = this.r + random(0, this.r / 2) * noise * (i % 2);
      this.points[i] = new Vector(x, y);
    }
    this.vel = new Vector(0, 0);
    this.mxv = maxvel;
    this.age = 0
    this.reproductive = 0;
  }
  update() {
    // Updates position and velocity
    this.position = this.position.add(this.vel);
    // Add a random walk with velocity
    this.vel.x += random(-this.mxv, this.mxv);
    this.vel.y += random(-this.mxv, this.mxv);
    if (this.vel.x > this.mxv) {
      this.vel.x = this.mxv
    } else if (this.vel.x < -this.mxv) {
      this.vel.x = -this.mxv
    } else if (this.vel.y > this.mxv) {
      this.vel.y = this.mxv
    } else if (this.vel.y < -this.mxv) {
      this.vel.y = -this.mxv
    }

    // reproductive status
    if (this.reproductive < 100) {
      this.reproductive++
    }

  }
  isReproductive() {
    if (this.reproductive < 100) {
      return false;
    }
    return true;
  }

  setReproductive(val) {
    this.reproductive = val;
  }

  checkBoundaryCollision(box) {

    if (this.position.x > box.xmax - this.r) {
      this.position.x = box.xmax - this.r;
      this.vel.x *= -1;
    } else if (this.position.x < box.xmin + this.r) {
      this.position.x = box.xmin + this.r;
      this.vel.x *= -1;
    } else if (this.position.y > box.ymax - this.r) {
      this.position.y = box.ymax - this.r;
      this.vel.y *= -1;
    } else if (this.position.y < box.ymin + this.r) {
      this.position.y = box.ymin + this.r;
      this.vel.y *= -1;
    }
  }
  checkCollision(other) {
    // Should be called after display.
    let dVector = other.position.sub(this.position);
    let dVectorMag = dVector.mag();
    let minDistance = this.r + other.r;
    if (dVectorMag < minDistance) {
      // position the circles correctly to no overlap
      let distanceCorrection = (minDistance - dVectorMag) / 2.0;
      let correctionVector = dVector.normal().mult(distanceCorrection);
      other.position = other.position.add(correctionVector);
      this.position = this.position.sub(correctionVector);

      // when circular collision detected, check the distance between each
      // point in the colliding circles if both are reproductive
      if (this.isReproductive() & other.isReproductive()) {
        let children = 0;
        let n = other.points.length;
        for (let i = 0; i < n; i++) {
          let pdist = other.points[i].sub(this.position);
          let pmag = pdist.mag();
          if (pmag < this.r) {
            children++
          }
        }
        return (children)
      }
    }
    return (-1);
  }

  display(context) {
    // displays the particle, updating each point
    let n = this.points.length;
    this.points[0].x = this.r + this.position.x;
    this.points[0].y = this.position.y;

    let col = '#E84258';
    if (this.isReproductive()) {
      col = '#B0D8A4';
    }

    context.fillStyle = col;
    context.beginPath();
    context.moveTo(this.points[0].x, this.points[0].y, 4);

    for (let i = 1; i < n; i++) {
      let a = TwoPI * (i / n);
      this.points[i].x = Math.cos(a) * this.radia[i] + this.position.x;
      this.points[i].y = Math.sin(a) * this.radia[i] + this.position.y;
      context.lineTo(this.points[i].x, this.points[i].y);
    }
    context.closePath();
    context.fill();

    context.fillStyle = "black";
    for (let i = 0; i < n; i++) {
      context.beginPath();
      context.fillRect(this.points[i].x, this.points[i].y, 1, 1);
      context.closePath();
    }

    this.age++;
  }
}

// if maxAge (e.g 225) is slightly above the double of reproductive age, than full circles do not last much

class Simulation {
  /* Constructs a simple simulator.
  canvas - the canvas where simulation is drawns
  maxParticles - the maximum number of active particles at each time
  initProportion - initial proportion of 0 noise particles (full circles)
  radius - radius of each particle
  particleRes - resolution of the particle (how many points are used to draw)
  maxVel - Maximum velocity possible
  maxAge - Maximum age of each particles
  fertileAge - Age at which particle can reproduce*/
  constructor(canvas, maxParticles, initProportion = 0.5, radius = 8,
    particleRes = 20, maxVel = 1, maxAge = 500) {
    this.canvas = canvas;
    this.context = canvas.getContext("2d");
    this.maxParticles = maxParticles;
    let initParticles = Math.floor(maxParticles * 0.5);
    this.particles = new Array(initParticles);
    let noise = 0;
    for (let i = 0; i < initParticles; i++) {
      if (i >= initParticles * initProportion) {
        noise = 1; //random(0,1);
      }
      this.particles[i] = new Particle(random(0, canvas.width),
        random(0, canvas.height),
        radius, particleRes, noise,
        maxVel);
      // set some random proprieties for the begining of simulation
      this.particles[i].age = random(0, maxAge/2);
      this.particles[i].reproductive = random(50, 100);
    }
    this.maxAge = maxAge;
    this.box = new Box(0, 0, canvas.width, canvas.height);

    // track reproduction and offspring
    this.nreproduct = 0;
    this.noffspring = 0;
  }

  update() {
    // updates to next generation/iteration
    let killIndex = new Array();
    // reverse loop for removing particles
    let n = this.particles.length;
    for (let i = n - 1; i >= 0; i--) {
      let p = this.particles[i];
      p.update();
      p.checkBoundaryCollision(this.box);
      p.display(this.context);
      for (let j = i - 1; j >= 0; j--) {
        let nchild = p.checkCollision(this.particles[j]);
        if (nchild > 0) {
          this.nreproduct += 1;
          for (let c = 0; c < nchild; c++) {
            this.noffspring += 1;
            this.reproduce(p, this.particles[j]);
          }
        }
      }
      // kills particle if exceeded maximum Age.
      if (this.particles[i].age > this.maxAge) {
        this.particles.splice(i, 1);
      }
    }
  }

  reproduce(a, b) {
    if (this.particles.length < this.maxParticles) {
      let x1 = a.position.x;
      let x2 = b.position.x;
      let y1 = a.position.y;
      let y2 = b.position.y;
      let ns = (a.noise + b.noise) / 2;
      let p = new Particle(random(x1, x2), random(y1, y2), a.r,
        a.points.length, ns, a.mxv);
      this.particles.push(p);
      if (a.isReproductive()) {
        a.setReproductive(0);
      }
    }
  }

  get hist() {
    let h = Array.from({length: 10}, (_, i) => ({x: i / 10 + 0.05, y: 0}));
    let val = 1 / this.particles.length;
    for (let i = 0; i < this.particles.length; i++) {
      let ns = this.particles[i].noise;
      h[Math.floor((ns - ns % 0.1) * 10)].y += val;
    }
    return h;
  }
}


class histogram {
  constructor(id, data = []) {
    this.ctx = document.getElementById(id);
    this.chart = new Chart(this.ctx, {
      type: 'bar',
      data: {
        datasets: [{
          data: data,
          backgroundColor: ['rgba(54, 162, 235, 0.2)'],
          borderColor: ['rgba(54, 162, 235, 0.2)'],
          borderWidth: 1,
          barPercentage: 1,
          categoryPercentage: 1
        }]
      },
      options: {
        plugins: {
          legend: {
            display: false
          },
          tooltips: {
            enabled: false
          }
        },
        scales: {
          x: {
            min: 0,
            max: 1,
            type: 'linear',
            grid: {
              display: false,
            },
            title: {
              display: true,
              text: "Circle noise parameter"
            }
          },
          y: {
            min: 0,
            max: 1,
            grid: {
              display: false,
              drawBorder: false
            },
            ticks: {
              display: false
            }
          }
        }
      }
    });
  }
  update(data) {
    this.chart.data.datasets[0].data = data;
    this.chart.update();
  }
}
