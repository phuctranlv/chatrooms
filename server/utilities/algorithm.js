const operationTransform = (b, a) => {
  console.log('inside operationTransform');
  console.log('the untransformed object is:', b);
  const bPrime = JSON.parse(JSON.stringify(b));
  if (b.type === 'insert' && a.type === 'insert') {
    if (a.mutationindex < b.mutationindex) {
      bPrime.mutationindex += a.text.length;
    }
  } else if (b.type === 'insert' && a.type === 'delete') {
    if (a.mutationindex < b.mutationindex) {
      bPrime.mutationindex -= a.text.length;
    }
  } else if (b.type === 'delete' && a.type === 'insert') {
    if (a.mutationindex < b.mutationindex) {
      bPrime.mutationindex -= a.text.length;
    }
  } else if (b.type === 'delete' && a.type === 'delete') {
    if (a.mutationindex < b.mutationindex) {
      bPrime.mutationindex -= a.text.length;
    }
  }

  bPrime[`origin${a.username}`] += 1;
  console.log('the transformed object is:');
  console.log(": -----------------------------------");
  console.log("operationTransform -> bPrime", bPrime);
  console.log(": -----------------------------------");
  return bPrime;
};

const fullOperationTransform = (bee, mutationArray) => {
  console.log('inside fulloperationTransform');
  console.log(": ---------------------------------");
  console.log("fullOperationTransform -> bee", bee)
  console.log(": ---------------------------------");
  console.log('mutationArray is:', mutationArray);
  const lastPosition = mutationArray[mutationArray.length - 1].originalice + mutationArray[mutationArray.length - 1].originbob;
  console.log('lastPosition:', lastPosition)
  let position = bee.originalice + bee.originbob;
  let beePrime = JSON.parse(JSON.stringify(bee));
  while (position <= lastPosition) {
    beePrime = operationTransform(beePrime, mutationArray[position]);
    position += 1;
  }
  console.log(": -------------------------------------------");
  console.log("fullOperationTransform -> beePrime", beePrime)
  console.log(": -------------------------------------------");
  return beePrime;
};

const textTransform = (transformedObject, currentText) => {
  console.log('inside texttransform');
  console.log(": ----------------------------------------");
  console.log("textTransform -> currentText", currentText)
  console.log(": ----------------------------------------");
  let transformedText;

  if (transformedObject.type === 'delete' && transformedObject.length > currentText.length) {
    transformedObject.length = 0;
    transformedText = '';
  } else if (transformedObject.type === 'insert') {
    const frontText = currentText.slice(0, transformedObject.mutationindex);
    const laterText = currentText.slice(transformedObject.mutationindex);
    transformedText = frontText + transformedObject.text + laterText;
  } else if (transformedObject.type === 'delete') {
    const frontText = currentText.slice(0, transformedObject.mutationindex);
    const laterText = currentText.slice(transformedObject.mutationindex + parseInt(transformedObject.length, 10));
    transformedText = frontText + laterText;
  }
  console.log(": ------------------------------------------------");
  console.log("textTransform -> transformedText", transformedText)
  console.log(": ------------------------------------------------");
  return transformedText;
};

module.exports = { operationTransform, fullOperationTransform, textTransform };
