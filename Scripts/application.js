// Wait till the browser is ready to render the game (avoids glitches)
window.requestAnimationFrame(function () {
    new Control.GameController(4, true);
});
