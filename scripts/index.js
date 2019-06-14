
var LeafScene = function (el) {
  this.viewport = el;
  this.world = document.createElement('div');
  this.leaves = [];

  this.options = {
    numLeaves: 20,
    wind: {
      magnitude: 1.2,
      maxSpeed: 12,
      duration: 300,
      start: 0,
      speed: 0
    },
  };

  this.width = this.viewport.offsetWidth;
  this.height = this.viewport.offsetHeight;

  // animation helper
  this.timer = 0;

  this._resetLeaf = function (leaf) {

    // place leaf towards the top left
    leaf.x = this.width * 2 - Math.random() * this.width * 1.75;
    leaf.y = -10;
    leaf.z = Math.random() * 200;
    if (leaf.x > this.width) {
      leaf.x = this.width + 10;
      leaf.y = Math.random() * this.height / 2;
    }
    // at the start, the leaf can be anywhere
    if (this.timer == 0) {
      leaf.y = Math.random() * this.height;
    }

    // Choose axis of rotation.
    // If axis is not X, chose a random static x-rotation for greater variability
    leaf.rotation.speed = Math.random() * 10;
    var randomAxis = Math.random();
    if (randomAxis > 0.5) {
      leaf.rotation.axis = 'X';
    } else if (randomAxis > 0.25) {
      leaf.rotation.axis = 'Y';
      leaf.rotation.x = Math.random() * 180 + 90;
    } else {
      leaf.rotation.axis = 'Z';
      leaf.rotation.x = Math.random() * 360 - 180;
      // looks weird if the rotation is too fast around this axis
      leaf.rotation.speed = Math.random() * 3;
    }

    // random speed
    leaf.xSpeedVariation = Math.random() * 0.8 - 0.4;
    leaf.ySpeed = Math.random() + 1.5;

    return leaf;
  }

  this._updateLeaf = function (leaf) {
    var leafWindSpeed = this.options.wind.speed(this.timer - this.options.wind.start, leaf.y);

    var xSpeed = leafWindSpeed + leaf.xSpeedVariation;
    leaf.x -= xSpeed;
    leaf.y += leaf.ySpeed;
    leaf.rotation.value += leaf.rotation.speed;

    var t = 'translateX( ' + leaf.x + 'px ) translateY( ' + leaf.y + 'px ) translateZ( ' + leaf.z + 'px )  rotate' + leaf.rotation.axis + '( ' + leaf.rotation.value + 'deg )';
    if (leaf.rotation.axis !== 'X') {
      t += ' rotateX(' + leaf.rotation.x + 'deg)';
    }
    leaf.el.style.webkitTransform = t;
    leaf.el.style.MozTransform = t;
    leaf.el.style.oTransform = t;
    leaf.el.style.transform = t;

    // reset if out of view
    if (leaf.x < -10 || leaf.y > this.height + 10) {
      this._resetLeaf(leaf);
    }
  }

  this._updateWind = function () {
    // wind follows a sine curve: asin(b*time + c) + a
    // where a = wind magnitude as a function of leaf position, b = wind.duration, c = offset
    // wind duration should be related to wind magnitude, e.g. higher windspeed means longer gust duration

    if (this.timer === 0 || this.timer > (this.options.wind.start + this.options.wind.duration)) {

      this.options.wind.magnitude = Math.random() * this.options.wind.maxSpeed;
      this.options.wind.duration = this.options.wind.magnitude * 50 + (Math.random() * 20 - 10);
      this.options.wind.start = this.timer;

      var screenHeight = this.height;

      this.options.wind.speed = function (t, y) {
        // should go from full wind speed at the top, to 1/2 speed at the bottom, using leaf Y
        var a = this.magnitude / 2 * (screenHeight - 2 * y / 3) / screenHeight;
        return a * Math.sin(2 * Math.PI / this.duration * t + (3 * Math.PI / 2)) + a;
      }
    }
  }
}

