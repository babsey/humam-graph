export function hierarchy(data, delimiter = '.') {
  let root
  const map = new Map()
  data.forEach(function find(data) {
    const { name } = data
    if (map.has(name)) return map.get(name)
    map.set(name, data)

    const i = name.lastIndexOf(delimiter)
    if (i >= 0) {
      find({ name: name.substring(0, i), children: [] }).children.push(data)
      data.name = name.substring(i + 1)
    } else {
      root = data
    }
    return data
  })
  return root
}

export const id = (node) => `${node.parent ? id(node.parent) + '.' : ''}${node.data.name}`
export const getParent = (d, n = 1) => (n == 0 ? d : getParent(d.parent, n - 1))
