# CACTAS Project
CACTAS(Carotid Artery-Computed Tomographic Angiography Scoring) project is an open-source project that can assist radiologists to diagnose an embolic stroke of undetermined source (ESUS). The goal of our project is to design a program that can characterize qualitative and quantitative morphologic features of calcific plaque. First, for plaque annotation, we designed a web-based tool that can segment plaque by a single click. Next, using machine learning algorithms, we automatically identify calcific plaque in the carotid artery visible in CTA scans. We then train the algorithm to determine useful features about the plaque, such as its estimated risk to the patient to lead to a stroke, and then create another program to calculate its manual features such as the number, size, and volume. This program would be able to be used as the groundwork to simplify further research tasks in identifying critical features of plaque, such as determining causal relationships between a given feature and estimated risk. The current version of this software uses 2D UNet, 2D, and 3D Swin UNETR for image segmentation, Random Forest, and CNN for risk estimation.

## Table of Contents
* [CACTAS Project](#cactas-project)
  * [Table of Contents](#table-of-contents)
  * [CACTAS-Tool](#cactas-tool)
  * [Auto Detection Tool](#auto-detection-tool)
  * [Risk Estimation](#risk-estimation)
* [SCCT Conference Poster](#scct-conference-poster)
* [Citation](#citation)
* [License](#license)
* [Acknowledgements](#acknowledgements)
* [Contact](#contact)

## CACTAS-Tool
CACTAS-Tool is a web-based single-click annotation tool that is 2.89 times faster than manual segmentation. We perform 3D region growing based on a user-selected CT Hounsfield Unit (HU) intensity with a configurable tolerance threshold to include neighboring voxels. Visualization was set to window/level of 130/1500 HU.

Here is an example of CACTAS-Tool: <br/>
![picture01](https://github.com/jiehyunjkim/CACTAS/assets/54910137/99dd9218-b05c-4698-888f-de9d1e9695a1)


Plaque annotations with CTOOL were faster than with 3D Slicer (expert w/ CTOOL 376.6±113.52s vs 631.2±325.88s, novice w/ CTOOL 126.59±21.57s vs 366.09±16.77s, t4=-12.40, p<0.0001). Annotation accuracy between both softwares was comparable (expert Jaccard w/ CTOOL 0.537±0.077 vs 0.464±0.238, novice Jaccard w/ CTOOL 0.481±0.070 vs 0.496±0.060). However, novice annotations will require expert validation or proofreading. All participants completed the NASA-TLX questionnaire to reveal lower mental, physical, and temporal demand with our software (expert w/ CTOOL 12.67 vs 16.334, novice w/ CTOOL 28.33±30.880 vs 33.33±14.727). Our streamlined plaque labeling software allows 2.89x faster annotations (1.68x for experts) with comparable accuracy to manual segmentation. <br/>

![figure01](https://github.com/jiehyunjkim/CACTAS/assets/54910137/7104f2be-7d8c-44dc-91f6-b36e11bf04a8)


## Auto Detection Tool
To automatically detect plaques, we used UNet models - 2D UNet, 2D SwinUNETR, and 3D SwinUNETR. The number of patients data for training was 53 and 11 patients data were used for testing. The Intersecion over Union(IoU) for 2D UNet is 0.7397 and the validation IoU is 0.5652. IoU for 2D SwinUNETR is 0.8641 and the validation IoU is 0.5122. The dice score of 3D SwinUNETR is 0.9250. 

**Image segmentation:** [keras_2d_unet_usingAPI_v1.ipynb](https://github.com/jiehyunjkim/cs410_upenn/blob/master/experiments/keras_2d_unet_usingAPI_v1.ipynb),
[keras_swinUnetr_full_v11.ipynb](https://github.com/jiehyunjkim/cs410_upenn/blob/master/experiments/keras_swinUnetr_full_v11.ipynb),
[SwinUnetR_Chunks_Try5.ipynb](https://github.com/jiehyunjkim/cs410_upenn/blob/master/experiments/SwinUnetR_Chunks_Try5.ipynb)<br/>

Here is an example of output of 2D UNet: <br/>
<img src="https://drive.google.com/uc?id=1_dJ1mKtbxw2RwG6fSvnVBvIOrn6HscQy"
     alt="unet_result"
     style="display: block; margin-right: auto; margin-left: auto; width: 40%;" /><br/>
2D Swin UNETR: <br/>
<img src="https://drive.google.com/uc?id=1PRS8ZBuPxTA7uaLFgKA82vwgInwAGNbg"
     alt="2dswinunet_result"
     style="display: block; margin-right: auto; margin-left: auto; width: 40%;" /><br/>
3D Swin UNETR: <br/>
<img src="https://drive.google.com/uc?id=1TA8ywcK_O2q9hO2pJeZDqb2WknphPeix"
     alt="3dswinunet_result"
     style="display: block; margin-right: auto; margin-left: auto; width: 40%;" /><br/>

## Risk Estimation 
Our goal is to estimate the risk for symptomatic versus asymptomatic plaque for ischemic stroke. For risk estimation model, we choose random forest and got 0.99 for training and 0.88 for training for both F1 Score and Accuracy.

**Risk estimation:** [RandomForest.ipynb](https://github.com/jiehyunjkim/cs410_upenn/blob/master/experiments/RandomForest.ipynb),
[CNN.ipynb](https://github.com/jiehyunjkim/cs410_upenn/blob/master/experiments/CNN.ipynb)<br/>

Random Forest: <br/>
<img src="https://drive.google.com/uc?id=1lp7lJ43KiYIL7VYEMZF0UQvTIMJ-vhoO"
     alt="RF"
     style="display: block; margin-right: auto; margin-left: auto; width: 60%;" /><br/>

## SCCT Conference Poster
The abstract of the CACTAS-Tool is accepted by The Society of Cardiovascular Computed Tomography(SCCT). <br/>

Here is a poster for the presentation: <br/>
![SCCT_Poster](https://github.com/jiehyunjkim/CACTAS/assets/54910137/37654d14-a77f-472f-a010-83eb6140cae5)<br/>


## Citation
If you use this code in your research, please cite the following article:
```
@article{kim2023streamlined,
  title={Streamlined Carotid Artery Calcification Labeling For Cta Scans},
  author={Kim, J and Arnett, N and Kotler, J and Shah, D and Cucchiara, B and Song, J and Haehn, D},
  journal={Journal of Cardiovascular Computed Tomography},
  volume={17},
  number={4},
  pages={S54--S55},
  year={2023},
  publisher={Elsevier},
  doi={https://doi.org/10.1016/j.jcct.2023.05.136}
}
```

## License 
This project is licensed under the MIT License - see the [LICENSE](https://github.com/jiehyunjkim/CACTAS/blob/main/LICENSE) file for details.

## Acknowledgements
The work of Josh Kotler was supported in part by the College of Science and Mathematics Dean’s Undergraduate Research Fellowship through fellowship support from Oracle, project ID R20000000025727.

## Contact
For any questions or comments, feel free to reach out to:
  * Jenna Kim at JieHyun.Kim001@umb.edu
