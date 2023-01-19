import os
import argparse

import numpy as np
import nrrd
import nibabel as nib
from sklearn import metrics


def read_file(file):

    ext = os.path.splitext(file)[-1][1:]

    if ext == 'nrrd':
        data = nrrd.read(file)[0]
        # print('nrrd', d)
    elif ext == 'nii':
        data = nib.load(file).get_fdata()
    elif ext == 'gz':
        data = nib.load(file).get_fdata()
        # print(data)
        # data =  nib.Nifti2Image.from_filename(file)
    else:
        data = None
        print('unsupported.')

    return data


def binarize(data):

    binarized = data.copy()
    binarized[:] = 0
    binarized[data > 0] = 1

    return binarized


parser = argparse.ArgumentParser()

parser.add_argument('truth')
parser.add_argument('label')

args = parser.parse_args()


truth_data = binarize(read_file(args.truth))
label_data = binarize(read_file(args.label))


similarity = metrics.jaccard_score(truth_data.ravel(), 
                                   label_data.ravel(),

                                   average="binary")

print('Jaccard:', similarity)

