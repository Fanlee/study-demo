class NSet {
  constructor() {
    this.items = {}
  }
  add(element) {
    if (!this.has(element)) {
      this.items[element] = element
      return true
    }
    return false
  }
  delete(element) {
    if (this.has(element)) {
      delete this.items[element]
      return true
    }
    return false
  }
  has(element) {
    return Object.prototype.hasOwnProperty.call(this.items, element)
  }
  clear() {
    this.items = {}
  }
  size() {
    return Object.keys(this.items).length
  }
  values() {
    return Object.values(this.items)
  }
  union(otherSet) {
    const unionSet = new NSet()
    this.values().forEach((value) => unionSet.add(value))
    otherSet.values().forEach((value) => unionSet.add(value))
    return unionSet
  }
  intersection(otherSet) {
    const intersectionSet = new NSet()
    const values = this.values()
    const otherValues = otherSet.values()

    let biggerSet = values
    let smallerSet = otherValues

    if (otherValues.length - values.length > 0) {
      biggerSet = otherValues
      smallerSet = values
    }

    smallerSet.forEach((value) => {
      if (biggerSet.includes(value)) {
        intersectionSet.add(value)
      }
    })

    return intersectionSet
  }
  difference(otherSet) {
    const differenceSet = new NSet()
    const values = this.values()
    for (let i = 0; i < values.length; i++) {
      if (!otherSet.has(values[i])) {
        differenceSet.add(values[i])
      }
    }
    return differenceSet
  }
  isSubsetOf(otherSet) {
    if (this.size() > otherSet.size()) return false
    let isSubSet = true
    this.values().every((value) => {
      if (!otherSet.has(value)) {
        isSubSet = false
        return false
      }
      return true
    })
    return isSubSet
  }
}

const setA = new NSet()
// setA.add(1)
setA.add(2)
setA.add(3)

const setB = new NSet()
setB.add(2)
setB.add(3)
setB.add(4)
setB.add(5)
console.log(setA.isSubsetOf(setB))
