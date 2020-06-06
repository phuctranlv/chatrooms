const operationTransform = (b, a) => {
  const bPrime = JSON.parse(JSON.stringify(b));
  if (b.data.type === 'insert' && a.data.type === 'insert') {
    if (a.data.index < b.data.index) {
      bPrime.data.index += a.data.text.length;
    }
  } else if (b.data.type === 'insert' && a.data.type === 'delete') {
    if (a.data.index < b.data.index) {
      bPrime.data.index -= a.data.text.length;
    }
  } else if (b.data.type === 'delete' && a.data.type === 'insert') {
    if (a.data.index < b.data.index) {
      bPrime.data.index -= a.data.text.length;
    }
  } else if (b.data.type === 'delete' && a.data.type === 'delete') {
    if (a.data.index < b.data.index) {
      bPrime.data.index -= a.data.text.length;
    }
  }

  bPrime.origin[a.author] += 1;

  return { bPrime };
};

// O(1) time

// // test:
// const a = { author: 'alice', data: { index: 3, text: ' big', type: 'insert' }, origin: { alice: 2, bob: 6 } };
// const b = { author: 'bob', data: { index: 13, text: ' and yellow', type: 'insert' }, origin: { alice: 2, bob: 6 } };

// const { bPrime } = operationTransform(b, a);

// console.log('bPrime:', bPrime);


const fullOperationTransform = (bee, mutationArray) => {
  const lastPosition = Object.values(mutationArray[mutationArray.length - 1].origin).reduce((acc, cur) => acc + cur);
  let position = Object.values(bee.origin).reduce((acc, cur) => acc + cur);
  let beePrime = JSON.parse(JSON.stringify(bee));
  while (position <= lastPosition) {
    beePrime = operationTransform(beePrime, mutationArray[position]);
    position += 1;
  }

  return beePrime;
};

// O(n) time

// const b00 = { author: 'bob', data: { index: 0, text: 'The', type: 'insert' }, origin: { alice: 0, bob: 0 } };
// const b10 = { author: 'bob', data: { index: 3, text: ' house', type: 'insert' }, origin: { alice: 0, bob: 1 } };
// const b20 = { author: 'bob', data: { index: 9, text: ' is', type: 'insert' }, origin: { alice: 0, bob: 2 } };
// const b30 = { author: 'bob', data: { index: 12, text: ' red', type: 'insert' }, origin: { alice: 0, bob: 3 } };
// const b40 = { author: 'bob', data: { index: 13, length: 4, type: 'delete' }, origin: { alice: 0, bob: 4 } };
// const b50 = { author: 'bob', data: { index: 13, text: ' blue', type: 'insert' }, origin: { alice: 0, bob: 5 } };
// const a60 = { author: 'alice', data: { index: 13, length: 4, type: 'delete' }, origin: { alice: 0, bob: 6 } };
// const a61 = { author: 'alice', data: { index: 13, text: ' green', type: 'insert' }, origin: { alice: 1, bob: 6 } };
// const a62 = { author: 'alice', data: { index: 3, text: ' big', type: 'insert' }, origin: { alice: 2, bob: 6 } };
// const b62 = { author: 'bob', data: { index: 13, text: ' and yellow', type: 'insert' }, origin: { alice: 2, bob: 6 } };


// const mutationArray = [b00, b10, b20, b30, b40, b50, a60, a61, a62];

// console.log(fullOperationTransform(b62, mutationArray));

module.exports = fullOperationTransform;
