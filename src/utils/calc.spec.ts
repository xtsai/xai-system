import { reducePlus } from './calc';
describe('Test Module calc', () => {
  it(`1~5 addition Should return 120`, () => {
    expect(reducePlus(1, 2, 3, 4, 5)).toBe(120);
  });
});
