let controller: Control.GameController;

// Wait till the browser is ready to render the game (avoids glitches)
window.requestAnimationFrame(() => {
    controller = new Control.GameController(4, true);
});
