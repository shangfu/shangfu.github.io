"use strict";
(function() {
  var setScale = function(canvas, context) {
    var width = $(canvas.node()).width();
    var height = $(canvas.node()).height();
    var deviceRatio = window.devicePixelRatio || 1;
    var ratio = (context.webkitBackingStorePixelRatio ||
                 context.mozBackingStorePixelRatio ||
                 context.msBackingStorePixelRatio ||
                 context.oBackingStorePixelRatio ||
                 context.backingStorePixelRatio || 1);
    var scale = deviceRatio / ratio;
    if (window.devicePixelRatio !== ratio) {
      canvas.attr("width", width * scale)
        .attr("height", height * scale)
        .style("width", width + "px")
        .style("height", height + "px");
      return context.scale(scale, scale)
    }
  };

  var setup = function() {
    var r, height, s, a, width;
    var container = $(".js-traffic");
    s = container.get(0);
    width = container.width();
    height = container.height();
    container.find("canvas").remove();
    width = height = Math.min(width, height);
    var projection = d3.geo.orthographic()
        .clipAngle(90)
        .precision(.5);
    var canvas = d3.select(".js-traffic .js-graph")
      .append("canvas")
        .attr("width", width)
        .attr("height", height)
        .attr("class", "traffic-map-canvas");
    var ctx = canvas.node().getContext("2d");
    setScale(canvas, ctx);
    r = d3.geo.graticule();

    var path = d3.geo.path()
        .projection(projection)
        .context(ctx);

    var circle = d3.geo.circle();

    d3.json("world-110m.json", function(err, mapjson) {
      var r, o, c, p;
      if (err != null) {
        console.log(err);
        return;
      }
      o = {type: "Sphere"};
      var land = topojson.feature(mapjson, mapjson.objects.land);
      var borders = topojson.mesh(mapjson, mapjson.objects.countries, function(e, t) {
        return e !== t
      });
      projection.scale(1).translate([0, 0]);
      r = path.bounds(land);
      c = .9 / Math.max((r[1][0] - r[0][0]) / width, (r[1][1] - r[0][1]) / height);
      p = [(width - c * (r[1][0] + r[0][0])) / 2, (height - c * (r[1][1] + r[0][1])) / 2];
      projection.scale(c).translate(p);
      var redraw = function() {

        ctx.fillStyle = "#10112e";
        ctx.strokeStyle = "#10112e";
        ctx.beginPath();
        ctx.lineWidth = 2;
        path(o);
        ctx.stroke();
        ctx.fill();

        ctx.fillStyle = "#3a4385";
        ctx.strokeStyle = "#10112e";
        ctx.beginPath();
        path(land);
        ctx.stroke();
        ctx.fill();

        ctx.strokeStyle = "#2d346b";
        ctx.lineWidth = 1;
        ctx.beginPath();
        path(borders);
        ctx.stroke();
        return ctx.stroke();
      };
      redraw();

      var update = function(e, d) {
        var lat = parseFloat(d.lat) || 0,
            lon = parseFloat(d.lon) || 0;

        return function() {
          return d3.transition().duration(1200).tween("rotate", function() {
            var i = d3.interpolate(projection.rotate(), [-lon, -lat]);
            return function(t) {
              var px, py, color, pos, c;
              if ($.isScrolled) {return;}
              projection.rotate(i(t));
              ctx.clearRect(0, 0, width, height);
              if (lat && lon) {
                var v = i(t);
                projection.rotate(i(t));
              }

              redraw();

              if (!lat || !lon) {
                console.log('missing lat or lon!');
                return;
              }

              d.pts.forEach(function(p) {
                c = circle.origin([+p.longitude, +p.latitude]).angle(2.0)();

                color = "#9DB390";
                ctx.fillStyle = color;
                ctx.lineWidth = 3;
                ctx.beginPath();
                path(c);
                ctx.stroke();
                ctx.fill();
              });

              var cs = [
                {a: 4.0, f: '#9DA3C0'},
                {a: 2.5, f: '#FFFFFF'},
                {a: 0.5, f: '#9DB390'},
              ];

              cs.forEach(function(disc) {
                c = circle.origin([+d.lon, +d.lat]).angle(disc.a)();
                ctx.fillStyle = disc.f;
                ctx.lineWidth = 1;
                ctx.beginPath();
                path(c);
                ctx.stroke();
                ctx.fill();
              });
            }
          })
        }()
      };
      $(document).on("event", update);
    });
  };
  $(setup)

  $(function() {
    // to refresh top_stories data in repo, run
    // wget http://newsstand.umiacs.umd.edu/news/top_stories_json -O top_stories.json
    d3.json('./pic_places.json', function(data) {
      data.top_stories.forEach(function(story) {
        var pts = data.top_stories.filter(function(m) {return m.id == story.id;})
        story.lat = pts[0].latitude;
        story.lon = pts[0].longitude;
        story.pts = pts.slice(1, pts.length)
        story.idx = idx;
      });
      data.top_stories = data.top_stories.filter(function(d) {
        return typeof d.lat != "undefined" && typeof d.lon != "undefined";
      });

      var idx = 0;
      var items = d3.select('#info').selectAll('.item')
        .data(data.top_stories, function(d) {return d.id;});
      var div = items.enter()
        .append('a')
          .each(function(d, i) {d.loaded = d.loaded || (i < 4);})
          .attr('href', function(d) {return d.image_url;})
          .attr('class', 'item')
          .style('top', function(d, i) {return (i*100 + 150) + 'px';})
          .style('opacity', '0');

      div.append('img')
          .on('error', function() {this.style.display='none';})  // hide broken imgs
          .style('float', 'left')
          .style('max-width', '200px')
        .filter(function(d) {return d.loaded;})
          .attr('src', function(d) {return d.loaded ? d.image_url : "";});

      div.append('span')
          .style('font-size', '12pt')
	  .style('color', 'black')
          .text(function(d) {return d.title;})

      var interval=null;

      var newData = function() {
	if (idx==0) {
		interval = setInterval(newData, 0);
	}
	else 
	if (idx==1) {
	        clearInterval(interval);
		interval = setInterval(newData, 3500);
	}
        idx++;
        showData();
      }
      var showData = function() {
        idx = (idx + data.top_stories.length) % data.top_stories.length;
        var story = data.top_stories[idx];
        var pts = data.top_stories.filter(function(m) {return m.id == story.id;})
        story.lat = pts[0].latitude;
        story.lon = pts[0].longitude;
        story.pts = pts.slice(1, pts.length)
        story.idx = idx;
        $(document).trigger("event", story);
      }


      newData();
      $(document).keydown(function(e) {
        if (e.which == 37 || e.which == 38) {
          clearInterval(interval);
          idx--;
          showData();
        } else if (e.which == 39 || e.which == 40) {
          clearInterval(interval);
          idx++;
          showData();
        } else if (e.which == 32) {
          clearInterval(interval);
          interval = setInterval(newData, 3500);
          newData();
        }
      });   

 
      $(document).on("event", function(e, story) {
        var active_story = story.idx;

        items.selectAll('img')
          .each(function(d, i) {d.loaded = d.loaded || (Math.abs(i - story.idx) < 4);})
          .filter(function(d) {return d.loaded;})
          .attr('src', function(d) {return d.loaded ? d.image_url : "";})

        items
          .transition()
          .duration(1000)
            .style('top', function(d, i) {return ((i-idx)*100) + 'px';})
            .style('opacity', function(d, i) {return i == story.idx ? '1' : '0';});
      });
    });
  });
})()
