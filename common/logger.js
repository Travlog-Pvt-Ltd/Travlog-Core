import log from 'npmlog';

const updateTimestamp = () => {
    const localTime = new Date().toLocaleString();
    log.heading = `${localTime}`;
};

log.on('log', updateTimestamp);
log.headingStyle = { fg: 'cyan', bold: true };
log.addLevel('info', 2000, { fg: 'green' });
log.addLevel('error', 5000, { fg: 'red', bold: true });
log.addLevel('warn', 4000, { fg: 'yellow' });
