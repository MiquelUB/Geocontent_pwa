const { getLegends } = require('d:/MK/MP/Geocontent_Core/dist/lib/actions.js');
async function run() {
    const l = await getLegends();
    console.log('Got legends');
}
run();
