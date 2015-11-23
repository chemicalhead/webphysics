/// <reference path="classes/MainControl.ts"/>

window.onload = () => {
    var el = <HTMLCanvasElement> document.getElementById("gameCanvas");
    var mainControl = new MainControl(el);
    mainControl.load();
    requestAnimationFrame(mainControl.update.bind(mainControl));
}


