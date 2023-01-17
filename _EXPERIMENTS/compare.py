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
        data = nib.load(file)
        # print(data)
        # data =  nib.Nifti2Image.from_filename(file)
    else:
        data = None
        print('unsupported.')

    return data

parser = argparse.ArgumentParser()

parser.add_argument('truth')
parser.add_argument('label')

args = parser.parse_args()


truth_data = read_file(args.truth)
label_data = read_file(args.label)


similarity = metrics.jaccard_score(truth_data.ravel(), 
                                   label_data.ravel(), 
                                   average="micro")

print('Jaccard:', similarity)

