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
  const lastPosition = Object.values(mutationArray[mutationArray.length - 1]).reduce((acc, cur) => acc + cur);
  let position = Object.values(bee.origin).reduce((acc, cur) => acc + cur);
  let beePrime = JSON.parse(JSON.stringify(bee));

  while (position <= lastPosition) {
    beePrime = operationTransform(beePrime, mutationArray[position]);
    position += 1;
  }

  return beePrime;
};

// O(n) time

module.exports = fullOperationTransform;
