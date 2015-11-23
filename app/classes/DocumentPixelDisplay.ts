class DisplayDocumentPixelLocation {
    htmlElement: HTMLButtonElement;
    constructor(x: number, y: number) {
        this.htmlElement = document.createElement("button");
        document.body.appendChild(this.htmlElement);
        this.htmlElement.style.position = "absolute";
        this.htmlElement.style.left = x + "px";
        this.htmlElement.style.top = y + "px";
        this.htmlElement.style.width = "100px";
        this.htmlElement.style.height = "50px";

        document.addEventListener("mousemove", this.onMouseMove.bind(this));
    }

    onMouseMove(event: MouseEvent) {
        this.htmlElement.innerText = "x: " + Math.round(event.clientX) + " y: " + Math.round(event.clientY);
    }
} 