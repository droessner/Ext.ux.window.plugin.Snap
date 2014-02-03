Ext.Loader.setConfig({
        enabled: true,
        paths: {
                'Ext.ux': 'ux'
        }
});

Ext.require('Ext.ux.window.plugin.Snap');
Ext.onReady(function() {
	Ext.create('Ext.window.Window', {
		title: 'Window Snap Plugin Example',
		width: 500,
		height: 500,
		autoShow: true,
		plugins: 'snapwindow'
	});
});
	