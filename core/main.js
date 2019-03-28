console.log(__dirname);
const graphql = require('graphql-module');
const sqlite = require('sqlite-module');
const mqtt = require('mqtt-module');
const rrd = require('rrd-module');
const zwave = require('zwave-interface-module');
const activeModules = require('active-modules-module');

// MQTT events
mqtt.on('stateChange', ({ moduleId, data }) => {
    switch (data.state) {
      case 'connected':
        activeModules.add({ moduleId, ...data });
        break;
      case 'disconnected':
        activeModules.remove(moduleId);
        break;
    }
});
mqtt.on('availabilityChange', ({ moduleId, data }) => {
    activeModules.update(moduleId, data.available);
});
mqtt.on('moduleIdentify', ({ moduleId, data }) => {
    activeModules.add({ moduleId, ...data });
});
mqtt.on('resolve Z-Wave MQTT', (message) => {
    zwave.resolveMqtt(message);
});

/// Update RRD
setInterval(() => {
    const params = sqlite.getAllDeviceParams();
    const filtered = params.filter((param) => !!param.rrd_enable);

    filtered.forEach(({ dev_param_id: id, value }) => {
        try {
            rrd.update(id, Number(value));
        } catch (err) {
            console.error(err);
        }
    });
}, 60000);

/// Z-Wave
zwave.on('node added', (data) => {
    console.log('node added');
    console.log(data);
});
zwave.on('node removed', (data) => {
    console.log('node removed');
    console.log(data);
});
zwave.on('node ready', (data) => {
    console.log('node ready');
    console.log(data);
});
