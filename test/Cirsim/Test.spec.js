import '../../src/app.modules.js';
import Cirsim from '../../src/Cirsim/Cirsim.js';

describe('Testing in full system', function() {
    // inject the HTML fixture for the tests
    beforeEach(function() {
        var div = '<div id="cirsim"></div>';
        document.body.insertAdjacentHTML('afterbegin', div);
    });

    // remove the html fixture from the DOM
    afterEach(function() {
        document.body.removeChild(document.getElementById('cirsim'));
    });

    it('start', function(done) {
        var cirsim = new Cirsim('#cirsim', {
            components: 'all',
            load: '{"grid":8,"snap":true,"circuits":[{"name":"main","width":1920,"height":1080,"components":[{"id":"c1001","x":88,"y":56,"name":"A","type":"InPin","value":true},{"id":"c1002","x":88,"y":96,"name":"B","type":"InPin","value":true},{"id":"c1003","x":88,"y":128,"name":"C","type":"InPin","value":true},{"id":"c1004","x":480,"y":96,"name":"O","type":"OutPin"},{"id":"c1005","x":352,"y":96,"name":null,"type":"Or"},{"id":"c1006","x":216,"y":112,"name":null,"type":"And"}],"connections":[{"from":"c1001","out":0,"to":"c1005","in":0,"bends":[{"x":304,"y":56}]},{"from":"c1002","out":0,"to":"c1006","in":0,"bends":[]},{"from":"c1003","out":0,"to":"c1006","in":1,"bends":[]},{"from":"c1005","out":0,"to":"c1004","in":0,"bends":[]},{"from":"c1006","out":0,"to":"c1005","in":1,"bends":[]}]}]}',
            testTime: 1
        });

        var tst = [
            [0, 0, 0, 0],
            [0, 0, 1, 0],
            [0, 1, 0, 0],
            [0, 1, 1, 1],
            [1, 0, 0, 1],
            [1, 0, 1, 1],
            [1, 1, 0, 1],
            [1, 1, 1, 1]
        ];

        var test = {
            'tag': 'test',
            'name': "Test",
            'input': ['A', 'B', 'C'],
            'output': ['O'],
            'test': tst
        }

        cirsim.addTest(test);
        cirsim.startNow();
        var main = cirsim.getInstances()[0];
        var test = main.test;

        var promise = test.runTest('test');
        promise.then(() => {
            // Success
            expect(true).toBeTruthy();
            done();
        }, (msg) => {
            console.log('failure ' + msg);
            // Failure
            expect(msg).toBeNull();
            done();
        });
    });
});