LeafScene.prototype.init = function () {

  for (var i = 0; i < this.options.numLeaves; i++) {
    var leaf = {
      el: document.createElement('div'),
      x: 0,
      y: 0,
      z: 0,
      rotation: {
        axis: 'X',
        value: 0,
        speed: 0,
        x: 0
      },
      xSpeedVariation: 0,
      ySpeed: 0,
      path: {
        type: 1,
        start: 0,

      },
      image: 1
    };
    this._resetLeaf(leaf);
    this.leaves.push(leaf);
    this.world.appendChild(leaf.el);
  }

  this.world.className = 'leaf-scene';
  this.viewport.appendChild(this.world);

  // set perspective
  this.world.style.webkitPerspective = "400px";
  this.world.style.MozPerspective = "400px";
  this.world.style.oPerspective = "400px";
  this.world.style.perspective = "400px";

  // reset window height/width on resize
  var self = this;
  window.onresize = function (event) {
    self.width = self.viewport.offsetWidth;
    self.height = self.viewport.offsetHeight;
  };
}

LeafScene.prototype.render = function () {
  this._updateWind();
  for (var i = 0; i < this.leaves.length; i++) {
    this._updateLeaf(this.leaves[i]);
  }

  this.timer++;

  requestAnimationFrame(this.render.bind(this));
}

// start up leaf scene
var leafContainer = document.querySelector('.falling-leaves'),
  leaves = new LeafScene(leafContainer);

leaves.init();
leaves.render();



//background music
var listAudio = ['Mua-Thu-La-Xanh-Trinh[128kbps_MP3].mp3','HoaSua-JustaTee_Mr_A_kimJojo.mp3', 'Thu-Cuoi-MrTXYanbiXHangBingboong(BingzRemix).mp3', 'Dead-Leaves-BTS.mp3','TOPPDOGG-Rainy-Day.mp3'];
var listAudioTitle = ['MÙA THU LÁ XANH - TRINH | EDIT BY MÈO LƯỜI','Hoa Sữa - JustaTee; Mr.A; Kim Jojo', 'Thu Cuối - Mr T X Yanbi X Hằng Bingboong (Bingz Remix)', 'Dead Leaves - BTS','[MV] 탑독(ToppDogg) - 비가 와서 그래(Rainy day)'];
var audioBg = document.querySelector('audio');
var playButton = document.querySelector('.background-music-play');
var nextButton = document.querySelector('.background-music-next');
var preButton = document.querySelector('.background-music-pre');
var playButtonIcon = document.querySelector('.background-music-play i');
audioBg.volume = 0.5;

var bgMusicTitle = document.querySelectorAll('#background-music-title > div');
  var currentSong = audioBg.currentSrc.split('/');
  var currentSongFile = currentSong[currentSong.length - 1];
  for (let index = 0; index <= listAudio.length - 1; index++) {
    if (listAudio[index] == currentSongFile) {    
      bgMusicTitle.forEach(element => {
        element.textContent = listAudioTitle[index];
      });
    }
  }
