from humam_data_loader import NN, SN
from humam_names import areas, layers, populations

##### Get numbers from experimental data.

nn = NN.getNeuronNumbers()
sn = SN.getSynapseNumbers()


def doList(v):
    if isinstance(v, (list, tuple)):
        return v
    else:
        return [v]


#####

groupBy = ["area", "layer", "population"][:3]

nn_total = nn.groupby(groupBy).sum()
nn_total_values = nn_total.values
nn_mapping = dict(
    [
        [v, ".".join(["cortex", dk[doList(v)[0]]["lobe"], *doList(v)])]
        for v in nn_total.index.values
    ],
    dtype=str,
)
sn_total = sn.groupby(groupBy).sum().T.groupby(groupBy).sum()


nodes = [
    {
        "name": str(nn_mapping[v]),
        "size": int(nn_total_values[i]),
    }
    for (i, v) in enumerate(nn_total.index.values)
]


links = [
    {
        "target": str(nn_mapping[t]),
        "source": str(nn_mapping[s]),
        "values": int(sn_total.loc[t, s]),
    }
    for t in sn_total.columns.values
    for s in sn_total.index.values
    if int(sn_total.loc[t, s]) > 0
]

##### Save to json file

import json

with open("humam_network.json", "w") as f:
    json.dump({"nodes": nodes, "links": links}, f, indent=4)
