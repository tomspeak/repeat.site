var retrieveFromStore = function() {
  var data = localStorage.getItem(STORE_KEY);
  var parsed;
  if (!data) return [];
  try {
    parsed = data && JSON.parse(data);
  } catch (error) {
    return [];
  }
  return parsed;
};

var saveToStore = function(data) {
  var serialised = JSON.stringify(data);
  localStorage.setItem(STORE_KEY, serialised);
};

var renderFavourites = function() {
  var frag = document.createDocumentFragment();
  var favouritesElement = document.querySelector('#favourites');
  favourites.forEach(function(favourite) {
    var a = document.createElement('a');
    a.classList.add('fav');
    a.href =
      window.location.protocol +
      '//' +
      window.location.hostname +
      '/watch?v=' +
      favourite.video_id;
    a.textContent = favourite.title;
    frag.appendChild(a);
  });
  favouritesElement.innerHTML = '';
  if (frag.children.length) {
    favouritesElement.innerHTML = '<h2 id="favourites-title">Favourites</h2>';
    favouritesElement.appendChild(frag);
  }
};

var inFavourites = function(video_id) {
  return favourites.some(function(f) {
    return f.video_id === video_id;
  });
};

var renderFavourite = function(video_id) {
  return inFavourites(video_id) ? '\u2605' : '\u2606';
};

var outputFavourite = function(video_id) {
  document.querySelector('#favourite').textContent = renderFavourite(video_id);
};

var toggleFavourite = function(videoData) {
  var video_id = videoData.video_id,
    title = videoData.title;
  if (inFavourites(video_id)) {
    favourites = favourites.filter(function(f) {
      return f.video_id !== video_id;
    });
  } else {
    favourites = [videoData].concat(favourites);
  }

  return saveToStore(favourites);
};

var url = window.location.href;
var regex = new RegExp('v=([a-zA-Z0-9._-]+)&*?', 'i');
var id = regex.exec(url);
var STORE_KEY = 'repeat-favourites';
var favourites = retrieveFromStore();
favourites.length && renderFavourites();

if (!window.location.search) {
  onEmpty();
} else if (!id || !id[1]) {
  onError(
    null,
    `Please pass in a valid url e.g: repeat.site/watch?v=7k6iFwAWMHA`
  );
}

function onYouTubeIframeAPIReady() {
  player = new YT.Player('player', {
    height: '390',
    width: '100%',
    videoId: id[1],
    events: {
      onReady: onPlayerReady,
      onStateChange: onPlayerStateChange,
      onError: onError,
    },
    autoplay: 1,
    modestbranding: true,
  });
}

function onPlayerReady(e) {
  e.target.playVideo();

  var videoData = e.target.getVideoData();
  var video_id = videoData.video_id;

  var title = document.getElementById('title');
  title.textContent = videoData.title;

  var fav = document.querySelector('#favourite');
  outputFavourite(video_id);
  fav.addEventListener('click', function() {
    toggleFavourite(videoData);
    renderFavourites();
    outputFavourite(video_id);
  });

  document.title = '[repeat] - ' + title.textContent;

  var error = document.getElementById('error');
  error.classList.remove('show');
}

function onPlayerStateChange(e) {
  if (e.data === YT.PlayerState.ENDED) {
    e.target.seekTo(0);
  }
}

function onEmpty() {
  var info = document.getElementById('info');
  info.innerHTML = `Please pass in a valid URL, for example: <a href="http://repeat.site/watch?v=7k6iFwAWMHA">repeat.site/watch?v=7k6iFwAWMHA</a>`;
  info.classList.add('show');

  var controls = document.getElementById('controls');
  controls.classList.toggle('hide');
  document.title = 'repeat';
}

function onError(e, msg) {
  var error = document.getElementById('error');
  error.textContent =
    msg || `Something went wrong, please check the ID that you passed in`;
  error.classList.add('show');

  var controls = document.getElementById('controls');
  controls.classList.toggle('hide');
  document.title = 'repeat - error';
}

function updateDocTitle(showTitle) {
  if (showTitle) {
    var title = document.getElementById('title');

    document.title = '[repeat] - ' + title.textContent;
  } else {
    document.title = 'repeat.site';
  }
}

function onToggleHide(e) {
  document.getElementById('content').classList.toggle('hidden');

  if (e.target.checked) {
    updateDocTitle(false);
  } else {
    updateDocTitle(true);
  }
}

function onToggleTheme(e) {
  document.getElementById('body').classList.toggle('is-dark-theme');
  localStorage.setItem(DARK_THEME_KEY, !isDarkTheme());
}

function isDarkTheme() {
  var data = localStorage.getItem(DARK_THEME_KEY);
  var parsed = false;

  try {
    parsed = data && JSON.parse(data);
  } catch (error) {
    return false;
  }

  return parsed;
}

var DARK_THEME_KEY = `IS_DARK_THEME`;
if (isDarkTheme()) {
  document.getElementById('body').classList.add('is-dark-theme');
}

document.getElementById('hide').addEventListener('change', onToggleHide);
document
  .getElementById('toggle-theme')
  .addEventListener('click', onToggleTheme);