playButton.onclick = function () {
  if (audioBg.paused) {
    audioBg.play();
    playButtonIcon.classList.remove('fa-play');
    playButtonIcon.classList.add('fa-pause');

  } else {
    audioBg.pause();
    playButtonIcon.classList.remove('fa-pause');
    playButtonIcon.classList.add('fa-play');
  }
};
nextButton.onclick = function () {
  var a = audioBg.currentSrc.split('/');
  var b = a[a.length - 1];
  for (let index = 0; index <= listAudio.length - 1; index++) {
    if (listAudio[index] == b && audioBg.paused) {
      if (index == listAudio.length - 1) {
        audioBg.src = 'music-background/' + listAudio[0];
        bgMusicTitle.forEach(element => {
          element.textContent = listAudioTitle[0];
        });
        audioBg.load();      
        break;
      }
      audioBg.src = 'music-background/' + listAudio[index + 1];
      bgMusicTitle.forEach(element => {
        element.textContent = listAudioTitle[index+1];
      });
      audioBg.load();   
      break;
    }
    if (listAudio[index] == b && !audioBg.paused) {
      if (index == listAudio.length - 1) {
        audioBg.src = 'music-background/' + listAudio[0];
        bgMusicTitle.forEach(element => {
          element.textContent = listAudioTitle[0];
        });
        audioBg.load();  
        audioBg.play();    
        break;
      }
      audioBg.src = 'music-background/' + listAudio[index + 1];
      bgMusicTitle.forEach(element => {
        element.textContent = listAudioTitle[index+1];
      });
      audioBg.load(); 
      audioBg.play();  
      break;
    }
  }
};
preButton.onclick = function () {
  var a = audioBg.currentSrc.split('/');
  var b = a[a.length - 1];
  for (let index = 0; index <= listAudio.length - 1; index++) {
    if (listAudio[index] == b && audioBg.paused) {
      if (index == 0) {
        audioBg.src = 'music-background/' + listAudio[listAudio.length - 1];
        bgMusicTitle.forEach(element => {
          element.textContent = listAudioTitle[listAudio.length - 1];
        });
        audioBg.load();
        break;
      }
      audioBg.src = 'music-background/' + listAudio[index - 1];
      bgMusicTitle.forEach(element => {
        element.textContent = listAudioTitle[index - 1];
      });
      audioBg.load();
      break;
    }
    if (listAudio[index] == b && !audioBg.paused) {
      if (index == 0) {
        audioBg.src = 'music-background/' + listAudio[listAudio.length - 1];
        bgMusicTitle.forEach(element => {
          element.textContent = listAudioTitle[listAudio.length - 1];
        });
        audioBg.load();
        audioBg.play();
        break;
      }
      audioBg.src = 'music-background/' + listAudio[index - 1];
      bgMusicTitle.forEach(element => {
        element.textContent = listAudioTitle[index - 1];
      });
      audioBg.load();
      audioBg.play();
      break;
    }
  }
};
audioBg.onended = function () {
  var a = audioBg.currentSrc.split('/');
  var b = a[a.length - 1];
  for (let index = 0; index <= listAudio.length - 1; index++) {
    if (listAudio[index] == b) {
      if (index == listAudio.length - 1) {
        audioBg.src = 'music-background/' + listAudio[0].toString();
        audioBg.load();
        audioBg.play();
        break;
      }
      audioBg.src = 'music-background/' + listAudio[index + 1].toString();
      audioBg.load();
      audioBg.play();
      break;
    }
  }
};

//Background effect
var backgroundEffectPlay = document.querySelector('.background-effect-play');
var backgroundEffectPlayIcon = document.querySelector('.background-effect-play i');
var backgroundEffect = document.querySelector('.background-effect');
var BackgroundToggler = true;
backgroundEffectPlay.onclick = function () {
  if (BackgroundToggler) {
    BackgroundToggler = !BackgroundToggler;
    backgroundEffect.style.display = 'none';
    backgroundEffectPlayIcon.classList.remove('fa-pause');
    backgroundEffectPlayIcon.classList.add('fa-play');
  } else {
    BackgroundToggler = !BackgroundToggler;
    backgroundEffect.style.display = 'block';
    backgroundEffectPlayIcon.classList.remove('fa-play');
    backgroundEffectPlayIcon.classList.add('fa-pause');
  }
};


//input number custom
(function () {

  window.inputNumber = function (el) {

    var min = el.attr('min') || false;
    var max = el.attr('max') || false;

    var els = {};

    els.dec = el.prev();
    els.inc = el.next();

    el.each(function (i, ele) { ele = $(ele); els.dec = ele.prev(); els.inc = ele.next(); init(ele); });

    function init(el) {

      els.dec.on('click', decrement);
      els.inc.on('click', increment);

      function decrement() {
        var value = el[0].value;
        value--;
        if (!min || value >= min) {
          el[0].value = value;
        }
      }

      function increment() {
        var value = el[0].value;
        value++;
        if (!max || value <= max) {
          el[0].value = value++;
        }
      }
    }
  }
})();
inputNumber($('.input-number'));

