/**
 * @class Ext.ux.window.plugin.Snap
 * @author Danny Roessner
 * 
 * This plugin will add snap capability to windows.
 */
Ext.define('Ext.ux.window.plugin.Snap', {
	extend: 'Ext.AbstractPlugin',
	alias: 'plugin.snapwindow',
	/**
	 * CSS class of the snap proxy.
	 */
	snapProxyCls: 'snap-proxy',
	init: function(win) {
		// Add the snap proxy class to the window
		win.snapProxyCls = this.snapProxyCls;
		
		// Add events to the window to handle the snap functionality
		win.on({
			dragstart: this.onDragStart,
			drag: this.onDrag,
			dragend: this.onDragEnd,
			restore: this.onRestore,
			resize: this.onResize,
			scope: win
		});
	},
	onDragStart: function(drag, event) {
		var win = this,
			element = document.documentElement,
			body = document.getElementsByTagName('body')[0];

		// Calculate the viewport width and height
		win.snapProxyData =  win.snapProxyData || {};
		Ext.apply(win.snapProxyData, {
			viewportWidth: window.innerWidth || element.clientWidth || body.clientWidth,
			viewportHeight: window.innerHeight|| element.clientHeight|| body.clientHeight
		});
	},
	onDrag: function(drag, event) {
		var win = this,
			body = document.getElementsByTagName('body')[0],
			mouseX = event.getX(),
			mouseY = event.getY(),
			proxy = drag.proxy,
			xy = proxy.getXY(),
			x = xy[0],
			y = xy[1],
			viewportWidth = win.snapProxyData.viewportWidth,
			viewportHeight = win.snapProxyData.viewportHeight,
			proxyLeft,
			proxyWidth,
			proxyPosition;

		// Check if the mouse is dragged off the screen to the left, right, or top and calculate proxy size
		if (x <= 0 && mouseX <= 0) {
			proxyLeft = 0;
			proxyWidth = parseInt(viewportWidth / 2, 10);
			proxyPosition = 'left';
		} else if (y <= 0 && mouseY <= 0) {
			proxyLeft = 0;
			proxyWidth = viewportWidth;
			proxyPosition = 'full';
		} else if ((x + proxy.getWidth()) >= viewportWidth && mouseX >= viewportWidth) {
			proxyLeft = parseInt(viewportWidth / 2, 10);
			proxyWidth = parseInt(viewportWidth / 2, 10);
			proxyPosition = 'right';
		} else if (win.snapProxyData.snapped) {
			win.setSize(win.snapProxyData.previousWidth, win.snapProxyData.previousHeight);
		}

		// Create and display the snap proxy if the mouse was dragged off the screen, otherwise destroy it
		if (proxyWidth && !win.snapProxy) {
			win.snapProxy = Ext.create('Ext.Component', {
				renderTo: Ext.getBody(),
				cls: win.snapProxyCls,
				style: {
					left: proxyLeft + 'px',
					'z-index': win.getEl().getZIndex()
				},
				height: viewportHeight - 2,
				width: proxyWidth - 2,
				proxyPosition: proxyPosition
			});
		} else if (!proxyWidth && win.snapProxy) {
			win.snapProxy.destroy();
			win.snapProxy = null;
		}
	},
	onDragEnd: function(drag, event) {
		var win = this,
			snapProxy = win.snapProxy,
			snapXY;

		// Size the window depending on where it was dragged to
		if (snapProxy && snapProxy.getEl()) {
			if (!win.snapProxyData.snapped) {
				Ext.apply(win.snapProxyData, {
					previousWidth: win.getWidth(),
					previousHeight: win.getHeight()
				});
			}
			if (snapProxy.proxyPosition === 'full' && win.maximizable) {
				win.maximize();
			} else {
				win.setSize(snapProxy.getWidth(), snapProxy.getHeight());
				snapXY = snapProxy.getXY();
				Ext.defer(function() {
					if (win && win.getEl()){
						win.setXY(snapXY);
					}
				}, 10);
				win.snapProxy.destroy();
				win.snapProxy = null;
			}
			snapProxy.destroy();
			win.snapProxyData.snapped = true;
		} else {
			win.snapProxyData.snapped = false;
		}
	},
	onRestore: function() {
		if (this.snapProxyData) {
			this.center();
		}
	},
	onResize: function() {
		if (this.snapProxyData) {
			this.snapProxyData.snapped = false;
		}
	}
});