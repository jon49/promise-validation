class ValidationResult {
  reasons;
  constructor(reasons) {
    this.reasons = reasons;
  }
}
class ValidationError {
  reason;
  index;
  key = "";
  constructor(reason, index) {
    this.reason = reason;
    this.index = index;
  }
}
async function validate(promises) {
  const result = await Promise.allSettled(promises);
  const failed = [];
  for (let i = 0; i < result.length; i++) {
    let item = result[i];
    if (item.status === "rejected") {
      failed.push(new ValidationError(item.reason, i));
    }
  }
  if (failed.length > 0)
    return Promise.reject(new ValidationResult(failed));
  return result.map((x) => x.value);
}
async function validateObject(original, validator) {
  if (!original) {
    return Promise.reject(new ValidationResult([new ValidationError("Object is undefined.", -1)]));
  }
  let validatorKeys = Object.keys(validator);
  let validations = new Array(validatorKeys.length);
  let i = 0;
  for (let validatorKey of validatorKeys) {
    validations[i++] = validator[validatorKey](original[validatorKey]);
  }
  return validate(validations).then((xs) => {
    i = 0;
    let o = {};
    for (let validatorKey of validatorKeys) {
      o[validatorKey] = xs[i++];
    }
    return o;
  }).catch((result) => {
    for (let reason of result.reasons) {
      reason.key = validatorKeys[reason.index];
    }
    return Promise.reject(result);
  });
}
export {
  ValidationError,
  ValidationResult,
  validate,
  validateObject
};
