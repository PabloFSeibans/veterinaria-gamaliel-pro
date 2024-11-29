import { useEffect } from "react";

interface OscillatorOptions {
  phase?: number;
  offset?: number;
  frequency?: number;
  amplitude?: number;
}

interface LineOptions {
  spring: number;
}

interface EnvironmentSettings {
  debug: boolean;
  friction: number;
  trails: number;
  size: number;
  dampening: number;
  tension: number;
}

interface Position {
  x: number;
  y: number;
}

interface CanvasRenderingContext2DExtended extends CanvasRenderingContext2D {
  running: boolean;
  frame: number;
}

interface NodeType {
	x: number;
	y: number;
	vx: number;
	vy: number;
  }
  
  function Node(this: NodeType) {
	this.x = 0;
	this.y = 0;
	this.vy = 0;
	this.vx = 0;
  }

const useCanvasCursor = () => {
  function n(this: any, e: OscillatorOptions) {
    this.init(e || {});
  }
  n.prototype = {
    init: function (this: any, e: OscillatorOptions) {
      this.phase = e.phase || 0;
      this.offset = e.offset || 0;
      this.frequency = e.frequency || 0.001;
      this.amplitude = e.amplitude || 1;
    },
    update: function (this: any) {
      return (this.phase += this.frequency), (e = this.offset + Math.sin(this.phase) * this.amplitude);
    },
    value: function (this: any) {
      return e;
    },
  };

  function Line(this: any, e: LineOptions) {
    this.init(e || {});
  }

  Line.prototype = {
    init: function (this: any, e: LineOptions) {
      this.spring = e.spring + 0.1 * Math.random() - 0.02;
      this.friction = E.friction + 0.01 * Math.random() - 0.002;
      this.nodes = [];
      for (var t, n = 0; n < E.size; n++) {
        t = new (Node as any)();
        t.x = pos.x;
        t.y = pos.y;
        this.nodes.push(t);
      }
    },
    update: function (this: any) {
      var e = this.spring,
        t = this.nodes[0];
      t.vx += (pos.x - t.x) * e;
      t.vy += (pos.y - t.y) * e;
      for (var n, i = 0, a = this.nodes.length; i < a; i++)
        (t = this.nodes[i]),
          0 < i &&
            ((n = this.nodes[i - 1]),
            (t.vx += (n.x - t.x) * e),
            (t.vy += (n.y - t.y) * e),
            (t.vx += n.vx * E.dampening),
            (t.vy += n.vy * E.dampening)),
          (t.vx *= this.friction),
          (t.vy *= this.friction),
          (t.x += t.vx),
          (t.y += t.vy),
          (e *= E.tension);
    },
    draw: function (this: any) {
      var e,
        t,
        n = this.nodes[0].x,
        i = this.nodes[0].y;
      ctx.beginPath();
      ctx.moveTo(n, i);
      for (var a = 1, o = this.nodes.length - 2; a < o; a++) {
        e = this.nodes[a];
        t = this.nodes[a + 1];
        n = 0.5 * (e.x + t.x);
        i = 0.5 * (e.y + t.y);
        ctx.quadraticCurveTo(e.x, e.y, n, i);
      }
      e = this.nodes[a];
      t = this.nodes[a + 1];
      ctx.quadraticCurveTo(e.x, e.y, t.x, t.y);
      ctx.stroke();
      ctx.closePath();
    },
  };

  function onMousemove(e: MouseEvent | TouchEvent) {
    function o() {
      lines = [];
      for (var e = 0; e < E.trails; e++) lines.push(new (Line as any)({ spring: 0.4 + (e / E.trails) * 0.025 }));
    }
    function c(e: MouseEvent | TouchEvent) {
      if ('touches' in e) {
        pos.x = e.touches[0].pageX;
        pos.y = e.touches[0].pageY;
      } else {
        pos.x = e.clientX;
        pos.y = e.clientY;
      }
      e.preventDefault();
    }
    function l(e: TouchEvent) {
      if (e.touches.length === 1) {
        pos.x = e.touches[0].pageX;
        pos.y = e.touches[0].pageY;
      }
    }
    document.removeEventListener("mousemove", onMousemove);
    document.removeEventListener("touchstart", onMousemove as any);
    document.addEventListener("mousemove", c);
    document.addEventListener("touchmove", c as any);
    document.addEventListener("touchstart", l);
    c(e);
    o();
    render();
  }

  function render() {
    if (ctx.running) {
      ctx.globalCompositeOperation = "source-over";
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.globalCompositeOperation = "lighter";
    //   ctx.strokeStyle = "hsla(" + Math.round((f as any).update()) + ",50%,50%,0.2)";
      ctx.strokeStyle = "hsla(19, 96%, 57%, 0.2)";
      ctx.lineWidth = 1;
      for (var e, t = 0; t < E.trails; t++) {
        (e = lines[t]).update();
        e.draw();
      }
      ctx.frame++;
      window.requestAnimationFrame(render);
    }
  }

  function resizeCanvas() {
    ctx.canvas.width = window.innerWidth - 20;
    ctx.canvas.height = window.innerHeight;
  }

  var ctx: CanvasRenderingContext2DExtended,
    f: any,
    e = 0,
    pos: Position = { x: 0, y: 0 },
    lines: any[] = [],
    E: EnvironmentSettings = {
      debug: true,
      friction: 0.5,
      trails: 20,
      size: 50,
      dampening: 0.25,
      tension: 0.98,
    };
  function Node(this: any) {
    this.x = 0;
    this.y = 0;
    this.vy = 0;
    this.vx = 0;
  }

  const renderCanvas = function () {
    const canvas = document.getElementById("canvas") as HTMLCanvasElement;
    ctx = canvas.getContext("2d") as CanvasRenderingContext2DExtended;
    ctx.running = true;
    ctx.frame = 1;
    f = new (n as any)({
      phase: Math.random() * 2 * Math.PI,
      amplitude: 85,
      frequency: 0.0015,
      offset: 285,
    });
    document.addEventListener("mousemove", onMousemove);
    document.addEventListener("touchstart", onMousemove as any);
    document.body.addEventListener("orientationchange", resizeCanvas);
    window.addEventListener("resize", resizeCanvas);
    window.addEventListener("focus", () => {
      if (!ctx.running) {
        ctx.running = true;
        render();
      }
    });
    window.addEventListener("blur", () => {
      ctx.running = true;
    });
    resizeCanvas();
  };

  useEffect(() => {
    renderCanvas();

    return () => {
      ctx.running = false;
      document.removeEventListener("mousemove", onMousemove);
      document.removeEventListener("touchstart", onMousemove as any);
      document.body.removeEventListener("orientationchange", resizeCanvas);
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("focus", () => {
        if (!ctx.running) {
          ctx.running = true;
          render();
        }
      });
      window.removeEventListener("blur", () => {
        ctx.running = true;
      });
    };
  }, []);
};

export default useCanvasCursor;