//Mega menu
function myFunction(x) {
  let items = document.querySelectorAll(".mega-dropdown-menu ul");
  var menus = document.querySelectorAll('.mega-dropdown-menu ');

  if (x.matches) { // If media query matches  
    items.forEach(element => {
      element.classList.add("show");
      menus.forEach(element => {
        element.classList.remove("show");
      });
    });

    var icons = document.querySelectorAll('.top-menu  i');
    icons.forEach(element => {
      if (element.classList.contains('fa-angle-up')) {
        element.classList.remove('fa-angle-up');
        element.classList.add('fa-angle-down');
      }
    });

  } else {
    items.forEach(element => {
      element.classList.remove("show");
    });

  }
}

var x = window.matchMedia("(min-width: 768px)")
myFunction(x) // Call listener function at run time
x.addListener(myFunction) // Attach listener function on state changes 

// angle up/down icon menu when click
function megaMenuIcon() {

  var icons = document.querySelectorAll('.top-menu  i');
  icons.forEach(element => {
    element.addEventListener('click', function (e) {
      if (e.target.classList.contains('fa-angle-down')) {
        e.target.classList.remove('fa-angle-down');
        e.target.classList.add('fa-angle-up');
      } else {
        e.target.classList.remove('fa-angle-up');
        e.target.classList.add('fa-angle-down');

      }
    });
  });
}
megaMenuIcon();



//SCroll top button
// Scroll top button show/hide
// When the user scrolls down 20px from the top of the document, show the button
window.onscroll = function () { scrollFunction() };
function scrollFunction() {
  if (document.body.scrollTop > 200 || document.documentElement.scrollTop > 200) {
    document.getElementById("croll-top").style.display = "block";
  } else {
    document.getElementById("croll-top").style.display = "none";
  }
}
// When the user clicks on the button, scroll to the top of the document
let scrollButton = document.querySelector('#croll-top');
scrollButton.addEventListener('click', () => window.scrollTo({
  top: 0,
  behavior: 'smooth',
}));




