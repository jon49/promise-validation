function reject(message) {
    return Promise.reject(message)
}

const notFalsey = (error, val) =>
    !val ? reject(error) : val

const maxLength = (error, val, max) =>
    (val.length > max)
        ? reject(error)
    : val

const createString = async (name, maxLength_, val) => {
    const trimmed = await notFalsey(`"${name}" is required.`, val?.trim())
    const s = await maxLength(`"${name}" must be less than ${maxLength_} characters.`, trimmed, maxLength_)
    return s
}

function isInteger(val) {
    try {
        BigInt(val)
        return true
    } catch(e) {
        return false
    }
}

async function createNumber(name, val) {
    let num = +val
    if (isNaN(num)) {
        return reject(`'${name}' was expecting a number but was given ${val}`)
    }
    return num
}

function createPositiveWholeNumber(name, val) {
    return async (val) => {
        let num = await createNumber(name, val)
        if (num < 0) return reject(`"${name}" must be 0 or greater. But was given '${val}'.`)
        if (!isInteger(num)) return reject(`"${name}" must be a whole number. But was given '${num}' and was expecting '${num|0}'.`)
        return num
    }
}

exports.createIdNumber = function createIdNumber(name) {
    return async (val) => {
        let wholeNumber = await createPositiveWholeNumber(name)(val)
        if (wholeNumber < 1) return reject(`"${name}" must be 1 or greater. But was given '${val}'.`)
        return wholeNumber
    }
}

exports.maybe =
    f =>
    val =>
        val == null ? Promise.resolve(val) : f(val)

exports.createString5 =
    name =>
    val =>
        createString(name, 5, val)

