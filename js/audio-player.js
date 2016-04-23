var Player = function (element) {
    var _this = this;
    this.element = element;
    this.audioElement = element.querySelectorAll('audio')[0];
    this.playlist = element.querySelectorAll('ul.playlist')[0];
    this.controls = {
        prev: element.querySelectorAll('.controls .prev')[0],
        play: element.querySelectorAll('.controls .play')[0],
        next: element.querySelectorAll('.controls .next')[0]
    };
    this.progress = element.querySelectorAll('.progress')[0];
    this.bar = element.querySelectorAll('.progress .bar')[0];
    this.seeking = false;
    this.seekwait = false;

    this.icons = {
        prev: '<svg width="100%" height="100%" viewBox="0 0 24 24" style="transform: rotate(180deg) scale(0.33);"><path d="M19 12l-18 12v-24l18 12zm4-11h-4v22h4v-22z"/></svg>',
        play: '<svg width="100%" height="100%" viewBox="0 0 36 36" ><defs><path id="pause-icon" data-state="playing" d="M11,10 L17,10 17,26 11,26 M20,10 L26,10 26,26 20,26" /><path id="play-icon"  data-state="paused"  d="M11,10 L18,13.74 18,22.28 11,26 M18,13.74 L26,18 26,18 18,22.28" /></defs><use xlink:href="#play-icon" /></svg>',
        next: '<svg width="100%" height="100%" viewBox="0 0 24 24" style="transform: scale(0.33)"><path d="M19 12l-18 12v-24l18 12zm4-11h-4v22h4v-22z"/></svg>'
    }

    

    this.initialize = function() {
        var audio = document.createElement('audio'),
            playlist = document.createElement('ul'),
            controls = document.createElement('div'),
            controlChildren = ['handle', 'prev', 'play', 'next'],
            progress = document.createElement('div'),
            bar = document.createElement('div');

        playlist.classList.add('playlist'),
        controls.classList.add('controls'),
        progress.classList.add('progress'),
        bar.classList.add('bar');
        
        audio.setAttribute('preload', 'auto');
        audio.setAttribute('type', 'audio/mpeg');
        audio.innerHTML = 'Sorry, your browser does not support this audio player';
        _this.element.appendChild(audio);
        _this.audioElement = audio;

        progress.appendChild(bar);
        _this.element.appendChild(progress);
        _this.progress = progress;
        _this.bar = bar;

        for (var i = 0; i < controlChildren.length; i++) {
            controls.appendChild((function (name) {
                var element = document.createElement('span');
                element.classList.add(name);
                if (_this.icons.hasOwnProperty(name)) {
                    element.innerHTML = _this.icons[name];
                }
                _this.controls[name] = element;
                return element;
            }(controlChildren[i])));
        }
        _this.element.appendChild(controls);
        
        _this.element.insertBefore(playlist, _this.element.firstChild);
        _this.playlist = playlist;
    }

    this.current = null;

    this.add = function (url, title, artist, time, play) {
        play = (play === true);

        var track = document.createElement('li');
        track.setAttribute('data-url', url);
        track.setAttribute('data-title', title);
        track.setAttribute('data-artist', artist);
        track.setAttribute('data-time', time);
        track.innerHTML = title + " - " + artist + " (" + time + ") <span class=\"remove\">X</span>";
        this.playlist.appendChild(track);

        if (this.audioElement.paused || play) {
            this.play(track);
        }
    }

    this.remove = function (track) {
        if (_this.current === track) {
            _this.audioElement.pause();
            _this.resetAudio();
        }
        _this.playlist.removeChild(track);
    }

    this.play = function(track) {
        if (track === null) {
            return;
        }
        var source = document.createElement('source');
        source.setAttribute('src', track.getAttribute('data-url'));
        _this.resetAudio();
        _this.current = track;

        _this.resetPlaylist();
        track.classList.add('playing');

        _this.audioElement.appendChild(source);
        _this.audioElement.load();
        _this.audioElement.play();
        _this.controls.play.classList.add('playing');
    }

    this.pause = function() {
        if (_this.current === null) {
            return;
        }
        if (_this.audioElement.paused) {
            _this.audioElement.play();
            _this.controls.play.classList.add('playing');
            _this.current.classList.add('playing');
            return;
        }
        _this.audioElement.pause();
        _this.controls.play.classList.remove('playing');
    }

    this.next = function() {
        var index = Array.prototype.indexOf.call(_this.playlist.childNodes, _this.current);
        if (index >= _this.playlist.childNodes.length - 1) {
            _this.resetPlaylist();
            return _this.audioElement.pause();
        }
        index++;
        _this.play(_this.playlist.childNodes[index]);
    }

    this.prev = function() {
        var index = Array.prototype.indexOf.call(_this.playlist.childNodes, _this.current);
        if (index <= 0) {
            _this.play(_this.current);
            return;
        }
        index--;
        _this.play(_this.playlist.childNodes[index]);
    }

    this.resetAudio = function() {
        var sources = this.audioElement.querySelectorAll('source');
        for (var i = 0; i < sources.length; i++) {
            sources[i].parentNode.removeChild(sources[i]);
        }
    }

    this.resetPlaylist = function () {
        for (var i = 0; i < _this.playlist.childNodes.length; i++) {
            _this.playlist.childNodes[i].classList.remove('playing');
        }
    }

    this.playlistSelectOrRemove = function (e) {
        var target = e.target;
        while (target.nodeName !== 'LI' || target.classList.contains('remove')) {
            if (target.classList.contains('remove')) {
                return _this.remove(target.parentNode);
            }
            target = target.parentNode;
        }
        _this.play(target);
    }

    this.updateProgressBar = function (e) {
        _this.bar.style.width = (e.target.currentTime * 100 / e.target.duration) + '%';
    }

    this.progressBarSeek = function (e) {
        if (!_this.seeking || _this.seekWait || _this.audioElement.paused || typeof e === 'undefined') {
            return;
        }
        _this.seekWait = true;

        var target = e.target,
            value = (e.type === 'touchmove') ? (e.touches[0].pageX - _this.progress.offsetLeft) : e.layerX,
            total = _this.progress.offsetWidth,
            duration = _this.audioElement.duration;

        if (isNaN(value) || isNaN(total) || total === 0 || isNaN(duration)) {
            return;
        }

        while (!target.classList.contains('progress')) {
            target = target.parentNode;
        }

        seekTime = duration * (value / total);
        _this.audioElement.currentTime = seekTime;

        setTimeout(function () {
            _this.seekWait = false;
        }, 15);

    }

    this.startSeek = function(e) {
        _this.seeking = true;
        _this.progressBarSeek(e);
    }

    this.endSeek = function (e) {
        _this.seeking = false;
    }

    this.initialize();

    this.audioElement.addEventListener('ended', this.next);
    this.audioElement.addEventListener('timeupdate', this.updateProgressBar);
    this.progress.addEventListener('mousemove', this.progressBarSeek);
    this.progress.addEventListener('mousedown', this.startSeek);
    this.progress.addEventListener('mouseup', this.endSeek);
    this.progress.addEventListener('mouseleave', this.endSeek);

    this.progress.addEventListener('touchmove', this.progressBarSeek);
    this.progress.addEventListener('touchstart', this.startSeek);
    this.progress.addEventListener('touchend', this.endSeek);
    this.progress.addEventListener('touchcancel', this.endSeek);

    this.controls.play.addEventListener('click', this.pause);
    this.controls.prev.addEventListener('click', this.prev);
    this.controls.next.addEventListener('click', this.next);
    this.playlist.addEventListener('click', this.playlistSelectOrRemove);
}
