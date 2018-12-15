import Selection from './Selection.js';
import Component from './Component.js';
import {Tools} from './DOM/Tools';

/**
 * View of a circuit
 * @constructor
 */
export const View = function(main, canvas, circuit) {
    this.main = main;
    this.circuit = circuit;

    // The selection object
    this.selection = new Selection(this);

    this.element = canvas;

    canvas.addEventListener('dragover', (event) => {
        event.preventDefault();
    });

    canvas.addEventListener('drop', (event) => {
        event.preventDefault();
	    var data = event.dataTransfer.getData("text/plain");
	    console.log(data);
        console.log(event);
    });

    this.initialize = () => {

        this.setSize();

        main.dragAndDrop.droppable(this, (paletteItem, x, y) => {
            const componentObject = paletteItem.obj;
            if(componentObject === undefined) {
                return;
            }

            this.backup();
            const component = new componentObject;

            component.x = x;
            component.y = y;
            //component.setImg(imgObj);

	        this.circuit.add(component);
	        this.circuit.snapIt(component);
	        this.draw();
        });

        //
        // Mouse management
        //
        let lastMouse = {x: 0, y: 0};
        let mouse = {x: 0, y: 0};
        let lastPage = {x: 0, y: 0};

        let mouseDownListener = (event) => {
            event.preventDefault();

            downListener(event.pageX, event.pageY, false);
        }

        let touchStartListener = (event) => {
            event.preventDefault();

            let touch = event.changedTouches[0];
            downListener(touch.pageX, touch.pageY, true);
        }

        let downListener = (pageX, pageY, touch) => {

            let offset = Tools.offset(canvas);
            lastPage = {x: pageX, y: pageY};
            mouse.x = pageX - offset.left;
            mouse.y = pageY - offset.top;
            lastMouse.x = mouse.x;
            lastMouse.y = mouse.y;

            // If we are in inline mode, we don't allow selecting
            // or dragging at all.
            if(main.options.display === 'inline') {
                this.circuit.touch(mouse.x, mouse.y);
                return;
            }


            this.selection.mouseDown(mouse.x, mouse.y, event);
            this.draw();

            // Only install mouse or touch movement
            // handler while we are moving
            if(touch) {
                canvas.addEventListener('touchmove', touchMoveListener);
                //canvasJ.on('touchmove', touchMoveListener);
            } else {
	            canvas.addEventListener('mousemove', mouseMoveListener);
                //canvasJ.mousemove(mouseMoveListener);
            }

            canvas.parentNode.addEventListener('scroll', scrollListener);
            // canvasJ.parent().scroll(function(event) {
            //
            // });
        };

        let scrollListener = (event) => {
	        var offset = Tools.offset(canvas); // canvasJ.offset();
	        mouse.x = lastPage.x - offset.left;
	        mouse.y = lastPage.y - offset.top;
	        this.selection.mouseMove(mouse.x, mouse.y, mouse.x - lastMouse.x, mouse.y - lastMouse.y);
	        lastMouse.x = mouse.x;
	        lastMouse.y = mouse.y;
	        this.draw();
        }

        let mouseMoveListener = (event) => {
            event.preventDefault();
            moveListener(event.pageX, event.pageY, false);
        }

        let touchMoveListener = (event) => {
            event.preventDefault();

            let touch = event.changedTouches[0];
            moveListener(touch.pageX, touch.pageY, true);
        }

        let moveListener = (pageX, pageY, touch) => {
            // Ignore if we did not actually move
            if(pageX === lastPage.x && pageY === lastPage.y) {
                return;
            }

	        var offset = Tools.offset(canvas);
	        lastPage = {x: pageX, y: pageY};
            mouse.x = pageX - offset.left;
            mouse.y = pageY - offset.top;
            this.selection.mouseMove(mouse.x, mouse.y, mouse.x - lastMouse.x, mouse.y - lastMouse.y);

            let max = this.circuit.maxXY();
            if(max.x > canvas.offsetWidth) {
                //canvasJ.width(max.x);
                canvas.style.width = max.x + 'px';
                canvas.setAttribute("width", max.x);
                circuit.width = max.x;
            }

            if(max.y > canvas.offsetHeight) {
                canvas.style.height = max.y + 'px';
                canvas.setAttribute("height", max.y);
                circuit.height = max.y;
            }
            lastMouse.x = mouse.x;
            lastMouse.y = mouse.y;
            this.draw();
        }

        let mouseDblClickListener = (event) => {
            event.preventDefault();

            if (this.selection.selection.length === 1 &&
                (this.selection.selection[0] instanceof Component)) {
                let component = this.selection.selection[0];
                component.properties(main);
            }
        }

        let touchEndListener = (event) => {
            event.preventDefault();
            let touch = event.changedTouches[0];
            upListener(touch.pageX, touch.pageY, true);
        }

        let touchCancelListener = (event) => {
            let touch = event.changedTouches[0];
            upListener(touch.pageX, touch.pageY, true);
        }

        let mouseUpListener = (event) => {
            event.preventDefault();
            canvas.removeEventListener('mousemove', mouseMoveListener);
            //canvasJ.off("mousemove");
            upListener(event.pageX, event.pageY, false);
        }

        let upListener = (pageX, pageY, touch) => {
            canvas.parentNode.removeEventListener('scroll', scrollListener);
            // canvasJ.parent().off("scroll");
	        let offset = Tools.offset(canvas);
            mouse.x = pageX - offset.left;
            mouse.y = pageY - offset.top;
            this.selection.mouseUp(mouse.x, mouse.y);
            lastMouse.x = mouse.x;
            lastMouse.y = mouse.y;
            this.draw();
        }

        // Install mouse handlers
        canvas.addEventListener('mousedown', mouseDownListener);
        canvas.addEventListener('dblclick', mouseDblClickListener);

        let body = document.querySelector('body');
        body.addEventListener('mouseup', mouseUpListener);


        // Install touch handlers
        canvas.addEventListener('touchstart', touchStartListener);
        canvas.addEventListener('touchend', touchEndListener);
        canvas.addEventListener('touchcancel', touchCancelListener);
    }

    this.draw = function() {
        var ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        this.circuit.draw(ctx, this);
        this.selection.draw(ctx);
    };

    this.delete = function() {
        this.backup();
        this.selection.delete();
        this.draw();
    };

    this.backup = function() {
        this.circuit.circuits.model.backup();
    };

    /**
     * Advance the animation for this view by a given amount of time...
     * @param delta
     */
    this.advance = function(delta) {
        return this.circuit.circuits.advance(delta);
    };


    this.setSize = function() {
        if(canvas.offsetWidth !== this.circuit.width ||
            canvas.offsetHeight !== this.circuit.height) {

            // Size setting
            canvas.style.width = this.circuit.width + 'px';
            canvas.style.height = this.circuit.height + 'px';
            canvas.width = this.circuit.width;
            canvas.height = this.circuit.height;
        }
    };

    this.initialize();
    this.draw();
};



View.prototype.undo = function() {
    if(this.circuit.prev !== null) {
        this.selection.clear();
        this.circuit = this.circuit.prev;
        this.draw();
    }
};


View.prototype.import_tab = function(importer) {
    // var that = this;
    // this.selection.clear();
    //
    // var dlg = new LoadSingleDialog(importer, null);
    // dlg.open(function(data) {
    //     that.backup();
    //
    //     var model = new Model(that.main.model.id);
    //     model.circuits.fmJSON(data.data);
    //
    //     // Find the tab
    //     var circuit = model.getCircuit(importer.from);
    //     if(circuit !== null) {
    //         circuit.name = importer.into;
    //         that.circuit = circuit;
    //         that.main.model.replaceCircuit(circuit);
    //
    //         circuit.components.forEach(function(component) {
    //             component.pending();
    //         });
    //
    //         that.draw();
    //     }
    // });
}

