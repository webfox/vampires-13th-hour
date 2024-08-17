# Vampires 13th Hour

### 2024 js13kGames https://js13kgames.com/

This is Webfox' first submission to the js13kGames competition. We are by no means game developers nor did we do any research before diving head first into developing a game using vanilla JavaScript and HTML.


This year's competition was themed around the fear of number 13.


<div id="html-content"></div>

<script>
fetch('https://raw.githubusercontent.com/webfox/vampires-13th-hour/main/src/index.html')
  .then(response => response.text())
  .then(data => {
    document.getElementById('html-content').innerHTML = data;
  });
</script>