//Jquery
$(document).ready(function () {

  //marquee background-music-title
  $('.background-music').on('hide.bs.dropdown', function () {
    $('#background-music-title').css('visibility', 'hidden');
  });
  $('.background-music').on('show.bs.dropdown', function () {
    $('#background-music-title').css('visibility', 'visible');
  });

  $('[data-tooltip="tooltip"]').tooltip();
  //HEader right dropdown state style
  //wishlist
  $('.wish-list-hover').on('hide.bs.dropdown', function () {
    $('.wish-list-hover > a').css('color', '#1c1207');
    $('.wish-list-hover > a').css('border', '1px solid #802c32a8');
    $('.wish-list-hover > a').css('background', 'rgb(255, 255, 255)');
    $('.wish-list-hover .badge').css('color', 'rgb(255, 255, 255)');
    $('.wish-list-hover .badge').css('background', 'rgb(0, 0, 0)');
  });
  $('.wish-list-hover').on('show.bs.dropdown', function () {
    $('.wish-list-hover > a').css('color', '#c43b31');
    $('.wish-list-hover > a').css('border', '1px solid #c43b31');
    $('.wish-list-hover > a').css('background', 'rgb(255, 255, 255)');
    $('.wish-list-hover .badge').css('color', 'rgb(255, 255, 255)');
    $('.wish-list-hover .badge').css('background', '#c43b31');
  });
  $('.wish-list-hover').on('mouseover', function () {
    $('.wish-list-hover > a').css('color', '#c43b31');
    $('.wish-list-hover > a').css('border', '1px solid #c43b31');
    $('.wish-list-hover > a').css('background', 'rgb(255, 255, 255)');
    $('.wish-list-hover .badge').css('color', 'rgb(255, 255, 255)');
    $('.wish-list-hover .badge').css('background', '#c43b31');
  });
  $('.wish-list-hover').on('mouseleave', function () {
    $('.wish-list-hover > a').css('color', '#1c1207');
    $('.wish-list-hover > a').css('border', '1px solid #802c32a8');
    $('.wish-list-hover > a').css('background', 'rgb(255, 255, 255)');
    $('.wish-list-hover .badge').css('color', 'rgb(255, 255, 255)');
    $('.wish-list-hover .badge').css('background', 'rgb(0, 0, 0)');
  });
  //cart
  $('.cart-hover').on('hide.bs.dropdown', function () {
    $('.cart-hover > a').css('color', '#1c1207');
    $('.cart-hover > a').css('border', '1px solid #802c32a8');
    $('.cart-hover > a').css('background', 'rgb(255, 255, 255)');
    $('.cart-hover .badge').css('color', 'rgb(255, 255, 255)');
    $('.cart-hover .badge').css('background', 'rgb(0, 0, 0)');
  });
  $('.cart-hover').on('show.bs.dropdown', function () {
    $('.cart-hover > a').css('color', '#c43b31');
    $('.cart-hover > a').css('border', '1px solid #c43b31');
    $('.cart-hover > a').css('background', 'rgb(255, 255, 255)');
    $('.cart-hover .badge').css('color', 'rgb(255, 255, 255)');
    $('.cart-hover .badge').css('background', '#c43b31');
  });
  $('.cart-hover').on('mouseover', function () {
    $('.cart-hover > a').css('color', '#c43b31');
    $('.cart-hover > a').css('border', '1px solid #c43b31');
    $('.cart-hover > a').css('background', 'rgb(255, 255, 255)');
    $('.cart-hover .badge').css('color', 'rgb(255, 255, 255)');
    $('.cart-hover .badge').css('background', '#c43b31');
  });
  $('.cart-hover').on('mouseleave', function () {
    $('.cart-hover > a').css('color', '#1c1207');
    $('.cart-hover > a').css('border', '1px solid #802c32a8');
    $('.cart-hover > a').css('background', 'rgb(255, 255, 255)');
    $('.cart-hover .badge').css('color', 'rgb(255, 255, 255)');
    $('.cart-hover .badge').css('background', 'rgb(0, 0, 0)');
  });
  //user
  $('.user-hover').on('hide.bs.dropdown', function () {
    $('.user-hover > a').css('color', '#1c1207');
    $('.user-hover > a').css('border', '1px solid #802c32a8');
    $('.user-hover > a').css('background', 'rgb(255, 255, 255)');
  });
  $('.user-hover').on('show.bs.dropdown', function () {
    $('.user-hover > a').css('color', '#c43b31');
    $('.user-hover > a').css('border', '1px solid #c43b31');
    $('.user-hover > a').css('background', 'rgb(255, 255, 255)');
  });
  $('.user-hover').on('mouseover', function () {
    $('.user-hover > a').css('color', '#c43b31');
    $('.user-hover> a').css('border', '1px solid #c43b31');
    $('.user-hover > a').css('background', 'rgb(255, 255, 255)');
  });
  $('.user-hover').on('mouseleave', function () {
    $('.user-hover > a').css('color', '#1c1207');
    $('.user-hover > a').css('border', '1px solid #802c32a8');
    $('.user-hover > a').css('background', 'rgb(255, 255, 255)');
  });

  //stopPropagation
  $(document).on('click', '.header-right .dropdown-menu', function (e) {
    e.stopPropagation();
  });
  $(document).on('click', '.mega-dropdown-menu', function (e) {
    e.stopPropagation();
  });
  $(document).on('click', '.background-music .dropdown-menu', function (e) {
    e.stopPropagation();
  });
  $(document).on('click', '.background-effect .dropdown-menu', function (e) {
    e.stopPropagation();
  });

  //Chính sách bán hàng
  $('.shop-policy-slick').slick({
    dots: false,
    arrows: false,
    infinite: false,
    autoplay: true,
    autoplaySpeed: 3000,
    speed: 300,
    slidesToShow: 4,
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 991.98,
        settings: {
          slidesToShow: 4,
          slidesToScroll: 1
        }
      },
      {
        breakpoint: 767.98,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1
        }
      },
      {
        breakpoint: 575.98,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        }
      }
    ]
  });

  //giảm giá sản phẩm
  $('.sale-slick').slick({
    dots: true,
    arrows: false,
    infinite: false,
    autoplay: true,
    autoplaySpeed: 3000,
    speed: 300,
    slidesToShow: 5,
    slidesToScroll: 1,
    

    responsive: [
      {
        breakpoint: 1199.98,
        settings: {
          slidesToShow: 4,
          slidesToScroll: 1
        }
      },
      {
        breakpoint: 991.98,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1
        }
      },
      {
        breakpoint: 767.98,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1
        }
      },
      {
        breakpoint: 575.98,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1
        }
      }
    ]
  });
  //bán chạysản phẩm
  $('.best-sale-slick').slick({
    dots: true,
    arrows: false,
    infinite: false,
    autoplay: true,
    autoplaySpeed: 3000,
    speed: 300,
    slidesToShow: 5,
    slidesToScroll: 1,

    responsive: [
      {
        breakpoint: 1199.98,
        settings: {
          slidesToShow: 4,
          slidesToScroll: 1
        }
      },
      {
        breakpoint: 991.98,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1
        }
      },
      {
        breakpoint: 767.98,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1
        }
      },
      {
        breakpoint: 575.98,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1
        }
      }
    ]
  });


  //Blog slick
  $('.blog-slick').slick({
    dots: true,
    arrows: false,
    infinite: false,
    autoplay: true,
    autoplaySpeed: 3000,
    speed: 300,
    slidesToShow: 4,
    slidesToScroll: 1,

    responsive: [
      {
        breakpoint: 1199.98,
        settings: {
          slidesToShow: 4,
          slidesToScroll: 1
        }
      },
      {
        breakpoint: 991.98,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1
        }
      },
      {
        breakpoint: 767.98,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1
        }
      },
      {
        breakpoint: 575.98,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1
        }
      }
    ]
  });

  //Product cattegory slick
  $('.product-category-slick').slick({
    dots: true,
    arrows: false,
    infinite: false,
    autoplay: true,
    autoplaySpeed: 3000,
    speed: 300,
    slidesToShow: 5,
    slidesToScroll: 1,

    responsive: [
      {
        breakpoint: 1199.98,
        settings: {
          slidesToShow: 4,
          slidesToScroll: 1
        }
      },
      {
        breakpoint: 991.98,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1
        }
      },
      {
        breakpoint: 767.98,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1
        }
      },
      {
        breakpoint: 575.98,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1
        }
      }
    ]
  });

  //brand slick
  $('.brand-slick').slick({
    dots: false,
    arrows: false,
    infinite: true,
    autoplay: true,
    autoplaySpeed: 3000,
    speed: 300,
    slidesToShow: 9,
    slidesToScroll: 1,

    responsive: [
      {
        breakpoint: 1199.98,
        settings: {
          slidesToShow: 8,
          slidesToScroll: 1
        }
      },
      {
        breakpoint: 991.98,
        settings: {
          slidesToShow: 6,
          slidesToScroll: 1
        }
      },
      {
        breakpoint: 767.98,
        settings: {
          slidesToShow: 4,
          slidesToScroll: 1
        }
      },
      {
        breakpoint: 575.98,
        settings: {
          slidesToShow: 4,
          slidesToScroll: 1
        }
      }
    ]
  });

  //fix slick tab 
  $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
    e.target
    e.relatedTarget
    $('.tab-1-slick').slick('setPosition');
    $('.tab-2-slick').slick('setPosition');
    $('.tab-3-slick').slick('setPosition');
  });

  //fix slick modal
  $('.modal').on('shown.bs.modal', function (e) {
    $('.slider-for').resize();
    $('.slider-nav').resize();
  });
  //Product preview slick sync
  $('.slider-for').slick({
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    fade: true,
    asNavFor: '.slider-nav'
  });
  $('.slider-nav').slick({
    slidesToShow: 3,
    slidesToScroll: 1,
    asNavFor: '.slider-for',
    dots: false,
    arrows: false,
    centerMode: false,
    focusOnSelect: true
  });

  $(".product-rating").starRating({
    starSize: 20,
    initialRating: 4,
    callback: function (currentRating, $el) {
      // make a server call here
    }
  });


  // $('#background-music-title').width($('#div1').width());
});
