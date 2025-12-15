export interface IHierarchyNode {
  id: string
  name: string
  children: IHierarchyNode[]
  parent?: IHierarchyNode
  data?: {
    name: string
  }
}

export const hierarchy = (nodes: IHierarchyNode[], delimiter = '.') => {
  let root
  const data = nodes.map((node) => ({ ...node, name: node.id }))

  const map: Map<string, IHierarchyNode> = new Map()
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

export const id = (node: IHierarchyNode): string =>
  `${node.parent ? id(node.parent) + '.' : ''}${node.data?.name}`

export const getParent = (d: IHierarchyNode, n: number = 1): IHierarchyNode =>
  n > 0 && d.parent ? getParent(d.parent, n - 1) : d
