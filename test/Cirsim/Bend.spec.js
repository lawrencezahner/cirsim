import Bend from '../../src/Cirsim/Bend.js';

describe('Bend', function() {
   it('Construct', function() {
      var b = new Bend();
      expect(b.x).toBe(0);
      expect(b.y).toBe(0);

   });
});
