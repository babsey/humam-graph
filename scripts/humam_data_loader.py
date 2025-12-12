import os
import humam

base_path = '/'.join(humam.__path__[0].split('/')[:-2])

NN = humam.NeuronNumbers(
    surface_area=1,
    # Path to cytoarchitecture data
    **{
        # Path to cytoarchitecture data
        "src_path": os.path.join(
            base_path,
            "experimental_data",
            "voneconomokoskinas",
            "StructuralData_VonEconomoKoskinas_addedvalues.xls",
        ),
        # Path to ei ratio data
        "ei_ratio_path": os.path.join(
            base_path, "experimental_data", "fraction_EI", "lichtman.csv"
        ),
        # Source parcellation
        "source": "VonEconomoKoskinas",
        # Target parcellation
        "target": "DesikanKilliany",
        # Remove layers with fewer neurons than in layer I
        "remove_smaller_layerI": False,
        # Minimal number of neurons per layer
        "min_neurons_per_layer": 5000,
    }
)

SN = humam.SynapseNumbers(
    NN=NN,
    **{
        "connectivity": "HcpDesikanKilliany",
        "con_path": os.path.join(
            base_path,
            "experimental_data",
            "hcp_dti",
            "Connectivity_Distances_HCP_DesikanKilliany.mat",
        ),
        "vol_path": os.path.join(
            base_path, "experimental_data", "hcp_dti", "DKAtlas_VolumeAndNames.mat"
        ),
        # Fraction of recurrent (intra-area) connections.
        # Based on value 0.79 for macaque from Markov et al. 2011 and scaling
        # arguments from Herculano-Houzel et al. 2010 to extrapolate to human.
        "FLN": 0.86,
        # Number of synapses per cubic mm.
        # Value from Cano-Astorga et al. (2021) Cerebral Cortex
        # https://doi.org/10.1093/cercor/bhab120
        "rho_syn": 6.6e8,
        # Relative number of cortico-cortical feedback synapses targeting
        # excitatory neurons. Value from Schmidt et al. 2018
        "Z_i": 0.93,
        # Determines synaptic target pattern (compare Schmidt et al. 2018).
        "SLN_FF": 0.65,
        # Determines synaptic target pattern (compare Schmidt et al. 2018).
        "SLN_FB": 0.35,
        # Spatial connectivity decay parameter.
        # Value in micron from Schmidt el al. 2018
        "lmbda": 160,
        # Fit parameters for SLN fit from neuron densities.
        # Value from Schmidt el al. 2018
        "a0": -0.152,
        "a1": -1.534,
    }
)